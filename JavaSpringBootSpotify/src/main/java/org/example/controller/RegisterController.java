package org.example.controller;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;

import org.example.dtos.RegisterDto;
import org.example.services.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.logging.Logger;

@Controller
@RequiredArgsConstructor
public class RegisterController {
    private final AccountService accountService;
    Logger log = Logger.getLogger(RegisterController.class.getName());

    // @GetMapping("/register")
    // public String registerForm(Model model) {
    //     model.addAttribute("registerDto", new RegisterDto());
    //     return "account/register";
    // }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(@RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("confirmPassword") String confirmPassword,
            @RequestParam("image") MultipartFile image) {
        log.info("Received registration request for username: " + username);
        try {
            RegisterDto dto = new RegisterDto();
            dto.setUsername(username);
            dto.setEmail(email);
            dto.setPassword(password);
            dto.setConfirmPassword(confirmPassword);
            dto.setImage(image);
            String token = accountService.register(dto);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Registration successful");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.severe("Registration failed: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

}
