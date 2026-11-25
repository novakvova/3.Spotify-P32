package org.example.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.example.dtos.analytics.*;
import org.example.services.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analytics")
@Tag(name = "Platform Analytics", description = "Admin-only overview and detailed analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Get platform overview and analytics (Admin only)")
    public ResponseEntity<PlatformAnalyticsDto> getOverview(
            @RequestParam(defaultValue = "10") int topLimit,
            @RequestParam(defaultValue = "10") int recentLimit
    ) {
        return ResponseEntity.ok(analyticsService.getOverview(topLimit, recentLimit));
    }

    @GetMapping("/songs/plays")
    @Operation(summary = "Get play count for every song in catalog (Admin only)")
    public ResponseEntity<List<SongPlayStatDto>> getAllSongsPlays() {
        return ResponseEntity.ok(analyticsService.getAllSongsPlays());
    }

    @GetMapping("/albums/tracks-count")
    @Operation(summary = "Get tracks count for every album (Admin only)")
    public ResponseEntity<List<AlbumTrackStatDto>> getTracksCountByAlbum() {
        return ResponseEntity.ok(analyticsService.getTracksCountByAlbum());
    }

    @GetMapping("/artists/breakdown")
    @Operation(summary = "Get albums count and tracks count for every artist (Admin only)")
    public ResponseEntity<List<ArtistCatalogStatDto>> getAlbumsAndTracksByArtist() {
        return ResponseEntity.ok(analyticsService.getAlbumsAndTracksByArtist());
    }

    @GetMapping("/genres/tracks-count")
    @Operation(summary = "Get tracks count for all genres (Admin only)")
    public ResponseEntity<List<GenreTrackStatDto>> getTracksCountByGenre() {
        return ResponseEntity.ok(analyticsService.getTracksCountByGenre());
    }
}