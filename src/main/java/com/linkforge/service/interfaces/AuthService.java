package com.linkforge.service.interfaces;

import com.linkforge.dto.request.LoginRequest;
import com.linkforge.dto.request.RegisterRequest;
import com.linkforge.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}