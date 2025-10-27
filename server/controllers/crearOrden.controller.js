import { MercadoPagoConfig, Preference } from 'mercadopago';
import 'dotenv/config';

const crearOrden = async (req, res) => {
  try {
    const { nombre, precio, imagen } = req.body;

    // Validar datos de entrada
    if (!nombre || !precio || !imagen) {
      return res
        .status(400)
        .json({ error: 'Faltan datos: nombre, precio e imagen son requeridos' });
    }
    if (isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número mayor a 0' });
    }

    // Cliente configurado con el token de prueba
    const client = new MercadoPagoConfig({
      accessToken: process.env.TEST_KEY_MP,
      options: { timeout: 5000 },
    });

    const preference = new Preference(client);

    // Datos del pago
    const body = {
      items: [
        {
          title: nombre,
          quantity: 1,
          unit_price: Number(precio),
          picture_url: imagen,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: 'http://localhost:5173/tienda',
        failure: 'http://localhost:5173/tienda',
        pending: 'http://localhost:5173/tienda',
      },
      //auto_return: 'approved',
      external_reference: `avatar_${nombre}_${Date.now()}`, // Identificador único
    };

    // crear preferencia
    const result = await preference.create({ body });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
};

export default crearOrden;
