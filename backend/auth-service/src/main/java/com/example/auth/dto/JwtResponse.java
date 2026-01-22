package com.example.auth.dto;

import java.util.List;

public record JwtResponse(
        String token,
        String type,
        String refreshToken,
        String username,
        String email,
        List<String> roles) {
    public JwtResponse(String token, String refreshToken, String username, String email, List<String> roles) {
        this(token, "Bearer", refreshToken, username, email, roles);
    }
}
