@echo off
echo ========================================
echo  Starting Baileys Microservice Test
echo ========================================
echo.

echo Starting Baileys Microservice on port 4444...
cd baileys-microservice
start "Baileys Microservice" cmd /k "npm start"

echo.
echo Waiting 3 seconds for microservice to start...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  Microservice is starting...
echo ========================================
echo.
echo Microservice: http://localhost:4444
echo Health Check: http://localhost:4444/health
echo Test Page: http://localhost:4444/test-qr.html
echo.
echo Testing Endpoints:
echo - POST /testing/init
echo - GET  /testing/qr/{sessionId}
echo - GET  /testing/status/{sessionId}
echo - POST /testing/send/{sessionId}
echo - GET  /testing/sessions
echo - DELETE /testing/disconnect/{sessionId}
echo.
echo Press any key to exit...
pause >nul
