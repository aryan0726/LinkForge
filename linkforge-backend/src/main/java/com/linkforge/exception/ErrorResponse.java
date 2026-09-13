package com.linkforge.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

/**
 * The single error shape returned by every failing endpoint.
 *
 * Deliberately flat and predictable so the frontend has exactly one parser:
 *
 * <pre>
 * {
 *   "timestamp": "2026-09-13T10:45:56Z",
 *   "status": 400,
 *   "error": "VALIDATION_ERROR",
 *   "message": "Validation failed for one or more fields",
 *   "path": "/api/auth/register",
 *   "fieldErrors": { "email": "Email must be a valid address" }
 * }
 * </pre>
 *
 * {@code fieldErrors} is omitted entirely when there is nothing to report, so a
 * non-validation error does not carry a misleading empty object.
 *
 * Never populate {@code message} with an exception message from an unexpected
 * failure: those are logged server-side and the client receives generic text.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @Builder.Default
    private final Instant timestamp = Instant.now();

    private final int status;

    /** One of {@link ErrorCode}. Stable; safe for clients to switch on. */
    private final String error;

    private final String message;

    private final String path;

    /**
     * Field name to message. Matches the map Spring produces for
     * {@code MethodArgumentNotValidException}, and the shape the frontend's
     * error normaliser already understands.
     */
    private final Map<String, String> fieldErrors;
}
