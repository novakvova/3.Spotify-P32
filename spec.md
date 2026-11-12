# Spotify P32 — технічна специфікація

Цей документ описує поточний стан проєкту: структуру, технології, залежності та ключові архітектурні рішення. Він складений на основі коду репозиторію і не описує майбутні плани.

## 1. Огляд

Проєкт складається з двох незалежних застосунків, які взаємодіють через HTTP REST API:

| Компонент | Каталог | Призначення |
|---|---|---|
| Backend | `JavaSpringBootSpotify/` | REST API, авторизація, робота з БД, зберігання медіафайлів |
| Frontend | `vite-spotify/` | Одностороння SPA-програвач музики (React + TypeScript) |

Спільного кореневого білду немає. Кожен застосунок збирається й запускається окремо.

## 2. Структура репозиторію

```
3.Spotify-P32/
├── .vscode/                    # launch.json для запуску Spring Boot з .env
├── JavaSpringBootSpotify/
│   ├── pom.xml                 # Maven, Spring Boot 4.0.6
│   ├── DockerFile              # multi-stage: maven:3.8.4-openjdk-17 → eclipse-temurin:17-jdk
│   ├── java-p32.sh             # інтерактивний скрипт керування Docker-контейнером
│   ├── .env                    # секрети (jwt.secret, DB_PASSWORD, MAIL_*)
│   ├── src/main/java/org/example/
│   │   ├── Main.java
│   │   ├── config/             # SecurityConfig, WebConfig, OpenApiConfig
│   │   ├── controller/         # REST-контролери (/api/*)
│   │   ├── services/           # бізнес-логіка, JWT, пошта, збереження файлів
│   │   │   └── otp/            # генерація, зберігання та відправка OTP-кодів
│   │   ├── repositories/       # Spring Data JPA-інтерфейси
│   │   ├── entities/           # JPA-сутності
│   │   ├── dtos/               # запити і відповіді API
│   │   ├── mappers/            # MapStruct та ручні мапери
│   │   ├── validation/         # @ValidPassword + валідатор
│   │   ├── exceptions/         # ApiExceptionHandler, ApiError, AuthException
│   │   └── data/               # AppSeedData (початкове наповнення БД)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── seed-data.json
│   │   └── Templates/          # Thymeleaf: сторінки та листи
│   ├── mp3songs/               # аудіофайли (у git)
│   └── uploads/{original,medium,small}/   # зображення у трьох розмірах (у git)
└── vite-spotify/
    ├── vite.config.ts          # dev-сервер :5173 + проксі на :8434
    ├── eslint.config.js
    ├── package.json
    └── src/
        ├── App.tsx             # маршрутизація
        ├── main.tsx
        ├── pages/              # 22 сторінки
        ├── layouts/            # MainLayout, Sidebar, TopBar, PlayerBar, BottomNav
        ├── components/         # Header, Footer, FAQ, LanguageTranslator, ScrollToTop
        ├── store/              # Redux store, slices (auth, player, theme, language)
        ├── services/           # RTK Query API за доменами
        ├── hooks/useAudio.ts
        ├── types/              # інтерфейси, що повторюють DTO бекенду
        ├── utils/              # createBaseQuery, format
        └── env/index.ts        # константи середовища
```

Тестів (`src/test`, `*.test.*`, `*.spec.*`) у проєкті немає.

## 3. Технології

### Backend
- **Мова:** Java 17 (з Dockerfile)
- **Фреймворк:** Spring Boot 4.0.6 (батьківський POM), `spring-boot-maven-plugin` 4.0.5
- **Збірка:** Maven
- **Веб:** Spring Web MVC, Jackson
- **Безпека:** Spring Security 6 (stateless), JWT через jjwt 0.11.5
- **Персистентність:** Spring Data JPA (Hibernate), PostgreSQL (хмарна база Neon)
- **Шаблони:** Thymeleaf + thymeleaf-layout-dialect 4.0.1 + thymeleaf-extras-springsecurity6 (листи та серверні сторінки)
- **Пошта:** spring-boot-starter-mail, SMTP smtp.ukr.net:465 (SSL)
- **Обробка зображень:** Thumbnailator 0.4.20 (зменшення), TwelveMonkeys imageio-webp 3.9.4 (WebP)
- **Обробка аудіо:** mp3agic 0.9.1 (бібліотека для роботи з MP3-метаданими)
- **Мапінг:** MapStruct 1.6.3 (+ mapstruct-processor, provided)
- **Валідація:** spring-boot-starter-validation (Jakarta Validation)
- **Документація API:** springdoc-openapi 3.0.0 (Swagger UI)
- **Інше:** Lombok, Datafaker 2.5.4 (генерація тестових даних)

