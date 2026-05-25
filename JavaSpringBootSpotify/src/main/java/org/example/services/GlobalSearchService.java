package org.example.services;
import lombok.RequiredArgsConstructor;
import org.example.mappers.GlobalSearchMapper;
import org.example.repositories.IAlbumRepository;
import org.example.repositories.IArtistRepository;
import org.example.repositories.ISongRepository;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class GlobalSearchService {
    private final IArtistRepository artistRepository;
    private final IAlbumRepository albumRepository;
    private final ISongRepository songRepository;
    private final GlobalSearchMapper mapper;

    public Map<String, Object> globalSearch(String query) {

    var artists = artistRepository.findByNameContainingIgnoreCase(query)
            .stream()
            .map(mapper::toArtistDto)
            .toList();

    var albums = albumRepository.findByTitleContainingIgnoreCase(query)
            .stream()
            .map(mapper::toAlbumDto)
            .toList();

    var songs = songRepository.findByNameContainingIgnoreCase(query)
            .stream()
            .map(mapper::toSongDto)
            .toList();

    Map<String, Object> result = new HashMap<>();
    result.put("artists", artists);
    result.put("albums", albums);
    result.put("songs", songs);

    return result;
}

}
