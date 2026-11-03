package org.example.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginCodeRequest(
        @NotBlank @Email(message = "Введіть коректну адресу електронної пошти")
        String email,

        @NotBlank(message = "Цей код недійсний. Перевірте код і повторіть спробу")
        @Pattern(regexp = "\\d{4}", message = "Цей код недійсний. Перевірте код і повторіть спробу")
        String code) {}