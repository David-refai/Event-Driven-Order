package com.example.auth.service;

import com.example.auth.dto.UserDTO;
import com.example.auth.entity.Role;
import com.example.auth.entity.User;
import com.example.auth.repository.RoleRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
            FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(Role.RoleName.valueOf(roleName))
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return convertToDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDTO.email() != null)
            user.setEmail(userDTO.email());
        if (userDTO.username() != null)
            user.setUsername(userDTO.username());

        return convertToDTO(userRepository.save(user));
    }

    @Transactional
    public UserDTO updateProfilePicture(Long userId, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String fileName = fileStorageService.storeFile(file);

        // Construct the full URL for the image
        // Assuming uploads are served from /uploads/profiles/
        // We'll configure WebMvcConfig to serve this path
        String fileUrl = "/uploads/profiles/" + fileName;

        user.setProfilePicture(fileUrl);
        return convertToDTO(userRepository.save(user));
    }

    private UserDTO convertToDTO(User user) {
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
        return new UserDTO(user.getId(), user.getUsername(), user.getEmail(), user.getProfilePicture(), roles);
    }
}
