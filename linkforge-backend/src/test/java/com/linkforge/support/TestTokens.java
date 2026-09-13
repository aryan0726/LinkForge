package com.linkforge.support;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Builds JWTs for tests that need to control properties the application would
 * never produce on its own.
 *
 * Two cases cannot be reached through the real API and so must be constructed:
 *
 *  - an **expired** token, because {@code jwt.expiration-ms} is an hour in the
 *    test profile and no test should wait for it;
 *  - a token signed with a **different key**, because the application only ever
 *    signs with its own.
 *
 * Both are signed with the same algorithm (HS256) and the same test secret as
 * the running application, so the signature verification passes and the test
 * isolates exactly one failure: the expiry, or the key. Signing with a wrong
 * secret but a valid shape would otherwise only re-test the signature path.
 *
 * The secret here must match {@code jwt.secret} in
 * {@code src/test/resources/application-test.yaml}.
 */
public final class TestTokens {

    private static final String TEST_SECRET = "test-only-secret-0123456789-abcdefghijklmnopqrstuvwxyz";

    /** A secret of a different value but a legal length, so only the key differs. */
    private static final String OTHER_SECRET = "a-completely-different-secret-value-0123456789abcd";

    /** A year in the past: unambiguously expired rather than merely stale. */
    private static final long EXPIRED_BY_MS = 365L * 24 * 60 * 60 * 1000;

    private TestTokens() {
    }

    /** A correctly signed token whose expiry has already passed. */
    public static String expiredToken() {
        return expiredToken("expired-user@example.test");
    }

    public static String expiredToken(String subject) {

        Date now = new Date();
        Date issuedLongAgo = new Date(now.getTime() - (2 * EXPIRED_BY_MS));

        return Jwts.builder()
                .subject(subject)
                .issuedAt(issuedLongAgo)
                .expiration(new Date(now.getTime() - EXPIRED_BY_MS))
                .signWith(keyFrom(TEST_SECRET))
                .compact();
    }

    /** A well-formed token signed with a key the application does not know. */
    public static String tokenSignedWithAnotherKey(String subject) {

        Date now = new Date();

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + 3_600_000))
                .signWith(keyFrom(OTHER_SECRET))
                .compact();
    }

    /** A currently valid token, for tests that need to bypass the auth endpoint. */
    public static String validToken(String subject) {

        Date now = new Date();

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + 3_600_000))
                .signWith(keyFrom(TEST_SECRET))
                .compact();
    }

    private static SecretKey keyFrom(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
