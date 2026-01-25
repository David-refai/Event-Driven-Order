package com.example.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class JwtResponse {
    private String token;
    private Long id;
    private String type = "Bearer";
    private String refreshToken;
    private String username;
    private String email;
    private String profilePicture;
    private List<String> roles;

    public JwtResponse() {
    }

    public JwtResponse(String token, Long id, String refreshToken, String username, String email, String profilePicture,
            List<String> roles) {
        this.token = token;
        this.id = id;
        this.refreshToken = refreshToken;
        this.username = username;
        this.email = email;
        this.profilePicture = profilePicture;
        this.roles = roles;
    }

    @JsonProperty("token")
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    @JsonProperty("id")
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonProperty("type")
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @JsonProperty("refreshToken")
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    @JsonProperty("username")
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonProperty("email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonProperty("profilePicture")
    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    @JsonProperty("roles")
    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
