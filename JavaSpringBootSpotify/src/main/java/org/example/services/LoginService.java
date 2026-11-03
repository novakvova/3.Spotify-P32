package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.AuthResponse;
import org.example.entities.LoginCodeEntity;
import org.example.entities.UserEntity;
import org.example.exceptions.AuthException;
import org.example.mappers.UserMapper;
import org.example.repositories.ILoginCodeRepository;
import org.example.repositories.IUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LoginService {

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final int MAX_ATTEMPTS = 5;

    private final IUserRepository userRepository;
    private final ILoginCodeRepository codeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public String startEmailLogin(String rawEmail) {
        String email = normalize(rawEmail);
        UserEntity user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return null;
        }

        codeRepository.findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(email)
                .filter(c -> c.getCreatedAt().isAfter(Instant.now().minus(RESEND_COOLDOWN)))
                .ifPresent(c -> { throw AuthException.resendTooSoon(); });

        codeRepository.deleteByEmail(email);      // прибираємо прострочені й використані

        String code = String.format("%04d", random.nextInt(10_000));

        LoginCodeEntity entry = new LoginCodeEntity();
        entry.setEmail(email);
        entry.setCodeHash(passwordEncoder.encode(code));
        entry.setExpiresAt(Instant.now().plus(CODE_TTL));
        entry.setAttempts(0);
        codeRepository.save(entry);

        mailService.sendLoginCode(email, code);
        return code;
    }

    @Transactional
    public AuthResponse loginWithCode(String rawEmail, String code) {
        String email = normalize(rawEmail);

        LoginCodeEntity entry = codeRepository
                .findTopByEmailAndConsumedAtIsNullOrderByCreatedAtDesc(email)
                .orElseThrow(AuthException::invalidCode);

        if (entry.getExpiresAt().isBefore(Instant.now())) {
            throw AuthException.invalidCode();
        }
        if (entry.getAttempts() >= MAX_ATTEMPTS) {
            throw AuthException.tooManyAttempts();
        }

        entry.setAttempts(entry.getAttempts() + 1);

        if (!passwordEncoder.matches(code, entry.getCodeHash())) {
            codeRepository.save(entry);
            throw AuthException.invalidCode();
        }

        entry.setConsumedAt(Instant.now());
        codeRepository.save(entry);

        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(AuthException::invalidCode);

        return AuthResponse.bearer(jwtUtil.generateToken(user.getEmail()), UserMapper.toDto(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse loginWithPassword(String rawEmail, String password) {
        UserEntity user = userRepository.findByEmailIgnoreCase(normalize(rawEmail))
                .orElseThrow(AuthException::invalidCredentials);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw AuthException.invalidCredentials();
        }

        return AuthResponse.bearer(jwtUtil.generateToken(user.getEmail()), UserMapper.toDto(user));
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}