package org.example.services.otp;

import java.time.Instant;

/**
 * Уніфіковане представлення активного OTP-коду.
 * Дозволяє {@link OtpService} працювати з різними JPA-сутностями
 * (вхід і відновлення паролю) через один контракт.
 */
public record OtpAttempt(
        Long id,
        String codeHash,
        Instant expiresAt,
        int attempts,
        Instant createdAt
) {
}
