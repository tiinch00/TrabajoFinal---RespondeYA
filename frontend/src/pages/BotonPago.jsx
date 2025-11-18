import axios from 'axios';
import { useState } from 'react';

const BotonPago = () => {
  const [id, setId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';
  const [datos, setDatos] = [
    {
      nombre: 'Avatar Premium',
      precio: 1000,
      imagen:
        'https://miweb.com/https://img.freepik.com/vector-gratis/icono-vectorial-dibujos-animados-ilustracion-naturaleza-icono-vacaciones-aislado-plano_138676-13304.jpg?semt=ais_hybrid&w=740&q=80.png',
    },
  ];

  const crearPago = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/crearOrden`, datos);
      if (res) {
        setId(res.data.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pagar = (id) => {
    window.open(`https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${id}`, '_blank');
    setId(null);
  };

  return (
    <div className='flex flex-col gap-3'>
      <button onClick={crearPago} className='bg-blue-600 text-white p-2 rounded cursor-pointer'>
        Comprar con Mercado Pago
      </button>

      {id && (
        <div>
          <button className='cursor-pointer' onClick={() => pagar(id)}>
            Ir al pago
          </button>
        </div>
      )}
    </div>
  );
};

export default BotonPago;
