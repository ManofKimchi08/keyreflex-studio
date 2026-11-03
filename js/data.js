/**
 * 키보드 레이아웃, 손가락 매핑, 한글 자모 분해 및 연습 데이터셋
 */

// 10개 손가락 정의 및 메타데이터
window.FINGER_INFO = {
  L_PINKY:  { id: 'L_PINKY',  hand: 'left',  name: '왼손 소지 (새끼)', short: '좌 소지', color: '#f43f5e', lightColor: 'rgba(244, 63, 94, 0.25)', homeKey: 'KeyA' },
  L_RING:   { id: 'L_RING',   hand: 'left',  name: '왼손 약지',       short: '좌 약지', color: '#fb923c', lightColor: 'rgba(251, 146, 60, 0.25)', homeKey: 'KeyS' },
  L_MIDDLE: { id: 'L_MIDDLE', hand: 'left',  name: '왼손 중지',       short: '좌 중지', color: '#facc15', lightColor: 'rgba(250, 204, 21, 0.25)', homeKey: 'KeyD' },
  L_INDEX:  { id: 'L_INDEX',  hand: 'left',  name: '왼손 검지',       short: '좌 검지', color: '#4ade80', lightColor: 'rgba(74, 222, 128, 0.25)', homeKey: 'KeyF' },
  L_THUMB:  { id: 'L_THUMB',  hand: 'left',  name: '왼손 엄지',       short: '좌 엄지', color: '#2dd4bf', lightColor: 'rgba(45, 212, 191, 0.25)', homeKey: 'Space' },
  R_THUMB:  { id: 'R_THUMB',  hand: 'right', name: '오른손 엄지',     short: '우 엄지', color: '#2dd4bf', lightColor: 'rgba(45, 212, 191, 0.25)', homeKey: 'Space' },
  R_INDEX:  { id: 'R_INDEX',  hand: 'right', name: '오른손 검지',     short: '우 검지', color: '#38bdf8', lightColor: 'rgba(56, 189, 248, 0.25)', homeKey: 'KeyJ' },
  R_MIDDLE: { id: 'R_MIDDLE', hand: 'right', name: '오른손 중지',     short: '우 중지', color: '#818cf8', lightColor: 'rgba(129, 140, 248, 0.25)', homeKey: 'KeyK' },
  R_RING:   { id: 'R_RING',   hand: 'right', name: '오른손 약지',     short: '우 약지', color: '#c084fc', lightColor: 'rgba(192, 132, 252, 0.25)', homeKey: 'KeyL' },
  R_PINKY:  { id: 'R_PINKY',  hand: 'right', name: '오른손 소지 (새끼)', short: '우 소지', color: '#f472b6', lightColor: 'rgba(244, 114, 182, 0.25)', homeKey: 'Semicolon' }
};

