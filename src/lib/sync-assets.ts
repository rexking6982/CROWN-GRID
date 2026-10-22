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

  // 3. 인물(Characters) 공식 Canon 마스터 설정 추출 (전 20인)
  const charactersList: Character[] = [
    {
      id: 'c-shadow-king',
      universe_id: defaultUniverseId,
      name: '미지의 절대자 (그림자 총수)',
      name_kr: '미지의 절대자 (그림자 총수)',
      role: '성황 카르텔 최상위 배후 / 세계관 정점',
      appearance: '신원 불명, 압도적인 신체 실루엣과 차가운 카리스마.',
      anatomy_specs: {
        height: 195,
        weight: 95,
        rank_tier: '👑 The Absolute Titan (세계관 최고 정점)',
        secret_stigma: '성황 카르텔 창시 각인 (Tier 0)',
        anatomy_length: '30.0cm / 둘레 18.5cm (세계관 최고 대물)',
        restraint_item: '절대 마스터 인장',
        scent: '짙은 흑단향, 고대 사원의 침향',
      },
      personality: '국가와 자본, 군부를 보이지 않는 목줄로 쥐고 흔드는 절대 지배자.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-bae-jinhyeok',
      universe_id: defaultUniverseId,
      name: '배진혁',
      name_kr: '배진혁',
      role: '성황엔터 대표 / 불로의 제왕 / 클럽 헤드',
      appearance: '실제 48세(외형 30세 유지), 190cm, 88kg. 비스포크 블랙 수트, 포마드, 코히바 시가.',
      anatomy_specs: {
        height: 190,
        weight: 88,
        rank_tier: 'VIP Sovereign / 불로의 설계자',
        secret_stigma: '로열 넥타 신약 섭취로 재생된 무결점 피부',
        anatomy_length: '19.5cm / 둘레 15.0cm (각진 흑갈색 둔기형)',
        restraint_item: '마스터 티타늄 스마트 키, 10만 볼트 전자기 그물총',
        scent: '코히바 시가, 오우드, 묵직한 싱글몰트 위스키',
      },
      personality: '냉혹하고 오만한 카르텔의 군주. 수십 명의 알파 제물들을 완벽히 통제하는 시스템 설계자.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-gang-taegun',
      universe_id: defaultUniverseId,
      name: '강태건',
      name_kr: '강태건',
      role: '총괄 감찰관 / 군부 지배자',
      appearance: '189cm, 86kg. 흑발 슬릭백, 군청색 특무 제복, 서늘한 눈빛과 각진 턱선.',
      anatomy_specs: {
        height: 189,
        weight: 86,
        rank_tier: 'VIP Sovereign / 특무감찰관',
        secret_stigma: '우측 쇄골 하단 성황 문양 낙인 (S-Tier)',
        anatomy_length: '21.0cm / 둘레 15.5cm (단단한 투구형 강철 기둥)',
        restraint_item: '만년필 및 특수 카본 가죽 장갑',
        scent: '시더우드, 차가운 쇠 냄새, 고급 위스키',
      },
      personality: '냉혹하고 오차를 허용하지 않는 절대 규율주의자. 상대의 이성을 붕괴시키는 심리적 조련에 능함.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-kwon-jaeha',
      universe_id: defaultUniverseId,
      name: '권재하',
      name_kr: '권재하',
      role: '제1특수훈육단 차기 대장 (소령(진))',
      appearance: '26세, 188cm, 88kg. 두꺼운 승모근, 흑록색 전술 정복, 왼쪽 눈 밑의 점.',
      anatomy_specs: {
        height: 188,
        weight: 88,
        rank_tier: 'Top-Dom / 냉혹한 군사 훈육관',
        secret_stigma: '제1특수훈육단 금장 지휘관 흉장',
        anatomy_length: '22.0cm / 둘레 15.8cm (황갈색 강철 기둥 & 버섯 투구형)',
        restraint_item: '가죽 군화, 위성 텔레메트리 콘솔',
        scent: '화약 연기, 가죽 군화 기름 냄새',
      },
      personality: '군사적 위계질서와 가학적 훈육을 체현한 맹수. 상관 차선우 대위를 완벽한 군사 소유물로 길들임.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-cha-seonwoo',
      universe_id: defaultUniverseId,
      name: '차선우',
      name_kr: '차선우',
      role: '제1특수훈육단 파견대 지휘관 (대위)',
      appearance: '29세, 179cm, 69kg. 흉터 없이 새하얀 도자기 피부, 단정하고 수려한 미남.',
      anatomy_specs: {
        height: 179,
        weight: 69,
        rank_tier: 'Bottom-Sub / 종신 귀속 군사 섭',
        secret_stigma: '스마트 공막 렌즈 (각막 4K POV 삽입)',
        anatomy_length: '15.5cm / 둘레 12.8cm (선홍빛 도토리형 & 대형 고환 급소)',
        restraint_item: '텅스텐-티타늄 훈장 목줄 (PROPERTY OF K.J.H.)',
        scent: '시원한 박하 향, 긴장된 땀 냄새',
      },
      personality: '원칙주의자 장교였으나 부하 권재하의 가혹한 훈육 앞에 영구히 복종을 서약한 고결한 군사 섭.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-seo-hajin',
      universe_id: defaultUniverseId,
      name: '서하진',
      name_kr: '서하진',
      role: '특무대 조련병 ➔ 대위 ➔ 총괄비서실장',
      appearance: '24세, 182cm, 74kg. 단정한 군인 체격, 흰 피부, 짙은 속눈썹.',
      anatomy_specs: {
        height: 182,
        weight: 74,
        rank_tier: 'Switch (Dom ↔ Sub) / 양면적 멘토',
        secret_stigma: '골반 안쪽의 붉은 점과 미세한 구속구 마찰흔',
        anatomy_length: '17.0cm / 둘레 13.5cm (배꼽 방향 20도 상향 만곡형)',
        restraint_item: '전술 안대, 철제 뱅글, 무음 가죽 목줄',
        scent: '비누 향, 긴장된 체온',
      },
      personality: '겉으로는 단정하고 깍듯한 군인이나, 통제된 상황에서 거부할 수 없는 복종 쾌락에 전율하는 기교형 명기.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-song-kangwoo',
      universe_id: defaultUniverseId,
      name: '송강우',
      name_kr: '송강우',
      role: '에이펙스 센터 / 피트니스 챔피언 ➔ 로열 07번',
      appearance: '22세, 183cm, 78kg. 체지방 5% 조각상 근육, 구릿빛 탄력 피부.',
      anatomy_specs: {
        height: 183,
        weight: 78,
        rank_tier: 'Bottom-Sub / [로열 플래티넘 07번]',
        secret_stigma: '치골 안쪽 백금 뱀 성흔, 14.50 Brix 순백 체액 발향',
        anatomy_length: '16.8cm / 둘레 13.4cm (구릿빛 탄력 기둥 & 고감도 전립선)',
        restraint_item: '골드 스트라이프 《아이기스 로열 락》, 《순백금 로열 앵클릿》',
        scent: '관능적이고 짙은 백란(White Orchid) 향',
      },
      personality: '85만 인플루언서에서 배진혁의 발치에 무릎 꿇은 최상위 로열 섭. 오직 주인의 손길에만 배출을 허락받음.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-do-gunwoo',
      universe_id: defaultUniverseId,
      name: '도건우 (프로토타입 0호기)',
      name_kr: '도건우 (프로토타입 0호기)',
      role: '전 무제한급 격투기 챔피언 ➔ 카르텔 수호견',
      appearance: '31세, 191cm, 98kg. 온몸이 흉터로 뒤덮인 거구의 헤비급 괴물.',
      anatomy_specs: {
        height: 191,
        weight: 98,
        rank_tier: 'Bottom-Sub / 0호기 프로토타입 로열 섭',
        secret_stigma: '전신을 관통하는 초기 마스터 루틴 실험 흉터',
        anatomy_length: '23.5cm / 둘레 16.4cm (헤비급 구릿빛 거목)',
        restraint_item: '50mm 흑철 쇠사슬, 헤비 아이언 칼라',
        scent: '거친 맹수의 체향, 마른 쇠 냄새',
      },
      personality: '5년 전 배진혁에게 굴복하여 은퇴한 전설의 챔피언. 배진혁의 개인 스위트룸을 수호하는 가장 충직한 사냥개.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-seo-hajun',
      universe_id: defaultUniverseId,
      name: '서하준',
      name_kr: '서하준',
      role: '육군 대위 (서하진의 친형) / 엘리트 장교',
      appearance: '27세, 186cm, 82kg. 서하진보다 굵은 골격, 턱선의 흉터, 강직한 눈빛.',
      anatomy_specs: {
        height: 186,
        weight: 82,
        rank_tier: 'Elite Captain / Sub-Target',
        secret_stigma: '견갑골 사이의 십자 수술 흔적',
        anatomy_length: '19.0cm / 둘레 14.8cm (곧고 단단한 군사형 기둥)',
        restraint_item: '철제 뱅글, 규율 벨트',
        scent: '건조한 화약 연기, 가죽',
      },
      personality: '동생 서하진을 보호하려다 성황의 거미줄에 함께 얽혀 들어가는 강직한 장교.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-han-kyul',
      universe_id: defaultUniverseId,
      name: '한결',
      name_kr: '한결',
      role: '성황체대 다이빙 에이스 ➔ 데뷔조 비주얼 센터',
      appearance: '21세, 181cm, 70kg. 청초하고 가녀린 미소년 외모, 슬렌더 체형.',
      anatomy_specs: {
        height: 181,
        weight: 70,
        rank_tier: 'Chastity Sub / 초대물 봉인 섭',
        secret_stigma: '타이츠 위 윤곽 노출 공포증',
        anatomy_length: '26.0cm / 둘레 16.8cm (흉포한 핏줄의 비극적 초대물)',
        restraint_item: '7cm 티타늄 정조대 (닥터 진의 압축 봉인 처방)',
        scent: '수영장 소독약 냄새, 순수한 살냄새',
      },
      personality: '얼굴과 정반대인 26cm 초대물 콤플렉스로 7cm 정조대에 압축 봉인된 채 굴복하는 섭.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-gang-haedeun',
      universe_id: defaultUniverseId,
      name: '강해든',
      name_kr: '강해든',
      role: '국방정보본부 침투요원 ➔ 명기 생성소 마스터 코치',
      appearance: '28세, 187cm, 85kg. 정예 특임대 체격, 야생 늑대 같은 안광.',
      anatomy_specs: {
        height: 187,
        weight: 85,
        rank_tier: 'All Switch / [유니버스 공인 대물 기준선]',
        secret_stigma: '25cm급 거물을 삼켜 착정하는 이중 완전체 내벽',
        anatomy_length: '25.5cm / 둘레 16.5cm (정맥이 요동치는 황갈색 투구형)',
        restraint_item: '골반 신경 제어 벨트',
        scent: '강한 남성 호르몬 향, 젖은 흙내',
      },
      personality: '자의로 사정을 통제하며, 뒤로는 거물을 착정하는 이중 완전체 명기이자 최고의 조련 코치.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-yoon-taeo',
      universe_id: defaultUniverseId,
      name: '윤태오',
      name_kr: '윤태오',
      role: '특임대 상병 ➔ 성황그룹 본사 경호팀장',
      appearance: '26세, 189cm, 92kg. 벌크업된 헤비급 피지컬, 서글서글한 눈매 뒤의 폭력성.',
      anatomy_specs: {
        height: 189,
        weight: 92,
        rank_tier: 'Top-Dom / [유니버스 둘레 1위]',
        secret_stigma: '패닉룸 전속 지배권 인가',
        anatomy_length: '24.5cm / 둘레 17.2cm (흉포한 둔기형 강철 파이프 실린더)',
        restraint_item: '전술 진압봉, 테이저건',
        scent: '거친 땀 냄새, 블랙 머스크',
      },
      personality: '낮에는 묵묵한 경호팀장, 밤의 패닉룸에서는 도련님 서유건의 아랫배를 불룩하게 밀어 올리는 포식자.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-seo-yugeon',
      universe_id: defaultUniverseId,
      name: '서유건',
      name_kr: '서유건',
      role: '성황그룹 최연소 상무이사 / 성황성골 후계자',
      appearance: '24세, 177cm, 63kg. 병약미 넘치는 창백한 피부, 가녀린 턱선.',
      anatomy_specs: {
        height: 177,
        weight: 63,
        rank_tier: 'Bottom-Sub / 취약한 귀족 섭',
        secret_stigma: '패닉룸 영구 소유권 각인',
        anatomy_length: '13.8cm / 둘레 11.8cm (극세 백자형 & 붉은 꽃봉오리)',
        restraint_item: '실크 안대, 얇은 가죽 하네스',
        scent: '은은한 네롤리, 차가운 린넨 향',
      },
      personality: '재벌 3세로서 오만하지만, 패닉룸 안에서는 경호팀장 윤태오의 거대한 손아귀에 전율하는 귀족 섭.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-dr-jin',
      universe_id: defaultUniverseId,
      name: '닥터 진 (진도하)',
      name_kr: '닥터 진 (진도하)',
      role: 'VIP 스포츠의학 센터장 / 성황성골 주치의',
      appearance: '35세, 180cm, 76kg. 흰 가운, 무테 안경, 서늘한 엘리트 미남.',
      anatomy_specs: {
        height: 180,
        weight: 76,
        rank_tier: 'Power-Bottom Dom / 착정 지배자',
        secret_stigma: '특수 의료 검진 센터 최고 결정권',
        anatomy_length: '18.5cm / 둘레 14.5cm (새하얀 치골 위 단단한 원주형)',
        restraint_item: '의료용 라텍스 장갑, 전립선 음파 진단기',
        scent: '알코올 소독제 향, 샌달우드',
      },
      personality: '환자의 체중으로 짓누르며 내벽 수축과 마인드 통제만으로 상대를 사정시키는 냉철한 착정 지배자.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-sculptor',
      universe_id: defaultUniverseId,
      name: '조형가 (한재익)',
      name_kr: '조형가 (한재익)',
      role: '특수 구속구 금속 조형 엔지니어 / 공방 마스터',
      appearance: '38세, 185cm, 80kg. 기름때 묻은 작업복, 굳은살 박인 두꺼운 손.',
      anatomy_specs: {
        height: 185,
        weight: 80,
        rank_tier: 'Master Dom / 도구 지배 장인',
        secret_stigma: '0.01mm 오차 없는 생체 계측 기술',
        anatomy_length: '22.5cm / 둘레 16.0cm (정밀 밀링 사각 원주형 금형 둔기)',
        restraint_item: '버니어캘리퍼스, 티타늄 벤딩 머신',
        scent: '금속 쇠가루 냄새, 절삭유 향',
      },
      personality: '인간의 육체를 금속 틀에 맞춰 개조하는 차가운 조형 장인. 아이기스 로열 락과 훈장 목줄의 설계자.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-jang-taesan',
      universe_id: defaultUniverseId,
      name: '장태산',
      name_kr: '장태산',
      role: '유도 헤비급 실업팀 출신 조련생',
      appearance: '25세, 192cm, 94kg. 우람한 떡대와 구릿빛 거구.',
      anatomy_specs: {
        height: 192,
        weight: 94,
        rank_tier: 'Bottom-Sub / 초대물 헤비급 & 강제 암컷화',
        secret_stigma: '배출소 진공 흡착기 영구 조련 기록',
        anatomy_length: '23.0cm / 둘레 16.2cm (묵직한 구릿빛 대형 기둥)',
        restraint_item: '티타늄 헤비 케이지',
        scent: '매운 땀 냄새, 가죽 도복 냄새',
      },
      personality: '본래 오만한 마초 거구였으나 대물이 티타늄에 갇히고 배출소에서 무릎 꿇리며 헐떡이는 갭 모에 섭.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-cha-minseok',
      universe_id: defaultUniverseId,
      name: '차민석',
      name_kr: '차민석',
      role: '크로스핏 헤드 코치 출신 ➔ 탈락 도주 섭',
      appearance: '27세, 188cm, 86kg. 역삼각형 어깨, 탄탄한 근육질.',
      anatomy_specs: {
        height: 188,
        weight: 86,
        rank_tier: 'Bottom-Sub / 헤비급 근육 섭',
        secret_stigma: '사옥 탈출 후 강해든의 명기 생성소로 도주',
        anatomy_length: '21.0cm / 둘레 15.2cm (우람한 근육질 대물)',
        restraint_item: '10만 볼트 전자기 그물망 포획 흔적',
        scent: '초크 가루 냄새, 탄산마그네슘 향',
      },
      personality: '사옥에서 탈출을 시도하다 전자기 그물총에 제압당했던 반항적인 근육 섭.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-kwon-dojin',
      universe_id: defaultUniverseId,
      name: '권도진',
      name_kr: '권도진',
      role: '성황체대 유도 에이스 / 그라운드 그래플러',
      appearance: '22세, 187cm, 85kg. 두꺼운 목둘레, 만두 귀, 강인한 그라운드 파이터.',
      anatomy_specs: {
        height: 187,
        weight: 85,
        rank_tier: 'Top-Dom / 그라운드 그래플러',
        secret_stigma: '유도부 라커룸 지배권',
        anatomy_length: '18.5cm / 둘레 14.8cm (묵직한 압축 원주형 기둥)',
        restraint_item: '유도 검은 띠, 테이핑 테이프',
        scent: '거친 땀 냄새, 소나무 송진 향',
      },
      personality: '186cm 후배 신우겸의 다리를 그라운드 기술로 고립시킨 뒤 골반 전체를 뒤흔들어 복종시키는 포식자.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-shin-woogyeom',
      universe_id: defaultUniverseId,
      name: '신우겸',
      name_kr: '신우겸',
      role: '성황체대 농구 에이스 / 캠퍼스 킹카 후배',
      appearance: '20세, 186cm, 75kg. 훤칠한 기럭지, 서늘하고 도도한 냉미남.',
      anatomy_specs: {
        height: 186,
        weight: 75,
        rank_tier: 'Bottom-Sub / 냉미남 굴복 섭',
        secret_stigma: '발목 테이핑 안쪽의 비밀 성황 스티그마',
        anatomy_length: '17.5cm / 둘레 13.5cm (길고 단정한 직선형 기둥)',
        restraint_item: '농구화 끈 결박, 얇은 목줄',
        scent: '시트러스 향수, 코트 바닥 고무 냄새',
      },
      personality: '도도한 킹카 농구 선수이나 권도진의 관절 꺾기와 마운트 포지션 아래에서만 붉게 달아오르는 섭.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c-han-siwon',
      universe_id: defaultUniverseId,
      name: '한시원',
      name_kr: '한시원',
      role: '성황엔터 총괄제작이사 / 캐스팅 본부장',
      appearance: '34세, 187cm, 82kg. 서늘한 마스크, 안경, 단정한 정장.',
      anatomy_specs: {
        height: 187,
        weight: 82,
        rank_tier: 'Top-Dom / 결벽증 엘리트 돔',
        secret_stigma: '성황엔터 데뷔조 캐스팅 최종 결재권',
        anatomy_length: '19.0cm / 둘레 14.6cm (직선형 금형 둔기)',
        restraint_item: '아크릴 패들, 가죽 장갑',
        scent: '차가운 페이퍼 향, 만년필 잉크 냄새',
      },
      personality: '배진혁의 오른팔로서 오만한 조련생들의 정조대를 직접 체결하고 엄격한 패들링으로 굴복시키는 엘리트 돔.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // 4. 인물 관계도(Relationships) 정의 (유니버스 전체 공식 16개 핵심 관계망)
  const relationshipsList: CharacterRelationship[] = [
    {
      id: 'rel-shadow-bae',
      universe_id: defaultUniverseId,
      source_char_id: 'c-shadow-king',
      source_character_id: 'c-shadow-king',
      target_char_id: 'c-bae-jinhyeok',
      target_character_id: 'c-bae-jinhyeok',
      relationship_type: 'Ultimate-Sovereign',
      relation_label_kr: '절대 배후 총수 ➔ 카르텔 수장 임명',
      label: '절대 배후 총수 ➔ 카르텔 수장 임명',
      intensity: 100,
      is_bidirectional: false,
    },
    {
      id: 'rel-bae-gang',
      universe_id: defaultUniverseId,
      source_char_id: 'c-bae-jinhyeok',
      source_character_id: 'c-bae-jinhyeok',
      target_char_id: 'c-gang-taegun',
      target_character_id: 'c-gang-taegun',
      relationship_type: 'Patron-Enforcer',
      relation_label_kr: 'VIP 클럽 배후 스폰서 & 군부 감찰 집행자',
      label: 'VIP 클럽 배후 스폰서 & 군부 감찰 집행자',
      intensity: 88,
      is_bidirectional: true,
    },
    {
      id: 'rel-bae-song',
      universe_id: defaultUniverseId,
      source_char_id: 'c-bae-jinhyeok',
      source_character_id: 'c-bae-jinhyeok',
      target_char_id: 'c-song-kangwoo',
      target_character_id: 'c-song-kangwoo',
      relationship_type: 'Master-Pet',
      relation_label_kr: '절대 소유자 ➔ 로열 07번 독점 착정',
      label: '절대 소유자 ➔ 로열 07번 독점 착정',
      intensity: 98,
      is_bidirectional: false,
    },
    {
      id: 'rel-bae-do',
      universe_id: defaultUniverseId,
      source_char_id: 'c-bae-jinhyeok',
      source_character_id: 'c-bae-jinhyeok',
      target_char_id: 'c-do-gunwoo',
      target_character_id: 'c-do-gunwoo',
      relationship_type: 'Master-Hound',
      relation_label_kr: '초대 굴복자 ➔ 쇠사슬 수호견',
      label: '초대 굴복자 ➔ 쇠사슬 수호견',
      intensity: 95,
      is_bidirectional: false,
    },
    {
      id: 'rel-kwon-cha',
      universe_id: defaultUniverseId,
      source_char_id: 'c-kwon-jaeha',
      source_character_id: 'c-kwon-jaeha',
      target_char_id: 'c-cha-seonwoo',
      target_character_id: 'c-cha-seonwoo',
      relationship_type: 'Master-Subordinate',
      relation_label_kr: '훈육관 ➔ 훈장 목줄 종신 섭 (4K POV)',
      label: '훈육관 ➔ 훈장 목줄 종신 섭 (4K POV)',
      intensity: 99,
      is_bidirectional: false,
    },
    {
      id: 'rel-kwon-bae',
      universe_id: defaultUniverseId,
      source_char_id: 'c-kwon-jaeha',
      source_character_id: 'c-kwon-jaeha',
      target_char_id: 'c-bae-jinhyeok',
      target_character_id: 'c-bae-jinhyeok',
      relationship_type: 'Alliance',
      relation_label_kr: '군·산 복합 카르텔 동맹 (마스터 루틴 동기화)',
      label: '군·산 복합 카르텔 동맹 (마스터 루틴 동기화)',
      intensity: 92,
      is_bidirectional: true,
    },
    {
      id: 'rel-gang-seo',
      universe_id: defaultUniverseId,
      source_char_id: 'c-gang-taegun',
      source_character_id: 'c-gang-taegun',
      target_char_id: 'c-seo-hajin',
      target_character_id: 'c-seo-hajin',
      relationship_type: 'Master-Subordinate',
      relation_label_kr: '절대적 신체검열 & 복종 훈육',
      label: '절대적 신체검열 & 복종 훈육',
      intensity: 96,
      is_bidirectional: false,
    },
    {
      id: 'rel-hajun-hajin',
      universe_id: defaultUniverseId,
      source_char_id: 'c-seo-hajun',
      source_character_id: 'c-seo-hajun',
      target_char_id: 'c-seo-hajin',
      target_character_id: 'c-seo-hajin',
      relationship_type: 'Brotherhood',
      relation_label_kr: '친형제 / 보호와 갈등의 덫',
      label: '친형제 / 보호와 갈등의 덫',
      intensity: 85,
      is_bidirectional: true,
    },
    {
      id: 'rel-drjin-hankyul',
      universe_id: defaultUniverseId,
      source_char_id: 'c-dr-jin',
      source_character_id: 'c-dr-jin',
      target_char_id: 'c-han-kyul',
      target_character_id: 'c-han-kyul',
      relationship_type: 'Doctor-Patient',
      relation_label_kr: '7cm 티타늄 정조대 압축 봉인 주치의',
      label: '7cm 티타늄 정조대 압축 봉인 주치의',
      intensity: 94,
      is_bidirectional: false,
    },
    {
      id: 'rel-taeo-yugeon',
      universe_id: defaultUniverseId,
      source_char_id: 'c-yoon-taeo',
      source_character_id: 'c-yoon-taeo',
      target_char_id: 'c-seo-yugeon',
      target_character_id: 'c-seo-yugeon',
      relationship_type: 'Bodyguard-Master',
      relation_label_kr: '낮의 경호팀장 ➔ 밤의 패닉룸 포식자',
      label: '낮의 경호팀장 ➔ 밤의 패닉룸 포식자',
      intensity: 97,
      is_bidirectional: false,
    },
    {
      id: 'rel-haedeun-chamin',
      universe_id: defaultUniverseId,
      source_char_id: 'c-gang-haedeun',
      source_character_id: 'c-gang-haedeun',
      target_char_id: 'c-cha-minseok',
      target_character_id: 'c-cha-minseok',
      relationship_type: 'Coach-Trainee',
      relation_label_kr: '도주자 포획 ➔ 명기 생성소 훈육',
      label: '도주자 포획 ➔ 명기 생성소 훈육',
      intensity: 89,
      is_bidirectional: false,
    },
    {
      id: 'rel-sculptor-bae',
      universe_id: defaultUniverseId,
      source_char_id: 'c-sculptor',
      source_character_id: 'c-sculptor',
      target_char_id: 'c-bae-jinhyeok',
      target_character_id: 'c-bae-jinhyeok',
      relationship_type: 'Supplier-Patron',
      relation_label_kr: '특수 구속구 전속 금속 장인',
      label: '특수 구속구 전속 금속 장인',
      intensity: 86,
      is_bidirectional: true,
    },
    {
      id: 'rel-dojin-woogyeom',
      universe_id: defaultUniverseId,
      source_char_id: 'c-kwon-dojin',
      source_character_id: 'c-kwon-dojin',
      target_char_id: 'c-shin-woogyeom',
      target_character_id: 'c-shin-woogyeom',
      relationship_type: 'Senior-Junior',
      relation_label_kr: '그라운드 그래플링 ➔ 킹카 후배 목줄',
      label: '그라운드 그래플링 ➔ 킹카 후배 목줄',
      intensity: 93,
      is_bidirectional: false,
    },
    {
      id: 'rel-siwon-song',
      universe_id: defaultUniverseId,
      source_char_id: 'c-han-siwon',
      source_character_id: 'c-han-siwon',
      target_char_id: 'c-song-kangwoo',
      target_character_id: 'c-song-kangwoo',
      relationship_type: 'Producer-Trainee',
      relation_label_kr: '데뷔조 선발 패들링 훈육',
      label: '데뷔조 선발 패들링 훈육',
      intensity: 87,
      is_bidirectional: false,
    },
    {
      id: 'rel-hajin-song',
      universe_id: defaultUniverseId,
      source_char_id: 'c-seo-hajin',
      source_character_id: 'c-seo-hajin',
      target_char_id: 'c-song-kangwoo',
      target_character_id: 'c-song-kangwoo',
      relationship_type: 'Peer-Subjects',
      relation_label_kr: '바이오 랩 체액 블렌딩 융합 & 서열 사열',
      label: '바이오 랩 체액 블렌딩 융합 & 서열 사열',
      intensity: 91,
      is_bidirectional: true,
    },
    {
      id: 'rel-gang-hajun',
      universe_id: defaultUniverseId,
      source_char_id: 'c-gang-taegun',
      source_character_id: 'c-gang-taegun',
      target_char_id: 'c-seo-hajun',
      target_character_id: 'c-seo-hajun',
      relationship_type: 'Enforcer-Target',
      relation_label_kr: '동생의 목줄을 미끼로 한 포획',
      label: '동생의 목줄을 미끼로 한 포획',
      intensity: 90,
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
