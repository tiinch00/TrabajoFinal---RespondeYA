import { AlertCircle, CheckCircle, Gamepad2, Globe, Lock, Mail, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const InputField = ({
  icon: Icon,
  label,
  name,
  type = 'text',
  placeholder,
  error,
  value,
  onChange,
  color = 'cyan',
}) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
    className='relative'
  >
    <label
      htmlFor={name}
      className='flex items-center gap-2 text-white font-semibold text-sm md:text-base mb-2'
    >
      <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-${color}-400`} />
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 border-2 backdrop-blur-sm text-white placeholder-gray-400 text-sm md:text-base focus:outline-none transition-all duration-300 ${
        error
          ? 'border-red-500 focus:border-red-400'
          : `border-purple-400/50 focus:border-${color}-400 focus:bg-white/20`
      }`}
    />
    {error && (
      <p className='text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1'>
        <AlertCircle className='w-3 h-3 md:w-4 md:h-4 flex-shrink-0' />
        {error}
      </p>
    )}
  </motion.div>
);

const Register = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [paises, setPaises] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [values, setValues] = useState({
    usuario: '',
    email: '',
    password: '',
    repassword: '',
  });

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const res = await fetch(`${API_URL}/api/paises`);
        if (!res.ok) throw new Error('Error al obtener países');
        const data = await res.json();
        setPaises(data);
      } catch (err) {
        console.error('Error cargando países:', err.message);
        setPaises([]);
      }
    };
    fetchPaises();
  }, []);

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const cleanedValues = {
      usuario: values.usuario.trim(),
      email: values.email.trim(),
      password: values.password.trim(),
    };

    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const estaElPais = paises.find(
      (pais) => pais.nombre.toLowerCase() === paisSeleccionado.toLowerCase()
    );

    if (!cleanedValues.usuario) {
      newErrors.usuario = t('errorUser');
    } else if (!cleanedValues.email) {
      newErrors.email = t('errorEmailRequired');
    } else if (!emailRegex.test(cleanedValues.email)) {
      newErrors.email = t('errorEmailInvalid');
    } else if (!paisSeleccionado) {
      newErrors.pais = t('errorCountryRequired');
    } else if (!estaElPais) {
      newErrors.pais = t('countryReal');
    } else if (!cleanedValues.password) {
      newErrors.password = t('errorPasswordRequired');
    } else if (cleanedValues.password.length < 6) {
      newErrors.password = t('errorPasswordMin');
    } else if (cleanedValues.password !== values.repassword) {
      newErrors.repassword = t('errorPasswordMatch');
    }

    setErrores(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        ...cleanedValues,
        pais: paisSeleccionado,
      });

      if (response.status === 201) {
        setMensaje('✅ ' + t('registerSuccess'));
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      if (err.response?.data?.type === 'usuario') {
        setErrores({ general: t('nameAlreadyUser') });
      } else if (err.response?.data?.type === 'email') {
        setErrores({ general: t('emailAlreadyUser') });
      } else {
        setErrores({ general: t('errorServer') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className='flex items-center justify-center w-full min-h-screen px-2 py-4 md:py-0'>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='relative w-full max-w-md md:max-w-lg bg-gradient-to-br from-purple-900/50 via-purple-800/60 to-indigo-900/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 border border-purple-500/30 shadow-2xl overflow-hidden'
      >
        <motion.div variants={itemVariants} className='text-center mb-6 md:mb-8'>
          <div className='flex flex-wrap items-center justify-center mb-4 gap-2'>
            <Gamepad2 className='w-8 h-8 md:w-10 md:h-10 text-purple-400' />
            <h2 className='text-2xl  sm:text-3xl md:text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text'>
              {t('completeRegister')}
            </h2>
            <Gamepad2 className='w-8 h-8 md:w-10 md:h-10 text-pink-400' />
          </div>
          <p className='text-purple-200 text-xs sm:text-sm md:text-base font-medium'>
            {t('jointComunity')}
          </p>
        </motion.div>

        {mensaje && (
          <motion.div
            variants={itemVariants}
            className='bg-green-500/20 border-2 border-green-500 rounded-xl p-3 md:p-4 mb-4 md:mb-6 flex items-start gap-2'
          >
            <CheckCircle className='w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0 mt-0.5' />
            <p className='text-green-300 text-xs md:text-sm'>{mensaje}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4  md:space-y-5'>
          <InputField
            icon={User}
            label={t('insertUser')}
            name='usuario'
            placeholder={t('userName')}
            error={errores.usuario}
            value={values.usuario}
            onChange={handleChanges}
            color='purple'
          />

          <InputField
            icon={Mail}
            label={t('insertEmail')}
            name='email'
            type='email'
            placeholder={t('email')}
            error={errores.email}
            value={values.email}
            onChange={handleChanges}
            color='pink'
          />

          <motion.div variants={itemVariants} className='relative'>
            <label
              htmlFor='pais'
              className='flex items-center gap-2 text-white font-semibold text-sm md:text-base mb-2'
            >
              <Globe className='w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-yellow-400' />
              {t('insertCountry')}
            </label>
            <input
              id='pais'
              list='lista-paises'
              value={paisSeleccionado}
              onChange={(e) => {
                setPaisSeleccionado(e.target.value);
                if (errores.pais) setErrores({ ...errores, pais: '' });
              }}
              placeholder={t('country') || 'Selecciona tu país'}
              className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/10 border-2 backdrop-blur-sm text-white placeholder-gray-400 text-sm md:text-base focus:outline-none transition-all duration-300 ${
                errores.pais
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-purple-400/50 focus:border-yellow-400 focus:bg-white/20'
              }`}
            />
            <datalist id='lista-paises'>
              {paises.map((p) => (
                <option key={p.codigo} value={p.nombre} />
              ))}
            </datalist>
            {errores.pais && (
              <p className='text-red-400 text-xs md:text-sm mt-1 flex items-center gap-1'>
                <AlertCircle className='w-3 h-3 md:w-4 md:h-4 flex-shrink-0' />
                {errores.pais}
              </p>
            )}
          </motion.div>

          <InputField
            icon={Lock}
            label={t('insertPass')}
            name='password'
            type='password'
            placeholder={t('pass') || '••••••••'}
            error={errores.password}
            value={values.password}
            onChange={handleChanges}
            color='red'
          />

          <InputField
            icon={Lock}
            label={t('confimPass')}
            name='repassword'
            type='password'
            placeholder={t('pass') || '••••••••'}
            error={errores.repassword}
            value={values.repassword}
            onChange={handleChanges}
            color='orange'
          />

          {errores.general && (
            <motion.div
              variants={itemVariants}
              className='bg-red-500/20 border-2 border-red-500 rounded-xl p-3 md:p-4 flex items-start gap-2'
            >
              <AlertCircle className='w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0 mt-0.5' />
              <p className='text-red-300 text-xs md:text-sm'>{errores.general}</p>
            </motion.div>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={isLoading}
            className='w-full py-3 cursor-pointer md:py-4 mt-6 md:mt-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2'
          >
            {isLoading ? (
              <>
                <div className='w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                {t('registering')}...
              </>
            ) : (
              <>{t('register')}</>
            )}
          </motion.button>

          <motion.div
            variants={itemVariants}
            className='text-center pt-4 md:pt-6 border-t border-purple-500/30'
          >
            <p className='text-gray-300 text-xs sm:text-sm md:text-base'>
              {t('aReadyLogin')}{' '}
              <Link
                to='/login'
                className='font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text hover:from-green-300 hover:to-emerald-300 transition-all duration-300'
              >
                {t('sesion')}
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

export default Register;
