package com.ecolutics.remnant;

import com.ecolutics.account.AccountSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
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

    public RemnantEntryController(RemnantEntryRepository entries) {
        this.entries = entries;
    }

    /** Validates a submitted entry, assigns it to the signed-in user, and saves it. */
    @PostMapping
    public ResponseEntity<EntryResponse> createEntry(
            @Valid @RequestBody CreateEntryRequest request,
            HttpServletRequest servletRequest) {
        String ownerEmail = AccountSession.requireEmail(servletRequest);
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

        // The owner comes from the server session, never from client-submitted JSON.
        RemnantEntry saved = entries.save(new RemnantEntry(
                ownerEmail, request.weight(), type, itemName, category, mealType));
        return ResponseEntity.status(HttpStatus.CREATED).body(EntryResponse.from(saved));
    }

    /** Returns only the current user's entries, newest first. */
    @GetMapping
    public List<EntryResponse> listEntries(HttpServletRequest servletRequest) {
        String ownerEmail = AccountSession.requireEmail(servletRequest);
        return entries.findAllByOwnerEmailOrderByCreatedAtDesc(ownerEmail).stream()
                .map(EntryResponse::from)
                .toList();
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
            java.time.Instant createdAt) {
        private static EntryResponse from(RemnantEntry entry) {
            return new EntryResponse(entry.getId(), entry.getWeightKg(), entry.getRemnantType(),
                    entry.getItemName(), entry.getCategory(), entry.getMealType(), entry.getCreatedAt());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {

        String ownerEmail = AccountSession.requireEmail(servletRequest);

        RemnantEntry entry = entries.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Remnant entry not found"));

        // Make sure the user can delete only their own entry
        if (!entry.getOwnerEmail().equals(ownerEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete this entry");
        }

        entries.delete(entry);

        return ResponseEntity.noContent().build();
    }
}

