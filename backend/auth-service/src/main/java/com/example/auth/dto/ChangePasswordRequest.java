package com.example.auth.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword) {
}
