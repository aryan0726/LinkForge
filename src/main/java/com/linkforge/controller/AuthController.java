package com.linkforge.controller;

import com.linkforge.dto.request.LoginRequest;
import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.dto.response.AuthResponse;
import com.linkforge.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}