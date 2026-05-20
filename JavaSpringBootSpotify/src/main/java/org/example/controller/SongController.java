package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.SongItemDto;
import org.example.services.SongServiceImpl;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/songs")
@Tag(name = "Songs", description = "Song Management API")
public class SongController {
    private final SongServiceImpl songService;

    // ОТРИМАТИ ВСІ ПІСНІ
    @GetMapping
    @Operation(summary = "Get all songs", description = "Retrieve list of all songs")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<SongItemDto>> getAll() {
        List<SongItemDto> songs = songService.getAllSongs();
        return ResponseEntity.ok(songs);
    }

    // ОТРИМАТИ ПІСНІ ЗІ СТОРІНКУВАННЯМ
    @GetMapping("/page")
    @Operation(summary = "Get songs with pagination", description = "Retrieve songs with pagination support")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<Page<SongItemDto>> getSongsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<SongItemDto> songsPage = songService.getSongsPage(page, size);
        return ResponseEntity.ok(songsPage);
    }

    // ОТРИМАТИ ПІСНЮ ПО ID
    @GetMapping("/{id}")
    @Operation(summary = "Get song by ID", description = "Retrieve a specific song by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Song found"),
            @ApiResponse(responseCode = "404", description = "Song not found")
    })
    public ResponseEntity<SongItemDto> getById(@PathVariable Long id) {
        SongItemDto song = songService.getSongById(id);
        if (song == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(song);
    }

    // СТВОРИТИ НОВУ ПІСНЮ
    @PostMapping
    @Operation(summary = "Create new song", description = "Create a new song")
    @ApiResponse(responseCode = "201", description = "Song created successfully")
    public ResponseEntity<SongItemDto> create(@RequestBody SongItemDto dto) {
        SongItemDto created = songService.createSong(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ОНОВИТИ ПІСНЮ
    @PutMapping("/{id}")
    @Operation(summary = "Update song", description = "Update an existing song")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Song updated successfully"),
            @ApiResponse(responseCode = "404", description = "Song not found")
    })
    public ResponseEntity<SongItemDto> update(@PathVariable Long id, @RequestBody SongItemDto dto) {
        SongItemDto updated = songService.updateSong(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ВИДАЛИТИ ПІСНЮ
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete song", description = "Delete a song by ID")
    @ApiResponse(responseCode = "204", description = "Song deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}
