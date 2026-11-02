package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.AuthResponse;
import org.example.dtos.EmailCheckRequest;
import org.example.dtos.EmailCheckResponse;
import org.example.dtos.RegisterRequest;
import org.example.exceptions.AuthException;
import org.example.services.RegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegistrationService registrationService;

    @PostMapping("/email-check")
    public ResponseEntity<EmailCheckResponse> emailCheck(@Valid @RequestBody EmailCheckRequest request) {
        if (!registrationService.isEmailAvailable(request.email())) {
            throw AuthException.emailTaken();
        }
        return ResponseEntity.ok(new EmailCheckResponse(true));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = registrationService.register(request);
        log.info("Registered user id={}", response.user().id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}