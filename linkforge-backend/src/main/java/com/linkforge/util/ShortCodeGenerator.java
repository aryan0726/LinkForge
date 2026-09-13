package com.linkforge.util;

import java.security.SecureRandom;

/**
 * Generates the random suffix of a short link.
 *
 * {@link SecureRandom} rather than {@link java.util.Random}: short codes are the
 * only thing protecting a link from being discovered, and {@code Random} is a
 * predictable linear congruential generator — seeing a handful of codes is
 * enough to compute the next ones. The generator is a single shared instance
 * because constructing one per call is expensive and unnecessary;
 * {@code SecureRandom} is thread-safe.
 *
 * This class only produces candidate codes. Guaranteeing uniqueness is the
 * caller's job, and the final backstop is the {@code UNIQUE} constraint on
 * {@code links.short_code}.
 */
public final class ShortCodeGenerator {

    /**
     * Unambiguous-looking alphabet: digits, upper and lower case.
     *
     * 62 symbols over 6 characters is about 5.7 × 10^10 possibilities, which is
     * far beyond guessable by brute force at any realistic request rate.
     */
    private static final String CHARACTERS =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final SecureRandom RANDOM = new SecureRandom();

    private ShortCodeGenerator() {
        // Static utility.
    }

    public static String generate(int length) {

        if (length <= 0) {
            throw new IllegalArgumentException("Short code length must be positive");
        }

        StringBuilder code = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            code.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }

        return code.toString();
    }
}
