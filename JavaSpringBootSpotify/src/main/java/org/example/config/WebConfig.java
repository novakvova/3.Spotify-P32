package org.example.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${upload.dir}")
    private String uploadDir;
    @Value("${upload.dir2}")
    private String uploadDir2;
    @Value("${upload.albums-dir:uploads/albums}")
    private String albumsDir;
    @Value("${upload.songs-dir:uploads/songs}")
    private String songsDir;
    @Value("${upload.artists-dir:uploads/artists}")
    private String artistsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/" + uploadDir + "/**")
                .addResourceLocations("file:" + uploadDir + "/");
        registry.addResourceHandler("/" + uploadDir2 + "/**")
                .addResourceLocations("file:" + uploadDir2 + "/");
        registry.addResourceHandler("/" + albumsDir + "/**")
                .addResourceLocations("file:" + albumsDir + "/");
        registry.addResourceHandler("/" + songsDir + "/**")
                .addResourceLocations("file:" + songsDir + "/");
        registry.addResourceHandler("/" + artistsDir + "/**")
                .addResourceLocations("file:" + artistsDir + "/");
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:images/");
    }
}