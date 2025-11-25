import { AlertCircle, Gamepad2, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/auth-context';
import { useGame } from '../context/ContextJuego.jsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, setLoading } = useAuth();
  const { setUser: setGameUser } = useGame();
  const [errores, setErrores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    // Limpiar error del campo cuando empieza a escribir
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanedValues = {
      email: values.email.trim(),
      password: values.password.trim(),
    };

    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanedValues.email) newErrors.email = t('errorEmailRequired');
    if (!cleanedValues.password) newErrors.password = t('errorPasswordRequired');
    if (cleanedValues.password && cleanedValues.password.length < 6)
      newErrors.password = t('errorPasswordMin');
    if (cleanedValues.email && !emailRegex.test(cleanedValues.email))
      newErrors.emailValido = t('errorEmailInvalid');

    setErrores(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, cleanedValues);
      const token = data.token;
      let user = data.user;

      // Por si el backend sólo manda token y no user
      if (!user && token) {
        const meRes = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        user = meRes.data;
      }

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || { name: 'anonymous' }));

      // 🔹 Actualizar contexto de auth con el user correcto
      login(user, token);

      // 🔹 Actualizar contexto de juego (GameProvider)
      setGameUser(user); // 👈 ESTA ES LA CLAVE

      setIsLoading(false);
      navigate('/bienvenido', { replace: true });
    } catch (err) {
      const backendError = err.response?.data?.error;

      if (backendError) {
        if (backendError.includes('Usuario inexistente')) {
          setErrores({ general: t('errorUserNotFound') });
        } else if (backendError.includes('Password no coincide')) {
          setErrores({ general: t('errorPassNoMatch') });
        } else if (backendError.includes('JWT_KEY')) {
          setErrores({ general: t('errorServerConfig') });
        } else {
          setErrores({ general: t('errorServer') });
        }
      } else {
        setErrores({ general: t('errorServer') });
      }

      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className='flex items-start w-full justify-center min-h-screen  md:py-0'>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='w-full max-w-md md:max-w-lg bg-gradient-to-br from-purple-900/40 via-purple-800/50 to-indigo-900/70 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-purple-500/30 shadow-2xl'
      >
        <motion.div variants={itemVariants} className='text-center mb-6 md:mb-8'>
          <div className='flex items-center justify-center mb-4'>
            <Gamepad2 className='w-8 h-8 md:w-10 md:h-10 text-cyan-400 mr-2' />
            <h2 className='text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 text-transparent bg-clip-text'>
              {t('welcome')}
            </h2>
            <Gamepad2 className='w-8 h-8 md:w-10 md:h-10 text-pink-400 ml-2' />
          </div>
          <p className='text-purple-200 text-sm md:text-base font-medium'>
            {t('loginDescription')}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className='space-y-5 md:space-y-6'>
          <motion.div variants={itemVariants} className='relative'>
            <label
              htmlFor='email'
              className=' text-white font-semibold text-sm md:text-base mb-2 flex items-center gap-2'
            >
              <Mail className='w-4 h-4 md:w-5 md:h-5 text-cyan-400' />
              {t('insertEmail')}
            </label>
            <input
              type='email'
              name='email'
              value={values.email}
              onChange={handleChanges}
              placeholder={t('email') || 'tu@email.com'}
              className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 border-2 backdrop-blur-sm text-white placeholder-gray-400 text-sm md:text-base focus:outline-none transition-all duration-300 ${errores.email || errores.emailValido
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-purple-400/50 focus:border-cyan-400 focus:bg-white/20'
                }`}
            />
            {(errores.email || errores.emailValido) && (
              <p className='text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1'>
                <AlertCircle className='w-3 h-3 md:w-4 md:h-4' />
                {errores.email || errores.emailValido}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className='relative'>
            <label
              htmlFor='password'
              // block
              className='text-white font-semibold text-sm md:text-base mb-2 flex items-center gap-2'
            >
              <Lock className='w-4 h-4 md:w-5 md:h-5 text-pink-400' />
              {t('insertPass')}
            </label>
            <input
              type='password'
              name='password'
              value={values.password}
              onChange={handleChanges}
              placeholder={t('pass') || '••••••••'}
              className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 border-2 backdrop-blur-sm text-white placeholder-gray-400 text-sm md:text-base focus:outline-none transition-all duration-300 ${errores.password
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-purple-400/50 focus:border-pink-400 focus:bg-white/20'
                }`}
            />
            {errores.password && (
              <p className='text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1'>
                <AlertCircle className='w-3 h-3 md:w-4 md:h-4' />
                {errores.password}
              </p>
            )}
          </motion.div>

          {errores.general && (
            <motion.div
              variants={itemVariants}
              className='bg-red-500/20 border-2 border-red-500 rounded-xl p-3 md:p-4 flex items-start gap-2'
            >
              <AlertCircle className='w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0 mt-0.5' />
              <p className='text-red-300 text-sm md:text-base'>{errores.general}</p>
            </motion.div>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={isLoading}
            className='w-full py-3 cursor-pointer md:py-4 mt-6 md:mt-8 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-400 hover:via-emerald-400 hover:to-teal-500 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2'
          >
            {isLoading ? (
              <>
                <div className='w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                {t('logging')}...
              </>
            ) : (
              <>{t('sesion')}</>
            )}
          </motion.button>

          <motion.div
            variants={itemVariants}
            className='text-center pt-4 md:pt-6 border-t border-purple-500/30'
          >
            <p className='text-gray-300 text-sm md:text-base'>
              {t('noAccount')}{' '}
              <Link
                to='/register'
                className='font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text hover:from-yellow-300 hover:to-orange-300 transition-all duration-300'
              >
                {t('register')}
              </Link>
            </p>
          </motion.div>
        </form>

        <div className='absolute top-0 right-0 w-40 h-40 bg-purple-600/20 rounded-full -z-10 blur-3xl' />
        <div className='absolute bottom-0 left-0 w-40 h-40 bg-pink-600/20 rounded-full -z-10 blur-3xl' />
      </motion.div>
    </div>
  );
};

export default Login;
