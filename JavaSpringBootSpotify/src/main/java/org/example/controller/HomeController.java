package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.repositories.IGenreRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {
    private final IGenreRepository genreRepository;
    @GetMapping("/")
    public String index(Model model){
        var list = genreRepository.findAll();
        model.addAttribute("genres", list);
        return "index";
    }
}
