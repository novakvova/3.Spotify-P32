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


    public static AuthException invalidCode() {
        return new AuthException("CODE_INVALID", "code",
            "Цей код недійсний. Перевірте код і повторіть спробу",
            HttpStatus.BAD_REQUEST);
    }

    public static AuthException tooManyAttempts() {
        return new AuthException("CODE_ATTEMPTS_EXCEEDED", "code",
            "Забагато спроб. Запросіть новий код",
            HttpStatus.TOO_MANY_REQUESTS);
    }

    public static AuthException resendTooSoon() {
        return new AuthException("CODE_RESEND_TOO_SOON", "email",
            "Код уже надіслано. Спробуйте за хвилину",
            HttpStatus.TOO_MANY_REQUESTS);
    }

    public static AuthException invalidCredentials() {
        return new AuthException("INVALID_CREDENTIALS", "password",
            "Неправильні адреса електронної пошти або пароль",
            HttpStatus.UNAUTHORIZED);
    }
}