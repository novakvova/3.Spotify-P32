package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.AlbumDto;
import org.example.entities.Album;
import org.example.mappers.AlbumMapper;
import org.example.repositories.IAlbumRepository;
import org.springframework.stereotype.Service;
import org.example.dtos.CreateAlbumDto;
import org.example.repositories.IArtistRepository;
import org.example.dtos.UpdateAlbumDto;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final IAlbumRepository albumRepository;
    private final IArtistRepository artistRepository;
    private final AlbumMapper mapper;

    // CRUD ОПЕРАЦІЇ
    public List<AlbumDto> getAll() {
        return albumRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public AlbumDto getById(Long id) {
        return albumRepository.findById(id)
                .map(mapper::toDto)
                .orElse(null);
    }

    public AlbumDto create(CreateAlbumDto dto) {
        var artist = artistRepository.findById(dto.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + dto.getArtistId()));
        Album entity = mapper.toEntity(dto, artist);
        Album saved = albumRepository.save(entity);
        return mapper.toDto(saved);
    }

    public AlbumDto update(Long id, UpdateAlbumDto dto) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + id));
        album.setTitle(dto.getTitle());
        album.setReleaseYear(dto.getReleaseYear());
        if (dto.getArtistId() != null) {
            var artist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + dto.getArtistId()));
            album.setArtist(artist);
        }
        return mapper.toDto(albumRepository.save(album));
    }

    public void delete(Long id) {
        albumRepository.deleteById(id);
    }

    public List<AlbumDto> searchByTitle(String title) {
        return albumRepository.findByTitle(title)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<AlbumDto> getAlbumsByArtist(Long artistId) {
        return albumRepository.findByArtist_Id(artistId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
