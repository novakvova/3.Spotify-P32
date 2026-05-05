package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.mappers.SongMapper;
import org.example.repositories.ISongRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {
    private final SongMapper mapper;
    private final ISongRepository songRepository;

    public List<org.example.dtos.song.SongItemDto> getAllSongs() {
        return songRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}
