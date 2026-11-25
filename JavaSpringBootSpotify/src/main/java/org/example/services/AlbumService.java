package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.AlbumDto;
import org.example.dtos.CreateAlbumDto;
import org.example.dtos.UpdateAlbumDto;
import org.example.entities.Album;
import org.example.mappers.AlbumMapper;
import org.example.repositories.IAlbumRepository;
import org.example.repositories.IArtistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final IAlbumRepository albumRepository;
    private final IArtistRepository artistRepository;
    private final AlbumMapper mapper;
    private final ImageStorageService imageStorageService;

    public List<AlbumDto> getAll() {
        return albumRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public AlbumDto getById(Long id) {
        return albumRepository.findById(id)
                .map(mapper::toDto)
                .orElse(null);
    }

    @Transactional
    public AlbumDto create(CreateAlbumDto dto, MultipartFile cover) {
        if (dto.getArtistId() == null) {
            throw new RuntimeException("Artist ID cannot be null");
        }
        var artist = artistRepository.findById(dto.getArtistId())
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + dto.getArtistId()));

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new RuntimeException("Album title cannot be null or empty");
        }

        String trimmedTitle = dto.getTitle().trim();
        boolean exists = albumRepository.findByTitleContainingIgnoreCase(trimmedTitle)
                .stream()
                .anyMatch(a -> a.getTitle().equalsIgnoreCase(trimmedTitle));
        if (exists) {
            throw new RuntimeException("Album with title '" + trimmedTitle + "' already exists");
        }

        dto.setTitle(trimmedTitle);
        Album entity = mapper.toEntity(dto, artist);
        if (cover != null && !cover.isEmpty()) {
            entity.setCoverUrl(imageStorageService.saveAsWebp(cover));
        }

        Album saved = albumRepository.save(entity);
        return mapper.toDto(saved);
    }

    @Transactional
    public AlbumDto update(Long id, UpdateAlbumDto dto, MultipartFile cover) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + id));

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            String newTitle = dto.getTitle().trim();
            boolean duplicateTitle = albumRepository.findByTitleContainingIgnoreCase(newTitle)
                    .stream()
                    .anyMatch(a -> !a.getId().equals(id) && a.getTitle().equalsIgnoreCase(newTitle));
            if (duplicateTitle) {
                throw new RuntimeException("Album with title '" + newTitle + "' already exists");
            }
            album.setTitle(newTitle);
        }

        if (dto.getReleaseYear() != null) {
            album.setReleaseYear(dto.getReleaseYear());
        }

        if (dto.getArtistId() != null) {
            var artist = artistRepository.findById(dto.getArtistId())
                    .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + dto.getArtistId()));
            album.setArtist(artist);
        }

        if (cover != null && !cover.isEmpty()) {
            String oldCover = album.getCoverUrl();
            String newCoverUrl = imageStorageService.saveAsWebp(cover);
            album.setCoverUrl(newCoverUrl);
            imageStorageService.deleteByUrl(oldCover);
        }

        return mapper.toDto(albumRepository.save(album));
    }

    @Transactional
    public AlbumDto uploadCover(Long id, MultipartFile cover) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Album not found with ID: " + id));

        String oldCover = album.getCoverUrl();
        String newCoverUrl = imageStorageService.saveAsWebp(cover);
        album.setCoverUrl(newCoverUrl);
        imageStorageService.deleteByUrl(oldCover);

        return mapper.toDto(albumRepository.save(album));
    }

    @Transactional
    public void delete(Long id) {
        albumRepository.findById(id).ifPresent(album -> imageStorageService.deleteByUrl(album.getCoverUrl()));
        albumRepository.deleteById(id);
    }

    public List<AlbumDto> searchByTitle(String title) {
        return albumRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<AlbumDto> getAlbumsByArtist(Long artistId) {
        return albumRepository.findByArtist_Id(artistId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}