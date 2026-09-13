package com.linkforge.config;

import com.linkforge.security.RestAuthenticationEntryPoint;
import com.linkforge.security.jwt.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Authorization rules and HTTP security for the API.
 *
 * The application is a stateless, token-authenticated JSON API, which drives
 * every decision here:
 *
 *  - No session is created, because identity travels in the Authorization
 *    header on each request rather than in a cookie.
 *  - CSRF protection is disabled, and that is safe precisely *because* there is
 *    no cookie. A browser cannot be tricked into attaching another site's
 *    Authorization header, so the cross-site request forgery vector does not
 *    exist. This would be a serious mistake for a cookie-based session.
 *  - Unauthenticated requests are answered by {@link
 *    RestAuthenticationEntryPoint} with JSON 401, not Spring's default 403
 *    with an empty body.
 */
@Configuration
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final AuthenticationProvider authenticationProvider;

    private final RestAuthenticationEntryPoint authenticationEntryPoint;

    /**
     * Comma-separated browser origins permitted to call the API.
     *
     * Sourced from configuration so a deployment does not require a code change.
     * A wildcard is rejected at startup rather than silently allowed: combining
     * {@code *} with credentials is invalid per the CORS specification, and a
     * production API should name its origins explicitly.
     */
    private final List<String> allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationProvider = authenticationProvider;
        this.authenticationEntryPoint = authenticationEntryPoint;

        List<String> origins = splitOrigins(allowedOrigins);

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins must list at least one origin");
        }

        if (origins.contains("*")) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins must not contain '*': the API is called "
                            + "with credentials, and a wildcard origin would let any site "
                            + "read authenticated responses. List the origins explicitly.");
        }

        this.allowedOrigins = origins;

        log.info("CORS enabled for origins: {}", origins);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Without this, an unauthenticated request to a protected path
                // returns 403 with an empty body — indistinguishable from "you
                // are signed in but not allowed". 401 with a JSON body is what a
                // token API should return.
                .exceptionHandling(handling ->
                        handling.authenticationEntryPoint(authenticationEntryPoint))

                .authorizeHttpRequests(auth -> auth

                        // Registration and login: the only endpoints that must
                        // work without a token.
                        .requestMatchers("/api/auth/**").permitAll()

                        // The short-link redirect. Public by design — a short URL
                        // is useless if following it requires an account. Mapped
                        // to a single path segment so it cannot shadow /api/**.
                        .requestMatchers(HttpMethod.GET, "/{shortCode:[^.]+}").permitAll()

                        // Everything else, including /api/links and /api/user/me,
                        // requires a valid token. Note that an unknown path under
                        // /api/** now falls under this rule, so it is answered 401
                        // when anonymous and 404 when authenticated. That is a
                        // deliberate trade-off: it does not disclose which API
                        // paths exist to an unauthenticated caller, at the cost of
                        // a 401 instead of 404 for a typo'd authenticated URL.
                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider)

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(allowedOrigins);

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin"
        ));

        // Without this the browser blocks the client from reading the token on a
        // cross-origin response. Only headers the frontend actually uses are
        // exposed — no need to reveal anything else.
        configuration.setExposedHeaders(List.of("Authorization"));

        configuration.setAllowCredentials(true);

        // Browsers cache a preflight result; five minutes avoids a preflight on
        // every call without leaving a stale policy for long.
        configuration.setMaxAge(300L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * Splits a comma-separated origin list, dropping blanks and trailing
     * slashes.
     *
     * A trailing slash is a common configuration mistake — {@code
     * https://example.com/} never matches the {@code Origin} header the browser
     * sends, which is always {@code https://example.com} — so it is normalised
     * away rather than silently leaving CORS broken.
     */
    private static List<String> splitOrigins(String raw) {

        if (raw == null || raw.isBlank()) {
            return List.of();
        }

        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(value -> value.endsWith("/")
                        ? value.substring(0, value.length() - 1)
                        : value)
                .distinct()
                .toList();
    }
}
