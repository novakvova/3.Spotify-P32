package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.SongItemDto;
import org.example.entities.Song;
import org.example.repositories.ISongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SongServiceImpl {
    private final ISongRepository songRepository;

    // ОТРИМАТИ ВСІ ПІСНІ
    public List<SongItemDto> getAllSongs() {
        return songRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    // ОТРИМАТИ ПІСНІ ЗІ СТОРІНКУВАННЯМ
    public Page<SongItemDto> getSongsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return songRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    // ОТРИМАТИ ПІСНЮ ПО ID
    public SongItemDto getSongById(Long id) {
        return songRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }

    // СТВОРИТИ НОВУ ПІСНЮ
    public SongItemDto createSong(SongItemDto dto) {
        Song song = new Song();
        song.setName(dto.getName());
        song.setFileName(dto.getFileName());
        Song saved = songRepository.save(song);
        return convertToDto(saved);
    }

    // ОНОВИТИ ПІСНЮ
    public SongItemDto updateSong(Long id, SongItemDto dto) {
        return songRepository.findById(id)
                .map(existing -> {
                    existing.setName(dto.getName());
                    existing.setFileName(dto.getFileName());
                    Song updated = songRepository.save(existing);
                    return convertToDto(updated);
                })
                .orElse(null);
    }

    // ВИДАЛИТИ ПІСНЮ
    public void deleteSong(Long id) {
        songRepository.deleteById(id);
    }

    // ДОПОМІЖНИЙ МЕТОД ДЛЯ КОНВЕРТАЦІЇ
    private SongItemDto convertToDto(Song song) {
        SongItemDto dto = new SongItemDto();
        dto.setId(song.getId());
        dto.setName(song.getName());
        dto.setFileName(song.getFileName());
        if (song.getArtist() != null) {
            dto.setArtist(song.getArtist().getName());
        }
        if (song.getAlbum() != null) {
            dto.setAlbum(song.getAlbum().getTitle());
        }
        if (song.getGenres() != null && !song.getGenres().isEmpty()) {
            dto.setGenres(song.getGenres()
                    .stream()
                    .map(g -> g.getName())
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
