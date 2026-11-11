package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Результат запиту посилання для відновлення паролю")
public record ForgotPasswordResponse(

        @Schema(
                description = "Запит прийнято (відповідь однакова для наявних і невідомих адрес)",
                example = "true")
        boolean sent,

        @Schema(
                description = "Посилання лише для dev-середовища (app.dev.expose-reset-link=true)",
                nullable = true,
                accessMode = Schema.AccessMode.READ_ONLY)
        String devLink
) {
}
