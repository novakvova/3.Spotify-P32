package org.example.dtos.analytics;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ArtistCatalogStatDto {
    private Long id;
    private String name;
    private String imageUrl;
    private long albumsCount;
    private long tracksCount;
    private long playsCount;
}