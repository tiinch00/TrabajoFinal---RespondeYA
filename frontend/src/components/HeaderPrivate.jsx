import { Globe, Menu, Sparkles, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/auth-context.jsx';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
const resolveUserPhoto = (fp) => {
  if (!fp) return null;

  // viene de /assets/... (public del front)
  if (fp.startsWith('/assets/')) return fp;

  // ya es URL absoluta
  if (/^https?:\/\//.test(fp)) return fp;

  // ruta típica del backend
  if (fp.startsWith('/uploads/')) return `${API_URL}${fp}`;

  // fallback por si guardaste otra cosa relativa
  return `${API_URL}${fp}`;
};

export default function HeaderPrivate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { user, logout, loading } = useAuth();
  const isAdmin = user?.role === 'administrador';
  const name = user.name || user?.email?.split('@')[0] || 'Jugador';
  const fotoUrl = user?.foto_perfil ? `${API_URL}${user.foto_perfil}` : null;
  const { t, i18n } = useTranslation();

  const rawPhoto = user?.foto_perfil ?? null;
  const baseFoto = rawPhoto ? resolveUserPhoto(rawPhoto) : null;
  // cache busting sin romper URLs que ya tienen query
  const fotoSrc = baseFoto
    ? `${baseFoto}${baseFoto.includes('?') ? '&' : '?'}v=${Date.now()}`
    : null;

  const cambiarIdioma = (e) => {
    const nuevoIdioma = e.target.value;
    i18n.changeLanguage(nuevoIdioma);
    localStorage.setItem('idioma', nuevoIdioma);
  };

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
      if (e.key === 'Escape') {
        setOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const adminLinks = [
    { to: '/', label: t('home') },
    { to: '/admin/categorias', label: t('admCategory') },
    { to: '/tienda', label: t('admStore') },
    { to: '/admin/estadisticas', label: t('admStadistics') },
  ];

  const userLinks = [
    { to: '/', label: t('home') },
    { to: '/tienda', label: t('store') },
    { to: '/comoJugar', label: t('howToPlay') },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <header className=' bg-black/80 px-4 sm:px-6 py-3 sm:py-4 font-semibold shadow-2xl sticky top-0 w-full z-50 border-b-2 border-purple-500/30'>
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer'></div>
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/2 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60'></div>
        <div
          className='absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-50'
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div
          className='absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-40'
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <nav className='relative flex items-center justify-between text-white'>
        <Link
          to='/'
          className='h-10 sm:h-12 md:h-14 flex items-center group flex-shrink-0'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className='text-2xl sm:text-3xl md:text-4xl font-black tracking-tight'>
            <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 text-transparent bg-clip-text hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 transition-all duration-300'>
              Dev
              <span className='text-cyan-400 hover:text-cyan-300 transition-colors duration-300'>
                2
              </span>
              Play
            </span>
          </div>
        </Link>

        <ul className='hidden md:flex items-center gap-3 lg:gap-5 text-base lg:text-lg'>
          {links.map((link) => (
            <li key={link.to} className='flex items-center'>
              <Link
                to={link.to}
                className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'text-pink-300  bg-white/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                    : 'hover:text-cyan-300 hover:bg-white/5'
                } font-semibold`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></span>
                )}
              </Link>
            </li>
          ))}

          <li className='flex items-center relative'>
            <div className='relative group'>
              <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4 pointer-events-none z-10 group-hover:text-purple-300  transition-colors' />
              <select
                value={i18n.language}
                onChange={cambiarIdioma}
                className='cursor-pointer hover:scale-105 transition-all p-2 pl-9 pr-3 rounded-full bg-white/10 backdrop-blur-sm text-white border-2 border-purple-400/30 hover:border-cyan-400/50 appearance-none text-sm lg:text-base font-bold shadow-lg hover:shadow-cyan-400/20'
              >
                <option value='es' className='bg-purple-900'>
                  ES
                </option>
                <option value='en' className='bg-purple-900'>
                  EN
                </option>
              </select>
            </div>
          </li>

          <li className='relative flex items-center'>
            <button
              ref={btnRef}
              type='button'
              onClick={() => setOpen((v) => !v)}
              aria-haspopup='menu'
              aria-expanded={open}
              className='flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm px-4 py-2 hover:from-purple-500/40 hover:to-pink-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 cursor-pointer transition-all text-sm lg:text-base border-2 border-purple-400/30 hover:border-pink-400/50 shadow-lg hover:shadow-pink-400/20 hover:scale-105'
            >
              <span aria-hidden className='flex items-center'>
                {fotoSrc ? (
                  <img
                    src={fotoSrc}
                    alt='Foto de perfil'
                    className='w-7 h-7 rounded-full object-cover border-2 border-cyan-300/50 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                  />
                ) : (
                  <span className='text-xl'>👤</span>
                )}
              </span>
              <span className='font-bold hidden sm:inline bg-gradient-to-r from-white to-cyan-200 text-transparent bg-clip-text'>
                {name}
              </span>
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
                className='absolute right-0 mt-2 w-52 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-2xl ring-2 ring-purple-400/30 overflow-hidden z-50 top-full text-sm backdrop-blur-xl border border-purple-400/20'
              >
                <Link
                  to='/perfil'
                  role='menuitem'
                  className='block w-full px-5 py-3 text-left hover:bg-white/10 transition-all font-semibold hover:text-cyan-300 border-b border-purple-400/20'
                >
                  ✨ {t('profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  role='menuitem'
                  className='block w-full px-5 py-3 text-left hover:bg-white/10 cursor-pointer transition-all font-semibold text-pink-300 hover:text-pink-200'
                >
                  🚪 {t('logout')}
                </button>
              </div>
            )}
          </li>
        </ul>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='md:hidden p-2 hover:bg-white/10 rounded-xl transition-all border-2 border-purple-400/30 hover:border-cyan-400/50 hover:scale-105 backdrop-blur-sm'
          aria-label='Abrir menú'
        >
          {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className='md:hidden mt-4 text-white pb-4 border-t-2 border-purple-400/30 pt-4 space-y-2 backdrop-blur-sm bg-black/20 rounded-2xl p-3'
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                location.pathname === link.to
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-cyan-300 border-2 border-cyan-400/30'
                  : 'hover:bg-white/10 border-2 border-transparent hover:border-purple-400/30'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className='px-4 py-3 flex items-center gap-3 bg-white/5 rounded-xl border-2 border-purple-400/20'>
            <Globe className='w-5 h-5 text-purple-300' />
            <select
              value={i18n.language}
              onChange={cambiarIdioma}
              className='cursor-pointer flex-1 p-2 rounded-lg bg-white/10 border-2 border-purple-400/30 text-white text-sm appearance-none font-bold backdrop-blur-sm'
            >
              <option value='es' className='bg-purple-900'>
                Español
              </option>
              <option value='en' className='bg-purple-900'>
                English
              </option>
            </select>
          </div>

          {/* USER MENU MOBILE */}
          <Link
            to='/perfil'
            className='block px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-sm border-t-2 border-purple-400/20 mt-3 pt-3 font-semibold hover:text-cyan-300'
          >
            ✨ {t('profile')}
          </Link>
          <button
            onClick={handleLogout}
            className='block w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl transition-all text-sm text-pink-300 hover:text-pink-200 font-semibold'
          >
            🚪 {t('logout')}
          </button>
        </div>
      )}

      {/* <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style> */}
    </header>
  );
}
