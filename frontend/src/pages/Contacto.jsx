import axios from 'axios';
import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';

const Contacto = () => {
  const { t } = useTranslation();

  const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { name: raw };
    }
  };
  const user = getStoredUser();
  const [form, setForm] = useState({
    nombreUsuario: '',
    email: '',
    descripcion: '',
  });

  const [status, setStatus] = useState('');

  const [alerta, setAlerta] = useState({});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    if (status.length > 0) {
      const timeout = setTimeout(() => {
        setStatus('');
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [status]);

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const cleanedValues = {
      email: user ? user.email : form.email.trim(),
      nombreUsuario: user ? user.name : form.nombreUsuario,
      descripcion: form.descripcion,
    };
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedValues.nombreUsuario) newErrors.nombreUsuario = t('nameRequired');
    if (!cleanedValues.email) newErrors.email = t('emailRequired');
    if (!cleanedValues.descripcion) newErrors.descripcion = t('descriptionRequired');
    if (cleanedValues.email && !emailRegex.test(cleanedValues.email)) {
      newErrors.emailValido = t('invalidEmail');
    }

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setStatus(t('sending'));

    try {
      const res = await axios.post('http://localhost:3006/api/contactar', cleanedValues);
      if (res.data.ok) {
        setStatus(t('emailSended'));
        setForm({ nombreUsuario: '', email: '', descripcion: '' }); // limpiar form
      } else {
        setStatus(t('emailError'));
      }
    } catch (error) {
      console.error(error);
      setStatus(t('noConnection'));
    }
  };

  return (
    <div className='min-h-screen'>
      <section className='bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12 px-6 text-center rounded-2xl'>
        <h1 className='text-4xl font-bold mb-4 drop-shadow'>{t('who')}</h1>
        <p className='max-w-3xl mx-auto text-lg leading-relaxed'>
          <Trans i18nKey='descriptionWho'>
            <></>
            <b />
            <></>
            <b />
            <></>
            <span className='italic' />
          </Trans>
        </p>

        <div className='mt-10 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto'>
          <div className='flex flex-col items-center bg-white/10 p-6 rounded-2xl shadow-lg'>
            <img
              src='/Martin.png'
              className='w-40 h-40 rounded-full object-cover mb-4 border-4 border-white'
              alt='Martin'
            />
            <h2 className='text-xl font-bold'>Martin Paredes</h2>
            <p className='text-sm text-gray-200'>@Tiinch00</p>
          </div>

          <div className='flex flex-col items-center bg-white/10 p-6 rounded-2xl shadow-lg'>
            <img
              src='/Francisco.png'
              className='w-40 h-40 rounded-full object-cover mb-4 border-4 border-white'
              alt='Francisco'
            />
            <h2 className='text-xl font-bold'>Francisco Pandolfi</h2>
            <p className='text-sm text-gray-200'>@Fran</p>
          </div>
        </div>
      </section>

      <div className='w-full  flex items-center justify-center text-black m-5 p-5'>
        <div className='w-full max-w-md rounded-2xl shadow-lg flex flex-col p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-4 px-6'>
          <form onSubmit={handleOnSubmit}>
            <h2 className='text-2xl text-white font-bold text-center'>{t('contactUs')}</h2>

            <div className='flex flex-col'>
              <label htmlFor='nombreUsuario' className='mb-1 font-medium'>
                {t('formName')}
              </label>
              <input
                type='text'
                name='nombreUsuario'
                value={user ? user.name : form.nombreUsuario}
                onChange={handleChange}
                placeholder={t('placeHolderUser')}
                className='p-2 rounded-lg bg-white/40 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400'
                required
              />
            </div>
            <div className='flex flex-col'>
              <label htmlFor='email' className='mb-1 font-medium'>
                {t('formEmail')}
              </label>
              <input
                type='email'
                name='email'
                value={user ? user.email : form.email}
                onChange={handleChange}
                placeholder={t('placeHolderEmail')}
                className='p-2 rounded-lg  bg-white/40 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400'
                required
              />
            </div>
            <div className='flex flex-col'>
              <label htmlFor='descripcion' className='mb-1 font-medium'>
                {t('formMessage')}
              </label>
              <textarea
                name='descripcion'
                id='descripcion'
                value={form.descripcion}
                onChange={handleChange}
                rows='4'
                placeholder={t('placeHolderMessage')}
                className='p-1 rounded-lg bg-white/40 resize-none focus:outline-none text-black focus:ring-2 focus:ring-purple-400'
                required
              ></textarea>
            </div>

            <button
              type='submit'
              className='w-full py-2 rounded-lg bg-green-500 cursor-pointer hover:bg-green-600 text-white font-semibold transition duration-300 mt-4'
            >
              {t('sendEmail')}
            </button>
            <div>
              {alerta.nombreUsuario && <p className='text-red-600 mt-1'>{alerta.nombre}</p>}
              {alerta.email && <p className='text-red-600 mt-1'>{alerta.email}</p>}
              {alerta.emailValido && <p className='text-red-600 mt-1'>{alerta.emailValido}</p>}
              {alerta.descripcion && <p className='text-red-600 mt-1'>{alerta.descripcion}</p>}
              {status && (
                <p
                  className={`${
                    status.startsWith('✅' || '⏳') ? 'text-green-500 font-bold' : 'text-red-600'
                  } mt-1`}
                >
                  {status}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
