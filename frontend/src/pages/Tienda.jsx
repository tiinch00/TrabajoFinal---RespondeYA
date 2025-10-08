import { useEffect, useState } from 'react'

import { motion } from "motion/react";

const container2 = {
  cursor: "pointer",
  display: "flex",
  padding: 10,
}

const Tienda = () => {

  const numAvatares = 14;
  const [selected, setSelected] = useState(null); // indice o null 

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <h1 className='text-6xl mb-6'>Tienda</h1>
      <hr className='border-1 border-sky-600' />
      <div className="grid grid-cols-6 gap-4 p-12">
        {Array.from({ length: numAvatares }, (_, i) => (

          <motion.img
            key={i}
            src={`/assets/avatares/avatar${i + 1}.png`}
            alt={`Avatar ${i + 1}`}
            className="w-40 h-50 object-cover rounded-full"
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 1.3 }}
            style={{
              ...container2
            }}
            onClick={() => setSelected(i)}
          >
          </motion.img>
        ))}
      </div>

      {/* div overlay absoluto en toda la pantalla) */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)} // click fuera cierra
        >
          <motion.div
            onClick={(e) => e.stopPropagation()} // evita que el click burbujee al overlay
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      w-full max-w-8/12 h-full max-h-9/12 rounded-2xl bg-indigo-900 text-white p-6 shadow-2xl"
          >
            {/* Boton X */}
            <button
              type="button"
              aria-label="Cerrar"
              className="absolute top-2 right-2 rounded-full w-9 h-9 grid place-items-center
                        hover:bg-black/5 active:scale-95 cursor-pointer"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>

            <img
              src={`/assets/avatares/avatar${selected + 1}.png`}
              alt={`Avatar ${selected + 1}`}
              className="w-60 h-80 object-cover rounded-full mx-auto"
            />

            <hr className="my-8 border-1 border-sky-500" />

            <div className='text-7xl text-center mt-6 mb-12'>
              Descripción...
            </div>

            <div className="mt-4 text-center">

              <div className="text-xl font-semibold mb-6">
                Precio: ${(selected + 1) * 2000}
              </div>

              {/* boton de compra */}
              <button className="mt-3 px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer">
                Comprar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <hr className="my-12 border-1 border-sky-500" />
    </div >
  )
}

export default Tienda