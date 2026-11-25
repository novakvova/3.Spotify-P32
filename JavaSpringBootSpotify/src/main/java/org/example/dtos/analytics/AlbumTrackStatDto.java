package org.example.dtos.analytics;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AlbumTrackStatDto {
    private Long id;
    private String title;
    private String artistName;
    private Integer releaseYear;
    private String coverUrl;
    private long tracksCount;
    private long playsCount;
}