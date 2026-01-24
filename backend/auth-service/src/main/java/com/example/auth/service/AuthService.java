package com.example.auth.service;

import com.example.auth.dto.JwtResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.entity.Role;
import com.example.auth.entity.User;
import com.example.auth.repository.RoleRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;
        private final RefreshTokenService refreshTokenService;
        private final EmailService emailService;

        @org.springframework.beans.factory.annotation.Value("${admin.promotion-key}")
        private String adminPromotionKey;

        public AuthService(AuthenticationManager authenticationManager,
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        JwtTokenProvider tokenProvider,
                        RefreshTokenService refreshTokenService,
                        EmailService emailService) {
                this.authenticationManager = authenticationManager;
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.passwordEncoder = passwordEncoder;
                this.tokenProvider = tokenProvider;
                this.refreshTokenService = refreshTokenService;
                this.emailService = emailService;
        }

        @Transactional
        public void registerUser(RegisterRequest request) {
                if (userRepository.existsByUsername(request.username())) {
                        throw new RuntimeException("Username is already taken!");
                }

                if (userRepository.existsByEmail(request.email())) {
                        throw new RuntimeException("Email is already in use!");
                }

                User user = new User(
                                request.username(),
                                request.email(),
                                passwordEncoder.encode(request.password()));

                // Assign default role USER
                Set<Role> roles = new HashSet<>();
                Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Role not found"));
                roles.add(userRole);
                user.setRoles(roles);

                // Set verification token
                String token = UUID.randomUUID().toString();
                user.setVerificationToken(token);
                user.setEnabled(false); // User is disabled until verified

                userRepository.save(user);
                emailService.sendVerificationEmail(user.getEmail(), token);
        }

        public void verifyEmail(String token) {
                User user = userRepository.findByVerificationToken(token)
                                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

                user.setEnabled(true);
                user.setVerificationToken(null);
                userRepository.save(user);
        }

        public void forgotPassword(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found with this email"));

                String token = UUID.randomUUID().toString();
                user.setPasswordResetToken(token);
                user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
                userRepository.save(user);

                emailService.sendPasswordResetEmail(user.getEmail(), token);
        }

        public void resetPassword(String token, String newPassword) {
                User user = userRepository.findByPasswordResetToken(token)
                                .orElseThrow(() -> new RuntimeException("Invalid password reset token"));

                if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Password reset token has expired");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                user.setPasswordResetToken(null);
                user.setPasswordResetTokenExpiry(null);
                userRepository.save(user);
        }

        public JwtResponse authenticateUser(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = tokenProvider.generateToken(authentication);

                List<String> roles = authentication.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

                User user = userRepository.findByUsername(request.username())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                com.example.auth.entity.RefreshToken refreshToken = refreshTokenService
                                .createRefreshToken(user.getUsername());

                return new JwtResponse(jwt, refreshToken.getToken(), user.getUsername(), user.getEmail(),
                                user.getProfilePicture(), roles);
        }

        public com.example.auth.dto.TokenRefreshResponse refreshToken(
                        com.example.auth.dto.TokenRefreshRequest request) {
                String requestRefreshToken = request.refreshToken();

                return refreshTokenService.findByToken(requestRefreshToken)
                                .map(refreshTokenService::verifyExpiration)
                                .map(com.example.auth.entity.RefreshToken::getUser)
                                .map(user -> {
                                        String roles = user.getRoles().stream()
                                                        .map(role -> role.getName().name())
                                                        .collect(Collectors.joining(","));
                                        String token = tokenProvider.generateTokenFromUsername(user.getUsername(),
                                                        roles);
                                        return new com.example.auth.dto.TokenRefreshResponse(token,
                                                        requestRefreshToken);
                                })
                                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
        }

        @Transactional
        public void promoteToAdmin(com.example.auth.dto.PromotionRequest request) {
                if (!adminPromotionKey.equals(request.secretKey())) {
                        throw new RuntimeException("Invalid promotion secret key!");
                }

                User user = userRepository.findByUsername(request.username())
                                .orElseThrow(() -> new RuntimeException("User not found: " + request.username()));

                Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Role ADMIN not found"));

                user.getRoles().add(adminRole);
                userRepository.save(user);
        }

        public JwtResponse getCurrentUser() {
                System.out.println("AuthService.getCurrentUser() called");
                Authentication authentication = SecurityContextHolder
                                .getContext().getAuthentication();
                System.out.println(
                                "AuthService: Authentication object: "
                                                + (authentication != null ? authentication.getName() : "NULL"));

                if (authentication == null || !authentication.isAuthenticated()) {
                        System.err.println("AuthService: User not authenticated!");
                        throw new RuntimeException("Error: User not authenticated.");
                }

                String username = authentication.getName();
                System.out.println("AuthService: Fetching user details for: " + username);

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                System.out.println("AuthService: User found: " + user.getUsername() + ", email: " + user.getEmail());

                List<String> roles = user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toList());

                System.out.println("AuthService: User roles: " + roles);

                return new JwtResponse("", "", user.getUsername(), user.getEmail(), user.getProfilePicture(), roles);
        }

        public JwtResponse updateProfile(com.example.auth.dto.UpdateProfileRequest request) {
                System.out.println("AuthService.updateProfile() called");
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String currentUsername = authentication.getName();

                User user = userRepository.findByUsername(currentUsername)
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                if (request.username() != null && !request.username().equals(currentUsername)) {
                        if (userRepository.existsByUsername(request.username())) {
                                throw new RuntimeException("Error: Username is already taken!");
                        }
                        user.setUsername(request.username());
                }

                if (request.email() != null && !request.email().equals(user.getEmail())) {
                        if (userRepository.findByEmail(request.email()).isPresent()) {
                                throw new RuntimeException("Error: Email is already in use!");
                        }
                        user.setEmail(request.email());
                }

                if (request.profilePicture() != null) {
                        user.setProfilePicture(request.profilePicture());
                }

                userRepository.save(user);
                System.out.println("Profile updated for user: " + user.getUsername());

                List<String> roles = user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toList());

                return new JwtResponse("", "", user.getUsername(), user.getEmail(), user.getProfilePicture(), roles);
        }

        public void changePassword(com.example.auth.dto.ChangePasswordRequest request) {
                System.out.println("AuthService.changePassword() called");
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                        throw new RuntimeException("Error: Current password is incorrect!");
                }

                user.setPassword(passwordEncoder.encode(request.newPassword()));
                userRepository.save(user);
                System.out.println("Password changed for user: " + username);
        }

        public void updatePreferences(com.example.auth.dto.UserPreferencesRequest request) {
                System.out.println("AuthService.updatePreferences() called");
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        String preferencesJson = mapper.writeValueAsString(request);
                        user.setPreferences(preferencesJson);
                        userRepository.save(user);
                        System.out.println("Preferences updated for user: " + username);
                } catch (Exception e) {
                        throw new RuntimeException("Error: Failed to save preferences - " + e.getMessage());
                }
        }

        public void deleteAccount() {
                System.out.println("AuthService.deleteAccount() called");
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Error: User not found."));

                userRepository.delete(user);
                System.out.println("Account deleted for user: " + username);
        }
}