### Frontend
- **Мова:** TypeScript ~5.9
- **UI:** React 19, React DOM 19
- **Маршрутизація:** react-router-dom 7
- **Стан і запити:** Redux Toolkit 2.3 + react-redux 9, RTK Query
- **Форми:** react-hook-form 7.91, @hookform/resolvers, zod 4
- **Стилі:** Tailwind CSS 4.3 (через `@tailwindcss/vite`)
- **Іконки:** lucide-react
- **Інтернаціоналізація:** i18next 27.1, react-i18next 18.0, i18next-browser-languagedetector 8.3 (налаштування в `src/i18n/`, див. 6.5)
- **Збірка і dev-сервер:** Vite 6, @vitejs/plugin-react 4
- **Лінтинг:** ESLint 9 (flat config), typescript-eslint 8, eslint-plugin-react-hooks, eslint-plugin-react-refresh

### Інфраструктура
- **БД:** PostgreSQL (Neon, `neondb`), схема керується `ddl-auto=update`
- **Контейнеризація:** Docker (образ `novakvova/p32-java`)
- **Документація API:** Swagger UI на `/swagger-ui.html`

## 4. Залежності та їх роль

Backend-залежності розбиті на групи в `pom.xml`:

1. **Стартери Spring:** web, thymeleaf, data-jpa, security, validation, mail.
2. **Безпека:** jjwt-api (compile), jjwt-impl і jjwt-jackson (runtime).
3. **Медіа:** thumbnailator, imageio-webp, mp3agic.
4. **Мапінг і генерація коду:** mapstruct (+ процесор), lombok.
5. **Документація:** springdoc-openapi-starter-webmvc-ui.
6. **Допоміжні:** datafaker, jackson-databind, postgresql-driver.

Frontend-залежності (`package.json`): розділені на `dependencies` (рантайм) та `devDependencies` (ESLint, Vite, TypeScript, типи).

## 5. Архітектура бекенду

### 5.1. Шари
```
Controller  →  Service  →  Repository (Spring Data JPA)  →  Entity (PostgreSQL)
     ↕               ↕
    DTO         Mapper (MapStruct / ручний)
```
- Контролери приймають і повертають DTO, не сутності.
- Сервіси містять бізнес-логіку і керують транзакціями (`@Transactional`).
- Мапери перетворюють сутності на DTO. Частина з них написана вручну (наприклад `SongMapperManual`).

### 5.2. Сутності та зв'язки
Сім JPA-сутностей: `UserEntity`, `RoleEntity`, `LoginCodeEntity`, `Artist`, `Album`, `Song`, `Genre`.

- `Album` → `Artist` (`@ManyToOne`); `Song` → `Album` (`@ManyToOne`).
- `Artist` ↔ `Album`, `Album` ↔ `Song`: `@OneToMany` з `cascade = ALL`.
- `Song` ↔ `Genre`: `@ManyToMany` (зворотна сторона `mappedBy = "genres"`). Колекція жанрів завантажується `EAGER`.
- `UserEntity` ↔ `RoleEntity`: ролі користувача (`ADMIN`, `USER`).
- `LoginCodeEntity`: одноразові коди входу у таблиці `login_codes`.

### 5.3. Безпека і авторизація
- **Stateless JWT.** Сесій немає (`SessionCreationPolicy.STATELESS`), CSRF вимкнено, бо токен передається в заголовку `Authorization: Bearer`, а не в cookie.
- **Фільтр** `JwtAuthenticationFilter` (`OncePerRequestFilter`) перевіряє токен через `JwtUtil` і кладе `UserEntity` у `SecurityContext`.
- **Час життя токенів** задається властивостями: `jwt.expiration-ms` (за замовчуванням 1 година) для сесійного токена, `jwt.password-reset-expiration-ms` (за замовчуванням 10 хвилин) для скидання пароля.
- **Публічні маршрути:** `/api/auth/**`, `/uploads/**`, `/images/**`, Swagger-шляхи, `/error`. Решта вимагає автентифікації.
- **CORS:** дозволені origin задаються `app.cors.allowed-origins` (за замовчуванням `http://localhost:5173`).
- **Паролі** хешуються `BCryptPasswordEncoder`. Для них є власна анотація `@ValidPassword`.

### 5.4. Потоки автентифікації
Вхід починається з email:
1. `POST /api/auth/email-check`: перевірка, чи існує користувач.
2. Далі одна з двох гілок:
   - `POST /api/auth/login/email` → `POST /api/auth/login/code`: вхід за одноразовим кодом (OTP). Код генерує `NumericOtpCodeGenerator`, зберігає `OtpCodeStore`/`LoginCodeStore` з політикою `OtpPolicy` (ліміти спроб, TTL), відправляє `OtpSender` поштою.
   - `POST /api/auth/login/password`: вхід за паролем.
