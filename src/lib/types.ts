// ==============================================================================
// 🏛️ CROWN GRID TypeScript Interfaces
// DB 6대 테이블 스키마 및 프론트엔드/동기화 완벽 호환 인터페이스
// ==============================================================================

export interface Universe {
  id: string;
  slug: string;
  title_kr: string;
  title?: string;
  title_en?: string;
  description_kr?: string;
  description?: string;
  genre?: string;
  master_bible_md?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Series {
  id: string;
  universe_id: string;
  series_number?: number;
  sequence?: number;
  code_prefix?: string;
  title_kr: string;
  title?: string;
  title_en?: string;
  slug?: string;
  genre?: string;
  synopsis?: string;
  cover_image_url?: string;
  visual_style_prompt?: string;
  free_episode_limit?: number;
  total_episodes?: number;
  status?: 'ongoing' | 'completed' | 'hiatus';
  created_at: string;
  updated_at?: string;
  episode_count?: number;
}

export interface Character {
  id: string;
  universe_id: string;
  primary_series_id?: string;
  name_kr: string;
  name?: string;
  name_en?: string;
  age?: number;
  role?: string;
  role_affiliation?: string;
  height_cm?: number;
  weight_kg?: number;
  orientation_role?: string;
  appearance?: string;
  personality?: string;
  anatomy_specs?: {
    height?: number;
    weight?: number;
    rank_tier?: string;
    secret_stigma?: string;
    anatomy_length?: string;
    restraint_item?: string;
    scent?: string;
  };
  anatomy_erect_length_cm?: number;
  anatomy_girth_cm?: number;
  anatomy_shape_notes?: string;
  appearance_prompt?: string;
  created_at: string;
  updated_at?: string;
}

export interface Episode {
  id: string;
  series_id: string;
  episode_number: number;
  is_special?: boolean;
  title_kr?: string;
  title?: string;
  title_en?: string;
  header_rule_quote_kr?: string;
  content_kr?: string;
  content: string;
  content_en?: string;
  footer_biometric_report?: Record<string, any>;
  ai_summary_board?: {
    three_line_summary?: string[];
    timeline_location_hops?: { time?: string; location: string; event: string }[];
    core_events?: string[];
    canon_validation?: {
      status?: 'pass' | 'warning' | 'error';
      issues?: { type: string; message: string; severity: 'low' | 'high' }[];
    };
  };
  ai_image_prompts?: any[];
  character_talk_persona?: any;
  source_file_path?: string;
  is_free: boolean;
  view_count?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CharacterRelationship {
  id: string;
  universe_id: string;
  series_id?: string;
  up_to_episode_number?: number;
  source_char_id?: string;
  source_character_id?: string;
  target_char_id?: string;
  target_character_id?: string;
  relationship_type?: string;
  relation_label_kr?: string;
  label?: string;
  relation_label_en?: string;
  intensity?: number;
  is_bidirectional?: boolean;
  dynamic_state_notes?: Record<string, any>;
}

export interface SubscriberEntitlement {
  id: string;
  subscribestar_user_id: string;
  watermark_hash: string;
  tier_level: string;
  is_active: boolean;
  expires_at: string;
  has_past_purchase: boolean;
  last_access_ip_hash?: string;
  updated_at: string;
}

export interface ForensicDecodeResult {
  watermark_hash: string;
  subscriber_id?: string;
  timestamp?: string;
  is_valid: boolean;
  extracted_bits: string;
  original_text_cleaned: string;
}