// 키보드 행별 데이터 (표준 ANSI 쿼티 + 한글 두벌식)
// w: 기본 키 너비 배수 (1u = 60px 기준)
window.KEYBOARD_ROWS = [
  // Row 0: 숫자열
  [
    { code: 'Backquote', en: '`', enShift: '~', ko: '`', koShift: '~', w: 1, finger: 'L_PINKY' },
    { code: 'Digit1', en: '1', enShift: '!', ko: '1', koShift: '!', w: 1, finger: 'L_PINKY' },
    { code: 'Digit2', en: '2', enShift: '@', ko: '2', koShift: '@', w: 1, finger: 'L_RING' },
    { code: 'Digit3', en: '3', enShift: '#', ko: '3', koShift: '#', w: 1, finger: 'L_MIDDLE' },
    { code: 'Digit4', en: '4', enShift: '$', ko: '4', koShift: '$', w: 1, finger: 'L_INDEX' },
    { code: 'Digit5', en: '5', enShift: '%', ko: '5', koShift: '%', w: 1, finger: 'L_INDEX' },
    { code: 'Digit6', en: '6', enShift: '^', ko: '6', koShift: '^', w: 1, finger: 'R_INDEX' },
    { code: 'Digit7', en: '7', enShift: '&', ko: '7', koShift: '&', w: 1, finger: 'R_INDEX' },
    { code: 'Digit8', en: '8', enShift: '*', ko: '8', koShift: '*', w: 1, finger: 'R_MIDDLE' },
    { code: 'Digit9', en: '9', enShift: '(', ko: '9', koShift: '(', w: 1, finger: 'R_RING' },
    { code: 'Digit0', en: '0', enShift: ')', ko: '0', koShift: ')', w: 1, finger: 'R_PINKY' },
    { code: 'Minus', en: '-', enShift: '_', ko: '-', koShift: '_', w: 1, finger: 'R_PINKY' },
    { code: 'Equal', en: '=', enShift: '+', ko: '=', koShift: '+', w: 1, finger: 'R_PINKY' },
    { code: 'Backspace', en: '⌫', enShift: '⌫', ko: '⌫', koShift: '⌫', w: 2, finger: 'R_PINKY', isModifier: true }
  ],
  // Row 1: 상단 자모열 (윗자리)
  [
    { code: 'Tab', en: 'Tab', enShift: 'Tab', ko: 'Tab', koShift: 'Tab', w: 1.5, finger: 'L_PINKY', isModifier: true },
    { code: 'KeyQ', en: 'Q', enShift: 'Q', ko: 'ㅂ', koShift: 'ㅃ', w: 1, finger: 'L_PINKY', rowType: 'top' },
    { code: 'KeyW', en: 'W', enShift: 'W', ko: 'ㅈ', koShift: 'ㅉ', w: 1, finger: 'L_RING', rowType: 'top' },
    { code: 'KeyE', en: 'E', enShift: 'E', ko: 'ㄷ', koShift: 'ㄸ', w: 1, finger: 'L_MIDDLE', rowType: 'top' },
    { code: 'KeyR', en: 'R', enShift: 'R', ko: 'ㄱ', koShift: 'ㄲ', w: 1, finger: 'L_INDEX', rowType: 'top' },
    { code: 'KeyT', en: 'T', enShift: 'T', ko: 'ㅅ', koShift: 'ㅆ', w: 1, finger: 'L_INDEX', rowType: 'top' },
    { code: 'KeyY', en: 'Y', enShift: 'Y', ko: 'ㅛ', koShift: 'ㅛ', w: 1, finger: 'R_INDEX', rowType: 'top' },
    { code: 'KeyU', en: 'U', enShift: 'U', ko: 'ㅕ', koShift: 'ㅕ', w: 1, finger: 'R_INDEX', rowType: 'top' },
    { code: 'KeyI', en: 'I', enShift: 'I', ko: 'ㅑ', koShift: 'ㅑ', w: 1, finger: 'R_MIDDLE', rowType: 'top' },
    { code: 'KeyO', en: 'O', enShift: 'O', ko: 'ㅐ', koShift: 'ㅒ', w: 1, finger: 'R_RING', rowType: 'top' },
    { code: 'KeyP', en: 'P', enShift: 'P', ko: 'ㅔ', koShift: 'ㅖ', w: 1, finger: 'R_PINKY', rowType: 'top' },
    { code: 'BracketLeft', en: '[', enShift: '{', ko: '[', koShift: '{', w: 1, finger: 'R_PINKY' },
    { code: 'BracketRight', en: ']', enShift: '}', ko: ']', koShift: '}', w: 1, finger: 'R_PINKY' },
    { code: 'Backslash', en: '\\', enShift: '|', ko: '\\', koShift: '|', w: 1.5, finger: 'R_PINKY' }
  ],
  // Row 2: 중단 자모열 (홈 로우 / 기본자리)
  [
    { code: 'CapsLock', en: 'Caps', enShift: 'Caps', ko: 'Caps', koShift: 'Caps', w: 1.75, finger: 'L_PINKY', isModifier: true },
    { code: 'KeyA', en: 'A', enShift: 'A', ko: 'ㅁ', koShift: 'ㅁ', w: 1, finger: 'L_PINKY', isHome: true, rowType: 'home' },
    { code: 'KeyS', en: 'S', enShift: 'S', ko: 'ㄴ', koShift: 'ㄴ', w: 1, finger: 'L_RING', isHome: true, rowType: 'home' },
    { code: 'KeyD', en: 'D', enShift: 'D', ko: 'ㅇ', koShift: 'ㅇ', w: 1, finger: 'L_MIDDLE', isHome: true, rowType: 'home' },
    { code: 'KeyF', en: 'F', enShift: 'F', ko: 'ㄹ', koShift: 'ㄹ', w: 1, finger: 'L_INDEX', isHome: true, hasBump: true, rowType: 'home' },
    { code: 'KeyG', en: 'G', enShift: 'G', ko: 'ㅎ', koShift: 'ㅎ', w: 1, finger: 'L_INDEX', rowType: 'home' },
    { code: 'KeyH', en: 'H', enShift: 'H', ko: 'ㅗ', koShift: 'ㅗ', w: 1, finger: 'R_INDEX', rowType: 'home' },
    { code: 'KeyJ', en: 'J', enShift: 'J', ko: 'ㅓ', koShift: 'ㅓ', w: 1, finger: 'R_INDEX', isHome: true, hasBump: true, rowType: 'home' },
    { code: 'KeyK', en: 'K', enShift: 'K', ko: 'ㅏ', koShift: 'ㅏ', w: 1, finger: 'R_MIDDLE', isHome: true, rowType: 'home' },
    { code: 'KeyL', en: 'L', enShift: 'L', ko: 'ㅣ', koShift: 'ㅣ', w: 1, finger: 'R_RING', isHome: true, rowType: 'home' },
    { code: 'Semicolon', en: ';', enShift: ':', ko: ';', koShift: ':', w: 1, finger: 'R_PINKY', isHome: true, rowType: 'home' },
    { code: 'Quote', en: "'", enShift: '"', ko: "'", koShift: '"', w: 1, finger: 'R_PINKY' },
    { code: 'Enter', en: 'Enter ↵', enShift: 'Enter ↵', ko: '엔터 ↵', koShift: '엔터 ↵', w: 2.25, finger: 'R_PINKY', isModifier: true }
  ],
  // Row 3: 하단 자모열 (아랫자리)
  [
    { code: 'ShiftLeft', en: 'Shift ⇧', enShift: 'Shift ⇧', ko: 'Shift ⇧', koShift: 'Shift ⇧', w: 2.25, finger: 'L_PINKY', isModifier: true },
    { code: 'KeyZ', en: 'Z', enShift: 'Z', ko: 'ㅋ', koShift: 'ㅋ', w: 1, finger: 'L_PINKY', rowType: 'bottom' },
    { code: 'KeyX', en: 'X', enShift: 'X', ko: 'ㅌ', koShift: 'ㅌ', w: 1, finger: 'L_RING', rowType: 'bottom' },
    { code: 'KeyC', en: 'C', enShift: 'C', ko: 'ㅊ', koShift: 'ㅊ', w: 1, finger: 'L_MIDDLE', rowType: 'bottom' },
    { code: 'KeyV', en: 'V', enShift: 'V', ko: 'ㅍ', koShift: 'ㅍ', w: 1, finger: 'L_INDEX', rowType: 'bottom' },
    { code: 'KeyB', en: 'B', enShift: 'B', ko: 'ㅠ', koShift: 'ㅠ', w: 1, finger: 'L_INDEX', rowType: 'bottom' },
    { code: 'KeyN', en: 'N', enShift: 'N', ko: 'ㅜ', koShift: 'ㅜ', w: 1, finger: 'R_INDEX', rowType: 'bottom' },
    { code: 'KeyM', en: 'M', enShift: 'M', ko: 'ㅡ', koShift: 'ㅡ', w: 1, finger: 'R_INDEX', rowType: 'bottom' },
    { code: 'Comma', en: ',', enShift: '<', ko: ',', koShift: '<', w: 1, finger: 'R_MIDDLE', rowType: 'bottom' },
    { code: 'Period', en: '.', enShift: '>', ko: '.', koShift: '>', w: 1, finger: 'R_RING', rowType: 'bottom' },
    { code: 'Slash', en: '/', enShift: '?', ko: '/', koShift: '?', w: 1, finger: 'R_PINKY', rowType: 'bottom' },
    { code: 'ShiftRight', en: 'Shift ⇧', enShift: 'Shift ⇧', ko: 'Shift ⇧', koShift: 'Shift ⇧', w: 2.75, finger: 'R_PINKY', isModifier: true }
  ],
  // Row 4: 스페이스바 열
  [
    { code: 'ControlLeft', en: 'Ctrl', enShift: 'Ctrl', ko: 'Ctrl', koShift: 'Ctrl', w: 1.5, finger: 'L_PINKY', isModifier: true },
    { code: 'MetaLeft', en: 'Win', enShift: 'Win', ko: 'Win', koShift: 'Win', w: 1.25, finger: 'L_THUMB', isModifier: true },
    { code: 'AltLeft', en: 'Alt', enShift: 'Alt', ko: 'Alt', koShift: 'Alt', w: 1.25, finger: 'L_THUMB', isModifier: true },
    { code: 'Space', en: 'SPACE', enShift: 'SPACE', ko: '스페이스바', koShift: '스페이스바', w: 6.5, finger: 'R_THUMB', isHome: true },
    { code: 'AltRight', en: '한/영', enShift: '한/영', ko: '한/영', koShift: '한/영', w: 1.25, finger: 'R_THUMB', isModifier: true },
    { code: 'ContextMenu', en: 'Menu', enShift: 'Menu', ko: '메뉴', koShift: '메뉴', w: 1.25, finger: 'R_PINKY', isModifier: true },
    { code: 'ControlRight', en: 'Ctrl', enShift: 'Ctrl', ko: 'Ctrl', koShift: 'Ctrl', w: 2.0, finger: 'R_PINKY', isModifier: true }
  ]
];