3. Скидання пароля: `POST /api/auth/password/forgot` надсилає лист з посиланням (`PasswordResetService`, `MailService`, шаблон `mail/password-reset-link.html`), а `POST /api/auth/password/reset` приймає новий пароль.
4. Реєстрація: `POST /api/auth/register` (`RegistrationService`).

Паралельно існують старі контролери (`AuthController`, `RegisterController`, `AccountController`), які обробляють корені `/login`, `/register`, `/profile`. Фронтенд їх проксує, але нові потоки йдуть через `/api/auth`.

### 5.5. Зберігання файлів
- **Зображення** (`SaveUserImageService`) зберігаються у трьох розмірах: `uploads/original`, `uploads/medium`, `uploads/small`. Зменшення виконує Thumbnailator, WebP підтримує TwelveMonkeys.
- **Аудіо** (`SaveMusicService`) зберігається в `mp3songs/`. Приймається лише `audio/mpeg`. Ім'я файлу: `UUID_назва.mp3`.
- **Роздача:** `WebConfig` реєструє статичні ресурси для `/mp3songs/**`, `/uploads/**` і `/images/**`, а `SecurityConfig` дозволяє доступ до `/uploads/**` і `/images/**` без токена.
- Ліміт розміру multipart: 20 МБ на файл і на запит.

### 5.6. Початкові дані
`data/AppSeedData` виконується при старті (`@PostConstruct`). Кожен крок пропускається, якщо відповідна таблиця вже не порожня:
1. ролі `ADMIN` і `USER`;
2. адміністратор;
3. жанри;
4. `seed-data.json` (артисти, альбоми, пісні).

Схема БД створюється автоматично (`spring.jpa.hibernate.ddl-auto=update`). Міграцій немає, тому зміни схеми застосовуються без контролю версій.

### 5.7. Обробка помилок
`ApiExceptionHandler` (`@RestControllerAdvice`) перетворює винятки на уніфікований `ApiError`. `AuthException` використовується для помилок автентифікації.

### 5.8. Конфігурація
- `application.properties` містить налаштування БД, JPA, multipart, Swagger, пошти та JWT.
- `spring.config.import=optional:file:./.env[.properties]` підвантажує секрети з `.env`.
- Dev-прапорці `app.dev.expose-code` і `app.dev.expose-reset-link` повертають OTP-код і посилання скидання в API-відповіді. Вони мають бути вимкнені в продакшені.

## 6. Архітектура фронтенду

### 6.1. Стан
`store/index.ts` поєднує:
- **Звичайні slice:** `auth` (токен і користувач), `player` (стан програвача), `theme`, `language`.
- **RTK Query API**, по одному на домен: `authApi`, `songsApi`, `genresApi`, `artistsApi`, `albumsApi`, `searchApi`. Кожен лежить у `services/<domain>/` і використовує `createBaseQuery`.

`createBaseQuery` (`fetchBaseQuery`) додає заголовок `Authorization: Bearer <token>`, якщо токен є в `localStorage`.

Токен і користувач зберігаються в `localStorage` (ключі `token` і `user`). Вихід із системи має очищати обидва.

### 6.2. Маршрутизація (`App.tsx`)
Три групи маршрутів:
- **Публічні сторінки:** `/`, `/premium`, `/premium/{student,family,duo,kids}`, `/support`, `/support/payment-methods`, `/about`, `/community`.
- **Застосунок** в обгортці `MainLayout`: `/songs`, `/genres`, `/artists`, `/albums`, `/me`, `/search` та деталі `/albums/:id`, `/artists/:id`, `/genres/:id`.
- **Автентифікація:** `/login`, `/register`, `/forgot-password`, `/forgot-password/:token`.

### 6.3. Програвач
- `playerSlice` зберігає стан відтворення.
- `hooks/useAudio.ts` інкапсулює роботу з аудіоелементом.
- `layouts/PlayerBar` (і `BottomNav` для мобільних) відображає керування.
- Аудіо віддається бекендом з `/mp3songs/`.

### 6.4. Типи
Інтерфейси в `src/types/` (`ISong`, `IAlbum`, `IArtist`, `IGenre`, `IUser`, `IProfile`, `IPageResponse`, …) описують DTO бекенду вручну. Зміна DTO на сервері потребує оновлення типів вручну.

