package org.example.dtos.analytics;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TrackPlayRequestDto {
    private Integer listenedSeconds;
    private Integer durationSeconds;
}