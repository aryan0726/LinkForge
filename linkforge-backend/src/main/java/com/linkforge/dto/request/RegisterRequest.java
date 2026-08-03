package com.linkforge.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {

    private String fullName;
    private String username;
    private String email;
    private String password;
}