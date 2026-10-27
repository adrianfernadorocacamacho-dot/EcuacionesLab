@echo off
title DiferencialLab - Laboratorio Interactivo de Ecuaciones Diferenciales
color 0B
echo =====================================================================
echo           DIFERENCIALLAB - LABORATORIO DE ECUACIONES DIFERENCIALES
echo =====================================================================
echo.
echo  Iniciando servidor educativo en Python con SymPy y Flask...
echo.

REM Inicia el navegador despues de 2 segundos en segundo plano
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5000"

REM Ejecuta el servidor Flask con Python
python app.py

pause
