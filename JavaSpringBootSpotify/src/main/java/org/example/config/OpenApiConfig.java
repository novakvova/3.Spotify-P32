package org.example.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Spotify API",
        version = "1.0.0",
        description = "Spotify Clone - REST API Documentation",
        contact = @Contact(
            name = "Spotify Team",
            email = "support@spotify.com",
            url = "https://spotify.com"
        ),
        license = @License(
            name = "Apache 2.0",
            url = "https://www.apache.org/licenses/LICENSE-2.0.html"
        )
    ),
    servers = {
        @Server(
            url = "http://localhost:8434",
            description = "Local Development Server"
        ),
        @Server(
            url = "http://localhost:8434",
            description = "Alternative Local Server"
        )
    },
    security = {
        @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    }
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "JWT Bearer token for API authentication"
)
public class OpenApiConfig {
}
