import fs from 'fs';
import path from 'path';
import { getSupabase } from './supabaseClient';
import { Universe, Series, Character, Episode, CharacterRelationship } from './types';

// 로컬 assets 폴더 경로 (웹앱 상위 디렉토리의 assets)
const ASSETS_ROOT = path.resolve(process.cwd(), '..', 'assets');
const LOCAL_DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, 'universe_data.json');

export interface SyncResult {
  success: boolean;
  timestamp: string;
  universesCount: number;
  seriesCount: number;
  charactersCount: number;
  episodesCount: number;
  relationshipsCount: number;
  logs: string[];
  data?: {
    universes: Universe[];
    series: Series[];
    characters: Character[];
    episodes: Episode[];
    relationships: CharacterRelationship[];
  };
}

/**
 * 로컬 assets 디렉토리를 스캔하여 마스터 설정 및 회차 원고들을 파싱하고
 * DB(또는 로컬 스토리지 캐시)에 Upsert합니다.
 */
export async function syncAssetsFromLocal(): Promise<SyncResult> {
  const logs: string[] = [];
  logs.push(`[SYNC] 로컬 Assets 스캔 시작: ${ASSETS_ROOT}`);

  if (!fs.existsSync(ASSETS_ROOT)) {
    logs.push(`[ERROR] Assets 폴더를 찾을 수 없습니다: ${ASSETS_ROOT}`);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      universesCount: 0,
      seriesCount: 0,
      charactersCount: 0,
      episodesCount: 0,
      relationshipsCount: 0,
      logs,
    };
  }

  // 1. 유니버스 기본 생성 (성황 유니버스)
  const defaultUniverseId = 'u-seonghwang-01';
  const universe: Universe = {
    id: defaultUniverseId,
    title: '성황 유니버스 (Seonghwang Universe)',
    title_kr: '성황 유니버스 (Seonghwang Universe)',
    slug: 'seonghwang',
    description: '극단적 권력과 규율, 침묵 속에 봉인된 특권층 VIP 클럽과 군부·의료·연예계를 관통하는 다크 에로티시즘 유니버스',
    description_kr: '극단적 권력과 규율, 침묵 속에 봉인된 특권층 VIP 클럽과 군부·의료·연예계를 관통하는 다크 에로티시즘 유니버스',
    genre: 'Dark Aristocracy & Military Psychological Noir',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 2. 시리즈 매핑 정의
  const seriesDefinitions: Array<{
    folderName: string;
    id: string;
    title: string;
    slug: string;
    genre: string;
    synopsis: string;
    sequence: number;
  }> = [
    {
      folderName: '1_심야_특별신체검열',
      id: 's-midnight-01',
      title: '심야 특별신체검열 (Midnight Body Audit)',
      slug: 'midnight-audit',
      genre: 'Military Inspection / Absolute Subjection',
      synopsis: '극비 통제탑과 폐쇄된 감찰 밀실에서 펼쳐지는 상관과 부하 간의 금기된 신체 검열과 복종 의식.',
      sequence: 1,
    },
    {
      folderName: '2_성황_186cm 킹카 후배의 목줄',
      id: 's-collar-02',
      title: '186cm 킹카 후배의 목줄 (The Senior\'s Leash)',
      slug: 'seniors-leash',
      genre: 'Campus Dominance / Collared Alpha',
      synopsis: '모두의 선망을 받는 186cm 완벽한 후배 서하준의 은밀한 약점과 지배자의 목줄.',
      sequence: 2,
    },
    {
      folderName: '3_검진_Case01',
      id: 's-medical-03',
      title: '특수 의료 검진: Case 01 (Special Medical Audit)',
      slug: 'medical-audit-case01',
      genre: 'Medical Restraint / Psychological Conditioning',
      synopsis: '성황 재단 VIP 검진 센터의 방음 차음실에서 벌어지는 정밀 검사와 감각 차단 훈육.',
      sequence: 3,
    },
    {
      folderName: '4_심야2_파견지 특별훈육수칙',
      id: 's-outpost-04',
      title: '심야2: 파견지 특별훈육수칙 (Outpost Discipline)',
      slug: 'outpost-discipline',
      genre: 'Isolated Facility / Conditioning Protocols',
      synopsis: '외부와 격리된 설산 기지에서 집행되는 상관의 가혹하고 은밀한 단독 조련 수칙.',
      sequence: 4,
    },
    {
      folderName: '5_무대_성인용 아이돌 육성기',
      id: 's-idol-05',
      title: '성인용 아이돌 육성기 (Backstage Conditioning)',
      slug: 'adult-idol',
      genre: 'Showbiz Darkness / Backstage Leash',
      synopsis: '화려한 무대 뒤편 성황 VIP 스폰서 룸에서 목줄을 찬 톱아이돌들의 비밀 사육기.',
      sequence: 5,
    },
  ];

  const seriesList: Series[] = seriesDefinitions.map(def => ({
    id: def.id,
    universe_id: defaultUniverseId,
    title: def.title,
    title_kr: def.title,
    slug: def.slug,
    genre: def.genre,
    synopsis: def.synopsis,
    cover_image_url: `/covers/${def.slug}.webp`,
    total_episodes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // 3. 인물(Characters) 기본 및 마스터 설정 추출
  const charactersList: Character[] = [
    {
      id: 'c-gang-taegun',
      universe_id: defaultUniverseId,
      name: '강태건',
      name_kr: '강태건',
      role: '총괄 감찰관 / 지배자',
      appearance: '189cm, 86kg. 흑발 슬릭백, 군청색 특무 제복, 서늘한 눈빛과 각진 턱선.',
      anatomy_specs: {
        height: 189,
        weight: 86,
        rank_tier: 'VIP Sovereign / 특무감찰관',
        secret_stigma: '우측 쇄골 하단 성황 문양 낙인 (S-Tier)',
        anatomy_length: '21cm / 두껍고 단단하게 솟구친 형태',
        restraint_item: '만년필 및 특수 카본 가죽 장갑',
        scent: '시더우드, 차가운 쇠 냄새, 고급 위스키',
      },
      personality: '냉혹하고 오차를 허용하지 않는 절대 규율주의자. 상대의 이성을 서서히 붕괴시키는 심리적 압박에 능함.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-seo-hajin',
      universe_id: defaultUniverseId,
      name: '서하진',
      name_kr: '서하진',
      role: '특무대 조련병 / 피지배자',
      appearance: '182cm, 74kg. 단정한 군인 체격, 흰 피부에 땀방울이 잘 맺히는 목덜미, 짙은 속눈썹.',
      anatomy_specs: {
        height: 182,
        weight: 74,
        rank_tier: 'Assigned Subordinate',
        secret_stigma: '골반 안쪽의 붉은 점과 미세한 구속구 마찰흔',
        anatomy_length: '17.5cm / 예민하고 떨림이 잦은 형태',
        restraint_item: '전술 안대, 무음 가죽 목줄',
        scent: '비누 향, 긴장된 체온',
      },
      personality: '겉으로는 단정하고 깍듯한 군인이나, 통제된 상황에서 거부할 수 없는 복종 쾌락에 전율함.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-bae-jinhyeok',
      universe_id: defaultUniverseId,
      name: '배진혁',
      name_kr: '배진혁',
      role: '성황 VIP 클럽 상임 이사 / 총괄 설계자',
      appearance: '실제 48세(외형은 30대 중반 유지), 184cm, 79kg. 맞춤 캐시미어 수트, 포마드 헤어, 서늘한 미소.',
      anatomy_specs: {
        height: 184,
        weight: 79,
        rank_tier: '성황 VIP 최상위 의전관 (48세/외형 30대)',
        secret_stigma: '최고 관리 개체들의 분출물로 유지되는 무결점 피부',
        anatomy_length: '19.5cm',
        restraint_item: '금장 지팡이, 성황 각인 시가',
        scent: '오우드, 앰버, 고전적인 콜롱',
      },
      personality: '온화한 어조 뒤에 가려진 소름 끼치는 지배욕과 수집벽.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-seo-hajun',
      universe_id: defaultUniverseId,
      name: '서하준',
      name_kr: '서하준',
      role: '육군 대위 (서하진의 친형) / 엘리트 장교',
      appearance: '186cm, 82kg. 서하진과 닮았으나 더 남성적이고 골격이 굵음. 턱선의 흉터.',
      anatomy_specs: {
        height: 186,
        weight: 82,
        rank_tier: 'Elite Captain / Sub-Target',
        secret_stigma: '견갑골 사이의 십자 수술 흔적',
        anatomy_length: '19cm',
        restraint_item: '철제 뱅글, 규율 벨트',
        scent: '건조한 화약 연기, 가죽',
      },
      personality: '동생 서하진을 보호하려다 성황의 거미줄에 함께 얽혀 들어가는 강직한 장교.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // 4. 인물 관계도(Relationships) 정의
  const relationshipsList: CharacterRelationship[] = [
    {
      id: 'rel-1',
      universe_id: defaultUniverseId,
      source_char_id: 'c-gang-taegun',
      source_character_id: 'c-gang-taegun',
      target_char_id: 'c-seo-hajin',
      target_character_id: 'c-seo-hajin',
      relationship_type: 'Master-Subordinate',
      relation_label_kr: '절대적 지배 & 훈육',
      label: '절대적 지배 & 훈육',
      intensity: 95,
      is_bidirectional: false,
    },
    {
      id: 'rel-2',
      universe_id: defaultUniverseId,
      source_char_id: 'c-bae-jinhyeok',
      source_character_id: 'c-bae-jinhyeok',
      target_char_id: 'c-gang-taegun',
      target_character_id: 'c-gang-taegun',
      relationship_type: 'Patron-Enforcer',
      relation_label_kr: 'VIP 클럽 배후 스폰서 & 감찰 집행자',
      label: 'VIP 클럽 배후 스폰서 & 감찰 집행자',
      intensity: 80,
      is_bidirectional: true,
    },
    {
      id: 'rel-3',
      universe_id: defaultUniverseId,
      source_char_id: 'c-seo-hajun',
      source_character_id: 'c-seo-hajun',
      target_char_id: 'c-seo-hajin',
      target_character_id: 'c-seo-hajin',
      relationship_type: 'Brotherhood',
      relation_label_kr: '친형제 / 보호와 갈등',
      label: '친형제 / 보호와 갈등',
      intensity: 85,
      is_bidirectional: true,
    },
    {
      id: 'rel-4',
      universe_id: defaultUniverseId,
      source_char_id: 'c-gang-taegun',
      source_character_id: 'c-gang-taegun',
      target_char_id: 'c-seo-hajun',
      target_character_id: 'c-seo-hajun',
      relationship_type: 'Rivalry-Collaring',
      relation_label_kr: '경쟁과 굴복의 덫',
      label: '경쟁과 굴복의 덫',
      intensity: 88,
      is_bidirectional: false,
    },
  ];

  // 5. 회차 파일(Episodes) 스캔 및 파싱
  const episodesList: Episode[] = [];

  for (const def of seriesDefinitions) {
    const seriesDir = path.join(ASSETS_ROOT, def.folderName);
    if (!fs.existsSync(seriesDir)) {
      logs.push(`[WARN] 시리즈 폴더 없음: ${def.folderName}`);
      continue;
    }

    const files = fs.readdirSync(seriesDir);
    // .md 또는 .txt 파일 중 회차 파일 필터링
    const episodeFiles = files.filter(f => f.endsWith('.md') && !f.includes('명세서') && !f.includes('핸드북') && !f.includes('관계도'));

    let count = 0;
    for (const fileName of episodeFiles) {
      const filePath = path.join(seriesDir, fileName);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // 파일명에서 회차 번호 및 제목 추출 (예: "01_제1화_깍듯한_경례와_첫_번째_협박.md")
        let epNum = count + 1;
        let epTitle = fileName.replace(/\.md$/, '').replace(/^\d+_/, '').replace(/_/g, ' ');

        const numMatch = fileName.match(/^(\d+)_제?(\d+)화?/);
        if (numMatch && numMatch[2]) {
          epNum = parseInt(numMatch[2], 10);
        } else {
          const simpleMatch = fileName.match(/^(\d+)/);
          if (simpleMatch) {
            epNum = parseInt(simpleMatch[1], 10);
          }
        }

        // 본문 상단 타이틀이 있으면 정제
        const lines = fileContent.split('\n');
        const firstHeader = lines.find(l => l.startsWith('# '));
        if (firstHeader) {
          epTitle = firstHeader.replace('# ', '').trim();
        }

        const isFree = epNum <= 4; // 1~4화 무료, 5화부터 VIP 유료

        const episode: Episode = {
          id: `ep-${def.slug}-${epNum}`,
          series_id: def.id,
          episode_number: epNum,
          title: epTitle,
          title_kr: epTitle,
          content: fileContent,
          content_kr: fileContent,
          is_free: isFree,
          view_count: Math.floor(Math.random() * 800) + 120,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        episodesList.push(episode);
        count++;
      } catch (err: any) {
        logs.push(`[ERROR] 파일 읽기 실패 (${fileName}): ${err.message}`);
      }
    }

    // 시리즈별 총 회차 수 갱신
    const seriesObj = seriesList.find(s => s.id === def.id);
    if (seriesObj) {
      seriesObj.total_episodes = count;
    }

    logs.push(`[SERIES] ${def.title}: ${count}개 에피소드 파싱 완료`);
  }

  // 6. 로컬 캐시 JSON 파일로 저장 (오프라인/로컬 모드 완벽 지원)
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    const fullDataset = {
      universes: [universe],
      series: seriesList,
      characters: charactersList,
      episodes: episodesList,
      relationships: relationshipsList,
      lastSyncAt: new Date().toISOString(),
    };
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(fullDataset, null, 2), 'utf-8');
    logs.push(`[CACHE] 로컬 캐시 데이터 저장 완료: ${LOCAL_DATA_FILE}`);
  } catch (err: any) {
    logs.push(`[WARN] 로컬 캐시 저장 오류: ${err.message}`);
  }

  // 7. Supabase 연동 시 DB Upsert 시도
  const supabase = getSupabase();
  if (supabase) {
    try {
      logs.push(`[DB] Supabase 클라우드 동기화 시작...`);
      await supabase.from('universes').upsert([universe]);
      await supabase.from('series').upsert(seriesList);
      await supabase.from('characters').upsert(charactersList);
      
      // 회차는 대량이므로 배치 처리
      const batchSize = 25;
      for (let i = 0; i < episodesList.length; i += batchSize) {
        const batch = episodesList.slice(i, i + batchSize);
        await supabase.from('episodes').upsert(batch);
      }
      await supabase.from('character_relationships').upsert(relationshipsList);
      logs.push(`[DB] Supabase 클라우드 동기화 성공!`);
    } catch (err: any) {
      logs.push(`[DB-WARN] Supabase 업로드 실패(로컬 캐시로 동작): ${err.message}`);
    }
  } else {
    logs.push(`[DB-INFO] Supabase 미연결 상태입니다. 로컬 캐시 모드로 안전하게 작동합니다.`);
  }

  logs.push(`[DONE] 동기화 완료: 유니버스 1개, 시리즈 ${seriesList.length}개, 인물 ${charactersList.length}명, 에피소드 ${episodesList.length}화`);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    universesCount: 1,
    seriesCount: seriesList.length,
    charactersCount: charactersList.length,
    episodesCount: episodesList.length,
    relationshipsCount: relationshipsList.length,
    logs,
    data: {
      universes: [universe],
      series: seriesList,
      characters: charactersList,
      episodes: episodesList,
      relationships: relationshipsList,
    },
  };
}

/**
 * 로컬 캐시 또는 Supabase로부터 전체 유니버스 데이터셋 로드
 */
export async function getUniverseDataset() {
  if (fs.existsSync(LOCAL_DATA_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading local cache file, running sync...');
    }
  }
  // 파일이 없으면 자동 1회 동기화 실행
  const res = await syncAssetsFromLocal();
  return res.data;
}
