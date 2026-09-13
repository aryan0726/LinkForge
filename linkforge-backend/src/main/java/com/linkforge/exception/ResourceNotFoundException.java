package com.linkforge.exception;

/**
 * A requested resource does not exist, or the caller is not allowed to know
 * whether it exists.
 *
 * The two cases are deliberately indistinguishable. If a link lookup answered
 * "forbidden" for someone else's code but "not found" for a nonexistent one,
 * an attacker could enumerate valid short codes by watching which error came
 * back. Both return 404.
 */
public class ResourceNotFoundException extends ApplicationException {

    public ResourceNotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }

    public static ResourceNotFoundException shortCode(String shortCode) {
        return new ResourceNotFoundException("No link found for code: " + shortCode);
    }

    public static ResourceNotFoundException user() {
        return new ResourceNotFoundException("Authenticated user no longer exists");
    }
}