### 6.5. Інтернаціоналізація і теми
- **Поточний механізм перекладу:** `components/LanguageTranslator.tsx` замінює текст у DOM за словником `EXACT_TRANSLATIONS` (українська → англійська) і за частковими збігами. Мова зберігається в `languageSlice` (`uk` / `en`) і в `localStorage` під ключем `lang`.- **i18next:** `src/i18n/index.ts` ініціалізує i18next з `LanguageDetector` (тільки `localStorage`, ключ `lang`, fallback `uk`). Переклади лежать у `src/i18n/locales/{uk,en}.ts`. `main.tsx` синхронізує `languageSlice` з i18next. Підключено `Footer.tsx`, `Header.tsx`, `FAQ.tsx`. Питання й відповіді FAQ, що передаються зі сторінок як props, ще не перекладені в i18next.
- **Залишок:** інші сторінки ще перекладаються словником `EXACT_TRANSLATIONS`. Їх варто поступово перевести на i18next і тоді прибрати словник.
- `themeSlice` керує темою оформлення.
- `ScrollToTop` монтується глобально.

### 6.6. Конфігурація середовища
- `vite.config.ts`: dev-сервер на порту 5173, проксі `/api`, `/register`, `/login`, `/profile`, `/mp3songs`, `/uploads` на `localhost:8434`.
- `src/env/index.ts` визначає `API_URL` (`VITE_API_URL`), але **не використовується**: RTK Query працює з `baseUrl: '/'` і йде через проксі.

## 7. Ключові архітектурні рішення

| Рішення | Обґрунтування / наслідки |
|---|---|
| Розділення на SPA і REST API | Фронтенд і бекенд незалежні, взаємодіють через JSON. Дозволяє окремо розгортати й масштабувати. |
| Stateless JWT замість сесій | Сервер не зберігає сесій, токен передається в заголовку. Немає CSRF-ризику через cookie. Токен неможливо відкликати до закінчення строку (потрібен окремий механізм, якого зараз немає). |
| Вхід через email + OTP | Пароль не є обов'язковим, спрощує вхід. Коди мають TTL і ліміти спроб (`OtpPolicy`). |
| Зберігання медіа у файловій системі | Простота без окремого сховища. Але шлях відносний до робочої директорії, контейнер потребує volume, а файли лежать у git. |
| Зображення у трьох розмірах | Швидке завантаження списків (small/medium) і оригінал для деталей. |
| Схема БД через `ddl-auto=update` | Швидкий старт без міграцій. Небезпечно для продакшену: немає відстежуваних змін схеми. |
| Засів даних при старті | Ідемпотентний: кожен крок пропускається, якщо дані вже є. |
| RTK Query для серверного стану | Кешування, дедуплікація запитів і автоматичне оновлення стану без ручного `useEffect`. |
| Dev-проксі Vite замість CORS у розробці | Фронтенд звертається на відносні шляхи, CORS на dev-сервері не потрібен. |
| Dev-прапорці для OTP і посилань | Спрощують локальне тестування, але мають бути вимкнені в продакшені. |

## 8. Відомі проблеми та ризики

1. **Секрети в git.** `application.properties` містить пароль БД, пароль пошти та посилання на JWT-секрет у відкритому вигляді. Файл відстежується git. Рекомендовано: винести в змінні середовища або `.env`, що не потрапляє в репозиторій, і ротувати скомпрометовані значення.
2. **Розбіжність портів.** `server.port=8434`, `EXPOSE 8087` у Dockerfile, мапінг `6892:8081` у `java-p32.sh`. Потрібне узгодження.
3. **Немає тестів** ні в бекенді, ні у фронтенді.
4. **Немає міграцій БД.** `ddl-auto=update` не відстежує зміни схеми.
5. **Ненаведений `API_URL`.** Константа у `env/index.ts` не використовується.
6. **Дублювання auth-контролерів.** Старі (`/login`, `/register`, `/profile`) і нові (`/api/auth/*`) потоки існують паралельно.
7. **Ручна синхронізація типів** між бекендом і фронтендом.
8. **Медіа в git.** Файли `mp3songs/` і `uploads/` відстежуються, що роздуває репозиторій.
9. **Відсутній Maven Wrapper** (`mvnw`), тому збірка залежить від локально встановленого Maven.
10. **Змішана мова коментарів і інтерфейсу** (переважно українська, частково англійська).
11. **Два механізми перекладу.** Словник у `LanguageTranslator` для решти сторінок і i18next для `Footer.tsx` працюють одночасно. Потрібно перевести решту сторінок на i18next.
12. **Незакомічені зміни.** Додані i18next-залежності, `src/i18n/` і зміни в `Footer.tsx`/`main.tsx` ще не закомічені.
13. **Непослідовність сервісів.** `SongService.getSongById` повертає `null` замість винятку, тоді як автентифікація використовує `AuthException`.
