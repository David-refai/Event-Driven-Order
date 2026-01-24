package com.example.auth.security;

import com.example.auth.entity.Role;
import com.example.auth.entity.User;
import com.example.auth.repository.RoleRepository;
import com.example.auth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public CustomOAuth2SuccessHandler(JwtTokenProvider tokenProvider,
            UserRepository userRepository,
            RoleRepository roleRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        System.out.println("OAuth2 Login Success for email: " + email);
        System.out.println("OAuth2 Profile Picture URL: " + picture);

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            System.out.println("Existing user found for OAuth2 email: " + user.getUsername());
            // Update profile picture if available
            if (picture != null && !picture.isEmpty()) {
                user.setProfilePicture(picture);
                userRepository.save(user);
                System.out.println("Updated profile picture for user: " + user.getUsername());
            }
            // Ensure existing users have roles, assign ROLE_USER if missing
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                user.setRoles(Collections.singleton(userRole));
                userRepository.save(user);
                System.out.println("Assigned ROLE_USER to existing user: " + user.getUsername());
            }
        } else {
            // Create new user if not exists
            user = new User();
            user.setEmail(email);
            user.setProfilePicture(picture);
            // Generate a readable username from name if available, otherwise email
            String baseUsername = (name != null) ? name.replaceAll("\\s+", "").toLowerCase() : email.split("@")[0];
            String uniqueUsername = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsername(uniqueUsername)) {
                uniqueUsername = baseUsername + counter++;
            }
            user.setUsername(uniqueUsername);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setEnabled(true);

            Role userRole = roleRepository.findByName(Role.RoleName.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            user.setRoles(Collections.singleton(userRole));

            userRepository.save(user);
            System.out.println("Created new user for OAuth2 email: " + user.getUsername());
        }

        String roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.joining(","));

        String jwtToken = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);
        System.out.println("Generated JWT token for OAuth2 user: " + user.getUsername());

        // Redirect to frontend with token and oauth=true parameter
        String redirectUrl = String.format("http://localhost:3000?token=%s&oauth=true", jwtToken);
        System.out.println("Redirecting to: " + redirectUrl);
        response.sendRedirect(redirectUrl);
    }
}
