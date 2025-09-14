@echo off
echo ========================================
echo  Starting Microservice Integration
echo ========================================
echo.

echo Starting Baileys Microservice on port 4444...
start "Baileys Microservice" cmd /k "cd baileys-microservice && npm start"

echo.
echo Waiting 5 seconds for microservice to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Main Application on port 8080...
start "Main Application" cmd /k "npm start"

echo.
echo ========================================
echo  Both services are starting...
echo ========================================
echo.
echo Main App: http://localhost:8080
echo Microservice: http://localhost:4444
echo Health Check: http://localhost:4444/health
echo.
echo Press any key to exit...
pause >nul
