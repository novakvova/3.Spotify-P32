import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import SongsPage from './pages/SongsPage'
import GenresPage from './pages/GenresPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ArtistsPage from "./pages/ArtistPage.tsx";
import AlbumsPage from "./pages/AlbumsPage.tsx";
import AlbumDetailsPage from "./pages/AlbumDetailsPage.tsx";
import GenreDetailsPage from "./pages/GenreDetailsPage.tsx";
import ArtistDetailsPage from "./pages/ArtistDetailsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SearchPage from "./pages/SearchPage.tsx";

export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route path="/"        element={<HomePage />} />
                        <Route path="/songs"   element={<SongsPage />} />
                        <Route path="/genres"  element={<GenresPage />} />
                        <Route path="/artists" element={<ArtistsPage />} />
                        <Route path="/albums"  element={<AlbumsPage />} />
                        <Route path="/albums/:id"  element={<AlbumDetailsPage />} />
                        <Route path="/artists/:id" element={<ArtistDetailsPage />} />
                        <Route path="/genres/:id"  element={<GenreDetailsPage />} />
                        <Route path="/me" element={<ProfilePage />} />
                        <Route path="/search" element={<SearchPage />} />
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    )
}