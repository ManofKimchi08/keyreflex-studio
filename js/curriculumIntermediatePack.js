/**
 * KeyReflex CodeLab - Pack 2: 실전 중급 커리큘럼 (22문제: JS +7, Python +6, C99 +5, Spec +4)
 * - 자료구조 · 슬라이딩 윈도우 · 모노토닉 스택 · 이분 탐색 · 시스템 · AI 평가 · 스펙/다이어그램
 */
(function (global) {
  'use strict';

  const curr = global.CODE_CURRICULUM;
  if (!curr) return;

  // =========================================================================
  // 1. JavaScript 중급 7문제 (level: 'intermediate', tier: 2~3)
  // =========================================================================
  curr.javascript.push(
    {
      id: 'js_mid_group_by_key',
      title: '객체 속성 기준 배열 그룹핑 (groupBy)',
      tier: 2,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '객체 배열의 지정된 속성 key 값을 기준으로 레코드를 분류해 그룹 딕셔너리 객체로 묶습니다.',
      explanation: {
        summary: '각 객체의 item[key]를 추출하고 아직 버킷 배열이 없으면 생성한 뒤 push해 한 번의 순회로 데이터를 그룹화합니다.',
        keyConcepts: ['Group By Aggregation', '동적 키 버킷 생성', '배열 참조 누적', 'O(N) 해시 분류'],
        lineByLine: [
          { line: 1, code: 'function groupByKey(items, key) {', explain: '분류할 객체 배열 items와 그룹 기준 속성명 key를 받습니다.' },
          { line: 2, code: '    const groups = {};', explain: '그룹별 객체 배열을 담을 결과 맵 객체를 초기화합니다.' },
          { line: 3, code: '    for (const item of items) {', explain: '배열의 각 레코드를 순서대로 순회합니다.' },
          { line: 4, code: '        const bucket = item[key];', explain: '현재 레코드의 그룹 키 값을 꺼냅니다.' },
          { line: 5, code: '        if (!Object.prototype.hasOwnProperty.call(groups, bucket)) {', explain: '기존 프로토타입 키와 충돌 없이 해당 그룹 버킷이 있는지 확인하고' },
          { line: 6, code: '            groups[bucket] = [];', explain: '없으면 빈 배열을 초기화합니다.' },
          { line: 7, code: '        }', explain: '버킷 초기화 분기를 닫습니다.' },
          { line: 8, code: '        groups[bucket].push(item);', explain: '해당 그룹 배열에 현재 레코드를 추가합니다.' },
          { line: 9, code: '    }', explain: '전체 순회를 마칩니다.' },
          { line: 10, code: '    return groups;', explain: '그룹화된 결과 객체를 반환합니다.' },
          { line: 11, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개 레코드를 1회 순회하며 해시 버킷에 상수 시간에 삽입합니다.', space: 'O(N)', spaceWhy: '전체 레코드 참조가 그룹 배열에 나누어 저장됩니다.' },
        pitfalls: ['groups[bucket] = [item]으로 덮어써 버리면 이전 항목이 모두 사라지고 각 그룹에 마지막 항목 하나만 남습니다.']
      },
      audit: {
        bugSummary: 'AI가 버킷 배열에 push 대신 [item]으로 매번 새 배열을 덮어써 같은 그룹 요소가 마지막 1개만 남습니다.',
        checklist: ['버킷 존재 확인 후 push(item) 누적 확인', '빈 배열 {} 반환 확인'],
        focusLine: 8,
        buggyCode: `function groupByKey(items, key) {
    const groups = {};
    for (const item of items) {
        const bucket = item[key];
        groups[bucket] = [item];
    }
    return groups;
}`
      },
      entryPoint: 'groupByKey',
      code: `function groupByKey(items, key) {
    const groups = {};
    for (const item of items) {
        const bucket = item[key];
        if (!Object.prototype.hasOwnProperty.call(groups, bucket)) {
            groups[bucket] = [];
        }
        groups[bucket].push(item);
    }
    return groups;
}`,
      skeleton: `function groupByKey(items, key) {
    const groups = {};
    for (const item of items) {
        const bucket = item[key];
        if (!Object.prototype.hasOwnProperty.call(groups, bucket)) {
            groups[bucket] = ____;
        }
        ____;
    }
    return groups;
}`,
      tests: [
        { input: [[{ role: 'be', id: 1 }, { role: 'ai', id: 2 }, { role: 'be', id: 3 }], 'role'], expected: { be: [{ role: 'be', id: 1 }, { role: 'be', id: 3 }], ai: [{ role: 'ai', id: 2 }] }, name: 'role 키 기준 그룹핑' },
        { input: [[], 'role'], expected: {}, name: '빈 배열 안전 처리' }
      ]
    },
    {
      id: 'js_mid_merge_intervals',
      title: '겹치는 구간 병합하기 (Merge Intervals)',
      tier: 3,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: '회의실 예약 시간 등 [start, end] 구간 목록을 시작 시각 기준으로 정렬한 뒤 맞닿거나 겹치는 구간들을 하나로 합칩니다.',
      explanation: {
        summary: '시작 시각 오름차순으로 정렬하면 이전 병합 구간의 끝(last[1])과 다음 구간의 시작(cur[0])만 비교해 Math.max(last[1], cur[1])로 쉽게 합칠 수 있습니다.',
        keyConcepts: ['Interval Sorting', '불변 복사본 ([...pair])', '맞닿는 경계(cur[0] <= last[1])', 'Math.max 끝점 갱신'],
        lineByLine: [
          { line: 1, code: 'function mergeIntervals(intervals) {', explain: '[시작, 끝] 구간 배열을 입력받습니다.' },
          { line: 2, code: '    if (intervals.length === 0) return [];', explain: '빈 입력은 즉시 빈 배열을 반환합니다.' },
          { line: 3, code: '    const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0]);', explain: '원본 변형 없이 복사해 시작 시각 오름차순으로 정렬합니다.' },
          { line: 4, code: '    const merged = [sorted[0]];', explain: '첫 구간을 결과에 넣고 병합 기준을 시작합니다.' },
          { line: 5, code: '    for (let i = 1; i < sorted.length; i++) {', explain: '나머지 구간들을 차례대로 확인합니다.' },
          { line: 6, code: '        const last = merged[merged.length - 1];', explain: '가장 최근에 병합된 마지막 구간을 참조합니다.' },
          { line: 7, code: '        const [s, e] = sorted[i];', explain: '현재 확인 중인 구간의 시작·끝 시각을 꺼냅니다.' },
          { line: 8, code: '        if (s <= last[1]) {', explain: '현재 시작이 이전 끝 이하면 두 구간이 겹치거나 맞닿은 것입니다.' },
          { line: 9, code: '            last[1] = Math.max(last[1], e);', explain: '포함되는 짧은 구간이 끝을 줄이지 않도록 더 큰 끝값으로 확장합니다.' },
          { line: 10, code: '        } else {', explain: '서로 떨어진 구간이면' },
          { line: 11, code: '            merged.push([s, e]);', explain: '새 독립 구간으로 결과 배열에 추가합니다.' },
          { line: 12, code: '        }', explain: '분기 종료' },
          { line: 13, code: '    }', explain: '루프 종료' },
          { line: 14, code: '    return merged;', explain: '병합 완료된 구간 배열을 반환합니다.' },
          { line: 15, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: '구간 정렬 O(N log N) 후 선형 병합 O(N)을 수행합니다.', space: 'O(N)', spaceWhy: '정렬 사본과 병합 배열을 생성합니다.' },
        pitfalls: ['last[1] = e 로 직접 덮어쓰면 [1, 10] 안에 포함된 [2, 5]를 만난 뒤 끝값이 5로 줄어드는 버그가 생깁니다.']
      },
      audit: {
        bugSummary: 'AI가 끝점 병합 시 Math.max(last[1], e) 대신 last[1] = e를 바로 대입해 [1, 10]과 [2, 5] 합칠 때 [1, 5]로 축소됩니다.',
        checklist: ['last[1] = Math.max(last[1], e) 확인', 's <= last[1] 맞닿은 구간 경계 확인'],
        focusLine: 9,
        buggyCode: `function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0]);
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const [s, e] = sorted[i];
        if (s <= last[1]) {
            last[1] = e;
        } else {
            merged.push([s, e]);
        }
    }
    return merged;
}`
      },
      entryPoint: 'mergeIntervals',
      code: `function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0]);
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const [s, e] = sorted[i];
        if (s <= last[1]) {
            last[1] = Math.max(last[1], e);
        } else {
            merged.push([s, e]);
        }
    }
    return merged;
}`,
      skeleton: `function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0]);
    const merged = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const [s, e] = sorted[i];
        if (____) {
            last[1] = ____;
        } else {
            merged.push([s, e]);
        }
    }
    return merged;
}`,
      tests: [
        { input: [[[1, 3], [8, 10], [2, 6], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]], name: '미정렬 겹침 구간 병합' },
        { input: [[[1, 10], [2, 5], [10, 12]]], expected: [[1, 12]], name: '포함 구간 + 맞닿는 경계 병합' },
        { input: [[]], expected: [], name: '빈 배열 처리' }
      ]
    },
    {
      id: 'js_mid_sliding_max_sum',
      title: '고정 크기 슬라이딩 윈도우 최대 구간 합',
      tier: 2,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '매번 길이 K를 다시 더하지 않고(O(N*K)), 나가는 원소를 빼고 들어오는 원소를 더해 O(N)에 연속 K개 최대 합을 구합니다.',
      explanation: {
        summary: '첫 창 [0..k-1]의 합으로 best와 winSum을 초기화한 뒤 i = k부터 winSum += nums[i] - nums[i - k]로 한 칸씩 미끄러지며 최댓값을 갱신합니다.',
        keyConcepts: ['Fixed Sliding Window O(N)', '차분 갱신 (+nums[i] -nums[i-k])', '음수 배열 best=winSum', '범위 초과 k 방어'],
        lineByLine: [
          { line: 1, code: 'function maxWindowSum(nums, k) {', explain: '정수 배열 nums와 연속 창 길이 k를 입력받습니다.' },
          { line: 2, code: '    if (k <= 0 || k > nums.length) return 0;', explain: '유효하지 않은 창 길이이거나 배열보다 큰 경우 0을 반환합니다.' },
          { line: 3, code: '    let winSum = 0;', explain: '첫 k개 원소의 창 합계를 계산할 변수입니다.' },
          { line: 4, code: '    for (let i = 0; i < k; i++) winSum += nums[i];', explain: '초기 윈도우 [0..k-1] 합을 구합니다.' },
          { line: 5, code: '    let best = winSum;', explain: '음수 원소 전용 배열에서도 안전하도록 best를 첫 창 합으로 둡니다.' },
          { line: 6, code: '    for (let i = k; i < nums.length; i++) {', explain: '인덱스 k부터 한 칸씩 오른쪽으로 창을 이동합니다.' },
          { line: 7, code: '        winSum += nums[i] - nums[i - k];', explain: '새로 들어온 원소는 더하고 창 왼쪽으로 빠진 원소는 빼서 O(1) 갱신합니다.' },
          { line: 8, code: '        if (winSum > best) best = winSum;', explain: '현재 창 합이 기존 최대보다 크면 best를 업데이트합니다.' },
          { line: 9, code: '    }', explain: '슬라이딩 루프를 마칩니다.' },
          { line: 10, code: '    return best;', explain: '연속 k개 원소의 최대 합을 반환합니다.' },
          { line: 11, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '배열 원소를 최대 2번씩만 참조하는 선형 시간입니다.', space: 'O(1)', spaceWhy: '합계 변수 winSum, best만 사용합니다.' },
        pitfalls: ['winSum에서 이전 원소(nums[i - k])를 빼지 않으면 그냥 누적 총합이 되어 오답이 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 윈도우 왼쪽 이탈 원소(- nums[i - k]) 빼기를 누락해 창 크기가 계속 불어납니다.',
        checklist: ['winSum += nums[i] - nums[i - k] 차분 갱신 확인', '음수 배열 및 k 범위 초과 처리 확인'],
        focusLine: 7,
        buggyCode: `function maxWindowSum(nums, k) {
    if (k <= 0 || k > nums.length) return 0;
    let winSum = 0;
    for (let i = 0; i < k; i++) winSum += nums[i];
    let best = winSum;
    for (let i = k; i < nums.length; i++) {
        winSum += nums[i];
        if (winSum > best) best = winSum;
    }
    return best;
}`
      },
      entryPoint: 'maxWindowSum',
      code: `function maxWindowSum(nums, k) {
    if (k <= 0 || k > nums.length) return 0;
    let winSum = 0;
    for (let i = 0; i < k; i++) winSum += nums[i];
    let best = winSum;
    for (let i = k; i < nums.length; i++) {
        winSum += nums[i] - nums[i - k];
        if (winSum > best) best = winSum;
    }
    return best;
}`,
      skeleton: `function maxWindowSum(nums, k) {
    if (k <= 0 || k > nums.length) return 0;
    let winSum = 0;
    for (let i = 0; i < k; i++) winSum += nums[i];
    let best = winSum;
    for (let i = k; i < nums.length; i++) {
        winSum += ____;
        if (winSum > best) ____;
    }
    return best;
}`,
      tests: [
        { input: [[2, 1, 5, 1, 3, 2], 3], expected: 9, name: '길이 3 최대 창 합 (5+1+3=9)' },
        { input: [[-5, -2, -1, -8], 2], expected: -3, name: '음수 전용 배열 (-2 + -1)' },
        { input: [[1, 2], 5], expected: 0, name: 'k > 길이 방어' }
      ]
    },
    {
      id: 'js_mid_query_string_parse',
      title: 'URL 쿼리 스트링 안전 파서 (Query Parser)',
      tier: 2,
      level: 'intermediate',
      track: 'architecture',
      category: 'Web / HTTP',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: "URL '?page=2&token=ab=c&empty' 처럼 값 안에 '='이 포함되거나 값이 없는 키도 정확히 파싱하는 HTTP 쿼리 파서를 구현합니다.",
      explanation: {
        summary: "단순 split('=')은 값 내부에 포함된 '='(Base64 토큰 등) 이후를 잘라 버리므로 첫 '=' 위치를 indexOf('=')로 찾아 분리하고 decodeURIComponent로 디코딩합니다.",
        keyConcepts: ['Query String Parsing', '첫 구분자 indexOf("=")', 'decodeURIComponent 디코딩', '빈 값 & ? 접두사 처리'],
        lineByLine: [
          { line: 1, code: 'function parseQueryString(qs) {', explain: 'URL 쿼리 문자열 qs를 입력받습니다.' },
          { line: 2, code: "    const clean = (qs || '').replace(/^\\?/, '');", explain: '선행 물음표(?)를 제거하고 빈 입력을 방어합니다.' },
          { line: 3, code: '    if (!clean) return {};', explain: '파라미터가 없으면 빈 객체를 반환합니다.' },
          { line: 4, code: '    const params = {};', explain: '파싱된 키-값 쌍을 저장할 객체입니다.' },
          { line: 5, code: "    for (const part of clean.split('&')) {", explain: '& 구분자로 각 파라미터 항목을 순회합니다.' },
          { line: 6, code: '        if (!part) continue;', explain: '&& 등 빈 조각을 건너뜁니다.' },
          { line: 7, code: "        const eq = part.indexOf('=');", explain: "Base64 값 내 '=' 손실을 막기 위해 첫 번째 '=' 위치만 찾습니다." },
          { line: 8, code: '        const rawKey = eq === -1 ? part : part.slice(0, eq);', explain: "'=' 앞부분(또는 전체)을 키 문자열로 자릅니다." },
          { line: 9, code: "        const rawVal = eq === -1 ? '' : part.slice(eq + 1);", explain: "'=' 이후 전체를 값으로 보존하며 '='가 없으면 빈 문자열로 둡니다." },
          { line: 10, code: '        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);', explain: '퍼센트 인코딩(%20 등)을 해독해 키-값 쌍을 저장합니다.' },
          { line: 11, code: '    }', explain: '파라미터 순회를 마칩니다.' },
          { line: 12, code: '    return params;', explain: '파싱 완료된 쿼리 맵 객체를 반환합니다.' },
          { line: 13, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '쿼리 문자열 길이 N을 1회 분리·디코딩합니다.', space: 'O(N)', spaceWhy: '분리된 키-값 엔트리를 저장합니다.' },
        pitfalls: ["const [k, v] = part.split('=') 방식은 token=abc== 같은 Base64 값에서 '==' 부분을 통째로 잃어버립니다."]
      },
      audit: {
        bugSummary: "AI가 part.split('=') 분해 할당을 사용해 값 내부 '='(sig=a=b=) 뒷부분이 유실됩니다.",
        checklist: ['indexOf("=") 기반 첫 등호 분리 확인', '선행 ? 제거 및 퍼센트 디코딩 확인'],
        focusLine: 7,
        buggyCode: `function parseQueryString(qs) {
    const clean = (qs || '').replace(/^\\?/, '');
    if (!clean) return {};
    const params = {};
    for (const part of clean.split('&')) {
        if (!part) continue;
        const [rawKey, rawVal = ''] = part.split('=');
        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
    }
    return params;
}`
      },
      entryPoint: 'parseQueryString',
      code: `function parseQueryString(qs) {
    const clean = (qs || '').replace(/^\\?/, '');
    if (!clean) return {};
    const params = {};
    for (const part of clean.split('&')) {
        if (!part) continue;
        const eq = part.indexOf('=');
        const rawKey = eq === -1 ? part : part.slice(0, eq);
        const rawVal = eq === -1 ? '' : part.slice(eq + 1);
        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
    }
    return params;
}`,
      skeleton: `function parseQueryString(qs) {
    const clean = (qs || '').replace(/^\\?/, '');
    if (!clean) return {};
    const params = {};
    for (const part of clean.split('&')) {
        if (!part) continue;
        const eq = ____;
        const rawKey = eq === -1 ? part : part.slice(0, eq);
        const rawVal = eq === -1 ? '' : ____;
        params[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
    }
    return params;
}`,
      tests: [
        { input: ['?q=ai%20rag&token=ab=c==&flag'], expected: { q: 'ai rag', token: 'ab=c==', flag: '' }, name: '인코딩 + 값 내 등호(=) 보존 + 값 없는 플래그' },
        { input: [''], expected: {}, name: '빈 쿼리 안전 처리' }
      ]
    },
    {
      id: 'js_mid_deep_merge_config',
      title: '설정 객체 불변 재귀 병합 (Deep Merge 리팩터링)',
      tier: 3,
      level: 'intermediate',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(K)', space: 'O(K)' },
      description: '얕은 복사({...base, ...override}) 시 중첩 객체(db.host 등)가 통째로 날아가는 버그를 막기 위해 평면 객체만 재귀 병합하는 순수 Deep Merge를 구현합니다.',
      refactoringGoal: '1단계 전개 연산자({...base, ...override})로 중첩 기본 설정이 덮어씌워지는 코드를 불변 재귀 병합으로 리팩터링하세요.',
      refactoringBefore: `function mergeConfig(base, override) {
    return { ...base, ...override };
}`,
      explanation: {
        summary: '배열·null·원시값은 그대로 덮어쓰되 양쪽 값이 모두 일반 객체(isObj)일 때만 재귀적으로 mergeConfig를 호출해 중첩 키를 보존합니다.',
        keyConcepts: ['Immutable Deep Merge', 'Plain Object 판별 (!Array.isArray)', '재귀 병합 (Recursion)', '원본 객체 비변형'],
        lineByLine: [
          { line: 1, code: 'function mergeConfig(base, override) {', explain: '기본 설정 base와 덮어쓸 설정 override를 입력받습니다.' },
          { line: 2, code: "    const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);", explain: 'null과 배열을 제외한 순수 딕셔너리 객체인지 판별하는 헬퍼입니다.' },
          { line: 3, code: '    const out = { ...base };', explain: '원본 base가 변경되지 않도록 얕은 복제본을 먼저 생성합니다.' },
          { line: 4, code: '    for (const key of Object.keys(override)) {', explain: 'override에 지정된 설정 키들을 순회합니다.' },
          { line: 5, code: '        if (isObj(override[key]) && isObj(out[key])) {', explain: '양쪽 모두 중첩 일반 객체이면 얕게 덮지 않고' },
          { line: 6, code: '            out[key] = mergeConfig(out[key], override[key]);', explain: '재귀 호출로 내부 하위 설정을 살린 채 병합합니다.' },
          { line: 7, code: '        } else {', explain: '원시값, 배열 또는 한쪽만 객체인 경우' },
          { line: 8, code: '            out[key] = override[key];', explain: 'override의 새 값으로 교체합니다.' },
          { line: 9, code: '        }', explain: '분기 종료' },
          { line: 10, code: '    }', explain: '키 순회 루프 종료' },
          { line: 11, code: '    return out;', explain: '원본 불변성이 유지된 병합 설정 객체를 반환합니다.' },
          { line: 12, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(K)', timeWhy: '전체 설정 키 노드 수 K에 비례해 병합합니다.', space: 'O(K)', spaceWhy: '새 병합 설정 트리 및 재귀 깊이만큼 사용합니다.' },
        pitfalls: ['배열을 !Array.isArray로 거르지 않으면 배열까지 인덱스 키 객체({0: ..., 1: ...})로 망가질 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 얕은 복사({...base, ...override})로 대체해 중첩된 db.host 기본 설정이 통째로 사라집니다.',
        checklist: ['중첩 일반 객체 재귀 병합(mergeConfig) 확인', '배열·null 덮어쓰기 구분 확인'],
        focusLine: 6,
        buggyCode: `function mergeConfig(base, override) {
    return { ...base, ...override };
}`
      },
      entryPoint: 'mergeConfig',
      code: `function mergeConfig(base, override) {
    const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    const out = { ...base };
    for (const key of Object.keys(override)) {
        if (isObj(override[key]) && isObj(out[key])) {
            out[key] = mergeConfig(out[key], override[key]);
        } else {
            out[key] = override[key];
        }
    }
    return out;
}`,
      skeleton: `function mergeConfig(base, override) {
    const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    const out = { ...base };
    for (const key of Object.keys(override)) {
        if (____) {
            out[key] = ____;
        } else {
            out[key] = override[key];
        }
    }
    return out;
}`,
      tests: [
        { input: [{ db: { host: 'localhost', port: 5432 }, tags: ['v1'] }, { db: { port: 3306 } }], expected: { db: { host: 'localhost', port: 3306 }, tags: ['v1'] }, name: '중첩 db.host 보존 & port만 갱신' },
        { input: [{ a: { x: 1 }, list: [1, 2] }, { a: null, list: [3] }], expected: { a: null, list: [3] }, name: 'null과 배열은 안전하게 덮어쓰기' }
      ]
    },
    {
      id: 'js_mid_ai_cosine_ranker',
      title: 'JS 벡터 코사인 유사도 RAG 문서 랭커',
      tier: 3,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(M * D + M log M)', space: 'O(M)' },
      description: '프론트엔드·Edge Worker 환경에서 순수 JS로 임베딩 벡터 코사인 유사도를 계산하고 상위 topK 문서 ID를 검색합니다.',
      explanation: {
        summary: '두 벡터의 내적 dot과 L2 노름(Math.hypot)으로 코사인 유사도를 구하되, 영벡터 분모 0을 방어하고 유사도 내림차순으로 topK를 자릅니다.',
        keyConcepts: ['Cosine Similarity (JS)', 'Dot Product Loop', 'Zero-Norm 방어', '내림차순 랭킹 + slice(0, topK)'],
        lineByLine: [
          { line: 1, code: 'function rankByCosine(query, docs, topK) {', explain: '질의 임베딩 query, {id, vec} 문서 배열, 추출 수 topK를 받습니다.' },
          { line: 2, code: '    const sim = (a, b) => {', explain: '두 벡터의 코사인 유사도를 구하는 내부 함수입니다.' },
          { line: 3, code: '        let dot = 0, na = 0, nb = 0;', explain: '내적 합과 각 벡터의 제곱합 누산기를 초기화합니다.' },
          { line: 4, code: '        for (let i = 0; i < a.length; i++) {', explain: '임베딩 차원을 따라 순회하며' },
          { line: 5, code: '            dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];', explain: '내적과 각 벡터 크기 제곱합을 한 패스에 계산합니다.' },
          { line: 6, code: '        }', explain: '차원 루프 종료' },
          { line: 7, code: '        const denom = Math.sqrt(na) * Math.sqrt(nb);', explain: '두 벡터 L2 노름의 곱(분모)을 구합니다.' },
          { line: 8, code: '        return denom > 0 ? dot / denom : 0;', explain: '분모가 0(영벡터)일 때 NaN을 막고 0을 반환합니다.' },
          { line: 9, code: '    };', explain: 'sim 헬퍼 종료' },
          { line: 10, code: '    return docs', explain: '문서들을 유사도 점수화·정렬해 상위 K개 ID를 반환합니다.' },
          { line: 11, code: '        .map((d) => ({ id: d.id, score: sim(query, d.vec) }))', explain: '각 문서에 코사인 유사도 score를 붙입니다.' },
          { line: 12, code: '        .sort((x, y) => y.score - x.score || x.id.localeCompare(y.id))', explain: '유사도 내림차순(동점이면 ID 오름차순) 정렬합니다.' },
          { line: 13, code: '        .slice(0, topK)', explain: '상위 topK개만 잘라냅니다.' },
          { line: 14, code: '        .map((d) => d.id);', explain: '문서 ID 목록만 추출해 반환합니다.' },
          { line: 15, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(M * D + M log M)', timeWhy: 'D차원 벡터 M개 유사도 산출 후 점수 정렬을 수행합니다.', space: 'O(M)', spaceWhy: 'M개 점수 객체 배열을 생성합니다.' },
        pitfalls: ['sort((x, y) => x.score - y.score) 오름차순으로 쓰면 가장 관련 없는 문서가 상위에 뜹니다.']
      },
      audit: {
        bugSummary: 'AI가 sort 비교 방향을 x.score - y.score 오름차순으로 작성해 가장 유사도가 낮은 문서가 1위로 반환됩니다.',
        checklist: ['내림차순(y.score - x.score) 정렬 확인', 'denom > 0 영벡터 NaN 방어 확인'],
        focusLine: 12,
        buggyCode: `function rankByCosine(query, docs, topK) {
    const sim = (a, b) => {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
        }
        const denom = Math.sqrt(na) * Math.sqrt(nb);
        return denom > 0 ? dot / denom : 0;
    };
    return docs
        .map((d) => ({ id: d.id, score: sim(query, d.vec) }))
        .sort((x, y) => x.score - y.score || x.id.localeCompare(y.id))
        .slice(0, topK)
        .map((d) => d.id);
}`
      },
      entryPoint: 'rankByCosine',
      code: `function rankByCosine(query, docs, topK) {
    const sim = (a, b) => {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
        }
        const denom = Math.sqrt(na) * Math.sqrt(nb);
        return denom > 0 ? dot / denom : 0;
    };
    return docs
        .map((d) => ({ id: d.id, score: sim(query, d.vec) }))
        .sort((x, y) => y.score - x.score || x.id.localeCompare(y.id))
        .slice(0, topK)
        .map((d) => d.id);
}`,
      skeleton: `function rankByCosine(query, docs, topK) {
    const sim = (a, b) => {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
        }
        const denom = Math.sqrt(na) * Math.sqrt(nb);
        return denom > 0 ? dot / denom : 0;
    };
    return docs
        .map((d) => ({ id: d.id, score: sim(query, d.vec) }))
        .sort((x, y) => ____ || x.id.localeCompare(y.id))
        .slice(0, ____)
        .map((d) => d.id);
}`,
      tests: [
        { input: [[1, 0], [{ id: 'far', vec: [0, 1] }, { id: 'best', vec: [0.95, 0.05] }, { id: 'mid', vec: [1, 1] }], 2], expected: ['best', 'mid'], name: '유사도 Top-2 내림차순 랭킹' },
        { input: [[0, 0], [{ id: 'a', vec: [1, 2] }, { id: 'b', vec: [3, 4] }], 1], expected: ['a'], name: '영벡터 분모 0 NaN 방지 + 타이브레이킹' }
      ]
    },
    {
      id: 'js_mid_sliding_log_limiter',
      title: 'JS 투 포인터 슬라이딩 윈도우 API 제한기',
      tier: 3,
      level: 'intermediate',
      track: 'system_design',
      category: 'System Design',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '배열 shift()(O(N)) 없이 head 인덱스 포인터만 전진시켜 분할 상환 O(1)로 API 요청 허용 여부를 판정합니다.',
      explanation: {
        summary: 'JS 배열의 shift()는 O(N) 비용이 들므로 허용 로그 log 배열과 시작 커서 head를 전진시키며 최근 win초 내 요청 수가 limit 미만인지 검사합니다.',
        keyConcepts: ['Amortized O(1) Head Pointer', 'JS shift() O(N) 회피', '슬라이딩 윈도우 경계 (<= t - win)', '허용된 요청만 로그 기록'],
        lineByLine: [
          { line: 1, code: 'function filterRateLimit(times, win, limit) {', explain: '요청 시각 배열 times, 창 길이 win, 상한 limit를 입력받습니다.' },
          { line: 2, code: '    const log = [];', explain: '실제 허용된 요청의 타임스탬프를 순서대로 담을 로그입니다.' },
          { line: 3, code: '    let head = 0;', explain: '현재 유효 윈도우의 가장 오래된 허용 요청을 가리키는 커서입니다.' },
          { line: 4, code: '    const out = [];', explain: '요청마다 허용(true)/거부(false) 불리언을 기록합니다.' },
          { line: 5, code: '    for (const t of times) {', explain: '시간순으로 들어오는 요청 시각을 순회합니다.' },
          { line: 6, code: '        while (head < log.length && log[head] <= t - win) head++;', explain: 'win초 밖으로 지난 오래된 로그를 shift 없이 head++로 O(1) 만료합니다.' },
          { line: 7, code: '        if (log.length - head < limit) {', explain: '현재 창 내 유효 허용 건수가 limit 미만이면' },
          { line: 8, code: '            log.push(t);', explain: '요청 시각을 허용 로그에 남기고' },
          { line: 9, code: '            out.push(true);', explain: '통과(true)를 기록합니다.' },
          { line: 10, code: '        } else {', explain: '상한에 도달한 경우' },
          { line: 11, code: '            out.push(false);', explain: '차단(false) 처리하고 log에는 추가하지 않습니다.' },
          { line: 12, code: '        }', explain: '허용 분기를 닫습니다.' },
          { line: 13, code: '    }', explain: '루프 종료' },
          { line: 14, code: '    return out;', explain: '판별 결과 배열을 반환합니다.' },
          { line: 15, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'head와 log.push가 각각 최대 N번만 증가하므로 총 O(N)입니다.', space: 'O(N)', spaceWhy: '허용 로그와 출력 배열 크기가 최대 N입니다.' },
        pitfalls: ['head 인덱스를 빼지 않고 log.length만 limit과 비교하면 만료된 과거 요청까지 계속 발목을 잡아 모든 후속 요청이 차단됩니다.']
      },
      audit: {
        bugSummary: 'AI가 차단 시(else)에도 잘못 log.push(t)를 수행해 거절된 트래픽이 창을 계속 점유합니다.',
        checklist: ['허용 분기에서만 log.push(t) 확인', 'log.length - head < limit 창 크기 계산 확인'],
        focusLine: 8,
        buggyCode: `function filterRateLimit(times, win, limit) {
    const log = [];
    let head = 0;
    const out = [];
    for (const t of times) {
        log.push(t);
        while (head < log.length && log[head] <= t - win) head++;
        if (log.length - head <= limit) {
            out.push(true);
        } else {
            out.push(false);
        }
    }
    return out;
}`
      },
      entryPoint: 'filterRateLimit',
      code: `function filterRateLimit(times, win, limit) {
    const log = [];
    let head = 0;
    const out = [];
    for (const t of times) {
        while (head < log.length && log[head] <= t - win) head++;
        if (log.length - head < limit) {
            log.push(t);
            out.push(true);
        } else {
            out.push(false);
        }
    }
    return out;
}`,
      skeleton: `function filterRateLimit(times, win, limit) {
    const log = [];
    let head = 0;
    const out = [];
    for (const t of times) {
        while (head < log.length && ____) head++;
        if (____ < limit) {
            log.push(t);
            out.push(true);
        } else {
            out.push(false);
        }
    }
    return out;
}`,
      tests: [
        { input: [[1, 2, 3, 4, 11], 10, 2], expected: [true, true, false, false, true], name: 't=11 시 t=1 만료되어 복구 허용' },
        { input: [[0, 5, 5], 5, 1], expected: [true, true, false], name: 't=5 정확히 만료 경계 통과 후 연속 차단' }
      ]
    }
  );

  // =========================================================================
  // 2. Python 중급 6문제 (level: 'intermediate', tier: 2~3)
  // =========================================================================
  curr.python.push(
    {
      id: 'py_mid_merge_intervals',
      title: '겹치는 구간 정렬 & 병합 (Merge Intervals)',
      tier: 2,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: '[start, end] 시간표·구간 목록을 시작점 순 정렬 후 겹치거나 인접한 구간을 하나로 합칩니다.',
      explanation: {
        summary: '정렬된 구간을 순회하며 cur_start <= merged[-1][1]이면 끝값을 max()로 확장해 통합합니다.',
        keyConcepts: ['Interval Merge Pattern', 'sorted(..., key=lambda x: x[0])', '사본 리스트 생성', 'max 끝점 갱신'],
        lineByLine: [
          { line: 1, code: 'def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:', explain: '[start, end] 구간 리스트를 입력받습니다.' },
          { line: 2, code: '    if not intervals:', explain: '빈 목록이 들어오면' },
          { line: 3, code: '        return []', explain: '빈 리스트를 즉시 반환합니다.' },
          { line: 4, code: '    ordered = sorted((list(iv) for iv in intervals), key=lambda x: x[0])', explain: '원본 리스트 변경 없이 복사 정렬합니다.' },
          { line: 5, code: '    merged = [ordered[0]]', explain: '첫 구간을 초기 병합 결과에 추가합니다.' },
          { line: 6, code: '    for s, e in ordered[1:]:', explain: '두 번째 구간부터 시작점 s, 끝점 e를 순회합니다.' },
          { line: 7, code: '        if s <= merged[-1][1]:', explain: '현재 구간이 마지막 병합 구간과 겹치거나 맞닿으면' },
          { line: 8, code: '            merged[-1][1] = max(merged[-1][1], e)', explain: '더 먼 끝점으로 구간의 끝을 확장합니다.' },
          { line: 9, code: '        else:', explain: '서로 떨어진 별개 구간이면' },
          { line: 10, code: '            merged.append([s, e])', explain: '새 구간으로 추가합니다.' },
          { line: 11, code: '    return merged', explain: '병합된 구간 목록을 반환합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: '구간 정렬 O(N log N) + 단일 패스 병합 O(N)입니다.', space: 'O(N)', spaceWhy: '새 정렬 및 병합 리스트를 생성합니다.' },
        pitfalls: ['s < merged[-1][1]처럼 등호를 빼면 [1, 4]와 [4, 5]처럼 끝점에서 딱 만나는 구간이 합쳐지지 않습니다.']
      },
      audit: {
        bugSummary: 'AI가 겹침 판별에 s <= merged[-1][1] 대신 s < merged[-1][1]을 사용해 [1, 4]와 [4, 6]이 병합되지 않습니다.',
        checklist: ['s <= merged[-1][1] 맞닿은 경계 포함 확인', 'max(merged[-1][1], e) 포함 구간 처리 확인'],
        focusLine: 7,
        buggyCode: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    ordered = sorted((list(iv) for iv in intervals), key=lambda x: x[0])
    merged = [ordered[0]]
    for s, e in ordered[1:]:
        if s < merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged`
      },
      entryPoint: 'merge_intervals',
      code: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    ordered = sorted((list(iv) for iv in intervals), key=lambda x: x[0])
    merged = [ordered[0]]
    for s, e in ordered[1:]:
        if s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged`,
      skeleton: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    ordered = sorted((list(iv) for iv in intervals), key=lambda x: x[0])
    merged = [ordered[0]]
    for s, e in ordered[1:]:
        if ____:
            merged[-1][1] = ____
        else:
            merged.append([s, e])
    return merged`,
      tests: [
        { input: [[[1, 4], [4, 6], [8, 10]]], expected: [[1, 6], [8, 10]], name: '경계 [1,4]+[4,6] -> [1,6] 병합' },
        { input: [[[6, 8], [1, 9], [2, 4]]], expected: [[1, 9]], name: '완전 포함 구간 통합' },
        { input: [[]], expected: [], name: '빈 리스트 처리' }
      ]
    },
    {
      id: 'py_mid_top_k_frequent',
      title: 'Counter 기반 Top-K 최빈 요소 추출',
      tier: 2,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Data Structure',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: 'collections.Counter로 빈도를 집계한 뒤 빈도 내림차순 · 동점 시 값 오름차순으로 상위 k개 숫자를 결정적으로 반환합니다.',
      explanation: {
        summary: 'Counter(nums)의 항목을 key=lambda item: (-item[1], item[0])으로 정렬해 동점 시에도 일관된 순서로 상위 k개를 반환합니다.',
        keyConcepts: ['collections.Counter', '다중 기준 정렬 (-freq, val)', '결정적 출력 순서', 'k <= 0 경계 방어'],
        lineByLine: [
          { line: 1, code: 'from collections import Counter', explain: '빈도 집계를 위한 표준 Counter 클래스를 불러옵니다.' },
          { line: 3, code: 'def top_k_frequent(nums: list[int], k: int) -> list[int]:', explain: '정수 리스트 nums와 뽑을 개수 k를 입력받습니다.' },
          { line: 4, code: '    if k <= 0:', explain: '0 이하 개수 요청 시' },
          { line: 5, code: '        return []', explain: '빈 리스트를 반환합니다.' },
          { line: 6, code: '    freq = Counter(nums)', explain: 'O(N)에 각 숫자의 등장 횟수를 집계합니다.' },
          { line: 7, code: '    ranked = sorted(freq.items(), key=lambda item: (-item[1], item[0]))', explain: '빈도 내림차순(-item[1]), 동점일 때는 숫자 오름차순(item[0])으로 정렬합니다.' },
          { line: 8, code: '    return [num for num, _ in ranked[:k]]', explain: '상위 k개 숫자만 추출해 반환합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: '빈도 계산 O(N) 후 고유 원소 수 U에 대해 O(U log U) 정렬을 수행합니다.', space: 'O(N)', spaceWhy: 'Counter 맵과 정렬 리스트 공간이 필요합니다.' },
        pitfalls: ['빈도만 내림차순 정렬하고 타이브레이커(item[0])를 두지 않으면 입력 순서에 따라 결과가 달라질 수 있으며, -item[1]의 음수 부호가 빠지면 최빈값이 뒤로 밀립니다.']
      },
      audit: {
        bugSummary: 'AI가 sorted 키에 -item[1] 대신 양수 item[1]을 지정해 가장 적게 나온 원소가 Top-K로 반환됩니다.',
        checklist: ['(-item[1], item[0]) 내림차순 정렬 확인', 'k <= 0 경계 처리 확인'],
        focusLine: 7,
        buggyCode: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    freq = Counter(nums)
    ranked = sorted(freq.items(), key=lambda item: (item[1], item[0]))
    return [num for num, _ in ranked[:k]]`
      },
      entryPoint: 'top_k_frequent',
      code: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    freq = Counter(nums)
    ranked = sorted(freq.items(), key=lambda item: (-item[1], item[0]))
    return [num for num, _ in ranked[:k]]`,
      skeleton: `from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    freq = Counter(nums)
    ranked = sorted(freq.items(), key=lambda item: (____, item[0]))
    return [num for num, _ in ____]`,
      tests: [
        { input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2], name: '빈도 상위 2개 [1, 2]' },
        { input: [[5, 3, 5, 3, 1], 2], expected: [3, 5], name: '빈도 동점(2회) 시 작은 값 우선 [3, 5]' },
        { input: [[1, 2], 0], expected: [], name: 'k=0 처리' }
      ]
    },
    {
      id: 'py_mid_next_greater_stack',
      title: '모노토닉 감소 스택 (Next Greater Element)',
      tier: 3,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '단조 감소 스택(Monotonic Stack)으로 각 원소 오른쪽에서 처음 만나는 더 큰 숫자를 O(N^2) 대신 O(N)에 찾습니다.',
      explanation: {
        summary: '아직 답을 못 찾은 인덱스를 스택에 담아두다가 현재 값 val이 스택 꼭대기 값보다 크면 pop()하며 결과를 val로 채우는 O(N) 스택 패턴입니다.',
        keyConcepts: ['Monotonic Stack O(N)', '인덱스 스택 저장', 'while stack and < val', '기본값 -1 초기화'],
        lineByLine: [
          { line: 1, code: 'def next_greater_elements(nums: list[int]) -> list[int]:', explain: '정수 리스트 nums를 입력받습니다.' },
          { line: 2, code: '    res = [-1] * len(nums)', explain: '오른쪽에 더 큰 값이 없을 때를 대비해 모든 답을 -1로 초기화합니다.' },
          { line: 3, code: '    stack = []', explain: '아직 더 큰 수를 만나지 못한 원소의 인덱스를 쌓아두는 단조 스택입니다.' },
          { line: 4, code: '    for i, val in enumerate(nums):', explain: '인덱스 i와 값 val을 왼쪽부터 한 번만 순회합니다.' },
          { line: 5, code: '        while stack and nums[stack[-1]] < val:', explain: '스택 top의 값보다 현재 val이 더 크면 답을 찾은 것이므로' },
          { line: 6, code: '            idx = stack.pop()', explain: '해당 인덱스를 스택에서 꺼내어' },
          { line: 7, code: '            res[idx] = val', explain: '처음 만나는 더 큰 값 val을 기록합니다.' },
          { line: 8, code: '        stack.append(i)', explain: '현재 인덱스 i도 앞으로 더 큰 값을 찾기 위해 스택에 넣습니다.' },
          { line: 9, code: '    return res', explain: '모든 위치의 Next Greater 결과 리스트를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '각 원소는 스택에 최대 1번 들어가고 최대 1번 pop 되므로 총 O(N)입니다.', space: 'O(N)', spaceWhy: '스택과 결과 리스트가 최대 N 크기를 가집니다.' },
        pitfalls: ['nums[stack[-1]] <= val로 등호까지 허용하면 같은 숫자가 Next Greater로 잘못 채워집니다. 반드시 엄격한 < 여야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 <= 비교를 사용해 같은 숫자([2, 2])도 자기보다 더 큰 숫자인 것처럼 잘못 매칭합니다.',
        checklist: ['엄격 비교(nums[stack[-1]] < val) 확인', '동점/내림차순 배열 -1 반환 확인'],
        focusLine: 5,
        buggyCode: `def next_greater_elements(nums: list[int]) -> list[int]:
    res = [-1] * len(nums)
    stack = []
    for i, val in enumerate(nums):
        while stack and nums[stack[-1]] <= val:
            idx = stack.pop()
            res[idx] = val
        stack.append(i)
    return res`
      },
      entryPoint: 'next_greater_elements',
      code: `def next_greater_elements(nums: list[int]) -> list[int]:
    res = [-1] * len(nums)
    stack = []
    for i, val in enumerate(nums):
        while stack and nums[stack[-1]] < val:
            idx = stack.pop()
            res[idx] = val
        stack.append(i)
    return res`,
      skeleton: `def next_greater_elements(nums: list[int]) -> list[int]:
    res = [-1] * len(nums)
    stack = []
    for i, val in enumerate(nums):
        while stack and ____:
            idx = stack.pop()
            res[idx] = ____
        stack.append(i)
    return res`,
      tests: [
        { input: [[2, 1, 2, 4, 3]], expected: [4, 2, 4, -1, -1], name: '동일값 2 건너뛰고 4 매칭' },
        { input: [[5, 4, 3]], expected: [-1, -1, -1], name: '내림차순 모두 -1' },
        { input: [[]], expected: [], name: '빈 리스트 처리' }
      ]
    },
    {
      id: 'py_mid_refactor_normalize_users',
      title: '원시 회원 입력 → 헬퍼 분리 정제 파이프라인',
      tier: 2,
      level: 'intermediate',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '지저분한 중첩 조건문과 중복 문자열 정리를 단일 레코드 정제 헬퍼 clean_user()로 추출해 불변 파이프라인을 구축합니다.',
      refactoringGoal: '하나의 루프에 섞여 있던 공백 검사·이름/이메일 정규화·None 건너뛰기를 clean_user() 헬퍼 함수로 추출해 정리하세요.',
      refactoringBefore: `def normalize_users(raw_users):
    res = []
    for u in raw_users:
        if u and u.get('name') and u.get('name').strip() != '':
            if u.get('email') and '@' in u['email']:
                res.append({'name': u['name'].strip(), 'email': u['email'].strip().lower()})
    return res`,
      explanation: {
        summary: '정제 책임 clean_user(u)가 유효하지 않은 입력이면 None을, 유효하면 정제된 새 딕셔너리를 반환하도록 분리해 메인 루프를 단순화합니다.',
        keyConcepts: ['Extract Function (clean_user)', 'Guard Returns None', '불변 새 딕셔너리 생성', '이메일 소문자 정규화'],
        lineByLine: [
          { line: 1, code: 'def clean_user(u: dict):', explain: '단일 사용자 딕셔너리를 검증하고 정제해 반환(무효 시 None)하는 헬퍼입니다.' },
          { line: 2, code: "    name = (u.get('name') or '').strip()", explain: '이름이 None이면 빈 문자열로 치환한 뒤 공백을 제거합니다.' },
          { line: 3, code: "    email = (u.get('email') or '').strip().lower()", explain: '이메일도 공백 제거 및 소문자로 통일합니다.' },
          { line: 4, code: "    if not name or '@' not in email:", explain: '빈 이름이거나 @ 기호가 없는 잘못된 이메일이면' },
          { line: 5, code: '        return None', explain: '필터링 제외 표시로 None을 반환합니다.' },
          { line: 6, code: "    return {'name': name, 'email': email}", explain: '정제된 불변 딕셔너리를 반환합니다.' },
          { line: 8, code: 'def normalize_users(raw_users: list[dict]) -> list[dict]:', explain: '원시 회원 목록을 입력받아 유효 레코드만 정제해 반환합니다.' },
          { line: 9, code: '    out = []', explain: '정제 완료된 회원 리스트를 초기화합니다.' },
          { line: 10, code: '    for u in raw_users:', explain: '원시 회원 항목을 순회하며' },
          { line: 11, code: '        cleaned = clean_user(u)', explain: '전용 헬퍼 함수에 정제·검증을 위임합니다.' },
          { line: 12, code: '        if cleaned is not None:', explain: '유효한 사용자만' },
          { line: 13, code: '            out.append(cleaned)', explain: '결과 리스트에 담습니다.' },
          { line: 14, code: '    return out', explain: '정제된 회원 목록을 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개 회원 레코드를 1회 순회하며 상수 길이 문자열 정제를 수행합니다.', space: 'O(N)', spaceWhy: '새 정제 회원 딕셔너리 리스트를 반환합니다.' },
        pitfalls: ['이메일 .lower() 정규화를 빠뜨리면 "Kim@Example.com"과 "kim@example.com"이 서로 다른 계정으로 취급됩니다.']
      },
      audit: {
        bugSummary: 'AI가 이메일 소문자 정규화(.lower())를 빠뜨려 대문자가 포함된 이메일이 그대로 통과합니다.',
        checklist: ['email.strip().lower() 소문자 통일 확인', '공백 이름 및 @ 미포함 이메일 필터링 확인'],
        focusLine: 3,
        buggyCode: `def clean_user(u: dict):
    name = (u.get('name') or '').strip()
    email = (u.get('email') or '').strip()
    if not name or '@' not in email:
        return None
    return {'name': name, 'email': email}

def normalize_users(raw_users: list[dict]) -> list[dict]:
    out = []
    for u in raw_users:
        cleaned = clean_user(u)
        if cleaned is not None:
            out.append(cleaned)
    return out`
      },
      entryPoint: 'normalize_users',
      code: `def clean_user(u: dict):
    name = (u.get('name') or '').strip()
    email = (u.get('email') or '').strip().lower()
    if not name or '@' not in email:
        return None
    return {'name': name, 'email': email}

def normalize_users(raw_users: list[dict]) -> list[dict]:
    out = []
    for u in raw_users:
        cleaned = clean_user(u)
        if cleaned is not None:
            out.append(cleaned)
    return out`,
      skeleton: `def clean_user(u: dict):
    name = (u.get('name') or '').strip()
    email = (u.get('email') or '').strip().lower()
    if ____:
        return None
    return {'name': name, 'email': email}

def normalize_users(raw_users: list[dict]) -> list[dict]:
    out = []
    for u in raw_users:
        cleaned = ____
        if cleaned is not None:
            out.append(cleaned)
    return out`,
      tests: [
        { input: [[{ name: '  Alice ', email: ' Alice@DEV.io ' }, { name: '  ', email: 'a@b.com' }, { name: 'Bob', email: 'invalid' }]], expected: [{ name: 'Alice', email: 'alice@dev.io' }], name: '정규화 및 무효 레코드 제외' },
        { input: [[]], expected: [], name: '빈 목록 안전 처리' }
      ]
    },
    {
      id: 'py_mid_ai_eval_f1',
      title: 'AI 분류·가드레일 평가 지표 (Precision / Recall / F1)',
      tier: 3,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Evaluation',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '이진 분류 모델 또는 AI 가드레일 탐지기의 정답(y_true)과 예측(y_pred)으로 Precision, Recall, F1 점수를 0 나눗셈 없이 계산합니다.',
      explanation: {
        summary: 'TP, FP, FN 건수를 집계한 뒤 분모가 0인 엣지 케이스(양성 예측 0건 등)에서도 ZeroDivisionError 없이 0.0을 반환하도록 안전하게 계산합니다.',
        keyConcepts: ['Precision / Recall / F1-Score', 'Confusion Matrix (TP, FP, FN)', 'Zero-Division Safe Guard', 'round(val, 4)'],
        lineByLine: [
          { line: 1, code: 'def calc_f1_metrics(y_true: list[int], y_pred: list[int]) -> dict[str, float]:', explain: '실제 정답 라벨(0/1)과 예측 라벨(0/1) 리스트를 받습니다.' },
          { line: 2, code: '    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)', explain: '실제 양성을 양성으로 정확히 맞춘 True Positive를 셉니다.' },
          { line: 3, code: '    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)', explain: '실제 음성인데 양성으로 오탐지한 False Positive를 셉니다.' },
          { line: 4, code: '    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)', explain: '실제 양성을 놓친 False Negative(미탐지)를 셉니다.' },
          { line: 5, code: '    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0', explain: '정밀도 = TP / (TP + FP), 분모 0이면 0.0을 반환합니다.' },
          { line: 6, code: '    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0', explain: '재현율 = TP / (TP + FN), 분모 0이면 0.0을 반환합니다.' },
          { line: 7, code: '    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0', explain: '정밀도와 재현율의 조화평균 F1을 구하며 분모 0을 방어합니다.' },
          { line: 8, code: "    return {'precision': round(precision, 4), 'recall': round(recall, 4), 'f1': round(f1, 4)}", explain: '소수 4자리로 반올림한 평가 리포트 딕셔너리를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'zip 순회로 TP/FP/FN을 선형 시간에 집계합니다.', space: 'O(1)', spaceWhy: '상수 개의 스칼라 통계 변수만 사용합니다.' },
        pitfalls: ['F1 계산 시 산술평균 (p + r) / 2 대신 반드시 조화평균 2 * p * r / (p + r)을 써야 한쪽 편향이 낮은 모델에 패널티를 줄 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 모든 값이 음성(y_true=[0,0], y_pred=[0,0])일 때 분모 0 방어를 누락해 ZeroDivisionError가 발생합니다.',
        checklist: ['분모 > 0 0 나눗셈 가드 확인', '조화평균 F1 공식 확인'],
        focusLine: 5,
        buggyCode: `def calc_f1_metrics(y_true: list[int], y_pred: list[int]) -> dict[str, float]:
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    precision = tp / (tp + fp)
    recall = tp / (tp + fn)
    f1 = 2 * precision * recall / (precision + recall)
    return {'precision': round(precision, 4), 'recall': round(recall, 4), 'f1': round(f1, 4)}`
      },
      entryPoint: 'calc_f1_metrics',
      code: `def calc_f1_metrics(y_true: list[int], y_pred: list[int]) -> dict[str, float]:
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    return {'precision': round(precision, 4), 'recall': round(recall, 4), 'f1': round(f1, 4)}`,
      skeleton: `def calc_f1_metrics(y_true: list[int], y_pred: list[int]) -> dict[str, float]:
    tp = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 1)
    fp = sum(1 for t, p in zip(y_true, y_pred) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true, y_pred) if t == 1 and p == 0)
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = ____ if (precision + recall) > 0 else 0.0
    return {'precision': round(precision, 4), 'recall': round(recall, 4), 'f1': round(f1, 4)}`,
      tests: [
        { input: [[1, 1, 0, 0], [1, 0, 1, 0]], expected: { precision: 0.5, recall: 0.5, f1: 0.5 }, name: 'TP=1 FP=1 FN=1 대칭 지표' },
        { input: [[1, 1, 1, 0], [1, 1, 0, 0]], expected: { precision: 1.0, recall: 0.6667, f1: 0.8 }, name: 'Precision=1.0, Recall=2/3 -> F1=0.8' },
        { input: [[0, 0], [0, 0]], expected: { precision: 0.0, recall: 0.0, f1: 0.0 }, name: '양성 0건 Zero-Division 방어' }
      ]
    },
    {
      id: 'py_mid_circuit_breaker',
      title: 'Python 서킷 브레이커 상태 머신 구현',
      tier: 3,
      level: 'intermediate',
      track: 'architecture',
      category: 'Resilience',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '파이썬 백엔드 서비스에서 연속 실패 임계치 초과 시 회로를 차단하고, 쿨다운 TICK 후 HALF_OPEN 탐침으로 복구 여부를 검증합니다.',
      explanation: {
        summary: '상태 변수 state(CLOSED / OPEN / HALF_OPEN)를 중심으로 TICK 처리를 먼저 분리해 어떤 상태에서도 유휴 TICK이 실패 카운터로 새지 않게 보호합니다.',
        keyConcepts: ['Circuit Breaker (Python)', '3-State FSM', 'Idle TICK 조기 continue', 'HALF_OPEN 탐침 재차단'],
        lineByLine: [
          { line: 1, code: 'def run_circuit_breaker(events: list[str], threshold: int) -> list[str]:', explain: 'OK/FAIL/TICK 이벤트 리스트와 차단 임계치를 입력받습니다.' },
          { line: 2, code: "    state, fails, log = 'CLOSED', 0, []", explain: '초기 상태, 연속 실패 카운터, 상태 로그를 초기화합니다.' },
          { line: 3, code: '    for ev in events:', explain: '이벤트 시퀀스를 순서대로 처리합니다.' },
          { line: 4, code: "        if ev == 'TICK':", explain: '쿨다운 타이머 틱(TICK) 이벤트가 오면' },
          { line: 5, code: "            if state == 'OPEN':", explain: '현재 차단 상태(OPEN)일 때만' },
          { line: 6, code: "                state, fails = 'HALF_OPEN', 0", explain: '탐침 허용 상태(HALF_OPEN)로 전환하고 실패 카운터를 0으로 초기화하며' },
          { line: 7, code: "                log.append('HALF')", explain: 'HALF 전환 로그를 남깁니다.' },
          { line: 8, code: '            continue', explain: 'CLOSED/HALF_OPEN에서의 TICK은 그대로 무시하고 넘어갑니다.' },
          { line: 9, code: "        if state == 'OPEN':", explain: '회로가 열린 상태에서의 요청은' },
          { line: 10, code: "            log.append('BLOCKED')", explain: '즉시 차단(Fail-Fast) 처리합니다.' },
          { line: 11, code: "        elif ev == 'OK':", explain: '외부 호출이 성공(OK)한 경우' },
          { line: 12, code: "            fails, state = 0, 'CLOSED'", explain: '실패 횟수를 0으로 비우고 정상 CLOSED로 복귀합니다.' },
          { line: 13, code: '        else:', explain: '호출 실패(FAIL)인 경우' },
          { line: 14, code: '            fails += 1', explain: '연속 실패 카운터를 증가시키고' },
          { line: 15, code: "            if fails >= threshold or state == 'HALF_OPEN':", explain: '임계치에 도달했거나 HALF_OPEN 탐침이 실패했다면' },
          { line: 16, code: "                state = 'OPEN'", explain: '즉시 회로를 차단(OPEN)하며' },
          { line: 17, code: "                log.append('OPEN')", explain: 'OPEN 이벤트를 기록합니다.' },
          { line: 18, code: '            else:', explain: '임계치 미만 단일 실패는' },
          { line: 19, code: "                log.append('FAIL')", explain: 'FAIL만 기록하고 회로는 유지합니다.' },
          { line: 20, code: '    return log', explain: '전체 서킷 브레이커 상태 이력을 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개의 이벤트를 1회 순회하며 상수 시간에 상태를 전이합니다.', space: 'O(N)', spaceWhy: '처리 로그 리스트 크기에 비례합니다.' },
        pitfalls: ['HALF_OPEN 상태에서 실패했을 때 곧바로 OPEN으로 돌리지 않으면 반쯤 열린 상태에서 실패가 threshold번 누적될 때까지 장애 API를 계속 때립니다.']
      },
      audit: {
        bugSummary: 'AI가 fails >= threshold만 검사하고 state == "HALF_OPEN" 조건을 빠져 HALF_OPEN 탐침 실패 시에도 회로가 바로 닫히지 않습니다.',
        checklist: ['fails >= threshold or state == "HALF_OPEN" 확인', 'TICK 조기 continue 확인'],
        focusLine: 15,
        buggyCode: `def run_circuit_breaker(events: list[str], threshold: int) -> list[str]:
    state, fails, log = 'CLOSED', 0, []
    for ev in events:
        if ev == 'TICK':
            if state == 'OPEN':
                state, fails = 'HALF_OPEN', 0
                log.append('HALF')
            continue
        if state == 'OPEN':
            log.append('BLOCKED')
        elif ev == 'OK':
            fails, state = 0, 'CLOSED'
        else:
            fails += 1
            if fails >= threshold:
                state = 'OPEN'
                log.append('OPEN')
            else:
                log.append('FAIL')
    return log`
      },
      entryPoint: 'run_circuit_breaker',
      code: `def run_circuit_breaker(events: list[str], threshold: int) -> list[str]:
    state, fails, log = 'CLOSED', 0, []
    for ev in events:
        if ev == 'TICK':
            if state == 'OPEN':
                state, fails = 'HALF_OPEN', 0
                log.append('HALF')
            continue
        if state == 'OPEN':
            log.append('BLOCKED')
        elif ev == 'OK':
            fails, state = 0, 'CLOSED'
        else:
            fails += 1
            if fails >= threshold or state == 'HALF_OPEN':
                state = 'OPEN'
                log.append('OPEN')
            else:
                log.append('FAIL')
    return log`,
      skeleton: `def run_circuit_breaker(events: list[str], threshold: int) -> list[str]:
    state, fails, log = 'CLOSED', 0, []
    for ev in events:
        if ev == 'TICK':
            if state == 'OPEN':
                state, fails = 'HALF_OPEN', 0
                log.append('HALF')
            continue
        if state == 'OPEN':
            log.append('BLOCKED')
        elif ev == 'OK':
            fails, state = 0, 'CLOSED'
        else:
            fails += 1
            if ____:
                state = 'OPEN'
                log.append('OPEN')
            else:
                log.append('FAIL')
    return log`,
      tests: [
        { input: [['FAIL', 'FAIL', 'OK', 'TICK', 'FAIL', 'OK'], 2], expected: ['FAIL', 'OPEN', 'BLOCKED', 'HALF', 'OPEN', 'BLOCKED'], name: 'HALF_OPEN 탐침 실패 시 즉시 재차단' },
        { input: [['TICK', 'FAIL', 'OK'], 2], expected: ['FAIL'], name: 'CLOSED 유휴 TICK 무시 및 성공 시 상태 유지' }
      ]
    }
  );

  // =========================================================================
  // 3. C99 중급 5문제 (level: 'intermediate', tier: 2~3)
  // =========================================================================
  curr.c.push(
    {
      id: 'c_mid_insertion_sort',
      title: '제자리 삽입 정렬(Insertion Sort) & 중앙값 추출',
      tier: 2,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N^2)', space: 'O(1)' },
      description: '거의 정렬된 작은 배열에서 가장 빠른 제자리 삽입 정렬(Insertion Sort)을 구현하고 정렬된 중앙 인덱스 값을 반환합니다.',
      explanation: {
        summary: 'i번째 key 값을 추출한 뒤 앞선 정렬 구간 [0..i-1]에서 key보다 큰 원소들을 한 칸씩 오른쪽으로 밀어(j--) 빈 자리에 삽입합니다.',
        keyConcepts: ['Insertion Sort (In-Place)', 'while (j >= 0 && arr[j] > key)', '요소 우측 시프트', '정수 나눗셈 중앙값'],
        lineByLine: [
          { line: 1, code: 'void insertion_sort(int arr[], int n) {', explain: '정수 배열 arr[n]을 제자리 오름차순 정렬하는 함수입니다.' },
          { line: 2, code: '    for (int i = 1; i < n; i++) {', explain: '두 번째 원소부터 마지막까지 삽입 대상을 순회합니다.' },
          { line: 3, code: '        int key = arr[i];', explain: '현재 정렬 위치로 끼워 넣을 원소 key를 임시 보관합니다.' },
          { line: 4, code: '        int j = i - 1;', explain: '이미 정렬된 왼쪽 구간의 끝에서부터 역방향 비교를 시작합니다.' },
          { line: 5, code: '        while (j >= 0 && arr[j] > key) {', explain: '범위 내에서 key보다 큰 원소가 나타나면' },
          { line: 6, code: '            arr[j + 1] = arr[j];', explain: '해당 원소를 오른쪽으로 한 칸 밀어 공간을 만듭니다.' },
          { line: 7, code: '            j--;', explain: '왼쪽으로 한 칸 이동해 계속 비교합니다.' },
          { line: 8, code: '        }', explain: 'while 시프트 루프를 종료합니다.' },
          { line: 9, code: '        arr[j + 1] = key;', explain: '비교가 멈춘 바로 오른쪽 빈 자리에 key를 최종 삽입합니다.' },
          { line: 10, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 11, code: '}', explain: 'insertion_sort 함수를 닫습니다.' },
          { line: 13, code: 'int sort_and_median(int arr[], int n) {', explain: '배열을 정렬한 뒤 중앙 인덱스 값을 반환하는 래퍼 함수입니다.' },
          { line: 14, code: '    if (n <= 0) return 0;', explain: '빈 배열을 방어합니다.' },
          { line: 15, code: '    insertion_sort(arr, n);', explain: '제자리 삽입 정렬을 수행합니다.' },
          { line: 16, code: '    return arr[n / 2];', explain: '정렬 완료된 배열의 중앙값을 반환합니다.' },
          { line: 17, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N^2)', timeWhy: '역순 배열 최악 경우 N^2/2회 비교·이동하며, 거의 정렬된 입력에서는 O(N)입니다.', space: 'O(1)', spaceWhy: '추가 배열 없이 변수 key, j만 사용해 제자리 정렬합니다.' },
        pitfalls: ['while 루프 종료 후 j가 삽입 대상 직전 칸(-1 포함)을 가리키므로 반드시 arr[j]가 아니라 arr[j + 1] = key로 넣어야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 삽입 대상을 잘못 arr[j] = key에 덮어써 인덱스 -1 메모리 오작동 또는 정렬 원소 손실이 발생합니다.',
        checklist: ['arr[j + 1] = key 위치 삽입 확인', 'while 조건 j >= 0 && arr[j] > key 확인'],
        focusLine: 9,
        buggyCode: `void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 2] = key;
    }
}

int sort_and_median(int arr[], int n) {
    if (n <= 0) return 0;
    insertion_sort(arr, n);
    return arr[n / 2];
}`
      },
      entryPoint: 'sort_and_median',
      code: `void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int sort_and_median(int arr[], int n) {
    if (n <= 0) return 0;
    insertion_sort(arr, n);
    return arr[n / 2];
}`,
      skeleton: `void insertion_sort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (____) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[____] = key;
    }
}

int sort_and_median(int arr[], int n) {
    if (n <= 0) return 0;
    insertion_sort(arr, n);
    return arr[n / 2];
}`,
      tests: [
        { input: [[9, 1, 5, 3, 7], 5], expected: 5, name: '미정렬 5개 중앙값 5' },
        { input: [[-3, 10, -8, 0, 2], 5], expected: 0, name: '음수 포함 중앙값 0' }
      ]
    },
    {
      id: 'c_mid_lower_bound',
      title: '이진 탐색 하한 위치 찾기 (Lower Bound)',
      tier: 3,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(log N)', space: 'O(1)' },
      description: '정렬된 배열에서 target 이상(>= target)이 처음 나타나는 가장 왼쪽 인덱스(Lower Bound)를 O(log N) 이진 탐색으로 구합니다.',
      explanation: {
        summary: '탐색 구간을 반열린 구간 [left, right) = [0, n)으로 설정해 arr[mid] < target일 때만 left = mid + 1로 좁히고, 같거나 크면 right = mid를 유지합니다.',
        keyConcepts: ['Lower Bound Binary Search', '반열린 구간 [0, n)', '중복 원소 첫 인덱스 탐색', '삽입 위치 결정'],
        lineByLine: [
          { line: 1, code: 'int lower_bound_c(int arr[], int n, int target) {', explain: '정렬된 배열, 길이 n, 기준값 target을 입력받습니다.' },
          { line: 2, code: '    int left = 0;', explain: '탐색 시작 하한을 0으로 설정합니다.' },
          { line: 3, code: '    int right = n;', explain: 'target이 모든 원소보다 클 때 n을 반환하도록 상한을 n(배열 끝 다음)으로 둡니다.' },
          { line: 4, code: '    while (left < right) {', explain: 'left와 right가 한 점에서 만날 때까지 구간을 좁힙니다.' },
          { line: 5, code: '        int mid = left + (right - left) / 2;', explain: '정수 오버플로우 없이 중간 인덱스를 구합니다.' },
          { line: 6, code: '        if (arr[mid] < target) {', explain: '중간 값이 target보다 작으면 mid 이하에는 답이 없으므로' },
          { line: 7, code: '            left = mid + 1;', explain: '왼쪽 경계를 mid + 1로 옮깁니다.' },
          { line: 8, code: '        } else {', explain: 'arr[mid] >= target이면 mid 자체가 첫 위치 후보이므로' },
          { line: 9, code: '            right = mid;', explain: 'mid를 버리지 않고 right = mid로 상한을 당깁니다.' },
          { line: 10, code: '        }', explain: '분기 종료' },
          { line: 11, code: '    }', explain: 'while 루프가 종료되면 left == right가 답이 됩니다.' },
          { line: 12, code: '    return left;', explain: 'target 이상 첫 인덱스(없으면 n)를 반환합니다.' },
          { line: 13, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(log N)', timeWhy: '반복마다 후보 범위가 정확히 반씩 줄어듭니다.', space: 'O(1)', spaceWhy: '포인터 정수 변수 3개만 사용합니다.' },
        pitfalls: ['arr[mid] <= target으로 등호를 넣으면 Lower Bound가 아니라 Upper Bound(초과 위치)를 찾게 되어 중복 원소의 맨 첫 위치를 놓칩니다.']
      },
      audit: {
        bugSummary: 'AI가 조건에 arr[mid] <= target을 써서 Lower Bound 대신 Upper Bound를 반환합니다.',
        checklist: ['arr[mid] < target 엄격 비교 확인', '중복 원소 [2, 4, 4, 7] 중 첫 4 인덱스(1) 반환 확인'],
        focusLine: 6,
        buggyCode: `int lower_bound_c(int arr[], int n, int target) {
    int left = 0;
    int right = n;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}`
      },
      entryPoint: 'lower_bound_c',
      code: `int lower_bound_c(int arr[], int n, int target) {
    int left = 0;
    int right = n;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}`,
      skeleton: `int lower_bound_c(int arr[], int n, int target) {
    int left = 0;
    int right = ____;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (____) {
            left = mid + 1;
        } else {
            right = ____;
        }
    }
    return left;
}`,
      tests: [
        { input: [[2, 4, 4, 4, 7], 5, 4], expected: 1, name: '중복 값 4의 첫 위치(1)' },
        { input: [[2, 4, 6], 3, 9], expected: 3, name: '모두보다 클 때 삽입 위치 n(3)' },
        { input: [[2, 4, 6], 3, 1], expected: 0, name: '모두보다 작을 때 0' }
      ]
    },
    {
      id: 'c_mid_kadane_max_sub',
      title: '카데인 알고리즘 최대 연속 부분합 (Kadane O(N))',
      tier: 3,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '양수와 음수가 섞인 배열에서 연속된 부분 배열 합의 최댓값을 O(N) 동적 계획법(Kadane)으로 구합니다.',
      explanation: {
        summary: 'i번째 위치에서 끝나는 최대 연속합 curr을 max(arr[i], curr + arr[i])로 유지하며 전체 최댓값 best를 갱신해 모두 음수인 입력도 정확히 처리합니다.',
        keyConcepts: ['Kadane Algorithm (DP)', 'O(N) 시간 · O(1) 공간', 'curr + arr[i] vs arr[i]', '전체 음수 배열 방어'],
        lineByLine: [
          { line: 1, code: 'int max_subarray_sum(int arr[], int n) {', explain: '정수 배열 arr[n]에서 최대 연속 부분합을 구합니다.' },
          { line: 2, code: '    if (n <= 0) return 0;', explain: '빈 배열 입력 시 0을 반환해 안전 종료합니다.' },
          { line: 3, code: '    int curr = arr[0];', explain: '현재 원소를 끝으로 하는 연속 부분합을 첫 원소로 초기화합니다.' },
          { line: 4, code: '    int best = arr[0];', explain: '전체 구간 중 최고 부분합 역시 첫 원소로 시작해 음수 전용 배열을 방어합니다.' },
          { line: 5, code: '    for (int i = 1; i < n; i++) {', explain: '두 번째 원소부터 차례로 순회합니다.' },
          { line: 6, code: '        curr = (curr + arr[i] > arr[i]) ? (curr + arr[i]) : arr[i];', explain: '이전 구간에 이어 붙일지, 여기서 새로 시작할지 더 큰 쪽을 택합니다.' },
          { line: 7, code: '        if (curr > best) best = curr;', explain: '역대 최대 연속 부분합 best를 갱신합니다.' },
          { line: 8, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 9, code: '    return best;', explain: '최대 연속 부분 배열 합을 반환합니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '배열을 단 한 번 선형 탐색합니다.', space: 'O(1)', spaceWhy: 'curr, best 두 개의 정수 변수만 사용합니다.' },
        pitfalls: ['curr와 best를 0으로 초기화하고 curr < 0이면 0으로 리셋하는 버전을 쓰면 [-5, -2, -9] 같은 음수 배열에서 -2 대신 0을 잘못 반환합니다.']
      },
      audit: {
        bugSummary: 'AI가 curr/best를 0으로 시작하고 0 미만 시 리셋해 모두 음수([-5, -2, -9])일 때 -2 대신 0을 반환합니다.',
        checklist: ['curr = arr[0]; best = arr[0]; 초기화 확인', '음수 전용 배열 [-5, -2, -9] -> -2 확인'],
        focusLine: 4,
        buggyCode: `int max_subarray_sum(int arr[], int n) {
    if (n <= 0) return 0;
    int curr = 0;
    int best = 0;
    for (int i = 0; i < n; i++) {
        curr += arr[i];
        if (curr < 0) curr = 0;
        if (curr > best) best = curr;
    }
    return best;
}`
      },
      entryPoint: 'max_subarray_sum',
      code: `int max_subarray_sum(int arr[], int n) {
    if (n <= 0) return 0;
    int curr = arr[0];
    int best = arr[0];
    for (int i = 1; i < n; i++) {
        curr = (curr + arr[i] > arr[i]) ? (curr + arr[i]) : arr[i];
        if (curr > best) best = curr;
    }
    return best;
}`,
      skeleton: `int max_subarray_sum(int arr[], int n) {
    if (n <= 0) return 0;
    int curr = arr[0];
    int best = ____;
    for (int i = 1; i < n; i++) {
        curr = ____;
        if (curr > best) best = curr;
    }
    return best;
}`,
      tests: [
        { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4], 9], expected: 6, name: '[4, -1, 2, 1] 최대 부분합 6' },
        { input: [[-5, -2, -9], 3], expected: -2, name: '음수 전용 배열 -2 방어' }
      ]
    },
    {
      id: 'c_mid_rle_encoded_len',
      title: 'Run-Length Encoding (RLE) 연속 그룹 수 세기',
      tier: 2,
      level: 'intermediate',
      track: 'system_design',
      category: 'Compression / C',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '문자열 압축 기법인 Run-Length Encoding(RLE) 전처리를 위해 연속으로 같은 문자가 이어지는 블록(Run)의 총 개수를 계산합니다.',
      explanation: {
        summary: '빈 문자열은 0, 그 외는 runs = 1로 시작한 뒤 직전 문자 prev와 달라지는 전이 지점마다 runs++하고 prev를 갱신합니다.',
        keyConcepts: ['Run-Length Encoding (RLE)', '연속 Run 전환 탐지', 'const char* 포인터 전진', '빈 문자열 가드'],
        lineByLine: [
          { line: 1, code: 'int count_rle_runs(const char* s) {', explain: '압축 블록 수를 계산할 C 문자열 s를 입력받습니다.' },
          { line: 2, code: "    if (*s == '\\0') return 0;", explain: '빈 문자열은 연속 블록이 0개이므로 즉시 0을 반환합니다.' },
          { line: 3, code: '    int runs = 1;', explain: '첫 글자가 존재하므로 최소 1개의 블록으로 시작합니다.' },
          { line: 4, code: '    char prev = *s;', explain: '현재 연속 블록의 기준 문자를 첫 문자로 기억합니다.' },
          { line: 5, code: '    s++;', explain: '두 번째 문자 위치로 포인터를 전진합니다.' },
          { line: 6, code: "    while (*s != '\\0') {", explain: '널 종료 문자까지 한 글자씩 확인하며' },
          { line: 7, code: '        if (*s != prev) {', explain: '직전 문자와 다른 새 문자로 전환되면' },
          { line: 8, code: '            runs++;', explain: '새로운 Run 블록이 시작되므로 카운트를 늘리고' },
          { line: 9, code: '            prev = *s;', explain: '기준 문자 prev를 새 문자로 교체합니다.' },
          { line: 10, code: '        }', explain: '전환 조건 블록 종료' },
          { line: 11, code: '        s++;', explain: '다음 문자로 전진합니다.' },
          { line: 12, code: '    }', explain: '문자열 순회 종료' },
          { line: 13, code: '    return runs;', explain: '총 RLE 연속 블록 개수를 반환합니다.' },
          { line: 14, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열을 한 번 스캔하며 직전 문자와 1회 비교합니다.', space: 'O(1)', spaceWhy: 'runs와 prev 스칼라 변수만 사용합니다.' },
        pitfalls: ['*s == \'\\0\' 빈 문자열 가드를 빼면 runs = 1 때문에 빈 문자열에서도 1을 반환하는 버그가 발생합니다.']
      },
      audit: {
        bugSummary: 'AI가 빈 문자열(*s == "\\0") 0 반환 가드를 누락해 빈 입력 ""에 대해 1을 잘못 반환합니다.',
        checklist: ['빈 문자열 0 반환 확인', '"aaabbcca" -> 4개 run 계산 확인'],
        focusLine: 2,
        buggyCode: `int count_rle_runs(const char* s) {
    int runs = 1;
    char prev = *s;
    s++;
    while (*s != '\\0') {
        if (*s != prev) {
            runs++;
            prev = *s;
        }
        s++;
    }
    return runs;
}`
      },
      entryPoint: 'count_rle_runs',
      code: `int count_rle_runs(const char* s) {
    if (*s == '\\0') return 0;
    int runs = 1;
    char prev = *s;
    s++;
    while (*s != '\\0') {
        if (*s != prev) {
            runs++;
            prev = *s;
        }
        s++;
    }
    return runs;
}`,
      skeleton: `int count_rle_runs(const char* s) {
    if (*s == '\\0') return 0;
    int runs = 1;
    char prev = *s;
    s++;
    while (*s != '\\0') {
        if (____) {
            runs++;
            ____;
        }
        s++;
    }
    return runs;
}`,
      tests: [
        { input: ['aaabbcca'], expected: 4, name: '4개 연속 그룹 (aaa/bb/cc/a)' },
        { input: ['zzzz'], expected: 1, name: '단일 반복 1개 그룹' },
        { input: [''], expected: 0, name: '빈 문자열 0 반환' }
      ]
    },
    {
      id: 'c_mid_xor_checksum_frame',
      title: '직렬 통신 프레임 XOR 체크섬 검증기',
      tier: 2,
      level: 'intermediate',
      track: 'architecture',
      category: 'Embedded / Protocol',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '임베디드 UART/센서 패킷 프레임의 페이로드 바이트들을 XOR(^) 누적해 마지막 체크섬 바이트와 일치하는지 무결성을 검증합니다.',
      explanation: {
        summary: '프레임 마지막 원소 bytes[n - 1]을 제외한 나머지 바이트를 모두 XOR 누적한 뒤 마지막 체크섬 바이트와 같으면 1(유효), 다르면 0(손상)을 반환합니다.',
        keyConcepts: ['XOR Checksum 무결성', '체크섬 바이트 제외 (n - 1)', '길이가 2 미만 프레임 방어', '비트 배타적 논리합 (^=)'],
        lineByLine: [
          { line: 1, code: 'int verify_xor_frame(int bytes[], int n) {', explain: '페이로드 + 마지막 체크섬 바이트로 구성된 프레임과 길이 n을 받습니다.' },
          { line: 2, code: '    if (n < 2) return 0;', explain: '페이로드 최소 1바이트 + 체크섬 1바이트(총 2개) 미만이면 무효(0)입니다.' },
          { line: 3, code: '    int checksum = 0;', explain: 'XOR 누산기를 0으로 초기화합니다.' },
          { line: 4, code: '    for (int i = 0; i < n - 1; i++) {', explain: '마지막 체크섬 바이트 직전(n - 2)까지 페이로드만 순회합니다.' },
          { line: 5, code: '        checksum ^= bytes[i];', explain: '모든 페이로드 바이트를 XOR 누적합니다.' },
          { line: 6, code: '    }', explain: '체크섬 계산 루프 종료' },
          { line: 7, code: '    return (checksum == bytes[n - 1]) ? 1 : 0;', explain: '계산한 XOR 값과 프레임 끝 체크섬 바이트가 일치하면 1, 아니면 0을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'n - 1개 바이트를 1회 XOR 연산합니다.', space: 'O(1)', spaceWhy: '단일 체크섬 정수 변수만 사용합니다.' },
        pitfalls: ['루프에서 n - 1 대신 n 전체를 돌아 체크섬 자기 자신까지 XOR해 버리면 유효 프레임에서 결과가 무조건 0이 되어 checks fail이 납니다.']
      },
      audit: {
        bugSummary: 'AI가 체크섬 계산 루프를 n - 1이 아니라 n 끝까지 돌려 마지막 체크섬까지 포함해 검증이 틀립니다.',
        checklist: ['루프 상한 i < n - 1 확인', 'n < 2 짧은 잘못된 프레임 0 차단 확인'],
        focusLine: 4,
        buggyCode: `int verify_xor_frame(int bytes[], int n) {
    if (n < 2) return 0;
    int checksum = 0;
    for (int i = 0; i < n; i++) {
        checksum ^= bytes[i];
    }
    return (checksum == bytes[n - 1]) ? 1 : 0;
}`
      },
      entryPoint: 'verify_xor_frame',
      code: `int verify_xor_frame(int bytes[], int n) {
    if (n < 2) return 0;
    int checksum = 0;
    for (int i = 0; i < n - 1; i++) {
        checksum ^= bytes[i];
    }
    return (checksum == bytes[n - 1]) ? 1 : 0;
}`,
      skeleton: `int verify_xor_frame(int bytes[], int n) {
    if (n < 2) return 0;
    int checksum = 0;
    for (int i = 0; i < ____; i++) {
        checksum ^= ____;
    }
    return (checksum == bytes[n - 1]) ? 1 : 0;
}`,
      tests: [
        { input: [[12, 5, 9], 3], expected: 1, name: '유효 프레임 (12 ^ 5 == 9)' },
        { input: [[12, 5, 7], 3], expected: 0, name: '체크섬 손상 패킷 거부 (0)' },
        { input: [[1], 1], expected: 0, name: '2바이트 미만 불완전 프레임 거부' }
      ]
    }
  );

  // =========================================================================
  // 4. Spec 중급 4문제 (level: 'intermediate', tier: 2~3)
  // =========================================================================
  curr.spec.push(
    {
      id: 'spec_mid_schema_llm_eval',
      title: 'AI Eval 채점 리포트 JSON Schema 계약',
      tier: 2,
      level: 'intermediate',
      track: 'spec',
      specKind: 'schema',
      category: 'AI Spec',
      complexity: { time: 'Schema', space: 'Strict' },
      description: 'LLM 모델 평가 파이프라인에서 생성되는 모델명, 정규화 점수(0.0~1.0), 판정 상태(pass/fail/warn) 리포트 계약을 JSON Schema로 명세합니다.',
      explanation: {
        summary: '모델 평가 결과 score가 0~1 범위를 벗어나거나 verdict 문자열이 정해진 enum 밖으로 일탈하는 것을 막는 자동 평가 계약입니다.',
        keyConcepts: ['LLM Eval Report Contract', 'number 범위 0..1', 'verdict enum 제한', 'additionalProperties: false'],
        lineByLine: [
          { line: 1, code: '{', explain: 'Eval 리포트 루트 스키마를 엽니다.' },
          { line: 2, code: '  "type": "object",', explain: '리포트 최상위가 JSON 객체인지 검증합니다.' },
          { line: 3, code: '  "required": ["model", "score", "verdict"],', explain: '모델 ID, 평가 점수, 최종 판정 3개 필드를 필수로 지정합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: '계약에 정의되지 않은 필드 첨부를 차단합니다.' },
          { line: 5, code: '  "properties": {', explain: '각 평가 필드의 제약을 선언합니다.' },
          { line: 6, code: '    "model": { "type": "string", "minLength": 2 },', explain: '모델명은 최소 2글자 이상이어야 합니다.' },
          { line: 7, code: '    "score": { "type": "number", "minimum": 0, "maximum": 1 },', explain: '정규화된 평가 점수는 0.0에서 1.0 사이 실수만 허용합니다.' },
          { line: 8, code: '    "verdict": { "type": "string", "enum": ["pass", "fail", "warn"] }', explain: '판정 결과는 pass, fail, warn 중 하나여야 합니다.' },
          { line: 9, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 10, code: '}', explain: '루트 스키마를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '3필드 타입과 수치 범위(0..1)를 즉시 검증합니다.', space: 'Strict', spaceWhy: '잘못된 스케일 점수와 미등록 키를 차단합니다.' },
        pitfalls: ['score에 integer 타입을 쓰면 0.87 같은 실수 점수가 모두 타입 오류로 거절되므로 반드시 number여야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 score의 타입을 integer로 잘못 적고 maximum: 1을 빠져 소수 평가 점수 0.92가 실패하고 100점이 통과합니다.',
        checklist: ['score type: "number", minimum: 0, maximum: 1 확인', 'verdict enum 확인'],
        focusLine: 7,
        buggyCode: `{
  "type": "object",
  "required": ["model", "score", "verdict"],
  "additionalProperties": false,
  "properties": {
    "model": { "type": "string", "minLength": 2 },
    "score": { "type": "integer", "minimum": 0 },
    "verdict": { "type": "string", "enum": ["pass", "fail", "warn"] }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["model", "score", "verdict"],
  "additionalProperties": false,
  "properties": {
    "model": { "type": "string", "minLength": 2 },
    "score": { "type": "number", "minimum": 0, "maximum": 1 },
    "verdict": { "type": "string", "enum": ["pass", "fail", "warn"] }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["model", "score", "verdict"],
  "additionalProperties": false,
  "properties": {
    "model": { "type": "string", "minLength": 2 },
    "score": { "type": ____, "minimum": 0, "maximum": ____ },
    "verdict": { "type": "string", "enum": ["pass", "fail", "warn"] }
  }
}`,
      tests: [
        { input: [{ model: 'gemini-pro', score: 0.92, verdict: 'pass' }], expected: true, name: '소수 점수 0.92 리포트 통과' },
        { input: [{ model: 'gemini-pro', score: 1.5, verdict: 'pass' }], expected: false, name: '1.0 초과 점수 거부' },
        { input: [{ model: 'gemini-pro', score: 0.8, verdict: 'skip' }], expected: false, name: '미허용 verdict 거부' }
      ]
    },
    {
      id: 'spec_mid_schema_event_envelope',
      title: '이벤트 기반 메시징 Envelope 스펙 계약',
      tier: 3,
      level: 'intermediate',
      track: 'spec',
      specKind: 'schema',
      category: 'Event Spec',
      complexity: { time: 'Schema', space: 'Strict' },
      description: 'Kafka·SQS 이벤트 버스를 오가는 표준 Event Envelope의 메시지 ID 정규식, 버전 하한, 최소 1개 이상의 라우팅 태그 배열 계약을 정의합니다.',
      explanation: {
        summary: '여러 마이크로서비스가 공유하는 표준 이벤트 헤더 계약을 엄격히 검증해 포맷 깨짐으로 인한 Poison Pill 메시지를 사전에 막습니다.',
        keyConcepts: ['Event Envelope Contract', 'msg_ 패턴 정규식', '배열 minItems: 1', 'schema version >= 1'],
        lineByLine: [
          { line: 1, code: '{', explain: 'Event Envelope 루트 스키마를 엽니다.' },
          { line: 2, code: '  "type": "object",', explain: '이벤트 메시지가 JSON 객체인지 검증합니다.' },
          { line: 3, code: '  "required": ["id", "source", "version", "tags"],', explain: '4대 필수 Envelope 헤더 필드를 강제합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: '스펙에 없는 임의 헤더 오염을 막습니다.' },
          { line: 5, code: '  "properties": {', explain: '필드별 검증 제약을 선언합니다.' },
          { line: 6, code: '    "id": { "type": "string", "pattern": "^msg_[a-z0-9]+$" },', explain: '메시지 ID가 표준 msg_ 접두사 형식을 따르는지 검증합니다.' },
          { line: 7, code: '    "source": { "type": "string", "minLength": 2 },', explain: '발행 서비스 이름은 최소 2자 이상이어야 합니다.' },
          { line: 8, code: '    "version": { "type": "integer", "minimum": 1 },', explain: '이벤트 스키마 버전은 1 이상 양의 정수여야 합니다.' },
          { line: 9, code: '    "tags": { "type": "array", "minItems": 1, "items": { "type": "string" } }', explain: '라우팅 태그는 최소 1개 이상의 문자열 요소를 담아야 합니다.' },
          { line: 10, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 11, code: '}', explain: '루트 스키마를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '메시지 헤더 4필드와 태그 배열 원소를 즉시 검증합니다.', space: 'Strict', spaceWhy: '비표준 이벤트 유입을 생산 시점에 차단합니다.' },
        pitfalls: ['tags 배열에 minItems: 1이 빠지면 라우팅 태그가 빈([]) 이벤트가 발행되어 컨슈머 라우터에서 누락됩니다.']
      },
      audit: {
        bugSummary: 'AI가 tags의 minItems: 1을 누락해 빈 배열(tags: []) 이벤트가 정상으로 통과해 버립니다.',
        checklist: ['tags minItems: 1 확인', 'id ^msg_[a-z0-9]+$ 패턴 확인'],
        focusLine: 9,
        buggyCode: `{
  "type": "object",
  "required": ["id", "source", "version", "tags"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^msg_[a-z0-9]+$" },
    "source": { "type": "string", "minLength": 2 },
    "version": { "type": "integer", "minimum": 1 },
    "tags": { "type": "array", "items": { "type": "string" } }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["id", "source", "version", "tags"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": "^msg_[a-z0-9]+$" },
    "source": { "type": "string", "minLength": 2 },
    "version": { "type": "integer", "minimum": 1 },
    "tags": { "type": "array", "minItems": 1, "items": { "type": "string" } }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["id", "source", "version", "tags"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string", "pattern": ____ },
    "source": { "type": "string", "minLength": 2 },
    "version": { "type": "integer", "minimum": 1 },
    "tags": { "type": "array", "minItems": ____, "items": { "type": "string" } }
  }
}`,
      tests: [
        { input: [{ id: 'msg_01ab', source: 'billing', version: 2, tags: ['paid'] }], expected: true, name: '유효 Event Envelope 통과' },
        { input: [{ id: 'msg_01ab', source: 'billing', version: 2, tags: [] }], expected: false, name: '빈 tags 배열 거부' },
        { input: [{ id: 'bad_01', source: 'billing', version: 1, tags: ['paid'] }], expected: false, name: '잘못된 msg_ 패턴 거부' }
      ]
    },
    {
      id: 'spec_mid_arch_event_dlq',
      title: '비동기 Kafka + DLQ(Dead Letter Queue) 재처리 흐름도',
      tier: 2,
      level: 'intermediate',
      track: 'spec',
      specKind: 'diagram',
      category: 'Architecture DSL',
      complexity: { time: 'Arch', space: 'Live SVG' },
      description: '메시지 컨슈머 실패 시 전체 파티션을 막지 않고 Dead Letter Queue(DLQ)로 격리한 뒤 재처리(Replay)하는 탄력적 이벤트 아키텍처를 설계합니다.',
      adr: {
        scenario: '잘못된 페이로드 메시지 1건이 컨슈머에서 계속 예외를 일으켜 Kafka 파티션의 후속 정상 주문 1만 건까지 모두 처리가 멈추고 있습니다.',
        prompt: '전체 스트림 지연을 막으면서 실패 메시지 손실도 예방하는 아키텍처 선택은?',
        options: [
          { id: 'block', label: 'A. 성공할 때까지 오프셋을 넘기지 않고 무한 블로킹 재시도', recommended: false, critique: '단 하나의 Poison Pill 메시지가 뒤따르는 전체 파티션 지연을 유발합니다.' },
          { id: 'dlq', label: 'B. N회 실패 시 Worker -.-> DLQ 격리 후 별도 Replay 루프로 안전 재처리', recommended: true, critique: '정확합니다! 정상 스트림 처리량을 보존하면서도 실패 이벤트를 격리해 원인 수정 후 재투입(Replay)할 수 있습니다.' }
        ]
      },
      explanation: {
        summary: '정상 처리(Worker -> DB)와 실패 격리(Worker -.-> DLQ -> Replay)가 분리된 이벤트 주도 장애 격리 토폴로지입니다.',
        keyConcepts: ['Dead Letter Queue (DLQ)', 'Poison Pill 격리', '점선 장애 경로 (-.->)', 'Replay 복구'],
        lineByLine: [
          { line: 1, code: 'flowchart LR', explain: '좌→우 방향의 이벤트 처리 아키텍처입니다.' },
          { line: 2, code: 'Producer[Order API] -->|Emit| Kafka[(Kafka Topic)]', explain: '생산자 API가 주문 이벤트를 Kafka 토픽에 비동기 발행합니다.' },
          { line: 3, code: 'Kafka -->|Consume| Worker(Worker Service)', explain: '컨슈머 워커가 이벤트를 읽어 처리합니다.' },
          { line: 4, code: 'Worker -->|Commit| DB[(Order DB)]', explain: '정상 처리된 이벤트 결과를 데이터베이스에 기록합니다.' },
          { line: 5, code: 'Worker -.->|Retry Fail| DLQ[(Dead Letter Queue)]', explain: '재시도 초과 실패 메시지는 점선 경로로 DLQ에 격리합니다.' },
          { line: 6, code: 'DLQ -->|Manual Fix| Replay(Replay Job)', explain: '복구 배치 잡이 DLQ 적체 메시지를 점검·재투입합니다.' }
        ],
        complexity: { time: 'Arch', timeWhy: '실시간 SVG 토폴로지 렌더링과 DLQ 연결성 검증을 수행합니다.', space: 'Live SVG', spaceWhy: '6개 컴포넌트 · 5개 흐름을 시각화합니다.' },
        pitfalls: ['Worker -.-> DLQ 격리 경로가 없으면 비정상 메시지 하나가 컨슈머 워커 전체를 멈추게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 DLQ 격리(Worker -.-> DLQ)와 Replay 연결을 빠져 Poison Pill 방어 흐름이 누락되었습니다.',
        checklist: ['Kafka -> Worker -> DB 및 Worker -.-> DLQ 연결 확인', 'DLQ -> Replay 연결 확인'],
        focusLine: 5,
        buggyCode: `flowchart LR
Producer[Order API] -->|Emit| Kafka[(Kafka Topic)]
Kafka -->|Consume| Worker(Worker Service)
Worker -->|Commit| DB[(Order DB)]`
      },
      entryPoint: 'diagram',
      code: `flowchart LR
Producer[Order API] -->|Emit| Kafka[(Kafka Topic)]
Kafka -->|Consume| Worker(Worker Service)
Worker -->|Commit| DB[(Order DB)]
Worker -.->|Retry Fail| DLQ[(Dead Letter Queue)]
DLQ -->|Manual Fix| Replay(Replay Job)`,
      skeleton: `flowchart LR
Producer[Order API] -->|Emit| Kafka[(Kafka Topic)]
Kafka -->|Consume| ____
Worker -->|Commit| DB[(Order DB)]
Worker -.->|Retry Fail| ____
DLQ -->|Manual Fix| Replay(Replay Job)`,
      tests: [
        { input: [{ kind: 'edge', from: 'Kafka', to: 'Worker' }], expected: true, name: 'Kafka → Worker 소비 연결' },
        { input: [{ kind: 'edge', from: 'Worker', to: 'DLQ' }], expected: true, name: 'Worker → DLQ 실패 격리 경로' },
        { input: [{ kind: 'edge', from: 'DLQ', to: 'Replay' }], expected: true, name: 'DLQ → Replay 복구 경로' },
        { input: [{ kind: 'minCount', nodes: 6, edges: 5 }], expected: true, name: '6개 컴포넌트 · 5개 연결 완전성' }
      ]
    },
    {
      id: 'spec_mid_seq_oauth_refresh',
      title: 'OAuth2 JWT 만료 및 Refresh Token 재발급 시퀀스',
      tier: 3,
      level: 'intermediate',
      track: 'spec',
      specKind: 'diagram',
      category: 'Security Sequence',
      complexity: { time: 'Sequence', space: 'Live SVG' },
      description: '만료된 Access Token으로 401 응답을 받은 클라이언트가 Auth 서버에서 Refresh Token으로 새 토큰을 발급받아 API를 재시도하는 보안 시퀀스를 설계합니다.',
      adr: {
        scenario: '모바일 앱 사용자가 15분마다 로그인 화면으로 튕기지 않으면서도 탈취 위험을 줄이는 토큰 수명 설계가 필요합니다.',
        prompt: '보안성과 사용자 경험을 동시에 만족시키는 토큰 갱신 흐름은?',
        options: [
          { id: 'long_jwt', label: 'A. 만료 1년짜리 단일 JWT를 발급하고 갱신 절차 생략', recommended: false, critique: 'JWT 한 번 탈취 시 1년 동안 무효화하기 어려워 보안 위험이 매우 큽니다.' },
          { id: 'refresh', label: 'B. 짧은 Access Token + 401 시 Refresh Token으로 Auth 재발급 후 API 재요청', recommended: true, critique: '정확합니다! 짧은 Access Token으로 탈취 피해를 최소화하면서 무중단 자동 갱신 UX를 제공합니다.' }
        ]
      },
      explanation: {
        summary: 'API 401 거부 → Auth Refresh 교환 → 새 Access Token 회신 → 원래 API 재요청으로 이어지는 5단계 보안 시퀀스를 명세합니다.',
        keyConcepts: ['Access + Refresh Token Flow', '401 Unauthorized 트리거', 'Silent Token Refresh', '요청 재시도'],
        lineByLine: [
          { line: 1, code: 'sequenceDiagram', explain: 'OAuth2 토큰 갱신 시퀀스 다이어그램을 시작합니다.' },
          { line: 2, code: 'Client ->> API: GET /me (Expired JWT)', explain: '클라이언트가 만료된 Access Token으로 보호 API를 호출합니다.' },
          { line: 3, code: 'API -->> Client: 401 Token Expired', explain: 'API 서버가 401 만료 응답을 점선으로 반환합니다.' },
          { line: 4, code: 'Client ->> Auth: POST /refresh (Refresh Token)', explain: '클라이언트가 Auth 서버에 Refresh Token을 보내 갱신을 요청합니다.' },
          { line: 5, code: 'Auth -->> Client: 200 New Access Token', explain: 'Auth 서버가 검증 후 새 단기 Access Token을 발급합니다.' },
          { line: 6, code: 'Client ->> API: GET /me (New JWT)', explain: '새 토큰을 실어 원래 실패했던 API 요청을 매끄럽게 재시도합니다.' }
        ],
        complexity: { time: 'Sequence', timeWhy: '3자 간 5단계 보안 토큰 교환 타임라인을 즉시 그립니다.', space: 'Live SVG', spaceWhy: '실시간 시퀀스 다이어그램 SVG를 렌더링합니다.' },
        pitfalls: ['Refresh 요청을 리소스 API가 아니라 전담 Auth 서버로 분리하고 401 반환 후 재시도 화살표를 명시해야 계약이 완전합니다.']
      },
      audit: {
        bugSummary: 'AI가 Auth -->> Client 토큰 재발급 이후 원래 API로의 재요청(Client ->> API)을 빠뜨렸습니다.',
        checklist: ['API -->> Client 401 확인', 'Client ->> Auth -> Client ->> API 재시도 흐름 확인'],
        focusLine: 6,
        buggyCode: `sequenceDiagram
Client ->> API: GET /me (Expired JWT)
API -->> Client: 401 Token Expired
Client ->> Auth: POST /refresh (Refresh Token)`
      },
      entryPoint: 'diagram',
      code: `sequenceDiagram
Client ->> API: GET /me (Expired JWT)
API -->> Client: 401 Token Expired
Client ->> Auth: POST /refresh (Refresh Token)
Auth -->> Client: 200 New Access Token
Client ->> API: GET /me (New JWT)`,
      skeleton: `sequenceDiagram
Client ->> API: GET /me (Expired JWT)
API -->> Client: 401 Token Expired
Client ->> ____: POST /refresh (Refresh Token)
Auth -->> Client: ____
Client ->> API: GET /me (New JWT)`,
      tests: [
        { input: [{ kind: 'message', from: 'API', to: 'Client', isDashed: true }], expected: true, name: 'API -->> Client 401 응답' },
        { input: [{ kind: 'message', from: 'Client', to: 'Auth' }], expected: true, name: 'Client → Auth Refresh 요청' },
        { input: [{ kind: 'message', from: 'Auth', to: 'Client', isDashed: true }], expected: true, name: 'Auth -->> Client 새 Access Token 발급' },
        { input: [{ kind: 'minCount', nodes: 3, edges: 5 }], expected: true, name: '3개 참여자 · 5개 메시지 완전성' }
      ]
    }
  );
})(window);
