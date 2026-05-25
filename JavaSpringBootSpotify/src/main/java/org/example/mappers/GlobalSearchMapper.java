package org.example.mappers;
import java.util.stream.Collectors;
import org.example.dtos.*;
import org.example.entities.*;
import org.springframework.stereotype.Component;

@Component
public class GlobalSearchMapper {
     // ---------- ARTIST ----------
    public ArtistDto toArtistDto(Artist artist) {
        ArtistDto dto = new ArtistDto();
        dto.setId(artist.getId());
        dto.setName(artist.getName());
        dto.setBirthDate(artist.getBirthDate());
        return dto;
    }

    // ---------- ALBUM ----------
    public AlbumDto toAlbumDto(Album album) {
        AlbumDto dto = new AlbumDto();
        dto.setId(album.getId());
        dto.setTitle(album.getTitle());
        dto.setReleaseYear(album.getReleaseYear());
        dto.setArtistId(album.getArtist() != null ? album.getArtist().getId() : null);
        return dto;
    }

    // ---------- SONG ----------
    public SongItemDto toSongDto(Song song) {
        SongItemDto dto = new SongItemDto();
        dto.setId(song.getId());
        dto.setName(song.getName());
        dto.setFileName(song.getFileName());

        if (song.getArtist() != null) {
            dto.setArtist_name(song.getArtist().getName());
        }

        if (song.getAlbum() != null) {
            dto.setAlbum_title(song.getAlbum().getTitle());
        }

        if (song.getGenres() != null) {
            dto.setGenres_names(
                    song.getGenres()
                            .stream()
                            .map(g -> g.getName())
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}