// 빠른 조회용 맵 생성
window.KEY_MAP = {};
window.KEYBOARD_ROWS.forEach((row, rIdx) => {
  row.forEach((key, cIdx) => {
    key.row = rIdx;
    key.col = cIdx;
    window.KEY_MAP[key.code] = key;
  });
});

// 한글 자모 -> 물리 키 코드 시퀀스 매핑 (복합 자모 및 쌍자음 포함)
window.KO_JAMO_TO_KEYS = {
  // 자음 (초성/종성 단일 및 쌍자음)
  'ㄱ': [{ code: 'KeyR', shift: false }],
  'ㄲ': [{ code: 'KeyR', shift: true }],
  'ㄴ': [{ code: 'KeyS', shift: false }],
  'ㄷ': [{ code: 'KeyE', shift: false }],
  'ㄸ': [{ code: 'KeyE', shift: true }],
  'ㄹ': [{ code: 'KeyF', shift: false }],
  'ㅁ': [{ code: 'KeyA', shift: false }],
  'ㅂ': [{ code: 'KeyQ', shift: false }],
  'ㅃ': [{ code: 'KeyQ', shift: true }],
  'ㅅ': [{ code: 'KeyT', shift: false }],
  'ㅆ': [{ code: 'KeyT', shift: true }],
  'ㅇ': [{ code: 'KeyD', shift: false }],
  'ㅈ': [{ code: 'KeyW', shift: false }],
  'ㅉ': [{ code: 'KeyW', shift: true }],
  'ㅊ': [{ code: 'KeyC', shift: false }],
  'ㅋ': [{ code: 'KeyZ', shift: false }],
  'ㅌ': [{ code: 'KeyX', shift: false }],
  'ㅍ': [{ code: 'KeyV', shift: false }],
  'ㅎ': [{ code: 'KeyG', shift: false }],
  // 겹받침
  'ㄳ': [{ code: 'KeyR', shift: false }, { code: 'KeyT', shift: false }],
  'ㄵ': [{ code: 'KeyS', shift: false }, { code: 'KeyW', shift: false }],
  'ㄶ': [{ code: 'KeyS', shift: false }, { code: 'KeyG', shift: false }],
  'ㄺ': [{ code: 'KeyF', shift: false }, { code: 'KeyR', shift: false }],
  'ㄻ': [{ code: 'KeyF', shift: false }, { code: 'KeyA', shift: false }],
  'ㄼ': [{ code: 'KeyF', shift: false }, { code: 'KeyQ', shift: false }],
  'ㄽ': [{ code: 'KeyF', shift: false }, { code: 'KeyT', shift: false }],
  'ㄾ': [{ code: 'KeyF', shift: false }, { code: 'KeyX', shift: false }],
  'ㄿ': [{ code: 'KeyF', shift: false }, { code: 'KeyV', shift: false }],
  'ㅀ': [{ code: 'KeyF', shift: false }, { code: 'KeyG', shift: false }],
  'ㅄ': [{ code: 'KeyQ', shift: false }, { code: 'KeyT', shift: false }],
  // 모음
  'ㅏ': [{ code: 'KeyK', shift: false }],
  'ㅐ': [{ code: 'KeyO', shift: false }],
  'ㅑ': [{ code: 'KeyI', shift: false }],
  'ㅒ': [{ code: 'KeyO', shift: true }],
  'ㅓ': [{ code: 'KeyJ', shift: false }],
  'ㅔ': [{ code: 'KeyP', shift: false }],
  'ㅕ': [{ code: 'KeyU', shift: false }],
  'ㅖ': [{ code: 'KeyP', shift: true }],
  'ㅗ': [{ code: 'KeyH', shift: false }],
  'ㅘ': [{ code: 'KeyH', shift: false }, { code: 'KeyK', shift: false }],
  'ㅙ': [{ code: 'KeyH', shift: false }, { code: 'KeyO', shift: false }],
  'ㅚ': [{ code: 'KeyH', shift: false }, { code: 'KeyL', shift: false }],
  'ㅛ': [{ code: 'KeyY', shift: false }],
  'ㅜ': [{ code: 'KeyN', shift: false }],
  'ㅝ': [{ code: 'KeyN', shift: false }, { code: 'KeyJ', shift: false }],
  'ㅞ': [{ code: 'KeyN', shift: false }, { code: 'KeyP', shift: false }],
  'ㅟ': [{ code: 'KeyN', shift: false }, { code: 'KeyL', shift: false }],
  'ㅠ': [{ code: 'KeyB', shift: false }],
  'ㅡ': [{ code: 'KeyM', shift: false }],
  'ㅢ': [{ code: 'KeyM', shift: false }, { code: 'KeyL', shift: false }],
  'ㅣ': [{ code: 'KeyL', shift: false }]
};

