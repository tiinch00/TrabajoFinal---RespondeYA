import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {

  const navigate = useNavigate();

  const [values,setValues] = useState({
    usuario : '',
    email: '',
    password: ''
  })

  const handleChanges = (e) => {
    setValues({...values, [e.target.name]: e.target.value})

  }

  const handleSubmit = async (e) =>{
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/auth/register',values)
      console.log(response);
      alert("Usuario creado con éxito");
      navigate('/login');
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <div 
 className="w-90 h-110 bg-amber-600 rounded-3xl p-8 text-center items-center justify-center">
  
  
        <h2 className='text-lg font-bold mb-4 text-center'>Registrase</h2>
        <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label htmlFor="nombreusuario" className='block text-gray-700'>Nombre Usuario</label>
          <input name="usuario" onChange={handleChanges} type="text" placeholder='Nombre de Usuario' className="w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-500 text-black" />
        </div>
        <div className='mb-4'>
          <label htmlFor="email" className='block text-gray-700'>Email</label>
          <input name="email" type="text" onChange={handleChanges} placeholder='Correo electronico' className="w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-500 text-black" />
        </div>
         <div className='mb-4'>
          <label htmlFor="contraseña" className='block text-gray-700'>Contraseña</label>
          <input type="password" name="password"  onChange={handleChanges} placeholder='Contraseña' className="w-70 h-15  rounded-4xl text-center rounded-4x1 bg-amber-100 placeholder-gray-500 text-black" />
        </div>
        <button className='w-50 h-10 bg-green-600 text-white py-2 cursor-pointer rounded-4xl '>Enviar</button>
       </form>
       <div className='text-center'>
        <span>Ya tienes usuario?</span>
        <Link to='/login' className='m-1 text-blue-600'>Loguearse</Link>
       </div>
    </div>
  )
}

export default Register;