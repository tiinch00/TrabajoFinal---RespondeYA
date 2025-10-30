import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/auth-context';
import { useState } from 'react';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, setLoading } = useAuth();
  const [errores, setErrores] = useState({});

  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    if (!emailRegex.test(cleanedValues.email)) newErrors.emailValido = t('errorEmailInvalid');

    setErrores(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const { data } = await axios.post('http://localhost:3006/auth/login', cleanedValues);
      const token = data.token;
      let user = data.user;
      if (!user && token) {
        const meRes = await axios.get('http://localhost:3006/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        user = meRes.data;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || { name: 'anonymous' }));
      login(data.user, data.token); // <- dispara re-render global
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

      setLoading(false);
    }
  };

  return (
    <div className='w-90 h-fit bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-6 mt-4 mb-4 text-center'>
      <h2 className='text-5xl font-bold mb-4 text-center text-white'>{t('welcome')}</h2>
      <form onSubmit={handleSubmit}>
        <div className='bg-gradient-to-r from-indigo-700 to-purple-800 rounded-4xl flex flex-col text-center items-center justify-center text-black'>
          <div className='flex-col items-center justify-center mb-1 p-1'>
            <label htmlFor='email'>
              <strong className='text-white/90'>{t('insertEmail')}</strong>
            </label>
            <input
              type='text'
              required
              name='email'
              placeholder={t('insertEmail')}
              onChange={handleChanges}
              className='w-70 h-15 rounded-4xl text-center bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
          </div>

          <div className='flex-col items-center justify-center m-1 p-1'>
            <label htmlFor='password'>
              <strong className='text-white/90'>{t('insertPass')}</strong>
            </label>
            <input
              type='password'
              required
              name='password'
              placeholder={t('insertPass')}
              onChange={handleChanges}
              className='w-70 h-15 rounded-4xl text-center bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
          </div>

          <div className='w-50 h-10 bg-green-600 hover:bg-green-700 rounded-4xl text-white flex items-center justify-center mb-1 mt-4 p-1 cursor-pointer'>
            <button type='submit' className='cursor-pointer'>
              {t('sesion')}
            </button>
          </div>

          <div className='text-center mb-4'>
            <span className='text-white font-semibold'>{t('noAccount')}</span>
            <Link to='/register' className='text-amber-300 hover:text-yellow-400 ml-1'>
              {t('register')}
            </Link>
          </div>

          <div>
            {errores.email && <p className='text-red-600 mt-1'>{errores.email}</p>}
            {errores.emailValido && <p className='text-red-600 mt-1'>{errores.emailValido}</p>}
            {errores.password && <p className='text-red-600 mt-1'>{errores.password}</p>}
            {errores.general && <p className='text-red-600 mt-1'>{errores.general}</p>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
