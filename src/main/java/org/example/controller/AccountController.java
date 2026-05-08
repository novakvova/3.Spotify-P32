package org.example.controller;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@AllArgsConstructor
public class AccountController {

    @GetMapping("/login")
    public String login() {
        return "account/login";
    }
}
 