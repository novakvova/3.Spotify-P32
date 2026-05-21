import type {IArtist} from "./IArtist.ts";

export interface IAlbum {
    id: number;
    title: string;
    releaseYear: number;
    artist: IArtist;
}