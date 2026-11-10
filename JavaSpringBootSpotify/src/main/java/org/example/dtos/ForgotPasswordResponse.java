package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Результат запиту коду для відновлення паролю")
public record ForgotPasswordResponse(

        @Schema(description = "Код надіслано (відповідь однакова для наявних і невідомих адрес)", example = "true")
        boolean sent,

        @Schema(
                description = "Код лише для dev-середовища (app.dev.expose-code=true)",
                nullable = true,
                accessMode = Schema.AccessMode.READ_ONLY)
        String devCode
) {
}
