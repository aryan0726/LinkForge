package com.linkforge.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

/**
 * Issues and verifies JSON Web Tokens.
 *
 * Every verification path returns {@link Optional#empty()} rather than throwing.
 * Previously a malformed token propagated out of the authentication filter and
 * surfaced as HTTP 500, which is both wrong (the request is unauthenticated, not
 * a server fault) and a small information leak, because the parser's message was
 * echoed in the response body. A token is untrusted input; untrusted input is
 * handled by returning "no identity", never by failing.
 */
@Service
@Slf4j
public class JwtService {

    /**
     * HS256 needs at least 256 bits of key material. Enforced at startup so a
     * weak secret fails loudly on boot instead of silently producing tokens that
     * can be forged.
     */
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey key;

    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {

        byte[] keyBytes = secret == null
                ? new byte[0]
                : secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "jwt.secret must be at least " + MIN_SECRET_BYTES + " bytes for HS256 "
                            + "(got " + keyBytes.length + "). Generate one with: "
                            + "openssl rand -base64 48");
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /** Creates a token whose subject is the user's email address. */
    public String generateToken(UserDetails userDetails) {

        Date now = new Date();

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    /**
     * Extracts the subject from a token, or empty when the token cannot be
     * trusted for any reason.
     *
     * Each failure mode is logged at debug — useful when diagnosing a client
     * integration, invisible in normal production logs. The parser's message is
     * never propagated to the caller.
     */
    public Optional<String> extractUsername(String token) {

        try {
            Claims claims = parse(token);
            return Optional.ofNullable(claims.getSubject());

        } catch (ExpiredJwtException ex) {
            log.debug("Rejected JWT: expired at {}", ex.getClaims().getExpiration());

        } catch (SignatureException ex) {
            log.debug("Rejected JWT: signature verification failed");

        } catch (MalformedJwtException ex) {
            log.debug("Rejected JWT: malformed token");

        } catch (UnsupportedJwtException ex) {
            log.debug("Rejected JWT: unsupported token type");

        } catch (JwtException | IllegalArgumentException ex) {
            // IllegalArgumentException covers null/blank input; JwtException is
            // the family root for everything else the parser rejects.
            log.debug("Rejected JWT: {}", ex.getClass().getSimpleName());
        }

        return Optional.empty();
    }

    /**
     * True when the token is well-formed, correctly signed, unexpired, and
     * belongs to the supplied user.
     *
     * Comparing the subject guards against a valid token for user A being
     * replayed under user B's identity.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {

        if (userDetails == null || !userDetails.isEnabled()) {
            return false;
        }

        return extractUsername(token)
                .map(subject -> subject.equals(userDetails.getUsername()))
                .orElse(false);
    }

    /** Exposed for the filter so it can distinguish expiry from other failures. */
    public boolean isExpired(String token) {

        try {
            Date expiration = parse(token).getExpiration();
            return expiration == null || expiration.before(new Date());

        } catch (ExpiredJwtException ex) {
            return true;

        } catch (JwtException | IllegalArgumentException ex) {
            return true;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
