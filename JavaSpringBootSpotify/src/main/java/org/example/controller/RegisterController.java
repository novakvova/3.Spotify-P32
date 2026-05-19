package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dtos.RegisterDto;
import org.example.services.AccountService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequiredArgsConstructor
public class RegisterController {
    private final AccountService accountService;

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("registerDto", new RegisterDto());
        return "account/register";
    }

    @PostMapping("/register")
    public String register(RegisterDto dto, Model model, HttpServletRequest request) {
        try {
            accountService.register(dto, request);
            return "redirect:/";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "account/register";
        }
    }
}
