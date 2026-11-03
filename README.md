# ⌨️ KeyReflex Studio (키리플렉스 스튜디오)

> **인체공학 2D 벡터 손 가이드 기반 키보드 반응속도 측정 & 한/영 타자 연습 스튜디오**  
> Ergonomic 2D Vector Hand Guide Typing Reflex & Latency Training Studio

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Web-success.svg)](#)
[![Version](https://img.shields.io/badge/Release-v1.1.0-informational.svg)](https://github.com/ManofKimchi08/keyreflex-studio/releases)
[![Pure Vanilla](https://img.shields.io/badge/Tech-HTML5%20%7C%20SVG%20%7C%20Web%20Audio-orange.svg)](#)

<img src="docs/images/keyreflex_main.png" alt="KeyReflex Studio 메인 화면" width="950" />

</div>

---

## 🌟 주요 특징 (Key Features)

### 1. 🖐️ 표준 인체공학 2D 벡터 반투명 손 가이드 (Ergonomic Hand Silhouette)
- **자연스러운 3D 굴곡과 마디 관절**: 기계적인 직선 갈퀴형 손가락이 아닌, 실제 키보드 타건 자세(Curled Finger Stance)를 완벽히 반영한 베지에 곡선 조형.
- **실시간 역운동학(IK) 뻗음 애니메이션**: 목표 키가 지정되면 해당 손가락이 부드럽게 키 위로 뻗어나가는 동적 운지 안내.
- **반투명 미니멀 HUD 오버레이**: 키보드 자모 라벨(`ㅁㄴㅇㄹ / ㅓㅏㅣ;`)과 투명도 조절 슬라이더(0~100%) 지원.
- **운지법 가이드 및 컬러 구역**: 10개 손가락별 표준 담당 키를 색상 및 키 라벨 힌트로 직관적 제시.

<div align="center">
<img src="docs/images/hand_guide_comparison.png" alt="손 가이드 개선 비교" width="900" />
</div>

---

### 2. ⚡ 사람 순발력 & 키보드 하드웨어 반응속도 정밀 측정
- **사람 순발력 반응속도 (Reaction Time)**: 신호 점등 순간부터 첫 타건까지의 반응 시간(ms)을 5회 측정하여 평균/최고 기록 산출.
- **키보드 하드웨어/스위치 반응속도 (HW Latency)**: 브라우저 입력 파이프라인 지연 및 스위치 물리 접점 지연, 키 홀드 체공 시간(Dwell Time) 실시간 정밀 트래킹.
- **10개 손가락별 반응속도 & 정확도 분석**: 좌/우 소지, 약지, 중지, 검지, 엄지별 평균 반응속도(ms) 및 정확도 리포트 실시간 제공.
- **키보드 반응속도 히트맵 (Heatmap)**: 키별 속도 분포를 시각화하여 취약 키(Slow Keys) 즉시 파악.

---

### 3. 💻 KeyReflex CodeLab: 3대 언어(JavaScript, Python, C) 실시간 실행형 타자 & 알고리즘 마스터리
단순한 텍스트 입력을 넘어 **실제 동작하는 프로그래밍 언어의 구문 감각, 100대 실전 알고리즘 템플릿, 그리고 브라우저 내 즉시 실행 및 테스트 케이스 자동 채점**을 하나로 통합한 인터랙티브 코드 훈련 환경입니다.

<div align="center">
<img src="docs/images/codelab_main.png" alt="KeyReflex CodeLab 실행 화면" width="950" />
</div>

- **Tri-Engine 인브라우저 샌드박스 (Zero Configuration)**:
  - **🟡 JavaScript (ES6+)**: Function 클로저 샌드박스 및 콘솔 가로채기로 즉시 채점
  - **🐍 Python 3**: Pyodide WebAssembly(WASM) 기반 완전한 인브라우저 파이썬 인터프리터 구동
  - **🔷 C 언어**: 브라우저 내장 경량 C99 가상머신으로 포인터 연산(`*a = *b`), 배열 순회, 문자열 조작 즉시 실행
- **듀얼 타건 훈련 시스템 (Dual Practice Mode)**:
  - **🌊 전체 타건 (Flow Mode)**: 실제 IDE와 동일하게 줄바꿈(Enter) 및 들여쓰기(Tab / 4칸 공백 스킵)를 지원하며 구문 구조 전체를 손가락 근육 기억에 각인
  - **🧩 빈칸 인출 (Skeleton Mode)**: 핵심 조건문이나 알고리즘 로직을 `____` 빈칸으로 처리하여 머릿속에서 직접 논리를 인출해 타이핑
- **실시간 테스트 케이스 자동 채점 (`Ctrl + Enter`)**:
  - 작성된 코드를 즉시 실행하여 여러 개의 테스트 케이스(Input / Expected)를 대조하고 일치 여부를 실시간 검증
  - 실행 시간(ms), 타건 속도(KPM), 정확도 종합 리포트 및 상세 콘솔 로그 제공
- **4-Tier 체계적 프로그래밍 커리큘럼**:
  - **Tier 1 (문법 & 연산자)**: 화살표 함수, 구조분해할당, 컴프리헨션, 포인터 스왑
  - **Tier 2 (자료구조)**: 큐/덱(Deque), 해시맵, 동적 버퍼, 투 포인터
  - **Tier 3 (100대 실전 알고리즘)**: 이진 탐색(Binary Search), 투 썸(Two Sum), 팰린드롬, DP 피보나치
  - **Tier 4 (실무 디자인 패턴)**: 디바운스(Debounce), 쓰로틀(Throttle), 옵저버 패턴

---

### 4. 🎯 체계적인 7가지 연습 모드
1. **⚡ 순발력 측정 (5회)**: 무작위 점등 키를 가장 빠른 반응속도로 타건하는 정밀 리플렉스 테스트.
2. **🔥 30초 연속 리플렉스**: 30초 동안 콤보를 유지하며 최고 반응속도와 정타율을 측정하는 챌린지.
3. **🔧 키보드 HW 반응 측정**: 스위치 작동점 및 소프트웨어 인풋 랙을 심층 분석하는 하드웨어 벤치마크.
4. **🎯 자리 연습**: 홈 로우(기본자리), 윗자리(상단열), 아랫자리(하단열), 소지·약지 집중 훈련 선택 연습.
5. **📝 낱말 연습**: 개발자 필수 영단어, 일상 빈출 영단어 등 테마별 단어 타자 연습.
6. **📜 짧은 글 연습**: 소나기, 메밀꽃 필 무렵, 윤동주 시 등 한국 대표 문학 명작 타이핑.
7. **💻 코드 연습 (CodeLab)**: JavaScript, Python, C 3대 언어 알고리즘 템플릿 실시간 타자 및 자동 채점.
5. **📖 낱말 연습**: 엄선된 실전 한글/영문 단어 타이핑.
6. **📜 짧은 글 연습**: 명언 및 실전 문장 연속 입력 훈련.
7. **💻 코드 연습 (Programming Code)**: JavaScript, Python, C++, HTML 등 실제 프로그래밍 특수문자 및 예약어 타건 연습.

---

### 4. 🔊 실감나는 기계식 / 무접점 타건음 피드백
- **Web Audio API 합성 사운드 엔진**: 외부 음원 파일 의존 없이 웹 브라우저 네이티브 사운드로 즉각 반응.
- **다양한 사운드 프리셋**:
  - 묵직한 도각도각 (무접점)
  - 경쾌한 찰칵 (청축)
  - 쫀득한 갈축 (택타일)
  - 부드러운 리니어 (적축)
  - 무음 모드

---

### 5. 💻 원클릭 무설치 독립 데스크톱 앱 (`KeyReflex-Studio.exe`)
- **단일 실행 파일 (Single Executable)**: 별도 설치나 Python, Node.js 환경 없이 더블 클릭 한 번으로 실행.
- **네이티브 데스크톱 앱 창 모드**: 브라우저 주소창이나 탭 없이 깔끔한 전용 윈도우 창으로 실행.
- **오프라인 100% 작동**: 네트워크 연결 없이 완전히 로컬에서 즉시 실행 가능.

---

## 🚀 빠른 시작 (Quick Start)

### 방법 1. 원클릭 실행 파일 (권장)
1. [GitHub Releases](https://github.com/ManofKimchi08/keyreflex-studio/releases)에서 `KeyReflex-Studio.exe`를 다운로드합니다.
2. 다운로드한 `KeyReflex-Studio.exe`를 더블 클릭하여 즉시 실행합니다.

### 방법 2. 웹 브라우저에서 바로 실행
1. 저장소를 클론하거나 ZIP으로 다운로드합니다:
   ```bash
   git clone https://github.com/ManofKimchi08/keyreflex-studio.git
   ```
2. `index.html` 파일을 더블 클릭하여 아무 최신 브라우저(Edge, Chrome, Whale, Safari 등)에서 엽니다.

---

## 📂 프로젝트 구조 (Architecture)

```text
keyreflex-studio/
├── docs/
│   └── images/              # README 및 문서용 고해상도 스크린샷
│       ├── keyreflex_main.png
│       ├── hand_guide_comparison.png
│       ├── codelab_main.png
│       ├── codelab_python.png
│       └── codelab_c.png
├── js/
│   ├── app.js               # 핵심 훈련 모드 상태 머신 & 통계 분석 엔진
│   ├── data.js              # ANSI 쿼티 & 두벌식 키보드 레이아웃, 한글 자모 데이터셋
│   ├── handRenderer.js      # 2D 캐노니컬 벡터 손 실루엣 & IK 타건 애니메이션 렌더러
│   ├── sound.js             # Web Audio API 기반 기계식/무접점 타건 합성음 엔진
│   ├── codeCurriculum.js    # 3대 언어(JS, Python, C) 4-Tier 알고리즘 템플릿 & 테스트 케이스
│   └── codeRunner.js        # 인브라우저 삼중 언어(JS 클로저, Pyodide WASM, C99) 실행 샌드박스
├── index.html               # 메인 인터페이스 (반응형 다크 모드 UI)
├── styles.css               # 현대적 모던 글래스모피즘 스타일시트
├── KeyReflex-Studio.exe     # 원클릭 무설치 단일 독립 데스크톱 실행 파일
├── LICENSE                  # MIT 라이선스
└── README.md                # 종합 프로젝트 문서
```스 런처 소스 코드
├── KeyReflex-Studio.exe     # 원클릭 독립 실행 파일 (153 KB)
└── README.md                # 종합 프로젝트 매뉴얼
```

---

## 🛠️ 기술 스택 (Tech Stack)

- **UI & Visualization**: Pure HTML5, SVG (Scalable Vector Graphics), CSS3 Glassmorphism
- **Interaction & Physics**: Vanilla JavaScript (ES6+), Eased Inverse Kinematics (IK), RequestAnimationFrame (60fps)
- **Audio Engine**: HTML5 Web Audio API (Synthesized Key Sound Engine)
- **Desktop Wrapper**: C# (.NET Framework 4.5+), Native WebView2 / App-Mode Sandbox

---

## 📜 라이선스 (License)

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
