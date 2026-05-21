package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.AlbumDto;
import org.example.services.AlbumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/albums")
@Tag(name = "Albums", description = "Album Management API")
public class AlbumController {
    private final AlbumService albumService;

    // ОТРИМАТИ ВСІ АЛЬБОМИ
    @GetMapping
    @Operation(summary = "Get all albums", description = "Retrieve list of all albums")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<AlbumDto>> getAll() {
        List<AlbumDto> albums = albumService.getAll();
        return ResponseEntity.ok(albums);
    }

    // ОТРИМАТИ АЛЬБОМ ПО ID
    @GetMapping("/{id}")
    @Operation(summary = "Get album by ID", description = "Retrieve a specific album by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Album found"),
            @ApiResponse(responseCode = "404", description = "Album not found")
    })
    public ResponseEntity<AlbumDto> getById(@PathVariable Long id) {
        AlbumDto album = albumService.getById(id);
        if (album == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(album);
    }

    // СТВОРИТИ НОВИЙ АЛЬБОМ
    @PostMapping
    @Operation(summary = "Create new album", description = "Create a new album")
    @ApiResponse(responseCode = "201", description = "Album created successfully")
    public ResponseEntity<AlbumDto> create(@RequestBody AlbumDto dto) {
        AlbumDto created = albumService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ОНОВИТИ АЛЬБОМ
    @PutMapping("/{id}")
    @Operation(summary = "Update album", description = "Update an existing album")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Album updated successfully"),
            @ApiResponse(responseCode = "404", description = "Album not found")
    })
    public ResponseEntity<AlbumDto> update(@PathVariable Long id, @RequestBody AlbumDto dto) {
        AlbumDto updated = albumService.update(id, dto);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // ВИДАЛИТИ АЛЬБОМ
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete album", description = "Delete an album by ID")
    @ApiResponse(responseCode = "204", description = "Album deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        albumService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
