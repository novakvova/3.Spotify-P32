package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.AlbumDto;
import org.example.dtos.CreateAlbumDto;
import org.example.dtos.UpdateAlbumDto;
import org.example.services.AlbumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/albums")
@Tag(name = "Albums", description = "Album Management API")
public class AlbumController {
    private final AlbumService albumService;

    @GetMapping
    @Operation(summary = "Get all albums", description = "Retrieve list of all albums")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<AlbumDto>> getAll() {
        List<AlbumDto> albums = albumService.getAll();
        return ResponseEntity.ok(albums);
    }

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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create new album", description = "Create a new album with optional cover image converted to WebP")
    @ApiResponse(responseCode = "201", description = "Album created successfully")
    public ResponseEntity<AlbumDto> create(
            @RequestParam("title") String title,
            @RequestParam("releaseYear") Integer releaseYear,
            @RequestParam("artistId") Long artistId,
            @RequestPart(value = "cover", required = false) MultipartFile cover
    ) {
        CreateAlbumDto dto = new CreateAlbumDto();
        dto.setTitle(title);
        dto.setReleaseYear(releaseYear);
        dto.setArtistId(artistId);

        AlbumDto created = albumService.create(dto, cover);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update album", description = "Update album title, releaseYear, artistId, and/or cover image (converted to WebP)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Album updated successfully"),
            @ApiResponse(responseCode = "404", description = "Album not found")
    })
    public ResponseEntity<AlbumDto> update(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "releaseYear", required = false) Integer releaseYear,
            @RequestParam(value = "artistId", required = false) Long artistId,
            @RequestPart(value = "cover", required = false) MultipartFile cover
    ) {
        UpdateAlbumDto dto = new UpdateAlbumDto();
        dto.setTitle(title);
        dto.setReleaseYear(releaseYear);
        dto.setArtistId(artistId);

        AlbumDto updated = albumService.update(id, dto, cover);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload album cover", description = "Upload or replace album cover image converted to WebP")
    @ApiResponse(responseCode = "200", description = "Cover uploaded successfully")
    public ResponseEntity<AlbumDto> uploadCover(
            @PathVariable Long id,
            @RequestPart("cover") MultipartFile cover
    ) {
        AlbumDto updated = albumService.uploadCover(id, cover);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete album", description = "Delete an album by ID")
    @ApiResponse(responseCode = "204", description = "Album deleted successfully")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        albumService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search albums by title", description = "Search for albums by their title")
    @ApiResponse(responseCode = "200", description = "Successful")
    public ResponseEntity<List<AlbumDto>> search(@RequestParam String title) {
        List<AlbumDto> albums = albumService.searchByTitle(title);
        return ResponseEntity.ok(albums);
    }

    @GetMapping("/by-artist/{artistId}")
    @Operation(summary = "Get albums by artist ID", description = "Retrieve all albums of a specific artist by their ID")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<AlbumDto>> getByArtist(@PathVariable Long artistId) {
        List<AlbumDto> albums = albumService.getAlbumsByArtist(artistId);
        return ResponseEntity.ok(albums);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Error: " + ex.getMessage());
    }
}