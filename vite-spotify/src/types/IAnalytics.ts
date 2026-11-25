export interface IAnalyticsSummary {
    totalPlays: number
    avgPlaysPerTrack: number
    avgTracksPerAlbum: number
    avgTracksPerArtist: number
    totalSongs: number
    totalAlbums: number
    totalArtists: number
    totalGenres: number
}

export interface IAnalyticsTopSong {
    id: number
    name: string
    artistName: string | null
    albumTitle: string | null
    coverUrl: string | null
    playCount: number
}

export interface IAnalyticsTopArtist {
    id: number
    name: string
    imageUrl: string | null
    tracksCount: number
    playsCount: number
}

export interface IAnalyticsTopAlbum {
    id: number
    title: string
    artistName: string | null
    releaseYear: number | null
    coverUrl: string | null
    tracksCount: number
    playsCount: number
}

export interface IAnalyticsGenre {
    genreId: number
    genreName: string
    playsCount: number
    tracksCount: number
}

export interface IAnalyticsDecade {
    decadeStart: number
    label: string
    albumsCount: number
    tracksCount: number
    playsCount: number
}

export interface IPlatformAnalytics {
    summary: IAnalyticsSummary
    topSongs: IAnalyticsTopSong[]
    topArtists: IAnalyticsTopArtist[]
    topAlbums: IAnalyticsTopAlbum[]
    genres: IAnalyticsGenre[]
    decades: IAnalyticsDecade[]
    latestSongs: IAnalyticsTopSong[]
}

export interface ISongPlayStat {
    id: number
    name: string
    artistName: string | null
    albumTitle: string | null
    coverUrl: string | null
    playCount: number
}

export interface IAlbumTrackStat {
    id: number
    title: string
    artistName: string | null
    releaseYear: number | null
    coverUrl: string | null
    tracksCount: number
    playsCount: number
}

export interface IArtistCatalogStat {
    id: number
    name: string
    imageUrl: string | null
    albumsCount: number
    tracksCount: number
    playsCount: number
}

export interface IGenreTrackStat {
    id: number
    name: string
    tracksCount: number
    playsCount: number
}

export interface ITrackPlayRequest {
    listenedSeconds: number
    durationSeconds?: number
}

export interface ITrackPlayResponse {
    counted: boolean
    reason: string
    playCount: number
}
