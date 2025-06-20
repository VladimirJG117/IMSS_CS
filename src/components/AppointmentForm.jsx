import React, { useState } from 'react';

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    nombre: '', apellidos: '', direccion: '', correo: '',
    telefono: '', movil: '', fecha: '', hora: '',
    consultorio: '', unidadMedica: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const citasPrevias = JSON.parse(localStorage.getItem("citas")) || [];
    const nuevasCitas = [...citasPrevias, formData];
    localStorage.setItem("citas", JSON.stringify(nuevasCitas));
    alert("Cita guardada correctamente ✅");
    setFormData({
      nombre: '', apellidos: '', direccion: '', correo: '',
      telefono: '', movil: '', fecha: '', hora: '',
      consultorio: '', unidadMedica: ''
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agendar cita</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {Object.keys(formData).map((key) => (
          <input key={key} name={key} value={formData[key]} onChange={handleChange} placeholder={key} className="border p-2 rounded" />
        ))}
        <div className="col-span-2">
          <button type="submit" className="bg-green-900 text-white px-6 py-2 rounded hover:bg-green-800 w-full">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
