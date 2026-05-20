# K-POP 안무 학습 시스템 - 프론트엔드

React + Vite 기반의 K-POP 안무 학습 프론트엔드입니다.

## 기술 스택
- React (Vite)
- MediaPipe Tasks Vision
- JavaScript

## 프로젝트 구조
```
src/
├── components/
│   ├── SongSelect.jsx      # 곡 선택 화면
│   ├── WebcamCapture.jsx   # 웹캠 + 관절 추출 + 실시간 화면
│   └── ReportView.jsx      # DTW 종합 리포트 화면
├── hooks/
│   ├── useMediaPipe.js     # MediaPipe 초기화 + 관절 추출
│   └── usePoseData.js      # 기준 안무 데이터 fetch
└── App.jsx                 # 전체 앱 구조 + 화면 전환
```

## API 연동 위치

### 1. 기준 안무 데이터 (실시간 담당 주영)
`src/hooks/usePoseData.js`

### 2. 실시간 유사도 점수 (실시간 담당 주영)
`src/components/WebcamCapture.jsx`

## 백엔드 API 연동 현황

완료
  
### 3. DTW 종합 리포트 (DTW 담당 효리)
`src/components/ReportView.jsx`

## 실행 방법
```bash
npm install
npm run dev
```
