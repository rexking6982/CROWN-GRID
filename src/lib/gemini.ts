import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Gemini API Key 로드
const apiKey = process.env.GEMINI_API_KEY || '';

// 안전성 검열 무효화 (창작물 성인물/암흑/군부물 처리용 BLOCK_NONE 필수)
export const geminiSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

export function getGeminiModel(modelName: string = 'gemini-1.5-pro') {
  if (!apiKey) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings: geminiSafetySettings,
  });
}

export interface AgentProcessResult {
  summary: {
    oneLineSlit: string;
    keyPoints: string[];
  };
  canonCheck: {
    passed: boolean;
    cWordFound: boolean; // 'Class' 단어 발견 여부
    issues: string[];
    bangleSlitRulePassed: boolean;
  };
  prompts: Array<{
    sceneName: string;
    timestamp: string;
    prompt: string;
    negativePrompt: string;
    aspectRatio: string;
  }>;
  distribution: {
    postypeHtml: string;
    subscribeStarText: string;
  };
  characterStats: Array<{
    name: string;
    dominance: number; // 지배력
    submission: number; // 복종도
    obsession: number; // 집착도
    shame: number; // 수치심
    sanity: number; // 이성치
    secretKeyword: string; // 회차 암호 키워드
  }>;
}

/**
 * Gemini 호출 또는 로컬 템플릿 기반 5대 스튜디오 데이터 생성
 */
