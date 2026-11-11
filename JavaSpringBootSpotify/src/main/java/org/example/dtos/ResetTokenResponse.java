package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Короткоживучий токен, що дозволяє змінити пароль")
public record ResetTokenResponse(

        @Schema(description = "JWT із призначенням password_reset, дійсний 10 хвилин")
        String resetToken
) {
}
