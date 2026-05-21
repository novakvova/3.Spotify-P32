package org.example.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAlbumDto {
    private String title;
    private Integer releaseYear;
    private Long artistId;
}
