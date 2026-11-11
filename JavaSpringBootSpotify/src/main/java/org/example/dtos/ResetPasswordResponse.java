package org.example.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Результат зміни паролю")
public record ResetPasswordResponse(

        @Schema(description = "Повідомлення для користувача")
        String message
) {
}
