package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.DTOs.GenreDto;
import org.example.services.GenreService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/genres")
public class GenreController {
    private final GenreService genreService;

    @GetMapping
    public String list(Model model) {
        model.addAttribute("genres", genreService.getAll());
        return "genres/list";
    }

    @GetMapping("/create")
    public String createForm(Model model) {
        model.addAttribute("genre", new GenreDto());
        return "genres/create";
    }

    @PostMapping("/create")
    public String create(@ModelAttribute("genre") GenreDto genreDto) {
        genreService.create(genreDto);
        return "redirect:/genres";
    }
    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("genre", genreService.getById(id));
        return "genres/edit";
    }

    @PostMapping("/edit/{id}")
    public String edit(@PathVariable Long id, @ModelAttribute GenreDto genreDto) {
        genreService.update(id, genreDto);
        return "redirect:/genres";
    }

    @GetMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        genreService.delete(id);
        return "redirect:/genres";
    }
}
