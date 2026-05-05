package org.example.data;

import com.mpatric.mp3agic.*;
import groovy.io.FileType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.example.entities.Genre;
import org.example.entities.Song;
import org.example.repositories.IGenreRepository;
import org.example.repositories.ISongRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Component
@RequiredArgsConstructor
public class AppSeedData {
    @Value("${upload.dir}")
    private String uploadDir;
    //final - теж саме, що readonly у С#
    private final IGenreRepository genreRepository;
    private final ISongRepository songRepository;
    private final Faker faker = new Faker(new Locale("uk"));

    @PostConstruct
    public void seed() {
        System.out.println("---------Run seed data-----------");
        seedGenres();
        try {
            seedSongs();
        } catch (IOException e) {
            System.out.println("Error reead files");
        }
    }

    private void seedGenres() {
        if (genreRepository.count() == 0) {
            List<String> genres = new ArrayList<>();
            int n = 10, i = 0;
            while (i < n) {
                String genreName = faker.music().genre();
                if (!genres.contains(genreName)) {
                    genres.add(genreName);
                    i++;
                }
            }
            for (String genreName : genres) {
                Genre genre = new Genre();
                genre.setName(genreName);
                genreRepository.save(genre);
            }
        }
    }

    private void seedSongs() throws IOException {
        if (songRepository.count() == 0) {
            var path = Paths.get(uploadDir);
            //отримуємо список усіх жарів
            var genres = genreRepository.findAll();
            Random random = new Random();
            Collections.shuffle(genres); //робимо перемішування
            Files.list(path)
                    .filter(Files::isRegularFile)
                    .forEach(file -> {
                        Mp3File mp3file = null;
                        try {
                            mp3file = new Mp3File(file);
//                        System.out.println("=== Інформація про пісню ===");
//                        System.out.println("Файл: " + file.getFileName());
//                        System.out.println("Довжина: " + mp3file.getLengthInSeconds() + " сек");
//                        System.out.println("Бітрейт: " + mp3file.getBitrate() + " kbps");
//                        System.out.println("Частота дискретизації: " + mp3file.getSampleRate() + " Hz");

                            // Отримуємо теги ID3v2
                            if (mp3file.hasId3v2Tag()) {
                                ID3v2 id3v2Tag = mp3file.getId3v2Tag();

                                String artist = id3v2Tag.getArtist();
                                String title = id3v2Tag.getTitle();
                                String album = id3v2Tag.getAlbum();
                                String year = id3v2Tag.getYear();
                                String genre = id3v2Tag.getGenreDescription();

                                Song song = new Song();
                                song.setArtist(artist);
                                song.setAlbum(album);
                                song.setName(title);
                                song.setFileName(file.getFileName().toString());
                                int count = 1 + random.nextInt(3); // від 1 до 3 жанрів
                                List<Genre> randomGenres = genres.stream()
                                        .limit(count)
                                        .toList();
                                song.setGenres(randomGenres);
                                songRepository.save(song);

//                            System.out.println("\n--- ID3v2 Теги ---");
//                            System.out.println("Артист: " + (artist != null ? artist : "N/A"));
//                            System.out.println("Назва: " + (title != null ? title : "N/A"));
//                            System.out.println("Альбом: " + (album != null ? album : "N/A"));
//                            System.out.println("Рік: " + (year != null ? year : "N/A"));
//                            System.out.println("Жанр: " + (genre != null ? genre : "N/A"));
                            }
                        } catch (Exception e) {
                            System.out.println("----Problem reading file: " + e.getMessage());
                        }
                        System.out.println(file.getFileName());
                    });
        }

    }
}
