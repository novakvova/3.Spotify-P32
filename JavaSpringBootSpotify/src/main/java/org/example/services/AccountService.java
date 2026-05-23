package org.example.services;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.example.dtos.*;
import org.example.entities.RoleEntity;
import org.example.entities.UserEntity;
import org.example.repositories.IUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.example.data.constants.RolesConstants;
import org.example.repositories.IRoleRepository;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
// ОПТИМІЗАЦІЯ: видалено непотрібні import'и (UnusedImports)

@Service
@RequiredArgsConstructor
public class AccountService {
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SaveUserImageService imageService;
    private final JwtUtil jwtUtil; // ОПТИМІЗАЦІЯ: впровадження залежності замість створення нових екземплярів

    public Map<String,String> register(RegisterDto dto) {
        UserEntity user = new UserEntity();

        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            try {
                imageService.saveUserImage(dto.getImage(), dto.getUsername());
                user.setImage(dto.getUsername() + ".jpg");
            } catch (Exception e) {

                throw new RuntimeException("Failed to save user image", e);
            }
        }
        else {
            user.setImage("default.jpg");
        }

        RoleEntity roleUser = roleRepository.findByName(RolesConstants.UserRole)
                .orElseThrow(() -> new RuntimeException("User role not found"));
        user.getRoles().add(roleUser);

        UserEntity savedUser = userRepository.save(user);

        // ОПТИМІЗАЦІЯ: використання впровадженого jwtUtil замість створення нового
        return Map.of("token",jwtUtil.generateToken(savedUser.getUsername()),"message","Registration Succesfull");
    }
    public String login(LoginDto dto) {
        UserEntity user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // ОПТИМІЗАЦІЯ: використання впровадженого jwtUtil замість створення нового
        return jwtUtil.generateToken(user.getUsername());
    }
    public ProfileDto getProfile(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProfileDto dto = new ProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setImage("/uploads/medium/" + user.getImage());
        dto.setRoles(
            user.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet()));
        return dto;
    }

    public ProfileDto updateProfile(String currentUsername, UpdateProfileDto dto, MultipartFile image) {

    UserEntity user = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Оновлення текстових даних
    if (dto != null) {
        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            user.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }
    }

    // Оновлення фото
    if (image != null && !image.isEmpty()) {
        try {
            imageService.saveUserImage(image, user.getUsername());
            user.setImage(user.getUsername() + ".jpg");
        } catch (IOException e) {
            throw new RuntimeException("Помилка при збереженні фото: " + e.getMessage());
        }
    }

    userRepository.save(user);

    ProfileDto profile = new ProfileDto();
    profile.setId(user.getId());
    profile.setUsername(user.getUsername());
    profile.setEmail(user.getEmail());
    profile.setImage("/uploads/medium/" + user.getImage());
    profile.setRoles(
            user.getRoles().stream()
                    .map(r -> r.getName())
                    .collect(Collectors.toSet())
    );

    return profile;
}

}
