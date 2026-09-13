package com.linkforge.exception;

/**
 * The caller presented no usable credentials, or credentials that are no longer
 * valid (expired token, bad signature, wrong password).
 *
 * Maps to HTTP 401. Kept separate from {@link ForbiddenException} because the
 * frontend treats them differently: 401 means "sign in again", 403 means
 * "signed in, but you may not do this".
 */
public class UnauthorizedException extends ApplicationException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHORIZED, message);
    }

    /**
     * The only message ever returned for a failed sign-in attempt.
     *
     * It deliberately does not distinguish "no such account" from "wrong
     * password" — revealing which one is wrong lets an attacker enumerate
     * registered email addresses.
     */
    public static UnauthorizedException badCredentials() {
        return new UnauthorizedException("Invalid email or password");
    }

    public static UnauthorizedException invalidToken() {
        return new UnauthorizedException("Your session is invalid or has expired");
    }

    public static UnauthorizedException missingToken() {
        return new UnauthorizedException("Authentication is required to access this resource");
    }
}
