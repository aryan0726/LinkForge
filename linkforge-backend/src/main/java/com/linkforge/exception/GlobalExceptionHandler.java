package com.linkforge.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Translates every exception that escapes a controller into one predictable
 * JSON shape.
 *
 * Rules this class enforces:
 *  - a client never sees a stack trace, SQL fragment, class name or credential
 *  - unexpected failures are logged in full server-side and answered generically
 *  - expected failures map to the status the HTTP semantics call for
 *  - validation errors carry per-field detail so forms stay usable
 *
 * The order of {@code @ExceptionHandler} lookup in Spring is by specificity, not
 * declaration order, so the catch-all {@code Exception} branch does not shadow
 * the more precise ones.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ---------------------------------------------------------------- domain

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(
            DuplicateResourceException ex, HttpServletRequest request) {

        // Expected outcome of a user retrying a registration; logging it at warn
        // would drown real problems.
        log.debug("Duplicate resource on {}: {}", request.getRequestURI(), ex.getMessage());

        return build(HttpStatus.CONFLICT, ex.getErrorCode(), ex.getMessage(), request,
                ex.getFieldErrors());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        return build(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(InvalidUrlException.class)
    public ResponseEntity<ErrorResponse> handleInvalidUrl(
            InvalidUrlException ex, HttpServletRequest request) {

        return build(HttpStatus.BAD_REQUEST, ex.getErrorCode(), ex.getMessage(), request,
                Map.of("originalUrl", ex.getMessage()));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(
            ForbiddenException ex, HttpServletRequest request) {

        return build(HttpStatus.FORBIDDEN, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {

        return build(HttpStatus.UNAUTHORIZED, ex.getErrorCode(), ex.getMessage(), request, null);
    }

    // ------------------------------------------------------- security layer

    /**
     * Raised by the authentication manager when credentials do not match, and
     * thrown directly by the auth service for an unknown email.
     *
     * Answered with the same generic message either way — see
     * {@link UnauthorizedException#badCredentials()}.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {

        return build(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED,
                "Invalid email or password", request, null);
    }

    /**
     * Catch-all for other Spring Security authentication failures.
     *
     * {@code GlobalExceptionHandler} is consulted before the
     * {@code AuthenticationEntryPoint} when an exception propagates out of a
     * controller; this exists so such a case still yields a clean 401 rather
     * than falling through to the generic 500 branch.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {

        log.debug("Authentication failure on {}: {}", request.getRequestURI(), ex.getMessage());

        return build(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED,
                "Authentication is required to access this resource", request, null);
    }

    /**
     * Authenticated but lacking the required authority.
     *
     * With a single USER role in this application this should be unreachable
     * today; it is handled so that adding an admin-only endpoint later cannot
     * accidentally surface as a 500.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {

        return build(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN,
                "You do not have permission to perform this action", request, null);
    }

    // ---------------------------------------------------------- validation

    /**
     * {@code @Valid} failure on a request body. Collapses Spring's field errors
     * into a flat map the frontend renders directly against each input.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            // putIfAbsent keeps the first message per field: with several
            // constraints on one property, the user only needs the first fix.
            fieldErrors.putIfAbsent(fieldError.getField(),
                    fieldError.getDefaultMessage() != null
                            ? fieldError.getDefaultMessage()
                            : "Invalid value");
        }

        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Please correct the highlighted fields", request, fieldErrors);
    }

    /** Constraint violations raised outside request-body binding. */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();

        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String path = violation.getPropertyPath().toString();
            String field = path.contains(".")
                    ? path.substring(path.lastIndexOf('.') + 1)
                    : path;
            fieldErrors.putIfAbsent(field, violation.getMessage());
        }

        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Please correct the highlighted fields", request, fieldErrors);
    }

    /**
     * Body missing, malformed JSON, or a value of the wrong JSON type.
     *
     * The parser's own message is not returned: it can quote portions of the
     * payload and includes internal class names such as
     * {@code com.linkforge.dto.request.RegisterRequest}.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        log.debug("Unreadable request body on {}: {}", request.getRequestURI(), ex.getMessage());

        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Request body is missing or malformed", request, null);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {

        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Required parameter is missing: " + ex.getParameterName(), request,
                Map.of(ex.getParameterName(), "This parameter is required"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {

        return build(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
                "Parameter has the wrong type: " + ex.getName(), request, null);
    }

    // ------------------------------------------------------ routing / method

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        return build(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.VALIDATION_ERROR,
                "HTTP method " + ex.getMethod() + " is not supported for this endpoint",
                request, null);
    }

    /**
     * No mapping matched the request path.
     *
     * Since Spring Boot 3.2 an unmatched request raises
     * {@code NoResourceFoundException} rather than the older
     * {@code NoHandlerFoundException}, because static-resource handling now runs
     * for every unmapped path. Both are handled here:
     *
     *  - {@code NoResourceFoundException} is what is actually thrown today. It
     *    was missed on the first pass, and because nothing else claimed it the
     *    request fell through to the catch-all and answered **500** for what is
     *    plainly a 404. Verified against the running service and fixed.
     *  - {@code NoHandlerFoundException} is kept for the case where static
     *    resources are disabled or a different resolver is configured; removing
     *    it would reintroduce the same 500 under that configuration.
     *
     * The exception's own message contains the request path sanitised by Spring
     * ({@code No static resource api/nonexistent.}) — it is not returned, because
     * a client already knows which path it requested and echoing server internals
     * adds nothing.
     */
    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<ErrorResponse> handleNoHandler(
            Exception ex, HttpServletRequest request) {

        return build(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND,
                "No endpoint found for this path", request, null);
    }

    // ----------------------------------------------------------- catch-all

    /**
     * Anything not handled above.
     *
     * The full stack trace goes to the application log; the client receives a
     * generic message with no detail. This is the branch that must never leak
     * an internal message, because it is the one that catches the unknown.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception ex, HttpServletRequest request) {

        log.error("Unhandled exception on {} {}", request.getMethod(), request.getRequestURI(), ex);

        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR,
                "Something went wrong. Please try again later.", request, null);
    }

    // ------------------------------------------------------------- helpers

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status,
            ErrorCode code,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors) {

        ErrorResponse body = ErrorResponse.builder()
                .status(status.value())
                .error(code.name())
                .message(message)
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors == null || fieldErrors.isEmpty() ? null : fieldErrors)
                .build();

        return ResponseEntity.status(status).body(body);
    }
}
