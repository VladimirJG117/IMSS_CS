import React, { useState, useEffect } from 'react';


export default function DeleteAppointment() {
  const [citas, setCitas] = useState(JSON.parse(localStorage.getItem("citas")) || []);
  const [selected, setSelected] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

    // Cargar citas desde la base de datos al montar
  useEffect(() => {
    async function fetchCitas() {
      try {
        const res = await fetch('http://localhost:8000/api/appointments');
        if (!res.ok) throw new Error('Error al cargar citas');
        const data = await res.json();
        setCitas(data);
      } catch (err) {
        console.error(err);
        setStatusMsg('No se pudieron cargar las citas');
      }
    }
    fetchCitas();
  }, []);

const handleDelete = async () => {
  if (!selected) return;
  try {
    const res = await fetch(
      `http://localhost:8000/api/appointments/${selected}`,
      { method: 'DELETE' }
    );
    if (res.status === 204) {
      // Éxito: refrescamos la lista localmente
      const updated = citas.filter(c => c.cita_id !== parseInt(selected));
      setCitas(updated);
      setSelected('');
      setStatusMsg('Cita eliminada correctamente 🗑️');
    } else if (res.status === 404) {
      setStatusMsg('❌ Cita no encontrada en el servidor');
    } else {
      setStatusMsg('❌ Error al eliminar la cita');
    }
  } catch (err) {
    console.error(err);
    setStatusMsg('Error de red al eliminar');
  }
};

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Eliminar cita</h2>

      {statusMsg && <p className="mb-4 text-sm text-red-600">{statusMsg}</p>}

      <select
        onChange={(e) => setSelected(e.target.value)}
        value={selected}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Selecciona cita</option>
        {citas.map((cita) => (
          <option key={cita.cita_id} value={cita.cita_id}>
            {cita.cita_id}: {cita.nombre}
          </option>
        ))}
      </select>

      <div>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          disabled={!selected}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
