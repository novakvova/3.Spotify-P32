const env = {
    API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:8434',
    BASE_URL: '/',
    MP3_URL: '/mp3songs',
    UPLOADS_URL: '/uploads',
} as const

export default env