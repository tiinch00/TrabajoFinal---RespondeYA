import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useState } from 'react';

const Register = () => {
  const navigate = useNavigate();

  const [mensaje, setMensaje] = useState('');

  const [values, setValues] = useState({
    usuario: '',
    email: '',
    password: '',
    repassword: '',
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const [errores, setErrores] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedValues = {
      usuario: values.usuario.trim(),
      email: values.email.trim(),
      password: values.password.trim(),
    };
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanedValues.usuario) {
      newErrors.usuario = 'El usuario es obligatorio';
    } else if (!cleanedValues.email) {
      newErrors.email = 'El Email es obligatorio';
    } else if (!emailRegex.test(cleanedValues.email)) {
      newErrors.email = 'Ingresar un email válido';
    } else if (!cleanedValues.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (cleanedValues.password.length < 6) {
      newErrors.password = 'Contraseña mínimo 6 caracteres';
    } else if (cleanedValues.password !== values.repassword) {
      newErrors.repassword = 'Las contraseñas no coinciden';
    }

    setErrores(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await axios.post('http://localhost:3006/auth/register', cleanedValues);

      if (response.status === 201) {
        setMensaje('✅ Registro exitoso. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 4000); // 4 segundos
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setErrores({ general: err.response.data.error });
      } else {
        setErrores({ general: 'Error de conexión con el servidor' });
      }
    }
  };

  return (
    <div className='w-90 h-145 bg-amber-600 rounded-3xl p-4 text-center items-center justify-center '>
      <h2 className='text-lg font-bold mb-2 text-center'>Completar Registro</h2>
      <form onSubmit={handleSubmit}>
        <div className=' bg-amber-200  rounded-4xl flex flex-col text-center text-black'>
          <div className='mb-4'>
            <label htmlFor='nombreusuario' className='block text-gray-700'>
              Ingrese Usuario
            </label>
            <input
              name='usuario'
              required
              onChange={handleChanges}
              type='text'
              placeholder='Nombre de Usuario'
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-400 text-black'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='email' className='block text-gray-700'>
              Ingrese Email
            </label>
            <input
              name='email'
              required
              type='text'
              onChange={handleChanges}
              placeholder='Correo electronico'
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-400 text-black'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='contraseña' className='block text-gray-700'>
              Ingrese Contraseña
            </label>
            <input
              type='password'
              required
              name='password'
              onChange={handleChanges}
              placeholder='Contraseña'
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-400 text-black'
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='contraseña' className='block text-gray-700'>
              Confirmar Contraseña
            </label>
            <input
              type='password'
              required
              name='repassword'
              onChange={handleChanges}
              placeholder='Contraseña'
              className='w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-400 text-black'
            />
          </div>
          <div>
            <button className='w-50 h-10 bg-green-600 text-white py-2 cursor-pointer rounded-4xl '>
              Registrarse
            </button>
          </div>
          <div className='p-2'>
            {errores.email && <p className='text-red-600 mt-1'>{errores.email}</p>}
            {errores.emailValido && <p className='text-red-600 mt-1'>{errores.emailValido}</p>}
            {errores.password && <p className='text-red-600 mt-1'>{errores.password}</p>}
            {errores.repassword && <p className='text-red-600 mt-1'>{errores.repassword}</p>}
            {errores.general && <p className='text-red-600 mt-1'>{errores.general}</p>}
            {mensaje && <p className='text-green-600 mt-2'>{mensaje}</p>}
          </div>
        </div>

        <div className='text-center p-2'>
          <span>Ya tienes usuario?</span>
          <Link to='/login' className='m-1 text-blue-600'>
            Iniciar Sesion
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
