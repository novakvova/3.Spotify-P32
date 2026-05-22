package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.GenreDto;
import org.example.services.GenreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.dtos.CreateGenreDto;
import org.example.dtos.UpdateGenreDto;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/genres")
@Tag(name = "Genres", description = "Genre Management API")
public class GenreController {
    private final GenreService genreService;

    // ОТРИМАТИ ВСІ ЖАНРИ
    @GetMapping
    @Operation(summary = "Get all genres", description = "Retrieve list of all music genres")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<GenreDto>> getAll() {
        List<GenreDto> genres = genreService.getAll();
        return ResponseEntity.ok(genres);
    }

    // ОТРИМАТИ ЖАНР ПО ID
    @GetMapping("/{id}")
    @Operation(summary = "Get genre by ID", description = "Retrieve a specific genre by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Genre found"),
            @ApiResponse(responseCode = "404", description = "Genre not found")
    })
    public ResponseEntity<GenreDto> getById(@PathVariable Long id) {
        GenreDto genre = genreService.getById(id);
        if (genre == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(genre);
    }

    // СТВОРИТИ НОВИЙ ЖАНР
    @PostMapping
    @Operation(summary = "Create new genre", description = "Create a new music genre")
    @ApiResponse(responseCode = "201", description = "Genre created successfully")
    public ResponseEntity<GenreDto> create(@RequestBody CreateGenreDto genreDto) {
        GenreDto created = genreService.create(genreDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ОНОВИТИ ЖАНР
    @PutMapping("/{id}")
    @Operation(summary = "Update genre", description = "Update an existing genre")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Genre updated successfully"),
            @ApiResponse(responseCode = "404", description = "Genre not found")
    })
    public ResponseEntity<GenreDto> update(@PathVariable Long id, @RequestBody UpdateGenreDto genreDto) {
        GenreDto updated = genreService.update(id, genreDto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ВИДАЛИТИ ЖАНР
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete genre", description = "Delete a genre by ID")
    @ApiResponse(responseCode = "204", description = "Genre deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        genreService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
