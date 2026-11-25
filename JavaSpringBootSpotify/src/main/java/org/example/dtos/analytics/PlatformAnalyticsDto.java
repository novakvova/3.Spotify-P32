package org.example.dtos.analytics;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PlatformAnalyticsDto {
    private SummaryStatsDto summary;
    private List<TopSongDto> topSongs;
    private List<TopArtistDto> topArtists;
    private List<TopAlbumDto> topAlbums;
    private List<GenreAnalyticsDto> genres;
    private List<DecadeCatalogDto> decades;
    private List<RecentSongDto> latestSongs;

    @Getter
    @Builder
    public static class SummaryStatsDto {
        private long totalPlays;
        private double avgPlaysPerTrack;
        private double avgTracksPerAlbum;
        private double avgTracksPerArtist;
        private long totalSongs;
        private long totalAlbums;
        private long totalArtists;
        private long totalGenres;
    }

    @Getter
    @Builder
    public static class TopSongDto {
        private Long id;
        private String name;
        private String artistName;
        private String albumTitle;
        private String coverUrl;
        private long playCount;
    }

    @Getter
    @Builder
    public static class TopArtistDto {
        private Long id;
        private String name;
        private String imageUrl;
        private long tracksCount;
        private long playsCount;
    }

    @Getter
    @Builder
    public static class TopAlbumDto {
        private Long id;
        private String title;
        private String artistName;
        private Integer releaseYear;
        private String coverUrl;
        private long tracksCount;
        private long playsCount;
    }

    @Getter
    @Builder
    public static class GenreAnalyticsDto {
        private Long genreId;
        private String genreName;
        private long playsCount;
        private long tracksCount;
    }

    @Getter
    @Builder
    public static class DecadeCatalogDto {
        private int decadeStart;
        private String label;
        private long albumsCount;
        private long tracksCount;
        private long playsCount;
    }

    @Getter
    @Builder
    public static class RecentSongDto {
        private Long id;
        private String name;
        private String artistName;
        private String albumTitle;
        private String coverUrl;
        private long playCount;
    }
}