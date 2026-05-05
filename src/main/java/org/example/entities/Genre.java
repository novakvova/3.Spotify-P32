package org.example.entities;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "genres")
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 200, nullable = false)
    private String name;
    @Column(length = 1000)
    private String description;

    @ManyToMany(mappedBy = "genres")
    private List<Song> songs;
}