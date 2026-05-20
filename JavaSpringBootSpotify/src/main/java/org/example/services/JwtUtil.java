package org.example.services;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;  
import java.security.Key;
import java.util.Date;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600_000)) // 1 година
                .signWith(key)
                .compact();
    }
}
