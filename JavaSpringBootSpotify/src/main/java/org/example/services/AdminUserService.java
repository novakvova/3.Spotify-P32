package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.data.constants.RolesConstants;
import org.example.dtos.AdminCreateUserDto;
import org.example.dtos.AdminUserDto;
import org.example.entities.Gender;
import org.example.entities.RoleEntity;
import org.example.entities.UserEntity;
import org.example.repositories.IRoleRepository;
import org.example.repositories.IUserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final IUserRepository userRepository;
    private final IRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AdminUserDto createUser(AdminCreateUserDto dto) {
        if (dto == null) {
            throw new RuntimeException("Дані користувача не можуть бути порожніми");
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new RuntimeException("Email є обов'язковим");
        }
        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new RuntimeException("Username є обов'язковим");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("Пароль є обов'язковим");
        }

        String normalizedEmail = dto.getEmail().trim().toLowerCase();
        String normalizedUsername = dto.getUsername().trim();

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new RuntimeException("Користувач з таким email уже існує");
        }

        UserEntity user = new UserEntity();
        user.setEmail(normalizedEmail);
        user.setUsername(normalizedUsername);
        user.setFullName(dto.getFullName() != null && !dto.getFullName().isBlank()
                ? dto.getFullName().trim()
                : normalizedUsername);
        user.setBirthDate(dto.getBirthDate() != null ? dto.getBirthDate() : LocalDate.of(2000, 1, 1));
        user.setGender(dto.getGender() != null ? dto.getGender() : Gender.UNDISCLOSED);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setBlocked(dto.isBlocked());
        user.setRoles(resolveRoles(dto.getRoles()));

        UserEntity saved = userRepository.save(user);
        return toDto(saved);
    }

    @Transactional
    public AdminUserDto updateRoles(Long targetUserId, Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new RuntimeException("Список ролей не може бути порожнім");
        }

        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено з ID: " + targetUserId));

        Set<RoleEntity> newRoles = resolveRoles(roleNames);

        UserEntity currentAdmin = getCurrentUserOrNull();
        if (currentAdmin != null && currentAdmin.getId().equals(targetUser.getId())) {
            boolean stillHasAdmin = newRoles.stream()
                    .anyMatch(r -> RolesConstants.AdminRole.equalsIgnoreCase(r.getName())
                            || "ADMIN".equalsIgnoreCase(r.getName()));
            if (!stillHasAdmin) {
                throw new RuntimeException("Неможливо зняти роль адміністратора з власного акаунту");
            }
        }

        targetUser.setRoles(newRoles);
        return toDto(userRepository.save(targetUser));
    }

    @Transactional
    public AdminUserDto setBlocked(Long targetUserId, boolean blocked) {
        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено з ID: " + targetUserId));

        UserEntity currentAdmin = getCurrentUserOrNull();
        if (currentAdmin != null && currentAdmin.getId().equals(targetUser.getId()) && blocked) {
            throw new RuntimeException("Неможливо заблокувати власний акаунт");
        }

        targetUser.setBlocked(blocked);
        return toDto(userRepository.save(targetUser));
    }

    @Transactional
    public void deleteUser(Long targetUserId) {
        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено з ID: " + targetUserId));

        UserEntity currentAdmin = getCurrentUserOrNull();
        if (currentAdmin != null && currentAdmin.getId().equals(targetUser.getId())) {
            throw new RuntimeException("Неможливо видалити власний акаунт");
        }

        userRepository.delete(targetUser);
    }

   private Set<RoleEntity> resolveRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            RoleEntity defaultRole = roleRepository.findByName("USER")
                    .orElseGet(() -> roleRepository.findByName("ROLE_USER")
                            .orElseThrow(() -> new RuntimeException("Роль USER не знайдена в БД")));
            return Set.of(defaultRole);
        }

        Set<RoleEntity> resolved = new HashSet<>();
        for (String rawName : roleNames) {
            if (rawName == null || rawName.isBlank()) {
                continue;
            }
            String trimmed = rawName.trim();
            RoleEntity role = roleRepository.findByName(trimmed)
                    .orElseGet(() -> {
                        String alt = trimmed.startsWith("ROLE_")
                                ? trimmed.substring(5)
                                : "ROLE_" + trimmed;
                        return roleRepository.findByName(alt)
                                .orElseThrow(() -> new RuntimeException("Роль не знайдена: " + trimmed));
                    });
            resolved.add(role);
        }

        if (resolved.isEmpty()) {
            throw new RuntimeException("Не передано жодної валідної ролі");
        }
        return resolved;
    }

    private UserEntity getCurrentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserEntity currentUser) {
            return currentUser;
        }
        return null;
    }

    private AdminUserDto toDto(UserEntity user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setBirthDate(user.getBirthDate());
        dto.setGender(user.getGender());
        dto.setImage(user.getImage());
        dto.setBlocked(user.isBlocked());
        dto.setPremiumUntil(user.getPremiumUntil());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setRoles(user.getRoles() != null
                ? user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet())
                : Set.of());
        return dto;
    }
}