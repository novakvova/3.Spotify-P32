package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Запит на надсилання посилання для відновлення паролю")
public record ForgotPasswordRequest(

        @Schema(
                description = "Адреса електронної пошти користувача",
                example = "user@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Введіть коректну адресу електронної пошти")
        @Email(message = "Введіть коректну адресу електронної пошти")
        @Size(max = 100, message = "Введіть коректну адресу електронної пошти")
        String email
) {
}
