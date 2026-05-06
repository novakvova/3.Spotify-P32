package org.example.dtos;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SongItemDto {
    private Long id;
    private String name;
    private String fileName;
    private String artist;
    private String album;
    private List<String> genres;
}
