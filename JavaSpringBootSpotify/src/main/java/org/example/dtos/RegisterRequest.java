package org.example.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import org.example.entities.Gender;
import org.example.validation.ValidPassword;

import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "Введіть коректну адресу електронної пошти")
        @Email(message = "Введіть коректну адресу електронної пошти")
        @Size(max = 100)
        String email,

        @NotBlank(message = "Пароль обов'язковий")
        @ValidPassword
        String password,

        @NotBlank(message = "Вкажіть ім'я")
        @Size(min = 1, max = 120, message = "Ім'я: до 120 символів")
        String fullName,

        @NotNull(message = "Вкажіть дату народження")
        @Past(message = "Дата народження має бути в минулому")
        LocalDate birthDate,

        @NotNull(message = "Оберіть стать")
        Gender gender) {}