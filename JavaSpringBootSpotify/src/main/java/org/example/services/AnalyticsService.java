package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.analytics.*;
import org.example.dtos.analytics.PlatformAnalyticsDto.*;
import org.example.entities.Album;
import org.example.entities.Artist;
import org.example.entities.Genre;
import org.example.entities.Song;
import org.example.repositories.IAlbumRepository;
import org.example.repositories.IArtistRepository;
import org.example.repositories.IGenreRepository;
import org.example.repositories.ISongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final ISongRepository songRepository;
    private final IAlbumRepository albumRepository;
    private final IArtistRepository artistRepository;
    private final IGenreRepository genreRepository;

    public PlatformAnalyticsDto getOverview(int topLimit, int recentLimit) {
        int safeTopLimit = Math.max(1, Math.min(topLimit, 100));
        int safeRecentLimit = Math.max(1, Math.min(recentLimit, 100));

        List<Song> allSongs = songRepository.findAll();
        List<Album> allAlbums = albumRepository.findAll();
        List<Artist> allArtists = artistRepository.findAll();
        List<Genre> allGenres = genreRepository.findAll();

        long totalSongs = allSongs.size();
        long totalAlbums = allAlbums.size();
        long totalArtists = allArtists.size();
        long totalGenres = allGenres.size();

        long totalPlays = allSongs.stream()
                .mapToLong(this::safePlayCount)
                .sum();

        SummaryStatsDto summary = SummaryStatsDto.builder()
                .totalPlays(totalPlays)
                .avgPlaysPerTrack(totalSongs > 0 ? round2((double) totalPlays / totalSongs) : 0.0)
                .avgTracksPerAlbum(totalAlbums > 0 ? round2((double) totalSongs / totalAlbums) : 0.0)
                .avgTracksPerArtist(totalArtists > 0 ? round2((double) totalSongs / totalArtists) : 0.0)
                .totalSongs(totalSongs)
                .totalAlbums(totalAlbums)
                .totalArtists(totalArtists)
                .totalGenres(totalGenres)
                .build();

        List<TopSongDto> topSongs = allSongs.stream()
                .sorted(Comparator.comparingLong(this::safePlayCount).reversed())
                .limit(safeTopLimit)
                .map(this::toTopSongDto)
                .toList();

        List<TopArtistDto> topArtists = buildTopArtists(allArtists, allSongs, safeTopLimit);
        List<TopAlbumDto> topAlbums = buildTopAlbums(allAlbums, allSongs, safeTopLimit);
        List<GenreAnalyticsDto> genres = buildGenreAnalytics(allGenres, allSongs);
        List<DecadeCatalogDto> decades = buildDecadeAnalytics(allAlbums, allSongs);

        List<RecentSongDto> latestSongs = allSongs.stream()
                .sorted(Comparator.comparingLong((Song s) -> s.getId() != null ? s.getId() : 0L).reversed())
                .limit(safeRecentLimit)
                .map(this::toRecentSongDto)
                .toList();

        return PlatformAnalyticsDto.builder()
                .summary(summary)
                .topSongs(topSongs)
                .topArtists(topArtists)
                .topAlbums(topAlbums)
                .genres(genres)
                .decades(decades)
                .latestSongs(latestSongs)
                .build();
    }

    // 1. Кількість прослуховувань по кожній пісні (усі пісні)
    public List<SongPlayStatDto> getAllSongsPlays() {
        return songRepository.findAll().stream()
                .map(song -> SongPlayStatDto.builder()
                        .id(song.getId())
                        .name(song.getName())
                        .artistName(song.getArtist() != null ? song.getArtist().getName() : null)
                        .albumTitle(song.getAlbum() != null ? song.getAlbum().getTitle() : null)
                        .coverUrl(resolveSongCover(song))
                        .playCount(safePlayCount(song))
                        .build())
                .sorted(Comparator.comparingLong(SongPlayStatDto::getPlayCount).reversed())
                .toList();
    }

    // 2. Кількість треків у кожному альбомі (усі альбоми)
    public List<AlbumTrackStatDto> getTracksCountByAlbum() {
        List<Album> albums = albumRepository.findAll();
        List<Song> songs = songRepository.findAll();

        Map<Long, Long> tracksByAlbumId = new HashMap<>();
        Map<Long, Long> playsByAlbumId = new HashMap<>();

        for (Song song : songs) {
            if (song.getAlbum() == null || song.getAlbum().getId() == null) continue;
            Long albumId = song.getAlbum().getId();
            tracksByAlbumId.merge(albumId, 1L, Long::sum);
            playsByAlbumId.merge(albumId, safePlayCount(song), Long::sum);
        }

        return albums.stream()
                .map(album -> AlbumTrackStatDto.builder()
                        .id(album.getId())
                        .title(album.getTitle())
                        .artistName(album.getArtist() != null ? album.getArtist().getName() : null)
                        .releaseYear(album.getReleaseYear())
                        .coverUrl(album.getCoverUrl())
                        .tracksCount(tracksByAlbumId.getOrDefault(album.getId(), 0L))
                        .playsCount(playsByAlbumId.getOrDefault(album.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(AlbumTrackStatDto::getTracksCount).reversed())
                .toList();
    }

    // 3. По кожному виконавцю: кількість альбомів та треків (усі виконавці)
    public List<ArtistCatalogStatDto> getAlbumsAndTracksByArtist() {
        List<Artist> artists = artistRepository.findAll();
        List<Album> albums = albumRepository.findAll();
        List<Song> songs = songRepository.findAll();

        Map<Long, Long> albumsByArtistId = new HashMap<>();
        for (Album album : albums) {
            if (album.getArtist() != null && album.getArtist().getId() != null) {
                albumsByArtistId.merge(album.getArtist().getId(), 1L, Long::sum);
            }
        }

        Map<Long, Long> tracksByArtistId = new HashMap<>();
        Map<Long, Long> playsByArtistId = new HashMap<>();
        for (Song song : songs) {
            if (song.getArtist() != null && song.getArtist().getId() != null) {
                Long artistId = song.getArtist().getId();
                tracksByArtistId.merge(artistId, 1L, Long::sum);
                playsByArtistId.merge(artistId, safePlayCount(song), Long::sum);
            }
        }

        return artists.stream()
                .map(artist -> ArtistCatalogStatDto.builder()
                        .id(artist.getId())
                        .name(artist.getName())
                        .imageUrl(artist.getImageUrl())
                        .albumsCount(albumsByArtistId.getOrDefault(artist.getId(), 0L))
                        .tracksCount(tracksByArtistId.getOrDefault(artist.getId(), 0L))
                        .playsCount(playsByArtistId.getOrDefault(artist.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(ArtistCatalogStatDto::getTracksCount).reversed())
                .toList();
    }

    // 4. Кількість треків по всіх жанрах (усі жанри)
    public List<GenreTrackStatDto> getTracksCountByGenre() {
        List<Genre> genres = genreRepository.findAll();
        List<Song> songs = songRepository.findAll();

        Map<Long, Long> tracksByGenreId = new HashMap<>();
        Map<Long, Long> playsByGenreId = new HashMap<>();

        for (Song song : songs) {
            if (song.getGenres() == null) continue;
            long plays = safePlayCount(song);
            for (Genre genre : song.getGenres()) {
                tracksByGenreId.merge(genre.getId(), 1L, Long::sum);
                playsByGenreId.merge(genre.getId(), plays, Long::sum);
            }
        }

        return genres.stream()
                .map(genre -> GenreTrackStatDto.builder()
                        .id(genre.getId())
                        .name(genre.getName())
                        .tracksCount(tracksByGenreId.getOrDefault(genre.getId(), 0L))
                        .playsCount(playsByGenreId.getOrDefault(genre.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(GenreTrackStatDto::getTracksCount).reversed())
                .toList();
    }

    private List<TopArtistDto> buildTopArtists(List<Artist> artists, List<Song> songs, int limit) {
        Map<Long, Long> playsByArtistId = new HashMap<>();
        Map<Long, Long> tracksByArtistId = new HashMap<>();

        for (Song song : songs) {
            if (song.getArtist() == null || song.getArtist().getId() == null) continue;
            Long artistId = song.getArtist().getId();
            tracksByArtistId.merge(artistId, 1L, Long::sum);
            playsByArtistId.merge(artistId, safePlayCount(song), Long::sum);
        }

        return artists.stream()
                .map(a -> TopArtistDto.builder()
                        .id(a.getId())
                        .name(a.getName())
                        .imageUrl(a.getImageUrl())
                        .tracksCount(tracksByArtistId.getOrDefault(a.getId(), 0L))
                        .playsCount(playsByArtistId.getOrDefault(a.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(TopArtistDto::getPlaysCount).reversed())
                .limit(limit)
                .toList();
    }

    private List<TopAlbumDto> buildTopAlbums(List<Album> albums, List<Song> songs, int limit) {
        Map<Long, Long> playsByAlbumId = new HashMap<>();
        Map<Long, Long> tracksByAlbumId = new HashMap<>();

        for (Song song : songs) {
            if (song.getAlbum() == null || song.getAlbum().getId() == null) continue;
            Long albumId = song.getAlbum().getId();
            tracksByAlbumId.merge(albumId, 1L, Long::sum);
            playsByAlbumId.merge(albumId, safePlayCount(song), Long::sum);
        }

        return albums.stream()
                .map(al -> TopAlbumDto.builder()
                        .id(al.getId())
                        .title(al.getTitle())
                        .artistName(al.getArtist() != null ? al.getArtist().getName() : null)
                        .releaseYear(al.getReleaseYear())
                        .coverUrl(al.getCoverUrl())
                        .tracksCount(tracksByAlbumId.getOrDefault(al.getId(), 0L))
                        .playsCount(playsByAlbumId.getOrDefault(al.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(TopAlbumDto::getPlaysCount).reversed())
                .limit(limit)
                .toList();
    }

    private List<GenreAnalyticsDto> buildGenreAnalytics(List<Genre> allGenres, List<Song> allSongs) {
        Map<Long, Long> playsByGenreId = new HashMap<>();
        Map<Long, Long> tracksByGenreId = new HashMap<>();

        for (Song song : allSongs) {
            if (song.getGenres() == null) continue;
            long plays = safePlayCount(song);
            for (Genre g : song.getGenres()) {
                tracksByGenreId.merge(g.getId(), 1L, Long::sum);
                playsByGenreId.merge(g.getId(), plays, Long::sum);
            }
        }

        return allGenres.stream()
                .map(g -> GenreAnalyticsDto.builder()
                        .genreId(g.getId())
                        .genreName(g.getName())
                        .playsCount(playsByGenreId.getOrDefault(g.getId(), 0L))
                        .tracksCount(tracksByGenreId.getOrDefault(g.getId(), 0L))
                        .build())
                .sorted(Comparator.comparingLong(GenreAnalyticsDto::getPlaysCount).reversed())
                .toList();
    }

    private List<DecadeCatalogDto> buildDecadeAnalytics(List<Album> allAlbums, List<Song> allSongs) {
        Map<Integer, Long> albumsPerDecade = new HashMap<>();
        Map<Long, Integer> albumDecadeMap = new HashMap<>();

        for (Album album : allAlbums) {
            if (album.getReleaseYear() == null || album.getReleaseYear() <= 0) continue;
            int decadeStart = (album.getReleaseYear() / 10) * 10;
            albumDecadeMap.put(album.getId(), decadeStart);
            albumsPerDecade.merge(decadeStart, 1L, Long::sum);
        }

        Map<Integer, Long> tracksPerDecade = new HashMap<>();
        Map<Integer, Long> playsPerDecade = new HashMap<>();

        for (Song song : allSongs) {
            if (song.getAlbum() == null) continue;
            Integer decadeStart = albumDecadeMap.get(song.getAlbum().getId());
            if (decadeStart == null && song.getAlbum().getReleaseYear() != null && song.getAlbum().getReleaseYear() > 0) {
                decadeStart = (song.getAlbum().getReleaseYear() / 10) * 10;
            }
            if (decadeStart != null) {
                tracksPerDecade.merge(decadeStart, 1L, Long::sum);
                playsPerDecade.merge(decadeStart, safePlayCount(song), Long::sum);
            }
        }

        Set<Integer> allDecades = new TreeSet<>(Comparator.reverseOrder());
        allDecades.addAll(albumsPerDecade.keySet());
        allDecades.addAll(tracksPerDecade.keySet());

        return allDecades.stream()
                .map(decade -> DecadeCatalogDto.builder()
                        .decadeStart(decade)
                        .label(decade + "-ті")
                        .albumsCount(albumsPerDecade.getOrDefault(decade, 0L))
                        .tracksCount(tracksPerDecade.getOrDefault(decade, 0L))
                        .playsCount(playsPerDecade.getOrDefault(decade, 0L))
                        .build())
                .collect(Collectors.toList());
    }

    private String resolveSongCover(Song song) {
        if (song.getCoverUrl() != null && !song.getCoverUrl().isBlank()) {
            return song.getCoverUrl();
        }
        if (song.getAlbum() != null && song.getAlbum().getCoverUrl() != null && !song.getAlbum().getCoverUrl().isBlank()) {
            return song.getAlbum().getCoverUrl();
        }
        return null;
    }

    private TopSongDto toTopSongDto(Song song) {
        return TopSongDto.builder()
                .id(song.getId())
                .name(song.getName())
                .artistName(song.getArtist() != null ? song.getArtist().getName() : null)
                .albumTitle(song.getAlbum() != null ? song.getAlbum().getTitle() : null)
                .coverUrl(resolveSongCover(song))
                .playCount(safePlayCount(song))
                .build();
    }

    private RecentSongDto toRecentSongDto(Song song) {
        return RecentSongDto.builder()
                .id(song.getId())
                .name(song.getName())
                .artistName(song.getArtist() != null ? song.getArtist().getName() : null)
                .albumTitle(song.getAlbum() != null ? song.getAlbum().getTitle() : null)
                .coverUrl(resolveSongCover(song))
                .playCount(safePlayCount(song))
                .build();
    }

    private long safePlayCount(Song song) {
        return song.getPlayCount() != null ? song.getPlayCount() : 0L;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}