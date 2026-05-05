package org.example.mappers;

import org.example.entities.Song;
import org.mapstruct.Mapper;
import org.example.dtos.song.SongItemDto;

@Mapper(componentModel = "spring")
public interface SongMapper {
    SongItemDto toDto(Song song);
}
