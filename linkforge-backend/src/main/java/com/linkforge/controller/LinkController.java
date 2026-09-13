package com.linkforge.controller;

import com.linkforge.dto.link.CreateLinkRequest;
import com.linkforge.dto.link.LinkResponse;
import com.linkforge.service.interfaces.LinkService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

/**
 * Authenticated link management.
 *
 * Every method here operates on "the caller's own links". The owner is resolved
 * from the SecurityContext inside the service — never from a request parameter
 * — so there is no parameter a client could tamper with to reach another user's
 * data.
 */
@RestController
@RequestMapping("/api/links")
@RequiredArgsConstructor
@Validated
public class LinkController {

    private final LinkService linkService;

    /**
     * Shortens a URL.
     *
     * 201 Created: a new link resource now exists. The URL itself is validated
     * by {@link CreateLinkRequest} — {@code @Valid} is what runs those
     * constraints, so without it a string like {@code not-a-url} would be
     * stored happily.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LinkResponse create(@Valid @RequestBody CreateLinkRequest request) {

        return linkService.createShortLink(request);
    }

    /**
     * The caller's own links, newest first.
     *
     * Scoped to the authenticated user by the service. There is no "all links"
     * variant, because exposing every user's links would be a data leak.
     */
    @GetMapping
    public List<LinkResponse> getMyLinks() {

        return linkService.getAllLinks();
    }

    /**
     * Resolves a short code and issues a redirect.
     *
     * Kept for API symmetry with the public root-level redirect so an
     * authenticated client can resolve a code through the same base path it
     * uses for everything else. Returns 302 with a {@code Location} header
     * rather than a body, which is why the return type is {@code void} and the
     * response is written directly.
     */
    @GetMapping("/{shortCode}")
    public void redirect(
            @PathVariable String shortCode,
            HttpServletResponse response) throws IOException {

        linkService.redirect(shortCode, response);
    }
}
