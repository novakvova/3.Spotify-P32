package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dtos.*;
import org.example.dtos.analytics.TrackPlayRequestDto;
import org.example.dtos.analytics.TrackPlayResponseDto;
import org.example.services.PlayTrackingService;
import org.example.services.SongService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/songs")
@Tag(name = "Songs", description = "Song Management API")
public class SongController {
    private final SongService songService;
    private final PlayTrackingService playTrackingService;

    @GetMapping
    @Operation(summary = "Get all songs", description = "Retrieve list of all songs")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<List<SongItemDto>> getAll() {
        List<SongItemDto> songs = songService.getAllSongs();
        return ResponseEntity.ok(songs);
    }

    @GetMapping("/page")
    @Operation(summary = "Get songs with pagination", description = "Retrieve songs with pagination support")
    @ApiResponse(responseCode = "200", description = "Successful retrieval")
    public ResponseEntity<Page<SongItemDto>> getSongsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<SongItemDto> songsPage = songService.getSongsPage(page, size);
        return ResponseEntity.ok(songsPage);
    }

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

    @PostMapping("/{id}/play")
    @Operation(summary = "Track real song play", description = "Records a play when listening threshold and anti-spam cooldown are satisfied")
    public ResponseEntity<?> trackPlay(
            @PathVariable Long id,
            @RequestBody(required = false) TrackPlayRequestDto request,
            @RequestHeader(value = "X-Forwarded-For", required = false) String forwardedFor,
            HttpServletRequest httpServletRequest
    ) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String clientKey = (auth != null && auth.isAuthenticated()
                    && auth.getPrincipal() != null
                    && !"anonymousUser".equals(auth.getPrincipal()))
                    ? auth.getName()
                    : resolveClientIp(forwardedFor, httpServletRequest);

            TrackPlayResponseDto response = playTrackingService.trackPlay(id, clientKey, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Помилка: " + e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create new song", description = "Create a new song with audio file and optional cover image converted to WebP")
    @ApiResponse(responseCode = "201", description = "Song created successfully")
    public ResponseEntity<?> create(
            @RequestParam String name,
            @RequestParam String artist_name,
            @RequestParam String album_title,
            @RequestParam(required = false) String genres_names,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "cover", required = false) MultipartFile cover) {
        try {
            log.info("Отримано запит на створення пісні: {}", name);

            List<String> genresList = genres_names != null && !genres_names.isEmpty()
                    ? Arrays.asList(genres_names.split(","))
                    : List.of();

            CreateSongDto dto = new CreateSongDto();
            dto.setName(name);
            dto.setArtistName(artist_name);
            dto.setAlbumTitle(album_title);
            dto.setGenres(genresList);

            SongItemDto createdSong = songService.createSong(dto, file, cover);

            log.info("Пісня успішно створена з ID: {}", createdSong.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSong);
        } catch (IllegalArgumentException e) {
            log.warn("Помилка валідації: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Помилка: " + e.getMessage());
        } catch (RuntimeException e) {
            log.error("Помилка при створенні пісні: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Помилка при створенні пісні: " + e.getMessage());
        } catch (Exception e) {
            log.error("Неочікувана помилка: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Неочікувана помилка: " + e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update song", description = "Update an existing song and optionally replace cover image (converted to WebP)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Song updated successfully"),
            @ApiResponse(responseCode = "404", description = "Song not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String artist_name,
            @RequestParam(required = false) String album_title,
            @RequestParam(required = false) String genres_names,
            @RequestPart(value = "cover", required = false) MultipartFile cover) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest().body("ID пісні невалідне");
            }
            log.info("Отримано запит на оновлення пісні з ID: {}", id);

            List<String> genresList = genres_names != null && !genres_names.isBlank()
                    ? Arrays.asList(genres_names.split(","))
                    : null;

            SongItemDto dto = new SongItemDto();
            dto.setName(name);
            dto.setArtist_name(artist_name);
            dto.setAlbum_title(album_title);
            dto.setGenres_names(genresList);

            SongItemDto updated = songService.updateSong(id, dto, cover);
            if (updated == null) {
                log.warn("Пісня з ID {} не знайдена", id);
                return ResponseEntity.notFound().build();
            }

            log.info("Пісня з ID {} успішно оновлена", id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Помилка при оновленні пісні: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Помилка: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete song", description = "Delete a song by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Song deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Song not found")
    })
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest().body("ID пісні невалідне");
            }
            log.info("Отримано запит на видалення пісні з ID: {}", id);

            if (songService.getSongById(id) == null) {
                log.warn("Пісня з ID {} не знайдена", id);
                return ResponseEntity.notFound().build();
            }

            songService.deleteSong(id);
            log.info("Пісня з ID {} успішно видалена", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Помилка при видаленні пісні: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Помилка при видаленні: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search songs by name", description = "Search for songs by their name")
    @ApiResponse(responseCode = "200", description = "Successful")
    public ResponseEntity<List<SongItemDto>> search(@RequestParam String name) {
        return ResponseEntity.ok(songService.searchByName(name));
    }

    @GetMapping("/by-album/{albumId}")
    public ResponseEntity<List<SongItemDto>> getSongsByAlbum(@PathVariable Long albumId) {
        return ResponseEntity.ok(songService.getSongsByAlbum(albumId));
    }

    private String resolveClientIp(String forwardedFor, HttpServletRequest request) {
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}