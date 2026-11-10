package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dtos.AuthResponse;
import org.example.entities.UserEntity;
import org.example.exceptions.AuthException;
import org.example.mappers.UserMapper;
import org.example.repositories.IUserRepository;
import org.example.services.otp.LoginCodeStore;
import org.example.services.otp.OtpPolicy;
import org.example.services.otp.OtpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LoginService {

    private static final OtpPolicy POLICY = OtpPolicy.LOGIN;

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailService mailService;
    private final OtpService otpService;
    private final LoginCodeStore loginCodeStore;

    @Transactional
    public String startEmailLogin(String rawEmail) {
        String email = normalize(rawEmail);
        UserEntity user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            return null;
        }

        return otpService.issue(
                POLICY,
                loginCodeStore,
                email,
                code -> mailService.sendLoginCode(email, code));
    }

    @Transactional
    public AuthResponse loginWithCode(String rawEmail, String code) {
        String email = normalize(rawEmail);

        otpService.verify(POLICY, loginCodeStore, email, code);

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
