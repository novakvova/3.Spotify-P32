package org.example.dtos;

import lombok.Getter;
import lombok.Setter;
import org.example.entities.Gender;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class AdminCreateUserDto {
    private String email;
    private String username;
    private String fullName;
    private LocalDate birthDate;
    private Gender gender;
    private String password;
    private Set<String> roles;
    private boolean blocked = false;
}