const CHO_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG_LIST = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

// 영문/특수문자 -> 물리 키 코드 매핑
window.CHAR_TO_KEY = {};
window.KEYBOARD_ROWS.forEach(row => {
  row.forEach(k => {
    if (k.isModifier) return;
    if (k.en.length === 1) {
      window.CHAR_TO_KEY[k.en.toLowerCase()] = { code: k.code, shift: false };
      if (k.en.toUpperCase() !== k.en.toLowerCase()) {
        window.CHAR_TO_KEY[k.en.toUpperCase()] = { code: k.code, shift: true };
      }
    }
    if (k.enShift && k.enShift.length === 1 && k.enShift !== k.en) {
      window.CHAR_TO_KEY[k.enShift] = { code: k.code, shift: true };
    }
  });
});
window.CHAR_TO_KEY[' '] = { code: 'Space', shift: false };

/**
 * 한 글자(한글 완성형, 자모, 영문, 기호)를 입력하기 위한 물리 키 시퀀스 배열 반환
 */
window.decomposeCharToKeyStrokes = function(ch) {
  if (!ch) return [];
  if (ch === ' ') return [{ code: 'Space', shift: false, char: ' ' }];
  if (ch === '\n') return [{ code: 'Enter', shift: false, char: '\n' }];
  if (ch === '\t') return [{ code: 'Tab', shift: false, char: '\t' }];

  const code = ch.charCodeAt(0);
  // 한글 완성형 (가 ~ 힣)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const offset = code - 0xAC00;
    const choIdx = Math.floor(offset / (21 * 28));
    const jungIdx = Math.floor((offset % (21 * 28)) / 28);
    const jongIdx = offset % 28;

    const strokes = [];
    const cho = CHO_LIST[choIdx];
    const jung = JUNG_LIST[jungIdx];
    const jong = JONG_LIST[jongIdx];

    if (window.KO_JAMO_TO_KEYS[cho]) {
      window.KO_JAMO_TO_KEYS[cho].forEach(s => strokes.push({ ...s, jamo: cho }));
    }
    if (window.KO_JAMO_TO_KEYS[jung]) {
      window.KO_JAMO_TO_KEYS[jung].forEach(s => strokes.push({ ...s, jamo: jung }));
    }
    if (jong && window.KO_JAMO_TO_KEYS[jong]) {
      window.KO_JAMO_TO_KEYS[jong].forEach(s => strokes.push({ ...s, jamo: jong }));
    }
    return strokes;
  }

  // 한글 단일 자모 (ㄱ ~ ㅣ)
  if (window.KO_JAMO_TO_KEYS[ch]) {
    return window.KO_JAMO_TO_KEYS[ch].map(s => ({ ...s, jamo: ch }));
  }

  // 영문 및 숫자/기호
  if (window.CHAR_TO_KEY[ch]) {
    return [{ ...window.CHAR_TO_KEY[ch], char: ch }];
  }

  return [{ code: 'Space', shift: false, char: ch }];
};

