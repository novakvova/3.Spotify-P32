package org.example.services;

import lombok.RequiredArgsConstructor;

import org.example.dtos.SongItemDto;
import org.example.mappers.SongMapper;
import org.example.repositories.ISongRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {
    private final SongMapper mapper;
    private final ISongRepository songRepository;

    public List<org.example.dtos.SongItemDto> getAllSongs() {
        return songRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public Page<SongItemDto> getSongsPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return songRepository.findAll(pageable).map(mapper::toDto);
    }
}

