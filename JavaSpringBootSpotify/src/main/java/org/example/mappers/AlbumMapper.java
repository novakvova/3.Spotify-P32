package org.example.mappers;

import org.example.dtos.AlbumDto;
import org.example.entities.Album;
import org.example.repositories.IArtistRepository;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AlbumMapper {
    private final IArtistRepository artistRepository;
    public AlbumDto toDto(Album entity) {
        AlbumDto dto = new AlbumDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setReleaseYear(entity.getReleaseYear());
        if (entity.getArtist() != null) {
            dto.setArtistId(entity.getArtist().getId());
        }
        return dto;
    }

    public Album toEntity(AlbumDto dto) {
        Album entity = new Album();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setArtist(artistRepository.findById(dto.getArtistId()).orElse(null));
        entity.setReleaseYear(dto.getReleaseYear());
        return entity;
    }
}
