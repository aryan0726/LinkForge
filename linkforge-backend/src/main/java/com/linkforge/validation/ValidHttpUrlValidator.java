package com.linkforge.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.net.URI;
import java.net.URISyntaxException;

/**
 * Validates that a string is an absolute HTTP or HTTPS URL that a browser can
 * actually be redirected to.
 *
 * This is intentionally stricter than "it parses as a URI" — {@code hello}
 * parses fine as a relative URI, and {@code mailto:someone@example.com} parses
 * as an absolute one, but neither can serve as a redirect target.
 *
 * Implemented with {@link URI} rather than {@code java.net.URL}: {@code URL}
 * performs DNS resolution in some equality/hashCode paths and accepts some
 * malformed input that {@code URI} rejects. A constraint validator must not
 * perform network I/O.
 *
 * Deliberately *not* restricted further:
 *  - any host is allowed, including IP addresses and internationalised domains
 *  - query strings, fragments, ports and deep paths are all fine
 *  - http is accepted alongside https, because plenty of legitimate sites are
 *    still http-only
 */
public class ValidHttpUrlValidator implements ConstraintValidator<ValidHttpUrl, String> {

    private static final int MAX_LENGTH = 2048;

    private static final int MAX_HOST_LENGTH = 253;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {

        // Null and blank are NotBlank's responsibility; letting them through here
        // avoids emitting two messages for the same field.
        if (value == null || value.isBlank()) {
            return true;
        }

        String candidate = value.trim();

        if (candidate.length() > MAX_LENGTH) {
            return false;
        }

        URI uri;
        try {
            uri = new URI(candidate);
        } catch (URISyntaxException e) {
            return false;
        }

        return hasHttpScheme(uri)
                && hasUsableHost(uri);
    }

    private boolean hasHttpScheme(URI uri) {
        String scheme = uri.getScheme();
        return scheme != null
                && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"));
    }

    private boolean hasUsableHost(URI uri) {
        String host = uri.getHost();

        if (host == null || host.isBlank() || host.length() > MAX_HOST_LENGTH) {
            return false;
        }

        // A bare word like "hello" or "abc" is technically a valid host, but it
        // is not a real destination. Require either a dot (a registrable domain)
        // or an explicit localhost, which is useful during development.
        boolean isLocalhost = host.equalsIgnoreCase("localhost");
        boolean looksLikeDomain = host.contains(".");

        if (!isLocalhost && !looksLikeDomain) {
            return false;
        }

        // Reject a trailing dot or a leading/trailing dot inside the host, e.g.
        // ".example.com" or "example.com." — both are usually typos, and the
        // first is a hostname-suffix trick.
        return !host.startsWith(".") && !host.endsWith(".");
    }
}
