# 👑 CROWN GRID (크라운 그리드)

> **성황 유니버스 다중 관리(CMS), AI 창작자 스튜디오 및 포렌식 보안 열람 플랫폼**  
> *Dark Aristocracy & Military Psychological Noir Universe Architect & Reader System*

---

## 🏛️ 주요 아키텍처 및 기능

### 1. 창작자 스튜디오 (`/admin`)
- **Obsidian Black & Champagne Gold** 다크 모드 테마
- **로컬 Assets 원클릭 동기화 엔진**: 로컬 원고 파일(`../assets/`)을 **Read-Only(참조 전용)**로 읽어 총 146개 회차를 무손실 인덱싱
- **인물 정밀 명세서 (`/admin/characters`)**: 키, 몸무게, 성향, VIP 서열, 비공개 아나토미 치수/형상, 비밀 성흔(Stigma) 및 고유 체취 실시간 관리
- **인물 입체 관계도 맵 (`/admin/relationships`)**: `@xyflow/react` 기반 대화형 노드 그래프 & **회차 슬라이더(스포일러 방지 락)** 연동
- **Gemini 1.5 BLOCK_NONE 5대 스튜디오 워크스페이스 (`/admin/studio`)**:
  - 뱅글 소거식 슬릿 5줄 ➔ 1줄 요약 보드 & Canon 금지어('Class') 충돌 검사
  - 35mm 영화풍 스틸컷 검열 우회형 영문 프롬프트 5선 & 표지 오토 크롭 도구
  - 포스타입(1~4화 무료 + 4화 하단 배너) & SubscribeStar.adult 원클릭 배포기
  - 회차별 캐릭터톡 5대 스탯(지배/복종/집착/수치/이성) & 암호 키워드

### 2. 포렌식 보안 뷰어 (`/read/[seriesId]/[episodeNumber]`)
- **1~4화 무료 열람**, 5화 진입 시 VIP 클럽 멤버십 페이월 모달 가동
- **0.01초 즉각 블러 안티-스크린샷**: 브라우저 포커스 이탈(`blur`) 즉시 `blur(28px)` 전체 화면 은폐
- 마우스 우클릭, 드래그/복사(`copy`), PrintScreen, Ctrl+P, F12 전면 차단
- **제로 너비 스테가노그래피 워터마크**: 4종의 비가시 제로 너비 문자(`\u200B`, `\u200C`, `\u200D`, `\uFEFF`)로 독자 식별자(User ID, Session Hash, Timestamp) 은밀 분산 삽입
- **유출 역추적 디코더 (`/admin/forensic`)**: 불법 복제된 한 줄 텍스트로부터 유출자 계정 100% 역추적

---

## 🛠️ 기술 스택
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS (Obsidian Black `#0A0A0C` & Champagne Gold `#D4AF37`)
- **Graph & Visualization**: `@xyflow/react` (React Flow)
- **AI Engine**: `@google/generative-ai` (Gemini 1.5 Pro / Flash, `HarmBlockThreshold.BLOCK_NONE`)
- **Database**: Supabase PostgreSQL (6대 핵심 테이블 + RLS 정책) & Local Data Fallback Engine
- **Icons**: `lucide-react`

---

## 🔒 보안 및 기밀 유지 서약
본 웹앱은 작가의 창작 자산(`../assets/`)을 훼손하지 않으며, 소설 원고 본문 및 개인 환경변수는 Git 추적에서 영구 배제되어 있습니다.
