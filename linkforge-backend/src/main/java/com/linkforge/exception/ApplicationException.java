package com.linkforge.exception;

/**
 * Base class for failures that are part of normal application operation and
 * should be translated into a specific HTTP response.
 *
 * Using dedicated types instead of {@code RuntimeException} means the global
 * handler can map each case precisely, and the compiler helps catch an
 * unhandled branch. Anything that is *not* a subclass of this is a genuine bug
 * and is reported as a generic 500 with no detail leaked.
 */
public abstract class ApplicationException extends RuntimeException {

    private final ErrorCode errorCode;

    protected ApplicationException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
