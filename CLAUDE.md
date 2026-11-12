# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Використовуй короткі відповіді, без зайвого коду, лише важлива інформація!
Перед рефакторингом і роботою з кодом завжди читай файл @spec.md

This repo holds two independent apps that talk over HTTP:
- `JavaSpringBootSpotify/` — Spring Boot 4 REST API (Java 17, Maven, PostgreSQL on Neon).
- `vite-spotify/` — React 19 + TypeScript SPA (Vite 6, Redux Toolkit, Tailwind 4).

There is no root-level build; run commands from the subproject directory.

## Commands

### Backend (`cd JavaSpringBootSpotify`)
- Run: `mvn spring-boot:run` (no Maven wrapper is committed). Listens on port **8434** (`server.port` in `application.properties`).
- Build jar: `mvn clean package` → `target/*.jar`.
- Tests: none exist (no `src/test`). Single-test runs have nothing to target yet.
- Docker: `DockerFile` builds a jar and runs it on JDK 17; it `EXPOSE`s 8087, while `java-p32.sh` maps host 6892 → container 8081. These ports disagree with `server.port=8434`; check before relying on any of them.

### Frontend (`cd vite-spotify`)
- Install: `npm install`
- Dev server: `npm run dev` → http://localhost:5173
- Build: `npm run build` (runs `tsc -b` first, so type errors fail the build)
- Lint: `npm run lint` (ESLint flat config, `typescript-eslint` + react-hooks + react-refresh)
- Preview a build: `npm run preview`
- Tests: none configured.

## Configuration and secrets

- Backend reads `JavaSpringBootSpotify/.env` via `spring.config.import=optional:file:./.env[.properties]`. Keys: `jwt.secret`, `DB_PASSWORD`, `MAIL_USER`, `MAIL_APP_PASSWORD`.
- `application.properties` currently also contains the DB, mail and JWT credentials in plain text, and that file is tracked by git. Do not copy these values anywhere else; flag them to the user rather than adding more.
- Dev-only OTP/reset-link exposure flags (`app.dev.expose-code`, `app.dev.expose-reset-link`) are `false`; keep them off outside local debugging.
- Frontend dev proxy (`vite.config.ts`) forwards `/api`, `/register`, `/login`, `/profile`, `/mp3songs`, `/uploads` to `localhost:8434`. Frontend requests use relative URLs, so the backend must be running for dev. `src/env/index.ts` defines `API_URL` (`VITE_API_URL`), but nothing reads it; RTK Query uses `baseUrl: '/'`.

## Backend architecture (`JavaSpringBootSpotify/src/main/java/org/example/`)

- **Layering:** `controller` → `services` → `repositories` (Spring Data JPA) → `entities`. Request/response shapes live in `dtos`; conversion is in `mappers` (MapStruct interfaces plus some hand-written mappers such as `SongMapperManual`).
- **REST API:** Versioned under `/api/*` (`/api/songs`, `/api/albums`, `/api/artists`, `/api/genres`, `/api/roles`, `/api/search`, `/api/auth`). A few older controllers (`AuthController`, `RegisterController`, `AccountController`, `HomeController`) still map root paths such as `/login`, `/register`, `/profile` for the legacy form flow.
- **Security:** Stateless JWT. `SecurityConfig` disables CSRF and sessions. `JwtAuthenticationFilter` reads `Authorization: Bearer …`, validates it with `JwtUtil`, and loads the `UserEntity` as the principal. Public: `/api/auth/**`, `/uploads/**`, `/images/**`, Swagger paths. Everything else needs authentication. CORS origins come from `app.cors.allowed-origins`.
- **Auth flows (`/api/auth`):** Email-first login. `email-check` → either `login/email` + `login/code` (OTP via `services/otp/*`: generator, store, policy, sender) or `login/password`. Password reset uses emailed links (`PasswordResetService`, `MailService`, Thymeleaf templates under `resources/Templates/mail/`). Registration goes through `RegistrationService`.
- **File storage:** Images go to `uploads/{original,medium,small}/` via `SaveUserImageService` (thumbnailator for resizing, TwelveMonkeys for WebP). MP3s go to `mp3songs/` via `SaveMusicService`, which only accepts `audio/mpeg`. `WebConfig` serves both folders as static resources. These directories are relative to the working directory and are committed to git.
- **Startup seeding:** `data/AppSeedData` runs on `@PostConstruct`. Each step is skipped when its table already has rows: roles, an admin user, genres, and `resources/seed-data.json`. Schema is managed by `spring.jpa.hibernate.ddl-auto=update`, so there are no migrations.
- **Errors:** `exceptions/ApiExceptionHandler` maps exceptions to `ApiError` responses.
- **Swagger UI** is enabled at `/swagger-ui.html`.

