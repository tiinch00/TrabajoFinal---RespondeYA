import React from "react";

const ComoJugar = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white">
      {/* Introducción */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Bienvenidos a RespondeYA!</h1>
        <p className="text-lg text-center">
          Un juego de preguntas y respuestas en tiempo real. 
          Compite contra la máquina o desafía a tus amigos para demostrar 
          quién sabe más. 🎮
        </p>
      </section>

      {/* COMO JUGAR */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">📌 Cómo jugar</h2>
        <p>
          Para comenzar, elige un modo de juego: 
          <strong> partida rápida contra la máquina</strong> o <strong>1 vs 1 en tiempo real</strong>. 
          Responde las preguntas correctamente antes de que se acabe el tiempo 
          y suma puntos para ganar la partida.
        </p>
      </section>

      {/* AMIGOS */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">👥 Cómo agregar un amigo</h2>
        <p>
          Dirígete a la sección <span className="font-semibold">Amigos</span> en 
          el menú principal. Ingresa el nombre de usuario de la persona que quieras 
          agregar y presiona <strong>agregar a amigos</strong>. 
        
        </p>
      </section>

      {/* CHAT */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">💬 Cómo usar el chat</h2>
        <p>
          Durante la partida, abre la ventana de <span className="font-semibold">Chat general</span> ubicada en la esquina inferior derecha. Allí podrás escribir mensajes en tiempo real 
          para hablar con tu rival o tus amigos mientras juegas.
        </p>
      </section>

      {/* TIENDA */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">🛒 Comprar skins en la tienda</h2>
        <p>
          Accede a la <span className="font-semibold">Tienda</span> desde el menú principal. 
          Explora las distintas skins disponibles para tu avatar. 
          Selecciona la que más te guste y haz clic en <strong>Comprar</strong>. 
          Si tienes monedas suficientes, la skin será añadida automáticamente a tu inventario. ✨
        </p>
      </section>
    </div>
  );
};

export default ComoJugar;
