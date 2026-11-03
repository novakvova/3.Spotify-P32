package org.example.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginEmailRequest(
        @NotBlank(message = "Введіть коректну адресу електронної пошти")
        @Email(message = "Введіть коректну адресу електронної пошти")
        String email) {}