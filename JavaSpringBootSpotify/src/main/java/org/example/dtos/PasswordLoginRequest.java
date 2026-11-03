package org.example.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordLoginRequest(
        @NotBlank @Email(message = "Введіть коректну адресу електронної пошти")
        String email,

        @NotBlank(message = "Неправильні адреса електронної пошти або пароль")
        String password) {}