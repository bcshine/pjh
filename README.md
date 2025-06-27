# 🍽️ 음식 칼로리 계산기

사진을 찍어서 칼로리를 측정하는 모바일 친화적인 웹앱입니다.

## ✨ 주요 기능

- 📷 카메라 촬영 또는 갤러리에서 이미지 선택
- 🤖 AI를 활용한 음식 인식 및 칼로리 추정
- 📊 상세한 계산 과정 표시
- 🏃‍♂️ 칼로리 소모를 위한 운동량 제안
- 📋 결과 복사 기능
- 📱 모바일 반응형 디자인

## 🔐 GitHub Pages 자동 배포 (권장)

### 1단계: GitHub Secrets 설정 (보안)
1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name: `GEMINI_API_KEY`
4. Secret: 실제 Gemini API 키 입력 (예: AIzaSy...)
5. **Add secret** 클릭

### 2단계: GitHub Actions 활성화
1. 저장소 → **Settings** → **Pages**
2. Source: **GitHub Actions** 선택
3. 코드 푸시 시 자동 배포됨

### 3단계: 배포 완료! 🎉
- 이제 코드 푸시만 하면 API 키가 자동으로 적용되어 배포됩니다
- 사용자는 별도 API 키 입력 없이 바로 사용 가능합니다
- API 키는 GitHub Secrets에 안전하게 보호됩니다

## 🛠️ 로컬 개발

### API 키 설정
```bash
# config.example.js를 config.js로 복사
cp config.example.js config.js

# config.js 파일에서 API 키 수정
# window.CONFIG = { GEMINI_API_KEY: 'YOUR_ACTUAL_API_KEY' };
```

### 로컬 서버 실행
```bash
# Python 사용
python -m http.server 8000

# Node.js 사용
npx serve .
```

## 📁 프로젝트 구조

```
pjh/
├── .github/workflows/deploy.yml  # GitHub Actions 배포 설정
├── index.html                    # 메인 HTML 파일
├── style.css                     # 스타일시트
├── script.js                     # JavaScript 로직
├── config.example.js             # API 키 예시 파일
├── .gitignore                    # Git 무시 파일
├── README.md                     # 프로젝트 설명
└── images/                       # 샘플 이미지 폴더
    ├── menu1.jpg                 # 김치찌개
    ├── menu2.jpg                 # 스파게티
    ├── menu3.webp                # 햄버거
    └── menu4.png                 # 샌드위치
```

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI API**: Google Gemini 1.5 Flash
- **배포**: GitHub Actions + GitHub Pages
- **보안**: GitHub Secrets

## 📱 사용법

1. **샘플 이미지 선택**: 첫 화면의 2x2 샘플 이미지 중 하나를 클릭
2. **사진 촬영/업로드**: 카메라 버튼으로 촬영하거나 갤러리에서 선택
3. **칼로리 분석**: '칼로리 분석하기' 버튼 클릭
4. **결과 확인**: 음식명, 칼로리, 계산 과정, 운동량 정보 확인
5. **결과 복사**: '결과 복사하기' 버튼으로 클립보드에 복사

## ⚠️ 보안 주의사항

- ✅ **GitHub Secrets 사용**: API 키가 코드에 노출되지 않음
- ✅ **자동 배포**: 사용자가 매번 API 키를 입력할 필요 없음
- ✅ **HTTPS 지원**: GitHub Pages는 기본적으로 HTTPS 제공
- ❌ **API 키를 코드에 직접 입력하지 마세요**

## 🚀 시작하기

1. 이 저장소를 Fork 또는 Clone
2. GitHub Secrets에 API 키 설정
3. 코드 푸시하면 자동 배포
4. 웹사이트에서 바로 사용!

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.

