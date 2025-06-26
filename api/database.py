# app/database.py
import os
import mariadb
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()  # carga variables de .env

def get_connection():
    try:
        conn = mariadb.connect(
            host     = os.getenv("DB_HOST"),
            port     = int(os.getenv("DB_PORT", 3306)),
            user     = os.getenv("DB_USER"),
            password = os.getenv("DB_PASS"),
            database = os.getenv("DB_NAME")
        )
        return conn
    except mariadb.Error as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar a BD: {e}")
