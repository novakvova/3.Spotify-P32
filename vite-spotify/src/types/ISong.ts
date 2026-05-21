export interface ISong {
    id: number;
    name: string;
    fileName: string;
    artist: string | null;
    album: string | null;
    genres: string[];
}