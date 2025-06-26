import React, { useState } from 'react';

export default function ModifyAppointment() {
  const [curp, setCurp] = useState('');
  const [citas, setCitas] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState({ fecha: '', hora: '', unidadMedica: '' });
  const [statusMsg, setStatusMsg] = useState('');

  // Buscar citas por CURP
  const handleCurpChange = async (e) => {
    const value = e.target.value.toUpperCase();
    setCurp(value);
    if (value.length === 18) {
      setStatusMsg('Buscando citas...');
      try {
        const res = await fetch(`http://localhost:8000/api/appointments/user/${value}`);
        if (!res.ok) {
          if (res.status === 404) {
            setStatusMsg('No se encontraron citas para ese CURP');
            setCitas([]);
          } else {
            setStatusMsg('Error al buscar citas');
          }
          return;
        }
        const list = await res.json();
        setCitas(list);
        setStatusMsg('');
      } catch (err) {
        console.error(err);
        setStatusMsg('Error de red al buscar citas');
      }
    }
  };

  // Seleccionar cita y precargar data
  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const cita = citas.find((c) => c.cita_id.toString() === id);
    if (cita) {
      setData({
        fecha: cita.fecha,
        hora: cita.hora,
        unidadMedica: cita.unidadMedica.toString(),
      });
      setStatusMsg('');
    }
  };

  // Actualizar campo de data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar actualización al backend
  const handleUpdate = async () => {
    if (!selectedId) return alert('Selecciona una cita');
    setStatusMsg('Actualizando cita...');
    try {
      const body = {
        fecha: data.fecha,
        hora: data.hora,
        unidadMedica: parseInt(data.unidadMedica, 10),
      };
      const res = await fetch(`http://localhost:8000/api/appointments/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errRes = await res.json();
        setStatusMsg(`Error: ${errRes.detail || res.statusText}`);
        return;
      }
      setStatusMsg('Cita actualizada correctamente ✅');
    } catch (err) {
      console.error(err);
      setStatusMsg('Error de red al actualizar');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Modificar cita</h2>

      {/* Input CURP */}
      <div className="mb-4">
        <label htmlFor="curp" className="block text-sm font-medium text-gray-700 mb-1">
          CURP del paciente
        </label>
        <input
          id="curp"
          name="curp"
          value={curp}
          onChange={handleCurpChange}
          placeholder="AAAA000000HDFXXX09"
          className="w-full border p-2 rounded uppercase"
          maxLength={18}
        />
      </div>

      {statusMsg && <p className="text-sm text-red-600 mb-4">{statusMsg}</p>}

      {/* Select de citas */}
      <div className="mb-6">
        <select
          onChange={handleSelect}
          value={selectedId}
          className="border p-2 rounded w-full"
        >
          <option value="">Selecciona cita</option>
          {citas.map((cita) => (
            <option key={cita.cita_id} value={cita.cita_id}>
              {cita.cita_id}: {cita.fecha} {cita.hora}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario para modificar sólo fecha, hora y unidad médica */}
      {selectedId && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              name="fecha"
              value={data.fecha}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              id="hora"
              type="time"
              name="hora"
              value={data.hora}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="unidadMedica" className="block text-sm font-medium text-gray-700 mb-1">
              Unidad Médica (ID)
            </label>
            <input
              id="unidadMedica"
              type="number"
              name="unidadMedica"
              value={data.unidadMedica}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleUpdate}
        disabled={!selectedId}
        className="bg-green-800 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        Guardar cambios
      </button>
    </div>
  );
}