package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.ArtistDto;
import org.example.entities.Artist;
import org.example.mappers.ArtistMapper;
import org.example.repositories.IArtistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final IArtistRepository artistRepository;
    private final ArtistMapper mapper;

    // CRUD ОПЕРАЦІЇ
    public List<ArtistDto> getAll() {
        return artistRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public ArtistDto getById(Long id) {
        return artistRepository.findById(id)
                .map(mapper::toDto)
                .orElse(null);
    }

    public ArtistDto create(ArtistDto dto) {
        Artist entity = mapper.toEntity(dto);
        Artist saved = artistRepository.save(entity);
        return mapper.toDto(saved);
    }

    public ArtistDto update(Long id, ArtistDto dto) {
        return artistRepository.findById(id)
                .map(existing -> {
                    existing.setName(dto.getName());
                    existing.setBirthDate(dto.getBirthDate());
                    return mapper.toDto(artistRepository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        artistRepository.deleteById(id);
    }
}