// 타자 연습 데이터셋
window.PRACTICE_DATASETS = {
  ko: {
    position_home: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    position_top: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    position_bottom: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
    position_all: ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ','ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
    words: [
      '바다', '하늘', '우주', '컴퓨터', '키보드', '반응속도', '손가락', '연습', '프로그래밍',
      '알고리즘', '은하수', '별자리', '무지개', '소나기', '도서관', '커피숍', '자전거',
      '인공지능', '클라우드', '네트워크', '데이터', '인터페이스', '애니메이션', '집중력',
      '순발력', '정확도', '타이핑', '기계식', '사운드', '리듬감', '도전정신', '성취감'
    ],
    prog_words: [
      '변수선언', '함수호출', '매개변수', '반환값', '조건문', '반복문', '객체지향', '클래스',
      '인터페이스', '비동기처리', '예외처리', '자료구조', '알고리즘', '배열인덱스', '스택큐',
      '해시맵', '이진트리', '동적할당', '가비지컬렉션', '메모리누수', '네트워크', '데이터베이스',
      '클라이언트', '서버통신', '엔드포인트', '응답코드', '인증인가', '토큰기반', '컴포넌트', '상태관리'
    ],
    // 한국 문학 명작 명구절 (짧은 글 연습용)
    literature: [
      // 소설 (novel)
      { title: '메밀꽃 필 무렵', author: '이효석', category: 'novel', text: '산허리는 온통 메밀밭이어서 피기 시작한 꽃이 소금을 뿌린 듯이 흐뭇한 달빛에 숨이 막힐 지경이다.' },
      { title: '메밀꽃 필 무렵', author: '이효석', category: 'novel', text: '달밤이었으나 어떻게 해서 그렇게 되었는지 지금 생각해 보아도 도무지 알 수가 없었다.' },
      { title: '날개', author: '이상', category: 'novel', text: '박제가 되어버린 천재를 아시오? 나는 유쾌하오. 이런 때 연애까지가 유쾌하오.' },
      { title: '날개', author: '이상', category: 'novel', text: '날개야 다시 돋아라. 날자. 날자. 한 번만 더 날자꾸나. 한 번만 더 날아보자꾸나.' },
      { title: '소나기', author: '황순원', category: 'novel', text: '소녀는 개울가에서 개울물을 움켜쥐고 얼굴을 씻는 소년의 모습을 가만히 지켜보았다.' },
      { title: '소나기', author: '황순원', category: 'novel', text: '소녀가 건네준 조약돌을 주머니에 넣고 만지작거리며 소년은 얼굴이 붉어졌다.' },
      { title: '동백꽃', author: '김유정', category: 'novel', text: '오늘도 또 우리 수탉이 짓밟히었다. 내가 점심을 먹고 나무를 하러 가려던 참이었다.' },
      { title: '봄·봄', author: '김유정', category: 'novel', text: '장인님! 인제 저 나이도 찼으니 장가를 들여주셔야 하지 않겠습니까.' },
      { title: '운수 좋은 날', author: '현진건', category: 'novel', text: '괴상하게도 오늘은 운수가 좋더니만, 설렁탕을 사다 놓았는데 왜 먹지를 못하니.' },
      { title: '난장이가 쏘아올린 작은 공', author: '조세희', category: 'novel', text: '사람들은 사랑이 없는 욕망만 갖고 있었습니다. 그래서 아무도 사랑을 갖지 못했습니다.' },

      // 시 (poem)
      { title: '서시', author: '윤동주', category: 'poem', text: '죽는 날까지 하늘을 우러러 한 점 부끄럼이 없기를, 잎새에 이는 바람에도 나는 괴로워했다.' },
      { title: '서시', author: '윤동주', category: 'poem', text: '별을 노래하는 마음으로 모든 죽어가는 것을 사랑해야지. 그리고 나한테 주어진 길을 걸어가야겠다.' },
      { title: '별 헤는 밤', author: '윤동주', category: 'poem', text: '별 하나에 추억과 별 하나에 사랑과 별 하나에 쓸쓸함과 별 하나에 동경과 별 하나에 시와.' },
      { title: '별 헤는 밤', author: '윤동주', category: 'poem', text: '가슴속에 하나 둘 새겨지는 별을 이제 다 못 헤는 것은 쉬이 아침이 오는 까닭이요.' },
      { title: '진달래꽃', author: '김소월', category: 'poem', text: '나 보기가 역겨워 가실 때에는 말없이 고이 보내 드리우리다.' },
      { title: '진달래꽃', author: '김소월', category: 'poem', text: '가시는 걸음 걸음 놓인 그 꽃을 사뿐히 즈려밟고 가시옵소서.' },
      { title: '향수', author: '정지용', category: 'poem', text: '넓은 벌 동쪽 끝으로 옛이야기 지줄대는 실개천이 휘돌아 나가고, 얼룩백이 황소가 해설피 금빛 게으른 울음을 우는 곳.' },
      { title: '나와 나타샤와 흰 당나귀', author: '백석', category: 'poem', text: '가난한 내가 아름다운 나타샤를 사랑해서 오늘밤은 푹푹 눈이 나린다.' },
      { title: '나와 나타샤와 흰 당나귀', author: '백석', category: 'poem', text: '눈은 푹푹 나리고 아름다운 나타샤는 나를 사랑하고 어디서 흰 당나귀도 오늘밤이 좋아서 응앙응앙 울을 것이다.' },
      { title: '님의 침묵', author: '한용운', category: 'poem', text: '님은 갔습니다. 아아, 사랑하는 나의 님은 갔습니다.' },
      { title: '청포도', author: '이육사', category: 'poem', text: '내 고장 칠월은 청포도가 익어가는 시절. 이 마을 전설이 주저리주저리 열리고.' },
      { title: '나그네', author: '박목월', category: 'poem', text: '강나루 건너서 밀밭 길을 구름에 달 가듯이 가는 나그네.' },
      { title: '풀꽃', author: '나태주', category: 'poem', text: '자세히 보아야 예쁘다. 오래 보아야 사랑스럽다. 너도 그렇다.' },

      // 수필 / 고전 (essay)
      { title: '인연', author: '피천득', category: 'essay', text: '그리워하는데도 한 번 만나고는 못 만나게 되기도 하고, 일생을 못 잊으면서도 아니 만나고 살기도 한다.' },
      { title: '인연', author: '피천득', category: 'essay', text: '세 번째는 아니 만났어야 좋았을 것이다.' },
      { title: '무소유', author: '법정', category: 'essay', text: '우리는 필요에 의해 물건을 갖지만, 때로는 그 물건 때문에 마음이 쓰이게 된다.' },
      { title: '신록예찬', author: '이양하', category: 'essay', text: '봄이 주는 신록의 싱싱함은 바라보는 것만으로도 온 마음에 젊음을 불어넣는다.' }
    ]
  },
  en: {
    position_home: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    position_top: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    position_bottom: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    position_all: ['A','S','D','F','G','H','J','K','L',';','Q','W','E','R','T','Y','U','I','O','P','Z','X','C','V','B','N','M'],
    // 일반 단어
    words: [
      'reflex', 'keyboard', 'velocity', 'accuracy', 'finger', 'practice', 'rhythm',
      'quantum', 'horizon', 'dynamic', 'cascade', 'spectrum', 'terminal', 'serenity',
      'synergy', 'momentum', 'precision', 'reaction', 'champion', 'nebula', 'journey',
      'freedom', 'victory', 'harmony', 'silence', 'inspire', 'explore', 'courage'
    ],
    // 프로그래밍에서 가장 빈번하게 쓰이는 영단어 (키워드, 표준 식별자, 패턴)
    prog_words: [
      // 핵심 키워드 & 제어문
      'function', 'return', 'async', 'await', 'import', 'export', 'default', 'const', 'let', 'var',
      'class', 'interface', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly',
      'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'switch', 'case', 'break', 'continue',
      'yield', 'struct', 'enum', 'package', 'namespace', 'typedef', 'template', 'nullptr', 'boolean',
      // 웹 & JavaScript / TypeScript
      'console.log', 'document', 'window', 'localStorage', 'sessionStorage', 'addEventListener',
      'querySelector', 'getElementById', 'innerHTML', 'textContent', 'preventDefault', 'stopPropagation',
      'JSON.stringify', 'JSON.parse', 'Promise.all', 'Promise.resolve', 'setTimeout', 'setInterval',
      'clearTimeout', 'clearInterval', 'undefined', 'null', 'prototype', 'constructor',
      // 배열 및 객체 메서드
      'filter', 'reduce', 'forEach', 'includes', 'indexOf', 'length', 'toString', 'substring',
      'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'entries', 'values', 'keys', 'concat',
      // 프레임워크 & 상태 관리 (React, Vue, Node)
      'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'component',
      'props', 'payload', 'reducer', 'dispatch', 'middleware', 'controller', 'service', 'repository',
      // 백엔드, 네트워크, 데이터베이스
      'request', 'response', 'headers', 'status', 'endpoint', 'database', 'authenticate', 'authorize',
      'session', 'cookie', 'token', 'bearer', 'websocket', 'graphql', 'restful', 'migration',
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'WHERE', 'ORDER_BY', 'GROUP_BY', 'LIMIT', 'OFFSET',
      // 인프라, 툴 & 아키텍처
      'docker', 'kubernetes', 'pipeline', 'deployment', 'repository', 'branch', 'checkout', 'commit',
      'rebase', 'merge', 'cherry-pick', 'singleton', 'observer', 'factory', 'decorator', 'generator'
    ],
    // 영미 문학 명작 명구절 (짧은 글 연습용)
    literature: [
      // 소설 (novel)
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'novel', text: 'So we beat on, boats against the current, borne back ceaselessly into the past.' },
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'novel', text: 'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since.' },
      { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', category: 'novel', text: 'Man is not made for defeat. A man can be destroyed but not defeated.' },
      { title: '1984', author: 'George Orwell', category: 'novel', text: 'War is peace. Freedom is slavery. Ignorance is strength.' },
      { title: 'A Tale of Two Cities', author: 'Charles Dickens', category: 'novel', text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.' },
      { title: 'Moby-Dick', author: 'Herman Melville', category: 'novel', text: 'Call me Ishmael. Some years ago, having little or no money in my purse, I thought I would sail about a little.' },
      { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'novel', text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.' },
      { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'novel', text: 'You never really understand a person until you consider things from his point of view.' },
      { title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'novel', text: 'Don\'t ever tell anybody anything. If you do, you start missing everybody.' },
      { title: 'Frankenstein', author: 'Mary Shelley', category: 'novel', text: 'Beware; for I am fearless, and therefore powerful.' },
      { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', category: 'novel', text: 'The only way to get rid of a temptation is to yield to it.' },

      // 시 (poem)
      { title: 'The Road Not Taken', author: 'Robert Frost', category: 'poem', text: 'Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.' },
      { title: 'Stopping by Woods', author: 'Robert Frost', category: 'poem', text: 'The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep.' },
      { title: 'The Tyger', author: 'William Blake', category: 'poem', text: 'Tyger Tyger, burning bright, in the forests of the night; what immortal hand or eye, could frame thy fearful symmetry?' },
      { title: 'Hope is the Thing with Feathers', author: 'Emily Dickinson', category: 'poem', text: 'Hope is the thing with feathers that perches in the soul and sings the tune without the words.' },
      { title: 'Ode on a Grecian Urn', author: 'John Keats', category: 'poem', text: 'Beauty is truth, truth beauty, that is all ye know on earth, and all ye need to know.' },
      { title: 'O Captain! My Captain!', author: 'Walt Whitman', category: 'poem', text: 'O Captain! my Captain! our fearful trip is done, the ship has weather\'d every rack, the prize we sought is won.' },
      { title: 'Do Not Go Gentle', author: 'Dylan Thomas', category: 'poem', text: 'Do not go gentle into that good night. Rage, rage against the dying of the light.' },

      // 희곡 & 에세이 (essay)
      { title: 'Hamlet', author: 'William Shakespeare', category: 'essay', text: 'To be, or not to be, that is the question: whether it is nobler in the mind to suffer the slings and arrows of outrageous fortune.' },
      { title: 'As You Like It', author: 'William Shakespeare', category: 'essay', text: 'All the world\'s a stage, and all the men and women merely players: they have their exits and their entrances.' },
      { title: 'Romeo and Juliet', author: 'William Shakespeare', category: 'essay', text: 'What\'s in a name? That which we call a rose by any other name would smell as sweet.' },
      { title: 'Walden', author: 'Henry David Thoreau', category: 'essay', text: 'I went to the woods because I wished to live deliberately, to front only the essential facts of life.' },
      { title: 'Self-Reliance', author: 'Ralph Waldo Emerson', category: 'essay', text: 'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.' },
      { title: 'A Room of One\'s Own', author: 'Virginia Woolf', category: 'essay', text: 'A woman must have money and a room of her own if she is to write fiction.' }
    ],
    // 특수문자 및 기호가 포함된 프로그래밍 실무 유명 코드 스니펫
    code_snippets: [
      // JavaScript / TypeScript / React
      { lang: 'JavaScript', text: 'console.log("Hello, World!");' },
      { lang: 'TypeScript', text: 'const [count, setCount] = useState<number>(0);' },
      { lang: 'JavaScript', text: 'const sum = numbers.reduce((acc, cur) => acc + cur, 0);' },
      { lang: 'TypeScript', text: 'const filtered = items.filter(item => item.id !== targetId);' },
      { lang: 'JavaScript', text: 'const response = await fetch("/api/v1/users", { method: "GET" });' },
      { lang: 'JavaScript', text: 'const debounce = (fn, delay = 300) => { let timer; return (...args) => {}; };' },
      { lang: 'TypeScript', text: 'interface UserProfile { id: string; email: string; isActive: boolean; }' },
      { lang: 'JavaScript', text: 'const { name, age, role = "guest" } = user?.data ?? {};' },
      { lang: 'TypeScript', text: 'export const useTheme = () => useContext(ThemeContext) ?? "dark";' },
      { lang: 'JavaScript', text: 'document.querySelector("#btn-submit")?.addEventListener("click", handleClick);' },
      { lang: 'JavaScript', text: 'const clone = JSON.parse(JSON.stringify(originalObject));' },
      { lang: 'JavaScript', text: 'useEffect(() => { const timer = setInterval(tick, 1000); return () => clearInterval(timer); }, []);' },
      { lang: 'TypeScript', text: 'type Result<T> = { success: true; data: T } | { success: false; error: Error };' },
      { lang: 'JavaScript', text: 'const url = `https://api.github.com/users/${username}/repos?sort=updated`;' },
      { lang: 'TypeScript', text: 'const isValid = (value: unknown): value is string => typeof value === "string";' },

      // Python
      { lang: 'Python', text: 'print("Hello, World!")' },
      { lang: 'Python', text: 'def calculate_average(scores: list[float]) -> float: return sum(scores) / len(scores)' },
      { lang: 'Python', text: 'squares = [x**2 for x in range(20) if x % 2 == 0]' },
      { lang: 'Python', text: 'with open("config.json", "r", encoding="utf-8") as f: data = json.load(f)' },
      { lang: 'Python', text: '@dataclass class Point: x: float = 0.0; y: float = 0.0' },
      { lang: 'Python', text: 'async def fetch_item(session: aiohttp.ClientSession, item_id: int) -> dict:' },
      { lang: 'Python', text: 'if __name__ == "__main__": main()' },
      { lang: 'Python', text: 'scores = {k: v for k, v in raw_data.items() if v >= threshold}' },
      { lang: 'Python', text: 'logging.info(f"Connected to database at {host}:{port} successfully.")' },

      // C / C++
      { lang: 'C', text: '#include <stdio.h> int main(void) { printf("Hello, World!\\n"); return 0; }' },
      { lang: 'C++', text: '#include <iostream> int main() { std::cout << "Hello, World!" << std::endl; return 0; }' },
      { lang: 'C++', text: 'for (int i = 0; i < n; ++i) { sum += arr[i] * 2; }' },
      { lang: 'C++', text: 'std::vector<std::string> tokens = split(input_line, ",");' },
      { lang: 'C++', text: 'auto it = std::find_if(vec.begin(), vec.end(), [](int x) { return x > 10; });' },
      { lang: 'C++', text: 'std::unique_ptr<Socket> sock = std::make_unique<Socket>("127.0.0.1", 8080);' },
      { lang: 'C', text: 'char* buffer = (char*)malloc(sizeof(char) * BUFFER_SIZE);' },

      // Rust / Go
      { lang: 'Rust', text: 'fn main() { println!("Hello, world!"); }' },
      { lang: 'Rust', text: 'let mut scores: HashMap<String, u32> = HashMap::new();' },
      { lang: 'Rust', text: 'match result { Ok(val) => println!("{}", val), Err(e) => eprintln!("{}", e) }' },
      { lang: 'Rust', text: 'fn process_buffer(buf: &[u8]) -> Result<usize, std::io::Error> { Ok(buf.len()) }' },
      { lang: 'Go', text: 'if err != nil { log.Fatalf("failed to execute query: %v", err) }' },
      { lang: 'Go', text: 'func handleRequest(w http.ResponseWriter, r *http.Request) { fmt.Fprintf(w, "OK") }' },

      // HTML / CSS / SQL
      { lang: 'HTML', text: '<button type="submit" className="btn btn-primary" onClick={handleClick}>Save</button>' },
      { lang: 'CSS', text: '.container { display: flex; align-items: center; justify-content: space-between; gap: 12px; }' },
      { lang: 'SQL', text: 'SELECT u.id, u.email, COUNT(p.id) AS posts FROM users u LEFT JOIN posts p ON u.id = p.user_id GROUP BY u.id;' },
      { lang: 'SQL', text: 'INSERT INTO products (name, price, stock) VALUES ("Mechanical Keyboard", 129000, 50);' }
    ]
  }
};
