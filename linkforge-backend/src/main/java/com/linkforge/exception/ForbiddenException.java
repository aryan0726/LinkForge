package com.linkforge.exception;

/**
 * The caller is authenticated but not allowed to perform this action.
 *
 * Maps to HTTP 403. Reserved for genuine authorization failures, so the
 * frontend can rely on the distinction from 401.
 */
public class ForbiddenException extends ApplicationException {

    public ForbiddenException(String message) {
        super(ErrorCode.FORBIDDEN, message);
    }
}
