import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import PlayerBar from './PlayerBar'
import BottomNav from './BottomNav'

export default function MainLayout() {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">


            <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-144px)] md:h-[calc(100vh-80px)] overflow-hidden">
                <Sidebar />

                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
                        <Outlet />
                    </main>
                </div>
            </div>

            <PlayerBar />

            <BottomNav />
        </div>
    )
}