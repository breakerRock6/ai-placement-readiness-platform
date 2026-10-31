@echo off
echo Stopping NutriTrack...
taskkill /fi "WINDOWTITLE eq NutriTrack API*" /t /f >nul 2>nul
taskkill /fi "WINDOWTITLE eq NutriTrack Web*" /t /f >nul 2>nul
echo Done. If any window is still open, just close it.
timeout /t 3 >nul