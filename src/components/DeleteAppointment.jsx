import React, { useState } from 'react';

export default function DeleteAppointment() {
  const [citas, setCitas] = useState(JSON.parse(localStorage.getItem("citas")) || []);
  const [selected, setSelected] = useState("");

  const handleDelete = () => {
    if (selected === "") return;
    const nuevas = citas.filter((_, i) => i !== parseInt(selected));
    localStorage.setItem("citas", JSON.stringify(nuevas));
    setCitas(nuevas);
    setSelected("");
    alert("Cita eliminada 🗑️");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Eliminar cita</h2>
      <select onChange={(e) => setSelected(e.target.value)} value={selected} className="border p-2 rounded">
        <option value="">Selecciona cita</option>
        {citas.map((cita, i) => (
          <option key={i} value={i}>
            {i + 1}: {cita.nombre} {cita.apellidos}
          </option>
        ))}
      </select>

      <div className="mt-4">
        <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
          Eliminar
        </button>
      </div>
    </div>
  );
}
