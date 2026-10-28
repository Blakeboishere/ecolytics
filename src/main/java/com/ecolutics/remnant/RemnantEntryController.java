package com.ecolutics.remnant;

import com.ecolutics.account.AccountSession;
import com.ecolutics.account.UserAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Receives remnant requests from React and connects them to persistence. */
@RestController
@RequestMapping("/api/remnants")
public class RemnantEntryController {

    private final RemnantEntryRepository entries;
    private final RemnantExpiryService expiryService;
    private final UserAccountRepository accounts;

    public RemnantEntryController(RemnantEntryRepository entries, RemnantExpiryService expiryService, UserAccountRepository accounts) {
        this.entries = entries;
        this.expiryService = expiryService;
        this.accounts = accounts;
    }

    @GetMapping("/available")
    public List<DonationListing> availableDonations(HttpServletRequest request) {
        String email = AccountSession.requireEmail(request);
        if (accounts.findByEmailIgnoreCase(email).map(a -> "ngo".equals(a.getAccountType())).orElse(false) == false)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "NGO accounts only");
        expiryService.expireOverdueFood();
        Instant now = Instant.now();
        return entries.findAll().stream()
            .filter(e -> ("food".equals(e.getRemnantType()) && e.getDonationExpiresAt() != null && e.getDonationExpiresAt().isAfter(now))
                    || ("waste".equals(e.getRemnantType()) && "biodegradable".equals(e.getCategory())))
            .sorted((left, right) -> {
                Instant leftSort = left.getDonationExpiresAt() == null ? left.getCreatedAt() : left.getDonationExpiresAt();
                Instant rightSort = right.getDonationExpiresAt() == null ? right.getCreatedAt() : right.getDonationExpiresAt();
                return leftSort.compareTo(rightSort);
            })
            .map(e -> accounts.findByEmailIgnoreCase(e.getOwnerEmail()).map(a -> new DonationListing(e.getId(), e.getItemName(), e.getCategory(), e.getMealType(), e.getWeightKg(), e.getDonationExpiresAt(), a.getOrganization(), a.getLocation(), a.getPhone(), "food".equals(e.getRemnantType()) ? "food" : "compost", e.getClaimantEmail() != null, e.getClaimAccepted())).orElse(null))
            .filter(java.util.Objects::nonNull).toList();
    }

    public record DonationListing(Long id, String itemName, String category, String mealType, BigDecimal weight,
            Instant expiresAt, String canteen, String location, String phone, String donationType, boolean claimed, boolean claimAccepted) {}

    @PostMapping("/{id}/claim")
    public EntryResponse claimDonation(@PathVariable Long id, HttpServletRequest request) {
        String email = AccountSession.requireEmail(request);
        requireAccountType(email, "ngo");
        expiryService.expireOverdueFood();
        RemnantEntry entry = entries.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Food listing not found"));
        boolean activeFood = "food".equals(entry.getRemnantType()) && entry.getDonationExpiresAt() != null && entry.getDonationExpiresAt().isAfter(Instant.now());
        boolean compostWaste = "waste".equals(entry.getRemnantType()) && "biodegradable".equals(entry.getCategory());
        if (!activeFood && !compostWaste)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This listing is no longer available");
        if (entry.getClaimantEmail() != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This food listing has already been claimed");
        entry.claim(email);
        return EntryResponse.from(entries.save(entry));
    }

    @PostMapping("/{id}/accept-claim")
    public EntryResponse acceptClaim(@PathVariable Long id, HttpServletRequest request) {
        String email = AccountSession.requireEmail(request);
        requireAccountType(email, "canteen");
        RemnantEntry entry = requireOwnedEntry(id, email);
        if (entry.getClaimantEmail() == null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No NGO has claimed this food");
        if (entry.getClaimAccepted()) throw new ResponseStatusException(HttpStatus.CONFLICT, "This claim was already accepted");
        entry.acceptClaim();
        return EntryResponse.from(entries.save(entry));
    }

    private void requireAccountType(String email, String requiredType) {
        if (!accounts.findByEmailIgnoreCase(email).map(account -> requiredType.equals(account.getAccountType())).orElse(false))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, requiredType + " accounts only");
    }

    /** Validates a submitted entry, assigns it to the signed-in user, and saves it. */
    @PostMapping
    public ResponseEntity<EntryResponse> createEntry(
            @Valid @RequestBody CreateEntryRequest request,
            HttpServletRequest servletRequest) {
        String ownerEmail = AccountSession.requireEmail(servletRequest);
        EntryDetails details = validateAndNormalize(request);
        Instant createdAt = Instant.now();
        Instant donationExpiresAt = "food".equals(details.remnantType())
                ? expiryService.deadlineFrom(createdAt, details.category())
                : null;

        // The owner comes from the server session, never from client-submitted JSON.
        RemnantEntry saved = entries.save(new RemnantEntry(
                ownerEmail, details.weight(), details.remnantType(), details.itemName(),
                details.category(), details.mealType(), createdAt, donationExpiresAt));
        return ResponseEntity.status(HttpStatus.CREATED).body(EntryResponse.from(saved));
    }

    /** Returns only the current user's entries, newest first. */
    @GetMapping
    public List<EntryResponse> listEntries(HttpServletRequest servletRequest) {
        String ownerEmail = AccountSession.requireEmail(servletRequest);
        expiryService.expireOverdueFood();
        return entries.findAllByOwnerEmailOrderByCreatedAtDesc(ownerEmail).stream()
                .map(EntryResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public EntryResponse getEntryById(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        String ownerEmail = AccountSession.requireEmail(servletRequest);
        expiryService.expireOverdueFood();
        return EntryResponse.from(requireOwnedEntry(id, ownerEmail));
    }

    /** Replaces editable entry fields while keeping ownership and original creation time. */

    @PutMapping("/{id}")
    public EntryResponse updateEntry(
            @PathVariable Long id,
            @Valid @RequestBody CreateEntryRequest request,
            HttpServletRequest servletRequest) {

        String ownerEmail = AccountSession.requireEmail(servletRequest);
        expiryService.expireOverdueFood();

        RemnantEntry entry = requireOwnedEntry(id, ownerEmail);
        EntryDetails details = validateAndNormalize(request);

        Instant newDeadline = null;

        if ("food".equals(details.remnantType())) {
            boolean sameCategory =
                    "food".equals(entry.getRemnantType())
                            && details.category().equalsIgnoreCase(entry.getCategory());

            if (sameCategory && entry.getDonationExpiresAt() != null) {
                // Keep the existing deadline if the category hasn't changed.
                newDeadline = entry.getDonationExpiresAt();
            } else {
                // Assign a new deadline based on the new food category.
                newDeadline = expiryService.deadlineFrom(
                        Instant.now(),
                        details.category()
                );
            }
        }

        entry.updateDetails(
                details.weight(),
                details.remnantType(),
                details.itemName(),
                details.category(),
                details.mealType(),
                newDeadline
        );

        return EntryResponse.from(entries.save(entry));
    }


    private static String requireValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw badRequest(message);
        }
        return value.trim();
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private RemnantEntry requireOwnedEntry(Long id, String ownerEmail) {
        RemnantEntry entry = entries.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Remnant entry not found"));
        if (!entry.getOwnerEmail().equals(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this entry");
        }
        return entry;
    }

    private static EntryDetails validateAndNormalize(CreateEntryRequest request) {
        String type = request.remnantType().toLowerCase(Locale.ROOT);
        String category = requireValue(request.category(), "Select a category");
        String itemName = requireValue(request.itemName(), "Enter a name for this remnant");
        String mealType = null;

        if ("food".equals(type)) {
            if (!List.of("raw", "cooked", "packed").contains(category)) {
                throw badRequest("Choose a valid food category");
            }
            mealType = requireValue(request.mealType(), "Select a meal type");
            if (!List.of("veg", "non-veg").contains(mealType)) {
                throw badRequest("Choose a valid meal type");
            }
        } else if (!List.of("biodegradable", "non-biodegradable").contains(category)) {
            throw badRequest("Choose a valid waste type");
        }
        return new EntryDetails(request.weight(), type, itemName, category, mealType);
    }

    private record EntryDetails(BigDecimal weight, String remnantType, String itemName,
            String category, String mealType) {
    }

    /** JSON accepted from React; Bean Validation checks basic field shape and size. */
    public record CreateEntryRequest(
            @NotNull @DecimalMin("0.01") @Digits(integer = 8, fraction = 2) BigDecimal weight,
            @NotBlank @Pattern(regexp = "food|waste") String remnantType,
            @Size(max = 120) String itemName,
            @Size(max = 32) String category,
            @Size(max = 16) String mealType) {
    }

    /** JSON returned to React, mapped explicitly so persistence details stay internal. */
    public record EntryResponse(
            Long id,
            BigDecimal weight,
            String remnantType,
            String itemName,
            String category,
            String mealType,
            java.time.Instant createdAt,
            Instant donationExpiresAt,
            String claimantEmail,
            boolean claimAccepted) {
        private static EntryResponse from(RemnantEntry entry) {
            return new EntryResponse(entry.getId(), entry.getWeightKg(), entry.getRemnantType(),
                    entry.getItemName(), entry.getCategory(), entry.getMealType(), entry.getCreatedAt(),
                    entry.getDonationExpiresAt(), entry.getClaimantEmail(), entry.getClaimAccepted());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {

        String ownerEmail = AccountSession.requireEmail(servletRequest);

        entries.delete(requireOwnedEntry(id, ownerEmail));
        return ResponseEntity.noContent().build();
    }
}

