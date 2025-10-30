import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function HeaderPublic() {
  const { t, i18n } = useTranslation();

  const cambiarIdioma = (e) => {
    const nuevoIdioma = e.target.value;
    i18n.changeLanguage(nuevoIdioma);
    localStorage.setItem('idioma', nuevoIdioma);
  };

  return (
    <header className='bg-black text-white px-6 py-3 shadow sticky top-0 w-full'>
      <nav className='flex items-center justify-between'>
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
        <ul className='flex items-center gap-6 text-lg'>
          <li>
            <Link to='/login' className='hover:underline'>
              {t('login')}
            </Link>
          </li>
          <li>
            <Link to='/register' className='hover:underline'>
              {t('register')}
            </Link>
          </li>
          <li>
            <Link to='/comoJugar' className='hover:underline'>
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
        </ul>
      </nav>
    </header>
  );
}
