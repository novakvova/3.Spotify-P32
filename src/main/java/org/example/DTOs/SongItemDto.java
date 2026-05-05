package org.example.dtos.song;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SongItemDto {
    private Long id;
    private String name;
    private String fileName;
    private String artist;
    private String album;
}
