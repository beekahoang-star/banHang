@echo off
echo ============================================================
echo   KHOI CHAY BACKEND SPRING BOOT 3 (JAVA 21 MODULAR MONOLITH)
echo ============================================================
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0backend"
java -jar target\platform-1.0.0-SNAPSHOT.jar
pause
