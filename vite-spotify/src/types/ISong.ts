export interface ISong {
    id: number
    name: string
    fileName: string
    artist_name: string | null
    album_title: string | null
    genres_names: string[]
}