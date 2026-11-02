package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.data.constants.RolesConstants;
import org.example.dtos.AuthResponse;
import org.example.dtos.RegisterRequest;
import org.example.entities.Gender;
import org.example.entities.UserEntity;
import org.example.exceptions.AuthException;
import org.example.mappers.UserMapper;
import org.example.repositories.IRoleRepository;
import org.example.repositories.IUserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String rawEmail) {
        return userRepository.findByEmailIgnoreCase(normalize(rawEmail)).isEmpty();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw AuthException.emailTaken();
        }

        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setUsername(uniqueUsername(email));
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setBirthDate(request.birthDate());
        user.setGender(request.gender() == null ? Gender.UNDISCLOSED : request.gender());
        user.setImage(null);

        user.getRoles().add(roleRepository.findByName(RolesConstants.UserRole)
                .orElseThrow(() -> new IllegalStateException(
                        "Роль '" + RolesConstants.UserRole + "' відсутня в таблиці roles")));

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // два одночасні сабміти пройшли перевірку вище — рятує UNIQUE-індекс
            throw AuthException.emailTaken();
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.bearer(token, UserMapper.toDto(user));
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String uniqueUsername(String email) {
        String local = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9._-]", "");
        if (local.length() < 3) {
            local = "user" + local;
        }
        String candidate = local;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = local + (++suffix);
        }
        return candidate;
    }
}