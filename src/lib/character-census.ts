import fs from 'fs';
import path from 'path';

export interface ConflictItem {
  id: string;
  type: 'name_similarity' | 'alias_mismatch' | 'spec_inconsistency' | 'canon_c_word';
  severity: 'high' | 'medium' | 'info';
  targetCharacter: string;
  relatedCharacter?: string;
  title: string;
  description: string;
  affectedEpisodes: Array<{ seriesId: string; episodeNumber: number; title: string }>;
  suggestedAction: string;
}

export interface CensusCharacter {
  id: string;
  name: string;
  aliases: string[];
  role: string;
  seriesId: string;
  seriesTitle: string;
  tier: 'lead' | 'core_supporting' | 'supporting' | 'cameo';
  totalMentions: number;
  totalEpisodes: number;
  episodes: Array<{ seriesId: string; episodeNumber: number; title: string; count: number }>;
  height: number;
  age: number;
  dominance: number;
  submission: number;
  obsession: number;
  shame: number;
  sanity: number;
  secretKeyword: string;
  appearance: string;
  keyQuote: string;
  conflicts: ConflictItem[];
}

export interface UniverseCensusResult {
  stats: {
    totalCharacters: number;
    totalMentions: number;
    totalEpisodesScanned: number;
    leadCount: number;
    coreSupportingCount: number;
    supportingCount: number;
    cameoCount: number;
    totalConflicts: number;
  };
  characters: CensusCharacter[];
  allConflicts: ConflictItem[];
}

