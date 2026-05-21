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
}
