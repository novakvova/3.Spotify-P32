import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import SongsPage from './pages/SongsPage'
import GenresPage from './pages/GenresPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ArtistsPage from "./pages/ArtistPage.tsx";
import AlbumsPage from "./pages/AlbumsPage.tsx";
import AlbumDetailsPage from "./pages/AlbumDetailsPage.tsx";
import GenreDetailsPage from "./pages/GenreDetailsPage.tsx";
import ArtistDetailsPage from "./pages/ArtistDetailsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import {MainPage} from "./pages/MainPage.tsx";
import {StudentPage} from "./pages/StudentPage.tsx";
import {FamilyPage} from "./pages/FamilyPage.tsx";
import {DuoPage} from "./pages/DuoPage.tsx";
import {KidsPage} from "./pages/KidsPage.tsx";
import {ScrollToTop} from "./components/ScrollToTop.tsx";


export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <ScrollToTop/>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    {/* Маршрути для підписок Sonora Premium */}
                    <Route path="/premium" element={<MainPage />} />
                    <Route path="/premium/student" element={<StudentPage />} />
                    <Route path="/premium/family" element={<FamilyPage />} />
                    <Route path="/premium/duo" element={<DuoPage />} />
                    <Route path="/premium/kids" element={<KidsPage />} />
                    <Route element={<MainLayout />}>
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
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/forgot-password/:token" element={<ForgotPasswordPage />} />

                </Routes>
            </BrowserRouter>
        </Provider>
    )
}