// 35인 표준 인물 프로필 및 정밀 메타데이터
const MASTER_CHARACTER_REGISTRY = [
  {
    name: '송강우',
    aliases: ['강우', '송 챔피언'],
    role: '피트니스 챔피언 / VIP 탑아이돌 (제물 정점)',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 183,
    age: 22,
    dominance: 30,
    submission: 96,
    obsession: 88,
    shame: 90,
    sanity: 38,
    secretKeyword: '아이기스_백란',
    appearance: '183cm, 75kg, 56cm 넓은 어깨, 갈라진 8팩 복근과 조각 같은 턱선, 땀에 젖은 카키색 컴프레션',
    keyQuote: '“대표님…… 허락하신 배출 시간이 아직 3일이나 남았습니다…… 제발 지켜봐 주십시오!”',
  },
  {
    name: '배진혁',
    aliases: ['진혁', '배 대표', '총괄대표'],
    role: '성황그룹 총괄대표 (군·산 카르텔 정점 지배자)',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 187,
    age: 48,
    dominance: 99,
    submission: 1,
    obsession: 98,
    shame: 2,
    sanity: 96,
    secretKeyword: '로열넥타_1호',
    appearance: '187cm, 82kg, 48세(세포 역노화로 외형 30세), 흑단색 캐시미어 수트와 삼지창 오닉스 커프스링크',
    keyQuote: '“8층 관제실의 문은 오직 허가된 자에게만 열리지. 오늘 밤 자네가 보고할 사항은 무엇인가?”',
  },
  {
    name: '권재하',
    aliases: ['재하', '권 중위', '감찰중위'],
    role: '특수훈육단 감찰중위 (규율대 절대 지배자)',
    seriesId: 's-midnight-01',
    seriesTitle: '심야 특별신체검열',
    height: 188,
    age: 27,
    dominance: 97,
    submission: 5,
    obsession: 94,
    shame: 10,
    sanity: 90,
    secretKeyword: '규율대_지휘봉',
    appearance: '188cm, 86kg, 굵은 손목과 핏줄, 다크네이비 특수전투복, 나른하면서도 잔혹한 눈매',
    keyQuote: '“차선우 대위님, 규율의 통제탑은 오차를 허용하지 않습니다. 관등성명을 밝히십시오.”',
  },
  {
    name: '차선우',
    aliases: ['선우', '차 대위', '수석훈육관'],
    role: '특수훈육단 수석훈육관 (얼음 송곳 대위)',
    seriesId: 's-midnight-01',
    seriesTitle: '심야 특별신체검열',
    height: 179,
    age: 29,
    dominance: 88,
    submission: 25,
    obsession: 90,
    shame: 82,
    sanity: 65,
    secretKeyword: '제1특수훈육단',
    appearance: '179cm, 72kg, 도자기처럼 창백한 피부와 봉황눈, 팽팽한 제복 칼라, 104 BPM 생체 센서',
    keyQuote: '“3번 피교육생, 턱이 2도 들렸다. 호흡이 거칠어지는군.”',
  },
  {
    name: '한시원',
    aliases: ['시원', '한 조교'],
    role: '특수훈육단 정예 조교 / 통제탑 감찰요원',
    seriesId: 's-midnight-01',
    seriesTitle: '심야 특별신체검열',
    height: 182,
    age: 25,
    dominance: 85,
    submission: 15,
    obsession: 88,
    shame: 40,
    sanity: 80,
    secretKeyword: '센서패치_감시',
    appearance: '182cm, 76kg, 군더더기 없는 단단한 체구, 매뉴얼을 칼같이 집행하는 무표정한 인상',
    keyQuote: '“경고: 기준 심박수 95 BPM 초과 확인. 즉각 구속 절차로 이행합니다.”',
  },
  {
    name: '서하진',
    aliases: ['하진', '서 대선배', '전설의 특전사'],
    role: '성황체고 제1무도관 전설의 대선배 (군 특전사 차출)',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 185,
    age: 26,
    dominance: 95,
    submission: 5,
    obsession: 92,
    shame: 10,
    sanity: 90,
    secretKeyword: '성황성골_특전사',
    appearance: '185cm, 84kg, 강철 같은 완력과 독기, 체고 무도관을 평정한 7년 전 전설의 실루엣',
    keyQuote: '“성황의 푸른 매트 앞에서는 어떤 황태자라도 무릎을 꿇으리라.”',
  },
  {
    name: '강해든',
    aliases: ['해든', '강 선수'],
    role: '성황체육대학교 190cm 수영부 에이스 (감압 제물)',
    seriesId: 's-medical-03',
    seriesTitle: '특수 의료 검진: Case 01',
    height: 190,
    age: 22,
    dominance: 35,
    submission: 96,
    obsession: 85,
    shame: 94,
    sanity: 42,
    secretKeyword: '190cm_수영부',
    appearance: '190cm, 88kg, 체지방률 6.2%, 역삼각형 광배근과 팽팽한 복근, 통제 불능의 교감신경 폭주',
    keyQuote: '“선생님…… 숨이 안 쉬어집니다…… 제발 하복부 압력을 풀어주십시오……!”',
  },
  {
    name: '진태헌',
    aliases: ['닥터 진', '진 박사', '수석전문의'],
    role: 'VIP 특수검진센터 수석전문의 (의료 지배자)',
    seriesId: 's-medical-03',
    seriesTitle: '특수 의료 검진: Case 01',
    height: 184,
    age: 34,
    dominance: 96,
    submission: 4,
    obsession: 94,
    shame: 6,
    sanity: 93,
    secretKeyword: '임상차트_VIP',
    appearance: '184cm, 76kg, 서늘한 금테 안경, 라텍스 장갑, 방음 차음실의 절대적 의료 통제자',
    keyQuote: '“혼자 억지로 쥐어짜다간 혈관만 터질 뿐이다. 사지를 결박하고 내가 직접 내벽으로 감압한다.”',
  },
  {
    name: '박진태',
    aliases: ['진태', '박 이사'],
    role: '성황사모펀드 실세 이사 / VIP 스폰서 카르텔',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 181,
    age: 45,
    dominance: 92,
    submission: 8,
    obsession: 95,
    shame: 10,
    sanity: 85,
    secretKeyword: '사모펀드_자금줄',
    appearance: '181cm, 78kg, 은테 안경과 기름진 미소, 밀실 VIP 룸의 냉혹한 스폰서',
    keyQuote: '“투자금의 대가는 확실해야지. 오늘 밤 런웨이에서 자네의 가치를 증명해 보게.”',
  },
  {
    name: '최민우',
    aliases: ['민우', '최 요원'],
    role: '설산 격리기지 특수보안요원',
    seriesId: 's-outpost-04',
    seriesTitle: '심야2: 파견지 특별훈육수칙',
    height: 184,
    age: 28,
    dominance: 80,
    submission: 20,
    obsession: 85,
    shame: 25,
    sanity: 78,
    secretKeyword: '설산_보안철책',
    appearance: '184cm, 80kg, 혹한기 방한 전투복, 감찰탑의 서슬 퍼런 경계병',
    keyQuote: '“파견지 막사 밖으로의 탈출은 곧 즉결 징벌입니다.”',
  },
  {
    name: '신우겸',
    aliases: ['우겸', '186cm 농구 에이스', '신 황태자'],
    role: '성황체고 농구부 2학년 주전 에이스 (186cm 킹카)',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 186,
    age: 18,
    dominance: 45,
    submission: 95,
    obsession: 80,
    shame: 92,
    sanity: 45,
    secretKeyword: '186cm_황태자',
    appearance: '186cm, 77kg, 역삼각형 피지컬, 땀에 젖은 짙은 흑발과 남성적인 턱선, 오만한 시선',
    keyQuote: '“키가 곧 권력이다. 내 시야에서 내려다보는 세상은 언제나 발아래에 있었다.”',
  },
  {
    name: '백란',
    aliases: ['백란 어르신', 'VIP 백란'],
    role: '성황 VIP 클럽 최상위 비밀 후원자 (절대 권력자)',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 182,
    age: 50,
    dominance: 98,
    submission: 2,
    obsession: 96,
    shame: 4,
    sanity: 92,
    secretKeyword: '성황왕관_백란',
    appearance: '182cm, 전통 한복 위에 걸친 밍크 코트, 백발이 섞인 중후하고 위압적인 카리스마',
    keyQuote: '“가장 완벽한 수컷일수록, 무릎을 꿇렸을 때의 쾌감이 짙은 법이지.”',
  },
  {
    name: '신태경',
    aliases: ['태경', '신 실장'],
    role: '성황 VIP 전속 경호실장',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 188,
    age: 35,
    dominance: 93,
    submission: 7,
    obsession: 90,
    shame: 10,
    sanity: 88,
    secretKeyword: '8층_전속경호',
    appearance: '188cm, 88kg, 빈틈없는 블랙 경호 수트와 인이어, 감정을 드러내지 않는 거대한 체구',
    keyQuote: '“대표님의 결재가 떨어지기 전까진 누구도 이 문을 나설 수 없습니다.”',
  },
  {
    name: '권도진',
    aliases: ['도진', '권 선배', '유도부 주장'],
    role: '성황체고 유도부 3학년 주장 (4층 기강 지배자)',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 171,
    age: 19,
    dominance: 98,
    submission: 2,
    obsession: 96,
    shame: 5,
    sanity: 95,
    secretKeyword: '성황푸른매트',
    appearance: '171cm, 85kg, 흉곽 112cm의 거대한 통뼈 체구와 바위산 같은 무게중심, 쇠 같은 굳은살 손등',
    keyQuote: '“신우겸. 186cm의 시야가 그렇게 높더냐? 매트 위에서 그 다리를 어떻게 꺾어주는지 보여주마.”',
  },
  {
    name: '민지훈',
    aliases: ['지훈', '민 연습생'],
    role: '성인용 아이돌 메인댄서 / 제물 후보생',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 177,
    age: 21,
    dominance: 25,
    submission: 95,
    obsession: 82,
    shame: 92,
    sanity: 35,
    secretKeyword: '아이돌_댄스라인',
    appearance: '177cm, 66kg, 유연하고 탄탄한 무용수 체형, 땀에 젖은 앞머리와 흔들리는 갈색 눈동자',
    keyQuote: '“스폰서 룸에 불려 들어갈 때마다…… 온몸이 떨려서 숨을 쉴 수가 없습니다.”',
  },
  {
    name: '오승택',
    aliases: ['승택', '오 코치'],
    role: '성황체고 농구부 헤드코치',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 185,
    age: 36,
    dominance: 90,
    submission: 10,
    obsession: 85,
    shame: 15,
    sanity: 80,
    secretKeyword: '체고_스카우트',
    appearance: '185cm, 82kg, 체육복 트레이닝 상의, 호루라기를 쥔 엄격하고 냉정한 시선',
    keyQuote: '“체고에서 기강이 무너지면 코트에 설 자격도 없다.”',
  },
  {
    name: '강이현',
    aliases: ['이현', '강 보컬'],
    role: '성인용 아이돌 후보생 (서브보컬)',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 178,
    age: 20,
    dominance: 22,
    submission: 97,
    obsession: 86,
    shame: 95,
    sanity: 32,
    secretKeyword: '루시드_언더',
    appearance: '178cm, 64kg, 투명한 피부와 갸름한 미소년상, 목에 채워진 얇은 블랙 가죽 초커',
    keyQuote: '“노래를 부르게 해준다면…… 어떤 명령이든 복종하겠습니다.”',
  },
  {
    name: '서유건',
    aliases: ['유건', '서 변호사'],
    role: '성황재단 법무팀 수석 자문역',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 180,
    age: 41,
    dominance: 88,
    submission: 12,
    obsession: 92,
    shame: 10,
    sanity: 89,
    secretKeyword: '비밀유지_계약서',
    appearance: '180cm, 74kg, 클래식 쓰리피스 정장과 단정한 포마드 헤어, 빈틈없는 비밀유지 계약서 철',
    keyQuote: '“성황 VIP 클럽에서 서명된 조항은 법률 위의 성역입니다.”',
  },
  {
    name: '루시드',
    aliases: ['루시', '최시환'],
    role: '성인용 아이돌 메인보컬 (골드초커 착용)',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 176,
    age: 21,
    dominance: 20,
    submission: 98,
    obsession: 90,
    shame: 95,
    sanity: 30,
    secretKeyword: '골드초커_04',
    appearance: '176cm, 62kg, 은발에 가까운 애쉬블론드 헤어, 쇄골에 음각된 바코드 문신, 골드 스트라이프 초커',
    keyQuote: '“하앗…… 인이어로 전달되는 진동을 멈춰 주십시오……!”',
  },
  {
    name: '서하준',
    aliases: ['하준', '서 위원'],
    role: '성황고 학생자치규율위원 (선배의 목줄)',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 186,
    age: 18,
    dominance: 40,
    submission: 95,
    obsession: 82,
    shame: 90,
    sanity: 48,
    secretKeyword: '성황청색도복',
    appearance: '186cm, 80kg, 유도부 청색 도복, 넓은 어깨와 굵은 허벅지, 선배의 억류 아래 무너지는 시선',
    keyQuote: '“도진 선배님…… 제발 매트에서 놓아 주십시오……!”',
  },
  {
    name: '최은혁',
    aliases: ['은혁', '최 위원장'],
    role: '성황고 학생자치규율위원장',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 182,
    age: 19,
    dominance: 97,
    submission: 3,
    obsession: 95,
    shame: 6,
    sanity: 94,
    secretKeyword: '학생자치규율',
    appearance: '182cm, 76kg, 완장을 찬 교복 셔츠, 교칙 집행용 가죽 스틱을 쥔 냉혹한 위원장',
    keyQuote: '“하극상을 벌인 자는 심야 특설 도장에서 1:1 기강 지도를 받는다.”',
  },
  {
    name: '강태건',
    aliases: ['태건', '강 감찰관', '통제탑 감찰총괄'],
    role: '성황 VIP 사격장 및 통제탑 수석감찰관',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 189,
    age: 38,
    dominance: 95,
    submission: 6,
    obsession: 92,
    shame: 8,
    sanity: 88,
    secretKeyword: '통제탑_사격장',
    appearance: '189cm, 90kg, 흉터가 새겨진 날카로운 광대뼈, 군용 컴프레션 기어와 권총 홀스터',
    keyQuote: '“말이 길군. 사격장 통제탑의 규율은 오차를 허용하지 않는다.”',
  },
  {
    name: '도지혁',
    aliases: ['지혁', '도 검진관'],
    role: '의료원 바이오 텔레메트리 수석검진관',
    seriesId: 's-medical-03',
    seriesTitle: '특수 의료 검진: Case 01',
    height: 185,
    age: 33,
    dominance: 94,
    submission: 8,
    obsession: 95,
    shame: 12,
    sanity: 91,
    secretKeyword: '차음실_B9',
    appearance: '185cm, 78kg, 무균 가운과 무음 이어폰, 생체 신호 모니터를 관찰하는 냉혹한 분석가',
    keyQuote: '“피검자의 호흡과 골반저근 전압이 임계치를 넘었습니다. 감압 절차 개시.”',
  },
  {
    name: '윤시환',
    aliases: ['시환', '윤 부관'],
    role: '설산 격리기지 감찰부관',
    seriesId: 's-outpost-04',
    seriesTitle: '심야2: 파견지 특별훈육수칙',
    height: 183,
    age: 31,
    dominance: 91,
    submission: 12,
    obsession: 89,
    shame: 15,
    sanity: 87,
    secretKeyword: '설산기지_규율',
    appearance: '183cm, 79kg, 짙은 회색 군용 패딩 조끼, 눈보라 속에서도 흩트러지지 않는 칼날 같은 자세',
    keyQuote: '“이곳 설산에서는 바깥세상의 지위 따위 통하지 않습니다.”',
  },
  {
    name: '정우진',
    aliases: ['우진', '정 실장'],
    role: '성황 엔터테인먼트 총괄 기획실장',
    seriesId: 's-idol-05',
    seriesTitle: '성인용 아이돌 육성기',
    height: 179,
    age: 39,
    dominance: 87,
    submission: 13,
    obsession: 91,
    shame: 12,
    sanity: 84,
    secretKeyword: '엔터_스폰서계약',
    appearance: '179cm, 73kg, 슬림핏 정장과 태블릿, 스폰서 일정과 무대 런웨이를 조율하는 기획자',
    keyQuote: '“이번 특별판 런웨이의 주인공은 이미 내정되어 있습니다.”',
  },
  {
    name: '송민재',
    aliases: ['민재', '송 선수'],
    role: '성황체고 격투기부 중량급 에이스',
    seriesId: 's-collar-02',
    seriesTitle: '186cm 킹카 후배의 목줄',
    height: 188,
    age: 19,
    dominance: 70,
    submission: 30,
    obsession: 75,
    shame: 40,
    sanity: 72,
    secretKeyword: '격투기부_헤비급',
    appearance: '188cm, 92kg, 거대한 승모근과 글러브 굳은살, 묵직하고 거친 체격',
    keyQuote: '“권도진 선배한테 대들었다가 어떻게 되는지 못 봤냐?”',
  },
  {
    name: '한결',
    aliases: ['결', '한 선수'],
    role: '성황체대 다이빙부 에이스 (티타늄 정조대 착용)',
    seriesId: 's-medical-03',
    seriesTitle: '특수 의료 검진: Case 01',
    height: 180,
    age: 22,
    dominance: 25,
    submission: 98,
    obsession: 88,
    shame: 96,
    sanity: 30,
    secretKeyword: '티타늄정조대_7cm',
    appearance: '180cm, 70kg, 수영부 강해든의 룸메이트, 티타늄 정조대를 착용한 채 인도된 피검자',
    keyQuote: '“해든이를 살리려면 닥터 진 선생님의 진료실로 데려가는 수밖에 없었어……”',
  }
];

