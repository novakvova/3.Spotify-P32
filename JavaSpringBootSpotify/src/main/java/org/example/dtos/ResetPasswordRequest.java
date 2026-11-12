package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.example.validation.ValidPassword;

@Schema(description = "Встановлення нового паролю за посиланням із листа")
public record ResetPasswordRequest(

        @Schema(
                description = "Токен із посилання для відновлення паролю",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Посилання для відновлення паролю недійсне")
        String resetToken,

        @Schema(
                description = "Новий пароль: 10–72 символи, мінімум 1 літера та 1 число/спецсимвол",
                example = "newStrongPass1!",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Пароль обов'язковий")
        @ValidPassword
        String newPassword
) {
}
