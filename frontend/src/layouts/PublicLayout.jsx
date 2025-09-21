import { Footer } from "../components/Footer";
import HeaderPublic from "../components/HeaderPublic";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <>
            <HeaderPublic />
            <main className="w-full min-h-screen flex flex-col items-center justify-start
                            bg-gradient-to-b from-[#160040] via-[#1c0060] to-[#0a0235] text-white">
                {/* El fondo comun */}
                <img src="/fondo.png" alt="responde ya" className="mb-4 mt-6 w-3/4 max-w-xl rounded-2xl" />
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
