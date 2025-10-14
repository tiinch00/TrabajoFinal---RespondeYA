import { useState, useEffect } from 'react';
import axios from 'axios';

const PreguntasListar = ({
  preguntas = [],
  categoria,
  onEdit,
  onEliminar,
  handleNext,
  handlePreview,
  paginaActual,
  preguntasPaginada = [],
}) => {
  const [alerta, setAlerta] = useState('');
  const [mostrarPreguntas, setMostrarPreguntas] = useState(false);
  const [opciones, setOpciones] = useState([]);
  const [preguntaEditar, setPreguntaEditar] = useState(null);
  const [preguntaActiva, setPreguntaActiva] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loadingOpciones, setLoadingOpciones] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarEditarOpciones, setMostrarEditarOpciones] = useState(false);
  const [eliminarPregunta, setEliminarPregunta] = useState(false);
  const [preguntaActivaEliminar, setPreguntaActivaEliminar] = useState(null);
  //formEditar Preguntas
  const [formEditar, setFormEditar] = useState({
    admin_id: 1,
    categoria_id: '',
    enunciado: '',
    dificultad: '',
  });

  // form para crear/editar opciones
  const [form, setForm] = useState({
    admin_id: 1,
    opcion1: '',
    opcion2: '',
    opcion3: '',
    opcion4: '',
    es_correcta: '',
  });

  useEffect(() => {
    if (preguntaEditar) {
      setFormEditar({
        admin_id: 1,
        categoria_id: preguntaEditar.categoria_id,
        enunciado: preguntaEditar.enunciado,
        dificultad: preguntaEditar.dificultad,
      });
    }
  }, [preguntaEditar]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  //obtener las opciones de la pregunta
  const obtenerOpciones = async (pregunta) => {
    try {
      setLoadingOpciones(true);
      const res = await axios.get(
        `http://localhost:3006/admin/categoria/${categoria}/${pregunta.categoria_id}/pregunta/${pregunta.id}/opciones`
      );
      setOpciones(res.data);
      return res.data;
    } catch (error) {
      console.error('Error al obtener opciones:', error);
      setAlerta({ error: 'No se pudieron obtener las opciones. Intente de nuevo.' });
      return [];
    } finally {
      setLoadingOpciones(false);
    }
  };

  const handleVerOpciones = (pregunta) => {
    if (preguntaActiva && preguntaActiva.id === pregunta.id) {
      setPreguntaActiva(null);
      setOpciones([]);
    } else {
      setPreguntaActiva(pregunta);
      obtenerOpciones(pregunta);
    }
  };

  const handleColor = (dif) => {
    if (dif === 'facil') return 'bg-green-100 text-green-800';
    if (dif === 'normal') return 'bg-yellow-100 text-yellow-800';
    if (dif === 'dificil') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-700';
  };

  //  editar opciones
  const openEditarOpciones = async (pregunta) => {
    setPreguntaActiva(pregunta);
    const opts = await obtenerOpciones(pregunta);

    // rellenar form
    setForm({
      opcion1: opts[0]?.texto || '',
      opcion2: opts[1]?.texto || '',
      opcion3: opts[2]?.texto || '',
      opcion4: opts[3]?.texto || '',
      es_correcta: (() => {
        const idx = opts.findIndex((x) => x.es_correcta === 1 || x.es_correcta === true);
        return idx >= 0 ? `opcion${idx + 1}` : '';
      })(),
      admin_id: 1,
    });

    setMostrarEditarOpciones(true);
  };

  // crear opciones
  const handleSendOptions = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.opcion1 || !form.opcion2 || !form.opcion3 || !form.opcion4)
      newErrors.opciones = 'Faltan opciones por completar';
    if (!form.es_correcta) newErrors.es_correcta = 'Debe seleccionar una opción correcta';

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.post(
        `http://localhost:3006/admin/categoria/${categoria}/${preguntaActiva.categoria_id}/pregunta/${preguntaActiva.id}/opciones/crear`,
        form
      );
      if (res.data.ok) {
        setForm({ opcion1: '', opcion2: '', opcion3: '', opcion4: '', es_correcta: '' });
        setMostrarModal(false);
        await obtenerOpciones(preguntaActiva);
      }
    } catch (error) {
      console.error('Error al guardar opciones:', error);
      setAlerta({ error: 'No se pudieron guardar las opciones. Intente de nuevo.' });
    }
  };

  // editar opciones
  const handleEditarOptions = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.opcion1 || !form.opcion2 || !form.opcion3 || !form.opcion4)
      newErrors.opciones = 'Faltan opciones por completar';
    if (!form.es_correcta) newErrors.es_correcta = 'Debe seleccionar una opción correcta';

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await axios.put(
        `http://localhost:3006/admin/categoria/${categoria}/${preguntaActiva.categoria_id}/pregunta/${preguntaActiva.id}/opciones/edit`,
        form
      );
      if (res.data.ok) {
        setForm({ opcion1: '', opcion2: '', opcion3: '', opcion4: '', es_correcta: '' });
        setMostrarEditarOpciones(false);
        await obtenerOpciones(preguntaActiva);
        setPreguntaActiva(null);
      }
    } catch (error) {
      console.error('Error al guardar opciones:', error);
      setAlerta({ error: 'No se pudieron guardar las opciones. Intente de nuevo.' });
    }
  };

  // editar pregunta (modal)
  const onSumitEditarPregunta = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formEditar.enunciado) newErrors.enunciado = 'Debe tener enunciado';
    if (!formEditar.dificultad) newErrors.dificultad = 'Debe seleccionar dificultad';

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const { data } = await axios.put(
        `http://localhost:3006/admin/categoria/${categoria}/${preguntaEditar.categoria_id}/pregunta/${preguntaEditar.id}/edit`,
        formEditar
      );
      if (data) {
        onEdit(data);
        setMostrarEditar(false);
        setAlerta({});
        setPreguntaEditar(null);
      }
    } catch (error) {
      console.error('Error al editar:', error);
      setAlerta({ error: 'Error al editar' });
    }
  };

  // toggle edicion de pregunta
  const handleMostrarYSetear = (pregunta) => {
    if (preguntaEditar && preguntaEditar.id === pregunta.id) {
      setPreguntaEditar(null);
      setMostrarEditar(false);
    } else {
      setPreguntaEditar(pregunta);
      setMostrarEditar(true);
    }
  };
  const handleChangeEditar = (e) => {
    setFormEditar({ ...formEditar, [e.target.name]: e.target.value });
  };

  const handleCerrarYresetearEditar = () => {
    setMostrarEditarOpciones(false);
    setForm({
      admin_id: 1,
      opcion1: '',
      opcion2: '',
      opcion3: '',
      opcion4: '',
      es_correcta: '',
    });
  };
  const handleMostrarYSetearEliminar = (pregunta) => {
    if (preguntaActivaEliminar && preguntaActivaEliminar.id === pregunta.id) {
      setEliminarPregunta(false);
      setPreguntaActivaEliminar(null);
    } else {
      setPreguntaActivaEliminar(pregunta);
      setEliminarPregunta(true);
    }
  };

  const handleEliminarPregunta = async () => {
    try {
      const { data } = await axios.delete(
        `http://localhost:3006/admin/categoria/${categoria}/${preguntaActivaEliminar.categoria_id}/pregunta/${preguntaActivaEliminar.id}/delete`
      );

      if (data.ok) {
        onEliminar(preguntaActivaEliminar.id);
        const nuevasPreguntas = preguntas.filter((p) => p.id !== preguntaActivaEliminar.id);

        const inicio = paginaActual * preguntasPorPagina;
        const fin = inicio + preguntasPorPagina;
        const paginaVacia = nuevasPreguntas.slice(inicio, fin).length === 0;

        if (paginaVacia && paginaActual > 0) {
          handlePreview(); // retrocede una página
        }
        setEliminarPregunta(false);
        setPreguntaActivaEliminar(null);
        setAlerta({});
      }
    } catch (error) {
      console.error('Error al editar:', error);
      setAlerta({ error: 'Error al editar' });
    }
  };
  const preguntasPorPagina = 5;
  const totalPaginas = Math.ceil(preguntas.length / preguntasPorPagina);

  return (
    <div className='bg-gray-50 shadow-lg rounded-xl m-6 p-2'>
      {preguntasPaginada.length === 0 ? (
        <div className='text-gray-400 text-center p-4'>No hay preguntas en la categoría</div>
      ) : (
        <div>
          <button
            onClick={() => setMostrarPreguntas((prev) => !prev)}
            className='p-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer'
          >
            {mostrarPreguntas ? '- Ocultar preguntas' : '+ Mostrar preguntas'}
          </button>

          {mostrarPreguntas && (
            <ul className='space-y-2 max-h-[60vh] overflow-auto mt-3'>
              {preguntasPaginada.map((pregunta) => (
                <li key={pregunta.id} className='p-3 bg-white border rounded-lg shadow-sm'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1 pr-3'>
                      <p className='text-sm text-gray-800 truncate max-w-[36rem]'>
                        {pregunta.enunciado}
                      </p>
                      <span
                        className={`inline-block mt-2 text-xs px-2 py-1 rounded ${handleColor(
                          pregunta.dificultad
                        )}`}
                      >
                        {pregunta.dificultad || '—'}
                      </span>
                    </div>

                    <div className='flex flex-col gap-2'>
                      <button
                        className='px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm cursor-pointer'
                        onClick={() => handleMostrarYSetear(pregunta)}
                      >
                        Editar
                      </button>
                      <button
                        className='px-3 py-1 rounded-lg bg-red-600 text-white text-sm cursor-pointer'
                        onClick={() => handleMostrarYSetearEliminar(pregunta)}
                      >
                        Eliminar
                      </button>

                      <button
                        className='px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm cursor-pointer'
                        onClick={() => handleVerOpciones(pregunta)}
                      >
                        {preguntaActiva?.id === pregunta.id ? 'Ocultar Opciones' : 'Ver Opciones'}
                      </button>
                    </div>
                  </div>

                  {/* Opciones */}
                  {preguntaActiva?.id === pregunta.id && (
                    <div className='mt-3 border-t pt-3'>
                      {loadingOpciones ? (
                        <div className='text-gray-500 text-sm p-2'>Cargando opciones...</div>
                      ) : opciones && opciones.length > 0 ? (
                        <div>
                          {/* header con título y botón Editar Opciones alineado a la derecha */}
                          <div className='flex items-center justify-between mb-2'>
                            <div className='text-sm text-gray-700 font-medium'>Opciones</div>
                            <button
                              onClick={() => openEditarOpciones(pregunta)}
                              className='mt-1 px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm cursor-pointer'
                            >
                              Editar Opciones
                            </button>
                          </div>

                          <ul className='text-sm text-gray-700 space-y-1 mb-2'>
                            {opciones.map((o) => (
                              <li
                                key={o.id}
                                className={`p-2 rounded ${
                                  o.es_correcta
                                    ? 'bg-green-100 text-green-800 font-medium'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {o.texto}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className='p-4'>
                          <button
                            onClick={() => setMostrarModal(true)}
                            className='bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer'
                          >
                            Agregar opciones
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Modal crear opciones */}
          {mostrarModal && (
            <div className='fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
              <div className='bg-white rounded-2xl p-6 shadow-lg w-96 relative text-gray-600'>
                <h2 className='text-lg font-semibold mb-4'>Agregar opciones</h2>
                {alerta.error && <div className='text-red-600 text-sm mt-2'>{alerta.error}</div>}
                <form className='space-y-3' onSubmit={handleSendOptions}>
                  {['opcion1', 'opcion2', 'opcion3', 'opcion4'].map((campo, i) => (
                    <div key={campo} className='flex items-center gap-2'>
                      <label className='flex items-center gap-2 w-full'>
                        <input
                          type='radio'
                          name='es_correcta'
                          value={campo}
                          checked={form.es_correcta === campo}
                          onChange={(e) => setForm({ ...form, es_correcta: e.target.value })}
                        />
                        <input
                          type='text'
                          name={campo}
                          placeholder={`Opción ${i + 1}`}
                          className='w-full border p-2 rounded-lg'
                          value={form[campo]}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                  ))}

                  <button
                    type='submit'
                    className='w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 cursor-pointer'
                  >
                    Guardar opciones
                  </button>
                  {alerta.opciones && (
                    <p className='text-red-500 text-xs mt-1'>{alerta.opciones}</p>
                  )}
                  {alerta.es_correcta && (
                    <p className='text-red-500 text-xs mt-1'>{alerta.es_correcta}</p>
                  )}
                </form>
                <button
                  onClick={() => setMostrarModal(false)}
                  className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer'
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* modal editar pregunta */}
          {mostrarEditar && (
            <div className='fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
              <div className='bg-white rounded-2xl p-6 shadow-lg w-96 relative text-gray-600'>
                <h2 className='text-lg font-semibold mb-4'>Editar Pregunta</h2>
                {alerta.error && <div className='text-red-600 text-sm mt-2'>{alerta.error}</div>}
                <form onSubmit={onSumitEditarPregunta}>
                  <div className='space-y-4'>
                    <div>
                      <label
                        htmlFor='enunciado'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Enunciado
                      </label>
                      <textarea
                        id='enunciado'
                        name='enunciado'
                        rows='3'
                        value={formEditar.enunciado}
                        onChange={handleChangeEditar}
                        className='w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-400 outline-none resize-none text-gray-600'
                      />
                      {alerta.enunciado && (
                        <p className='text-red-500 text-xs mt-1'>{alerta.enunciado}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor='dificultad'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Dificultad
                      </label>
                      <select
                        id='dificultad'
                        name='dificultad'
                        value={formEditar.dificultad}
                        onChange={handleChangeEditar}
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
                      Guardar Edicion
                    </button>
                  </div>
                </form>
                <button
                  onClick={() => {
                    setMostrarEditar(false);
                    setPreguntaEditar(null);
                  }}
                  className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer'
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* modal editar opciones */}
          {mostrarEditarOpciones && preguntaActiva && (
            <div className='fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
              <div className='bg-white rounded-2xl p-6 shadow-lg w-96 relative text-gray-600'>
                <h2 className='text-lg font-semibold mb-4'>Editar opciones</h2>
                {alerta.error && <div className='text-red-600 text-sm mt-2'>{alerta.error}</div>}

                <form className='space-y-3' onSubmit={handleEditarOptions}>
                  {['opcion1', 'opcion2', 'opcion3', 'opcion4'].map((campo, i) => (
                    <div key={campo} className='flex items-center gap-2'>
                      <label className='flex items-center gap-2 w-full'>
                        <input
                          type='radio'
                          name='es_correcta'
                          value={campo}
                          checked={form.es_correcta === campo}
                          onChange={(e) => setForm({ ...form, es_correcta: e.target.value })}
                        />
                        <input
                          type='text'
                          name={campo}
                          placeholder={`Opción ${i + 1}`}
                          className='w-full border p-2 rounded-lg'
                          value={form[campo]}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                  ))}

                  <button
                    type='submit'
                    className='w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 cursor-pointer'
                  >
                    Guardar opciones editadas
                  </button>
                </form>
                {alerta.opciones && <p className='text-red-500 text-xs mt-1'>{alerta.opciones}</p>}
                {alerta.es_correcta && (
                  <p className='text-red-500 text-xs mt-1'>{alerta.es_correcta}</p>
                )}

                <button
                  onClick={handleCerrarYresetearEditar}
                  className='absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer'
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          {eliminarPregunta && (
            <div className='fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50'>
              <div className='bg-white rounded-2xl p-6 shadow-lg w-96 relative text-gray-600'>
                <p>Seguro desea eliminar esta pregunta?</p>
                <div className='flex justify-between'>
                  <button
                    className='px-3 py-1 rounded-lg bg-green-600 text-white text-sm cursor-pointer'
                    onClick={() => {
                      setEliminarPregunta(false);
                      setPreguntaActivaEliminar(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className='px-3 py-1 rounded-lg bg-red-600 text-white text-sm cursor-pointer'
                    onClick={handleEliminarPregunta}
                  >
                    Si
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {mostrarPreguntas && preguntas.length > 5 && (
        <div className='flex place-content-between m-2 p-2'>
          <button
            className={`cursor-pointer border-1 rounded-full p-1  bg-blue-500  ${
              paginaActual === 0 ? 'invisible' : ''
            }`}
            onClick={handlePreview}
          >
            Anterior
          </button>

          <h2 className='text-black'>Pagina: {1 + paginaActual}</h2>

          <button
            className={`cursor-pointer border-1 rounded-full p-1 bg-blue-500 text-white transition ${
              paginaActual >= totalPaginas - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleNext}
            disabled={paginaActual >= totalPaginas - 1}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default PreguntasListar;