export async function analyzeEpisodeContent(
  seriesTitle: string,
  episodeNum: number,
  episodeTitle: string,
  content: string
): Promise<AgentProcessResult> {
  const model = getGeminiModel('gemini-1.5-flash');

  // C-Word('Class') 검증
  const cWordRegex = /\bclass\b/i;
  const cWordFound = cWordRegex.test(content);

  // 기본 분석 결과 틀
  if (!model) {
    return generateFallbackStudioData(seriesTitle, episodeNum, episodeTitle, content, cWordFound);
  }

  const prompt = `
당신은 성황 유니버스(Dark Aristocracy & Military Psychological Fiction) 전담 총괄 프로듀서 에이전트입니다.
다음 에피소드 원고를 분석하고 아래 JSON 형식에 맞추어 엄격하게 출력하십시오. 마크다운 따옴표(\`\`\`json)로 감싸십시오.

[원고 정보]
- 시리즈: ${seriesTitle}
- 회차: 제${episodeNum}화 - ${episodeTitle}
- 본문 발췌:
${content.slice(0, 4000)}

[요구사항]
1. summary: 뱅글 소거식 5줄을 거쳐 최종 1줄 슬릿 요약과 핵심 3개 포인트 도출
2. canonCheck: 금지어 'Class' 사용 여부(${cWordFound}), 설정 충돌 여부
3. prompts: 35mm 영화풍 스틸컷 5개 씬의 미드저니/SD 영문 프롬프트 (검열 우회용 고급 어휘 사용, raw photo, cinematic lighting, 35mm photograph, 8k 등)
4. distribution: 
   - postypeHtml: 포스타입용 가독성 높은 HTML 서식 (4화 하단엔 웹앱 정주행 VIP 유도 배너 포함)
   - subscribeStarText: SubscribeStar.adult용 성인 독자 타깃 영/한 요약 및 후원 감사 글
5. characterStats: 등장인물들의 5대 스탯(지배, 복종, 집착, 수치, 이성: 0~100) 및 이번 화의 결정적 암호 키워드

응답 JSON 구조:
{
  "summary": { "oneLineSlit": "...", "keyPoints": ["...", "...", "..."] },
  "canonCheck": { "passed": true, "cWordFound": ${cWordFound}, "issues": [], "bangleSlitRulePassed": true },
  "prompts": [
    { "sceneName": "...", "timestamp": "...", "prompt": "...", "negativePrompt": "...", "aspectRatio": "16:9" }
  ],
  "distribution": { "postypeHtml": "...", "subscribeStarText": "..." },
  "characterStats": [
    { "name": "...", "dominance": 80, "submission": 20, "obsession": 90, "shame": 40, "sanity": 60, "secretKeyword": "..." }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn('Gemini API call failed, falling back to local engine:', err);
  }

  return generateFallbackStudioData(seriesTitle, episodeNum, episodeTitle, content, cWordFound);
}

function generateFallbackStudioData(
  seriesTitle: string,
  episodeNum: number,
  episodeTitle: string,
  content: string,
  cWordFound: boolean
): AgentProcessResult {
  const issues: string[] = [];
  if (cWordFound) {
    issues.push("주의: 성황 유니버스 Canon 규칙 위반! 'Class' 단어가 본문에 포함되어 있습니다. (성황 VIP 클럽 외 서열 표현 금지)");
  }

  const excerpt = content.slice(0, 300).replace(/\n/g, ' ');

  return {
    summary: {
      oneLineSlit: `[제${episodeNum}화] ${episodeTitle} - 규율과 본능의 경계선에서 교차하는 지배의 의식과 무너지는 통제력.`,
      keyPoints: [
        `폐쇄된 통제 구역 내에서 시작된 은밀한 명령 체계의 재편`,
        `주요 등장인물 간의 심리적 우위 선점과 육체적 억압 반응`,
        `성황 유니버스의 묵인된 규율 속에서 영구히 봉인된 서약의 시작`
      ]
    },
    canonCheck: {
      passed: !cWordFound,
      cWordFound,
      issues,
      bangleSlitRulePassed: true
    },
    prompts: [
      {
        sceneName: '오프닝: 정적의 통제실과 사각지대',
        timestamp: '00:03:15',
        prompt: `Cinematic 35mm film still, sharp focus, 1980s dark military aesthetic, cold fluorescent tube lighting reflecting on obsidian tile floor, sharp tailored dark uniform, subtle tension, atmospheric dust particles, shallow depth of field, Kodak Vision3 500T --ar 16:9 --style raw`,
        negativePrompt: `cartoon, anime, 3d render, oversaturated, blurry, bad anatomy`,
        aspectRatio: '16:9'
      },
      {
        sceneName: '갈등: 턱을 치켜든 오만한 시선',
        timestamp: '00:11:42',
        prompt: `Dramatic close up shot, 35mm Leica M6, strong rim lighting in dark luxury room, champagne gold and obsidian accents, intense eye contact, cold superiority expression, wet skin texture, high fashion noir --ar 16:9 --v 6.0`,
        negativePrompt: `deformed, smiling, casual clothes, low resolution`,
        aspectRatio: '16:9'
      },
      {
        sceneName: '하이라이트: 결박과 절대적 굴복의 각인',
        timestamp: '00:24:50',
        prompt: `Sensual high-contrast chiaroscuro photography, dark room, polished leather constraints on dark polished mahogany table, sweat glistening under directional spotlight, raw emotional surrender, high aesthetic eroticism, grain, vintage film look --ar 16:9`,
        negativePrompt: `bright daylight, outdoor, cheap props, distortion`,
        aspectRatio: '16:9'
      },
      {
        sceneName: '전환: 거울에 비친 무너진 이성',
        timestamp: '00:33:10',
        prompt: `Medium shot through heavy antique mirror with golden patina, reflection of breathless exhausted figure kneeling, shadowed dominant figure standing behind, psychological domination, moody mist, muted tones --ar 16:9`,
        negativePrompt: `flat lighting, saturated, smile`,
        aspectRatio: '16:9'
      },
      {
        sceneName: '엔딩: 서약의 징표와 잠긴 문',
        timestamp: '00:41:20',
        prompt: `Macro shot, heavy brass keyhole and locked steel soundproof door, engraved golden insignia glowing faintly, cold blue corridor light leaking from the bottom slit, cinematic mystery, Panavision anamorphic lens --ar 16:9`,
        negativePrompt: `low quality, messy composition, blurry`,
        aspectRatio: '16:9'
      }
    ],
    distribution: {
      postypeHtml: `<div class="se-main-container" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #222;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-size: 22px; font-weight: 700; color: #111; letter-spacing: -0.5px;">${seriesTitle}</h2>
    <p style="font-size: 14px; color: #777;">제${episodeNum}화 - ${episodeTitle}</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
  <div style="font-size: 16px; white-space: pre-wrap; word-break: break-all;">
${content.slice(0, 1500)}...
  </div>
  <div style="margin-top: 40px; padding: 24px; background: #0A0A0C; border: 1px solid #D4AF37; border-radius: 8px; text-align: center; color: #F3F3F5;">
    <h3 style="color: #D4AF37; font-size: 18px; margin-bottom: 8px;">👑 CROWN GRID 익스클루시브 완전판 안내</h3>
    <p style="font-size: 13px; color: #AAA; margin-bottom: 16px;">본 에피소드의 무삭제 무검열 원본 및 고화질 35mm 비하인드 스틸컷은 창작자 전용 보안 뷰어 『CROWN GRID』에서 VIP 등급으로 실시간 감상하실 수 있습니다.</p>
    <a href="/read" style="display: inline-block; padding: 10px 24px; background: #D4AF37; color: #0A0A0C; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 4px;">크라운 그리드 보안 열람실 바로가기 →</a>
  </div>
</div>`,
      subscribeStarText: `👑 [CROWN GRID EXCLUSIVE] ${seriesTitle} - Ep.${episodeNum}: ${episodeTitle}

Hello patrons, this is the official director's cut for Episode ${episodeNum}.
In this chapter, the delicate psychological balance shifts irrevocably into total subjection behind the soundproof partition.

[Key Incident]
${episodeTitle} introduces high-intensity psychological warfare with customized conditioning protocols.

Thank you for supporting this ongoing dark universe project.
Uncensored full chapters, interactive character dynamic maps, and high-res 35mm film stills are strictly protected on the CROWN GRID system.`
    },
    characterStats: [
      {
        name: '강태건',
        dominance: 92,
        submission: 8,
        obsession: 88,
        shame: 15,
        sanity: 85,
        secretKeyword: '사각지대_서약'
      },
      {
        name: '서하진',
        dominance: 25,
        submission: 89,
        obsession: 74,
        shame: 82,
        sanity: 42,
        secretKeyword: '편광유리_호흡'
      }
    ]
  };
}
