package org.example.repositories;

import org.example.entities.PasswordResetCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IPasswordResetCodeRepository extends JpaRepository<PasswordResetCodeEntity, Long> {

    Optional<PasswordResetCodeEntity> findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(String email);

    void deleteByEmail(String email);
}
