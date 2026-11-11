package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.*;
import org.example.exceptions.AuthException;
import org.example.services.LoginService;
import org.example.services.PasswordResetService;
import org.example.services.RegistrationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Реєстрація, вхід та відновлення паролю")
@SecurityRequirements
public class AuthController {

    private final RegistrationService registrationService;
    private final LoginService loginService;
    private final PasswordResetService passwordResetService;

    @Value("${app.dev.expose-code:false}")
    private boolean exposeCode;

    @Value("${app.dev.expose-reset-link:false}")
    private boolean exposeResetLink;

    @Operation(
            summary = "Перевірити доступність email",
            description = "Використовується на першому кроці реєстрації, щоб не допустити дубль акаунта.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Адреса вільна"),
            @ApiResponse(responseCode = "409", description = "Адреса вже зареєстрована (EMAIL_TAKEN)"),
            @ApiResponse(responseCode = "400", description = "Некоректний формат email (VALIDATION_ERROR)")
    })
    @PostMapping("/email-check")
    public ResponseEntity<EmailCheckResponse> emailCheck(@Valid @RequestBody EmailCheckRequest request) {
        if (!registrationService.isEmailAvailable(request.email())) {
            throw AuthException.emailTaken();
        }
        return ResponseEntity.ok(new EmailCheckResponse(true));
    }

    @Operation(
            summary = "Зареєструвати користувача",
            description = "Створює акаунт і одразу повертає JWT access-токен.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Акаунт створено"),
            @ApiResponse(responseCode = "409", description = "Email уже зайнятий (EMAIL_TAKEN)"),
            @ApiResponse(responseCode = "400", description = "Помилка валідації (VALIDATION_ERROR)")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(request));
    }

    @Operation(
            summary = "Надіслати код входу на email",
            description = "Генерує 4-значний одноразовий код. Для невідомої адреси відповідь така сама (sent=true).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Запит прийнято"),
            @ApiResponse(responseCode = "429", description = "Код уже надіслано, повторіть за хвилину (CODE_RESEND_TOO_SOON)")
    })
    @PostMapping("/login/email")
    public ResponseEntity<LoginStartResponse> loginEmail(@Valid @RequestBody LoginEmailRequest request) {
        String code = loginService.startEmailLogin(request.email());
        String devCode = (exposeCode && code != null) ? code : null;
        return ResponseEntity.ok(new LoginStartResponse(true, devCode));
    }

    @Operation(
            summary = "Увійти за кодом з email",
            description = "Перевіряє одноразовий код і повертає JWT access-токен.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успішний вхід"),
            @ApiResponse(responseCode = "400", description = "Недійсний код (CODE_INVALID)"),
            @ApiResponse(responseCode = "429", description = "Перевищено кількість спроб (CODE_ATTEMPTS_EXCEEDED)")
    })
    @PostMapping("/login/code")
    public ResponseEntity<AuthResponse> loginCode(@Valid @RequestBody LoginCodeRequest request) {
        return ResponseEntity.ok(loginService.loginWithCode(request.email(), request.code()));
    }

    @Operation(
            summary = "Увійти за паролем",
            description = "Перевіряє email і пароль та повертає JWT access-токен.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успішний вхід"),
            @ApiResponse(responseCode = "401", description = "Неправильні облікові дані (INVALID_CREDENTIALS)")
    })
    @PostMapping("/login/password")
    public ResponseEntity<AuthResponse> loginPassword(@Valid @RequestBody PasswordLoginRequest request) {
        return ResponseEntity.ok(loginService.loginWithPassword(request.email(), request.password()));
    }

    @Operation(
            summary = "Запросити посилання для відновлення паролю",
            description = """
                    Якщо акаунт із такою адресою існує, надсилає лист із посиланням на сторінку
                    встановлення нового паролю. Посилання має обмежений термін дії та одноразове.
                    Відповідь однакова для наявних і невідомих адрес, щоб не розкривати існування акаунта.""")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Запит прийнято"),
            @ApiResponse(responseCode = "400", description = "Некоректний email (VALIDATION_ERROR)")
    })
    @PostMapping("/password/forgot")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String link = passwordResetService.requestResetLink(request.email());
        String devLink = (exposeResetLink && link != null) ? link : null;
        return ResponseEntity.ok(new ForgotPasswordResponse(true, devLink));
    }

    @Operation(
            summary = "Встановити новий пароль",
            description = """
                    Змінює пароль за токеном із посилання. Пароль має містити 10–72 символи,
                    щонайменше одну літеру та одне число або спеціальний символ.""")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пароль змінено"),
            @ApiResponse(responseCode = "400", description = "Пароль не відповідає вимогам або збігається зі старим"),
            @ApiResponse(responseCode = "401", description = "Reset-токен недійсний або прострочений (RESET_TOKEN_INVALID)")
    })
    @PostMapping("/password/reset")
    public ResponseEntity<ResetPasswordResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.resetToken(), request.newPassword());
        return ResponseEntity.ok(new ResetPasswordResponse(
                "Пароль успішно змінено. Увійдіть із новим паролем."));
    }
}
