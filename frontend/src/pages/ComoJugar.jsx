import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import FondoAnimado from '../layouts/FondoAnimado.jsx';

const ComoJugar = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900'>
      <div className='relative z-20 text-center px-6 '>
        <h1 className='text-6xl md:text-7xl font-bold mb-6 text-white'>
          Bienvenidos a{' '}
          <span
            className='text-transparent bg-clip-text'
            style={{
              color: '#ff7500',
              WebkitTextStroke: '6px #cc00ff',
              paintOrder: 'stroke fill',
              textShadow: `
            0 8px 20px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(255, 119, 0, 0.5)
          `,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
            }}
          >
            RespondeYa!
          </span>
        </h1>
        <p className='text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto'>
          Un juego de preguntas y respuestas en tiempo real. Desafía a tus amigos para demostrar
          quién sabe más. 🎮
        </p>
        <Link
          to='/login'
          className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-block'
        >
          Comenzar a Jugar
        </Link>
      </div>

      {/* Sección COMO JUGAR */}
      <section className='relative py-24 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Contenido */}
            <div className='order-2 md:order-1'>
              <div className='inline-block bg-purple-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-purple-300 font-semibold'>📌 FUNDAMENTOS</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>Cómo jugar</h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                Para comenzar, elige un modo de juego:
                <span className='text-purple-400 font-semibold'>
                  {' '}
                  partida rápida desafiandote a ti mismo
                </span>{' '}
                o<span className='text-pink-400 font-semibold'> 1 vs 1 en tiempo real</span>.
                Responde las preguntas correctamente antes de que se acabe el tiempo y suma puntos
                para ganar la partida.
              </p>
            </div>

            {/* Imagen */}
            <div className='order-1 md:order-2'>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                <div className='bg-gradient-to-br from-purple-600 to-pink-600 p-1'>
                  <div className='bg-gray-900 rounded-xl p-12'>
                    <div className='text-6xl mb-4 text-center'>🎯</div>
                    <p className='text-white text-center text-lg'>Imagen de gameplay aquí</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección AMIGOS (invertida) */}
      <section className='relative py-24 px-6 bg-black/30'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Imagen */}
            <div>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                <div className='bg-gradient-to-br from-blue-600 to-purple-600 p-1'>
                  <div className='bg-gray-900 rounded-xl p-12'>
                    <div className='text-6xl mb-4 text-center'>👥</div>
                    <p className='text-white text-center text-lg'>Imagen de amigos aquí</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div>
              <div className='inline-block bg-blue-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-blue-300 font-semibold'>👥 SOCIAL</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>Agrega amigos</h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                Dirígete a la sección <span className='text-blue-400 font-semibold'>Amigos</span> en
                el menú principal. Ingresa el nombre de usuario de la persona que quieras agregar y
                presiona <span className='text-purple-400 font-semibold'>agregar a amigos</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección CHAT */}
      <section className='relative py-24 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Contenido */}
            <div className='order-2 md:order-1'>
              <div className='inline-block bg-green-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-green-300 font-semibold'>💬 COMUNICACIÓN</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>Chat en vivo</h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                Al ingresar a la plataforma podras utilizar{' '}
                <span className='text-green-400 font-semibold text-center'>Chat comunidad</span> al
                hacer click en el icono <MessageCircle /> ubicado en el centro derecha. Allí podrás
                escribir mensajes en tiempo real para hablar con todas los usuarios conectados en la
                plataforma.
              </p>
            </div>

            {/* Imagen */}
            <div className='order-1 md:order-2'>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                <div className='bg-gradient-to-br from-green-600 to-teal-600 p-1'>
                  <div className='bg-gray-900 rounded-xl p-12'>
                    <img src='./assets/comoJugar/chat.jpeg' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección TIENDA */}
      <section className='relative py-24 px-6 bg-black/30'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Imagen */}
            <div>
              <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                <div className='bg-gradient-to-br from-yellow-600 to-orange-600 p-1'>
                  <div className='bg-gray-900 rounded-xl p-12'>
                    <img src='./assets/comoJugar/tienda.jpg' />
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div>
              <div className='inline-block bg-yellow-600/20 px-4 py-2 rounded-full mb-4'>
                <span className='text-yellow-300 font-semibold'>🛒 PERSONALIZACIÓN</span>
              </div>
              <h2 className='text-5xl font-bold mb-6 text-white'>Compra skins</h2>
              <p className='text-xl text-gray-300 leading-relaxed'>
                Accede a la <span className='text-yellow-400 font-semibold'>Tienda</span> desde el
                menú principal. Explora las distintas skins disponibles para tu avatar. Selecciona
                la que más te guste y haz clic en{' '}
                <span className='text-orange-400 font-semibold'>Comprar</span>. Si tienes puntos
                suficientes, la skin será añadida automáticamente a tu inventario. ✨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className='relative py-24 px-6 text-center'>
        <div className='max-w-3xl mx-auto'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6 text-white'>¿Listo para comenzar?</h2>
          <p className='text-xl text-gray-300 mb-8'>Únete ahora y demuestra que eres el mejor</p>
          <Link
            to='/login'
            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg inline-block'
          >
            Empezar a Jugar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ComoJugar;
