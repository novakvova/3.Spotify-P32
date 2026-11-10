package org.example.services.otp;

/**
 * Патерн <b>Strategy</b>: спосіб генерації коду можна замінити,
 * не змінюючи сервіс життєвого циклу OTP.
 */
public interface OtpCodeGenerator {

    String generate(int length);
}
