/**
 * CROWN GRID - 100% Free AI Image Generation Engine
 * 
 * 비용이 들지 않는 Pollinations AI / Flux / SDXL 고속 엔드포인트를 기반으로
 * 미드저니/35mm 극실사 프롬프트를 16:9 스틸컷 및 3:4 세로 웹소설 표지로 실시간 렌더링합니다.
 */

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '3:4' | '1:1';
  seed?: number;
  model?: 'flux' | 'turbo';
}

export function buildImageUrl(options: ImageGenerationOptions): string {
  const { prompt, aspectRatio = '16:9', seed, model = 'flux' } = options;

  let width = 1280;
  let height = 720;

  if (aspectRatio === '3:4') {
    // 세로 웹소설 표지 규격
    width = 768;
    height = 1024;
  } else if (aspectRatio === '1:1') {
    // 정사각형 프로필/썸네일
    width = 800;
    height = 800;
  } else {
    // 16:9 와이드 시네마틱 스틸컷
    width = 1280;
    height = 720;
  }

  const randomSeed = seed ?? Math.floor(Math.random() * 9999999);
  
  // 품질 강화 수식어 자동 보강
  const enhancedPrompt = `${prompt}, 8k resolution, cinematic lighting, masterwork, highly detailed`;
  const encodedPrompt = encodeURIComponent(enhancedPrompt);

  // 100% 무료 무제한 Pollinations AI Flux/Turbo 엔드포인트
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&model=${model}&nologo=true&enhance=true`;
}
