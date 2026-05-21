package org.example.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AlbumDto {
    private Long id;
    private String title;
    private Integer releaseYear;
    private Long artistId;
}
