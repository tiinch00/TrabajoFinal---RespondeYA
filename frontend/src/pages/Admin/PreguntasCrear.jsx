import { useState } from 'react';
import axios from 'axios';

const PreguntasCrear = ({ categoriaID, setPreguntas }) => {
  const [values, setValues] = useState({
    admin_id: 1,
    categoria_id: categoriaID,
    enunciado: '',
    dificultad: '',
  });
  const [agregarPregunta, setAgregarPreguntas] = useState(false);
  const [alerta, setAlerta] = useState({});

  const [pregunta, setPregunta] = useState({});

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!values.enunciado) newErrors.enunciado = 'La pregunta es obligatoria';
    if (!values.dificultad) newErrors.dificultad = 'La dificultad es obligatoria';

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const { data } = await axios.post(
        `http://localhost:3006/admin/categoria/${categoriaID}/preguntas/create`,
        values
      );
      setPreguntas((prev) => [...prev, data]);
      setPregunta(data);
      setValues({ admin_id: 1, categoria_id: categoriaID, enunciado: '', dificultad: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className=' bg-gray-50 shadow-lg rounded-xl m-6 p-2 '>
      <button
        className='p-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition text-center cursor-pointer'
        onClick={() => setAgregarPreguntas(!agregarPregunta)}
      >
        {agregarPregunta ? 'Cancelar' : '+ Crear nueva pregunta'}
      </button>
      {agregarPregunta && (
        <form onSubmit={handleSubmit}>
          <h3 className='text-xl font-semibold text-indigo-600 mb-4 text-center'>
            Agregar Nueva Pregunta
          </h3>

          <div className='space-y-4'>
            <div>
              <label htmlFor='enunciado' className='block text-sm font-medium text-gray-700 mb-1'>
                Enunciado
              </label>
              <textarea
                id='enunciado'
                name='enunciado'
                rows='3'
                value={values.enunciado}
                onChange={handleChange}
                placeholder='Escribí la pregunta...'
                className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 outline-none resize-none text-gray-600'
              />
              {alerta.enunciado && <p className='text-red-500 text-xs mt-1'>{alerta.enunciado}</p>}
            </div>

            <div>
              <label htmlFor='dificultad' className='block text-sm font-medium text-gray-700 mb-1'>
                Dificultad
              </label>
              <select
                id='dificultad'
                name='dificultad'
                value={values.dificultad}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 outline-none text-gray-600 cursor-pointer'
              >
                <option value=''>Seleccionar...</option>
                <option value='facil'>Fácil</option>
                <option value='normal'>Media</option>
                <option value='dificil'>Difícil</option>
              </select>
              {alerta.dificultad && (
                <p className='text-red-500 text-xs mt-1'>{alerta.dificultad}</p>
              )}
            </div>

            <button
              type='submit'
              className='w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition duration-300 cursor-pointer'
            >
              Crear Pregunta
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PreguntasCrear;
