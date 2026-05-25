package org.example.repositories;

import org.example.entities.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ISongRepository extends JpaRepository<Song, Long> {
    Page<Song> findAll(Pageable pageable);
    Optional<Song> findByNameAndAlbumId(String name, Long albumId);
    List<Song> findByNameContainingIgnoreCase(String name);
    List<Song> findByAlbumId(Long albumId);
}
