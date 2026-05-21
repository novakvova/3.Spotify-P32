package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.GenreDto;
import org.example.entities.Genre;
import org.example.mappers.GenreMapper;
import org.example.repositories.IGenreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
// ОПТИМІЗАЦІЯ: видалено непотрібний import Collectors

@Service
@RequiredArgsConstructor
public class GenreService {
    private final IGenreRepository genreRepository;
    private final GenreMapper mapper;

    public List<GenreDto> getAll() {
        // ОПТИМІЗАЦІЯ: заміна Collectors.toList() на toList() для Java 16+
        return genreRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public GenreDto getById(Long id) {
        return genreRepository.findById(id)
                .map(mapper::toDto)
                .orElse(null);
    }
    public GenreDto create(GenreDto dto) {
        Genre entity = mapper.toEntity(dto);
        Genre saved = genreRepository.save(entity);
        return mapper.toDto(saved);
    }

    public GenreDto update(Long id, GenreDto dto) {
        return genreRepository.findById(id)
                .map(existing -> {
                    existing.setName(dto.getName());
                    existing.setDescription(dto.getDescription());
                    return mapper.toDto(genreRepository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        genreRepository.deleteById(id);
    }
}
