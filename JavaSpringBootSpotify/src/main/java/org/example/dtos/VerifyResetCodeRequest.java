package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Перевірка коду з листа для відновлення паролю")
public record VerifyResetCodeRequest(

        @Schema(
                description = "Адреса електронної пошти, на яку надіслано код",
                example = "user@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Введіть коректну адресу електронної пошти")
        @Email(message = "Введіть коректну адресу електронної пошти")
        String email,

        @Schema(
                description = "6-значний код із листа",
                example = "042317",
                requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "Цей код недійсний. Перевірте код і повторіть спробу")
        @Pattern(regexp = "\\d{6}", message = "Цей код недійсний. Перевірте код і повторіть спробу")
        String code
) {
}
