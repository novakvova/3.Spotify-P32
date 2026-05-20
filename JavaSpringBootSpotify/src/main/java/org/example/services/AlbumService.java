package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.AlbumDto;
import org.example.entities.Album;
import org.example.mappers.AlbumMapper;
import org.example.repositories.IAlbumRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final IAlbumRepository albumRepository;
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

    public AlbumDto create(AlbumDto dto) {
        Album entity = mapper.toEntity(dto);
        Album saved = albumRepository.save(entity);
        return mapper.toDto(saved);
    }

    public AlbumDto update(Long id, AlbumDto dto) {
        return albumRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(dto.getTitle());
                    existing.setReleaseYear(dto.getReleaseYear());
                    return mapper.toDto(albumRepository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        albumRepository.deleteById(id);
    }
}
