package org.example.mappers;

import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface SongMapper {
    // @Mapping(target = "genres", expression = "java(song.getGenres().stream().map(g -> g.getName()).toList())")
    // SongItemDto toDto(Song song);
}
