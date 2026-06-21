@echo off
chcp 65001 >nul
echo ============================================
echo   Pipe ISO Viewer - 초기 설정
echo ============================================
echo.

where flutter >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Flutter SDK가 설치되어 있지 않거나 PATH에 없습니다.
    echo Flutter 설치: https://docs.flutter.dev/get-started/install/windows
    pause
    exit /b 1
)

echo [1/3] Flutter 프로젝트 초기화 중...
flutter create . --org com.yourcompany --project-name pipe_iso_viewer --platforms android,ios

echo.
echo [2/3] 패키지 설치 중...
flutter pub get

echo.
echo [3/3] 완료!
echo.
echo ============================================
echo  이제 Android Studio에서 아래 방법으로 여세요:
echo.
echo  File → Open → 이 폴더(pipe_iso_viewer) 선택
echo ============================================
echo.
pause
