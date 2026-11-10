package org.example.services.otp;

@FunctionalInterface
public interface OtpSender {

    void send(String code);
}
