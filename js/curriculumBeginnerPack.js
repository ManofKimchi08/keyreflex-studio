/**
 * KeyReflex CodeLab - Pack 1: 초보자 전반 기초 커리큘럼 (30문제: JS +9, Python +9, C99 +8, Spec +4)
 * - 100% 오리지널 자체 설계 문제 · 전 문항 Flow / Skeleton / Sandbox / AI 리뷰 지원
 */
(function (global) {
  'use strict';

  const curr = global.CODE_CURRICULUM;
  if (!curr) return;

  // =========================================================================
  // 1. JavaScript 기초 9문제 (level: 'beginner', tier: 1)
  // =========================================================================
  curr.javascript.push(
    {
      id: 'js_beg_clamp_number',
      title: '숫자 범위 제한 (Clamp Min-Max)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: 'Math.min과 Math.max를 조합해 입력 숫자 val을 [min, max] 허용 구간 안으로 안전하게 고정합니다.',
      explanation: {
        summary: '하한(min) 미만 값은 min으로 끌어올리고 상한(max) 초과 값은 max로 잘라내는 1줄 표준 클램핑 패턴입니다.',
        keyConcepts: ['Math.max / Math.min', 'Range Clamping', '경계값 보존', 'O(1) 산술'],
        lineByLine: [
          { line: 1, code: 'function clampNumber(val, min, max) {', explain: '원본 숫자 val과 하한 min, 상한 max를 입력받습니다.' },
          { line: 2, code: '    return Math.min(max, Math.max(min, val));', explain: '먼저 val을 min 이상으로 맞춘 뒤 다시 max 이하로 제한해 반환합니다.' },
          { line: 3, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '고정된 두 번의 비교 연산만 수행합니다.', space: 'O(1)', spaceWhy: '추가 메모리를 할당하지 않습니다.' },
        pitfalls: ['Math.min과 Math.max를 둘 다 쓰지 않고 한쪽만 적용하면 반대쪽 극단값이 통과해 UI 레이아웃이나 점수 계산이 깨집니다.']
      },
      audit: {
        bugSummary: 'AI가 하한 보정(Math.max)을 빼먹어 음수 입력(-20)이 최솟값 0으로 올라오지 않고 그대로 통과합니다.',
        checklist: ['Math.max(min, val) 하한 검사 확인', 'Math.min(max, ...) 상한 검사 확인'],
        focusLine: 2,
        buggyCode: `function clampNumber(val, min, max) {
    return Math.min(max, val);
}`
      },
      entryPoint: 'clampNumber',
      code: `function clampNumber(val, min, max) {
    return Math.min(max, Math.max(min, val));
}`,
      skeleton: `function clampNumber(val, min, max) {
    return Math.min(max, ____);
}`,
      tests: [
        { input: [50, 0, 100], expected: 50, name: '정상 구간 값 유지' },
        { input: [-20, 0, 100], expected: 0, name: '하한 미만(0) 보정' },
        { input: [150, 0, 100], expected: 100, name: '상한 초과(100) 보정' },
        { input: [0, 0, 100], expected: 0, name: '경계값 0 그대로 유지' }
      ]
    },
    {
      id: 'js_beg_reverse_words',
      title: '문장 단어 순서 뒤집기 (공백 정규화)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'String',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '앞뒤 및 중간 연속 공백을 정규화해 단어 순서를 거꾸로 조립합니다.',
      explanation: {
        summary: 'trim()과 정규식 /\\s+/ 분할을 사용해 연속 공백이 빈 토큰을 만들지 않도록 막고 단어 배열을 역순 결합합니다.',
        keyConcepts: ['String.prototype.trim()', '정규식 분할 /\\s+/', 'Array.reverse().join()', '빈 문자열 가드'],
        lineByLine: [
          { line: 1, code: 'function reverseWords(text) {', explain: '원본 문장 문자열 text를 입력받습니다.' },
          { line: 2, code: '    const trimmed = text.trim();', explain: '양쪽 끝의 불필요한 공백을 먼저 제거합니다.' },
          { line: 3, code: "    if (!trimmed) return '';", explain: '공백만 있거나 빈 문자열이면 즉시 빈 문자열을 반환합니다.' },
          { line: 4, code: "    return trimmed.split(/\\s+/).reverse().join(' ');", explain: '하나 이상의 공백 기준으로 나눈 단어 배열을 뒤집어 공백 1칸으로 연결합니다.' },
          { line: 5, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열 길이 N에 비례해 분할·뒤집기·결합을 수행합니다.', space: 'O(N)', spaceWhy: '단어 토큰 배열과 결과 문자열을 생성합니다.' },
        pitfalls: ["split(' ')만 쓰면 'a  b'처럼 공백이 두 칸일 때 중간에 빈 문자열('')이 끼어들어 출력이 틀어집니다."]
      },
      audit: {
        bugSummary: "AI가 split(' ') 단일 공백 문자열 분할을 사용해 연속 공백 입력 시 빈 요소가 섞입니다.",
        checklist: ['정규식 /\\s+/ 연속 공백 분리 확인', 'trim() 및 빈 입력 가드 확인'],
        focusLine: 4,
        buggyCode: `function reverseWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return '';
    return trimmed.split(' ').reverse().join(' ');
}`
      },
      entryPoint: 'reverseWords',
      code: `function reverseWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return '';
    return trimmed.split(/\\s+/).reverse().join(' ');
}`,
      skeleton: `function reverseWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return '';
    return trimmed.split(____).reverse().join(' ');
}`,
      tests: [
        { input: ['  hello   world  js '], expected: 'js world hello', name: '연속·앞뒤 공백 정규화' },
        { input: ['single'], expected: 'single', name: '단일 단어 처리' },
        { input: ['   '], expected: '', name: '공백 전용 입력 안전 반환' }
      ]
    },
    {
      id: 'js_beg_unique_array',
      title: 'Set을 이용한 배열 중복 제거 (순서 유지)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: 'ES6 Set의 삽입 순서 유지와 O(1) 중복 판별을 활용해 처음 등장한 순서대로 중복을 제거합니다.',
      explanation: {
        summary: 'JavaScript의 Set은 중복을 자동 제거하면서도 요소가 처음 들어온 순서를 그대로 보존하므로 전개 연산자([...new Set(items)])로 깔끔하게 중복을 없앱니다.',
        keyConcepts: ['ES6 Set 컬렉션', '삽입 순서 보존', '전개 구문 (...)', 'O(N) 중복 제거'],
        lineByLine: [
          { line: 1, code: 'function uniqueValues(items) {', explain: '중복이 포함될 수 있는 배열 items를 입력받습니다.' },
          { line: 2, code: '    return [...new Set(items)];', explain: 'Set으로 중복을 제거한 뒤 스프레드 연산자로 새 배열로 변환해 반환합니다.' },
          { line: 3, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개 원소를 해시 기반 Set에 한 번씩 삽입합니다.', space: 'O(N)', spaceWhy: '고유 원소를 담은 새 Set 및 배열을 생성합니다.' },
        pitfalls: ['배열을 먼저 sort()한 뒤 인접 비교로 중복을 빼면 원래 등장 순서가 망가지고 O(N log N) 시간이 걸립니다.']
      },
      audit: {
        bugSummary: 'AI가 new Set만 만들고 다시 빈 배열로 잘못 반환하거나 전개 변환을 빠뜨려 원본 순서 고유 배열이 나오지 않습니다.',
        checklist: ['[...new Set(items)] 배열 반환 확인', '빈 배열 [] 처리 확인'],
        focusLine: 2,
        buggyCode: `function uniqueValues(items) {
    return items.slice(0, 1);
}`
      },
      entryPoint: 'uniqueValues',
      code: `function uniqueValues(items) {
    return [...new Set(items)];
}`,
      skeleton: `function uniqueValues(items) {
    return [____];
}`,
      tests: [
        { input: [[3, 1, 3, 2, 1, 4]], expected: [3, 1, 2, 4], name: '첫 등장 순서 유지하며 중복 제거' },
        { input: [['a', 'b', 'a']], expected: ['a', 'b'], name: '문자열 중복 제거' },
        { input: [[]], expected: [], name: '빈 배열 처리' }
      ]
    },
    {
      id: 'js_beg_capitalize_title',
      title: '제목 대소문자 변환 (Title Case)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'String',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '각 단어의 첫 글자만 대문자로, 나머지 글자는 모두 소문자로 변환하는 Title Case 포매터를 작성합니다.',
      explanation: {
        summary: '문자열을 단어로 나눈 뒤 w[0].toUpperCase() + w.slice(1).toLowerCase()로 매핑해 혼합 대소문자 텍스트를 정규화합니다.',
        keyConcepts: ['toUpperCase() / toLowerCase()', 'String.slice(1)', 'Array.prototype.map', '빈 문자열 방어'],
        lineByLine: [
          { line: 1, code: 'function toTitleCase(text) {', explain: '정규화할 제목 문자열 text를 입력받습니다.' },
          { line: 2, code: '    const clean = text.trim();', explain: '앞뒤 여백을 먼저 제거합니다.' },
          { line: 3, code: "    if (!clean) return '';", explain: '빈 입력이면 split 시 빈 요소가 생기지 않게 즉시 반환합니다.' },
          { line: 4, code: '    return clean', explain: '공백 분리 · 단어 변환 · 결합 파이프라인을 시작합니다.' },
          { line: 5, code: '        .split(/\\s+/)', explain: '연속 공백을 하나의 구분자로 삼아 단어 배열로 나눕니다.' },
          { line: 6, code: '        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())', explain: '각 단어의 첫 글자는 대문자로, 나머지 문자는 소문자로 맞춥니다.' },
          { line: 7, code: "        .join(' ');", explain: '변환된 단어들을 공백으로 연결해 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '전체 문자 길이 N을 1회 순회하며 대소문자 변환합니다.', space: 'O(N)', spaceWhy: '새 제목 문자열 길이만큼 공간을 사용합니다.' },
        pitfalls: ['w.slice(1).toLowerCase()를 빠뜨리면 "wORLD"가 "WORLD"로 남아 Title Case 규칙을 어기게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 나머지 글자 소문자화(.toLowerCase())를 빠뜨려 "hELLO wORLD"에서 뒷 글자들이 대문자로 남습니다.',
        checklist: ['첫 글자 toUpperCase() + 나머지 slice(1).toLowerCase() 확인', '빈 문자열 가드 확인'],
        focusLine: 6,
        buggyCode: `function toTitleCase(text) {
    const clean = text.trim();
    if (!clean) return '';
    return clean
        .split(/\\s+/)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ');
}`
      },
      entryPoint: 'toTitleCase',
      code: `function toTitleCase(text) {
    const clean = text.trim();
    if (!clean) return '';
    return clean
        .split(/\\s+/)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}`,
      skeleton: `function toTitleCase(text) {
    const clean = text.trim();
    if (!clean) return '';
    return clean
        .split(/\\s+/)
        .map((w) => w[0].toUpperCase() + ____)
        .join(' ');
}`,
      tests: [
        { input: ['hELLO   wORLD'], expected: 'Hello World', name: '대소문자 뒤섞인 다중 공백 정리' },
        { input: ['KEYREFLEX studio'], expected: 'Keyreflex Studio', name: '모두 대문자 단어 정규화' },
        { input: [''], expected: '', name: '빈 문자열 안전 반환' }
      ]
    },
    {
      id: 'js_beg_matrix_row_sums',
      title: '2차원 배열 각 행의 합계 구하기',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Data Structure',
      complexity: { time: 'O(R * C)', space: 'O(R)' },
      description: '2차원 숫자 배열(Matrix)의 각 행(Row)마다 합계를 계산해 1차원 배열로 반환합니다.',
      explanation: {
        summary: 'Array.prototype.map으로 각 행을 순회하고, 내부에서 reduce((acc, v) => acc + v, 0)으로 합산해 빈 행도 0으로 안전하게 처리합니다.',
        keyConcepts: ['2차원 배열 순회', 'map + reduce 조합', '빈 행 초기값 0 방어', '불변 새 배열 반환'],
        lineByLine: [
          { line: 1, code: 'function rowSums(matrix) {', explain: '2차원 숫자 배열 matrix를 입력받습니다.' },
          { line: 2, code: '    return matrix.map((row) => row.reduce((acc, v) => acc + v, 0));', explain: '각 행(row)의 모든 원소를 0부터 누적합으로 축약한 새 배열을 반환합니다.' },
          { line: 3, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(R * C)', timeWhy: 'R개 행과 각 행 C개 원소를 모두 한 번씩 방문합니다.', space: 'O(R)', spaceWhy: '행 개수 R 크기의 결과 배열만 생성합니다.' },
        pitfalls: ['빈 행([])이 포함된 2차원 배열에서는 reduce에 초기값 0을 넘기지 않으면 TypeError가 발생합니다.']
      },
      audit: {
        bugSummary: 'AI가 reduce 초기값 0을 생략해 빈 행([])이 포함된 2차원 배열 처리 중 TypeError가 발생합니다.',
        checklist: ['reduce(..., 0) 초기값 명시 확인', '빈 행과 음수 행 처리 검증'],
        focusLine: 2,
        buggyCode: `function rowSums(matrix) {
    return matrix.map((row) => row.reduce((acc, v) => acc + v));
}`
      },
      entryPoint: 'rowSums',
      code: `function rowSums(matrix) {
    return matrix.map((row) => row.reduce((acc, v) => acc + v, 0));
}`,
      skeleton: `function rowSums(matrix) {
    return matrix.map((row) => ____);
}`,
      tests: [
        { input: [[[1, 2, 3], [4, 5], [-2, 10]]], expected: [6, 9, 8], name: '다양한 길이의 2차원 행 합계' },
        { input: [[[], [7]]], expected: [0, 7], name: '빈 행 포함 시 0 반환' },
        { input: [[]], expected: [], name: '빈 행렬 입력' }
      ]
    },
    {
      id: 'js_beg_is_anagram',
      title: '문자열 정규화 아나그램(Anagram) 판별',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'String',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: '공백과 대소문자를 무시하고 두 문자열을 구성하는 알파벳 구성이 같은지(아나그램) 판별합니다.',
      explanation: {
        summary: '정규화 헬퍼 normalize를 통해 공백 제거·소문자 변환 후 문자를 사전순 정렬한 문자열을 비교합니다.',
        keyConcepts: ['아나그램 (Anagram)', '내부 normalize 헬퍼', 'split().sort().join()', '정규식 공백 제거'],
        lineByLine: [
          { line: 1, code: 'function isAnagram(a, b) {', explain: '비교할 두 문자열 a와 b를 입력받습니다.' },
          { line: 2, code: "    const normalize = (s) => s.toLowerCase().replace(/\\s+/g, '').split('').sort().join('');", explain: '소문자 변환·공백 제거·문자 배열 정렬 후 다시 결합하는 정규화 함수입니다.' },
          { line: 3, code: '    return normalize(a) === normalize(b);', explain: '정규화된 두 문자열이 완전히 일치하면 아나그램(true)을 반환합니다.' },
          { line: 4, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: '문자 배열 정렬(sort) 비용이 지배적입니다.', space: 'O(N)', spaceWhy: '정규화 및 정렬된 문자 배열 크기만큼 공간을 씁니다.' },
        pitfalls: ['공백 제거(/\\s+/g) 없이 비교하면 "Dormitory"와 "Dirty room"처럼 띄어쓰기 수가 다른 구문 아나그램을 놓칩니다.']
      },
      audit: {
        bugSummary: 'AI가 공백 제거와 소문자 정규화 없이 바로 정렬 비교해 공백 차이가 있는 아나그램이 false로 실패합니다.',
        checklist: ['소문자(.toLowerCase()) 및 공백 제거(/\\s+/g) 확인', '정렬 후 문자열 동등 비교'],
        focusLine: 2,
        buggyCode: `function isAnagram(a, b) {
    const normalize = (s) => s.split('').sort().join('');
    return normalize(a) === normalize(b);
}`
      },
      entryPoint: 'isAnagram',
      code: `function isAnagram(a, b) {
    const normalize = (s) => s.toLowerCase().replace(/\\s+/g, '').split('').sort().join('');
    return normalize(a) === normalize(b);
}`,
      skeleton: `function isAnagram(a, b) {
    const normalize = (s) => ____;
    return normalize(a) === normalize(b);
}`,
      tests: [
        { input: ['Listen', 'Silent'], expected: true, name: '대소문자 혼합 아나그램' },
        { input: ['Dormitory', 'Dirty room'], expected: true, name: '공백 수 다른 구문 아나그램' },
        { input: ['hello', 'world'], expected: false, name: '서로 다른 문자열 거짓' }
      ]
    },
    {
      id: 'js_beg_chunk_array',
      title: '배열 고정 크기(Size) 청크 분할기',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Array',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '배치 API 전송이나 그리드 UI 렌더링을 위해 1차원 배열을 size 개씩 묶은 2차원 배열로 나눕니다.',
      explanation: {
        summary: 'size <= 0 경계를 방어한 뒤 i += size 간격으로 slice(i, i + size) 조각을 순서대로 모읍니다.',
        keyConcepts: ['Array.prototype.slice', 'i += size 보폭 전진', 'size <= 0 무한루프 방어', '배치 분할'],
        lineByLine: [
          { line: 1, code: 'function chunkArray(arr, size) {', explain: '원본 배열 arr과 묶음 크기 size를 입력받습니다.' },
          { line: 2, code: '    if (size <= 0) return [];', explain: '0 이하 크기로 인해 for 루프가 무한 반복되는 것을 막습니다.' },
          { line: 3, code: '    const out = [];', explain: '분할된 부분 배열들을 담을 2차원 결과 배열입니다.' },
          { line: 4, code: '    for (let i = 0; i < arr.length; i += size) {', explain: '인덱스를 size 보폭만큼 건너뛰며 순회합니다.' },
          { line: 5, code: '        out.push(arr.slice(i, i + size));', explain: 'i부터 i + size 직전까지 잘라 새 청크 배열로 추가합니다.' },
          { line: 6, code: '    }', explain: '분할 루프를 닫습니다.' },
          { line: 7, code: '    return out;', explain: '완성된 청크 묶음 배열을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '배열의 모든 N개 원소를 slice를 통해 한 번씩 복사합니다.', space: 'O(N)', spaceWhy: '전체 원소를 나누어 담은 새 2차원 배열을 만듭니다.' },
        pitfalls: ['for (let i = 0; ...; i += size) 대신 i++를 쓰면 청크들이 전부 한 칸씩 겹쳐 잘못된 결과가 나옵니다.']
      },
      audit: {
        bugSummary: 'AI가 증감식에 i += size 대신 i++를 작성해 슬라이딩 윈도우처럼 중복 청크가 생성됩니다.',
        checklist: ['루프 보폭(i += size) 확인', 'size <= 0 가드 확인'],
        focusLine: 4,
        buggyCode: `function chunkArray(arr, size) {
    if (size <= 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i++) {
        out.push(arr.slice(i, i + size));
    }
    return out;
}`
      },
      entryPoint: 'chunkArray',
      code: `function chunkArray(arr, size) {
    if (size <= 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size));
    }
    return out;
}`,
      skeleton: `function chunkArray(arr, size) {
    if (size <= 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; ____) {
        out.push(arr.slice(i, ____));
    }
    return out;
}`,
      tests: [
        { input: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]], name: '나머지 원소 1개 마지막 청크 처리' },
        { input: [['a', 'b', 'c'], 5], expected: [['a', 'b', 'c']], name: 'size > 배열 길이 처리' },
        { input: [[1, 2, 3], 0], expected: [], name: 'size <= 0 무한루프 방어' }
      ]
    },
    {
      id: 'js_beg_refactor_ternary_status',
      title: '중첩 삼항 연산자 → HTTP 상태 테이블 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '읽기 어려운 중첩 삼항 연산자 사슬을 선언적 HTTP 상태 코드 조회 객체(Lookup Map)로 깔끔하게 리팩터링합니다.',
      refactoringGoal: '한 줄에 길게 늘어진 중첩 삼항 연산자(a ? x : b ? y : ...)를 키-값 조회 테이블과 Nullish 병합(??)으로 교체하세요.',
      refactoringBefore: `function httpStatusLabel(code) {
    return code === 200 ? 'OK' : code === 201 ? 'CREATED' : code === 400 ? 'BAD_REQUEST' : code === 401 ? 'UNAUTHORIZED' : code === 404 ? 'NOT_FOUND' : code === 500 ? 'SERVER_ERROR' : 'UNKNOWN';
}`,
      explanation: {
        summary: '복잡한 중첩 조건/삼항 분기를 객체 테이블 labels로 분리하고 Nullish 병합 연산자(??)로 미등록 코드를 UNKNOWN 처리합니다.',
        keyConcepts: ['Lookup Table 리팩터링', 'Nullish 병합 (??)', '가독성 향상', 'HTTP Status 매핑'],
        lineByLine: [
          { line: 1, code: 'function httpStatusLabel(code) {', explain: '정수 HTTP 상태 코드 code를 입력받습니다.' },
          { line: 2, code: '    const labels = {', explain: '상태 코드별 표준 라벨 매핑 객체를 정의합니다.' },
          { line: 3, code: "        200: 'OK', 201: 'CREATED',", explain: '2xx 성공 응답 코드를 등록합니다.' },
          { line: 4, code: "        400: 'BAD_REQUEST', 401: 'UNAUTHORIZED',", explain: '400·401 클라이언트 오류 코드를 등록합니다.' },
          { line: 5, code: "        404: 'NOT_FOUND', 500: 'SERVER_ERROR'", explain: '404와 500 서버 오류 코드를 등록합니다.' },
          { line: 6, code: '    };', explain: '룩업 테이블 객체를 닫습니다.' },
          { line: 7, code: "    return labels[code] ?? 'UNKNOWN';", explain: '일치하는 라벨을 O(1) 조회하고 없으면 UNKNOWN을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '고정 객체 키 조회 1회로 결과를 얻습니다.', space: 'O(1)', spaceWhy: '상수 크기 매핑 객체만 사용합니다.' },
        pitfalls: ['미등록 코드(418 등)에 대해 undefined가 반환되지 않도록 ?? "UNKNOWN" 기본 폴백을 반드시 두어야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 ?? "UNKNOWN" 기본 폴백을 빠져 미등록 코드(418) 입력 시 undefined를 반환합니다.',
        checklist: ["labels[code] ?? 'UNKNOWN' 폴백 확인", '6종 표준 HTTP 상태 코드 매핑 확인'],
        focusLine: 7,
        buggyCode: `function httpStatusLabel(code) {
    const labels = {
        200: 'OK', 201: 'CREATED',
        400: 'BAD_REQUEST', 401: 'UNAUTHORIZED',
        404: 'NOT_FOUND', 500: 'SERVER_ERROR'
    };
    return labels[code];
}`
      },
      entryPoint: 'httpStatusLabel',
      code: `function httpStatusLabel(code) {
    const labels = {
        200: 'OK', 201: 'CREATED',
        400: 'BAD_REQUEST', 401: 'UNAUTHORIZED',
        404: 'NOT_FOUND', 500: 'SERVER_ERROR'
    };
    return labels[code] ?? 'UNKNOWN';
}`,
      skeleton: `function httpStatusLabel(code) {
    const labels = {
        200: 'OK', 201: 'CREATED',
        400: 'BAD_REQUEST', 401: 'UNAUTHORIZED',
        404: 'NOT_FOUND', 500: 'SERVER_ERROR'
    };
    return ____;
}`,
      tests: [
        { input: [201], expected: 'CREATED', name: '201 CREATED 조회' },
        { input: [404], expected: 'NOT_FOUND', name: '404 NOT_FOUND 조회' },
        { input: [418], expected: 'UNKNOWN', name: '미등록 상태 코드 UNKNOWN 폴백' }
      ]
    },
    {
      id: 'js_beg_ai_token_estimate',
      title: 'LLM 입력 토큰 수 근사 추정기',
      tier: 1,
      level: 'beginner',
      track: 'ai',
      category: 'AI Basics',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '프롬프트 텍스트의 공백 정리 후 평균 4글자 = 1토큰 규칙(올림 Math.ceil)으로 LLM API 요청 전 토큰 예산을 추정합니다.',
      explanation: {
        summary: '임시 API 비용/길이 사전 체크를 위해 문자열 앞뒤 공백을 제거하고 빈 입력은 0, 그 외는 Math.ceil(clean.length / 4)를 반환합니다.',
        keyConcepts: ['LLM Token Budget 기초', 'Math.ceil 올림 계산', '빈 입력 0 반환 가드', 'trim()'],
        lineByLine: [
          { line: 1, code: 'function estimateTokens(text) {', explain: '프롬프트 문자열 text를 입력받습니다.' },
          { line: 2, code: "    const clean = (text || '').trim();", explain: 'null/undefined 입력도 안전하게 빈 문자열로 다루고 양쪽 공백을 제거합니다.' },
          { line: 3, code: '    if (!clean) return 0;', explain: '빈 문자열이나 공백 전용 입력은 0토큰으로 처리합니다.' },
          { line: 4, code: '    return Math.ceil(clean.length / 4);', explain: '4글자당 1토큰 기준으로 올림해 최소 1토큰 이상을 보수적으로 추정합니다.' },
          { line: 5, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '양끝 공백 제거에 최대 문자열 길이만큼 선형 스캔합니다.', space: 'O(N)', spaceWhy: '정리된 문자열 사본 크기에 비례합니다.' },
        pitfalls: ['Math.floor(clean.length / 4)로 내림하면 3글자 짧은 프롬프트가 0토큰으로 계산되는 언더에스티메이트 버그가 납니다.']
      },
      audit: {
        bugSummary: 'AI가 Math.ceil 대신 Math.floor를 사용해 1~3글자 프롬프트가 0토큰으로 과소 추정됩니다.',
        checklist: ['Math.ceil(clean.length / 4) 올림 처리 확인', '빈 문자열/공백 입력 0 반환 확인'],
        focusLine: 4,
        buggyCode: `function estimateTokens(text) {
    const clean = (text || '').trim();
    if (!clean) return 0;
    return Math.floor(clean.length / 4);
}`
      },
      entryPoint: 'estimateTokens',
      code: `function estimateTokens(text) {
    const clean = (text || '').trim();
    if (!clean) return 0;
    return Math.ceil(clean.length / 4);
}`,
      skeleton: `function estimateTokens(text) {
    const clean = (text || '').trim();
    if (!clean) return 0;
    return ____;
}`,
      tests: [
        { input: ['Hi'], expected: 1, name: '짧은 2글자 입력 올림(1토큰)' },
        { input: ['KeyReflex'], expected: 3, name: '9글자 올림(3토큰)' },
        { input: ['   '], expected: 0, name: '공백 전용 입력 0토큰' }
      ]
    }
  );

  // =========================================================================
  // 2. Python 기초 9문제 (level: 'beginner', tier: 1)
  // =========================================================================
  curr.python.push(
    {
      id: 'py_beg_min_max_tuple',
      title: '단일 순회 최솟값 · 최댓값 [min, max] 구하기',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '정수 리스트를 한 번만 순회해 최솟값과 최댓값 쌍 [low, high]를 계산하며 빈 리스트도 안전하게 방어합니다.',
      explanation: {
        summary: '리스트의 첫 원소 nums[0]을 초기 최솟값·최댓값 기준으로 삼고 나머지 원소를 1회 순회하며 갱신하는 기초 탐색 패턴입니다.',
        keyConcepts: ['초기 기준값 nums[0]', '빈 리스트 가드', '단일 패스 (O(N))', '음수 안전 비교'],
        lineByLine: [
          { line: 1, code: 'def find_min_max(nums: list[int]) -> list[int]:', explain: '정수 리스트 nums를 받아 [최솟값, 최댓값] 리스트를 반환합니다.' },
          { line: 2, code: '    if not nums:', explain: '빈 리스트가 입력되면 nums[0] 인덱스 에러를 막기 위해' },
          { line: 3, code: '        return []', explain: '빈 리스트 []를 즉시 반환합니다.' },
          { line: 4, code: '    low = high = nums[0]', explain: '첫 원소를 최솟값과 최댓값 초기값으로 동시에 설정해 음수 배열도 안전합니다.' },
          { line: 5, code: '    for x in nums[1:]:', explain: '두 번째 원소부터 마지막까지 차례로 순회합니다.' },
          { line: 6, code: '        if x < low:', explain: '현재 값이 기존 최솟값보다 작으면' },
          { line: 7, code: '            low = x', explain: '최솟값 low를 갱신합니다.' },
          { line: 8, code: '        elif x > high:', explain: '현재 값이 기존 최댓값보다 크면' },
          { line: 9, code: '            high = x', explain: '최댓값 high를 갱신합니다.' },
          { line: 10, code: '    return [low, high]', explain: '확정된 최솟값과 최댓값 쌍을 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '리스트 길이 N만큼 단 1회 순회하며 비교합니다.', space: 'O(1)', spaceWhy: '상수 크기 변수 low, high만 사용합니다.' },
        pitfalls: ['low = 0 또는 high = 0으로 시작하면 [-9, -2]처럼 음수만 있을 때 0이 섞여 오답이 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 high 초기값을 0으로 하드코딩해 음수 전용 리스트([-8, -3, -10])에서 최댓값으로 0을 잘못 반환합니다.',
        checklist: ['low = high = nums[0] 초기화 확인', '빈 리스트 [] 방어 확인'],
        focusLine: 4,
        buggyCode: `def find_min_max(nums: list[int]) -> list[int]:
    if not nums:
        return []
    low = nums[0]
    high = 0
    for x in nums[1:]:
        if x < low:
            low = x
        elif x > high:
            high = x
    return [low, high]`
      },
      entryPoint: 'find_min_max',
      code: `def find_min_max(nums: list[int]) -> list[int]:
    if not nums:
        return []
    low = high = nums[0]
    for x in nums[1:]:
        if x < low:
            low = x
        elif x > high:
            high = x
    return [low, high]`,
      skeleton: `def find_min_max(nums: list[int]) -> list[int]:
    if not nums:
        return []
    low = high = ____
    for x in nums[1:]:
        if x < low:
            low = x
        elif x > high:
            ____
    return [low, high]`,
      tests: [
        { input: [[4, 9, 1, 7]], expected: [1, 9], name: '양수 혼합 배열' },
        { input: [[-8, -3, -10]], expected: [-10, -3], name: '음수 전용 배열 안전 처리' },
        { input: [[]], expected: [], name: '빈 리스트 방어' }
      ]
    },
    {
      id: 'py_beg_remove_dups_order',
      title: 'set과 반복문으로 순서 유지 중복 제거',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: 'set을 방문 기록(seen)으로 활용해 리스트의 처음 등장 순서를 깨뜨리지 않고 중복을 O(N) 시간에 제거합니다.',
      explanation: {
        summary: 'list(set(items))는 순서를 섞어 버리므로 seen 집합으로 O(1) 조회하며 새 리스트 result에 순서대로 담습니다.',
        keyConcepts: ['set O(1) 멤버십 검사', '등장 순서 보존', 'seen 집합 패턴', 'O(N) 시간 복잡도'],
        lineByLine: [
          { line: 1, code: 'def dedup_keep_order(items: list) -> list:', explain: '중복 포함 리스트 items를 입력받습니다.' },
          { line: 2, code: '    seen = set()', explain: '이미 결과에 넣은 원소를 O(1)로 확인하기 위한 집합입니다.' },
          { line: 3, code: '    out = []', explain: '고유 원소를 첫 등장 순서대로 쌓을 결과 리스트입니다.' },
          { line: 4, code: '    for x in items:', explain: '입력 리스트의 모든 원소를 왼쪽부터 순회합니다.' },
          { line: 5, code: '        if x not in seen:', explain: '아직 등장한 적이 없는 새 원소일 때만' },
          { line: 6, code: '            seen.add(x)', explain: '방문 집합 seen에 기록하고' },
          { line: 7, code: '            out.append(x)', explain: '결과 리스트 끝에 추가합니다.' },
          { line: 8, code: '    return out', explain: '순서가 보존된 중복 제거 리스트를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개 원소마다 해시 집합 조회/삽입이 평균 O(1)입니다.', space: 'O(N)', spaceWhy: 'seen 집합과 출력 리스트를 유지합니다.' },
        pitfalls: ['sorted(set(items))는 원래 입력 순서가 아닌 정렬 순서를 반환하므로 등장 순서를 지킬 수 없습니다.']
      },
      audit: {
        bugSummary: 'AI가 sorted(list(set(items)))를 반환해 원래 등장 순서(["b", "a", "c"])를 알파벳 순(["a", "b", "c"])으로 망가뜨립니다.',
        checklist: ['seen 집합으로 첫 등장 순서 유지 확인', '빈 리스트 [] 안전 반환'],
        focusLine: 5,
        buggyCode: `def dedup_keep_order(items: list) -> list:
    return sorted(list(set(items)))`
      },
      entryPoint: 'dedup_keep_order',
      code: `def dedup_keep_order(items: list) -> list:
    seen = set()
    out = []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out`,
      skeleton: `def dedup_keep_order(items: list) -> list:
    seen = set()
    out = []
    for x in items:
        if x not in seen:
            ____
            out.append(x)
    return out`,
      tests: [
        { input: [['b', 'a', 'b', 'c', 'a']], expected: ['b', 'a', 'c'], name: '처음 등장 순서 유지' },
        { input: [[3, 3, 2, 1, 2]], expected: [3, 2, 1], name: '정수 리스트 중복 제거' },
        { input: [[]], expected: [], name: '빈 리스트 처리' }
      ]
    },
    {
      id: 'py_beg_flatten_2d',
      title: '중첩 리스트 컴프리헨션 2차원 평탄화(Flatten)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '2차원 리스트 grid를 이중 리스트 컴프리헨션으로 1차원 리스트로 펼칩니다.',
      explanation: {
        summary: '파이썬 이중 컴프리헨션 [x for row in grid for x in row]를 사용해 바깥 행 루프 → 안쪽 원소 루프 순서로 평탄화합니다.',
        keyConcepts: ['Nested List Comprehension', '2D -> 1D Flattening', '반복 순서 (for row -> for x)', '빈 행 자동 건너뛰기'],
        lineByLine: [
          { line: 1, code: 'def flatten_matrix(grid: list[list[int]]) -> list[int]:', explain: '2차원 정수 리스트 grid를 입력받습니다.' },
          { line: 2, code: '    return [x for row in grid for x in row]', explain: 'grid의 각 행을 순서대로 꺼낸 뒤 행 안의 원소 x를 차례로 평탄화해 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '전체 원소 수 N개를 정확히 한 번씩 방문합니다.', space: 'O(N)', spaceWhy: '전체 원소 N개를 담은 새 1차원 리스트를 생성합니다.' },
        pitfalls: ['이중 컴프리헨션에서 바깥 for row가 앞쪽, 안쪽 for x가 뒤쪽에 와야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 첫 번째 행 grid[0]만 반환하거나 중첩 평탄화를 빠뜨려 2차원 구조를 1차원으로 펼치지 못합니다.',
        checklist: ['for row in grid for x in row 순서 확인', '빈 행 포함 입력 처리 확인'],
        focusLine: 2,
        buggyCode: `def flatten_matrix(grid: list[list[int]]) -> list[int]:
    return [row[0] for row in grid if row]`
      },
      entryPoint: 'flatten_matrix',
      code: `def flatten_matrix(grid: list[list[int]]) -> list[int]:
    return [x for row in grid for x in row]`,
      skeleton: `def flatten_matrix(grid: list[list[int]]) -> list[int]:
    return [x for row in grid ____]`,
      tests: [
        { input: [[[1, 2], [], [3, 4, 5]]], expected: [1, 2, 3, 4, 5], name: '빈 행 포함 2D 평탄화' },
        { input: [[]], expected: [], name: '빈 행렬 입력' }
      ]
    },
    {
      id: 'py_beg_zip_pairs_dict',
      title: 'zip()으로 두 리스트 딕셔너리 쌍 결합하기',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '키 리스트와 값 리스트를 zip()으로 짝지어 딕셔너리로 결합합니다.',
      explanation: {
        summary: '내장 함수 zip(keys, vals)은 더 짧은 리스트 길이에 맞춰 안전하게 튜플 쌍을 생성하므로 IndexError 없이 딕셔너리로 변환할 수 있습니다.',
        keyConcepts: ['zip(keys, vals)', 'Dict Comprehension', '짧은 길이 기준 자동 안전 종료', 'Key-Value Pairing'],
        lineByLine: [
          { line: 1, code: 'def pair_to_dict(keys: list[str], vals: list) -> dict:', explain: '키 이름 리스트 keys와 대응 값 리스트 vals를 입력받습니다.' },
          { line: 2, code: '    return {k: v for k, v in zip(keys, vals)}', explain: 'zip으로 두 리스트를 병렬 순회하며 키: 값 쌍의 딕셔너리를 만들어 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '두 리스트 중 짧은 길이 N만큼 O(1) 해시 삽입을 반복합니다.', space: 'O(N)', spaceWhy: 'N개 엔트리를 가진 딕셔너리를 생성합니다.' },
        pitfalls: ['두 리스트 길이가 다를 때 range(len(keys)) 인덱싱을 쓰면 vals 쪽에서 IndexError가 발생할 수 있으므로 zip()이 훨씬 안전합니다.']
      },
      audit: {
        bugSummary: 'AI가 zip 대신 len(keys) 인덱싱을 사용해 vals가 더 짧은 입력에서 IndexError가 발생합니다.',
        checklist: ['zip(keys, vals) 사용 확인', '서로 다른 길이 입력 안전 결합 확인'],
        focusLine: 2,
        buggyCode: `def pair_to_dict(keys: list[str], vals: list) -> dict:
    return {keys[i]: vals[i] for i in range(len(keys))}`
      },
      entryPoint: 'pair_to_dict',
      code: `def pair_to_dict(keys: list[str], vals: list) -> dict:
    return {k: v for k, v in zip(keys, vals)}`,
      skeleton: `def pair_to_dict(keys: list[str], vals: list) -> dict:
    return {____ for k, v in zip(keys, vals)}`,
      tests: [
        { input: [['host', 'port'], ['localhost', 8080]], expected: { host: 'localhost', port: 8080 }, name: '동일 길이 키-값 매핑' },
        { input: [['a', 'b', 'c'], [10, 20]], expected: { a: 10, b: 20 }, name: '길이가 달라도 IndexError 없이 안전 결합' },
        { input: [[], []], expected: {}, name: '빈 리스트 처리' }
      ]
    },
    {
      id: 'py_beg_char_frequency',
      title: '공백 제외 대소문자 통합 문자 빈도 집계',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(K)' },
      description: '문자열에서 공백을 무시하고 소문자로 통일해 각 문자의 등장 횟수를 딕셔너리로 집계합니다.',
      explanation: {
        summary: 'text.lower()로 소문자화한 뒤 공백을 건너뛰고 counts[ch] = counts.get(ch, 0) + 1로 안전하게 횟수를 누적합니다.',
        keyConcepts: ['dict.get(ch, 0)', 'str.lower()', '공백 문자 스킵 (continue)', '해시 카운팅'],
        lineByLine: [
          { line: 1, code: 'def char_freq(text: str) -> dict[str, int]:', explain: '문자 빈도를 분석할 문자열 text를 입력받습니다.' },
          { line: 2, code: '    counts = {}', explain: '문자별 등장 횟수를 기록할 빈 딕셔너리입니다.' },
          { line: 3, code: '    for ch in text.lower():', explain: '소문자로 정규화한 뒤 한 글자씩 순회합니다.' },
          { line: 4, code: "        if ch == ' ':", explain: '공백 문자는 빈도 집계에서 제외하기 위해' },
          { line: 5, code: '            continue', explain: '다음 글자로 건너뜁니다.' },
          { line: 6, code: '        counts[ch] = counts.get(ch, 0) + 1', explain: '기존 값에 1을 더해 저장하며 미등록 키는 기본값 0으로 시작합니다.' },
          { line: 7, code: '    return counts', explain: '집계된 문자 빈도 딕셔너리를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열 길이 N만큼 1회 순회하며 O(1) 딕셔너리를 갱신합니다.', space: 'O(K)', spaceWhy: '고유 문자 개수 K만큼의 키-값만 저장합니다.' },
        pitfalls: ['ch == " " 필터를 빼먹으면 띄어쓰기 횟수까지 문자 통계에 섞입니다.']
      },
      audit: {
        bugSummary: 'AI가 공백 건너뛰기(if ch == " ": continue)를 빠져 결과 딕셔너리에 공백 키(" ")가 포함됩니다.',
        checklist: ['공백 스킵 조건 확인', 'text.lower() 및 counts.get(ch, 0) 확인'],
        focusLine: 4,
        buggyCode: `def char_freq(text: str) -> dict[str, int]:
    counts = {}
    for ch in text.lower():
        counts[ch] = counts.get(ch, 0) + 1
    return counts`
      },
      entryPoint: 'char_freq',
      code: `def char_freq(text: str) -> dict[str, int]:
    counts = {}
    for ch in text.lower():
        if ch == ' ':
            continue
        counts[ch] = counts.get(ch, 0) + 1
    return counts`,
      skeleton: `def char_freq(text: str) -> dict[str, int]:
    counts = {}
    for ch in text.lower():
        if ____:
            continue
        counts[ch] = counts.get(ch, 0) + 1
    return counts`,
      tests: [
        { input: ['Code Lab'], expected: { c: 1, o: 1, d: 1, e: 1, l: 1, a: 1, b: 1 }, name: '공백 제외 소문자 집계' },
        { input: ['AaA bB'], expected: { a: 3, b: 2 }, name: '대소문자 통합 빈도' },
        { input: ['   '], expected: {}, name: '공백 전용 입력 빈 딕셔너리' }
      ]
    },
    {
      id: 'py_beg_palindrome_clean',
      title: '영숫자(isalnum) 필터링 회문 판별기',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'String',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '문장부호·공백을 무시하고 영문자·숫자(isalnum)만 추출해 대소문자 구분 없이 회문(Palindrome)인지 판별합니다.',
      explanation: {
        summary: 'ch.isalnum() 필터와 ch.lower()를 제너레이터 결합으로 정제한 뒤 파이썬 슬라이스 역순(cleaned[::-1])과 비교합니다.',
        keyConcepts: ['str.isalnum()', '문자열 슬라이싱 역순 ([::-1])', 'join 제너레이터', '구두점·공백 무시'],
        lineByLine: [
          { line: 1, code: 'def is_clean_palindrome(s: str) -> bool:', explain: '문장부호와 공백이 섞인 원시 문자열 s를 입력받습니다.' },
          { line: 2, code: "    cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())", explain: '알파벳과 숫자 글자만 뽑아 소문자로 바꾼 순수 문자열을 만듭니다.' },
          { line: 3, code: '    return cleaned == cleaned[::-1]', explain: '앞에서 읽은 문자열과 슬라이스 역순([::-1])이 같으면 True를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열 1회 정제 O(N) 후 역순 비교 O(N)이 걸립니다.', space: 'O(N)', spaceWhy: '정제된 cleaned 및 역순 슬라이스 문자열을 생성합니다.' },
        pitfalls: ['ch.isalpha()만 쓰면 숫자("12321")를 걸러내 버려 숫자 포함 입력 오답이 납니다. 반드시 ch.isalnum()을 사용해야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 ch.isalnum() 대신 ch.isalpha()를 써서 숫자가 포함된 "101" 또는 "a1a" 같은 회문을 잘못 판정합니다.',
        checklist: ['ch.isalnum() 영숫자 모두 포함 확인', '소문자화 후 [::-1] 비교'],
        focusLine: 2,
        buggyCode: `def is_clean_palindrome(s: str) -> bool:
    cleaned = ''.join(ch.lower() for ch in s if ch.isalpha())
    return cleaned == cleaned[::-1]`
      },
      entryPoint: 'is_clean_palindrome',
      code: `def is_clean_palindrome(s: str) -> bool:
    cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())
    return cleaned == cleaned[::-1]`,
      skeleton: `def is_clean_palindrome(s: str) -> bool:
    cleaned = ''.join(ch.lower() for ch in s if ____)
    return cleaned == ____`,
      tests: [
        { input: ['A man, a plan, a canal: Panama'], expected: true, name: '구두점·공백 포함 회문 통과' },
        { input: ['123a321'], expected: true, name: '숫자 포함 회문' },
        { input: ['race a car'], expected: false, name: '비회문 거짓' },
        { input: ['12'], expected: false, name: '비회문 숫자 거짓' }
      ]
    },
    {
      id: 'py_beg_transpose_matrix',
      title: '언패킹(*) + zip() 행렬 전치(Transpose)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(R * C)', space: 'O(R * C)' },
      description: 'R×C 크기의 2차원 행렬의 행과 열을 뒤바꾼 C×R 전치 행렬을 zip(*matrix)로 구현합니다.',
      explanation: {
        summary: '전개 언패킹 *matrix로 각 행을 zip 인자로 넘기면 같은 열 인덱스 원소끼리 튜플로 묶이므로 list(col)로 변환해 전치 행렬을 완성합니다.',
        keyConcepts: ['Iterable Unpacking (*matrix)', 'zip(*matrix) 전치 관용구', 'tuple -> list 변환', '빈 행렬 가드'],
        lineByLine: [
          { line: 1, code: 'def transpose(matrix: list[list[int]]) -> list[list[int]]:', explain: '2차원 정수 행렬 matrix를 입력받습니다.' },
          { line: 2, code: '    if not matrix or not matrix[0]:', explain: '빈 행렬이거나 첫 행이 비어 있을 때' },
          { line: 3, code: '        return []', explain: '빈 리스트를 반환해 안전하게 종료합니다.' },
          { line: 4, code: '    return [list(col) for col in zip(*matrix)]', explain: '각 열 튜플을 list(col)로 변환해 전치된 새 2차원 행렬을 반환합니다.' }
        ],
        complexity: { time: 'O(R * C)', timeWhy: '모든 행×열 원소를 한 번씩 새 열 리스트로 배치합니다.', space: 'O(R * C)', spaceWhy: '크기 C×R의 새 전치 행렬을 생성합니다.' },
        pitfalls: ['JSON 변환이나 타입 일관성을 위해 zip이 만든 tuple을 [list(col) for col ...]처럼 반드시 리스트로 변환해야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 matrix 언패킹(*)을 빠져 zip(matrix)만 호출하여 행×열이 뒤집히지 않습니다.',
        checklist: ['언패킹 연산자 zip(*matrix) 확인', '빈 행렬 가드 확인'],
        focusLine: 4,
        buggyCode: `def transpose(matrix: list[list[int]]) -> list[list[int]]:
    if not matrix or not matrix[0]:
        return []
    return [list(col) for col in zip(matrix)]`
      },
      entryPoint: 'transpose',
      code: `def transpose(matrix: list[list[int]]) -> list[list[int]]:
    if not matrix or not matrix[0]:
        return []
    return [list(col) for col in zip(*matrix)]`,
      skeleton: `def transpose(matrix: list[list[int]]) -> list[list[int]]:
    if not matrix or not matrix[0]:
        return []
    return [____ for col in zip(____)]`,
      tests: [
        { input: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]], name: '2x3 -> 3x2 전치' },
        { input: [[[9]]], expected: [[9]], name: '1x1 행렬' },
        { input: [[]], expected: [], name: '빈 행렬 안전 반환' }
      ]
    },
    {
      id: 'py_beg_refactor_default_get',
      title: 'if key in dict 분기 → dict.get() 집계 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(N)', space: 'O(K)' },
      description: '장황한 if key in totals / else 초기화 분기를 dict.get(cat, 0) 단일 표현식으로 깔끔하게 리팩터링합니다.',
      refactoringGoal: '반복적인 키 존재 검사 if/else 분기를 없애고 totals.get(cat, 0)으로 카테고리별 금액 합계를 간결히 누적하세요.',
      refactoringBefore: `def sum_by_category(items: list[dict]) -> dict[str, int]:
    totals = {}
    for item in items:
        cat = item['category']
        if cat in totals:
            totals[cat] = totals[cat] + item['amount']
        else:
            totals[cat] = item['amount']
    return totals`,
      explanation: {
        summary: '딕셔너리의 get(cat, 0) 기본값 조회로 최초 등록과 누적 덧셈을 한 줄로 통합합니다.',
        keyConcepts: ['dict.get(key, 0) 리팩터링', '중복 if/else 제거', 'Tuple/Dict Unpacking', 'O(N) 그룹 합계'],
        lineByLine: [
          { line: 1, code: 'def sum_by_category(items: list[dict]) -> dict[str, int]:', explain: 'category와 amount 필드를 가진 딕셔너리 목록을 받습니다.' },
          { line: 2, code: '    totals = {}', explain: '카테고리별 총액을 저장할 결과 딕셔너리를 초기화합니다.' },
          { line: 3, code: '    for item in items:', explain: '전체 거래 항목을 순서대로 순회합니다.' },
          { line: 4, code: "        cat = item.get('category', 'etc')", explain: '카테고리 이름을 안전하게 추출하며 없으면 etc로 묶습니다.' },
          { line: 5, code: "        totals[cat] = totals.get(cat, 0) + item.get('amount', 0)", explain: '기존 합계(없으면 0)에 현재 금액을 더해 if/else 없이 누적합니다.' },
          { line: 6, code: '    return totals', explain: '카테고리별 합계 딕셔너리를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개 항목마다 평균 O(1) 딕셔너리 조회 및 갱신을 수행합니다.', space: 'O(K)', spaceWhy: '고유 카테고리 수 K만큼만 엔트리를 보관합니다.' },
        pitfalls: ['totals[cat] = item["amount"]처럼 get 누적을 빼먹으면 같은 카테고리가 덮어써져 마지막 금액만 남습니다.']
      },
      audit: {
        bugSummary: 'AI가 totals.get(cat, 0) + 덧셈 대신 단순 덮어쓰기(totals[cat] = amount)를 작성해 동일 카테고리가 누적되지 않습니다.',
        checklist: ['totals.get(cat, 0) + item.get("amount", 0) 누적 확인', '빈 리스트 {} 반환 확인'],
        focusLine: 5,
        buggyCode: `def sum_by_category(items: list[dict]) -> dict[str, int]:
    totals = {}
    for item in items:
        cat = item.get('category', 'etc')
        totals[cat] = item.get('amount', 0)
    return totals`
      },
      entryPoint: 'sum_by_category',
      code: `def sum_by_category(items: list[dict]) -> dict[str, int]:
    totals = {}
    for item in items:
        cat = item.get('category', 'etc')
        totals[cat] = totals.get(cat, 0) + item.get('amount', 0)
    return totals`,
      skeleton: `def sum_by_category(items: list[dict]) -> dict[str, int]:
    totals = {}
    for item in items:
        cat = item.get('category', 'etc')
        totals[cat] = ____ + item.get('amount', 0)
    return totals`,
      tests: [
        { input: [[{ category: 'food', amount: 5000 }, { category: 'book', amount: 12000 }, { category: 'food', amount: 3000 }]], expected: { food: 8000, book: 12000 }, name: '카테고리별 누적 합산' },
        { input: [[]], expected: {}, name: '빈 목록 처리' }
      ]
    },
    {
      id: 'py_beg_ai_stopword_filter',
      title: '검색·임베딩 전 불용어(Stopwords) 키워드 정제',
      tier: 1,
      level: 'beginner',
      track: 'ai',
      category: 'AI Basics',
      complexity: { time: 'O(N + S)', space: 'O(N + S)' },
      description: '검색 및 RAG 키워드 추출 전 text를 소문자 토큰으로 나누고 집합(set) 조회로 불용어(the, a, is 등)를 O(1)에 걸러냅니다.',
      explanation: {
        summary: 'stopwords 리스트를 set으로 변환해 O(1) 멤버십 검사로 성능을 확보하고, 정규화(lower + split) 후 의미 키워드만 남깁니다.',
        keyConcepts: ['NLP Stopword Removal', 'set O(1) Lookup', 'str.lower().split()', 'RAG 키워드 전처리'],
        lineByLine: [
          { line: 1, code: 'def extract_keywords(text: str, stopwords: list[str]) -> list[str]:', explain: '원본 질의 텍스트와 제외할 불용어 리스트를 입력받습니다.' },
          { line: 2, code: '    stop = {w.lower() for w in stopwords}', explain: 'O(1) 조회와 대소문자 무시를 위해 불용어를 소문자 집합으로 변환합니다.' },
          { line: 3, code: '    return [w for w in text.lower().split() if w not in stop]', explain: '소문자 단어 토큰 중 불용어 집합에 없는 핵심 단어만 순서대로 추출합니다.' }
        ],
        complexity: { time: 'O(N + S)', timeWhy: '불용어 S개 집합화 O(S) 후 텍스트 단어 N개를 각각 O(1)에 필터링합니다.', space: 'O(N + S)', spaceWhy: '불용어 집합과 추출된 키워드 리스트를 저장합니다.' },
        pitfalls: ['stop 집합을 소문자로 정규화하지 않으면 Stopwords에 "The"가 들어왔을 때 text.lower()의 "the"를 걸러내지 못합니다.']
      },
      audit: {
        bugSummary: 'AI가 stop 집합에 소문자 정규화를 빠뜨리고 원 리스트 그대로 검사해 대문자 불용어("The")가 걸러지지 않습니다.',
        checklist: ['소문자 불용어 집합 {w.lower() for w in stopwords} 확인', 'text.lower().split() 토큰화 확인'],
        focusLine: 2,
        buggyCode: `def extract_keywords(text: str, stopwords: list[str]) -> list[str]:
    stop = set(stopwords)
    return [w for w in text.lower().split() if w not in stop]`
      },
      entryPoint: 'extract_keywords',
      code: `def extract_keywords(text: str, stopwords: list[str]) -> list[str]:
    stop = {w.lower() for w in stopwords}
    return [w for w in text.lower().split() if w not in stop]`,
      skeleton: `def extract_keywords(text: str, stopwords: list[str]) -> list[str]:
    stop = {w.lower() for w in stopwords}
    return [w for w in ____ if ____]`,
      tests: [
        { input: ['The RAG is a smart Search', ['The', 'is', 'a']], expected: ['rag', 'smart', 'search'], name: '대소문자 불용어 제거' },
        { input: ['  the  a ', ['the', 'a']], expected: [], name: '모두 불용어면 빈 리스트' }
      ]
    }
  );

  // =========================================================================
  // 3. C99 기초 8문제 (level: 'beginner', tier: 1)
  // =========================================================================
  curr.c.push(
    {
      id: 'c_beg_find_min',
      title: 'for 루프로 정수 배열 최솟값 찾기',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '배열의 첫 원소 arr[0]을 기준 최솟값으로 잡고 전체 배열을 순회해 가장 작은 정수를 찾습니다.',
      explanation: {
        summary: 'min_val을 큰 임의 상수나 0으로 두지 않고 arr[0]으로 초기화해 양수·음수 배열 모두 정확하게 최솟값을 구합니다.',
        keyConcepts: ['초기 기준값 arr[0]', '배열 순회 (for)', '최솟값 비교 (<)', 'O(1) 공간'],
        lineByLine: [
          { line: 1, code: 'int find_min(int arr[], int n) {', explain: '정수 배열 arr과 원소 개수 n을 입력받습니다.' },
          { line: 2, code: '    if (n <= 0) return 0;', explain: '빈 배열 전달 시 arr[0] 접근 오류를 막는 안전 가드입니다.' },
          { line: 3, code: '    int min_val = arr[0];', explain: '첫 원소를 초기 최솟값으로 설정합니다.' },
          { line: 4, code: '    for (int i = 1; i < n; i++) {', explain: '인덱스 1부터 n - 1까지 차례로 확인합니다.' },
          { line: 5, code: '        if (arr[i] < min_val) {', explain: '현재 원소가 기존 min_val보다 작으면' },
          { line: 6, code: '            min_val = arr[i];', explain: '더 작은 새 값으로 min_val을 갱신합니다.' },
          { line: 7, code: '        }', explain: 'if 블록을 닫습니다.' },
          { line: 8, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 9, code: '    return min_val;', explain: '찾아낸 최솟값을 반환합니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '원소 n개를 1회 순회하며 비교합니다.', space: 'O(1)', spaceWhy: '정수 변수 min_val과 i만 사용합니다.' },
        pitfalls: ['min_val = 0으로 초기화하면 모든 원소가 양수인 [5, 8, 3]에서 최솟값을 0으로 잘못 반환합니다.']
      },
      audit: {
        bugSummary: 'AI가 min_val 초기값을 0으로 작성해 모든 요소가 양수([5, 8, 3])일 때 3 대신 0을 반환합니다.',
        checklist: ['arr[0] 기준값 초기화 확인', 'n <= 0 빈 배열 가드 확인'],
        focusLine: 3,
        buggyCode: `int find_min(int arr[], int n) {
    if (n <= 0) return 0;
    int min_val = 0;
    for (int i = 1; i < n; i++) {
        if (arr[i] < min_val) {
            min_val = arr[i];
        }
    }
    return min_val;
}`
      },
      entryPoint: 'find_min',
      code: `int find_min(int arr[], int n) {
    if (n <= 0) return 0;
    int min_val = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] < min_val) {
            min_val = arr[i];
        }
    }
    return min_val;
}`,
      skeleton: `int find_min(int arr[], int n) {
    if (n <= 0) return 0;
    int min_val = ____;
    for (int i = 1; i < n; i++) {
        if (____) {
            min_val = arr[i];
        }
    }
    return min_val;
}`,
      tests: [
        { input: [[5, 8, 3, 12], 4], expected: 3, name: '양수 전용 배열 최솟값 (3)' },
        { input: [[-2, -15, -4], 3], expected: -15, name: '음수 배열 최솟값 (-15)' },
        { input: [[], 0], expected: 0, name: 'n=0 빈 배열 가드' }
      ]
    },
    {
      id: 'c_beg_linear_search',
      title: '배열 선형 탐색 (Linear Search)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '정수 배열 앞에서부터 차례로 target과 같은 원소를 찾아 첫 등장 인덱스를 반환하고 없으면 -1을 돌려줍니다.',
      explanation: {
        summary: '정렬되지 않은 배열에서도 동작하는 O(N) 순차 탐색 구현으로, 중복값이 있으면 가장 앞선 인덱스를 즉시 반환합니다.',
        keyConcepts: ['Linear Search O(N)', '첫 일치 조기 반환', '미발견 센티넬 (-1)', '배열 경계 n'],
        lineByLine: [
          { line: 1, code: 'int linear_search(int arr[], int n, int target) {', explain: '정수 배열, 길이 n, 찾을 값 target을 입력받습니다.' },
          { line: 2, code: '    for (int i = 0; i < n; i++) {', explain: '인덱스 0부터 n - 1까지 왼쪽에서 오른쪽으로 순회합니다.' },
          { line: 3, code: '        if (arr[i] == target) {', explain: 'i번째 요소가 찾는 값 target과 같으면' },
          { line: 4, code: '            return i;', explain: '최초 발견 위치 i를 즉시 반환하고 탐색을 종료합니다.' },
          { line: 5, code: '        }', explain: 'if 블록을 닫습니다.' },
          { line: 6, code: '    }', explain: 'for 루프를 닫습니다.' },
          { line: 7, code: '    return -1;', explain: '끝까지 찾지 못하면 존재하지 않음을 뜻하는 -1을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '최악의 경우 배열 전체 N개 원소를 1회 비교합니다.', space: 'O(1)', spaceWhy: '루프 인덱스 변수 i만 사용합니다.' },
        pitfalls: ['일치 시 즉시 return i 하지 않고 found = i로 끝까지 돌면 중복 요소 중 마지막 인덱스를 반환하게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 첫 일치를 찾자마자 return i 하지 않고 끝까지 루프를 돌아 중복 값의 마지막 인덱스를 잘못 반환합니다.',
        checklist: ['arr[i] == target 시 즉시 return i 확인', '미발견 시 -1 반환 확인'],
        focusLine: 4,
        buggyCode: `int linear_search(int arr[], int n, int target) {
    int found = -1;
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            found = i;
        }
    }
    return found;
}`
      },
      entryPoint: 'linear_search',
      code: `int linear_search(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
      skeleton: `int linear_search(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (____) {
            return i;
        }
    }
    return ____;
}`,
      tests: [
        { input: [[4, 7, 2, 7, 9], 5, 7], expected: 1, name: '중복 원소 첫 인덱스(1) 반환' },
        { input: [[10, 20, 30], 3, 99], expected: -1, name: '미존재 시 -1 반환' }
      ]
    },
    {
      id: 'c_beg_count_positives',
      title: '양수(> 0) 원소 개수 카운터',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '배열 안의 정수 중 0보다 엄격히 큰(> 0) 양수의 개수를 세어 반환합니다.',
      explanation: {
        summary: '양수 정의(> 0)를 정확히 구분해 0과 음수를 제외하고 카운터를 1씩 증가시키는 기본 조건 집계 패턴입니다.',
        keyConcepts: ['엄격 비교 (> 0)', '카운터 누적 (cnt++)', '0과 음수 제외', 'O(N) 배열 스캔'],
        lineByLine: [
          { line: 1, code: 'int count_positive(int arr[], int n) {', explain: '정수 배열 arr과 크기 n을 입력받습니다.' },
          { line: 2, code: '    int cnt = 0;', explain: '양수 개수를 저장할 카운터를 0으로 초기화합니다.' },
          { line: 3, code: '    for (int i = 0; i < n; i++) {', explain: '배열의 모든 n개 요소를 순회합니다.' },
          { line: 4, code: '        if (arr[i] > 0) {', explain: '0은 양수가 아니므로 엄격히 0보다 클 때만' },
          { line: 5, code: '            cnt++;', explain: '카운터를 1 증가시킵니다.' },
          { line: 6, code: '        }', explain: 'if 조건 블록을 닫습니다.' },
          { line: 7, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 8, code: '    return cnt;', explain: '집계된 양수 총 개수를 반환합니다.' },
          { line: 9, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'n개 원소를 1회씩 비교합니다.', space: 'O(1)', spaceWhy: '정수 변수 cnt와 i만 사용합니다.' },
        pitfalls: ['arr[i] >= 0으로 비교하면 0까지 양수로 잘못 카운트됩니다.']
      },
      audit: {
        bugSummary: 'AI가 비교 조건을 arr[i] >= 0으로 작성해 숫자 0까지 양수로 포함해 카운트합니다.',
        checklist: ['엄격 비교 arr[i] > 0 확인', '빈 배열 및 음수 전용 배열 0 반환 확인'],
        focusLine: 4,
        buggyCode: `int count_positive(int arr[], int n) {
    int cnt = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] >= 0) {
            cnt++;
        }
    }
    return cnt;
}`
      },
      entryPoint: 'count_positive',
      code: `int count_positive(int arr[], int n) {
    int cnt = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] > 0) {
            cnt++;
        }
    }
    return cnt;
}`,
      skeleton: `int count_positive(int arr[], int n) {
    int cnt = 0;
    for (int i = 0; i < n; i++) {
        if (____) {
            cnt++;
        }
    }
    return cnt;
}`,
      tests: [
        { input: [[-3, 0, 4, 9, -1], 5], expected: 2, name: '0과 음수 제외 2개' },
        { input: [[0, 0, -5], 3], expected: 0, name: '0 및 음수만 있을 때 0' }
      ]
    },
    {
      id: 'c_beg_is_sorted_asc',
      title: '배열 비내림차순(오름차순) 정렬 여부 검사',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '인접한 두 원소 쌍을 비교해 배열이 오름차순(동일값 허용)으로 정렬되어 있으면 1, 아니면 0을 반환합니다.',
      explanation: {
        summary: 'i < n - 1 범위까지만 순회해 arr[i + 1] Out-of-Bounds 접근을 막고, 역전(arr[i] > arr[i + 1]) 발견 즉시 0을 조기 반환합니다.',
        keyConcepts: ['인접 원소 비교 (i < n - 1)', 'Out-of-Bounds 방어', '조기 반환 (Early Return 0)', '동점 허용 정렬'],
        lineByLine: [
          { line: 1, code: 'int is_sorted_asc(int arr[], int n) {', explain: '배열 arr과 크기 n을 받아 정렬 여부를 1/0으로 반환합니다.' },
          { line: 2, code: '    for (int i = 0; i < n - 1; i++) {', explain: '다음 원소 arr[i + 1]을 안전하게 읽도록 n - 1 전까지만 순회합니다.' },
          { line: 3, code: '        if (arr[i] > arr[i + 1]) {', explain: '앞 원소가 뒤 원소보다 커서 정렬 순서가 깨졌다면' },
          { line: 4, code: '            return 0;', explain: '즉시 정렬 아님(0)을 반환하고 종료합니다.' },
          { line: 5, code: '        }', explain: 'if 조건을 닫습니다.' },
          { line: 6, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 7, code: '    return 1;', explain: '모든 인접 쌍이 오름차순 조건을 만족하므로 1(참)을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '인접 쌍 최대 n - 1번만 비교합니다.', space: 'O(1)', spaceWhy: '인덱스 변수 i 외 추가 메모리가 없습니다.' },
        pitfalls: ['루프 경계를 i < n으로 잡으면 마지막에 arr[n] 쓰레기 메모리를 읽게 되고, >= 비교를 쓰면 [1, 2, 2, 3] 같은 중복 오름차순이 실패합니다.']
      },
      audit: {
        bugSummary: 'AI가 arr[i] >= arr[i + 1]로 비교해 [1, 2, 2, 5]처럼 같은 값이 연달아 있는 비내림차순 배열이 0(거짓)으로 판정됩니다.',
        checklist: ['arr[i] > arr[i + 1] 역전 조건 확인', '루프 상한 i < n - 1 경계 확인'],
        focusLine: 3,
        buggyCode: `int is_sorted_asc(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        if (arr[i] >= arr[i + 1]) {
            return 0;
        }
    }
    return 1;
}`
      },
      entryPoint: 'is_sorted_asc',
      code: `int is_sorted_asc(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return 0;
        }
    }
    return 1;
}`,
      skeleton: `int is_sorted_asc(int arr[], int n) {
    for (int i = 0; i < ____; i++) {
        if (____) {
            return 0;
        }
    }
    return 1;
}`,
      tests: [
        { input: [[1, 2, 2, 5], 4], expected: 1, name: '중복 값 포함 비내림차순 통과' },
        { input: [[1, 5, 3, 7], 4], expected: 0, name: '역전 발견 시 0' },
        { input: [[42], 1], expected: 1, name: '단일 원소 배열 정렬됨' }
      ]
    },
    {
      id: 'c_beg_count_digits_str',
      title: "C 문자열 내 숫자('0'~'9') 개수 세기",
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Pointers & Strings',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: 'const char* 포인터를 널 종료 문자(\\0)까지 전진시키며 ASCII 범위 검사로 숫자 글자 개수를 카운트합니다.',
      explanation: {
        summary: 'C에서 문자 리터럴은 ASCII 정수 코드이므로 *p >= \'0\' && *p <= \'9\' 범위 비교로 숫자 문자를 판별합니다.',
        keyConcepts: ['ASCII 문자 범위 비교', 'const char* 순회', '널 종료 문자 (\\0)', '논리곱 && 조건'],
        lineByLine: [
          { line: 1, code: 'int count_digits(const char* s) {', explain: '읽기 전용 C 문자열 시작 주소를 입력받습니다.' },
          { line: 2, code: '    int cnt = 0;', explain: '숫자 문자 개수를 누적할 카운터입니다.' },
          { line: 3, code: '    const char* p = s;', explain: '문자열을 한 글자씩 전진할 포인터 p를 시작 위치로 설정합니다.' },
          { line: 4, code: "    while (*p != '\\0') {", explain: '널 종료 문자를 만날 때까지 문자를 검사합니다.' },
          { line: 5, code: "        if (*p >= '0' && *p <= '9') {", explain: "현재 문자의 ASCII 코드가 '0'(48) 이상 '9'(57) 이하이면" },
          { line: 6, code: '            cnt++;', explain: '숫자 카운터를 1 증가시킵니다.' },
          { line: 7, code: '        }', explain: 'if 블록을 닫습니다.' },
          { line: 8, code: '        p++;', explain: '다음 문자 바이트로 포인터를 전진시킵니다.' },
          { line: 9, code: '    }', explain: 'while 루프를 종료합니다.' },
          { line: 10, code: '    return cnt;', explain: '총 숫자 문자 개수를 반환합니다.' },
          { line: 11, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열 길이 N만큼 1바이트씩 1회 순회합니다.', space: 'O(1)', spaceWhy: '카운터와 포인터 1개만 사용합니다.' },
        pitfalls: ['*p > \'0\' && *p < \'9\'로 등호를 빼먹으면 문자 \'0\'과 \'9\'를 세지 못하는 경계 오답이 생깁니다.']
      },
      audit: {
        bugSummary: "AI가 '0'과 '9' 경계 비교에 >= / <= 대신 > / < 를 써서 숫자 0과 9를 누락합니다.",
        checklist: ["*p >= '0' && *p <= '9' 경계 포함 확인", "빈 문자열 0 반환 확인"],
        focusLine: 5,
        buggyCode: `int count_digits(const char* s) {
    int cnt = 0;
    const char* p = s;
    while (*p != '\\0') {
        if (*p > '0' && *p < '9') {
            cnt++;
        }
        p++;
    }
    return cnt;
}`
      },
      entryPoint: 'count_digits',
      code: `int count_digits(const char* s) {
    int cnt = 0;
    const char* p = s;
    while (*p != '\\0') {
        if (*p >= '0' && *p <= '9') {
            cnt++;
        }
        p++;
    }
    return cnt;
}`,
      skeleton: `int count_digits(const char* s) {
    int cnt = 0;
    const char* p = s;
    while (*p != '\\0') {
        if (____) {
            cnt++;
        }
        p++;
    }
    return cnt;
}`,
      tests: [
        { input: ['Key09Studio24'], expected: 4, name: '경계 숫자 0·9 포함 카운트 (4)' },
        { input: ['abcdef'], expected: 0, name: '숫자 없는 문자열 (0)' },
        { input: [''], expected: 0, name: '빈 문자열 (0)' }
      ]
    },
    {
      id: 'c_beg_my_strcmp',
      title: 'C 문자열 사전순 비교 구현 (my_strcmp)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Pointers & Strings',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '두 C 문자열을 첫 글자부터 포인터로 비교해 동일하면 0, a가 앞서면 -1, 뒤서면 1을 반환하는 표준 strcmp 로직을 구현합니다.',
      explanation: {
        summary: '두 포인터 문자가 같고 둘 다 널 문자(\'\\0\')가 아닐 때까지 전진시킨 뒤, 멈춘 지점의 ASCII 문자 크기 비교로 결과를 결정합니다.',
        keyConcepts: ['strcmp 원리', '이중 포인터 동시 전진', '*a == *b 및 *a != \'\\0\' 가드', '길이가 다른 접두사 처리'],
        lineByLine: [
          { line: 1, code: 'int my_strcmp(const char* a, const char* b) {', explain: '사전순으로 비교할 두 읽기 전용 C 문자열 포인터를 받습니다.' },
          { line: 2, code: "    while (*a != '\\0' && *a == *b) {", explain: '문자열 끝이 아니면서 현재 두 문자가 같을 동안 계속 비교합니다.' },
          { line: 3, code: '        a++;', explain: '문자열 a 포인터를 한 칸 전진시킵니다.' },
          { line: 4, code: '        b++;', explain: '문자열 b 포인터를 한 칸 전진시킵니다.' },
          { line: 5, code: '    }', explain: '문자가 다르거나 문자열 끝에 도달하면 루프를 빠져나옵니다.' },
          { line: 6, code: '    if (*a == *b) return 0;', explain: "둘 다 동시에 '\\0'에 도달했다면 완전히 같은 문자열이므로 0을 반환합니다." },
          { line: 7, code: '    return (*a < *b) ? -1 : 1;', explain: '첫 불일치 위치 문자의 ASCII 크기에 따라 -1 또는 1을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '두 문자열 중 짧은 길이 또는 첫 불일치 위치까지 1회 순회합니다.', space: 'O(1)', spaceWhy: '별도 버퍼 없이 입력 포인터만 이동합니다.' },
        pitfalls: ['while 루프에서 *a != \'\\0\' 조건이 없으면 두 문자열이 똑같을 때 \'\\0\' 너머 메모리까지 계속 전진합니다.']
      },
      audit: {
        bugSummary: "AI가 접두사 길이 차이 분기(*a < *b)를 반대로 뒤집어 'ab'와 'abc'의 사전순 비교 부호가 반전됩니다.",
        checklist: ['while (*a != "\\0" && *a == *b) 루프 확인', '동일 시 0, 앞설 시 -1, 뒤설 시 1 반환 확인'],
        focusLine: 7,
        buggyCode: `int my_strcmp(const char* a, const char* b) {
    while (*a != '\\0' && *a == *b) {
        a++;
        b++;
    }
    if (*a == *b) return 0;
    return (*a > *b) ? -1 : 1;
}`
      },
      entryPoint: 'my_strcmp',
      code: `int my_strcmp(const char* a, const char* b) {
    while (*a != '\\0' && *a == *b) {
        a++;
        b++;
    }
    if (*a == *b) return 0;
    return (*a < *b) ? -1 : 1;
}`,
      skeleton: `int my_strcmp(const char* a, const char* b) {
    while (____) {
        a++;
        b++;
    }
    if (*a == *b) return 0;
    return ____;
}`,
      tests: [
        { input: ['code', 'code'], expected: 0, name: '완전 일치 (0)' },
        { input: ['ab', 'abc'], expected: -1, name: '짧은 접두사가 사전순 앞섬 (-1)' },
        { input: ['cat', 'car'], expected: 1, name: 't > r 사전순 뒤섬 (1)' }
      ]
    },
    {
      id: 'c_beg_popcount_bits',
      title: '양의 정수 1 비트 개수 세기 (Popcount)',
      tier: 1,
      level: 'beginner',
      track: 'algorithm',
      category: 'Bitwise',
      complexity: { time: 'O(log N)', space: 'O(1)' },
      description: '비트 AND(& 1)와 우측 시프트(>> 1)를 이용해 0 이상 정수 n의 이진 표현에 포함된 1 비트의 총 개수를 구합니다.',
      explanation: {
        summary: '가장 오른쪽 비트(n & 1)가 1인지 확인해 더한 뒤 n을 오른쪽으로 1비트씩 밀어 0이 될 때까지 세는 비트 카운트 기초입니다.',
        keyConcepts: ['비트 AND 검사 (n & 1)', '비트 우측 시프트 (n >> 1)', 'Popcount (Hamming Weight)', '0 입력 경계 처리'],
        lineByLine: [
          { line: 1, code: 'int popcount(int n) {', explain: '비트 1의 개수를 셀 음수 아닌 정수 n을 입력받습니다.' },
          { line: 2, code: '    int cnt = 0;', explain: '켜진 1 비트의 개수를 누적할 카운터입니다.' },
          { line: 3, code: '    while (n > 0) {', explain: '확인할 비트가 남아 있는 동안(n > 0) 반복합니다.' },
          { line: 4, code: '        cnt += (n & 1);', explain: '최하위 0번 비트가 1이면 1을, 0이면 0을 더합니다.' },
          { line: 5, code: '        n = n >> 1;', explain: '비트를 오른쪽으로 1칸 이동시켜 다음 비트를 최하위로 가져옵니다.' },
          { line: 6, code: '    }', explain: 'while 루프를 종료합니다.' },
          { line: 7, code: '    return cnt;', explain: '총 1 비트 개수를 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(log N)', timeWhy: '이진 자릿수(최대 31비트)만큼 상수에 가까운 반복만 수행합니다.', space: 'O(1)', spaceWhy: '단일 카운터 cnt만 사용합니다.' },
        pitfalls: ['n = n >> 1 시프트 방향을 반대로 쓰거나 대입 없이 n >> 1만 쓰면 while (n > 0) 무한 루프에 빠집니다.']
      },
      audit: {
        bugSummary: 'AI가 루프 조건과 달리 비트 시프트 대신 1만 빼는(n -= 1) 실수를 하여 비트 1의 개수가 아니라 숫자 n 자체를 반환합니다.',
        checklist: ['n = n >> 1 우측 시프트 확인', 'n=0 및 2진수 255(8비트) 검증'],
        focusLine: 5,
        buggyCode: `int popcount(int n) {
    int cnt = 0;
    while (n > 0) {
        cnt += 1;
        n = n - 1;
    }
    return cnt;
}`
      },
      entryPoint: 'popcount',
      code: `int popcount(int n) {
    int cnt = 0;
    while (n > 0) {
        cnt += (n & 1);
        n = n >> 1;
    }
    return cnt;
}`,
      skeleton: `int popcount(int n) {
    int cnt = 0;
    while (n > 0) {
        cnt += ____;
        n = ____;
    }
    return cnt;
}`,
      tests: [
        { input: [13], expected: 3, name: '13 (1101) -> 3비트' },
        { input: [255], expected: 8, name: '255 (11111111) -> 8비트' },
        { input: [0], expected: 0, name: '0 -> 0비트' }
      ]
    },
    {
      id: 'c_beg_refactor_abs_sum',
      title: '인라인 부호 분기 → my_abs() 헬퍼 추출 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '합산 루프 안에 뒤섞여 있던 음수 부호 반전 분기를 재사용 가능한 순수 함수 my_abs(int x)로 분리해 리팩터링합니다.',
      refactoringGoal: 'for 루프 내부의 if (arr[i] < 0) ... else ... 분기를 별도의 순수 함수 my_abs(int x)로 추출해 코드 의도를 명확히 드러내세요.',
      refactoringBefore: `int sum_abs(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] < 0) sum += -arr[i];
        else sum += arr[i];
    }
    return sum;
}`,
      explanation: {
        summary: '절댓값 변환 책임을 my_abs(int x) 함수로 추출하고 sum_abs 루프는 total += my_abs(arr[i]) 한 줄로 깔끔하게 정제합니다.',
        keyConcepts: ['Extract Helper (my_abs)', '단일 책임 분리', '삼항/가드 부호 반전', 'C 함수 조합'],
        lineByLine: [
          { line: 1, code: 'int my_abs(int x) {', explain: '정수 x의 절댓값을 반환하는 순수 헬퍼 함수입니다.' },
          { line: 2, code: '    if (x < 0) return -x;', explain: '음수면 부호를 반전해 양수로 반환합니다.' },
          { line: 3, code: '    return x;', explain: '0 이상이면 x를 그대로 반환합니다.' },
          { line: 4, code: '}', explain: 'my_abs 함수를 종료합니다.' },
          { line: 6, code: 'int sum_abs(int arr[], int n) {', explain: '배열 원소들의 절댓값 총합을 계산합니다.' },
          { line: 7, code: '    int total = 0;', explain: '절댓값 누적 합 변수를 초기화합니다.' },
          { line: 8, code: '    for (int i = 0; i < n; i++) {', explain: '배열의 n개 요소를 순서대로 순회합니다.' },
          { line: 9, code: '        total += my_abs(arr[i]);', explain: '추출된 my_abs 함수로 부호를 정리해 더합니다.' },
          { line: 10, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 11, code: '    return total;', explain: '절댓값 총합을 반환합니다.' },
          { line: 12, code: '}', explain: 'sum_abs 함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'n개 원소마다 O(1) 헬퍼 함수를 호출합니다.', space: 'O(1)', spaceWhy: '누적 변수 total만 사용합니다.' },
        pitfalls: ['my_abs에서 -x 대신 x를 반환하면 음수 원소가 오히려 총합을 깎아먹는 오답이 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 my_abs에서 음수 반전(-x) 부호를 빠져 음수가 그대로 더해져 합계가 줄어듭니다.',
        checklist: ['if (x < 0) return -x; 부호 반전 확인', '음수/양수 혼합 합계 확인'],
        focusLine: 2,
        buggyCode: `int my_abs(int x) {
    if (x < 0) return x;
    return x;
}

int sum_abs(int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += my_abs(arr[i]);
    }
    return total;
}`
      },
      entryPoint: 'sum_abs',
      code: `int my_abs(int x) {
    if (x < 0) return -x;
    return x;
}

int sum_abs(int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += my_abs(arr[i]);
    }
    return total;
}`,
      skeleton: `int my_abs(int x) {
    if (x < 0) return ____;
    return x;
}

int sum_abs(int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += ____;
    }
    return total;
}`,
      tests: [
        { input: [[-3, 5, -2, 0], 4], expected: 10, name: '음수/양수 혼합 절댓값 합 (3+5+2)' },
        { input: [[-10, -20], 2], expected: 30, name: '전체 음수 배열 (30)' },
        { input: [[], 0], expected: 0, name: '빈 배열 n=0' }
      ]
    }
  );

  // =========================================================================
  // 4. Spec 기초 4문제 (level: 'beginner', tier: 1)
  // =========================================================================
  curr.spec.push(
    {
      id: 'spec_beg_schema_signup',
      title: '회원가입 요청 JSON Schema 계약',
      tier: 1,
      level: 'beginner',
      track: 'spec',
      specKind: 'schema',
      category: 'Spec / Contract',
      complexity: { time: 'Schema', space: 'Strict' },
      description: '이메일 정규식 패턴, 비밀번호 최소 길이(8자), 가입 최소 연령(14세) 제약을 강제하는 회원가입 API JSON Schema를 정의합니다.',
      explanation: {
        summary: '클라이언트와 백엔드가 동시에 공유할 회원가입 요청 유효성 계약을 JSON Schema로 명세합니다.',
        keyConcepts: ['JSON Schema Validation', 'email pattern', 'password minLength 8', 'age minimum 14'],
        lineByLine: [
          { line: 1, code: '{', explain: '회원가입 루트 스키마 객체를 엽니다.' },
          { line: 2, code: '  "type": "object",', explain: '요청 페이로드가 JSON 객체인지 확인합니다.' },
          { line: 3, code: '  "required": ["email", "password", "age"],', explain: '3가지 필수 가입 필드를 강제합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: 'role 등 미허용 권한 주입 필드를 차단합니다.' },
          { line: 5, code: '  "properties": {', explain: '각 필드의 타입·길이·패턴 계약을 선언합니다.' },
          { line: 6, code: '    "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$" },', explain: '@와 도메인 점(.)을 포함한 기본 이메일 형식을 검사합니다.' },
          { line: 7, code: '    "password": { "type": "string", "minLength": 8 },', explain: '비밀번호는 최소 8자 이상이어야 합니다.' },
          { line: 8, code: '    "age": { "type": "integer", "minimum": 14 }', explain: '가입 가능 최소 나이를 만 14세 이상 정수로 제한합니다.' },
          { line: 9, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 10, code: '}', explain: '루트 스키마를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '필드 3개의 패턴 및 범위 검사를 즉시 수행합니다.', space: 'Strict', spaceWhy: '미정의 필드 추가를 엄격히 금지합니다.' },
        pitfalls: ['password의 minLength: 8을 빠뜨리면 1글자 약한 비밀번호도 API 검증을 통과합니다.']
      },
      audit: {
        bugSummary: 'AI가 password의 minLength: 8 제약을 빠뜨려 "123" 같은 3글자 비밀번호가 유효하다고 통과됩니다.',
        checklist: ['password minLength: 8 확인', 'age minimum: 14 및 email pattern 확인'],
        focusLine: 7,
        buggyCode: `{
  "type": "object",
  "required": ["email", "password", "age"],
  "additionalProperties": false,
  "properties": {
    "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$" },
    "password": { "type": "string" },
    "age": { "type": "integer", "minimum": 14 }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["email", "password", "age"],
  "additionalProperties": false,
  "properties": {
    "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$" },
    "password": { "type": "string", "minLength": 8 },
    "age": { "type": "integer", "minimum": 14 }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["email", "password", "age"],
  "additionalProperties": false,
  "properties": {
    "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$" },
    "password": { "type": "string", "minLength": ____ },
    "age": { "type": "integer", "minimum": ____ }
  }
}`,
      tests: [
        { input: [{ email: 'dev@keyreflex.io', password: 'secret123', age: 20 }], expected: true, name: '유효 회원가입 통과' },
        { input: [{ email: 'dev@keyreflex.io', password: '123', age: 20 }], expected: false, name: '8자 미만 비밀번호 거부' },
        { input: [{ email: 'bad-email', password: 'secret123', age: 20 }], expected: false, name: '이메일 패턴 불일치 거부' },
        { input: [{ email: 'dev@keyreflex.io', password: 'secret123', age: 12 }], expected: false, name: '만 14세 미만 거부' }
      ]
    },
    {
      id: 'spec_beg_schema_pagination',
      title: '페이지네이션(Pagination) 쿼리 계약 스펙',
      tier: 1,
      level: 'beginner',
      track: 'spec',
      specKind: 'schema',
      category: 'Spec / Contract',
      complexity: { time: 'Schema', space: 'Strict' },
      description: '목록 조회 API의 페이지 번호(1 이상), 페이지 크기(1~100), 정렬 방향(asc/desc) 계약을 JSON Schema로 제한해 대량 조회 장애를 막습니다.',
      explanation: {
        summary: '악의적 사용자가 limit=999999를 요청해 DB 메모리를 터뜨리지 않도록 page, limit 상한(100), sort enum을 강제합니다.',
        keyConcepts: ['Pagination Limit Guard', 'maximum: 100 상한', 'enum ["asc", "desc"]', 'additionalProperties: false'],
        lineByLine: [
          { line: 1, code: '{', explain: '페이지네이션 쿼리 스키마를 엽니다.' },
          { line: 2, code: '  "type": "object",', explain: '쿼리 객체 타입을 강제합니다.' },
          { line: 3, code: '  "required": ["page", "limit", "sort"],', explain: '세 가지 페이지네이션 인자를 필수로 지정합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: '허용되지 않은 정렬/필터 파라미터 주입을 차단합니다.' },
          { line: 5, code: '  "properties": {', explain: '속성별 제약 범위를 정의합니다.' },
          { line: 6, code: '    "page": { "type": "integer", "minimum": 1 },', explain: '페이지 번호는 1 이상의 정수만 허용합니다.' },
          { line: 7, code: '    "limit": { "type": "integer", "minimum": 1, "maximum": 100 },', explain: '한 번에 조회 가능한 최대 건수를 100건으로 상한 제한합니다.' },
          { line: 8, code: '    "sort": { "type": "string", "enum": ["asc", "desc"] }', explain: 'SQL 정렬 방향은 asc 또는 desc만 허용해 정렬 인젝션을 방지합니다.' },
          { line: 9, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 10, code: '}', explain: '루트 스키마를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '고정 3필드의 범위 및 enum 검사를 즉시 수행합니다.', space: 'Strict', spaceWhy: 'DoS 유발 대용량 limit과 미정의 인자를 차단합니다.' },
        pitfalls: ['limit에 maximum: 100을 두지 않으면 ?limit=1000000 호출 한 번으로 DB 풀 스캔 장애가 발생할 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 limit의 상한(maximum: 100)을 빠져 limit=5000 과부하 요청이 검증을 통과합니다.',
        checklist: ['limit maximum: 100 확인', 'sort enum ["asc", "desc"] 확인'],
        focusLine: 7,
        buggyCode: `{
  "type": "object",
  "required": ["page", "limit", "sort"],
  "additionalProperties": false,
  "properties": {
    "page": { "type": "integer", "minimum": 1 },
    "limit": { "type": "integer", "minimum": 1 },
    "sort": { "type": "string", "enum": ["asc", "desc"] }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["page", "limit", "sort"],
  "additionalProperties": false,
  "properties": {
    "page": { "type": "integer", "minimum": 1 },
    "limit": { "type": "integer", "minimum": 1, "maximum": 100 },
    "sort": { "type": "string", "enum": ["asc", "desc"] }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["page", "limit", "sort"],
  "additionalProperties": false,
  "properties": {
    "page": { "type": "integer", "minimum": 1 },
    "limit": { "type": "integer", "minimum": 1, "maximum": ____ },
    "sort": { "type": "string", "enum": ____ }
  }
}`,
      tests: [
        { input: [{ page: 1, limit: 20, sort: 'desc' }], expected: true, name: '표준 페이지네이션 통과' },
        { input: [{ page: 1, limit: 5000, sort: 'asc' }], expected: false, name: 'limit 상한(100) 초과 거부' },
        { input: [{ page: 0, limit: 20, sort: 'asc' }], expected: false, name: 'page 0 미만 거부' },
        { input: [{ page: 1, limit: 20, sort: 'random' }], expected: false, name: '미허용 정렬 문자열 거부' }
      ]
    },
    {
      id: 'spec_beg_arch_web_3tier',
      title: '웹 3계층(Client → Web → App → DB) 아키텍처 흐름',
      tier: 1,
      level: 'beginner',
      track: 'spec',
      specKind: 'diagram',
      category: 'Architecture DSL',
      complexity: { time: 'Arch', space: 'Live SVG' },
      description: '브라우저가 Web 서버와 App 비즈니스 계층을 거쳐 데이터베이스로 접근하는 표준 3-Tier 웹 아키텍처를 Mermaid 흐름도로 작성합니다.',
      explanation: {
        summary: '프레젠테이션(Web) · 애플리케이션(App) · 데이터(DB) 계층이 순서대로 격리 연결된 표준 3-Tier 토폴로지를 실시간 SVG로 그립니다.',
        keyConcepts: ['3-Tier Architecture', '관심사 분리', 'flowchart LR', '계층 간 경계'],
        lineByLine: [
          { line: 1, code: 'flowchart LR', explain: '좌에서 우로 흐르는 웹 요청 아키텍처 다이어그램입니다.' },
          { line: 2, code: 'Browser[Web Browser] -->|HTTPS| Web[Web Server]', explain: '클라이언트 브라우저가 정적/프록시 웹 서버로 접속합니다.' },
          { line: 3, code: 'Web -->|HTTP Proxy| App(App Server)', explain: '웹 서버가 비즈니스 로직을 담당하는 애플리케이션 서버로 전달합니다.' },
          { line: 4, code: 'App -->|SQL| DB[(Database)]', explain: '오직 App 서버 계층만 영속 데이터베이스에 질의합니다.' }
        ],
        complexity: { time: 'Arch', timeWhy: '4개 노드와 3개 계층 연결선을 즉시 파싱해 렌더링합니다.', space: 'Live SVG', spaceWhy: '3-Tier 좌우 SVG 다이어그램을 생성합니다.' },
        pitfalls: ['Web 서버가 App 로직을 우회해 DB로 직접 연결하면 보안 및 비즈니스 규칙 검증이 무력화됩니다.']
      },
      audit: {
        bugSummary: 'AI가 Web 서버가 App Server를 건너뛰고 바로 DB로 연결되도록 잘못 그려 App 계층 연결이 빠졌습니다.',
        checklist: ['Web -> App -> DB 계층 순서 확인', '4개 노드 및 3개 연결선 확인'],
        focusLine: 3,
        buggyCode: `flowchart LR
Browser[Web Browser] -->|HTTPS| Web[Web Server]
Web -->|Direct SQL| DB[(Database)]`
      },
      entryPoint: 'diagram',
      code: `flowchart LR
Browser[Web Browser] -->|HTTPS| Web[Web Server]
Web -->|HTTP Proxy| App(App Server)
App -->|SQL| DB[(Database)]`,
      skeleton: `flowchart LR
Browser[Web Browser] -->|HTTPS| ____
Web -->|HTTP Proxy| App(App Server)
App -->|SQL| ____`,
      tests: [
        { input: [{ kind: 'direction', direction: 'LR' }], expected: true, name: '좌→우(LR) 3-Tier 방향' },
        { input: [{ kind: 'edge', from: 'Web', to: 'App' }], expected: true, name: 'Web → App 프록시 연결' },
        { input: [{ kind: 'edge', from: 'App', to: 'DB' }], expected: true, name: 'App → DB SQL 연결' },
        { input: [{ kind: 'minCount', nodes: 4, edges: 3 }], expected: true, name: '4계층 노드 · 3연결선 완전성' }
      ]
    },
    {
      id: 'spec_beg_seq_login_basic',
      title: '로그인 인증 시퀀스: Client ↔ Auth ↔ UserDB',
      tier: 1,
      level: 'beginner',
      track: 'spec',
      specKind: 'diagram',
      category: 'Sequence DSL',
      complexity: { time: 'Sequence', space: 'Live SVG' },
      description: '클라이언트가 로그인 자격 증명을 보내면 Auth 서비스가 DB에서 해시 검증 후 세션/토큰을 회신하는 기본 인증 시퀀스를 작성합니다.',
      explanation: {
        summary: '요청(->>)과 응답(-->>) 화살표를 구분해 Auth 서버가 UserDB 조회 후 Client에게 인증 토큰을 돌려주는 왕복 흐름을 명세합니다.',
        keyConcepts: ['sequenceDiagram', '요청(->>) vs 응답(-->>)', 'Auth → DB 조회 분리', '토큰 발급 회신'],
        lineByLine: [
          { line: 1, code: 'sequenceDiagram', explain: '시간축 호출 순서 시퀀스 다이어그램을 시작합니다.' },
          { line: 2, code: 'Client ->> Auth: POST /login', explain: '클라이언트가 Auth 서버로 로그인 자격 증명을 전송합니다.' },
          { line: 3, code: 'Auth ->> DB: Select User Hash', explain: 'Auth 서버가 사용자 해시 레코드를 DB에 조회합니다.' },
          { line: 4, code: 'DB -->> Auth: User Record', explain: 'DB가 점선 응답으로 조회된 사용자 정보를 돌려줍니다.' },
          { line: 5, code: 'Auth -->> Client: 200 JWT Token', explain: '비밀번호 검증 완료 후 Auth가 클라이언트에게 JWT 토큰을 발급합니다.' }
        ],
        complexity: { time: 'Sequence', timeWhy: '3개 참여자 간 4개 왕복 메시지를 즉시 시각화합니다.', space: 'Live SVG', spaceWhy: '실시간 시퀀스 라이프라인 SVG를 생성합니다.' },
        pitfalls: ['Auth -->> Client 응답 메시지가 누락되면 클라이언트가 토큰 수신 여부를 계약에서 확인할 수 없습니다.']
      },
      audit: {
        bugSummary: 'AI가 DB 조회 결과 반환과 Auth -->> Client 최종 JWT 응답 메시지를 생략했습니다.',
        checklist: ['Client -> Auth -> DB -> Auth -> Client 왕복 확인', '점선 응답(-->>) 화살표 확인'],
        focusLine: 5,
        buggyCode: `sequenceDiagram
Client ->> Auth: POST /login
Auth ->> DB: Select User Hash`
      },
      entryPoint: 'diagram',
      code: `sequenceDiagram
Client ->> Auth: POST /login
Auth ->> DB: Select User Hash
DB -->> Auth: User Record
Auth -->> Client: 200 JWT Token`,
      skeleton: `sequenceDiagram
Client ->> Auth: POST /login
Auth ->> ____: Select User Hash
DB -->> Auth: User Record
____ -->> Client: 200 JWT Token`,
      tests: [
        { input: [{ kind: 'message', from: 'Client', to: 'Auth' }], expected: true, name: 'Client → Auth 로그인 요청' },
        { input: [{ kind: 'message', from: 'Auth', to: 'DB' }], expected: true, name: 'Auth → DB 조회 요청' },
        { input: [{ kind: 'message', from: 'DB', to: 'Auth', isDashed: true }], expected: true, name: 'DB -->> Auth 레코드 회신' },
        { input: [{ kind: 'message', from: 'Auth', to: 'Client', isDashed: true }], expected: true, name: 'Auth -->> Client JWT 발급' }
      ]
    }
  );
})(window);
