package org.example.services;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Year;
import java.util.Map;

@Slf4j
@Service
public class MailService {

    private static final String APP_NAME = "Sonora";
    private static final String LOGO_CID = "sonoraLogo";

    private final JavaMailSender sender;
    private final boolean enabled;
    private final String from;
    private final String logoUrl;
    private final String loginTemplate;
    private final String passwordResetTemplate;
    private final byte[] logoBytes;

    public MailService(ObjectProvider<JavaMailSender> senderProvider,
                       @Value("${app.mail.enabled:false}") boolean enabled,
                       @Value("${app.mail.from:noreply@localhost}") String from,
                       @Value("${app.mail.logo-url:}") String logoUrl) throws IOException {
        this.sender = senderProvider.getIfAvailable();
        this.enabled = enabled;
        this.from = from;
        this.logoUrl = logoUrl == null ? "" : logoUrl.trim();

        this.loginTemplate = loadTemplate("login-code.html");
        this.passwordResetTemplate = loadTemplate("password-reset-link.html");

        Resource logo = resolveLogo();
        this.logoBytes = logo == null ? null : StreamUtils.copyToByteArray(logo.getInputStream());

        if (!this.logoUrl.isBlank()) {
            log.info("Логотип листів: зовнішній URL {}", this.logoUrl);
        } else if (logoBytes == null) {
            log.warn("Логотип Sonora не знайдено — буде текстовий варіант");
        } else {
            log.info("Логотип листів: inline, {} байт", logoBytes.length);
        }
    }

    private static String loadTemplate(String fileName) throws IOException {
        Resource resource = new ClassPathResource("templates/mail/" + fileName);
        if (!resource.exists()) {
            // у проєкті папка ресурсів має назву Templates (з великої літери)
            resource = new ClassPathResource("Templates/mail/" + fileName);
        }
        try (InputStream in = resource.getInputStream()) {
            return StreamUtils.copyToString(in, StandardCharsets.UTF_8);
        }
    }

    private Resource resolveLogo() {
        Resource classpath = new ClassPathResource("./images/sonora-logo.png");
        if (classpath.exists()) return classpath;
        Resource fileSystem = new FileSystemResource(Path.of("images", "sonora-logo.png"));
        return fileSystem.exists() ? fileSystem : null;
    }

    public void sendLoginCode(String to, String code) {
        sendHtmlEmail(
                to,
                "Код входу в " + APP_NAME + " — " + code,
                loginTemplate,
                "Ваш код входу в " + APP_NAME + ": " + code
                        + "\nКод дійсний 10 хвилин."
                        + "\nЯкщо ви не намагалися увійти, просто проігноруйте цей лист.",
                Map.of("[[CODE]]", code));
    }

    public void sendPasswordResetLink(String to, String link, long ttlMinutes) {
        sendHtmlEmail(
                to,
                "Відновлення паролю в " + APP_NAME,
                passwordResetTemplate,
                "Щоб встановити новий пароль у " + APP_NAME + ", перейдіть за посиланням:\n"
                        + link
                        + "\nПосилання дійсне " + ttlMinutes + " хвилин і може бути використане лише один раз."
                        + "\nЯкщо ви не запитували зміну паролю, просто проігноруйте цей лист —"
                        + " ваш пароль залишиться незмінним.",
                Map.of(
                        "[[LINK]]", link,
                        "[[TTL]]", String.valueOf(ttlMinutes)));
    }

    private void sendHtmlEmail(String to,
                               String subject,
                               String template,
                               String plain,
                               Map<String, String> replacements) {
        if (!enabled || sender == null) {
            log.warn("=== DEV: {} для {} (лист не надіслано) ===\n{}", subject, to, plain);
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, APP_NAME);
            helper.setTo(to);
            helper.setSubject(subject);

            String html = template
                    .replace("[[LOGO]]", logoBlock())
                    .replace("[[EMAIL]]", to)
                    .replace("[[YEAR]]", String.valueOf(Year.now().getValue()));

            for (Map.Entry<String, String> replacement : replacements.entrySet()) {
                html = html.replace(replacement.getKey(), replacement.getValue());
            }

            helper.setText(plain, html);

            if (logoUrl.isBlank() && logoBytes != null) {
                helper.addInline(LOGO_CID, new ByteArrayResource(logoBytes), "image/png");
            }

            sender.send(message);
        } catch (Exception e) {
            throw new IllegalStateException("Не вдалося надіслати лист на " + to, e);
        }
    }

    private String logoBlock() {
        String src = logoUrl;
        if (src.isBlank()) {
            if (logoBytes == null) {
                return "<div style=\"font-size:30px;font-weight:800;letter-spacing:-0.6px;color:#280a3a;\">"
                        + "Sonora<span style=\"color:#f25ecb;\">.</span></div>";
            }
            src = "cid:" + LOGO_CID;
        }
        return "<img src=\"" + src + "\" width=\"132\" alt=\"Sonora\" "
                + "style=\"display:block;border:0;outline:none;text-decoration:none;height:auto;\">";
    }
}
