# 허스키 메이커 (허스키 키우기)

아기 허스키를 48주(12개월) 동안 키워 스탯 조합에 따라 10가지 엔딩 중 하나를 보는 브라우저 육성 시뮬레이션입니다.

> Godot 4로 새로 만드는 버전은 [`godot/`](godot/README.md)에 있습니다. 지금은 교감 샌드박스(프로토타입 1차) 단계입니다. 아래 내용은 기존 웹 프로토타입 설명입니다.

## 실행 방법

빌드 과정 없이 저장소 루트를 정적 서버로 띄운 뒤 `http://localhost:8000`에 접속합니다.

- Windows: `powershell -ExecutionPolicy Bypass -File serve.ps1`
- Python: `python3 -m http.server 8000`
- Node: `npx http-server -p 8000`

## 구조

| 경로 | 역할 |
| --- | --- |
| `index.html` | 화면(타이틀·메인·엔딩), 모달(상점·미니게임), 허스키 SVG |
| `js/data.js` | 행동 종류, 초기 상태(`createInitialState`), 대사 |
| `js/ui.js` | DOM 참조, 스탯·스케줄 UI, 알림·말풍선, 허스키 렌더링 |
| `js/events.js` | 스탯 변경, 랜덤·계절·사춘기·성장 이벤트, 엔딩 판정 |
| `js/minigame.js` | 상점 구매, 연타 미니게임 |
| `js/main.js` | 초기화, 주간 실행 루프, 행동 처리, 허스키 이동·드래그 |
| `css/styles.css` | 레이아웃과 스타일 |
| `assets/` | 배경·엔딩 이미지 |

스크립트는 모듈이 아닌 전역 스코프를 공유하므로 `index.html`의 로드 순서(`data → ui → events → minigame → main`)를 유지해야 합니다.

## 설계 문서

전체 시스템 설명과 개발 로드맵: [허스키 키우기 — 설계 문서](https://claude.ai/code/artifact/e452af6f-34b3-469c-a0a0-535b97f7f4f8)
