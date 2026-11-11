package org.example.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.example.exceptions.AuthException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String PURPOSE_CLAIM = "purpose";
    private static final String PASSWORD_RESET_PURPOSE = "password_reset";

    private final SecretKey key;
    private final long expirationMs;
    private final long passwordResetExpirationMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration-ms:3600000}") long expirationMs,
                   @Value("${jwt.password-reset-expiration-ms:600000}") long passwordResetExpirationMs) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("jwt.secret має бути мінімум 32 байти");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationMs = expirationMs;
        this.passwordResetExpirationMs = passwordResetExpirationMs;
    }

    /** subject = email користувача */
    public String generateToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Одноразовий токен, який дозволяє лише змінити пароль.
     * Має окремий claim purpose, тому не може використовуватись як access-токен.
     */
    public String generatePasswordResetToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .claim(PURPOSE_CLAIM, PASSWORD_RESET_PURPOSE)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + passwordResetExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parse(token);
            // reset-токен не є access-токеном і не повинен автентифікувати запити
            return claims.get(PURPOSE_CLAIM, String.class) == null;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return parse(token).getSubject();
    }

    /**
     * Витягує email із reset-токена, перевіряючи його призначення.
     */
    public String extractPasswordResetEmail(String token) {
        try {
            Claims claims = parse(token);
            if (!PASSWORD_RESET_PURPOSE.equals(claims.get(PURPOSE_CLAIM, String.class))) {
                throw AuthException.invalidResetToken();
            }
            String email = claims.getSubject();
            if (email == null || email.isBlank()) {
                throw AuthException.invalidResetToken();
            }
            return email;
        } catch (JwtException | IllegalArgumentException e) {
            throw AuthException.invalidResetToken();
        }
    }

    private Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }
}
