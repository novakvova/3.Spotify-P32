package org.example.services.otp;

import java.time.Instant;
import java.util.Optional;

/**
 * Патерн <b>Adapter</b> (на рівні контракту): кожна реалізація адаптує
 * свою JPA-сутність до єдиного сховища OTP-кодів.
 */
public interface OtpCodeStore {

    Optional<OtpAttempt> findActive(String email);

    void deleteAll(String email);

    void create(String email, String codeHash, Instant expiresAt);

    void registerFailedAttempt(Long id);

    void markConsumed(Long id);
}
