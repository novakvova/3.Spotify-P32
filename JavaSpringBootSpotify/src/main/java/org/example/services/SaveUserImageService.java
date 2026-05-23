package org.example.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;
import net.coobird.thumbnailator.Thumbnails;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class SaveUserImageService {
    
    private final Path baseDir;
   
    public SaveUserImageService(@Value("#{systemProperties['user.dir']}") String userDir,
            @Value("${upload.dir2}") String folderName) throws IOException {
        // формуємо шлях від робочої директорії
        this.baseDir = findFolder(Paths.get(userDir), folderName)
                .orElseGet(() -> {
                    try {
                        Path newDir = Paths.get(userDir, folderName);
                        Files.createDirectories(newDir);
                        return newDir;
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to create upload directory", e);
                    }
                });
        Files.createDirectories(this.baseDir);
    }
    public void saveUserImage(MultipartFile file, String username) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        // базова директорія
        // Path baseDir = Paths.get(System.getProperty("user.dir"), "uploads");
        // Files.createDirectories(baseDir);

        // оригінал
        Path originalDir = baseDir.resolve("original");
        Files.createDirectories(originalDir);
        Path originalPath = originalDir.resolve(username + ".jpg");
        // читаємо будь-який формат через InputStream
        BufferedImage img = ImageIO.read(file.getInputStream());
        if (img == null) {
            throw new IllegalArgumentException("Unsupported image format");
        }
        // зберігаємо у JPG
        ImageIO.write(img, "jpg", originalPath.toFile());
        // маленький (100x100)
        Path smallDir = baseDir.resolve("small");
        Files.createDirectories(smallDir);
        Path smallPath = smallDir.resolve(username + ".jpg");
        Thumbnails.of(originalPath.toFile())
                .size(100, 100)
                .toFile(smallPath.toFile());

        // середній (300x300)
        Path mediumDir = baseDir.resolve("medium");
        Files.createDirectories(mediumDir);
        Path mediumPath = mediumDir.resolve(username + ".jpg");
        Thumbnails.of(originalPath.toFile())
                .size(300, 300)
                .toFile(mediumPath.toFile());
    }
    
    public static Optional<Path> findFolder(Path startDir, String folderName) throws IOException {
        try (var stream = Files.walk(startDir)) {
            return stream
                    .filter(Files::isDirectory)
                    .filter(p -> p.getFileName().toString().equalsIgnoreCase(folderName))
                    .findFirst();
        }
    }
}
