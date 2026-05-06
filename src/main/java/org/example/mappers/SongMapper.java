package org.example.mappers;

import org.example.entities.Song;
import org.mapstruct.Mapper;
import org.example.dtos.SongItemDto;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SongMapper {
    @Mapping(target = "genres", expression = "java(song.getGenres().stream().map(g -> g.getName()).toList())")
    SongItemDto toDto(Song song);
}
