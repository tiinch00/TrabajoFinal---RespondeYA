const CategoriasListar = ({ categorias, onSelect }) => {
  const handleChange = (e) => {
    const id = e.target.value;
    const cat = categorias.find((c) => c.id === parseInt(id));
    onSelect(cat || null);
  };

  return (
    <div className='flex flex-col'>
      {categorias && categorias.length > 0 ? (
        <select
          onChange={handleChange}
          className='p-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer'
        >
          <option value=''>Sin seleccionar</option>
          {categorias.map((c) => (
            <option className='cursor-pointer' key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      ) : (
        <div className='text-gray-400 text-center'>No hay categorías disponibles</div>
      )}
    </div>
  );
};

export default CategoriasListar;
