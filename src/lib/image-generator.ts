/**
 * CROWN GRID - 100% Free AI Image Generation Engine (Pro Optimizer)
 * 
 * 미드저니 CLI 태그(--ar, --style 등)를 자동 정제하고,
 * 35mm 극실사 시네마틱 가중치를 주입하여 고화질 이미지를 렌더링합니다.
 */

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '3:4' | '1:1';
  style?: 'cinematic' | 'portrait' | 'webtoon';
  seed?: number;
  model?: string;
}

/**
 * 미드저니 플래그 및 중복 노이즈 제거
 */
export function cleanPrompt(rawPrompt: string): string {
  return rawPrompt
    .replace(/--ar\s+[0-9:]+/gi, '')
    .replace(/--style\s+\S+/gi, '')
    .replace(/--v\s+[0-9.]+/gi, '')
    .replace(/--stylize\s+[0-9]+/gi, '')
    .replace(/--chaos\s+[0-9]+/gi, '')
    .replace(/--q\s+[0-9.]+/gi, '')
    .replace(/--no\s+[^,-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildImageUrl(options: ImageGenerationOptions): string {
  const { prompt, aspectRatio = '16:9', style = 'cinematic', seed } = options;

  let width = 1024;
  let height = 576; // 16:9 최적 비율 (Flux/Sana 표준)

  if (aspectRatio === '3:4') {
    // 세로 웹소설 표지 규격
    width = 768;
    height = 1024;
  } else if (aspectRatio === '1:1') {
    // 정사각형 프로필/썸네일
    width = 768;
    height = 768;
  } else {
    // 16:9 와이드 시네마틱 스틸컷
    width = 1024;
    height = 576;
  }

  // 1. 미드저니 파라미터 제거
  const cleaned = cleanPrompt(prompt);

  // 2. 화풍 프리셋별 최적 실사 수식어 주입
  let styleSuffix = '';
  if (style === 'cinematic') {
    styleSuffix = ', award winning 35mm film photograph, Kodak Vision3 500T, Leica Summilux lens, high contrast rim lighting, natural detailed skin texture, pores, cinematic atmosphere, 8k uhd, masterpiece';
  } else if (style === 'portrait') {
    styleSuffix = ', sharp editorial fashion portrait, sharp eye focus, chiaroscuro lighting, Hasselblad H6D-100c, realistic skin reflections, rich dark luxury aesthetic, 8k uhd';
  } else {
    styleSuffix = ', dark webtoon illustration, manhwa art style, intense dramatic lighting, sharp line art, high detail, masterpiece';
  }

  const finalPrompt = `${cleaned}${styleSuffix}`;
  const encodedPrompt = encodeURIComponent(finalPrompt);

  const randomSeed = seed ?? Math.floor(Math.random() * 9999999);

  // enhance=false: 엔진 자체 LLM의 프롬프트 변질/왜곡을 차단하여 원본 디테일 100% 보존
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&model=flux&nologo=true&enhance=false`;
}
