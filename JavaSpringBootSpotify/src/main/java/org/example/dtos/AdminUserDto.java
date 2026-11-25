package org.example.dtos;

import lombok.Getter;
import lombok.Setter;
import org.example.entities.Gender;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class AdminUserDto {
    private Long id;
    private String email;
    private String username;
    private String fullName;
    private LocalDate birthDate;
    private Gender gender;
    private String image;
    private boolean blocked;
    private Instant premiumUntil;
    private Instant createdAt;
    private Set<String> roles;
}