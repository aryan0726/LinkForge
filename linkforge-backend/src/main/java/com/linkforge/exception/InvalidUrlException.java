package com.linkforge.exception;

/**
 * The submitted URL is structurally valid but cannot be shortened.
 *
 * Distinct from a Bean Validation failure so the client can show a specific,
 * actionable message rather than a generic "invalid input".
 */
public class InvalidUrlException extends ApplicationException {

    public InvalidUrlException(String message) {
        super(ErrorCode.INVALID_URL, message);
    }

    /**
     * Builds the message from the rejected value.
     *
     * The URL is echoed back because the user typed it and needs to see what was
     * rejected; it is their own input, not server state. It is truncated so a
     * multi-megabyte payload cannot be reflected into the response.
     */
    public static InvalidUrlException forValue(String value) {

        String shown = value == null
                ? ""
                : value.length() > 100 ? value.substring(0, 100) + "..." : value;

        return new InvalidUrlException(
                "'" + shown + "' is not a valid URL. Include the scheme, for example "
                        + "https://example.com/page");
    }
}
