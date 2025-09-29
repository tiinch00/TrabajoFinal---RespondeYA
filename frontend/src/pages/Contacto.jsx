import axios from "axios";
import { useState } from "react";

const Contacto = () => {

  const [form, setForm] = useState({
    nombreUsuario: "",
    email: "",
    descripcion: "",
  });

   const [status,setStatus] = useState("");

   const [alerta,setAlerta] = useState({});

    const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  


   const handleOnSubmit = async (e) => {
    e.preventDefault();

    const cleanedValues = {
      email: form.email.trim(),
      nombreUsuario: form.nombreUsuario,
      descripcion: form.descripcion
    };
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedValues.nombreUsuario) newErrors.nombreUsuario = "El Nombre es obligatorio";
    if (!cleanedValues.email) newErrors.email = "El Email es obligatorio";
    if (!cleanedValues.descripcion) newErrors.descripcion = "El Mensaje es obligatorio"
    if (cleanedValues.email && !emailRegex.test(cleanedValues.email)) {
    newErrors.emailValido = "Ingresar un email válido";}

    setAlerta(newErrors);
    if (Object.keys(newErrors).length > 0) return;  
    setStatus("Enviando...");

    try {
      const res = await axios.post("http://localhost:3006/api/contactar", cleanedValues);
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
     <>
   <section className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12 px-6 text-center rounded-2xl">
        <h1 className="text-4xl font-bold mb-4 drop-shadow">
          ¿Quiénes somos?
        </h1>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed">
          Dєv²Plαy es una empresa creada por <b>Francisco Pandolfi</b> y{" "}
          <b>Martin Paredes</b>, dos desarrolladores web fundadores del popular
          juego en tiempo real <span className="italic">RespondeYa!</span>
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Perfil Martin */}
          <div className="flex flex-col items-center bg-white/10 p-6 rounded-2xl shadow-lg">
            <img
              src="/Martin.png"
              className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-white"
              alt="Martin"
            />
            <h2 className="text-xl font-bold">Martin Paredes</h2>
            <p className="text-sm text-gray-200">@Tiinch00</p>
          </div>

          {/* Perfil Francisco */}
          <div className="flex flex-col items-center bg-white/10 p-6 rounded-2xl shadow-lg">
            <img
              src="/Francisco.png"
              className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-white"
              alt="Francisco"
            />
            <h2 className="text-xl font-bold">Francisco Pandolfi</h2>
            <p className="text-sm text-gray-200">@Fran</p>
          </div>
        </div>
      </section>


    <div className="w-full  flex items-center justify-center text-black m-5 p-5">

      <div  className="w-full max-w-md rounded-2xl shadow-lg flex flex-col p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-12 px-6">

      
      <form
        onSubmit={handleOnSubmit}
      >
        <h2 className="text-2xl text-white font-bold text-center">Contáctanos</h2>

        <div className="flex flex-col">
          <label htmlFor="nombreUsuario" className="mb-1 font-medium">
            Nombre 
          </label>
          <input
            type="text"
            name="nombreUsuario"
            value={form.nombreUsuario}
            onChange={handleChange}
            placeholder="Ingrese Usuario"
            className="p-2 rounded-lg bg-white/40 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
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
            className="p-2 rounded-lg  bg-white/40 placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
            required
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
            className="p-2 rounded-lg bg-white/40 resize-none focus:outline-none text-black focus:ring-2 focus:ring-purple-400"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition duration-300"
        >
          Enviar Correo
        </button>
        <div>
           {alerta.nombreUsuario && <p className="text-red-600 mt-1">{alerta.nombre}</p>}
           {alerta.email && <p className="text-red-600 mt-1">{alerta.email}</p>}
           {alerta.emailValido &&  <p className="text-red-600 mt-1">{alerta.emailValido}</p> }
           {alerta.descripcion && <p className="text-red-600 mt-1">{alerta.descripcion}</p>}
           {status && (
           <p className={`${status.startsWith("✅") ? "text-green-600" : "text-red-600"} mt-1`}>
          {status}
          </p>)}
        </div>
      </form>
      </div>
    </div>
    </>
  );
};

export default Contacto;
