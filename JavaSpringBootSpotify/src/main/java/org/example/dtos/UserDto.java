// ===== dtos/UserDto.java =====
package org.example.dtos;

import org.example.entities.Gender;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

public record UserDto(
        Long id,
        String email,
        String username,
        String fullName,
        LocalDate birthDate,
        Gender gender,
        String image,
        Instant premiumUntil,
        Set<String> roles) {}