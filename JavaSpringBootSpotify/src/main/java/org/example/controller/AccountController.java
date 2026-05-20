package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.example.dtos.LoginDto;
import org.example.services.AccountService;

import java.util.Map;
import jakarta.validation.Valid;

// ОПТИМІЗАЦІЯ: використання Slf4j логера замість java.util.logging
@Slf4j
@RestController
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    // @GetMapping("/login")
    // public String login() {
    // return "account/login";
    // }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        log.info("Received login request for username: {}", loginDto.getUsername());
        try {
            String token = accountService.login(loginDto);
            // ОПТИМІЗАЦІЯ: заміна HashMap на Map.of() для неізмінної карти
            Map<String, Object> response = Map.of(
                "token", token,
                "message", "Login successful"
            );
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } catch (Exception e) {
            // ОПТИМІЗАЦІЯ: заміна HashMap на Map.of()
            Map<String, String> errorResponse = Map.of("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

}
