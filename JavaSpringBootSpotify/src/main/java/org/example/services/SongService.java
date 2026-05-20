package org.example.services;

import lombok.RequiredArgsConstructor;

import org.example.mappers.SongMapper;
import org.example.repositories.ISongRepository;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class SongService {
    private final SongMapper mapper;
    private final ISongRepository songRepository;

    // ОПТИМІЗАЦІЯ: видалено закоментовані методи які не використовуються
}

