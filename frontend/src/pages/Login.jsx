import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';



const Login = () => {


const navigate = useNavigate();

  const [values,setValues] = useState({
    email: '',
    password: ''
  })

  const handleChanges = (e) => {
    setValues({...values, [e.target.name]: e.target.value})

  }

  const handleSubmit = async (e) =>{
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/auth/login',values)
      console.log(response);
      
       // Guardar token
      localStorage.setItem("token", response.data.token);
      console.log('guardo el token')
      navigate('/');
    }
    catch (error) {
      console.log(error);
    }
  }




  return (
      <div
 className="w-90 h-110 bg-amber-600 rounded-3xl p-8 text-center">
  
   
         <h2 className='text-5xl font-bold mb-4 text-center '>Bienvenidos</h2>
       <form onSubmit={handleSubmit}>
         <div className=' bg-amber-600 rounded-4xl flex flex-col text-center items-center justify-center text-white'>

         <div className='flex-col items-center justify-center mb-1 p-1'>
         <label For="email"><strong>Ingrese Usuario</strong></label>
          <input type="text" name="email" placeholder='Ingrese email o usuario' onChange={handleChanges}  className="w-70 h-15  rounded-4xl text-center  bg-amber-100 placeholder-gray-500 text-black" />
         </div>
         <div className='flex-col items-center justify-center m-1 p-1'>
         <label For="password"><strong>Ingrese Contraseña</strong></label>
          <input type="password" name="password" placeholder='Ingrese contraseña' onChange={handleChanges} className="w-70 h-15 rounded-4xl  text-center bg-amber-100 placeholder-gray-500 text-black" />
         </div>
         <div className='w-50 h-15 bg-green-600  rounded-4xl  text-amber-200 flex items-center justify-center mb-1 mt-4 p-1'>
           <button className='cursor-pointer'>Iniciar Sesion</button>
         </div>
         <div className='w-50 h-15 bg-blue-500  rounded-4xl  text-amber-200 flex items-center justify-center  m-1 p-1'>
          <Link to='/register' className='m-1 text-amber-200'>Registrarse</Link>
         </div>

        </div>
       </form>

       </div>


        
        
        
    
  )
}

export default Login;
