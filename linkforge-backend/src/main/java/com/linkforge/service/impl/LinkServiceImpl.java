package com.linkforge.service.impl;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import com.linkforge.entity.Link;
import com.linkforge.entity.User;
import com.linkforge.exception.InvalidUrlException;
import com.linkforge.exception.ResourceNotFoundException;
import com.linkforge.repository.LinkRepository;
import com.linkforge.repository.UserRepository;
import com.linkforge.service.interfaces.LinkService;
import com.linkforge.util.ShortCodeGenerator;
import com.linkforge.validation.ValidHttpUrlValidator;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

/**
 * Link creation, listing and redirection.
 *
 * Two cross-cutting rules are enforced here rather than in the controller:
 *
 *  1. The acting user is always derived from the {@code SecurityContext}. No
 *     method accepts a user id, so ownership cannot be spoofed by a request
 *     parameter.
 *  2. Every read and write is scoped to that user. An id belonging to somebody
 *     else resolves to "not found" rather than "forbidden", so the API does not
 *     confirm the existence of other users' links.
 */
@Service
@Slf4j
public class LinkServiceImpl implements LinkService {

    /**
     * How many times to retry when a generated short code is already taken.
     *
     * A six-character code from a 62-symbol alphabet has ~5.7e10 combinations,
     * so a single collision is rare and two in a row is vanishingly unlikely.
     * The bound exists so a pathological state (a nearly full code space, or a
     * broken random source) fails loudly instead of spinning forever.
     */
    private static final int MAX_SHORT_CODE_ATTEMPTS = 5;

    private final LinkRepository linkRepository;

    private final UserRepository userRepository;

    /** Shared instance of the URL rule, so service and web layer cannot diverge. */
    private final ValidHttpUrlValidator urlValidator = new ValidHttpUrlValidator();

    /**
     * Public origin prepended to a short code to form a shareable URL.
     *
     * Previously the literal {@code "http://localhost:8080/"} was concatenated
     * in two places, so a deployed instance returned links pointing at the
     * developer's laptop. Sourced from configuration instead, which means the
     * deployed origin changes without touching Java.
     *
     * Normalised in the constructor: a trailing slash would produce
     * {@code https://example.com//abc123}, and a missing scheme would produce a
     * URL no browser or email client treats as a link.
     */
    private final String baseUrl;

    public LinkServiceImpl(
            LinkRepository linkRepository,
            UserRepository userRepository,
            @Value("${app.base-url}") String baseUrl) {

        this.linkRepository = linkRepository;
        this.userRepository = userRepository;

        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("app.base-url must not be blank");
        }

        String normalized = baseUrl.trim();

        if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
            throw new IllegalStateException(
                    "app.base-url must start with http:// or https:// (got: " + normalized + ")");
        }

        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        this.baseUrl = normalized;
    }

    @Override
    @Transactional
    public LinkResponse createShortLink(CreateLinkRequest request) {

        User user = currentUser();

        String originalUrl = request.getOriginalUrl().trim();

        // The @ValidHttpUrl constraint has already rejected anything that is not
        // an absolute http/https URL. Re-checking here is not redundant: it is
        // the guarantee that holds if the service is ever called directly (from
        // a test, a scheduled job, or a future controller) rather than through a
        // validated web request. Reusing the same validator keeps one definition
        // of "acceptable URL" instead of two that can drift apart.
        if (!urlValidator.isValid(originalUrl, null)) {
            throw InvalidUrlException.forValue(originalUrl);
        }

        String shortCode = generateUniqueShortCode();

        Link link = Link.builder()
                .originalUrl(originalUrl)
                .shortCode(shortCode)
                .clickCount(0L)
                .active(true)
                .user(user)
                .build();

        linkRepository.save(link);

        log.debug("Created link {} for user {}", shortCode, user.getId());

        return toResponse(link);
    }

    /**
     * Records the visit and redirects the browser.
     *
     * The counter is incremented with a single database statement rather than
     * read-modify-write, so simultaneous visits to the same link each count.
     * See {@link LinkRepository#incrementClickCount}.
     *
     * Order matters: the increment is committed before the redirect is issued.
     * If the client disconnects mid-redirect afterwards, the count is already
     * durable; doing it the other way round would lose counts whenever a browser
     * aborted the navigation.
     */
    @Override
    @Transactional
    public void redirect(String shortCode, HttpServletResponse response)
            throws IOException {

        Link link = linkRepository.findByShortCodeAndActiveTrue(shortCode)
                .orElseThrow(() -> ResourceNotFoundException.shortCode(shortCode));

        linkRepository.incrementClickCount(link.getId());

        response.sendRedirect(link.getOriginalUrl());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LinkResponse> getAllLinks() {

        User user = currentUser();

        return linkRepository.findByUserOrderByIdDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ------------------------------------------------------------------ helpers

    /**
     * Resolves the authenticated user from the SecurityContext.
     *
     * Reaching this method with no authentication means a URL was left
     * unguarded in {@code SecurityConfig} — an authorization bug, not a user
     * error. It therefore raises {@code ResourceNotFoundException} (the caller
     * has no identity to act with) rather than a 500, and logs at warn so the
     * misconfiguration is visible.
     */
    private User currentUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Link operation reached the service layer without an authenticated caller");
            throw ResourceNotFoundException.user();
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(ResourceNotFoundException::user);
    }

    /**
     * Generates a short code not already present in the database.
     *
     * The uniqueness guarantee ultimately comes from the {@code UNIQUE}
     * constraint on {@code links.short_code}; this loop only keeps the common
     * case from ever hitting it. The check-then-insert race is real but
     * acceptable here: two identical codes would have to be generated in the
     * same instant, and the database would reject the loser.
     */
    private String generateUniqueShortCode() {

        for (int attempt = 0; attempt < MAX_SHORT_CODE_ATTEMPTS; attempt++) {

            String candidate = ShortCodeGenerator.generate(6);

            if (linkRepository.findByShortCode(candidate).isEmpty()) {
                return candidate;
            }

            log.debug("Short code collision on attempt {}", attempt + 1);
        }

        throw new IllegalStateException(
                "Could not generate a unique short code after "
                        + MAX_SHORT_CODE_ATTEMPTS + " attempts");
    }

    private LinkResponse toResponse(Link link) {

        return LinkResponse.builder()
                .originalUrl(link.getOriginalUrl())
                .shortCode(link.getShortCode())
                .shortUrl(baseUrl + "/" + link.getShortCode())
                .clickCount(link.getClickCount())
                .build();
    }
}
