package org.example.repositories;

import java.util.List;

import org.example.entities.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface IAlbumRepository extends JpaRepository<Album, Long> {
    List<Album> findByTitle(String title); //повертає список альбомів з заданою назвою(але в сервісі ми просто повертаємо перший знайдений елемент або null, тому що в нашому випадку назва альбому має бути унікальною)
    List<Album> findByArtist_Id(Long artistId);
}
