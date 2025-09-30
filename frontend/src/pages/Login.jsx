import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();

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
    const cleanedValues = {
      email: values.email.trim(),
      password: values.password.trim(),
    };
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedValues.email) newErrors.email = 'El Email es obligatorio';
    if (!cleanedValues.password) newErrors.password = 'La contraseña es obligatoria';
    if (cleanedValues.password && cleanedValues.password.length < 6)
      newErrors.password = 'Contraseña minimos 6 caracteres';
    if (!emailRegex.test(cleanedValues.email)) newErrors.emailValido = 'Ingresar un email valido';
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
      navigate('/bienvenido', { replace: true });
    } catch (err) {
      if (err.response?.data?.error) {
        setErrores({ general: err.response.data.error });
      } else {
        setErrores({ general: 'Error de conexión con el servidor' });
      }
    }
  };

  return (
    <div className='w-90 h-130 bg-amber-600 rounded-3xl p-6 mt-4 mb-4 text-center'>
      <h2 className='text-5xl font-bold mb-4 text-center '>Bienvenidos</h2>
      <form onSubmit={handleSubmit}>
        <div className=' bg-amber-200  rounded-4xl flex flex-col text-center items-center justify-center text-black'>
          <div className='flex-col items-center justify-center mb-1 p-1'>
            <label htmlFor='email'>
              <strong>Ingrese Email</strong>
            </label>
            <input
              type='text'
              required
              name='email'
              placeholder='Ingrese email'
              onChange={handleChanges}
              className='w-70 h-15  rounded-4xl text-center bg-amber-100 hover:bg-amber-200 placeholder-gray-500 text-black'
            />
          </div>
          <div className='flex-col items-center justify-center m-1 p-1'>
            <label htmlFor='password'>
              <strong>Ingrese Contraseña</strong>
            </label>
            <input
              type='password'
              required
              name='password'
              placeholder='Ingrese contraseña'
              onChange={handleChanges}
              className='w-70 h-15 rounded-4xl  text-center bg-amber-100 hover:bg-amber-200 placeholder-gray-500 text-black'
            />
          </div>
          <div className='w-50 h-15 bg-green-600 hover:bg-green-700 rounded-4xl  text-amber-200 flex items-center justify-center mb-1 mt-4 p-1'>
            <button className='cursor-pointer'>Iniciar Sesion</button>
          </div>
          <div className='w-50 h-15 bg-blue-500 hover:bg-blue-600  rounded-4xl  text-amber-200 flex items-center justify-center  m-1 p-1'>
            <Link to='/register' className='m-1 text-amber-200'>
              Registrarse
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
