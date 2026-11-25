package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.ArtistDto;
import org.example.dtos.CreateArtistDto;
import org.example.dtos.UpdateArtistDto;
import org.example.services.ArtistService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/artists")
@Tag(name = "Artists", description = "Artist Management API")
public class ArtistController {
    private final ArtistService artistService;

    @GetMapping
    @Operation(summary = "Get all artists", description = "Retrieve list of all artists")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<ArtistDto>> getAll() {
        List<ArtistDto> artists = artistService.getAll();
        return ResponseEntity.ok(artists);
    }

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create new artist", description = "Create a new artist with optional image converted to WebP")
    @ApiResponse(responseCode = "201", description = "Artist created successfully")
    public ResponseEntity<ArtistDto> create(
            @RequestParam("name") String name,
            @RequestParam(value = "birthDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        CreateArtistDto dto = new CreateArtistDto();
        dto.setName(name);
        dto.setBirthDate(birthDate);

        ArtistDto created = artistService.create(dto, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update artist", description = "Update an existing artist and optionally replace image (converted to WebP)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Artist updated successfully"),
            @ApiResponse(responseCode = "404", description = "Artist not found")
    })
    public ResponseEntity<ArtistDto> update(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "birthDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        UpdateArtistDto dto = new UpdateArtistDto();
        dto.setName(name);
        dto.setBirthDate(birthDate);

        ArtistDto updated = artistService.update(id, dto, image);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete artist", description = "Delete an artist by ID")
    @ApiResponse(responseCode = "204", description = "Artist deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artistService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search artists by name", description = "Search for artists by their name")
    @ApiResponse(responseCode = "200", description = "Successful")
    public ResponseEntity<List<ArtistDto>> search(@RequestParam String name) {
        List<ArtistDto> artists = artistService.searchByName(name);
        return ResponseEntity.ok(artists);
    }
}