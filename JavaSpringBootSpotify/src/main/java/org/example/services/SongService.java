package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.CreateSongDto;
import org.example.dtos.SongItemDto;
import org.example.entities.Song;
import org.example.repositories.IAlbumRepository;
import org.example.repositories.IArtistRepository;
import org.example.repositories.IGenreRepository;
import org.example.repositories.ISongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SongService {

    private final ISongRepository songRepository;
    private final IArtistRepository artistRepository;
    private final IAlbumRepository albumRepository;
    private final IGenreRepository genreRepository;
    private final SaveMusicService saveMusicService;
    private final ImageStorageService imageStorageService;

    public List<SongItemDto> getAllSongs() {
        return songRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public Page<SongItemDto> getSongsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return songRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    public SongItemDto getSongById(Long id) {
        return songRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }

    @Transactional
    public SongItemDto createSong(CreateSongDto dto, MultipartFile file, MultipartFile cover) {
        if (dto == null || file == null || file.isEmpty()) {
            throw new IllegalArgumentException("DTO та аудіофайл не можуть бути порожні");
        }

        Song song = new Song();

        var artist = artistRepository.findByNameContainingIgnoreCase(dto.getArtistName())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Артист не знайдено: " + dto.getArtistName()));
        song.setArtist(artist);

        var album = albumRepository.findByTitleContainingIgnoreCase(dto.getAlbumTitle())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Альбом не знайдено: " + dto.getAlbumTitle()));
        song.setAlbum(album);

        if (dto.getGenres() != null && !dto.getGenres().isEmpty()) {
            var genres = dto.getGenres()
                    .stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(name -> genreRepository.findByName(name)
                            .orElseThrow(() -> new RuntimeException("Жанр не знайдено: " + name)))
                    .collect(Collectors.toList());
            song.setGenres(genres);
        }

        song.setName(dto.getName());

        try {
            String savedFileName = saveMusicService.saveMusic(file, dto.getName());
            song.setFileName(savedFileName);
        } catch (IOException e) {
            throw new RuntimeException("Помилка при збереженні музичного файлу: " + e.getMessage(), e);
        }

        if (cover != null && !cover.isEmpty()) {
            song.setCoverUrl(imageStorageService.saveSongCoverAsWebp(cover));
        }

        song.setPlayCount(0L);

        Song savedSong = songRepository.save(song);
        return convertToDto(savedSong);
    }

    @Transactional
    public SongItemDto updateSong(Long id, SongItemDto dto, MultipartFile cover) {
        return songRepository.findById(id)
                .map(existing -> {
                    if (dto.getName() != null && !dto.getName().isBlank()) {
                        existing.setName(dto.getName().trim());
                    }

                    if (dto.getArtist_name() != null && !dto.getArtist_name().isBlank()) {
                        var artist = artistRepository.findByNameContainingIgnoreCase(dto.getArtist_name().trim())
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Артист не знайдено: " + dto.getArtist_name()));
                        existing.setArtist(artist);
                    }

                    if (dto.getAlbum_title() != null && !dto.getAlbum_title().isBlank()) {
                        var album = albumRepository.findByTitleContainingIgnoreCase(dto.getAlbum_title().trim())
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Альбом не знайдено: " + dto.getAlbum_title()));
                        existing.setAlbum(album);
                    }

                    if (dto.getGenres_names() != null && !dto.getGenres_names().isEmpty()) {
                        var genres = dto.getGenres_names()
                                .stream()
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .map(name -> genreRepository.findByName(name)
                                        .orElseThrow(() -> new RuntimeException("Жанр не знайдено: " + name)))
                                .collect(Collectors.toList());
                        existing.setGenres(genres);
                    }

                    if (cover != null && !cover.isEmpty()) {
                        String oldCover = existing.getCoverUrl();
                        String newCoverUrl = imageStorageService.saveSongCoverAsWebp(cover);
                        existing.setCoverUrl(newCoverUrl);
                        imageStorageService.deleteByUrl(oldCover);
                    }

                    Song updated = songRepository.save(existing);
                    return convertToDto(updated);
                })
                .orElse(null);
    }

    @Transactional
    public void deleteSong(Long id) {
        songRepository.findById(id).ifPresent(song -> imageStorageService.deleteByUrl(song.getCoverUrl()));
        songRepository.deleteById(id);
    }

    private SongItemDto convertToDto(Song song) {
        SongItemDto dto = new SongItemDto();
        dto.setId(song.getId());
        dto.setName(song.getName());
        dto.setFileName(song.getFileName());
        dto.setCoverUrl(song.getCoverUrl());
        if (song.getArtist() != null) {
            dto.setArtist_name(song.getArtist().getName());
        }
        if (song.getAlbum() != null) {
            dto.setAlbum_title(song.getAlbum().getTitle());
        }
        if (song.getGenres() != null && !song.getGenres().isEmpty()) {
            dto.setGenres_names(song.getGenres()
                    .stream()
                    .map(g -> g.getName())
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public List<SongItemDto> searchByName(String name) {
        return songRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public List<SongItemDto> getSongsByAlbum(Long albumId) {
        return songRepository.findByAlbumId(albumId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
}