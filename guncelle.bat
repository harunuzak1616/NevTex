@echo off
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   NevTex Pro — GitHub Güncelleme    ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

git add .
git commit -m "guncelleme %date% %time:~0,5%"
git push

echo.
echo  ✅ Netlify otomatik güncellenecek (~30 sn)
echo  🔗 nevtexapp.netlify.app
echo.
pause
