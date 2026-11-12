package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.entities.UserEntity;
import org.example.exceptions.AuthException;
import org.example.repositories.IUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Патерн <b>Facade</b>: ховає від контролера сценарій
 * «email → лист із посиланням → новий пароль».
 *
 * Кроки:
 * 1. {@link #requestResetLink(String)} — генерує короткоживучий токен і надсилає
 *    посилання на email. Для невідомої адреси лист не надсилається, але відповідь
 *    API однакова — це захищає від перевірки існування акаунта.
 * 2. {@link #resetPassword(String, String)} — змінює пароль лише за валідним токеном.
 *
 * Reset-токен зберігається в БД у вигляді SHA-256 хешу, тому він одноразовий:
 * після успішної зміни паролю поле очищується. Термін дії токена задається
 * властивістю {@code jwt.password-reset-expiration-ms}.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    @Value("${app.password-reset.link-base-url:http://localhost:5173/forgot-password}")
    private String resetLinkBaseUrl;

    @Value("${jwt.password-reset-expiration-ms:1800000}")
    private long resetTokenTtlMs;

    /**
     * Надсилає посилання для відновлення паролю, якщо акаунт із такою адресою існує.
     *
     * @return посилання для dev-режиму або {@code null}, якщо адреса невідома.
     *         Контролер у будь-якому разі відповідає однаково (захист від enumeration).
     */
    @Transactional
    public String requestResetLink(String rawEmail) {
        String email = normalize(rawEmail);

        UserEntity user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return null;
        }

        String resetToken = jwtUtil.generatePasswordResetToken(user.getEmail());

        // новий токен робить попереднє посилання недійсним
        user.setResetPasswordToken(sha256(resetToken));
        userRepository.save(user);

        String link = buildResetLink(resetToken);
        mailService.sendPasswordResetLink(user.getEmail(), link, ttlMinutes());

        return link;
    }

    /**
     * Змінює пароль за reset-токеном.
     * Токен одноразовий: після використання хеш очищується.
     */
    @Transactional
    public void resetPassword(String resetToken, String newPassword) {
        String email = jwtUtil.extractPasswordResetEmail(resetToken);

        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(AuthException::invalidResetToken);

        String expectedHash = user.getResetPasswordToken();
        if (expectedHash == null || !constantTimeEquals(expectedHash, sha256(resetToken))) {
            throw AuthException.invalidResetToken();
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw AuthException.passwordUnchanged();
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        userRepository.save(user);
    }

    private String buildResetLink(String resetToken) {
        String base = resetLinkBaseUrl == null ? "" : resetLinkBaseUrl.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/" + resetToken;
    }

    private long ttlMinutes() {
        return Math.max(1, resetTokenTtlMs / 60_000);
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 недоступний", e);
        }
    }

    private static boolean constantTimeEquals(String left, String right) {
        return MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }
}
