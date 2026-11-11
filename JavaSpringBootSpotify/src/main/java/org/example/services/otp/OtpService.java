package org.example.services.otp;

import lombok.RequiredArgsConstructor;
import org.example.exceptions.AuthException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Єдиний життєвий цикл одноразових кодів: видача, перевірка, ліміти спроб.
 *
 * Спільний для входу за кодом і для відновлення паролю.
 * Завдяки {@link OtpPolicy} та {@link OtpCodeStore} сервіс не знає,
 * яку саме сутність/таблицю використовує конкретний сценарій.
 */
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpCodeGenerator codeGenerator;
    private final PasswordEncoder passwordEncoder;

    /**
     * Видає новий код і передає його в канал доставки.
     *
     * @return сирий код (потрібен лише для dev-режиму/логів)
     */
    @Transactional
    public String issue(OtpPolicy policy, OtpCodeStore store, String email, OtpSender sender) {
        Instant now = Instant.now();

        store.findActive(email)
                .filter(attempt -> attempt.createdAt().isAfter(now.minus(policy.resendCooldown())))
                .ifPresent(attempt -> {
                    throw AuthException.resendTooSoon();
                });

        // прибираємо прострочені/використані коди перед створенням нового
        store.deleteAll(email);

        String code = codeGenerator.generate(policy.codeLength());
        store.create(email, passwordEncoder.encode(code), now.plus(policy.ttl()));

        sender.send(code);
        return code;
    }

    /**
     * Перевіряє код та позначає його використаним.
     * Кидає {@link AuthException} з машинним кодом для фронтенду.
     */
    @Transactional
    public void verify(OtpPolicy policy, OtpCodeStore store, String email, String code) {
        OtpAttempt attempt = store.findActive(email).orElseThrow(AuthException::invalidCode);

        if (attempt.expiresAt().isBefore(Instant.now())) {
            throw AuthException.invalidCode();
        }
        if (attempt.attempts() >= policy.maxAttempts()) {
            throw AuthException.tooManyAttempts();
        }

        if (!passwordEncoder.matches(code, attempt.codeHash())) {
            store.registerFailedAttempt(attempt.id());
            throw AuthException.invalidCode();
        }

        store.markConsumed(attempt.id());
    }
}
