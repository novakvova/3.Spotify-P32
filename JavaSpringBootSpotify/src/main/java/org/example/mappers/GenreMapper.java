package org.example.mappers;

import org.example.dtos.GenreDto;
import org.example.entities.Genre;
import org.springframework.stereotype.Component;

@Component
public class GenreMapper {
    public GenreDto toDto(Genre entity) {
        GenreDto dto = new GenreDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    public Genre toEntity(GenreDto dto) {
        Genre entity = new Genre();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        return entity;
    }
}
