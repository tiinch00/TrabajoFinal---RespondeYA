import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function HeaderPublic() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  const cambiarIdioma = (e) => {
    const nuevoIdioma = e.target.value;
    i18n.changeLanguage(nuevoIdioma);
    localStorage.setItem('idioma', nuevoIdioma);
  };

  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const menuLinks = [
    { to: '/login', label: t('login') },
    { to: '/register', label: t('register') },
    { to: '/comoJugar', label: t('howToPlay') },
  ];

  return (
    <header className='bg-black text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 shadow sticky top-0 w-full z-50 font-semibold'>
      <nav className='flex items-center justify-between'>
        <Link to='/' className='h-10 sm:h-12 md:h-14 flex items-center group flex-shrink-0'>
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

        <ul className='hidden md:flex items-center gap-4 lg:gap-6 text-base lg:text-lg'>
          {menuLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className='hover:text-purple-400 hover:underline transition-all'>
                {link.label}
              </Link>
            </li>
          ))}

          <li className='flex items-center relative'>
            <Globe className='absolute left-2 text-white w-4 h-4 pointer-events-none z-10' />
            <select
              value={i18n.language}
              onChange={cambiarIdioma}
              className='cursor-pointer hover:scale-110 transition-transform p-2 pl-8 pr-2 rounded-full hover:bg-white/10 bg-transparent text-white border border-white/30 appearance-none text-sm lg:text-base'
            >
              <option value='es' className='bg-gray-800'>
                ES
              </option>
              <option value='en' className='bg-gray-800'>
                EN
              </option>
            </select>
          </li>
        </ul>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='md:hidden p-2 hover:bg-white/10 rounded-lg transition-all'
          aria-label='Abrir menú'
        >
          {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className='md:hidden mt-4 pb-4 border-t border-white/20 pt-4 space-y-3'
        >
          {menuLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className='block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm'
            >
              {link.label}
            </Link>
          ))}

          <div className='px-4 py-2 flex items-center gap-2'>
            <Globe className='w-4 h-4' />
            <select
              value={i18n.language}
              onChange={cambiarIdioma}
              className='cursor-pointer flex-1 p-2 rounded-lg bg-white/10 border border-white/30 text-white text-sm appearance-none'
            >
              <option value='es' className='bg-gray-800'>
                Español
              </option>
              <option value='en' className='bg-gray-800'>
                English
              </option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
