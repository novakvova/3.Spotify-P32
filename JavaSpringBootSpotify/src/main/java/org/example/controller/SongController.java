package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.services.SongService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class SongController {
    private final SongService songService;

    @GetMapping("/songs")
    public String index(@RequestParam(defaultValue = "0") int page, Model model) {
        // ОПТИМІЗАЦІЯ: видалено невикористаний параметр page та закоментований код
        return "songs/index";
    }
}
