import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// helper para leer "user" de localStorage de forma segura
const getStoredUser = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        // si es JSON válido: { id, name, email, ... }
        return JSON.parse(raw);
    } catch {
        // si alguna vez guardaste solo un string con el nombre
        return { name: raw };
    }
};

export default function HeaderPrivate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const btnRef = useRef(null);
    const [user, setUser] = useState(getStoredUser);

    //console.log(user.name);

    const name = user.name || (user?.email?.split("@")[0]) || "Jugador";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    // Cerrar al click fuera
    useEffect(() => {
        const onDocClick = (e) => {
            if (!menuRef.current || !btnRef.current) return;
            if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    // Cerrar con Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Cerrar al cambiar de ruta
    useEffect(() => { setOpen(false); }, [location.pathname]);



    return (
        <header className="bg-orange-300 px-6 py-3 font-semibold shadow sticky top-0 w-full">
            <nav className="flex items-center justify-between">
                <Link to="/" className="h-16 flex items-center">                    
                    <img src="/logo.png" alt="Logo" className="h-72 flex items-center" />
                </Link>
                <ul className="flex items-center gap-6 text-lg">                    
                    <li><Link to="/" className="hover:underline">Inicio</Link></li>
                    <li><Link to="/tienda" className="hover:underline">Tienda</Link></li>
                    <li><Link to="/comojugar" className="hover:underline">Cómo Jugar</Link></li>
                    <li><Link to="/ChatGlobal" className="hover:underline">Chat Global</Link></li>
                    <li>
                        <button className="cursor-pointer">EN|ES</button>
                    </li>                    

                    {/* Menu desplegable de usuario */}
                    <li className="relative">
                        <button
                            ref={btnRef}
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={open}
                            className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-black/30 cursor-pointer"
                        >
                            <span aria-hidden>👤</span>
                            <span className="opacity-90">{name}</span>
                            <svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.22 3.815a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.06z" /></svg>
                        </button>

                        {open && (
                            <div
                                ref={menuRef}
                                role="menu"
                                aria-label="Menú de usuario"
                                className="absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-50"
                            >
                                <Link
                                    to="/perfil"
                                    role="menuitem"
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                                >
                                    Ver perfil
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    role="menuitem"
                                    className="block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
}
