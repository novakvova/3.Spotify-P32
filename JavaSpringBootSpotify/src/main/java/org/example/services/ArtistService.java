package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.ArtistDto;
import org.example.entities.Artist;
import org.example.mappers.ArtistMapper;
import org.example.repositories.IArtistRepository;
import org.springframework.stereotype.Service;
import org.example.dtos.CreateArtistDto;
import org.example.dtos.UpdateArtistDto;

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

    public ArtistDto create(CreateArtistDto dto) {
        Artist entity = mapper.toEntity(dto);
        Artist saved = artistRepository.save(entity);
        return mapper.toDto(saved);
    }

    public ArtistDto update(Long id, UpdateArtistDto dto) {
       Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + id));
                 
        artist.setName(dto.getName());
        artist.setBirthDate(dto.getBirthDate());
        return mapper.toDto(artistRepository.save(artist));
    }

    public void delete(Long id) {
        artistRepository.deleteById(id);
    }

    public List<ArtistDto> searchByName(String name) {
        return artistRepository.findByName(name)
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
