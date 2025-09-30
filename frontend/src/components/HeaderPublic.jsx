import { Link } from "react-router-dom";

export default function HeaderPublic() {
    return (
        <header className="bg-black text-white px-6 py-3 shadow sticky top-0 w-full">
            <nav className="flex items-center justify-between">
                <Link to="/" className="h-16 flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-72 flex items-center" />
                </Link>
                <ul className="flex items-center gap-6 text-lg">
                    <li><Link to="/login" className="hover:underline">Ingresar</Link></li>
                    <li><Link to="/register" className="hover:underline">Registrarse</Link></li>
                    <li><Link to="/comojugar" className="hover:underline">Cómo Jugar</Link></li>
                </ul>
            </nav>
        </header>
    );
}
