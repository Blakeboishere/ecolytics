package com.ecolutics.account;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** HTTP endpoints for creating accounts and managing the signed-in session. */
@RestController
@RequestMapping("/api/auth")
public class AccountController {

    private final UserAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;

    public AccountController(UserAccountRepository accounts, PasswordEncoder passwordEncoder) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
    }

    /** Creates an account after normalizing the email and hashing the password. */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (accounts.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        UserAccount account = accounts.save(new UserAccount(
                request.fullName().trim(), email, passwordEncoder.encode(request.password()),
                cleanOptional(request.phone()), cleanOptional(request.organization()), cleanOptional(request.location())));
        return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(account));
    }

    /** Verifies credentials, then starts a fresh session for the account. */
    @PostMapping("/login")
    public AccountResponse login(
            @RequestParam("username") String email,
            @RequestParam("password") String password,
            HttpServletRequest request) {
        UserAccount account = accounts.findByEmailIgnoreCase(email.trim())
                .filter(candidate -> passwordEncoder.matches(password, candidate.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect"));
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }
        AccountSession.storeEmail(request.getSession(true), account.getEmail());
        return AccountResponse.from(account);
    }

    /** Returns the account associated with the current browser session. */
    @GetMapping("/me")
    public AccountResponse currentAccount(HttpServletRequest request) {
        String email = AccountSession.requireEmail(request);
        UserAccount account = accounts.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return AccountResponse.from(account);
    }

    /** Updates the editable profile fields for the account in the current session. */
    @PutMapping("/profile")
    public AccountResponse updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            HttpServletRequest servletRequest) {
        String email = AccountSession.requireEmail(servletRequest);
        UserAccount account = accounts.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        account.updateProfile(cleanOptional(request.phone()), cleanOptional(request.organization()),
                cleanOptional(request.location()));
        return AccountResponse.from(accounts.save(account));
    }

    /** Ends the current session; logging out when already signed out is harmless. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    /** Input contract for sign-up; validation runs before register() is called. */
    public record RegisterRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @Size(max = 30) String phone,
            @Size(max = 120) String organization,
            @Size(max = 120) String location) {
    }

    /** Safe account details returned to the browser (never includes the password hash). */
    public record ProfileUpdateRequest(
            @Size(max = 30) String phone,
            @Size(max = 120) String organization,
            @Size(max = 120) String location) {
    }

    public record AccountResponse(
            String fullName,
            String email,
            String phone,
            String organization,
            String location,
            java.time.Instant createdAt) {
        private static AccountResponse from(UserAccount account) {
            return new AccountResponse(account.getFullName(), account.getEmail(), account.getPhone(),
                    account.getOrganization(), account.getLocation(), account.getCreatedAt());
        }
    }

    private static String cleanOptional(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