## Frontend architecture (`vite-spotify/src/`)

- **State:** `store/index.ts` combines plain slices (`auth`, `player`, `theme`, `language`) with one RTK Query API per domain (`authApi`, `songsApi`, `genresApi`, `artistsApi`, `albumsApi`, `searchApi`). Each API is in `services/<domain>/` and uses `createBaseQuery`, which attaches the `token` from `localStorage` as a Bearer header.
- **Auth state:** `authSlice` mirrors the token and user in `localStorage` (`token`, `user`), so both must be cleared together on logout.
- **Routing (`App.tsx`):** Three groups. Public marketing and support pages (`/`, `/premium/*`, `/support`, `/about`, `/community`). App pages wrapped in `layouts/MainLayout` (`/songs`, `/artists`, `/albums`, `/genres`, `/me`, `/search` and their `/:id` detail routes). Auth pages (`/login`, `/register`, `/forgot-password[/:token]`).
- **Player:** `playerSlice` holds playback state, `hooks/useAudio` wraps audio playback, and `layouts/PlayerBar` is the UI.
- **Types:** `src/types/I*.ts` describe the backend DTOs by hand. When an API shape changes, update both sides.
- **i18n:** `LanguageTranslator` and `languageSlice` handle the UI language. `ScrollToTop` is mounted globally.
- **Lint scope:** `eslint.config.js` covers `**/*.{ts,tsx}`, and `dist` is ignored.

## Coding rules

These follow the conventions already used in the code. Match the file you are editing.

### Backend (Java)
- **Naming and DTOs:** request/response types live in `dtos/` and follow the existing pattern: `Create<X>Dto`, `Update<X>Dto`, `<X>Dto`, `<X>ItemDto` for list items. Entities are in `entities/`; do not return entities from controllers.
- **Dependency injection:** constructor injection via Lombok `@RequiredArgsConstructor` with `private final` fields. Do not add field `@Autowired`.
- **Logging:** use `@Slf4j` (Lombok). Do not use `System.out` in new code. (`AppSeedData` is the existing exception.)
- **Controllers:** return `ResponseEntity<...>`, keep them thin (delegate to a service), and annotate with the Swagger `@Tag`, `@Operation`, `@ApiResponse` set already used in `SongController`.
- **Errors:** throw `AuthException` for authentication and authorization failures so `ApiExceptionHandler` formats them as `ApiError`. Let validation errors go through `@Valid` and the existing `MethodArgumentNotValidException` handler. Do not add new `try/catch` blocks in controllers to format errors.
- **Mapping:** prefer MapStruct interfaces in `mappers/`. Hand-written mappers already exist (`SongMapperManual`); extend them only when the entity is already mapped that way.
- **Transactions:** put `@Transactional` on service methods that write, not on controllers or repositories.
- **Validation:** use Jakarta annotations on DTOs. Password rules go through the existing `@ValidPassword` annotation.
- **Lombok:** use it for boilerplate (`@Getter`/`@Setter`/`@RequiredArgsConstructor`/`@Slf4j`). Do not hand-write equivalent code.

