import { Link } from 'react-router-dom'
import { useState } from 'react'

const Home = () => {
  const [mostrarJugarOptions, setMostrarJugarOptions] = useState('')

  return (
    <div className='rounded-3xl text-center'>
      <div className='w-90 mt-2 rounded-4xl flex flex-col text-center items-center justify-center text-white'>
        <div className=' flex flex-col items-center'>
          <button
            onClick={() => setMostrarJugarOptions(!mostrarJugarOptions)}
            className='bg-amber-600 w-70 h-15 rounded-4xl mb-2 cursor-pointer hover:scale-105 transition-transform'
          >
            Jugar
          </button>

          {mostrarJugarOptions && (
            <div className='flex flex-col gap-2 mt-2 items-center'>
              <p className='bg-violet-700 w-80 rounded'>
                <strong>Modo de Juego</strong>
              </p>
              <Link
                to='/crearPartida'
                className='bg-amber-500 w-60 h-12 rounded-2xl cursor-pointer hover:scale-105 transition-transform flex items-center justify-center'
              >
                Contra la máquina
              </Link>
              <Link
                to='*'
                className='bg-amber-500 w-60 h-12 rounded-2xl cursor-pointer hover:scale-105 transition-transform flex items-center justify-center'
              >
                Contra la máquina
              </Link>
            </div>
          )}
        </div>
        <Link
          to='/ChatGlobal'
          className='w-70 h-15  hover:scale-105 transition-transform cursor-pointer bg-amber-600 rounded-4xl text-amber-200 flex items-center justify-center mb-1 mt-4 p-1'
        >
          Chat Global
        </Link>
      </div>
    </div>
  )
}

export default Home
