package org.example.dtos;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class UpdateArtistDto {
    private String name;
    private LocalDate birthDate;
}
