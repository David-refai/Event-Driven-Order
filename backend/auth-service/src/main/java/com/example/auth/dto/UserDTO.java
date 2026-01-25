package com.example.auth.dto;

import java.util.List;

public record UserDTO(
                Long id,
                String username,
                String email,
                String profilePicture,
                List<String> roles) {
}
