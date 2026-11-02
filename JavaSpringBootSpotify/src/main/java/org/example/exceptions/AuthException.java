package org.example.exceptions;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {

    private final String code;
    private final String field;

    @Schema (hidden = true)
    private final HttpStatus status;

    public AuthException(String code, String field, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.field = field;
        this.status = status;
    }

    public static AuthException emailTaken() {
        return new AuthException("EMAIL_TAKEN", "email",
                "Такий користувач уже зареєстрований. Увійдіть або використайте іншу адресу.",
                HttpStatus.CONFLICT);
    }

    public String getCode() { return code; }
    public String getField() { return field; }

    @Schema (hidden = true)
    public HttpStatus getStatus() { return status; }
}