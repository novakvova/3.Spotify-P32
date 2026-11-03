package org.example.repositories;

import org.example.entities.LoginCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ILoginCodeRepository extends JpaRepository<LoginCodeEntity, Long> {

    Optional<LoginCodeEntity> findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(String email);

    void deleteByEmail(String email);
}