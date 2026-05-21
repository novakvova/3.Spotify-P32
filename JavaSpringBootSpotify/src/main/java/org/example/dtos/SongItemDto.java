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
    private String artist_name;
    private String album_title;
    private List<String> genres_names;
}
