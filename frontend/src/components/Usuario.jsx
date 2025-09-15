// src/components/Usuario.jsx
const Usuario = ({ id, name, email }) => {
  return (
    <div className="p-4  text-amber-300 border rounded-lg shadow mb-3">
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Nombre:</strong> {name}</p>
      <p><strong>Email:</strong> {email}</p>
    </div>
  );
};

export default Usuario;
