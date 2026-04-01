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

### 1. 기준 안무 데이터 (실시간 담당 팀원)
`src/hooks/usePoseData.js`
```js
// 이 주소를 팀원 API 주소로 교체
const response = await fetch(`http://localhost:8000/api/pose/${songId}`);
// 팀원 데이터 형식에 따라 아래 수정
setReferenceData(data.landmarks);
```

### 2. 실시간 유사도 점수 (실시간 담당 팀원)
`src/components/WebcamCapture.jsx`
```js
// score, jointScores 상태값에 팀원 API 결과 넣으면 됨
const [score, setScore] = useState(null);
const [jointScores, setJointScores] = useState([]);
```

### 3. DTW 종합 리포트 (DTW 담당 팀원)
`src/components/ReportView.jsx`
```js
// 이 주소를 팀원 API 주소로 교체
const response = await fetch(`http://localhost:8000/api/dtw/result/${sessionId}`);
// 팀원 데이터 형식에 따라 아래 수정
setReport(data);
```

## 실행 방법
```bash
npm install
npm run dev
```
