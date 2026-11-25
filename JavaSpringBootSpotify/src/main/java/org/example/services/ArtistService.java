package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.ArtistDto;
import org.example.dtos.CreateArtistDto;
import org.example.dtos.UpdateArtistDto;
import org.example.entities.Artist;
import org.example.mappers.ArtistMapper;
import org.example.repositories.IArtistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final IArtistRepository artistRepository;
    private final ArtistMapper mapper;
    private final ImageStorageService imageStorageService;

    public List<ArtistDto> getAll() {
        return artistRepository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public ArtistDto getById(Long id) {
        return artistRepository.findById(id)
                .map(mapper::toDto)
                .orElse(null);
    }

    @Transactional
    public ArtistDto create(CreateArtistDto dto, MultipartFile image) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new RuntimeException("Artist name cannot be null or empty");
        }

        Artist entity = mapper.toEntity(dto);
        entity.setName(dto.getName().trim());

        if (image != null && !image.isEmpty()) {
            entity.setImageUrl(imageStorageService.saveArtistImageAsWebp(image));
        }

        Artist saved = artistRepository.save(entity);
        return mapper.toDto(saved);
    }

    @Transactional
    public ArtistDto update(Long id, UpdateArtistDto dto, MultipartFile image) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Artist not found with ID: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            artist.setName(dto.getName().trim());
        }
        if (dto.getBirthDate() != null) {
            artist.setBirthDate(dto.getBirthDate());
        }
        if (image != null && !image.isEmpty()) {
            String oldImage = artist.getImageUrl();
            String newImageUrl = imageStorageService.saveArtistImageAsWebp(image);
            artist.setImageUrl(newImageUrl);
            imageStorageService.deleteByUrl(oldImage);
        }

        return mapper.toDto(artistRepository.save(artist));
    }

    @Transactional
    public void delete(Long id) {
        artistRepository.findById(id).ifPresent(artist -> imageStorageService.deleteByUrl(artist.getImageUrl()));
        artistRepository.deleteById(id);
    }

    public List<ArtistDto> searchByName(String name) {
        return artistRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}