package com.ecolutics.account;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Shared helper for storing and reading the signed-in user's email in the HTTP session. */
public final class AccountSession {

    private static final String EMAIL_ATTRIBUTE = "ecolytics.account.email";

    private AccountSession() {
    }

    public static void storeEmail(HttpSession session, String email) {
        session.setAttribute(EMAIL_ATTRIBUTE, email);
    }

    /** Returns the session email or stops the request with HTTP 401 when signed out. */
    public static String requireEmail(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !(session.getAttribute(EMAIL_ATTRIBUTE) instanceof String email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in to continue");
        }
        return email;
    }

    /** Optional lookup for endpoints that need to behave differently when signed out. */
    public static String findEmail(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null && session.getAttribute(EMAIL_ATTRIBUTE) instanceof String email ? email : null;
    }
}
