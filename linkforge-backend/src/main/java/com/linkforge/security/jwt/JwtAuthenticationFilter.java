package com.linkforge.security.jwt;

import com.linkforge.security.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Populates the {@code SecurityContext} from a {@code Bearer} token when one is
 * present and valid.
 *
 * Design notes:
 *  - This filter never rejects a request. It either establishes an identity or
 *    leaves the request anonymous, and the authorization rules decide what that
 *    permits. Rejection lives in one place ({@link
 *    com.linkforge.security.RestAuthenticationEntryPoint}) rather than being
 *    duplicated here.
 *  - It never throws. A malformed token is discarded, so the request proceeds
 *    anonymously and is answered with a clean 401 instead of the 500 that the
 *    parser previously produced.
 *  - The token value is never logged.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";

    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;

    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            resolveToken(request)
                    .flatMap(jwtService::extractUsername)
                    .ifPresent(username -> authenticate(request, username));

        } catch (Exception ex) {
            // Defensive: nothing below is expected to throw, but a bug here must
            // not turn an unauthenticated request into a 500. The request simply
            // continues without an identity.
            log.warn("Unexpected error while processing JWT, continuing anonymously", ex);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Pulls the token out of the Authorization header.
     *
     * Returns empty for: no header, a header without the Bearer prefix, the bare
     * word "Bearer", "Bearer " with nothing after it, or a whitespace-only
     * token. Each of those previously reached the parser.
     */
    private Optional<String> resolveToken(HttpServletRequest request) {

        String header = request.getHeader(HEADER);

        if (header == null || header.isBlank()) {
            return Optional.empty();
        }

        // Case-insensitive per RFC 7235 — "bearer x" is as valid as "Bearer x".
        if (!header.regionMatches(true, 0, PREFIX, 0, PREFIX.length())) {
            return Optional.empty();
        }

        String token = header.substring(PREFIX.length()).trim();

        return token.isEmpty() ? Optional.empty() : Optional.of(token);
    }

    private void authenticate(HttpServletRequest request, String username) {

        // A preceding filter may already have authenticated this request.
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }

        UserDetails userDetails;
        try {
            userDetails = userDetailsService.loadUserByUsername(username);
        } catch (UsernameNotFoundException ex) {
            // Signature is valid but the account is gone (deleted between issue
            // and use). Treat the request as anonymous.
            log.debug("JWT references a user that no longer exists");
            return;
        }

        if (!userDetails.isEnabled()) {
            log.debug("JWT belongs to a disabled account");
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    /**
     * Skips the filter for the public auth endpoints.
     *
     * They cannot be authenticated, and parsing a stale Authorization header left
     * over from a previous session would only produce misleading debug logs.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return request.getServletPath().startsWith("/api/auth/");
    }
}
