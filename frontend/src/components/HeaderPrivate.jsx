import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '../context/auth-context.jsx';
import { useTranslation } from 'react-i18next';

export default function HeaderPrivate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const { user, logout, loading } = useAuth();
  const API = 'http://localhost:3006';
  const isAdmin = user?.role === 'administrador';
  const name = user.name || user?.email?.split('@')[0] || 'Jugador';
  const fotoUrl = user?.foto_perfil ? `${API}${user.foto_perfil}` : null;
  const { t, i18n } = useTranslation();

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
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const fotoSrc = user?.foto_perfil ? `${API}${user.foto_perfil}?v=${Date.now()}` : null;

  return (
    <header className='bg-black px-6 py-4 font-semibold shadow sticky top-0 w-full z-50'>
      <nav className='flex items-center justify-between text-white'>
        <Link to='/' className='h-14 flex items-center group'>
          <div className='text-4xl font-black tracking-tight'>
            <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 text-transparent bg-clip-text hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 transition-all duration-300'>
              Dev
              <span className='text-cyan-400 hover:text-cyan-300 transition-colors duration-300'>
                2
              </span>
              Play
            </span>
          </div>
        </Link>

        {isAdmin ? (
          <ul className='flex items-center gap-6 text-lg'>
            <li className='flex items-center'>
              <Link to='/' className='hover:underline transition-all'>
                {t('home')}
              </Link>
            </li>
            <li className='flex items-center'>
              <Link to='/admin/categorias' className='hover:underline transition-all'>
                {t('admCategory')}
              </Link>
            </li>
            <li className='flex items-center'>
              <Link to='/tienda' className='hover:underline transition-all'>
                {t('admStore')}
              </Link>
            </li>
            <li className='flex items-center relative'>
              <Globe className='absolute left-2 text-white w-5 h-5 pointer-events-none z-10' />
              <select
                value={i18n.language}
                onChange={cambiarIdioma}
                className='cursor-pointer hover:scale-110 transition-transform p-2 pl-9 pr-3 rounded-full hover:bg-white/10 bg-transparent text-white border border-white/30 appearance-none'
              >
                <option value='es' className='bg-gray-800'>
                  ES
                </option>
                <option value='en' className='bg-gray-800'>
                  EN
                </option>
              </select>
            </li>
            <li className='relative flex items-center'>
              <button
                ref={btnRef}
                type='button'
                onClick={() => setOpen((v) => !v)}
                aria-haspopup='menu'
                aria-expanded={open}
                className='flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer transition-all'
              >
                <span aria-hidden className='flex items-center'>
                  {fotoSrc ? (
                    <img
                      src={fotoSrc}
                      alt='Foto de perfil'
                      className='w-7 h-7 rounded-full object-cover border-2 border-white/30'
                    />
                  ) : (
                    <span className='text-xl'>👤</span>
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
                  className='absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-50 top-full'
                >
                  <Link
                    to='/perfil'
                    role='menuitem'
                    className='block w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors'
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    role='menuitem'
                    className='block w-full px-4 py-3 text-left hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </li>
          </ul>
        ) : (
          <ul className='flex items-center gap-6 text-lg'>
            <li className='flex items-center'>
              <Link to='/' className='hover:underline transition-all'>
                {t('home')}
              </Link>
            </li>
            <li className='flex items-center'>
              <Link to='/tienda' className='hover:underline transition-all'>
                {t('store')}
              </Link>
            </li>
            <li className='flex items-center'>
              <Link to='/comoJugar' className='hover:underline transition-all'>
                {t('howToPlay')}
              </Link>
            </li>
            <li className='flex items-center relative'>
              <Globe className='absolute left-2 text-white w-5 h-5 pointer-events-none z-10' />
              <select
                value={i18n.language}
                onChange={cambiarIdioma}
                className='cursor-pointer hover:scale-110 transition-transform p-2 pl-9 pr-3 rounded-full hover:bg-white/10 bg-transparent text-white border border-white/30 appearance-none'
              >
                <option value='es' className='bg-gray-800'>
                  ES
                </option>
                <option value='en' className='bg-gray-800'>
                  EN
                </option>
              </select>
            </li>
            <li className='relative flex items-center'>
              <button
                ref={btnRef}
                type='button'
                onClick={() => setOpen((v) => !v)}
                aria-haspopup='menu'
                aria-expanded={open}
                className='flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer transition-all'
              >
                <span aria-hidden className='flex items-center'>
                  {fotoSrc ? (
                    <img
                      src={fotoSrc}
                      alt='Foto de perfil'
                      className='w-7 h-7 rounded-full object-cover border-2 border-white/30'
                    />
                  ) : (
                    <span className='text-xl'>👤</span>
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
                  className='absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden z-50 top-full'
                >
                  <Link
                    to='/perfil'
                    role='menuitem'
                    className='block w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors'
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    role='menuitem'
                    className='block w-full px-4 py-3 text-left hover:bg-gray-100 cursor-pointer transition-colors'
                  >
                    {t('logout')}
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
