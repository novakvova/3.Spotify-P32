package org.example.dtos;

import lombok.Getter;
import lombok.Setter;
import java.util.Set;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ProfileDto {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private String image;
}
