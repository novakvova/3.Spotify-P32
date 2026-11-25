export interface ISong {
    id: number
    name: string
    fileName: string
    coverUrl?: string | null
    artist_name: string | null
    album_title: string | null
    genres_names: string[]
    playCount?: number
}