package org.example.repositories;

import org.example.entities.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISongRepository extends JpaRepository<Song, Long> {
    Page<Song> findAll(Pageable pageable);
}
