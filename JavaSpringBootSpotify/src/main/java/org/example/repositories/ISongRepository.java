package org.example.repositories;

import org.example.entities.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ISongRepository extends JpaRepository<Song, Long> {
    Page<Song> findAll(Pageable pageable);
    Optional<Song> findByNameAndAlbumId(String name, Long albumId);
    List<Song> findByNameContainingIgnoreCase(String name);
    List<Song> findByAlbumId(Long albumId);

    @Modifying
    @Query("UPDATE Song s SET s.playCount = COALESCE(s.playCount, 0) + 1 WHERE s.id = :songId")
    void incrementPlayCount(@Param("songId") Long songId);
}