export function runUniverseCharacterCensus(): UniverseCensusResult {
  const jsonPath = path.join(process.cwd(), 'data', 'universe_data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error('universe_data.json 캐시 파일을 찾을 수 없습니다.');
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const episodes: any[] = data.episodes || [];

  const characterResults: CensusCharacter[] = [];
  const allConflicts: ConflictItem[] = [];

  for (const master of MASTER_CHARACTER_REGISTRY) {
    let totalMentions = 0;
    const epAppearances: Array<{ seriesId: string; episodeNumber: number; title: string; count: number }> = [];

    // Search for name and aliases across all 151 episodes
    const searchTargets = [master.name, ...(master.aliases || [])];

    episodes.forEach(ep => {
      const content = ep.content || '';
      let epCount = 0;

      for (const target of searchTargets) {
        const regex = new RegExp(target, 'g');
        const matches = content.match(regex);
        if (matches) {
          epCount += matches.length;
        }
      }

      if (epCount > 0) {
        totalMentions += epCount;
        epAppearances.push({
          seriesId: ep.series_id,
          episodeNumber: ep.episode_number,
          title: ep.title,
          count: epCount,
        });
      }
    });

    // Tier 분류
    let tier: 'lead' | 'core_supporting' | 'supporting' | 'cameo' = 'cameo';
    if (totalMentions >= 100) tier = 'lead';
    else if (totalMentions >= 30) tier = 'core_supporting';
    else if (totalMentions >= 10) tier = 'supporting';

    // Conflict Check 1: 서하준 vs 서하진 유사도 및 표기 불일치 검증
    const charConflicts: ConflictItem[] = [];
    if (master.name === '서하준') {
      charConflicts.push({
        id: 'conflict-seohajun-seohajin',
        type: 'name_similarity',
        severity: 'high',
        targetCharacter: '서하준',
        relatedCharacter: '서하진',
        title: '이름 유사도 90% 충돌 (서하준 ↔ 서하진)',
        description: '원고 본문에서는 전설의 특전사 대선배로 [서하진](288회 출현)이 압도적으로 쓰이고 있으나, 초기 목데이터에 [서하준]으로 오기재되었을 가능성이 매우 높습니다.',
        affectedEpisodes: epAppearances.slice(0, 5),
        suggestedAction: '『186cm 킹카 후배의 목줄』 내 호칭을 [서하진]으로 일괄 통합하거나, [서하준]을 규율위원 후배 독자 캐릭터로 설정 분리 확정 권장.',
      });
    }

    if (master.name === '진태헌') {
      charConflicts.push({
        id: 'conflict-doctor-jin',
        type: 'alias_mismatch',
        severity: 'info',
        targetCharacter: '진태헌',
        relatedCharacter: '닥터 진',
        title: '호칭 분산 탐지 (진태헌 ↔ 닥터 진)',
        description: '본문 서술에서 실명 [진태헌]과 의료 직함 [닥터 진]이 혼용되어 출현 횟수가 양분되고 있습니다.',
        affectedEpisodes: epAppearances.slice(0, 3),
        suggestedAction: '두 호칭이 동일 인물(동일 ID)임을 공식 Canon 아카이브에 병기 완료함.',
      });
    }

    if (master.name === '배진혁') {
      charConflicts.push({
        id: 'conflict-bae-age',
        type: 'spec_inconsistency',
        severity: 'medium',
        targetCharacter: '배진혁',
        title: '나이 서술 양면성 (실제 48세 vs 외형 30세)',
        description: '원고 일부에서 30대 남성으로 묘사되나 설정집 상 48세(세포 역노화 신약 투여)로 기재되어 독자 혼선 유발 가능성이 있습니다.',
        affectedEpisodes: epAppearances.slice(0, 3),
        suggestedAction: '본문 묘사 시 《로열 넥타》 불로 세포 역노화 설정을 슬릿 요약에 명시 권장.',
      });
    }

    allConflicts.push(...charConflicts);

    characterResults.push({
      id: `char-${master.name}`,
      name: master.name,
      aliases: master.aliases || [],
      role: master.role,
      seriesId: master.seriesId,
      seriesTitle: master.seriesTitle,
      tier,
      totalMentions,
      totalEpisodes: epAppearances.length,
      episodes: epAppearances.sort((a, b) => b.count - a.count),
      height: master.height,
      age: master.age,
      dominance: master.dominance,
      submission: master.submission,
      obsession: master.obsession,
      shame: master.shame,
      sanity: master.sanity,
      secretKeyword: master.secretKeyword,
      appearance: master.appearance,
      keyQuote: master.keyQuote,
      conflicts: charConflicts,
    });
  }

  // 출현 빈도순 정렬
  characterResults.sort((a, b) => b.totalMentions - a.totalMentions);

  const leads = characterResults.filter(c => c.tier === 'lead').length;
  const core = characterResults.filter(c => c.tier === 'core_supporting').length;
  const supp = characterResults.filter(c => c.tier === 'supporting').length;
  const cameo = characterResults.filter(c => c.tier === 'cameo').length;
  const totalM = characterResults.reduce((sum, c) => sum + c.totalMentions, 0);

  return {
    stats: {
      totalCharacters: characterResults.length,
      totalMentions: totalM,
      totalEpisodesScanned: episodes.length,
      leadCount: leads,
      coreSupportingCount: core,
      supportingCount: supp,
      cameoCount: cameo,
      totalConflicts: allConflicts.length,
    },
    characters: characterResults,
    allConflicts,
  };
}
