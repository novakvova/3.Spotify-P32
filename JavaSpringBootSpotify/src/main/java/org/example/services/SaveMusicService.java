package org.example.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@Service
public class SaveMusicService {
    
    @Value("${upload.dir}")
    private String uploadDir;

    ///
    /// Зберігає MP3 файл на диск з унікальним ім'ям, повертає ім'я файлу для збереження в БД
    public String saveMusic(MultipartFile file, String fileName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Файл відсутній або порожній");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("audio/mpeg")) {
            throw new IllegalArgumentException("Файл не є MP3");
        }
        Path baseDir = Paths.get(uploadDir).toAbsolutePath();
        // базова директорія
        Files.createDirectories(baseDir);
        String uniqueFileName = UUID.randomUUID() + "_" + fileName+ ".mp3";
        Path targetPath = baseDir.resolve(uniqueFileName);
        file.transferTo(targetPath.toFile());
        return uniqueFileName;

    }
}
