/**
 * CROWN GRID - Zero-Width Steganography Engine
 * 
 * 열람자의 식별자(User ID, Session Hash, Timestamp 등)를 
 * 육안으로 보이지 않는 4종의 제로 너비 문자(Zero-Width Characters)로 2진/4진 변환하여
 * 본문 문장 사이에 은밀하게 삽입하고, 유출된 텍스트에서 이를 역추적/복원합니다.
 */

// 4종 제로 너비 문자 매핑 (2 bits per char)
const ZW_CHARS = {
  ZERO: '\u200B', // Zero Width Space       -> '00'
  ONE:  '\u200C', // Zero Width Non-Joiner   -> '01'
  TWO:  '\u200D', // Zero Width Joiner       -> '10'
  THREE:'\uFEFF', // Zero Width No-Break/BOM -> '11'
};

const ZW_REVERSE_MAP: Record<string, string> = {
  '\u200B': '00',
  '\u200C': '01',
  '\u200D': '10',
  '\uFEFF': '11',
};

// 워터마크 시작/종료 마커 (복호화 시 추출 신뢰도 향상)
const START_MARKER = '\u200D\u200C\u200B\uFEFF'; // 식별 마커
const END_MARKER   = '\uFEFF\u200B\u200C\u200D';

/**
 * 텍스트(예: "USER:9921|IP:127.0.0.1|TIME:1729600000")를 제로 너비 문자열로 인코딩
 */
export function encodeStringToZeroWidth(payload: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(payload);
  let bitString = '';

  for (let i = 0; i < bytes.length; i++) {
    bitString += bytes[i].toString(2).padStart(8, '0');
  }

  let zwResult = '';
  // 2비트씩 묶어서 제로너비 문자로 치환
  for (let i = 0; i < bitString.length; i += 2) {
    const pair = bitString.slice(i, i + 2);
    if (pair === '00') zwResult += ZW_CHARS.ZERO;
    else if (pair === '01') zwResult += ZW_CHARS.ONE;
    else if (pair === '10') zwResult += ZW_CHARS.TWO;
    else if (pair === '11') zwResult += ZW_CHARS.THREE;
  }

  return START_MARKER + zwResult + END_MARKER;
}

/**
 * 제로 너비 문자열에서 원본 페이로드 복원
 */
export function decodeZeroWidthToString(rawText: string): string | null {
  // 마커 사이의 제로 너비 문자만 추출
  const startIndex = rawText.indexOf(START_MARKER);
  if (startIndex === -1) {
    // 마커가 없을 경우 전체 텍스트에서 제로 너비 문자만 모아 시도
    return fallbackExtract(rawText);
  }

  const afterStart = rawText.slice(startIndex + START_MARKER.length);
  const endIndex = afterStart.indexOf(END_MARKER);
  if (endIndex === -1) {
    return fallbackExtract(rawText);
  }

  const zwPayload = afterStart.slice(0, endIndex);
  return parseZWPayload(zwPayload);
}

function fallbackExtract(text: string): string | null {
  // 모든 제로 너비 문자 모으기
  const chars = text.split('').filter(c => c in ZW_REVERSE_MAP);
  if (chars.length < 8) return null; // 최소 바이트 수 미달
  return parseZWPayload(chars.join(''));
}

function parseZWPayload(zwPayload: string): string | null {
  let bitString = '';
  for (const ch of zwPayload) {
    const bits = ZW_REVERSE_MAP[ch];
    if (bits) {
      bitString += bits;
    }
  }

  // 8비트(1바이트) 단위로 끊어서 디코딩
  const byteCount = Math.floor(bitString.length / 8);
  if (byteCount === 0) return null;

  const byteArray = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    const byteBits = bitString.slice(i * 8, (i + 1) * 8);
    byteArray[i] = parseInt(byteBits, 2);
  }

  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(byteArray);
  } catch {
    // 손상된 경우 관대한 디코딩
    const decoder = new TextDecoder('utf-8', { fatal: false });
    return decoder.decode(byteArray);
  }
}

/**
 * 에피소드 본문 텍스트에 사용자 식별 워터마크를 분산 삽입
 * (단락이나 마침표 뒤에 자연스럽게 삽입되어 렌더링에 영향을 주지 않음)
 */
export function embedWatermark(originalText: string, userSignature: string): string {
  const zwPayload = encodeStringToZeroWidth(userSignature);
  if (!originalText) return originalText;

  // 문단 분리
  const paragraphs = originalText.split('\n\n');
  if (paragraphs.length <= 1) {
    // 단락이 없으면 마침표 뒤에 분산 삽입
    const sentences = originalText.split('. ');
    if (sentences.length > 2) {
      const mid = Math.floor(sentences.length / 2);
      sentences[mid] = sentences[mid] + zwPayload;
      return sentences.join('. ');
    }
    return originalText + zwPayload;
  }

  // 여러 단락인 경우, 2번째 단락 끝과 중간 단락 끝에 분산 복제 삽입(한 줄만 긁혀도 적발되도록)
  const result: string[] = [];
  const middleIdx = Math.floor(paragraphs.length / 2);

  for (let i = 0; i < paragraphs.length; i++) {
    let p = paragraphs[i];
    if (i === 1 || i === middleIdx || i === paragraphs.length - 2) {
      p = p + zwPayload;
    }
    result.push(p);
  }

  return result.join('\n\n');
}
