import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useState, useEffect } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [paises, setPaises] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const res = await fetch('http://localhost:3006/api/paises');
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

  const [values, setValues] = useState({
    usuario: '',
    email: '',
    password: '',
    repassword: '',
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const [errores, setErrores] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } else if (!estaElPais) {
      newErrors.pais = 'Debes seleccionar un pais real';
    } else if (!cleanedValues.password) {
      newErrors.password = t('errorPasswordRequired');
    } else if (!paisSeleccionado) {
      newErrors.pais = t('errorCountryRequired');
    } else if (cleanedValues.password.length < 6) {
      newErrors.password = t('errorPasswordMin');
    } else if (cleanedValues.password !== values.repassword) {
      newErrors.repassword = t('errorPasswordMatch');
    }

    setErrores(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await axios.post('http://localhost:3006/auth/register', {
        ...cleanedValues,
        pais: paisSeleccionado,
      });

      if (response.status === 201) {
        setMensaje('✅ ' + t('registerSuccess'));
        setTimeout(() => {
          navigate('/login');
        }, 4000); // 4 segundos
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setErrores({ general: err.response.data.error });
      } else {
        setErrores({ general: t('errorServer') });
      }
    }
  };

  return (
    <div className='w-90 h-fit bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl mt-3  p-2 mb-6 text-center items-center justify-center '>
      <h2 className='text-lg font-bold mb-2 text-center text-white'>{t('completeRegister')}</h2>
      <form onSubmit={handleSubmit} className='p-2'>
        <div className='bg-gradient-to-r from-indigo-700 to-purple-800 rounded-4xl flex flex-col text-center text-black'>
          <div className='mb-4 mt-4'>
            <label htmlFor='nombreusuario' className='block text-white mb-1'>
              <strong>{t('insertUser')}</strong>
            </label>

            <input
              name='usuario'
              required
              onChange={handleChanges}
              type='text'
              placeholder={t('userName')}
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='email' className='block text-white mb-1'>
              <strong>{t('insertEmail')}</strong>
            </label>
            <input
              name='email'
              required
              type='text'
              onChange={handleChanges}
              placeholder={t('email')}
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
          </div>
          <div className='mb-4'>
            <label className='block text-white mb-1'>
              <strong>{t('insertCountry')}</strong>
            </label>
            <input
              list='lista-paises'
              value={paisSeleccionado}
              onChange={(e) => setPaisSeleccionado(e.target.value)}
              placeholder={t('country')}
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
            <datalist id='lista-paises'>
              {paises.map((p) => (
                <option key={p.codigo} value={p.nombre} />
              ))}
            </datalist>
          </div>
          <div className='mb-4'>
            <label htmlFor='contraseña' className='block text-white mb-1'>
              <strong>{t('insertPass')}</strong>
            </label>
            <input
              type='password'
              required
              name='password'
              onChange={handleChanges}
              placeholder={t('pass')}
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='contraseña' className='block text-white mb-1'>
              <strong>{t('confimPass')}</strong>
            </label>
            <input
              type='password'
              required
              name='repassword'
              onChange={handleChanges}
              placeholder={t('pass')}
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-50 hover:bg-amber-100 placeholder-gray-500/50 text-black'
            />
          </div>
          <div>
            <button className='w-50 h-10 bg-green-600 hover:bg-green-700 text-white py-2 cursor-pointer rounded-4xl mt-3'>
              {t('register')}
            </button>
          </div>
          <div className='p-2'>
            {errores.email && <p className='text-red-600 mt-1'>{errores.email}</p>}
            {errores.emailValido && <p className='text-red-600 mt-1'>{errores.emailValido}</p>}
            {errores.pais && <p className='text-red-600 mt-1'>{errores.pais}</p>}
            {errores.password && <p className='text-red-600 mt-1'>{errores.password}</p>}
            {errores.repassword && <p className='text-red-600 mt-1'>{errores.repassword}</p>}
            {errores.general && <p className='text-red-600 mt-1'>{errores.general}</p>}
            {mensaje && <p className='text-green-600 mt-2'>{mensaje}</p>}
          </div>
        </div>

        <div className='text-center p-2'>
          <span className='font-semibold text-white'>{t('aReadyLogin')}</span>
          <Link to='/login' className='m-1 text-green-400 hover:text-yellow-400'>
            {t('sesion')}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
