package org.example.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmailCheckRequest(
        @NotBlank(message = "Введіть коректну адресу електронної пошти")
        @Email(message = "Введіть коректну адресу електронної пошти")
        @Size(max = 100, message = "Введіть коректну адресу електронної пошти")
        String email) {}