"""
Controladores y rutas de la API REST de DiferencialLab.
"""
import sys
import random
from flask import Blueprint, jsonify, request
import sympy as sp
import numpy as np

from backend.datos.curiosidades import CURIOSIDADES
from backend.datos.preguntas import BANCO_PREGUNTAS
from backend.servicios.resolutor_edo import parse_and_solve_ode

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/status", methods=["GET"])
def get_status():
    """Retorna el estado del backend de Python y las versiones activas."""
    return jsonify({
        "status": "online",
        "engine": "Python SymPy + Flask",
        "python_version": sys.version.split()[0],
        "sympy_version": sp.__version__,
        "numpy_version": np.__version__,
        "curiosidades_count": len(CURIOSIDADES),
        "preguntas_count": len(BANCO_PREGUNTAS)
    })

@api_bp.route("/curiosities", methods=["GET"])
def get_curiosities():
    """Retorna todas las curiosidades o filtradas por categoría."""
    categoria = request.args.get("categoria")
    if categoria and categoria != "todas":
        filtered = [c for c in CURIOSIDADES if c["categoria"] == categoria]
        return jsonify(filtered)
    return jsonify(CURIOSIDADES)

@api_bp.route("/curiosities/random", methods=["GET"])
def get_random_curiosity():
    """Retorna un dato curioso aleatorio."""
    return jsonify(random.choice(CURIOSIDADES))

@api_bp.route("/questions", methods=["GET"])
def get_questions():
    """
    Retorna preguntas para el juego.
    Soporta modos: 'desafio' (10 preguntas aleatorias), 'supervivencia' (todas en orden aleatorio), 'practica'.
    """
    count = request.args.get("count", default=None, type=int)
    categoria = request.args.get("categoria", default=None)
    
    lista = list(BANCO_PREGUNTAS)
    if categoria and categoria != "todas":
        lista = [q for q in lista if q["categoria"] == categoria]
        
    random.shuffle(lista)
    
    if count and count > 0:
        lista = lista[:count]
        
    # Mezclar las opciones aleatoriamente para evitar patrones
    preparadas = []
    for q in lista:
        opciones_originales = list(q["opciones"])
        correcta_texto = opciones_originales[q["correcta"]]
        
        # Mezclar opciones
        shuffled_opts = list(opciones_originales)
        random.shuffle(shuffled_opts)
        nueva_correcta = shuffled_opts.index(correcta_texto)
        
        preparadas.append({
            "id": q["id"],
            "pregunta": q["pregunta"],
            "opciones": shuffled_opts,
            "correcta": nueva_correcta,
            "categoria": q["categoria"],
            "dificultad": q["dificultad"],
            "explicacion": q["explicacion"]
        })
        
    return jsonify({
        "total": len(preparadas),
        "preguntas": preparadas
    })

@api_bp.route("/solve", methods=["POST"])
def solve_ode_endpoint():
    """
    Resuelve una EDO ingresada por el usuario o seleccionada de los modelos preseteados.
    """
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400
        
    model_type = data.get("type", "preset")
    if model_type == "preset":
        model_type = data.get("model", "exp")
    x0 = float(data.get("x0", 0.0))
    y0 = float(data.get("y0", 1.0)) if data.get("y0") is not None else None
    y1 = float(data.get("y1", 0.0)) if data.get("y1") is not None else None
    
    eq_str = ""
    if model_type == "custom":
        eq_str = data.get("equation", "").strip()
        if not eq_str:
            return jsonify({"error": "Por favor escribe una ecuación diferencial válida"}), 400
    elif model_type == "exp":
        k = float(data.get("k", 2.0))
        eq_str = f"y' = {k}*y"
    elif model_type == "cooling":
        k = float(data.get("k", 0.5))
        Ta = float(data.get("Ta", 20.0))
        eq_str = f"y' = -{k}*(y - {Ta})"
    elif model_type == "linear":
        a = float(data.get("a", 2.0))
        b = float(data.get("b", 4.0))
        eq_str = f"y' + {a}*y = {b}"
    elif model_type == "harmonic":
        omega2 = float(data.get("omega2", 4.0))
        eq_str = f"y'' + {omega2}*y = 0"
    elif model_type == "damped":
        gamma = float(data.get("gamma", 1.0))
        omega2 = float(data.get("omega2", 5.0))
        eq_str = f"y'' + {2*gamma}*y' + {omega2}*y = 0"
    elif model_type == "power":
        a = float(data.get("a", 1.0))
        n = int(data.get("n", 2))
        eq_str = f"y' = {a}*x**{n}"
    else:
        eq_str = "y' = 2*y"

    try:
        resultado = parse_and_solve_ode(eq_str, x0=x0, y0=y0, y1=y1)
        resultado["equation_input"] = eq_str
        return jsonify(resultado)
    except Exception as e:
        return jsonify({
            "error": f"No se pudo resolver la ecuación: {str(e)}",
            "detalles": "Verifica la sintaxis (ejemplo: y' = 3*y, y' + 2*y = 4, y'' + 9*y = 0)"
        }), 400
