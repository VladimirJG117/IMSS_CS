from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from deps import get_db
from typing import List, Optional

# Al final de main.py
if __name__ == "__main__":
    import uvicorn
    # Mostramos en consola todas las rutas registradas
    for route in app.routes:
        print(f"{route.path} → {route.methods}")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)


app = FastAPI()

# 1) Configura CORS ANTES de definir routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # o ["*"] mientras pruebas
    allow_credentials=True,
    allow_methods=["*"],      # permite GET, POST, OPTIONS, etc.
    allow_headers=["*"],      # permite Content-Type, Authorization, ...
)

# 2) Ahora ya define tu modelo y rutas
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time, datetime, timedelta

class AppointmentUpdate(BaseModel):
    fecha: Optional[date]
    hora: Optional[time]
    unidadMedica: Optional[int]  # alias de unidad_id

class Appointment(BaseModel):
    curp: str
    nombre: str
    apellidos: str
    direccion: str
    correo: EmailStr
    telefono: str
    movil: Optional[str]
    fecha: Optional[str]
    hora: Optional[str]
    consultorio: str
    unidadMedica: str

class CurpRequest(BaseModel):
    curp: str


# 2) Endpoint para crear una cita
@app.post("/api/appointments")
async def create_appointment(cita: Appointment, db=Depends(get_db)):
    # 2.1) Verificar que el paciente exista y obtener su ID
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT usuario_id FROM usuario WHERE curp = ?",
        (cita.curp.upper(),)
    )
    paciente = cursor.fetchone()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    paciente_id = paciente["usuario_id"]

    # 2.2) Insertar la cita
    cursor.execute(
        "INSERT INTO citas (paciente_id, unidad_id, fecha, hora, estado) "
        "VALUES (?, ?, ?, ?, 'pendiente')",
        (paciente_id, cita.unidadMedica, cita.fecha, cita.hora)
    )
    db.commit()

    # 2.3) Recuperar la cita recién creada
    cita_id = cursor.lastrowid
    cursor.execute("SELECT * FROM citas WHERE cita_id = ?", (cita_id,))
    nueva_cita = cursor.fetchone()

    return nueva_cita

# 1) Endpoint para buscar usuario por CURP
@app.post("/api/getuser")
async def get_user_by_curp(req: CurpRequest, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT usuario_id, nombre, apellidos, direccion, fecha_nacimiento, movil, sexo, telefono, correo, curp "
        "FROM usuario WHERE curp = ?",
        (req.curp.upper(),)
    )
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@app.get("/ping")
async def ping():
    return {"pong": True}


@app.get("/api/appointments", response_model=list[dict])
async def list_appointments(db = Depends(get_db)):
    """
    Retorna todas las citas con su ID y el nombre del paciente.
    """
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT 
          c.cita_id      AS cita_id,
          u.nombre       AS nombre
        FROM citas c
        JOIN usuario u
          ON c.paciente_id = u.usuario_id
        """
    )
    filas = cursor.fetchall()
    return filas

@app.delete("/api/appointments/{cita_id}", status_code=204)
async def delete_appointment(cita_id: int, db=Depends(get_db)):
    """
    Elimina la cita con el ID dado. 
    Devuelve 204 No Content si se borró, 404 si no existía.
    """
    cursor = db.cursor()
    cursor.execute("DELETE FROM citas WHERE cita_id = ?", (cita_id,))
    db.commit()
    if cursor.rowcount == 0:
        # No borró nada → ese cita_id no existía
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    # Al usar status_code=204, FastAPI devolverá respuesta vacía


@app.get("/api/appointments/user/{curp}", response_model=list[dict])
async def get_appointments_by_user(curp: str, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute("SELECT usuario_id FROM usuario WHERE curp = ?", (curp.upper(),))
    paciente = cur.fetchone()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    cur.execute(
        "SELECT cita_id, fecha, hora, unidad_id AS unidadMedica "
        "FROM citas WHERE paciente_id = ?",
        (paciente["usuario_id"],)
    )
    rows = cur.fetchall()

    #Formatea fecha (ISO) y hora (HH:MM) para JSON
    formatted = []
    for r in rows:
        # Fecha a 'YYYY-MM-DD'
        f = r["fecha"].isoformat() if isinstance(r["fecha"], date) else str(r["fecha"])
        # Hora puede venir como timedelta
        h_val = r["hora"]
        if isinstance(h_val, timedelta):
            secs = h_val.seconds
            hh = secs // 3600
            mm = (secs % 3600) // 60
            h = f"{hh:02d}:{mm:02d}"
        else:
            # si ya fuera time
            h = h_val.strftime("%H:%M")
        formatted.append({
            "cita_id": r["cita_id"],
            "fecha": f,
            "hora": h,
            "unidadMedica": r["unidadMedica"]
        })
    return formatted


@app.put("/api/appointments/{cita_id}", response_model=dict)
async def update_appointment(
    cita_id: int,
    apt: AppointmentUpdate,
    db=Depends(get_db)
):
    cursor = db.cursor(dictionary=True)
    # 1) Verificar existencia de la cita
    cursor.execute("SELECT * FROM citas WHERE cita_id = ?", (cita_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    # 2) Construir dinámicamente el SET según campos no nulos
    updates = []
    params = []

    if apt.fecha is not None:
        updates.append("fecha = ?")
        params.append(apt.fecha)
    if apt.hora is not None:
        updates.append("hora = ?")
        params.append(apt.hora)
    if apt.unidadMedica is not None:
        updates.append("unidad_id = ?")
        params.append(apt.unidadMedica)

    if not updates:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    # 3) Ejecutar el UPDATE
    params.append(cita_id)
    sql = f"UPDATE citas SET {', '.join(updates)} WHERE cita_id = ?"
    cursor.execute(sql, tuple(params))
    db.commit()

    # 4) Recuperar y formatear la cita actualizada
    cursor.execute(
        "SELECT cita_id, fecha, hora, unidad_id AS unidadMedica "
        "FROM citas WHERE cita_id = ?",
        (cita_id,)
    )
    row = cursor.fetchone()
    # formatear fecha e hora para JSON
    row["fecha"] = row["fecha"].isoformat()
    # hora puede venir como timedelta
    h = row["hora"]
    if isinstance(h, timedelta):
        secs = h.seconds
        hh = secs // 3600
        mm = (secs % 3600) // 60
        row["hora"] = f"{hh:02d}:{mm:02d}"
    else:
        row["hora"] = h.strftime("%H:%M")

    return row