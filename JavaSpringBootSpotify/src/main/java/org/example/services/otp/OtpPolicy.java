package org.example.services.otp;

import java.time.Duration;

/**
 * Політика життєвого циклу одноразового коду.
 *
 * Патерн <b>Strategy</b>: той самий алгоритм видачі/перевірки OTP
 * використовується з різними правилами для входу та відновлення паролю.
 */
public record OtpPolicy(
        Duration ttl,
        Duration resendCooldown,
        int maxAttempts,
        int codeLength
) {

    /** Вхід за кодом: 4 цифри, 10 хвилин, 60 секунд між повторними листами. */
    public static final OtpPolicy LOGIN =
            new OtpPolicy(Duration.ofMinutes(10), Duration.ofSeconds(60), 5, 4);

    /** Відновлення паролю: 6 цифр — трохи більше ентропії для чутливої операції. */
    public static final OtpPolicy PASSWORD_RESET =
            new OtpPolicy(Duration.ofMinutes(10), Duration.ofSeconds(60), 5, 6);
}
