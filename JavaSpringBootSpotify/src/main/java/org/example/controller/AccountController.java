package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import io.jsonwebtoken.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.example.dtos.LoginDto;
import org.example.dtos.UpdateProfileDto;
import org.example.services.AccountService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @GetMapping("/profile")
    public ResponseEntity<?> Profile() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Unauthorized"));
        }
        String username = auth.getName();
        var profile = accountService.getProfile(username);
        return ResponseEntity.ok(profile);
    }

   @PutMapping(value = "/profile/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> updateProfile(
        @RequestParam(value = "username", required = false) String username,
        @RequestParam(value = "email", required = false) String email,
        @RequestParam(value = "image", required = false) MultipartFile image) {

    var auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Unauthorized"));
    }

    String currentUsername = auth.getName();

    UpdateProfileDto dto = new UpdateProfileDto();
    dto.setUsername(username);
    dto.setEmail(email);

    var updated = accountService.updateProfile(currentUsername, dto, image);

    return ResponseEntity.ok(updated);
}



}
