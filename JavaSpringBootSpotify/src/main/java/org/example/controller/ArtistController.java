package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.ArtistDto;
import org.example.dtos.CreateArtistDto;
import org.example.services.ArtistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.dtos.UpdateArtistDto;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/artists")
@Tag(name = "Artists", description = "Artist Management API")
public class ArtistController {
    private final ArtistService artistService;

    // ОТРИМАТИ ВСІХ АРТИСТІВ
    @GetMapping
    @Operation(summary = "Get all artists", description = "Retrieve list of all artists")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<ArtistDto>> getAll() {
        List<ArtistDto> artists = artistService.getAll();
        return ResponseEntity.ok(artists);
    }

    // ОТРИМАТИ АРТИСТА ПО ID
    @GetMapping("/{id}")
    @Operation(summary = "Get artist by ID", description = "Retrieve a specific artist by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Artist found"),
            @ApiResponse(responseCode = "404", description = "Artist not found")
    })
    public ResponseEntity<ArtistDto> getById(@PathVariable Long id) {
        ArtistDto artist = artistService.getById(id);
        if (artist == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(artist);
    }

    // СТВОРИТИ НОВОГО АРТИСТА
    @PostMapping
    @Operation(summary = "Create new artist", description = "Create a new artist")
    @ApiResponse(responseCode = "201", description = "Artist created successfully")
    public ResponseEntity<ArtistDto> create(@RequestBody CreateArtistDto dto) {
        ArtistDto created = artistService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ОНОВИТИ АРТИСТА
    @PutMapping("/{id}")
    @Operation(summary = "Update artist", description = "Update an existing artist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Artist updated successfully"),
            @ApiResponse(responseCode = "404", description = "Artist not found")
    })
    public ResponseEntity<ArtistDto> update(@PathVariable Long id, @RequestBody UpdateArtistDto dto) {
        ArtistDto updated = artistService.update(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ВИДАЛИТИ АРТИСТА
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete artist", description = "Delete an artist by ID")
    @ApiResponse(responseCode = "204", description = "Artist deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ПОШУК АРТИСТІВ ЗА ІМ'ЯМ
    @GetMapping("/search")
    @Operation(summary = "Search artists by name", description = "Search for artists by their name")
    @ApiResponse(responseCode = "200", description = "Successful")
    public ResponseEntity<List<ArtistDto>> search(@RequestParam String name) {
        List<ArtistDto> artists = artistService.searchByName(name);
        return ResponseEntity.ok(artists);
    }
}
