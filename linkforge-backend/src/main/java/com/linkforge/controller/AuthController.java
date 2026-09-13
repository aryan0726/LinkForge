package com.linkforge.controller;

import com.linkforge.dto.request.LoginRequest;
import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.dto.response.AuthResponse;
import com.linkforge.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers an account and signs the new user in.
     *
     * Returns 201 Created because a new user resource now exists. {@code @Valid}
     * is what actually enforces the constraints on {@link RegisterRequest} —
     * without it the annotations are inert and the endpoint accepts anything,
     * which is exactly the bug this replaced.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Exchanges credentials for a token.
     *
     * Returns 200, not 201: authenticating does not create a resource. A wrong
     * password and an unknown email both produce the same 401 with the same
     * message, so the response cannot be used to discover which addresses are
     * registered.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
}
