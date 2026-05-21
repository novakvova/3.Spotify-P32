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
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    )
}