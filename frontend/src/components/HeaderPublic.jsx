import { Globe, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <header className='bg-black/80 px-4 sm:px-6 lg1120:px-2 py-3 sm:py-4 lg1120:py-0 xl:py-4  font-semibold shadow-2xl sticky top-0 w-full z-50 border-b-2 border-purple-500/30'>
      
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
        
        <Link to='/' className='h-10 sm:h-12 md:h-14 flex items-center group flex-shrink-0'>

          <div className='text-2xl sm:text-3xl lg1120:text-2xl xl:text-4xl font-black tracking-tight'>

            <span className='bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 text-transparent bg-clip-text hover:from-purple-300 hover:via-pink-300 hover:to-purple-400 transition-all duration-300'>
              Dev
              <span className='text-cyan-400 hover:text-cyan-300 transition-colors duration-300'>
                2
              </span>
              Play
            </span>
            
          </div>
        </Link>

        <ul className='hidden md:flex items-center gap-3 lg:gap-5 lg1120:gap-1 text-base lg:text-lg lg1120:text-base'>
          {menuLinks.map((link) => (
            <li key={link.to} className='flex items-center'>
              <Link
                to={link.to}
                className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'text-pink-300 bg-white/10 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
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
              <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4 
              xl:w-4 xl:h-4 pointer-events-none z-10 group-hover:text-purple-300 transition-colors' />
              <select
                value={i18n.language}
                onChange={cambiarIdioma}
                className='cursor-pointer hover:scale-105 transition-all 
                p-2 pl-9 pr-3 xl:p-2 xl:pl-9 xl:pr-3
                lg1120:p-1 lg1120:pl-9 lg1120:pr-2
                rounded-full bg-white/10 backdrop-blur-sm text-white border-2 border-purple-400/30 hover:border-cyan-400/50 appearance-none text-sm lg:text-base lg1120:text-xs xl:text-base font-bold shadow-lg hover:shadow-cyan-400/20'
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
          {menuLinks.map((link) => (
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
        </div>
      )}
    </header>
  );
}
