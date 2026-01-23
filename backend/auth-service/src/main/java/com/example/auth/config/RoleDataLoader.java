package com.example.auth.config;

import com.example.auth.entity.Role;
import com.example.auth.entity.Role.RoleName;
import com.example.auth.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RoleDataLoader implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final com.example.auth.repository.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public RoleDataLoader(RoleRepository roleRepository,
            com.example.auth.repository.UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize roles if they don't exist
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(roleName));
            }
        }

        // Initialize admin user if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            com.example.auth.entity.User admin = new com.example.auth.entity.User(
                    "admin",
                    "admin@example.com",
                    passwordEncoder.encode("password123"));

            java.util.Set<Role> roles = new java.util.HashSet<>();
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);

            userRepository.save(admin);
            System.out.println("Seeded admin user: admin / password123");
        }
    }
}
