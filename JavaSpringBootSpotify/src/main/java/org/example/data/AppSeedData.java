package org.example.data;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import java.util.Set;
import org.example.data.constants.RolesConstants;
import org.example.entities.*;
import org.example.repositories.*;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AppSeedData {

    private final IArtistRepository artistRepository;
    private final IAlbumRepository albumRepository;
    private final ISongRepository songRepository;
    private final IGenreRepository genreRepository;
    private final IRoleRepository roleRepository;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seed() {
        System.out.println("---- RUN SEED ----");

        seedRoles();
        seedAdminUser();
        seedGenres();
        seedFromJson();
    }

    private void seedRoles() {
        if (roleRepository.count() > 0) return;

        RoleEntity admin = new RoleEntity();
        admin.setName(RolesConstants.AdminRole);
        roleRepository.save(admin);

        RoleEntity user = new RoleEntity();
        user.setName(RolesConstants.UserRole);
        roleRepository.save(user);

        System.out.println("Roles added");
    }

    private void seedAdminUser() {
        if (userRepository.count() > 0) return;

        RoleEntity adminRole = roleRepository.findByName(RolesConstants.AdminRole).orElseThrow();

        UserEntity admin = new UserEntity();
        admin.setUsername("admin@gmail.com");
        admin.setEmail("admin@gmail.com");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setRoles(Set.of(adminRole));
        admin.setImage("default.jpg");

        userRepository.save(admin);

        System.out.println("Admin user added");
    }

    private void seedGenres() {
        if (genreRepository.count() > 0) return;

        List<String> defaultGenres = List.of(
                "Pop", "Rock", "Hip-Hop", "Electronic", "Indie",
                "Alternative", "Metal", "Jazz", "Folk", "Dance"
        );

        for (String g : defaultGenres) {
            Genre genre = new Genre();
            genre.setName(g);
            genreRepository.save(genre);
        }

        System.out.println("Genres added");
    }

    private void seedFromJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(
                    getClass().getClassLoader().getResourceAsStream("seed-data.json")
            );

            for (JsonNode artistNode : root.get("artists")) {

                String artistName = artistNode.get("name").asText();
                LocalDate birthDate = LocalDate.parse(artistNode.get("birthDate").asText());

                Artist artist = artistRepository.findByNameContainingIgnoreCase(artistName)
                        .stream()
                        .findFirst()
                        .orElseGet(() -> {
                            Artist a = new Artist();
                            a.setName(artistName);
                            a.setBirthDate(birthDate);
                            return artistRepository.save(a);
                        });

                for (JsonNode albumNode : artistNode.get("albums")) {

                    String albumTitle = albumNode.get("title").asText();
                    int year = albumNode.get("year").asInt();

                    Album album = albumRepository.findByTitleAndArtistId(albumTitle, artist.getId())
                            .orElseGet(() -> {
                                Album al = new Album();
                                al.setTitle(albumTitle);
                                al.setReleaseYear(year);
                                al.setArtist(artist);
                                return albumRepository.save(al);
                            });

                    for (JsonNode songNode : albumNode.get("songs")) {
                        String songTitle = songNode.asText();
                        createSong(songTitle, artist, album);
                    }
                }
            }

            for (JsonNode songNode : root.get("extraSongs")) {

                String title = songNode.get("title").asText();
                String artistName = songNode.get("artist").asText();
                String albumName = songNode.get("album").asText();
                int year = songNode.get("year").asInt();

                Artist artist = artistRepository.findByNameContainingIgnoreCase(artistName)
                        .stream()
                        .findFirst()
                        .orElseGet(() -> {
                            Artist a = new Artist();
                            a.setName(artistName);
                            a.setBirthDate(LocalDate.of(1990, 1, 1));
                            return artistRepository.save(a);
                        });

                Album album = albumRepository.findByTitleAndArtistId(albumName, artist.getId())
                        .orElseGet(() -> {
                            Album al = new Album();
                            al.setTitle(albumName);
                            al.setReleaseYear(year);
                            al.setArtist(artist);
                            return albumRepository.save(al);
                        });

                createSong(title, artist, album);
            }

            System.out.println("Seed completed successfully!");

        } catch (Exception e) {
            System.out.println("JSON seed error: " + e.getMessage());
        }
    }

    private void createSong(String title, Artist artist, Album album) {
        try {
            var existSong = songRepository.findByNameAndAlbumId(title, album.getId());
            if (existSong.isPresent()) {
                System.out.println("Song already exists: " + title);
                return;
            }
        
            String fileName = title + ".mp3";
            var filePath = Paths.get("mp3songs", fileName);

            if (!Files.exists(filePath)) {
                System.out.println("⚠ MP3 not found: " + fileName);
                return;
            }

            Song song = new Song();
            song.setName(title);
            song.setFileName(fileName);
            song.setArtist(artist);
            song.setAlbum(album);

            var genres = genreRepository.findAll();
            Collections.shuffle(genres);
            song.setGenres(genres.stream().limit(2).toList());

            songRepository.save(song);

            System.out.println("Added song: " + title);

        } catch (Exception e) {
            System.out.println("Song creation error: " + e.getMessage());
        }
    }
}
