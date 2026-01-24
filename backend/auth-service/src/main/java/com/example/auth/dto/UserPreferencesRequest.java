package com.example.auth.dto;

import java.util.Map;

public record UserPreferencesRequest(
        String language,
        String theme,
        String currency,
        Map<String, Boolean> notifications) {
}
