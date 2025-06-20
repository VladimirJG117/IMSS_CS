import React, { useState } from 'react';

export default function ModifyAppointment() {
  const citas = JSON.parse(localStorage.getItem("citas")) || [];
  const [index, setIndex] = useState("");
  const [data, setData] = useState({});

  const handleSelect = (e) => {
    const idx = parseInt(e.target.value);
    setIndex(idx);
    setData(citas[idx] || {});
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (!citas[index]) return alert("Índice no válido.");
    citas[index] = data;
    localStorage.setItem("citas", JSON.stringify(citas));
    alert("Cita modificada ✅");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Modificar cita</h2>
      <select onChange={handleSelect} className="border p-2 rounded mb-6">
        <option value="">Selecciona cita</option>
        {citas.map((cita, i) => (
          <option key={i} value={i}>
            {i + 1}: {cita.nombre} {cita.apellidos}
          </option>
        ))}
      </select>

      {index !== "" && (
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(data).map((key) => (
            <input
              key={key}
              name={key}
              value={data[key]}
              onChange={handleChange}
              placeholder={key}
              className="border p-2 rounded"
            />
          ))}
          <button onClick={handleUpdate} className="col-span-2 mt-4 bg-green-800 text-white py-2 rounded">
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
}
