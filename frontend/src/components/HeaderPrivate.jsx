import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from "../context/auth-context.jsx";

const getStoredUser = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { name: raw };
  }
};

export default function HeaderPrivate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  //const [user, setUser] = useState(getStoredUser);
  const { user, updateUser, logout, loading } = useAuth();
  const API = "http://localhost:3006"; // URL base de tu API
  const isAdmin = user?.role === 'administrador';
  const name = user.name || user?.email?.split('@')[0] || 'Jugador';
  const fotoUrl = user?.foto_perfil ? `${API}${user.foto_perfil}` : null;
  //console.log(name);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const fotoSrc = user?.foto_perfil
    ? `${API}${user.foto_perfil}?v=${Date.now()}` // cache-buster
    : null;

  if (loading) {
    // opcional: mientras el AuthContext resuelve el user inicial (p. ej. desde localStorage)
    return (
      <header className='bg-black px-6 py-3 font-semibold shadow sticky top-0 w-full z-10'>
        <nav className='flex items-center justify-between text-white'>
          <img src='/logo.png' alt='Logo' className='h-72' />
          <span>Cargando…</span>
        </nav>
      </header>
    );
  }

  return (
    <header className='bg-black px-6 py-3 font-semibold shadow sticky top-0 w-full z-10'>
      <nav className='flex items-center justify-between text-white'>
        <Link to='/' className='h-16 flex items-center'>
          <img src='/logo.png' alt='Logo' className='h-72 flex items-center' />
        </Link>
        {isAdmin ? (
          <ul className='flex items-center gap-6 text-lg'>
            <li>
              <Link to='/' className='hover:underline'>
                Inicio
              </Link>
            </li>
            <li>
              <Link to='/admin/categorias' className='hover:underline'>
                Administrar Categorias
              </Link>
            </li>
            <li>
              <Link to='/tienda' className='hover:underline'>
                Administrar Tienda
              </Link>
            </li>
            <li className='relative'>
              <button
                ref={btnRef}
                type='button'
                onClick={() => setOpen((v) => !v)}
                aria-haspopup='menu'
                aria-expanded={open}
                className='flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-black/30 cursor-pointer'
              >
                {/* <span aria-hidden>
                  {foto == null ?
                    (<p>👤</p>)
                    :
                    (<img
                      src={
                        preview
                          ? preview
                          : user?.foto_perfil
                            ? `${API}${user.foto_perfil}` // el server devuelve ruta relativa
                            : "https://placehold.co/128x128?text=Foto" // placeholder opcional
                      }
                      alt="Foto de perfil"
                      className="w-32 h-32 rounded-full object-cover bg-white/20"
                    />)}
                </span> */}
                <span aria-hidden>
                  {fotoSrc ? (
                    <img
                      src={fotoSrc}
                      alt="Foto de perfil"
                      className="w-6 h-6 rounded-full object-cover bg-white/20"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </span>
                <span className='opacity-90'>{name}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.22 3.815a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.06z' />
                </svg>
              </button>

              {open && (
                <div
                  ref={menuRef}
                  role='menu'
                  aria-label='Menú de usuario'
                  className='absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-50'
                >
                  <Link
                    to='/perfil'
                    role='menuitem'
                    className='block w-full px-4 py-2 text-left hover:bg-gray-100'
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    role='menuitem'
                    className='block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer'
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </li>
          </ul>
        ) : (
          <ul className='flex items-center gap-6 text-lg'>
            <li>
              <Link to='/' className='hover:underline'>
                Inicio
              </Link>
            </li>
            <li>
              <Link to='/tienda' className='hover:underline'>
                Tienda
              </Link>
            </li>
            <li>
              <Link to='/comojugar' className='hover:underline'>
                Cómo Jugar
              </Link>
            </li>
            <li>
              <button className='cursor-pointer'>EN|ES</button>
            </li>
            <li className='relative'>
              <button
                ref={btnRef}
                type='button'
                onClick={() => setOpen((v) => !v)}
                aria-haspopup='menu'
                aria-expanded={open}
                className='flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-black/30 cursor-pointer'
              >
                <span aria-hidden>
                  {fotoSrc ? (
                    <img
                      src={fotoSrc}
                      alt="Foto de perfil"
                      className="w-6 h-6 rounded-full object-cover bg-white/20"
                    />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </span>
                <span className='opacity-90'>{name}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path d='M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.22 3.815a.75.75 0 01-1.02 0L5.25 8.33a.75.75 0 01-.02-1.06z' />
                </svg>
              </button>
              {open && (
                <div
                  ref={menuRef}
                  role='menu'
                  aria-label='Menú de usuario'
                  className='absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-50'
                >
                  <Link
                    to='/perfil'
                    role='menuitem'
                    className='block w-full px-4 py-2 text-left hover:bg-gray-100'
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    role='menuitem'
                    className='block w-full px-4 py-2 text-left hover:bg-gray-100 cursor-pointer'
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
