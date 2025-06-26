import React, { useState } from 'react';
import AppointmentForm from './components/AppointmentForm';
import ModifyAppointment from './components/ModifyAppointment';
import DeleteAppointment from './components/DeleteAppointment';

function App() {
  const [view, setView] = useState("agendar");


  return (
    <div className="flex min-h-screen">
      <aside className="w-1/4 bg-gray-100 p-4 flex flex-col items-center">
        <img
          src="./IMSS_LOGO.png"
          alt="IMSS"
          className="w-24 mb-6"
        />

        <nav className="space-y-4 w-full">
          <button
            onClick={() => setView("agendar")}
            className={`text-left w-full px-4 py-2 rounded ${
              view === "agendar"
                ? "bg-white text-green-900 font-semibold shadow"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            Agendar cita
          </button>
          <button
            onClick={() => setView("modificar")}
            className={`text-left w-full px-4 py-2 rounded ${
              view === "modificar"
                ? "bg-white text-green-900 font-semibold shadow"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            Modificar cita
          </button>
          <button
            onClick={() => setView("eliminar")}
            className={`text-left w-full px-4 py-2 rounded ${
              view === "eliminar"
                ? "bg-white text-green-900 font-semibold shadow"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            Eliminar cita
          </button>
        </nav>
      </aside>

      <main className="w-3/4 p-10">
        {view === "agendar" && <AppointmentForm />}
        {view === "modificar" && <ModifyAppointment />}
        {view === "eliminar" && <DeleteAppointment />}
      </main>
    </div>
  );
}

export default App;
