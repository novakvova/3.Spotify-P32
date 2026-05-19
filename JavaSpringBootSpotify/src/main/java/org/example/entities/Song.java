package org.example.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "songs")
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String fileName;

    @ManyToOne
    @JoinColumn(name = "artist_id", nullable = false)
    @Column(nullable = false, length = 200)
    private Artist artist;

    @Column(nullable = false)
    private Long playCount = 0L;

    @ManyToOne
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "song_genres",
            joinColumns = @JoinColumn(name = "song_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> genres;
    
}
