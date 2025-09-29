import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CrearPartida = () => {
  const [categoria, setCategoria] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [alerta, setAlerta] = useState('');

  const navigate = useNavigate();

  const handleJugarIndividual = () => {
    if (!categoria || !tiempo || !dificultad) {
      setAlerta('Completa categoría, tiempo y dificultad antes de jugar');
      return;
    }
    navigate(`/jugarIndividual/${categoria.toLowerCase()}/${tiempo}/${dificultad}`);
  };

  const handleAlAzar = () => {
    const db = {
      categorias: [
        { id: 1, nombre: 'geografia' },
        { id: 2, nombre: 'literatura' },
        { id: 3, nombre: 'cine' },
        { id: 4, nombre: 'informatica' },
        { id: 5, nombre: 'deportes' },
      ],
    };

    const categoriasdb = db.categorias;
    const categoriaAzar = categoriasdb[Math.floor(Math.random() * categoriasdb.length)];
    setCategoria(categoriaAzar.nombre.toLowerCase());
  };

  return (
    <div className='bg-[#1a0042] m-8 flex items-center justify-center'>
      <div className='bg-[#1a0042] p-2 rounded-3xl text-center text-white space-y-6 w-[500px]'>
        {/* Tipo de Categoría */}
        <div className='space-y-5 '>
          <p className='bg-violet-500 py-2  rounded-2xl font-bold text-lg'>Tipo de Categoría</p>
          <div className='flex justify-center gap-4 '>
            <button
              value={categoria}
              onClick={handleAlAzar}
              className={`bg-sky-600  px-4 py-2 rounded-xl text-center cursor-pointer text-white ${categoria} ? border-white : " " `}
            >
              Elegir Categoria al Azar
            </button>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={`bg-sky-600 px-4 py-2 rounded-xl text-center cursor-pointer text-white 
    appearance-none focus:outline-none
    ${categoria ? 'border-4 border-white' : 'border-0'}`}
            >
              <option value=''>Elige una categoría</option>
              <option value='Geografía'>Geografía</option>
              <option value='Literatura'>Literatura</option>
              <option value='Cine'>Cine</option>
              <option value='Informatica'>Informática</option>
              <option value='Deportes'>Deportes</option>
            </select>

            <button className='bg-sky-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer'>
              Varias Categorías
            </button>
          </div>
        </div>

        <div className='space-y-5'>
          <p className='bg-violet-500 py-2 rounded-2xl font-bold text-lg'>Dificultad de Tiempo</p>
          <div className='flex justify-center gap-4'>
            <button
              value={tiempo}
              onClick={(e) => setTiempo('facil')}
              className={`bg-red-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer ${
                tiempo === 'facil' ? 'border-4 border-white' : ''
              }`}
            >
              Fácil
            </button>
            <button
              value={tiempo}
              onClick={(e) => setTiempo('normal')}
              className={`bg-red-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer ${
                tiempo === 'normal' ? 'border-4 border-white' : ''
              }`}
            >
              Normal
            </button>
            <button
              value={tiempo}
              onClick={(e) => setTiempo('dificil')}
              className={`bg-red-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer ${
                tiempo === 'dificil' ? 'border-4 border-white' : ''
              }`}
            >
              Difícil
            </button>
          </div>
        </div>

        <div className='space-y-5'>
          <p className='bg-violet-500 py-2 rounded-2xl font-bold text-lg'>
            Dificultad de Preguntas
          </p>
          <div className='flex justify-center gap-4'>
            <button
              value={dificultad}
              onClick={(e) => setDificultad('facil')}
              className={`bg-red-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer ${
                dificultad === 'facil' ? 'border-4 border-white' : ''
              }`}
            >
              Fácil
            </button>
            <button
              value={dificultad}
              onClick={(e) => setDificultad('normal')}
              className={`bg-red-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer ${
                dificultad === 'normal' ? 'border-4 border-white' : ''
              }`}
            >
              Normal
            </button>
            <button
              value={dificultad}
              onClick={(e) => setDificultad('dificil')}
              className={`bg-red-600 px-6 py-2 rounded-xl hover:scale-105 transition-transform cursor-pointer ${
                dificultad === 'dificil' ? 'border-4 border-white' : ''
              }`}
            >
              Difícil
            </button>
          </div>
        </div>
        <button
          onClick={handleJugarIndividual}
          className='bg-green-700 w-full py-3 rounded-2xl font-bold text-lg hover:scale-105 transition-transform cursor-pointer'
        >
          Jugar
        </button>
        {alerta}
      </div>
    </div>
  );
};

export default CrearPartida;
