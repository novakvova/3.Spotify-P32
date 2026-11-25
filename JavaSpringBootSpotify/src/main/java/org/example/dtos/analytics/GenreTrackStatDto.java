package org.example.dtos.analytics;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GenreTrackStatDto {
    private Long id;
    private String name;
    private long tracksCount;
    private long playsCount;
}