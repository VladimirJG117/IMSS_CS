import React, { useState } from 'react';

export default function AppointmentForm() {
  const [formData, setFormData] = useState({
    nombre: '', apellidos: '',
    direccion: '', correo: '',
    telefono: '', movil: '', 
    fecha: '', hora: '', unidadMedica: '', curp: ''
  });

  const [statusMsg, setStatusMsg] = useState("");
  const [curpError, setCurpError] = useState(null);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));


    if (name === 'curp' && value.length === 18) {
      setCurpError(null);
      setStatusMsg('Buscando usuario...');
      try {
        const res = await fetch('http://localhost:8000/api/getuser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ curp: value })
        });
        const data = await res.json();

        if (!res.ok) {
          setCurpError(data.detail || 'Usuario no encontrado');
          setStatusMsg('');
        } else {
          // Rellenamos los datos del usuario encontrado
          setFormData(prev => ({
            ...prev,
            nombre: data.nombre,
            apellidos: data.apellidos,
            direccion: data.direccion,
            correo: data.correo,
            telefono: data.telefono,
            movil: data.movil,
            // mantenemos curp
          }));
          setStatusMsg('Usuario cargado');
        }
      } catch (err) {
        console.error(err);
        setCurpError('Error al buscar usuario');
        setStatusMsg('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const citasPrevias = JSON.parse(localStorage.getItem("citas")) || [];
    const nuevasCitas = [...citasPrevias, formData];
    localStorage.setItem("citas", JSON.stringify(nuevasCitas));
    alert("Cita guardada correctamente ✅");
    setFormData({
      nombre: '', apellidos: '', direccion: '', correo: '',
      telefono: '', movil: '', fecha: '', hora: ''
  , unidadMedica: ''
    });

    console.log(formData);
    

    try {
      const res = await fetch("http://localhost:8000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      
    if (!res.ok) {
      // 1) Muestra TODO el objeto de error
      console.error("📦 error body:", data);

      // 2) Si viene data.detail (un array), formatea cada error:
      if (Array.isArray(data.detail)) {
        const mensajes = data.detail.map((err) => {
          // err.loc suele ser ["body", "campo"] o ["body","cita","campo"]
          const campo = err.loc.slice(-1)[0];           // extrae el nombre del campo
          return `– ${campo}: ${err.msg}`;
        });
        setStatusMsg("❌ Validación fallida:\n" + mensajes.join("\n"));
      } else {
        setStatusMsg("❌ Error inesperado, mira la consola");
      }
      return;
    }

    } catch (err) {
      console.error(err);
      setStatusMsg(" Hubo un error: " + err.messsage);
    }




    
    
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agendar cita</h2> <h2 className='ext-2xl font-bold mb-6' >Usuario</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label htmlFor="curp" className="block text-sm font-medium text-gray-700 mb-1">
            CURP
          </label>
          <input
            id="curp"
            name="curp"
            value={formData.curp || ""}
            onChange={handleChange}
            placeholder="CURP"
            className="w-full border p-2 rounded uppercase"
            maxLength={18}
            pattern="[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d"
            title="Formato: 4 letras, 6 dígitos, H o M, 5 letras, dígito o letra"
            required
          />
      </div>
        {/* Campos del formulario con tipos adecuados para fecha y hora */}
        {Object.keys(formData)
          .filter(key => key !== 'curp')
          .map((key) => {
            if (key === 'fecha') {
              return (
                <input
                  key={key}
                  type="date"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  required
                />
              );
            }
            if (key === 'hora') {
              return (
                <input
                  key={key}
                  type="time"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  required
                />
              );
            }
            return (
              <input
                key={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={key}
                className="border p-2 rounded"
              />
            );
          })}

        <div className="col-span-2">
          <button type="submit" className="bg-green-900 text-white px-6 py-2 rounded hover:bg-green-800 w-full">Guardar</button>
        </div>

        {statusMsg && statusMsg !== 'Buscando usuario...' && (
          <pre className="col-span-2 whitespace-pre-wrap text-sm text-gray-800">{statusMsg}</pre>
        )}
      </form>
    </div>
  );
}