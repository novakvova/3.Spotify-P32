package org.example.dtos;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter 
@Setter
public class CreateSongDto {
    private String name;
    private String artistName;
    private String albumTitle;
    private List<String> genres;
}

