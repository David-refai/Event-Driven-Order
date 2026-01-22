package com.example.auth.controller;

import com.example.auth.dto.*;
import com.example.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.registerUser(request);
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(request);

            org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie
                    .from("refreshToken", jwtResponse.refreshToken())
                    .httpOnly(true)
                    .secure(false) // Set to true in production with HTTPS
                    .path("/auth")
                    .maxAge(24 * 60 * 60)
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid username or password!"));
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshToken(jakarta.servlet.http.HttpServletRequest request) {
        String refreshToken = null;
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Refresh Token is missing!"));
        }

        try {
            TokenRefreshResponse tokenRefreshResponse = authService.refreshToken(new TokenRefreshRequest(refreshToken));
            return ResponseEntity.ok(tokenRefreshResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie
                .from("refreshToken", "")
                .httpOnly(true)
                .path("/auth")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("Log out successful!"));
    }
}
