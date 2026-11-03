package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.*;
import org.example.exceptions.AuthException;
import org.example.services.LoginService;
import org.example.services.RegistrationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;
    private final LoginService loginService;

    @Value("${app.dev.expose-code:false}")
    private boolean exposeCode;

    @PostMapping("/email-check")
    public ResponseEntity<EmailCheckResponse> emailCheck(@Valid @RequestBody EmailCheckRequest request) {
        if (!registrationService.isEmailAvailable(request.email())) {
            throw AuthException.emailTaken();
        }
        return ResponseEntity.ok(new EmailCheckResponse(true));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(request));
    }

    @PostMapping("/login/email")
    public ResponseEntity<LoginStartResponse> loginEmail(@Valid @RequestBody LoginEmailRequest request) {
        String code = loginService.startEmailLogin(request.email());
        String devCode = (exposeCode && code != null) ? code : null;
        return ResponseEntity.ok(new LoginStartResponse(true, devCode));
    }

    @PostMapping("/login/code")
    public ResponseEntity<AuthResponse> loginCode(@Valid @RequestBody LoginCodeRequest request) {
        return ResponseEntity.ok(loginService.loginWithCode(request.email(), request.code()));
    }

    @PostMapping("/login/password")
    public ResponseEntity<AuthResponse> loginPassword(@Valid @RequestBody PasswordLoginRequest request) {
        return ResponseEntity.ok(loginService.loginWithPassword(request.email(), request.password()));
    }
}