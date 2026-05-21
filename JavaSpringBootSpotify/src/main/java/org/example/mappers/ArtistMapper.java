package org.example.mappers;

import org.example.dtos.ArtistDto;
import org.example.entities.Artist;
import org.springframework.stereotype.Component;
import org.example.dtos.CreateArtistDto;

@Component
public class ArtistMapper {
    public ArtistDto toDto(Artist entity) {
        ArtistDto dto = new ArtistDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setBirthDate(entity.getBirthDate());
        return dto;
    }

    public Artist toEntity(CreateArtistDto dto) {
        Artist entity = new Artist();
        entity.setName(dto.getName());
        entity.setBirthDate(dto.getBirthDate());
        return entity;
    }
}
