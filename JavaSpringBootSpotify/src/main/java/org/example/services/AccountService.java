package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.RegisterDto;
import org.example.entities.RoleEntity;
import org.example.entities.UserEntity;
import org.example.repositories.IUserRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import org.example.data.constants.RolesConstants;
import org.example.repositories.IRoleRepository;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public String register(RegisterDto dto) {
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
                new SaveUserImageService().saveUserImage(dto.getImage(), dto.getUsername());
                user.setImage(dto.getUsername() + ".jpg");
            } catch (Exception e) {
                throw new RuntimeException("Failed to save user image", e);
            }
        }

        RoleEntity roleUser = roleRepository.findByName(RolesConstants.UserRole).orElseThrow(()->new RuntimeException("User role not found"));
        user.getRoles().add(roleUser);

        UserEntity savedUser = userRepository.save(user);

        JwtUtil jwtUtil = new JwtUtil();
        String token = jwtUtil.generateToken(savedUser.getUsername());
        return token;
    }
}
