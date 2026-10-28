@echo off
echo ============================================================
echo   KHOI CHAY TOAN BO DU AN (BACKEND + FRONTEND)
echo ============================================================

echo 1. Dang khoi dong Backend Spring Boot (Port 8080)...
start "Backend Spring Boot" cmd /k "%~dp0run-backend.bat"

echo 2. Dang khoi dong Frontend React Vite (Port 5173)...
start "Frontend React Vite" cmd /k "%~dp0run-frontend.bat"

echo.
echo ============================================================
echo   Ca 2 server dang chay trong cac cua so rieng biet:
echo   - Frontend: http://localhost:5173
echo   - Backend Swagger: http://localhost:8080/swagger-ui.html
echo   - De dung toan bo, chay file: stop-all.bat
echo ============================================================
pause
