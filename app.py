"""
DiferencialLab - Servidor Web Educativo con Python, Flask y SymPy
Laboratorio Interactivo de Ecuaciones Diferenciales
"""

import os
import sys
from flask import Flask, render_template, send_from_directory
import sympy as sp
import numpy as np

from backend.rutas.api_routes import api_bp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTERFAZ_DIR = os.path.join(BASE_DIR, "interfaz")

# Inicialización de la aplicación Flask
app = Flask(__name__, template_folder=INTERFAZ_DIR, static_folder=None)

# Registro de la API REST modular
app.register_blueprint(api_bp)

# ==============================================================================
# RUTAS DE INTERFAZ WEB Y ARCHIVOS ESTÁTICOS
# ==============================================================================

@app.route("/")
@app.route("/index.html")
@app.route("/index.htm")
@app.route("/interfaz/index.html")
def index():
    return render_template("index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    # Si solicitan index.html por cualquier ruta, renderizarlo con Jinja2
    if filename.lower() in ("index.html", "index.htm", "interfaz/index.html"):
        return render_template("index.html")
    interfaz_file = os.path.join(INTERFAZ_DIR, filename)
    if os.path.exists(interfaz_file) and os.path.isfile(interfaz_file):
        return send_from_directory(INTERFAZ_DIR, filename)
    root_file = os.path.join(BASE_DIR, filename)
    if os.path.exists(root_file) and os.path.isfile(root_file):
        return send_from_directory(BASE_DIR, filename)
    return ("Not found", 404)

# ==============================================================================
# ARRANQUE DEL SERVIDOR LOCAL
# ==============================================================================

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    port = int(os.environ.get("PORT", 5000))
    host = "0.0.0.0"
    print("=" * 65)
    print("  DIFERENCIALLAB - SERVIDOR EDUCATIVO EN PYTHON & FLASK")
    print(f"  SymPy v{sp.__version__} | NumPy v{np.__version__}")
    print(f"  Servidor activo en: http://{host}:{port}")
    print("  Abre esa dirección en tu navegador para interactuar.")
    print("=" * 65)
    app.run(host=host, port=port, debug=False)
