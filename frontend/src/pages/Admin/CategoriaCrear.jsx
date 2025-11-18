import axios from 'axios';
import { useState } from 'react';

const CategoriaCrear = ({ onCreate }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/admin/categoria/create`, {
        nombre,
        descripcion,
        admin_id: 1,
      });
      onCreate(data);
      setNombre('');
      setDescripcion('');
      setMostrarAgregar(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='text-black'>
      <button
        className='mb-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer'
        onClick={() => setMostrarAgregar(!mostrarAgregar)}
      >
        {mostrarAgregar ? 'Cancelar' : '+ Crear nueva categoría'}
      </button>

      {mostrarAgregar && (
        <form
          onSubmit={handleSubmit}
          className='bg-gray-100 border border-gray-200 shadow-sm rounded-xl p-4 space-y-3'
        >
          <h4 className='text-lg font-semibold text-indigo-700 mb-2'>Nueva categoría</h4>

          <input
            type='text'
            placeholder='Nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className='w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400'
          />
          <input
            type='text'
            placeholder='Descripción'
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className='w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400'
          />

          <button
            type='submit'
            className='w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition cursor-pointer'
          >
            Guardar
          </button>
        </form>
      )}
    </div>
  );
};

export default CategoriaCrear;
