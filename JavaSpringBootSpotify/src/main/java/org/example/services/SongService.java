package org.example.services;

import lombok.RequiredArgsConstructor;
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
    public SongItemDto createSong(SongItemDto dto, MultipartFile file) {
        if (dto == null || file == null || file.isEmpty()) {
            throw new IllegalArgumentException("DTO та файл не можуть бути порожні");
        }

        Song song = new Song();

        // Знаходимо та встановлюємо артиста за назвою
        var artist = artistRepository.findByName(dto.getArtist_name())
                .orElseThrow(() -> new RuntimeException("Артист не знайдено: " + dto.getArtist_name()));
        song.setArtist(artist);

        // Знаходимо та встановлюємо альбом за назвою
        var album = albumRepository.findByTitle(dto.getAlbum_title())
                .orElseThrow(() -> new RuntimeException("Альбом не знайдено: " + dto.getAlbum_title()));
        song.setAlbum(album);

        // Знаходимо та встановлюємо жанри за назвами
        if (dto.getGenres_names() != null && !dto.getGenres_names().isEmpty()) {
            var genres = dto.getGenres_names()
                    .stream()
                    .map(name -> genreRepository.findByName(name)
                            .orElseThrow(() -> new RuntimeException("Жанр не знайдено: " + name)))
                    .collect(Collectors.toList());
            song.setGenres(genres);
        }

        // Встановлюємо назву пісні
        song.setName(dto.getName());

        // Зберігаємо музичний файл та отримуємо ім'я файлу
        try {
            String savedFileName = saveMusicService.saveMusic(file, dto.getName());
            song.setFileName(savedFileName);
        } catch (IOException e) {
            throw new RuntimeException("Помилка при збереженні музичного файлу: " + e.getMessage(), e);
        }

        // Встановлюємо початковий лічильник прослуховувань
        song.setPlayCount(0L);

        // Зберігаємо пісню в БД
        Song savedSong = songRepository.save(song);

        // Повертаємо DTO з заповненими полями
        return convertToDto(savedSong);
    }

    // ОНОВИТИ ПІСНЮ
    public SongItemDto updateSong(Long id, SongItemDto dto) {
        return songRepository.findById(id)
                .map(existing -> {
                    // Оновлюємо назву пісні
                    existing.setName(dto.getName());

                    // Оновлюємо артиста за назвою
                    var artist = artistRepository.findByName(dto.getArtist_name())
                            .orElseThrow(() -> new RuntimeException("Артист не знайдено: " + dto.getArtist_name()));
                    existing.setArtist(artist);

                    // Оновлюємо альбом за назвою
                    var album = albumRepository.findByTitle(dto.getAlbum_title())
                            .orElseThrow(() -> new RuntimeException("Альбом не знайдено: " + dto.getAlbum_title()));
                    existing.setAlbum(album);

                    // Оновлюємо жанри за назвами
                    if (dto.getGenres_names() != null && !dto.getGenres_names().isEmpty()) {
                        var genres = dto.getGenres_names()
                                .stream()
                                .map(name -> genreRepository.findByName(name)
                                        .orElseThrow(() -> new RuntimeException("Жанр не знайдено: " + name)))
                                .collect(Collectors.toList());
                        existing.setGenres(genres);
                    }

                    // Зберігаємо оновлену пісню
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
}
