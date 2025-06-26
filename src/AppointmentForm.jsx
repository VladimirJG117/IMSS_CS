// src/components/AppointmentForm.jsx
import { useState } from "react";

export default function AppointmentForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { name, email, date, notes };

    try {
      const res = await fetch("http://localhost:8000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg("✔ Cita creada correctamente");
        // Limpia formulario si quieres:
        setName("");
        setEmail("");
        setDate("");
        setNotes("");
      } else {
        throw new Error(data.detail || "Error al crear cita");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Hubo un error: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Fecha:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Notas (opcional):</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit">Agendar cita</button>

      {statusMsg && <p>{statusMsg}</p>}
    </form>
  );
}
