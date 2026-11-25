package org.example.dtos.analytics;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TrackPlayResponseDto {
    private boolean counted;
    private String reason;
    private long playCount;
}