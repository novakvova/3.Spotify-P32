/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SPOTIFY CRUD API - ОНОВЛЕННЯ ПРОЕКТУ
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * НОВОСТВОРЕНІ КОМПОНЕНТИ:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 📁 REPOSITORIES (IAlbumRepository.java, IArtistRepository.java)
 * ├─ JpaRepository інтерфейси для Album та Artist entities
 * └─ Автоматичні CRUD операції через Spring Data JPA
 *
 * 📁 DTOs (AlbumDto.java, ArtistDto.java, RoleDto.java)
 * ├─ AlbumDto: id, title, releaseYear, artistId
 * ├─ ArtistDto: id, name, birthDate
 * └─ RoleDto: id, name
 *
 * 📁 MAPPERS (AlbumMapper.java, ArtistMapper.java, RoleMapper.java)
 * ├─ AlbumMapper: Конвертація Album ↔ AlbumDto
 * ├─ ArtistMapper: Конвертація Artist ↔ ArtistDto
 * └─ RoleMapper: Конвертація RoleEntity ↔ RoleDto
 *
 * 📁 SERVICES (AlbumService.java, ArtistService.java, RoleService.java, SongServiceImpl.java)
 * ├─ AlbumService: CRUD операції для альбомів
 * ├─ ArtistService: CRUD операції для артистів
 * ├─ RoleService: CRUD операції для ролей
 * └─ SongServiceImpl: CRUD операції для пісень з пагінацією
 *
 * 📁 CONTROLLERS (AlbumController.java, ArtistController.java, RoleController.java)
 * ├─ AlbumController: REST endpoints /api/albums
 * ├─ ArtistController: REST endpoints /api/artists
 * ├─ RoleController: REST endpoints /api/roles
 * ├─ SongController (ОНОВЛЕНИЙ): REST endpoints /api/songs
 * └─ GenreController (ОНОВЛЕНИЙ): REST endpoints /api/genres
 *
 * 🔐 CONFIG (OpenApiConfig.java)
 * └─ Swagger/OpenAPI конфіг з JWT Bearer Authentication
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CRUD ОПЕРАЦІЇ ДЛЯ КОЖНОГО КОНТРОЛЕРА:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. GET    /api/{resource}           - Отримати всі записи
 * 2. GET    /api/{resource}/{id}      - Отримати один запис по ID
 * 3. POST   /api/{resource}           - Створити новий запис
 * 4. PUT    /api/{resource}/{id}      - Оновити запис
 * 5. DELETE /api/{resource}/{id}      - Видалити запис
 *
 * СОРТУВАННЯ, ФІЛЬТРУВАННЯ, ПАГІНАЦІЯ:
 * ├─ SongController: /api/songs/page?page=0&size=10
 * └─ Кожен контролер підтримує стандартні HTTP методи
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SWAGGER / OPENAPI ДОКУМЕНТАЦІЯ:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 📍 URL: http://localhost:8434/swagger-ui.html
 * 📍 JSON: http://localhost:8434/v3/api-docs
 *
 * АННОТАЦІЇ:
 * ├─ @Tag: Групування операцій по темах
 * ├─ @Operation: Опис операції
 * ├─ @ApiResponse: HTTP статус та опис
 * └─ @ApiResponses: Множина можливих відповідей
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ЗАЛЕЖНІСТЬ ДОДАНА ДО POM.XML:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * <dependency>
 *     <groupId>org.springdoc</groupId>
 *     <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
 *     <version>2.1.0</version>
 * </dependency>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * КОНФІГ APPLICATION.PROPERTIES:
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * springdoc.api-docs.path=/v3/api-docs
 * springdoc.swagger-ui.path=/swagger-ui.html
 * springdoc.swagger-ui.enabled=true
 * springdoc.swagger-ui.show-common-extensions=true
 * springdoc.swagger-ui.operations-sorter=method
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ПРИКЛАДИ ЗАПИТІВ:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 📋 АЛЬБОМИ:
 * GET    http://localhost:8434/api/albums
 * GET    http://localhost:8434/api/albums/1
 * POST   http://localhost:8434/api/albums
 *        Body: {"title": "Album Name", "releaseYear": 2024, "artistId": 1}
 * PUT    http://localhost:8434/api/albums/1
 * DELETE http://localhost:8434/api/albums/1
 *
 * 🎤 АРТИСТИ:
 * GET    http://localhost:8434/api/artists
 * GET    http://localhost:8434/api/artists/1
 * POST   http://localhost:8434/api/artists
 *        Body: {"name": "Artist Name", "birthDate": "1990-01-01"}
 * PUT    http://localhost:8434/api/artists/1
 * DELETE http://localhost:8434/api/artists/1
 *
 * 🎵 ПІСНІ:
 * GET    http://localhost:8434/api/songs
 * GET    http://localhost:8434/api/songs/page?page=0&size=10
 * GET    http://localhost:8434/api/songs/1
 * POST   http://localhost:8434/api/songs
 * PUT    http://localhost:8434/api/songs/1
 * DELETE http://localhost:8434/api/songs/1
 *
 * 🎼 ЖАНРИ:
 * GET    http://localhost:8434/api/genres
 * GET    http://localhost:8434/api/genres/1
 * POST   http://localhost:8434/api/genres
 * PUT    http://localhost:8434/api/genres/1
 * DELETE http://localhost:8434/api/genres/1
 *
 * 👥 РОЛІ:
 * GET    http://localhost:8434/api/roles
 * GET    http://localhost:8434/api/roles/1
 * POST   http://localhost:8434/api/roles
 * PUT    http://localhost:8434/api/roles/1
 * DELETE http://localhost:8434/api/roles/1
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
