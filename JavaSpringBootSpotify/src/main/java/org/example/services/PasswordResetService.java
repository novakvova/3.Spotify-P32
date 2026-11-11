package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.entities.UserEntity;
import org.example.exceptions.AuthException;
import org.example.repositories.IUserRepository;
import org.example.services.otp.OtpPolicy;
import org.example.services.otp.OtpService;
import org.example.services.otp.PasswordResetCodeStore;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Патерн <b>Facade</b>: ховає від контролера складний сценарій
 * «email → OTP → reset-token → новий пароль».
 *
 * Кроки:
 * 1. {@link #requestCode(String)} — надсилає код (не розкриваючи, чи існує акаунт).
 * 2. {@link #verifyCode(String, String)} — перевіряє код і видає короткоживучий JWT.
 * 3. {@link #resetPassword(String, String)} — змінює пароль лише за валідним reset-токеном.
 *
 * Reset-токен зберігається в БД у вигляді SHA-256 хешу, тому він одноразовий:
 * після успішної зміни паролю поле очищується.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final OtpPolicy POLICY = OtpPolicy.PASSWORD_RESET;

    private final IUserRepository userRepository;
    private final PasswordResetCodeStore codeStore;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    /**
     * @return сирий код для dev-режиму або {@code null}, якщо адреса невідома.
     *         Контролер у будь-якому разі відповідає однаково (захист від enumeration).
     */
    @Transactional
    public String requestCode(String rawEmail) {
        String email = normalize(rawEmail);

        if (userRepository.findByEmailIgnoreCase(email).isEmpty()) {
            return null;
        }

        return otpService.issue(
                POLICY,
                codeStore,
                email,
                code -> mailService.sendPasswordResetCode(email, code));
    }

    /**
     * Перевіряє OTP і повертає reset-токен, який не дає доступу до інших API.
     * Хеш токена зберігається в користувача — це робить токен одноразовим.
     */
    @Transactional
    public String verifyCode(String rawEmail, String code) {
        String email = normalize(rawEmail);

        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(AuthException::invalidCode);

        otpService.verify(POLICY, codeStore, email, code);

        String resetToken = jwtUtil.generatePasswordResetToken(email);
        user.setResetPasswordToken(sha256(resetToken));
        userRepository.save(user);

        return resetToken;
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

        // після успішної зміни всі коди для цієї адреси стають непотрібними
        codeStore.deleteAll(email);
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
