package com.linkforge.exception;

import lombok.Getter;

import java.util.Map;

/**
 * A value that must be unique is already taken.
 *
 * Carries {@code fieldErrors} so the registration form can highlight the exact
 * input that clashed, rather than showing one generic banner. This is why the
 * duplicate check happens in the service (which knows which field failed)
 * instead of being inferred from a database constraint violation.
 */
@Getter
public class DuplicateResourceException extends ApplicationException {

    private final Map<String, String> fieldErrors;

    public DuplicateResourceException(String message, Map<String, String> fieldErrors) {
        super(ErrorCode.CONFLICT, message);
        this.fieldErrors = Map.copyOf(fieldErrors);
    }

    public static DuplicateResourceException email(String email) {
        return new DuplicateResourceException(
                "An account with that email already exists",
                Map.of("email", "That email is already registered")
        );
    }

    public static DuplicateResourceException username(String username) {
        return new DuplicateResourceException(
                "An account with that username already exists",
                Map.of("username", "That username is already taken")
        );
    }
}
