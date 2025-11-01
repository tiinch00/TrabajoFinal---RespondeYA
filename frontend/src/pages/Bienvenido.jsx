import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Bienvenido = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className='w-full h-screen flex flex-col items-center justify-cente'>
      <h1 className='text-5xl font-bold text-amber-700 mb-4 animate-pulse'>
        ¡{t('welcome')} {user?.name || 'Jugador'}! 🎉
      </h1>
      <p className='text-lg text-white/60'>{t('loading')}</p>
    </div>
  );
};

export default Bienvenido;
