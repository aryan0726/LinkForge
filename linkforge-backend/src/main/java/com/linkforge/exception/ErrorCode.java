package com.linkforge.exception;

/**
 * Stable, machine-readable error codes returned in the {@code error} field of
 * every error response.
 *
 * These are part of the public API contract: the frontend switches on them, so
 * a value must never be renamed or repurposed. Human-readable text belongs in
 * the {@code message} field instead.
 */
public enum ErrorCode {

    /** Request body failed Bean Validation, or could not be parsed. */
    VALIDATION_ERROR,

    /** Missing, malformed, expired or otherwise unusable credentials. */
    UNAUTHORIZED,

    /** Authenticated, but not permitted to touch this resource. */
    FORBIDDEN,

    /** No such resource. */
    NOT_FOUND,

    /** Unique constraint violated — duplicate email or username. */
    CONFLICT,

    /**
     * The request was well-formed but semantically unacceptable, e.g. a URL that
     * cannot be shortened. Distinct from VALIDATION_ERROR so callers can tell
     * "you sent nonsense" from "this value is not allowed".
     */
    INVALID_URL,

    /** Anything unanticipated. Details are logged, never returned. */
    INTERNAL_ERROR
}
