# Pipe ISO Viewer - 셋업 가이드

## 1. 새 Flutter 프로젝트 생성

```bash
flutter create pipe_iso_viewer --org com.yourcompany
cd pipe_iso_viewer
```

## 2. 이 폴더 내용으로 덮어쓰기

git pull 받은 `pipe_iso_viewer/` 폴더의 내용을 위에서 만든 프로젝트에 복사합니다:
- `lib/` 전체
- `pubspec.yaml`
- `android/app/src/main/AndroidManifest.xml`

## 3. 패키지 설치

```bash
flutter pub get
```

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
