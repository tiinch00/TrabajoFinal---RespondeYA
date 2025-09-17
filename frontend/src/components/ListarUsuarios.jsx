// src/components/ListaUsuarios.jsx

import React, { useEffect, useState } from "react";

import Usuario from "./Usuario";
import axios from "axios";

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3006/users") // tu endpoint
      .then((res) => setUsuarios(res.data))
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
      });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Usuarios</h2>
      <div>
        {usuarios.length > 0 ? (
          usuarios.map((usuario) => (
            <Usuario
              key={usuario.id}
              id={usuario.id}
              name={usuario.name}
              email={usuario.email}
            />
          ))
        ) : (
          <p>No hay usuarios para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default ListaUsuarios;
