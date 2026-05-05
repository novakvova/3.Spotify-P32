// package org.example.controller;

// import lombok.RequiredArgsConstructor;
// import org.example.services.SongService;
// import org.springframework.stereotype.Controller;
// import org.springframework.ui.Model;
// import org.springframework.web.bind.annotation.GetMapping;

// @Controller
// @RequiredArgsConstructor
// public class SongController {
//     private final SongService songService;

//     @GetMapping("/songs")
//     public String index(Model model) {
//         //Список усіх жанрів
//         var list = songService.getAllSongs();
//         model.addAttribute("songs", list);
//         return "songs/index";
//     }
// }
