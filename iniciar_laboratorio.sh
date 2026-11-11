#!/usr/bin/env bash
echo "====================================================================="
echo "          DIFERENCIALLAB - LABORATORIO DE ECUACIONES DIFERENCIALES   "
echo "====================================================================="
echo ""
echo " Iniciando servidor educativo en Python con SymPy y Flask..."
echo ""

(sleep 2 && (xdg-open "http://localhost:5000" 2>/dev/null || sensible-browser "http://localhost:5000" 2>/dev/null)) &

python3 app.py