### Frontend (TypeScript / React)
- **Server state:** fetch through RTK Query endpoints in `services/<domain>/`. Do not call `fetch` or `axios` directly from components, and do not copy server data into Redux slices.
- **Client state:** only player, auth, theme, and language state goes into slices in `store/slices/`. Use the typed hooks from `store/hooks.ts` (`useAppDispatch`, `useAppSelector`), not the raw `react-redux` hooks.
- **Base query:** every new API uses `createBaseQuery` from `utils/createBaseQuery.ts`, so the Bearer token is attached consistently.
- **Types:** add or update interfaces in `src/types/` to match backend DTOs. Keep the field names used by the existing type file; some files use snake_case (`ISong.artist_name`) and others camelCase, so do not rename fields in passing.
- **Pages and layout:** new pages go in `src/pages/` and are routed in `App.tsx`. Pages under `/songs`, `/albums`, `/artists`, `/genres`, `/me`, `/search` go inside `MainLayout`.
- **Hooks rules:** keep `useEffect` dependencies complete. ESLint enforces `react-hooks`, so fix warnings rather than suppressing them.
- **Helpers:** reuse `utils/format.ts` (`formatTime`, `getSongUrl`, `getAvatarUrl`) rather than rebuilding URLs or time strings.
- **Styling:** Tailwind utility classes, as in the existing components.

### Language
- Existing comments and UI strings are mostly Ukrainian. Write new comments and user-facing text in the same language as the surrounding code.
- Identifiers stay in English.

## Architecture rules

- **Backend layering:** `controller → service → repository`. Controllers must not call repositories directly. Services must not return HTTP types (`ResponseEntity`).
- **Security:** new endpoints are authenticated by default. Adding a public route means adding it to `SecurityConfig.securityFilterChain` explicitly. Do not disable JWT checks or CSRF per endpoint.
- **Files:** write uploads only through the existing services (`SaveMusicService`, `SaveUserImageService`). Keep paths relative to the working directory, as the current code does. Do not serve files from new static paths without updating `WebConfig` and `SecurityConfig`.
- **Schema:** the schema is managed by `ddl-auto=update`. Adding a column means adding it to the entity. Renaming or removing columns is a manual, data-affecting change and must be called out to the user first.
- **Seed data:** `AppSeedData` steps must stay idempotent (skip when the table already has rows). Do not add seed steps that run unconditionally.
- **Frontend data flow:** components read data from RTK Query hooks and dispatch slice actions for UI state. Cross-cutting behavior (auth headers, base URL) belongs in `createBaseQuery`, not in individual endpoints.
- **Config and secrets:** new configuration goes in `application.properties` with environment-variable placeholders for secrets, not literal values. Do not add more credentials to tracked files (see Configuration above).
- **Dev flags:** `app.dev.expose-code` and `app.dev.expose-reset-link` must stay `false` in any committed configuration.

## Testing

- **Current state:** the project has no tests and no test dependencies. `spring-boot-starter-test` is not in `pom.xml`, and there are no frontend test scripts or runner. Do not assume a test framework exists.
- **Adding tests:** before writing the first test, add the framework to the relevant build file (`pom.xml` test scope for the backend, a `test` script and runner in `package.json` for the frontend) and tell the user, since this changes the dependency set.
- **Where tests go:** backend tests in `JavaSpringBootSpotify/src/test/java/org/example/` mirroring the main package; frontend tests next to the code they cover (`*.test.ts` / `*.test.tsx`).
- **What to cover first:** pure logic with no I/O: `OtpPolicy`, `NumericOtpCodeGenerator`, `PasswordValidator`, `JwtUtil`, `utils/format.ts`, and the player reducers in `playerSlice`. These need no database or server.
- **Integration tests:** anything that touches the database must not use the production Neon database. Use a separate profile or an in-memory setup, and never point tests at the credentials in `application.properties`.
- **Before reporting done:** run the checks that exist today: `mvn -q -DskipTests package` for the backend, and `npm run lint` plus `npm run build` for the frontend. State clearly in the report if any of them was not run.

## Working notes

- The `target/` directory and the `images/` folder are build output or local data; avoid editing them by hand.
- `uploads/` and `mp3songs/` are tracked in git. Do not add or replace media files as part of a code change unless the user asks for it.
