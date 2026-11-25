package org.example.dtos.analytics;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SongPlayStatDto {
    private Long id;
    private String name;
    private String artistName;
    private String albumTitle;
    private String coverUrl;
    private long playCount;
}