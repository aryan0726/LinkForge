package com.linkforge.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.linkforge.exception.ErrorCode;
import com.linkforge.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

/**
 * Answers an unauthenticated request with HTTP 401 and the same JSON shape as
 * every other error.
 *
 * Why this class exists: Spring Security's default entry point returns 403 for a
 * missing token on a stateless API, and writes an empty body. That caused two
 * problems this project needs to avoid:
 *
 *  1. 403 means "authenticated but forbidden", so the frontend could not tell
 *     "sign in again" from "you may not do this". Now 401 is reserved for
 *     missing/invalid credentials and 403 genuinely means forbidden.
 *  2. An empty body left the client with nothing to display. Now the response
 *     carries a message the UI can show directly.
 *
 * It cannot be replaced by {@code @RestControllerAdvice}, because this runs in
 * the filter chain *before* the dispatcher servlet is reached — no controller
 * is ever invoked, so no exception is thrown for an advice to catch.
 */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        // A response may already be committed if the failure happened late.
        if (response.isCommitted()) {
            return;
        }

        ErrorResponse body = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(ErrorCode.UNAUTHORIZED.name())
                .message("Authentication is required to access this resource")
                .path(request.getRequestURI())
                .build();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("WWW-Authenticate", "Bearer");

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
