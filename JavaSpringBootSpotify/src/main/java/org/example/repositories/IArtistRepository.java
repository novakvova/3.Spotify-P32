package org.example.repositories;

import org.example.entities.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IArtistRepository extends JpaRepository<Artist, Long> {
    
    Optional<Artist> findByName(String name);
}
