package org.example.repositories;

import org.example.entities.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface IAlbumRepository extends JpaRepository<Album, Long> {
    Optional<Album> findByTitle(String title);
}
