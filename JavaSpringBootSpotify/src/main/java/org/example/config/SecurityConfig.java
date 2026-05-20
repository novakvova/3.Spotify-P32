package org.example.config;

import org.aspectj.lang.annotation.RequiredTypes;
import org.example.services.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

    

       @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                            // REST API → без CSRF токенів
                            .csrf(csrf -> csrf.disable())

                            // дозволяємо доступ до публічних ендпоінтів
                            .authorizeHttpRequests(auth -> auth
                                            .requestMatchers("/login", "/register", "/api/register").permitAll()
                                            .anyRequest().authenticated())

                            // вимикаємо дефолтний formLogin і logout
                            .formLogin(form -> form.disable())
                            .logout(logout -> logout.disable());

            http.addFilterBefore(jwtAuthenticationFilter,
                            UsernamePasswordAuthenticationFilter.class);

            return http.build();
    }

       @Bean
    public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
    }
}
