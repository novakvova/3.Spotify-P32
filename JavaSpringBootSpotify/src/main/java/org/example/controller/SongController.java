package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dtos.SongItemDto;
import org.example.services.SongService;
import org.springframework.data.domain.Page;
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
        //Список усіх жанрів
        // Page<SongItemDto> songsPage = songService.getSongsPage(page, 10);
        // model.addAttribute("songsPage", songsPage);
        return "songs/index";
    }
}
