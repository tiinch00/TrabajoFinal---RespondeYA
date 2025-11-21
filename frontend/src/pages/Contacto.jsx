import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import axios from 'axios';

const Contacto = () => {
  const { t } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

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
      const res = await axios.post(`${API_URL}/api/contactar`, cleanedValues);
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
    <div className="min-h-screen w-full text-white flex flex-col gap-10 py-8 px-3 sm:px-4 lg:px-6">
      {/* SECCIÓN QUIÉNES SOMOS */}
      <section className="w-full max-w-5xl mx-auto bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 sm:py-10 lg:py-12 px-4 sm:px-8 text-center rounded-2xl shadow-xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 drop-shadow">
          {t('who')}
        </h1>

        <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed">
          <Trans i18nKey="descriptionWho">
            <></>
            <b />
            <></>
            <b />
            <></>
            <span className="italic" />
          </Trans>
        </p>

        {/* Cards de Martín y Fran */}
        <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          <div className="flex flex-col items-center bg-white/10 p-5 sm:p-6 rounded-2xl shadow-lg">
            <img
              src="/Martin.png"
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover mb-4 border-4 border-white"
              alt="Martin"
            />
            <h2 className="text-lg sm:text-xl font-bold">Martin Paredes</h2>
            <p className="text-xs sm:text-sm text-gray-200">@Tiinch00</p>
          </div>

          <div className="flex flex-col items-center bg-white/10 p-5 sm:p-6 rounded-2xl shadow-lg">
            <img
              src="/Francisco.png"
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover mb-4 border-4 border-white"
              alt="Francisco"
            />
            <h2 className="text-lg sm:text-xl font-bold">Francisco Pandolfi</h2>
            <p className="text-xs sm:text-sm text-gray-200">@Fran</p>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE CONTACTO */}
      <div className="w-full flex justify-center px-1 sm:px-4 pb-8">
        <div className="w-full max-w-lg rounded-2xl shadow-lg bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-5 sm:py-6 px-4 sm:px-6">
          <form onSubmit={handleOnSubmit} className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
              {t('contactUs')}
            </h2>

            {/* Nombre */}
            <div className="flex flex-col text-left">
              <label htmlFor="nombreUsuario" className="mb-1 font-medium">
                {t('formName')}
              </label>
              <input
                type="text"
                name="nombreUsuario"
                value={user ? user.name : form.nombreUsuario}
                onChange={handleChange}
                placeholder={t('placeHolderUser')}
                className="p-2 rounded-lg bg-white/40 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col text-left">
              <label htmlFor="email" className="mb-1 font-medium">
                {t('formEmail')}
              </label>
              <input
                type="email"
                name="email"
                value={user ? user.email : form.email}
                onChange={handleChange}
                placeholder={t('placeHolderEmail')}
                className="p-2 rounded-lg bg-white/40 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-black"
                required
              />
            </div>

            {/* Mensaje */}
            <div className="flex flex-col text-left">
              <label htmlFor="descripcion" className="mb-1 font-medium">
                {t('formMessage')}
              </label>
              <textarea
                name="descripcion"
                id="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                placeholder={t('placeHolderMessage')}
                className="p-2 rounded-lg bg-white/40 resize-none focus:outline-none text-black focus:ring-2 focus:ring-purple-400"
                required
              ></textarea>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-green-500 cursor-pointer hover:bg-green-600 text-white font-semibold transition duration-300 mt-2"
            >
              {t('sendEmail')}
            </button>

            {/* Mensajes de error / estado */}
            <div className="mt-2 space-y-1 text-sm">
              {alerta.nombreUsuario && (
                <p className="text-red-400">{alerta.nombreUsuario}</p>
              )}
              {alerta.email && <p className="text-red-400">{alerta.email}</p>}
              {alerta.emailValido && (
                <p className="text-red-400">{alerta.emailValido}</p>
              )}
              {alerta.descripcion && (
                <p className="text-red-400">{alerta.descripcion}</p>
              )}
              {status && (
                <p
                  className={`${status.startsWith('✅') || status.startsWith('⏳')
                      ? 'text-emerald-300 font-bold'
                      : 'text-red-300'
                    }`}
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
