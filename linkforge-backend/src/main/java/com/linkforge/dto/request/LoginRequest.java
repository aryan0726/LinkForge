package com.linkforge.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Login payload.
 *
 * No {@code @Email} or length constraints here, intentionally. A malformed
 * email or a too-short password is still *a* credential attempt, and answering
 * it with a validation error would tell an attacker that their guess was
 * structurally wrong while a well-formed guess gets "invalid credentials".
 * Both paths return the same 401, so nothing is learned from the response.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
