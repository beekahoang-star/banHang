@echo off
echo ============================================================
echo   DUNG TOAN BO DU AN (BACKEND :8080 ^& FRONTEND :5173)
echo ============================================================

echo Dang dung Backend (Port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Dang dung Frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Da dung tat ca cac tien trinh cua du an.
pause
