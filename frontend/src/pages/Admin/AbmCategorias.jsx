import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CategoriasListar from './CategoriasListar.jsx';
import CategoriaCrear from './CategoriaCrear.jsx';
import CategoriaDetalle from './CategoriaDetalle.jsx';

const AbmCategorias = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [selectCategoria, setSelectCategoria] = useState(null);

  const getCategorias = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3006/admin/categorias`);
      setCategorias(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) navigate('/login');
    getCategorias();
  }, [navigate]);

  return (
    <div className='min-h-screen flex flex-col items-center py-8 px-4'>
      <div className='w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6'>
        <h2 className='text-2xl font-bold text-indigo-700 mb-6 text-center'>
          🧭 Panel de Administración - Categorías
        </h2>

        <div className='mb-6'>
          <CategoriaCrear onCreate={(nueva) => setCategorias([...categorias, nueva])} />
        </div>

        <div className='mb-6'>
          <CategoriasListar categorias={categorias} onSelect={setSelectCategoria} />
        </div>

        <div className='mt-4'>
          <CategoriaDetalle
            categoria={selectCategoria}
            onEdit={(editada) => {
              setCategorias(
                categorias.map((categoria) => (categoria.id === editada.id ? editada : categoria))
              );
              setSelectCategoria(editada);
            }}
            onEliminar={(categoriaEliminadaID) => {
              setCategorias(categorias.filter((c) => c.id !== categoriaEliminadaID));
              setSelectCategoria(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AbmCategorias;
