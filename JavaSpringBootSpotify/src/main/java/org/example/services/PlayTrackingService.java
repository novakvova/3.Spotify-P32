package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.analytics.TrackPlayRequestDto;
import org.example.dtos.analytics.TrackPlayResponseDto;
import org.example.entities.Song;
import org.example.repositories.ISongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PlayTrackingService {

    private static final int MIN_LISTENED_SECONDS = 15;
    private static final double MIN_COMPLETION_RATIO = 0.30;
    private static final int MAX_REASONABLE_SECONDS = 86400;
    private static final long COOLDOWN_SECONDS = 60L;

    private final ISongRepository songRepository;
    private final Map<String, Instant> lastCountedPlayByKey = new ConcurrentHashMap<>();

    @Transactional
    public TrackPlayResponseDto trackPlay(Long songId, String clientKey, TrackPlayRequestDto request) {
        if (songId == null || songId <= 0) {
            throw new IllegalArgumentException("Невалідний ID пісні");
        }

        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("Пісню не знайдено з ID: " + songId));

        int listened = request != null && request.getListenedSeconds() != null
                ? request.getListenedSeconds()
                : 0;
        Integer duration = request != null ? request.getDurationSeconds() : null;

        if (listened < 0 || listened > MAX_REASONABLE_SECONDS) {
            throw new IllegalArgumentException("Некоректне значення listenedSeconds");
        }
        if (duration != null && (duration <= 0 || duration > MAX_REASONABLE_SECONDS)) {
            throw new IllegalArgumentException("Некоректне значення durationSeconds");
        }

        long currentPlays = song.getPlayCount() != null ? song.getPlayCount() : 0L;

        int effectiveThreshold = MIN_LISTENED_SECONDS;
        if (duration != null && duration > 0) {
            int ratioThreshold = (int) Math.ceil(duration * MIN_COMPLETION_RATIO);
            effectiveThreshold = Math.min(MIN_LISTENED_SECONDS, ratioThreshold);
        }

        if (listened < effectiveThreshold) {
            return TrackPlayResponseDto.builder()
                    .counted(false)
                    .reason("Поріг прослуховування ще не досягнуто (потрібно мінімум " + effectiveThreshold + " сек)")
                    .playCount(currentPlays)
                    .build();
        }

        Instant now = Instant.now();
        cleanupExpiredEntries(now);

        String key = (clientKey != null && !clientKey.isBlank() ? clientKey : "anonymous") + ":" + songId;
        Instant previous = lastCountedPlayByKey.get(key);
        if (previous != null && now.getEpochSecond() - previous.getEpochSecond() < COOLDOWN_SECONDS) {
            long waitLeft = COOLDOWN_SECONDS - (now.getEpochSecond() - previous.getEpochSecond());
            return TrackPlayResponseDto.builder()
                    .counted(false)
                    .reason("Повторне прослуховування зарахується через " + waitLeft + " сек")
                    .playCount(currentPlays)
                    .build();
        }

        lastCountedPlayByKey.put(key, now);
        songRepository.incrementPlayCount(songId);

        long updatedPlays = currentPlays + 1;
        return TrackPlayResponseDto.builder()
                .counted(true)
                .reason("Прослуховування зараховано")
                .playCount(updatedPlays)
                .build();
    }

    private void cleanupExpiredEntries(Instant now) {
        if (lastCountedPlayByKey.size() < 500) {
            return;
        }
        lastCountedPlayByKey.entrySet().removeIf(entry ->
                now.getEpochSecond() - entry.getValue().getEpochSecond() > COOLDOWN_SECONDS * 2);
    }
}