package com.linkforge.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Registration payload.
 *
 * The constraints mirror `frontend/src/utils/validation.js` so the two layers
 * agree. That duplication is deliberate: the client rules exist for fast
 * feedback, these exist for correctness. Only these are authoritative — the
 * client can always be bypassed with curl.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 80, message = "Full name must be between 2 and 80 characters")
    private String fullName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9._-]+$",
            message = "Username may only contain letters, numbers, dots, dashes and underscores"
    )
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    @Size(max = 254, message = "Email must be 254 characters or fewer")
    private String email;

    /**
     * 72 is BCrypt's effective input limit — bytes beyond it are ignored during
     * hashing, so accepting a longer password would give a false sense of
     * strength.
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String password;
}
