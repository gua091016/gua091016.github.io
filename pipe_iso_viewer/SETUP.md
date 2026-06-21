# Pipe ISO Viewer - 설치 가이드 (Windows)

## 필수 준비물

1. **Flutter SDK** 설치 → https://docs.flutter.dev/get-started/install/windows
2. **Android Studio** 설치 (이미 설치됨 ✓)
3. Android Studio에 **Flutter + Dart 플러그인** 설치
   - `File → Settings → Plugins → "Flutter" 검색 → 설치`

---

## 설치 순서

### 1단계: GitHub에서 다운로드

명령 프롬프트 열기 → 아래 입력:

```
cd %USERPROFILE%\Desktop
git clone https://github.com/gua091016/gua091016.github.io.git
```

바탕화면에 `gua091016.github.io` 폴더가 생깁니다.

### 2단계: setup.bat 실행 (최초 1회만)

탐색기에서:
`바탕화면 → gua091016.github.io → pipe_iso_viewer → setup.bat` **더블클릭**

완료 메시지가 뜰 때까지 기다리세요 (약 2~5분).

### 3단계: Android Studio에서 열기

1. Android Studio 실행
2. **File → Open**
3. `바탕화면\gua091016.github.io\pipe_iso_viewer` 폴더 선택
4. **OK**

> "Get from VCS"가 안 보이면 → **File → Open** 으로 열면 됩니다.

### 4단계: 실행

에뮬레이터 또는 실기기 연결 후 상단 ▶ (Run) 버튼 클릭.

---

## 4. iOS 설정 (iOS 빌드 시)

`ios/Runner/Info.plist`에 추가:

```xml
<!-- PDF 공유 수신 -->
<key>CFBundleDocumentTypes</key>
<array>
    <dict>
        <key>CFBundleTypeName</key>
        <string>PDF Document</string>
        <key>LSHandlerRank</key>
        <string>Alternate</string>
        <key>LSItemContentTypes</key>
        <array>
            <string>com.adobe.pdf</string>
        </array>
    </dict>
</array>

<!-- 공유 extension -->
<key>NSShareUsageDescription</key>
<string>Pipe ISO 앱에서 PDF를 공유받아 3D로 시각화합니다</string>
```

## 5. 실행

```bash
flutter run
```

## 주요 패키지

| 패키지 | 용도 |
|--------|------|
| `three_dart` + `flutter_gl` | 3D 렌더링 (PBR 금속 재질) |
| `receive_sharing_intent` | Pipe ISO 앱 PDF 공유 수신 |
| `file_picker` | 직접 파일 선택 |
| `flutter_riverpod` | 상태 관리 |
| `go_router` | 화면 라우팅 |

## 구조

```
lib/
├── main.dart                          # 앱 진입점 + 공유 수신
├── models/
│   └── pipe_document.dart             # 데이터 모델 (PipeDocument, Vec3 등)
├── services/
│   ├── pdf_parser_service.dart        # PDF 바이너리 → 선분 파싱
│   └── iso_3d_builder.dart            # 2D ISO → 3D 재구성
├── screens/
│   ├── home_screen.dart               # 홈 (PDF 업로드)
│   └── viewer_screen.dart             # 3D 뷰어
└── theme/
    └── app_theme.dart                 # 다크 인더스트리얼 테마
```
