import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Music } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectShowAuthModal, setShowAuthModal } from '../store/slices/playerSlice'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import PlayerBar from './PlayerBar'
import BottomNav from './BottomNav'
import { Footer } from '../components/Footer'

export default function MainLayout() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const showAuthModal = useAppSelector(selectShowAuthModal)

    return (
        <div className="min-h-screen w-full flex flex-col bg-sonora-dark font-inter text-white pb-28">
            <div className="sticky top-0 z-40 w-full">
                <TopBar />
            </div>

            <div className="w-full flex items-stretch flex-1 px-5 mt-2.5 gap-2.5">
                <Sidebar />

                <main className="flex-1 min-w-0 flex flex-col bg-sonora-panel rounded-xl pt-5 px-5 pb-8 min-h-screen">
                    <Outlet />
                </main>

                <aside className="hidden xl:block shrink-0 w-20 bg-sonora-panel rounded-xl" />
            </div>

            {showAuthModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-sonora-deep/80 backdrop-blur-xs"
                    onClick={() => dispatch(setShowAuthModal(false))}
                >
                    <div
                        className="relative w-full max-w-md rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl border border-white/20 bg-gradient-to-br from-sonora-panel to-sonora-dark"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => dispatch(setShowAuthModal(false))}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label={t('webPlayer.close')}
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 text-white shadow-lg bg-gradient-to-br from-sonora-purple to-sonora-light">
                            <Music size={30} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3">
                            {t('webPlayer.authModalTitle')}
                        </h3>

                        <p className="text-sm text-white/85 leading-relaxed mb-7">
                            {t('webPlayer.authModalDesc')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                            <Link
                                to="/register"
                                onClick={() => dispatch(setShowAuthModal(false))}
                                className="w-full sm:flex-1 py-3 px-6 rounded-full font-bold text-sm bg-white text-sonora-dark text-center hover:scale-105 transition-transform"
                            >
                                {t('header.signUp')}
                            </Link>
                            <Link
                                to="/login"
                                onClick={() => dispatch(setShowAuthModal(false))}
                                className="w-full sm:flex-1 py-3 px-6 rounded-full font-bold text-sm text-white border border-white text-center hover:bg-white/10 transition-colors"
                            >
                                {t('header.logIn')}
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={() => dispatch(setShowAuthModal(false))}
                            className="mt-5 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                            {t('webPlayer.close')}
                        </button>
                    </div>
                </div>
            )}

            <Footer />

            <PlayerBar />

            <BottomNav />
        </div>
    )
}
