import axios from "axios";
import { useState } from "react";

const Contacto = () => {

  const [form, setForm] = useState({
    nombreUsuario: "",
    email: "",
    descripcion: "",
  });

   const [status,setStatus] = useState("");

    const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };


   const handleOnSubmit = async (e) => {
    e.preventDefault();
    setStatus("Enviando...");

    try {
      const res = await axios.post("http://localhost:3000/api/contactar", form);
      if (res.data.ok) {
        setStatus("✅ Correo enviado correctamente!");
        setForm({ nombreUsuario: "", email: "", descripcion: "" }); // limpiar form
      } else {
        setStatus("❌ Error al enviar correo.");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="w-full  flex items-center justify-center text-black ">

      <div  className="w-full max-w-md rounded-2xl shadow-lg flex flex-col bg-amber-600 p-5">

      
      <form
        onSubmit={handleOnSubmit}
      >
        <h2 className="text-2xl text-white font-bold text-center">Contáctanos</h2>

        <div className="flex flex-col">
          <label htmlFor="nombreUsuario" className="mb-1 font-medium">
            Nombre Usuario
          </label>
          <input
            type="text"
            name="nombreUsuario"
            value={form.nombreUsuario}
            onChange={handleChange}
            placeholder="Ingrese Usuario"
            className="p-2 rounded-lg bg-white/20 placeholder-white focus:outline-nonefocus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 font-medium">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Ingrese Email"
            className="p-2 rounded-lg  bg-white/20 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="descripcion" className="mb-1 font-medium">
            Mensaje
          </label>
          <textarea
            name="descripcion"
            id="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows="4"
            placeholder="Escríbenos tu consulta..."
            className="p-2 rounded-lg bg-white resize-none focus:outline-none text-black focus:ring-2 focus:ring-purple-400"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition duration-300"
        >
          Enviar Correo
        </button>
      </form>
      </div>
    </div>
  );
};

export default Contacto;
