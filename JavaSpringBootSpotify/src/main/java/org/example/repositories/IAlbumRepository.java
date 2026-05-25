package org.example.repositories;

import java.util.List;

import org.example.entities.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface IAlbumRepository extends JpaRepository<Album, Long> {
    List<Album> findByTitleContainingIgnoreCase(String title); //повертає список альбомів з заданою назвою(або частиною назви)
    List<Album> findByArtist_Id(Long artistId);
    Optional<Album> findByTitleAndArtistId(String title, Long artistId);

}
