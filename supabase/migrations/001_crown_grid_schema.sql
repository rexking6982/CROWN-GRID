-- ==============================================================================
-- 🏛️ CROWN GRID (크라운 그리드) Supabase PostgreSQL Schema v1.0
-- Multi-Universe Management (CMS) & Forensic Watermark Secure Viewer
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Universes Table (유니버스 최상위 세계관)
CREATE TABLE IF NOT EXISTS universes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- e.g. 'seonghwang'
  title_kr TEXT NOT NULL,
  title_en TEXT,
  description_kr TEXT,
  description_en TEXT,
  master_bible_md TEXT, -- 최상위 설정집 마크다운 원문 (Canon Check 기준)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Series Table (개별 시리즈 / 작품)
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  series_number INT NOT NULL, -- e.g. 1, 2, 3, 4, 5
  code_prefix TEXT, -- e.g. 'STAGE-01', 'SPECIAL-CHECK-01'
  title_kr TEXT NOT NULL,
  title_en TEXT,
  cover_image_url TEXT,
  visual_style_prompt TEXT, -- 시리즈 고정 화풍 프롬프트
  free_episode_limit INT DEFAULT 4,
  status TEXT DEFAULT 'ongoing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Characters Table (인물 정적 스펙 및 비공개 아나토미)
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  primary_series_id UUID REFERENCES series(id) ON DELETE SET NULL,
  name_kr TEXT NOT NULL,
  name_en TEXT,
  age INT,
  role_affiliation TEXT,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  orientation_role TEXT, -- e.g. 'Absolute Top-Dom', 'Chastity Sub'
  -- 비공개 아나토미 스펙 (관리자 및 AI 연산 전용)
  anatomy_erect_length_cm NUMERIC(4,1),
  anatomy_girth_cm NUMERIC(4,1),
  anatomy_shape_notes TEXT, -- 귀두 턱, 만곡도, 핏줄, 정조대 규격, 치골 성흔 등
  appearance_prompt TEXT, -- AI 이미지 생성용 외형 고정 영문 태그
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Episodes Table (회차별 원고 및 파생 메타데이터)
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  episode_number INT NOT NULL,
  is_special BOOLEAN DEFAULT FALSE,
  title_kr TEXT NOT NULL,
  title_en TEXT,
  header_rule_quote_kr TEXT, -- 상단 비공개 직무 규정 / 인용문
  content_kr TEXT NOT NULL,
  content_en TEXT, -- AI 자동 번역 영문 본문
  footer_biometric_report JSONB, -- 하단 마스터 루틴 일일 생체 정산 리포트 데이터
  ai_summary_board JSONB, -- 3줄 요약, 시간/장소 이동, 핵심 이벤트 로그
  ai_image_prompts JSONB, -- 구간별 자동 추출 35mm 스틸컷 프롬프트 5선
  character_talk_persona JSONB, -- 해당 화 기준 캐릭터톡 5대 스탯 및 암호 키워드
  source_file_path TEXT, -- 로컬 ../assets 동기화 추적용 경로
  is_free BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_series_episode UNIQUE(series_id, episode_number, is_special)
);

-- 5. Character Relationships Table (회차별 인물 동적 상태 & 관계도 노드/엣지)
CREATE TABLE IF NOT EXISTS character_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  up_to_episode_number INT NOT NULL,
  source_char_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  target_char_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  relation_label_kr TEXT NOT NULL,
  relation_label_en TEXT,
  dynamic_state_notes JSONB -- 현재 등급, 슬릿 수, 착용 웨어러블, 몸값 변동
);

-- 6. Subscriber Entitlements Table (독자 권한 및 비가시성 포렌식 추적)
CREATE TABLE IF NOT EXISTS subscriber_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscribestar_user_id TEXT UNIQUE NOT NULL,
  watermark_hash TEXT UNIQUE NOT NULL, -- 본문 스테가노그래피 삽입용 16자리 고유 해시
  tier_level TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  has_past_purchase BOOLEAN DEFAULT TRUE,
  last_access_ip_hash TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_series_universe ON series(universe_id);
CREATE INDEX IF NOT EXISTS idx_characters_universe ON characters(universe_id);
CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_char_rel_timeline ON character_relationships(series_id, up_to_episode_number);
CREATE INDEX IF NOT EXISTS idx_sub_watermark ON subscriber_entitlements(watermark_hash);

-- RLS (Row Level Security) Configuration
ALTER TABLE universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_entitlements ENABLE ROW LEVEL SECURITY;

-- Default public read policies for free content
CREATE POLICY "Public read universes" ON universes FOR SELECT USING (true);
CREATE POLICY "Public read series" ON series FOR SELECT USING (true);
CREATE POLICY "Public read free episodes" ON episodes FOR SELECT USING (is_free = true);
