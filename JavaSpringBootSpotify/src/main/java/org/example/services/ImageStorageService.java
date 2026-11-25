package org.example.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path baseUploadDir;
    private final Path albumsDir;
    private final Path songsDir;
    private final Path artistsDir;

    public ImageStorageService(
            @Value("${upload.albums-dir:uploads/albums}") String albumsDirConfig,
            @Value("${upload.songs-dir:uploads/songs}") String songsDirConfig,
            @Value("${upload.artists-dir:uploads/artists}") String artistsDirConfig
    ) throws IOException {
        this.baseUploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        this.albumsDir = Paths.get(albumsDirConfig).toAbsolutePath().normalize();
        this.songsDir = Paths.get(songsDirConfig).toAbsolutePath().normalize();
        this.artistsDir = Paths.get(artistsDirConfig).toAbsolutePath().normalize();

        Files.createDirectories(this.baseUploadDir);
        Files.createDirectories(this.albumsDir);
        Files.createDirectories(this.songsDir);
        Files.createDirectories(this.artistsDir);
    }

    public String saveAsWebp(MultipartFile file) {
        return saveAsWebpToDir(file, albumsDir, "/uploads/albums/");
    }

    public String saveSongCoverAsWebp(MultipartFile file) {
        return saveAsWebpToDir(file, songsDir, "/uploads/songs/");
    }

    public String saveArtistImageAsWebp(MultipartFile file) {
        return saveAsWebpToDir(file, artistsDir, "/uploads/artists/");
    }

    private String saveAsWebpToDir(MultipartFile file, Path targetFolder, String urlPrefix) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File must be an image");
        }

        try {
            Files.createDirectories(targetFolder);

            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new RuntimeException("Unsupported or corrupted image format");
            }

            String filename = UUID.randomUUID() + ".webp";
            Path targetPath = targetFolder.resolve(filename);

            Iterator<ImageWriter> writers = ImageIO.getImageWritersByMIMEType("image/webp");
            if (!writers.hasNext()) {
                throw new RuntimeException("WebP ImageWriter not found. Add webp-imageio dependency");
            }

            ImageWriter writer = writers.next();
            ImageWriteParam writeParam = writer.getDefaultWriteParam();
            if (writeParam.canWriteCompressed()) {
                writeParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                String[] compressionTypes = writeParam.getCompressionTypes();
                if (compressionTypes != null && compressionTypes.length > 0) {
                    writeParam.setCompressionType(compressionTypes[0]);
                }
                writeParam.setCompressionQuality(0.82f);
            }

            try (ImageOutputStream ios = ImageIO.createImageOutputStream(targetPath.toFile())) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(image, null, null), writeParam);
            } finally {
                writer.dispose();
            }

            return urlPrefix + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to convert and save image as WebP", e);
        }
    }

    public void deleteByUrl(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }
        String relativePath = fileUrl.substring("/uploads/".length());
        Path filePath = baseUploadDir.resolve(relativePath).normalize();
        if (filePath.startsWith(baseUploadDir)) {
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {
            }
        }
    }
}