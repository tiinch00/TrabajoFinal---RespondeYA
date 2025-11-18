import { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CategoriaDetalle = ({ categoria, onEdit, onEliminar }) => {
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [alerta, setAlerta] = useState({});
  const [modalEliminarCategoria, setModalEliminarCategoria] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
  //const [mostrarCategoria, setMostrarCategoria] = useState(categoria);

  const navigate = useNavigate();
  // cada vez que selecciono una categoria, seteo los valores en el form
  useEffect(() => {
    if (categoria) {
      setForm({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
      });
    }
  }, [categoria]);

  const handleGuardarEdit = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitEdit = async (e) => {
    e.preventDefault();

    const cleanedValues = {
      admin_id: 1,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
    };

    let newErrors = {};
    if (!cleanedValues.nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!cleanedValues.descripcion) newErrors.descripcion = 'La descripción es obligatoria';

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/admin/categoria/${categoria.id}/edit`,
        cleanedValues
      );
      if (data) {
        setMostrarEditar(false);
        onEdit(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEliminarCategoria = async () => {
    try {
      const { data } = await axios.delete(
        `${API_URL}/admin/categoria/${categoria.id}/delete`
      );
      if (data) {
        setModalEliminarCategoria(false);
        setAlerta({});
        onEliminar(data.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='bg-gray-100 shadow-inner rounded-xl p-5'>
      {!categoria ? (
        <p className='text-gray-500 text-center'>Selecciona una categoría para ver el detalle.</p>
      ) : (
        <>
          <h3 className='text-lg font-semibold text-indigo-700 mb-2'>{categoria.nombre}</h3>
          <p className='text-gray-500 mb-2'>Descripción:</p>
          <p className='text-gray-900 mb-4'>{categoria.descripcion}</p>

          <div className='flex justify-between items-center w-full mt-2'>
            <div className='flex gap-2'>
              <button
                className='px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition cursor-pointer'
                onClick={() => setMostrarEditar(!mostrarEditar)}
              >
                {mostrarEditar ? 'Cancelar' : 'Editar'}
              </button>

              <button
                className='px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition cursor-pointer'
                onClick={() => setModalEliminarCategoria(!modalEliminarCategoria)}
              >
                Eliminar
              </button>
            </div>

            <button
              className='px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition cursor-pointer'
              onClick={() => navigate(`/categoria/${categoria.nombre}/${categoria.id}/preguntas`)}
            >
              Administrar Preguntas
            </button>
          </div>

          {mostrarEditar && (
            <form onSubmit={onSubmitEdit} className='mt-4 space-y-3'>
              <div>
                <label className='block font-medium text-gray-700'>Nombre</label>
                <input
                  type='text'
                  name='nombre'
                  value={form.nombre}
                  onChange={handleGuardarEdit}
                  className='w-full p-2  text-black border rounded-lg '
                />
                {alerta.nombre && <p className='text-red-500 text-sm'>{alerta.nombre}</p>}
              </div>

              <div>
                <label className='block font-medium text-gray-700'>Descripción</label>
                <textarea
                  name='descripcion'
                  rows='3'
                  value={form.descripcion}
                  onChange={handleGuardarEdit}
                  className='w-full p-2 border text-black rounded-lg '
                />
                {alerta.descripcion && <p className='text-red-500 text-sm'>{alerta.descripcion}</p>}
              </div>

              <button
                type='submit'
                className='w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition cursor-pointer'
              >
                Guardar Cambios
              </button>
            </form>
          )}
          {modalEliminarCategoria && (
            <div className='fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
              <div className='bg-white rounded-2xl p-6 shadow-lg w-96 relative text-gray-600'>
                <p>Seguro desea eliminar esta catégoria y sus preguntas?</p>
                <div className='flex justify-between'>
                  <button
                    className='px-3 py-1 rounded-lg bg-green-600 text-white text-sm cursor-pointer'
                    onClick={() => setModalEliminarCategoria(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className='px-3 py-1 rounded-lg bg-red-600 text-white text-sm cursor-pointer'
                    onClick={handleEliminarCategoria}
                  >
                    Si, borrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoriaDetalle;
