package org.example.services.otp;

import lombok.RequiredArgsConstructor;
import org.example.entities.PasswordResetCodeEntity;
import org.example.repositories.IPasswordResetCodeRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

/**
 * Адаптер сховища кодів відновлення паролю до спільного контракту {@link OtpCodeStore}.
 */
@Component
@RequiredArgsConstructor
public class PasswordResetCodeStore implements OtpCodeStore {

    private final IPasswordResetCodeRepository repository;

    @Override
    public Optional<OtpAttempt> findActive(String email) {
        return repository.findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(email)
                .map(this::toAttempt);
    }

    @Override
    public void deleteAll(String email) {
        repository.deleteByEmail(email);
    }

    @Override
    public void create(String email, String codeHash, Instant expiresAt) {
        PasswordResetCodeEntity entry = new PasswordResetCodeEntity();
        entry.setEmail(email);
        entry.setCodeHash(codeHash);
        entry.setExpiresAt(expiresAt);
        entry.setAttempts(0);
        repository.save(entry);
    }

    @Override
    public void registerFailedAttempt(Long id) {
        repository.findById(id).ifPresent(entry -> {
            entry.setAttempts(entry.getAttempts() + 1);
            repository.save(entry);
        });
    }

    @Override
    public void markConsumed(Long id) {
        repository.findById(id).ifPresent(entry -> {
            entry.setConsumedAt(Instant.now());
            repository.save(entry);
        });
    }

    private OtpAttempt toAttempt(PasswordResetCodeEntity entry) {
        return new OtpAttempt(
                entry.getId(),
                entry.getCodeHash(),
                entry.getExpiresAt(),
                entry.getAttempts(),
                entry.getCreatedAt());
    }
}
