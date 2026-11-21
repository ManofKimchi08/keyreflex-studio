/**
 * KeyReflex Studio - Advanced Pack (+24 Lessons)
 * Part 1: JavaScript (+8) & Python (+7)
 * Part 2 (C99 +6 & Spec +3) will be appended to close this IIFE.
 */
(function (global) {
  'use strict';
  const curr = global.CODE_CURRICULUM;
  if (!curr) return;

  curr.javascript.push(
    {
      id: 'js_adv_topo_sort_dag',
      title: 'Kahn 위상 정렬 및 부분 사이클 탐지',
      tier: 4,
      level: 'advanced',
      track: 'algorithm',
      category: '그래프 · DAG 위상정렬',
      complexity: { time: 'O(V + E)', space: 'O(V + E)' },
      description: '선행 작업 간선 [u, v](u -> v)가 주어진 DAG에서 Kahn 알고리즘(진입 차수 0 큐)으로 유효한 실행 순서를 구하고, 부분 사이클이 존재하면 빈 배열 []을 반환하세요.',
      explanation: {
        summary: '진입 차수가 0인 노드부터 큐에 넣고 인접 노드의 차수를 감소시키며 순서를 확정합니다.',
        keyConcepts: ['인접 리스트(Adjacency List)', '진입 차수(In-degree)', '헤드 포인터 큐(O(1) dequeue)', '방문 수 === V 사이클 검증'],
        lineByLine: [
          { line: 1, code: 'function topoSortTasks(n, edges) {', explain: '작업 수 n과 선행 간선 배열 edges를 받습니다.' },
          { line: 2, code: '  const adj = Array.from({ length: n }, () => []);', explain: '각 정점의 후행 작업 목록을 인접 리스트로 초기화합니다.' },
          { line: 3, code: '  const indeg = new Array(n).fill(0);', explain: '모든 작업의 진입 차수를 0으로 초기화합니다.' },
          { line: 4, code: '  for (const [u, v] of edges) {', explain: '각 의존성 간선 u -> v를 순회합니다.' },
          { line: 5, code: '    adj[u].push(v);', explain: 'u 완료 후 실행할 v를 인접 리스트에 추가합니다.' },
          { line: 6, code: '    indeg[v]++;', explain: '도착 노드 v의 진입 차수를 1 증가시킵니다.' },
          { line: 7, code: '  }', explain: '간선 그래프 구성 루프를 닫습니다.' },
          { line: 8, code: '  const queue = [];', explain: '즉시 실행 가능한(진입 차수 0) 작업 큐를 생성합니다.' },
          { line: 9, code: '  for (let i = 0; i < n; i++) {', explain: '모든 정점을 순회하며 시작 노드를 찾습니다.' },
          { line: 10, code: '    if (indeg[i] === 0) queue.push(i);', explain: '선행 의존성이 없는 정점을 큐에 적재합니다.' },
          { line: 11, code: '  }', explain: '초기 큐 적재 루프를 닫습니다.' },
          { line: 12, code: '  const order = [];', explain: '최종 위상 정렬 순서를 기록할 배열입니다.' },
          { line: 13, code: '  let head = 0;', explain: 'Array.shift()의 O(N) 비용을 피하기 위한 읽기 인덱스입니다.' },
          { line: 14, code: '  while (head < queue.length) {', explain: '큐에 처리할 정점이 남은 동안 반복합니다.' },
          { line: 15, code: '    const cur = queue[head++];', explain: '가장 먼저 준비된 작업을 꺼냅니다.' },
          { line: 16, code: '    order.push(cur);', explain: '확정된 작업을 실행 순서에 추가합니다.' },
          { line: 17, code: '    for (const nxt of adj[cur]) {', explain: '현재 작업의 모든 후행 작업을 확인합니다.' },
          { line: 18, code: '      if (--indeg[nxt] === 0) queue.push(nxt);', explain: '차수를 1 줄이고 0이 되면 큐에 새로 넣습니다.' },
          { line: 19, code: '    }', explain: '인접 노드 순회 블록을 닫습니다.' },
          { line: 20, code: '  }', explain: 'BFS 위상 정렬 루프를 닫습니다.' },
          { line: 21, code: '  return order.length === n ? order : [];', explain: '전체 정점 수와 다르면 사이클이 있으므로 []를 반환합니다.' },
          { line: 22, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(V + E)',
          timeWhy: '모든 정점 V와 간선 E를 헤드 포인터 큐로 정확히 한 번씩만 방문합니다.',
          space: 'O(V + E)',
          spaceWhy: '인접 리스트 adj, 차수 배열 indeg, 큐와 결과 배열이 O(V + E)를 사용합니다.'
        },
        pitfalls: [
          '부분 사이클(예: 0 -> 1 <-> 2)에서 order.length === n 검증을 누락하면 [0]이 반환되어 사이클을 놓칩니다.',
          'Array.shift() 대신 head 포인터를 사용해야 큰 DAG에서도 O(V^2) 저하를 막습니다.'
        ]
      },
      audit: {
        bugSummary: '순환 의존성(부분 사이클)이 포함된 그래프에서도 order.length === n 검사를 하지 않아 불완전한 배열을 그대로 반환합니다.',
        checklist: ['order.length === n 검증으로 사이클 그래프에서 []를 반환하는지 확인', '선행 -> 후행 방향(indeg[v]++)이 올바른지 점검'],
        focusLine: 21,
        buggyCode: `function topoSortTasks(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) {
    adj[u].push(v);
    indeg[v]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (indeg[i] === 0) queue.push(i);
  }
  const order = [];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    order.push(cur);
    for (const nxt of adj[cur]) {
      if (--indeg[nxt] === 0) queue.push(nxt);
    }
  }
  return order;
}`
      },
      entryPoint: 'topoSortTasks',
      code: `function topoSortTasks(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) {
    adj[u].push(v);
    indeg[v]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (indeg[i] === 0) queue.push(i);
  }
  const order = [];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    order.push(cur);
    for (const nxt of adj[cur]) {
      if (--indeg[nxt] === 0) queue.push(nxt);
    }
  }
  return order.length === n ? order : [];
}`,
      skeleton: `function topoSortTasks(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) {
    adj[____].push(v);
    ____[v]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (indeg[i] === ____) queue.push(i);
  }
  const order = [];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[____];
    order.push(cur);
    for (const nxt of adj[cur]) {
      if (--indeg[nxt] === ____) queue.push(nxt);
    }
  }
  return order.length === ____ ? order : [];
}`,
      tests: [
        { input: [4, [[0, 1], [1, 2], [2, 3]]], expected: [0, 1, 2, 3], name: '선형 DAG 순서' },
        { input: [4, [[0, 2], [1, 2], [2, 3]]], expected: [0, 1, 2, 3], name: '합류 지점 의존성 해결' },
        { input: [3, [[0, 1], [1, 2], [2, 1]]], expected: [], name: '부분 사이클 탐지' },
        { input: [0, []], expected: [], name: '빈 작업 그래프' }
      ]
    },
    {
      id: 'js_adv_trie_autocomplete',
      title: '트라이(Trie) 기반 사전순 자동완성',
      tier: 4,
      level: 'advanced',
      track: 'algorithm',
      category: '문자열 · 트라이 자동완성',
      complexity: { time: 'O(W + K)', space: 'O(W)' },
      description: '단어 배열 words에 대해 트라이를 구축한 뒤, prefix로 시작하는 단어를 사전순으로 최대 limit개까지 반환하는 자동완성 엔진을 구현하세요.',
      explanation: {
        summary: '문자별 자식 맵을 가진 Trie를 생성하고 prefix 노드까지 이동한 뒤 정렬된 키 순서로 DFS 탐색합니다.',
        keyConcepts: ['접두사 트리(Trie)', '경계 조건 limit <= 0 처리', 'Object.keys().sort() 사전순 DFS', '조기 중단 백트래킹'],
        lineByLine: [
          { line: 1, code: 'function trieAutocomplete(words, prefix, limit) {', explain: '단어 목록, 검색 접두사, 최대 결과 개수 limit을 받습니다.' },
          { line: 2, code: '  if (limit <= 0) return [];', explain: '반환 상한이 0 이하일 때는 즉시 빈 배열을 반환합니다.' },
          { line: 3, code: '  const root = { ch: {}, end: false };', explain: '루트 트라이 노드를 생성합니다.' },
          { line: 4, code: '  for (const word of words) {', explain: '모든 입력 단어를 트라이에 삽입합니다.' },
          { line: 5, code: '    let node = root;', explain: '루트에서 시작해 문자 경로를 따라 내려갑니다.' },
          { line: 6, code: '    for (const c of word) {', explain: '단어의 각 문자를 순회합니다.' },
          { line: 7, code: '      if (!node.ch[c]) node.ch[c] = { ch: {}, end: false };', explain: '해당 문자 자식이 없으면 새 노드를 할당합니다.' },
          { line: 8, code: '      node = node.ch[c];', explain: '자식 노드로 포인터를 이동합니다.' },
          { line: 9, code: '    }', explain: '단어 문자 삽입 루프를 닫습니다.' },
          { line: 10, code: '    node.end = true;', explain: '단어 종단 노드임을 표시합니다.' },
          { line: 11, code: '  }', explain: '전체 단어 삽입 루프를 닫습니다.' },
          { line: 12, code: '  let cur = root;', explain: '이제 prefix의 끝 노드를 찾습니다.' },
          { line: 13, code: '  for (const c of prefix) {', explain: 'prefix의 각 문자로 하강합니다.' },
          { line: 14, code: '    if (!cur.ch[c]) return [];', explain: '접두사 경로가 끊기면 일치 단어가 없으므로 []를 반환합니다.' },
          { line: 15, code: '    cur = cur.ch[c];', explain: '다음 접두사 문자로 이동합니다.' },
          { line: 16, code: '  }', explain: 'prefix 탐색 루프를 닫습니다.' },
          { line: 17, code: '  const out = [];', explain: '수집된 자동완성 결과를 담을 배열입니다.' },
          { line: 18, code: '  const dfs = (node, path) => {', explain: '현재 서브트리를 사전순으로 순회할 DFS 헬퍼입니다.' },
          { line: 19, code: '    if (out.length >= limit) return;', explain: 'limit 개수에 도달하면 불필요한 탐색을 즉시 종료합니다.' },
          { line: 20, code: '    if (node.end) out.push(path);', explain: '종단 노드면 완성된 단어를 결과에 추가합니다.' },
          { line: 21, code: '    for (const key of Object.keys(node.ch).sort()) {', explain: '사전순 보장을 위해 자식 문자를 정렬해 방문합니다.' },
          { line: 22, code: '      if (out.length >= limit) break;', explain: '하위 호출 전에도 limit 도달 여부를 재확인합니다.' },
          { line: 23, code: '      dfs(node.ch[key], path + key);', explain: '경로에 문자를 이어붙여 재귀 탐색합니다.' },
          { line: 24, code: '    }', explain: '자식 순회 루프를 닫습니다.' },
          { line: 25, code: '  };', explain: 'DFS 클로저 정의를 닫습니다.' },
          { line: 26, code: '  dfs(cur, prefix);', explain: 'prefix 끝 노드부터 DFS를 시작합니다.' },
          { line: 27, code: '  return out;', explain: '최대 limit개의 사전순 자동완성 결과를 반환합니다.' },
          { line: 28, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(W + K)',
          timeWhy: '사전 총 문자 수 W로 트라이를 만들고, 제한된 알파벳(상수 차수)에서 매칭 서브트리 K 문자만 DFS합니다.',
          space: 'O(W)',
          spaceWhy: '트라이 노드 저장에 최대 전체 입력 문자열 길이 W에 비례하는 메모리를 사용합니다.'
        },
        pitfalls: [
          'Object.keys(node.ch)를 정렬하지 않으면 입력 순서에 따라 사전순 자동완성 순위가 깨집니다.',
          'prefix 자체가 완성 단어인 경우에도 node.end 검사가 자식 탐색보다 먼저 나와야 정확히 포함됩니다.'
        ]
      },
      audit: {
        bugSummary: '자식 키를 사전순 정렬(.sort())하지 않고 삽입 순서대로 DFS하여 사전순 상한(limit) 테스트를 위반합니다.',
        checklist: ['자식 문자 키가 .sort()로 정렬된 뒤 DFS되는지 확인', 'limit 도달 즉시 조기 종료하는지 점검'],
        focusLine: 21,
        buggyCode: `function trieAutocomplete(words, prefix, limit) {
  if (limit <= 0) return [];
  const root = { ch: {}, end: false };
  for (const word of words) {
    let node = root;
    for (const c of word) {
      if (!node.ch[c]) node.ch[c] = { ch: {}, end: false };
      node = node.ch[c];
    }
    node.end = true;
  }
  let cur = root;
  for (const c of prefix) {
    if (!cur.ch[c]) return [];
    cur = cur.ch[c];
  }
  const out = [];
  const dfs = (node, path) => {
    if (out.length >= limit) return;
    if (node.end) out.push(path);
    for (const key of Object.keys(node.ch)) {
      if (out.length >= limit) break;
      dfs(node.ch[key], path + key);
    }
  };
  dfs(cur, prefix);
  return out;
}`
      },
      entryPoint: 'trieAutocomplete',
      code: `function trieAutocomplete(words, prefix, limit) {
  if (limit <= 0) return [];
  const root = { ch: {}, end: false };
  for (const word of words) {
    let node = root;
    for (const c of word) {
      if (!node.ch[c]) node.ch[c] = { ch: {}, end: false };
      node = node.ch[c];
    }
    node.end = true;
  }
  let cur = root;
  for (const c of prefix) {
    if (!cur.ch[c]) return [];
    cur = cur.ch[c];
  }
  const out = [];
  const dfs = (node, path) => {
    if (out.length >= limit) return;
    if (node.end) out.push(path);
    for (const key of Object.keys(node.ch).sort()) {
      if (out.length >= limit) break;
      dfs(node.ch[key], path + key);
    }
  };
  dfs(cur, prefix);
  return out;
}`,
      skeleton: `function trieAutocomplete(words, prefix, limit) {
  if (limit <= 0) return [];
  const root = { ch: {}, end: false };
  for (const word of words) {
    let node = root;
    for (const c of word) {
      if (!node.ch[c]) node.ch[c] = { ch: {}, end: false };
      node = node.ch[c];
    }
    node.end = ____;
  }
  let cur = root;
  for (const c of prefix) {
    if (!cur.ch[c]) return ____;
    cur = cur.ch[c];
  }
  const out = [];
  const dfs = (node, path) => {
    if (out.length >= limit) return;
    if (node.end) out.push(path);
    for (const key of Object.keys(node.ch).____()) {
      if (out.length >= limit) break;
      dfs(node.ch[key], path + ____);
    }
  };
  dfs(cur, prefix);
  return out;
}`,
      tests: [
        { input: [['zero', 'zebra', 'zen', 'apple'], 'ze', 2], expected: ['zebra', 'zen'], name: '비정렬 입력 사전순 상위 2개' },
        { input: [['car', 'card', 'care', 'cat'], 'car', 5], expected: ['car', 'card', 'care'], name: '접두사 자체 포함 검색' },
        { input: [['alpha', 'beta'], 'gam', 3], expected: [], name: '미일치 접두사' },
        { input: [['one', 'two'], '', 1], expected: ['one'], name: '빈 접두사 제한 1개' }
      ]
    },
    {
      id: 'js_adv_lfu_cache',
      title: 'O(1) LFU 캐시 시뮬레이터',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: '시스템 설계 · LFU 캐시',
      complexity: { time: 'O(N)', space: 'O(C)' },
      adr: {
        scenario: '단순 LRU 캐시는 일회성 대량 배치 스캔 시 기존 핫 키가 모두 밀려나는(Scan Pollution) 약점이 있습니다.',
        prompt: '트래픽 스파이크와 원샷 스캔이 혼재할 때 적중률을 지키는 O(1) 캐시 교체 전략은?',
        options: [
          { id: 'lru', label: 'A. 단일 Linked List 기반 단순 LRU만 사용', recommended: false, critique: '대량 일회성 키가 들어오면 자주 쓰이던 핫 키가 한꺼번에 축출됩니다.' },
          { id: 'lfu', label: 'B. 빈도별 Set 버킷 + minFreq 포인터 기반 O(1) LFU (동률 시 LRU)', recommended: true, critique: '정확합니다! 빈도 승격과 O(1) 최소 빈도 추적으로 핫 키를 보호하면서도 동률 키는 오래된 순으로 비웁니다.' }
        ]
      },
      description: '용량 cap과 연산 목록 ops([\'put\', k, v] | [\'get\', k])가 주어질 때 LFU(Least Frequently Used, 동률 시 LRU) 규칙으로 캐시를 동작시키고 get 결과 배열(미스 시 -1)을 반환하세요.',
      explanation: {
        summary: '키별 빈도 맵과 빈도별 Set 버킷(삽입 순 = LRU)을 유지하며 minFreq를 O(1)로 갱신합니다.',
        keyConcepts: ['빈도 버킷 Set의 삽입 순서 활용', 'minFreq 증분 조건(현재 min 버킷 소진)', 'cap <= 0 방어', '기존 키 put 시 값 갱신 및 빈도 +1'],
        lineByLine: [
          { line: 1, code: 'function simulateLFU(cap, ops) {', explain: '최대 용량 cap과 연산 시퀀스 ops를 입력받습니다.' },
          { line: 2, code: '  const vals = new Map();', explain: '키-값 저장소입니다.' },
          { line: 3, code: '  const freqs = new Map();', explain: '키별 현재 참조 빈도를 기록합니다.' },
          { line: 4, code: '  const buckets = new Map();', explain: '빈도 -> 해당 빈도 키들의 Set(삽입순 LRU) 매핑입니다.' },
          { line: 5, code: '  let minFreq = 0;', explain: '현재 캐시 내 최소 빈도를 추적합니다.' },
          { line: 6, code: '  const out = [];', explain: '모든 get 연산의 반환값을 모을 배열입니다.' },
          { line: 7, code: '  const touch = (k) => {', explain: '키 k가 참조/갱신될 때 빈도를 1 올리는 헬퍼입니다.' },
          { line: 8, code: '    const f = freqs.get(k);', explain: '기존 빈도 f를 조회합니다.' },
          { line: 9, code: '    freqs.set(k, f + 1);', explain: '빈도를 f + 1로 승격합니다.' },
          { line: 10, code: '    buckets.get(f).delete(k);', explain: '이전 빈도 버킷에서 k를 제거합니다.' },
          { line: 11, code: '    if (f === minFreq && buckets.get(f).size === 0) minFreq++;', explain: '최소 빈도 버킷이 비면 minFreq를 1 올립니다.' },
          { line: 12, code: '    if (!buckets.has(f + 1)) buckets.set(f + 1, new Set());', explain: '새 빈도 버킷이 없으면 생성합니다.' },
          { line: 13, code: '    buckets.get(f + 1).add(k);', explain: '가장 최근 사용 위치(Set 끝)에 추가합니다.' },
          { line: 14, code: '  };', explain: 'touch 헬퍼 정의를 닫습니다.' },
          { line: 15, code: '  for (const op of ops) {', explain: '각 캐시 연산을 순서대로 실행합니다.' },
          { line: 16, code: '    if (op[0] === \'get\') {', explain: '조회 연산 분기입니다.' },
          { line: 17, code: '      if (!vals.has(op[1])) { out.push(-1); continue; }', explain: '캐시 미스 시 -1을 기록하고 넘어갑니다.' },
          { line: 18, code: '      touch(op[1]);', explain: '히트 시 참조 빈도와 LRU 위치를 갱신합니다.' },
          { line: 19, code: '      out.push(vals.get(op[1]));', explain: '저장된 값을 결과에 추가합니다.' },
          { line: 20, code: '    } else if (op[0] === \'put\' && cap > 0) {', explain: '용량이 양수일 때만 삽입/갱신을 수행합니다.' },
          { line: 21, code: '      const k = op[1], v = op[2];', explain: '연산에서 키와 값을 꺼냅니다.' },
          { line: 22, code: '      if (vals.has(k)) { vals.set(k, v); touch(k); continue; }', explain: '기존 키면 값만 덮어쓰고 touch로 빈도를 올립니다.' },
          { line: 23, code: '      if (vals.size >= cap) {', explain: '캐시가 가득 찬 경우 축출을 실행합니다.' },
          { line: 24, code: '        const victim = buckets.get(minFreq).values().next().value;', explain: 'minFreq 버킷의 가장 오래된 키를 선택합니다.' },
          { line: 25, code: '        buckets.get(minFreq).delete(victim);', explain: '축출 대상을 버킷에서 삭제합니다.' },
          { line: 26, code: '        vals.delete(victim);', explain: '값 저장소에서도 제거합니다.' },
          { line: 27, code: '        freqs.delete(victim);', explain: '빈도 맵에서도 제거합니다.' },
          { line: 28, code: '      }', explain: '축출 블록을 닫습니다.' },
          { line: 29, code: '      vals.set(k, v);', explain: '새 키-값을 등록합니다.' },
          { line: 30, code: '      freqs.set(k, 1);', explain: '새 키의 초기 빈도는 1입니다.' },
          { line: 31, code: '      minFreq = 1;', explain: '새 키가 들어왔으므로 최소 빈도를 1로 재설정합니다.' },
          { line: 32, code: '      if (!buckets.has(1)) buckets.set(1, new Set());', explain: '빈도 1 버킷 존재를 보장합니다.' },
          { line: 33, code: '      buckets.get(1).add(k);', explain: '빈도 1 버킷 끝에 새 키를 넣습니다.' },
          { line: 34, code: '    }', explain: 'put 연산 블록을 닫습니다.' },
          { line: 35, code: '  }', explain: '전체 연산 루프를 닫습니다.' },
          { line: 36, code: '  return out;', explain: '수집된 get 응답 배열을 반환합니다.' },
          { line: 37, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: 'N개 연산마다 Map/Set 조회와 삭제만 수행해 연산당 O(1)이 걸립니다.',
          space: 'O(C)',
          spaceWhy: '최대 캐시 용량 C개의 항목만 vals, freqs, buckets에 보관합니다.'
        },
        pitfalls: [
          'touch()에서 f === minFreq이고 버킷이 비었을 때 minFreq++를 빼먹으면 축출 시 빈 버킷을 참조합니다.',
          '기존 키 put 시 minFreq를 1로 초기화하지 말고 touch(k)만 호출해야 합니다.'
        ]
      },
      audit: {
        bugSummary: 'touch() 내부에서 최소 빈도 버킷이 비었을 때 minFreq++ 갱신을 누락해 이후 축출 시 빈 버킷을 읽습니다.',
        checklist: ['buckets.get(f).size === 0일 때 minFreq++ 수행 확인', '신규 put 시 minFreq = 1 재설정 점검'],
        focusLine: 11,
        buggyCode: `function simulateLFU(cap, ops) {
  const vals = new Map();
  const freqs = new Map();
  const buckets = new Map();
  let minFreq = 0;
  const out = [];
  const touch = (k) => {
    const f = freqs.get(k);
    freqs.set(k, f + 1);
    buckets.get(f).delete(k);
    if (!buckets.has(f + 1)) buckets.set(f + 1, new Set());
    buckets.get(f + 1).add(k);
  };
  for (const op of ops) {
    if (op[0] === 'get') {
      if (!vals.has(op[1])) { out.push(-1); continue; }
      touch(op[1]);
      out.push(vals.get(op[1]));
    } else if (op[0] === 'put' && cap > 0) {
      const k = op[1], v = op[2];
      if (vals.has(k)) { vals.set(k, v); touch(k); continue; }
      if (vals.size >= cap) {
        const victim = buckets.get(minFreq).values().next().value;
        buckets.get(minFreq).delete(victim);
        vals.delete(victim);
        freqs.delete(victim);
      }
      vals.set(k, v);
      freqs.set(k, 1);
      minFreq = 1;
      if (!buckets.has(1)) buckets.set(1, new Set());
      buckets.get(1).add(k);
    }
  }
  return out;
}`
      },
      entryPoint: 'simulateLFU',
      code: `function simulateLFU(cap, ops) {
  const vals = new Map();
  const freqs = new Map();
  const buckets = new Map();
  let minFreq = 0;
  const out = [];
  const touch = (k) => {
    const f = freqs.get(k);
    freqs.set(k, f + 1);
    buckets.get(f).delete(k);
    if (f === minFreq && buckets.get(f).size === 0) minFreq++;
    if (!buckets.has(f + 1)) buckets.set(f + 1, new Set());
    buckets.get(f + 1).add(k);
  };
  for (const op of ops) {
    if (op[0] === 'get') {
      if (!vals.has(op[1])) { out.push(-1); continue; }
      touch(op[1]);
      out.push(vals.get(op[1]));
    } else if (op[0] === 'put' && cap > 0) {
      const k = op[1], v = op[2];
      if (vals.has(k)) { vals.set(k, v); touch(k); continue; }
      if (vals.size >= cap) {
        const victim = buckets.get(minFreq).values().next().value;
        buckets.get(minFreq).delete(victim);
        vals.delete(victim);
        freqs.delete(victim);
      }
      vals.set(k, v);
      freqs.set(k, 1);
      minFreq = 1;
      if (!buckets.has(1)) buckets.set(1, new Set());
      buckets.get(1).add(k);
    }
  }
  return out;
}`,
      skeleton: `function simulateLFU(cap, ops) {
  const vals = new Map();
  const freqs = new Map();
  const buckets = new Map();
  let minFreq = 0;
  const out = [];
  const touch = (k) => {
    const f = freqs.get(k);
    freqs.set(k, f + 1);
    buckets.get(f).delete(k);
    if (f === ____ && buckets.get(f).size === 0) minFreq++;
    if (!buckets.has(f + 1)) buckets.set(f + 1, new Set());
    buckets.get(f + 1).add(____);
  };
  for (const op of ops) {
    if (op[0] === 'get') {
      if (!vals.has(op[1])) { out.push(-1); continue; }
      touch(op[1]);
      out.push(vals.get(op[1]));
    } else if (op[0] === 'put' && cap > 0) {
      const k = op[1], v = op[2];
      if (vals.has(k)) { vals.set(k, v); touch(k); continue; }
      if (vals.size >= cap) {
        const victim = buckets.get(____).values().next().value;
        buckets.get(minFreq).delete(victim);
        vals.delete(victim);
        freqs.delete(victim);
      }
      vals.set(k, v);
      freqs.set(k, 1);
      minFreq = ____;
      if (!buckets.has(1)) buckets.set(1, new Set());
      buckets.get(1).add(k);
    }
  }
  return out;
}`,
      tests: [
        { input: [2, [['put', 1, 10], ['put', 2, 20], ['get', 1], ['put', 3, 30], ['get', 2], ['get', 3]]], expected: [10, -1, 30], name: '최소 빈도 축출' },
        { input: [2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['get', 2], ['put', 3, 3], ['get', 1], ['get', 3]]], expected: [1, 2, -1, 3], name: '동률 빈도 시 LRU 축출(minFreq 승격)' },
        { input: [2, [['put', 1, 5], ['put', 2, 6], ['put', 1, 50], ['put', 3, 7], ['get', 1], ['get', 2]]], expected: [50, -1], name: '기존 키 값 덮어쓰기 및 빈도 승격' },
        { input: [0, [['put', 1, 1], ['get', 1]]], expected: [-1], name: '용량 0 방어' }
      ]
    },
    {
      id: 'js_adv_rbac_policy_engine',
      title: '계층 상속 RBAC 권한 정책 엔진',
      tier: 4,
      level: 'advanced',
      track: 'architecture',
      category: '아키텍처 · RBAC 정책 엔진',
      complexity: { time: 'O(R + P)', space: 'O(R)' },
      adr: {
        scenario: '마이크로서비스 권한 엔진에서 사용자에게 여러 역할이 중첩 부여되고 역할 상속 간 허용·거부 규칙이 충돌합니다.',
        prompt: '보안 사고를 막기 위한 가장 안전한 RBAC 정책 평가 순서는?',
        options: [
          { id: 'first_allow', label: 'A. Allow 규칙을 하나라도 찾으면 즉시 true 반환(Allow-Wins)', recommended: false, critique: '다른 역할이나 상위 정책의 명시적 거부(Explicit Deny)를 건너뛰어 정지 계정에도 권한이 뚫립니다.' },
          { id: 'deny_overrides', label: 'B. 순환 상속 방어 후 전체 그래프 평가 + Explicit Deny 최우선(Deny-Overrides)', recommended: true, critique: '정확합니다! 단 하나의 명시적 거부라도 있으면 전체 평가를 false로 잠그고, 순환 상속은 visited로 차단합니다.' }
        ]
      },
      description: '역할 정의 roles({ allows, denies, inherits }), 사용자 역할 목록 userRoles, 요청 액션 action이 주어질 때 와일드카드(*, ns:*)와 순환 상속을 처리해 Explicit Deny 우선 정책으로 허용 여부(boolean)를 판정하세요.',
      explanation: {
        summary: '방문 집합으로 역할 상속 순환을 막으면서 모든 연관 역할을 순회해 단 하나의 명시적 거부라도 있으면 false를 반환합니다.',
        keyConcepts: ['Deny-Overrides(명시적 거부 우선)', '네임스페이스 와일드카드 매칭', 'visited Set 기반 순환 상속 방어', '전체 그래프 평가 후 allowed 반환'],
        lineByLine: [
          { line: 1, code: 'function evaluateRbac(roles, userRoles, action) {', explain: '역할 정책 테이블, 사용자 역할, 요청 액션을 받습니다.' },
          { line: 2, code: '  const matchPerm = (perm, target) => {', explain: '와일드카드(*)와 접두사 네임스페이스를 비교하는 헬퍼입니다.' },
          { line: 3, code: '    if (perm === \'*\' || perm === target) return true;', explain: '전역 와일드카드나 정확 일치를 허용합니다.' },
          { line: 4, code: '    return perm.endsWith(\':*\') && target.startsWith(perm.slice(0, -1));', explain: 'ns:* 패턴일 때 ns: 접두사 일치를 검사합니다.' },
          { line: 5, code: '  };', explain: 'matchPerm 헬퍼를 닫습니다.' },
          { line: 6, code: '  const visited = new Set();', explain: '순환 상속 무한 루프를 방지하는 방문 집합입니다.' },
          { line: 7, code: '  const stack = [...userRoles];', explain: '사용자에게 직접 부여된 역할을 탐색 스택에 넣습니다.' },
          { line: 8, code: '  let allowed = false;', explain: '모든 역할을 검사할 때까지 허용 여부를 지연 확정합니다.' },
          { line: 9, code: '  while (stack.length > 0) {', explain: '연결된 모든 상속 역할을 순회합니다.' },
          { line: 10, code: '    const roleName = stack.pop();', explain: '다음 검사할 역할 이름을 꺼냅니다.' },
          { line: 11, code: '    if (visited.has(roleName) || !roles[roleName]) continue;', explain: '이미 검사했거나 정의되지 않은 역할은 건너뜁니다.' },
          { line: 12, code: '    visited.add(roleName);', explain: '역할을 방문 완료로 마킹합니다.' },
          { line: 13, code: '    const rule = roles[roleName];', explain: '해당 역할의 정책 객체를 참조합니다.' },
          { line: 14, code: '    if ((rule.denies || []).some((p) => matchPerm(p, action))) return false;', explain: '명시적 거부 규칙이 매칭되면 즉시 false를 반환합니다.' },
          { line: 15, code: '    if ((rule.allows || []).some((p) => matchPerm(p, action))) allowed = true;', explain: '허용 규칙이 있으면 플래그만 true로 세우고 계속 검사합니다.' },
          { line: 16, code: '    for (const parent of rule.inherits || []) stack.push(parent);', explain: '상속받은 상위 역할들을 스택에 추가합니다.' },
          { line: 17, code: '  }', explain: '역할 탐색 루프를 닫습니다.' },
          { line: 18, code: '  return allowed;', explain: '거부가 전혀 없고 최소 1개 허용이 있었으면 true를 반환합니다.' },
          { line: 19, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(R + P)',
          timeWhy: 'visited로 각 역할 R을 최대 1회만 방문하며 보유 권한 목록 P를 선형 검사합니다.',
          space: 'O(R)',
          spaceWhy: 'visited 집합과 탐색 스택에 최대 도달 가능한 역할 수 R만큼 저장합니다.'
        },
        pitfalls: [
          'allows 일치 시 즉시 return true를 해버리면 다른 역할이나 상위 역할의 denies가 무시되는 보안 결함이 발생합니다.',
          '순환 상속(A -> B -> A)이 들어올 때 visited 체크가 없으면 무한 루프에 빠집니다.'
        ]
      },
      audit: {
        bugSummary: 'allows 매칭 순간 즉시 return true를 수행해 다른 역할에 선언된 explicit deny 규칙이 무시됩니다.',
        checklist: ['allows 일치 시 즉시 반환하지 않고 allowed = true만 설정하는지 확인', 'visited Set으로 순환 상속을 방어하는지 점검'],
        focusLine: 15,
        buggyCode: `function evaluateRbac(roles, userRoles, action) {
  const matchPerm = (perm, target) => {
    if (perm === '*' || perm === target) return true;
    return perm.endsWith(':*') && target.startsWith(perm.slice(0, -1));
  };
  const visited = new Set();
  const stack = [...userRoles];
  let allowed = false;
  while (stack.length > 0) {
    const roleName = stack.pop();
    if (visited.has(roleName) || !roles[roleName]) continue;
    visited.add(roleName);
    const rule = roles[roleName];
    if ((rule.denies || []).some((p) => matchPerm(p, action))) return false;
    if ((rule.allows || []).some((p) => matchPerm(p, action))) return true;
    for (const parent of rule.inherits || []) stack.push(parent);
  }
  return allowed;
}`
      },
      entryPoint: 'evaluateRbac',
      code: `function evaluateRbac(roles, userRoles, action) {
  const matchPerm = (perm, target) => {
    if (perm === '*' || perm === target) return true;
    return perm.endsWith(':*') && target.startsWith(perm.slice(0, -1));
  };
  const visited = new Set();
  const stack = [...userRoles];
  let allowed = false;
  while (stack.length > 0) {
    const roleName = stack.pop();
    if (visited.has(roleName) || !roles[roleName]) continue;
    visited.add(roleName);
    const rule = roles[roleName];
    if ((rule.denies || []).some((p) => matchPerm(p, action))) return false;
    if ((rule.allows || []).some((p) => matchPerm(p, action))) allowed = true;
    for (const parent of rule.inherits || []) stack.push(parent);
  }
  return allowed;
}`,
      skeleton: `function evaluateRbac(roles, userRoles, action) {
  const matchPerm = (perm, target) => {
    if (perm === '*' || perm === target) return true;
    return perm.endsWith(':*') && target.startsWith(perm.slice(0, -1));
  };
  const visited = new Set();
  const stack = [...userRoles];
  let allowed = false;
  while (stack.length > 0) {
    const roleName = stack.pop();
    if (visited.has(roleName) || !roles[roleName]) continue;
    visited.add(roleName);
    const rule = roles[roleName];
    if ((rule.denies || []).some((p) => matchPerm(p, action))) return ____;
    if ((rule.allows || []).some((p) => matchPerm(p, action))) allowed = ____;
    for (const parent of rule.inherits || []) stack.push(____);
  }
  return ____;
}`,
      tests: [
        { input: [{ editor: { allows: ['docs:*'], inherits: ['viewer'] }, viewer: { allows: ['docs:read'] }, suspended: { denies: ['docs:write'] } }, ['suspended', 'editor'], 'docs:write'], expected: false, name: '명시적 거부(Deny) 최우선' },
        { input: [{ admin: { allows: ['*'] }, dev: { inherits: ['admin'] } }, ['dev'], 'billing:delete'], expected: true, name: '상속 + 전역 와일드카드 허용' },
        { input: [{ a: { inherits: ['b'], allows: ['repo:read'] }, b: { inherits: ['a'] } }, ['a'], 'repo:write'], expected: false, name: '순환 상속 시 무한루프 방지' },
        { input: [{ billing: { allows: ['bill:*'] } }, ['billing'], 'bill2:read'], expected: false, name: '네임스페이스 경계 오매칭 방지' }
      ]
    },
    {
      id: 'js_adv_json_patch_diff',
      title: 'RFC 6902 JSON Patch Diff 생성기 리팩토링',
      tier: 4,
      level: 'advanced',
      track: 'refactoring',
      category: '리팩토링 · RFC6902 Diff',
      complexity: { time: 'O(K log K)', space: 'O(K)' },
      refactoringGoal: '값의 truthiness(null/0/false) 기반 분기를 hasOwnProperty 존재 검사로 교체하고 키 정렬 및 RFC 6901 포인터 이스케이프(~0, ~1)를 적용하세요.',
      refactoringBefore: `function diffFlatObjects(prev, next) {
  const ops = [];
  for (const k in next) {
    if (!prev[k]) ops.push({ op: 'add', path: '/' + k, value: next[k] });
    else if (prev[k] !== next[k]) ops.push({ op: 'replace', path: '/' + k, value: next[k] });
  }
  for (const k in prev) {
    if (!next[k]) ops.push({ op: 'remove', path: '/' + k });
  }
  return ops;
}`,
      description: '두 평탄 객체 prev와 next 사이의 차이를 RFC 6902 연산 배열({ op, path, value? })로 생성하되, 키를 사전순 정렬하고 falsy 값(null, 0, false)과 특수문자(/, ~)를 정확히 처리하세요.',
      explanation: {
        summary: 'Object.hasOwn(hasOwnProperty)으로 실제 프로퍼티 유무를 판별하고 RFC 6901 포인터 이스케이프를 적용합니다.',
        keyConcepts: ['hasOwnProperty 기반 존재 검사', 'falsy 값(0/false/null) 보존', '사전순 키 정렬 결정성', 'RFC 6901 (~ -> ~0, / -> ~1)'],
        lineByLine: [
          { line: 1, code: 'function diffFlatObjects(prev, next) {', explain: '이전 상태와 다음 상태 객체를 입력받습니다.' },
          { line: 2, code: '  const esc = (s) => s.replace(/~/g, \'~0\').replace(/\\//g, \'~1\');', explain: 'RFC 6901 규격에 따라 ~와 /를 이스케이프합니다.' },
          { line: 3, code: '  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).sort();', explain: '양쪽 고유 키의 합집합을 사전순으로 정렬합니다.' },
          { line: 4, code: '  const ops = [];', explain: '생성할 패치 연산 목록을 초기화합니다.' },
          { line: 5, code: '  for (const k of keys) {', explain: '정렬된 각 키에 대해 상태를 비교합니다.' },
          { line: 6, code: '    const inPrev = Object.prototype.hasOwnProperty.call(prev, k);', explain: 'prev 객체에 해당 키가 실제로 존재하는지 확인합니다.' },
          { line: 7, code: '    const inNext = Object.prototype.hasOwnProperty.call(next, k);', explain: 'next 객체에 해당 키가 실제로 존재하는지 확인합니다.' },
          { line: 8, code: '    const path = \'/\' + esc(k);', explain: '이스케이프된 JSON Pointer 경로를 조립합니다.' },
          { line: 9, code: '    if (!inPrev && inNext) {', explain: '신규로 추가된 키라면 add 연산을 생성합니다.' },
          { line: 10, code: '      ops.push({ op: \'add\', path, value: next[k] });', explain: '추가 경로와 새 값을 푸시합니다.' },
          { line: 11, code: '    } else if (inPrev && !inNext) {', explain: '다음 상태에서 사라진 키라면 remove 연산을 생성합니다.' },
          { line: 12, code: '      ops.push({ op: \'remove\', path });', explain: '삭제 대상 경로만 담아 푸시합니다.' },
          { line: 13, code: '    } else if (prev[k] !== next[k]) {', explain: '양쪽에 모두 있으나 값이 달라졌으면 replace를 생성합니다.' },
          { line: 14, code: '      ops.push({ op: \'replace\', path, value: next[k] });', explain: '교체 경로와 새 값을 푸시합니다.' },
          { line: 15, code: '    }', explain: '분기 조건문을 닫습니다.' },
          { line: 16, code: '  }', explain: '키 비교 루프를 닫습니다.' },
          { line: 17, code: '  return ops;', explain: '결정적 순서의 패치 연산 배열을 반환합니다.' },
          { line: 18, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(K log K)',
          timeWhy: '전체 고유 키 수 K의 합집합 생성 후 사전순 정렬에 O(K log K)가 소요됩니다.',
          space: 'O(K)',
          spaceWhy: '키 집합, 정렬 배열 및 패치 결과 목록이 키 수 K에 비례합니다.'
        },
        pitfalls: [
          '!prev[k] 같은 falsy 검사는 값이 0, false, null, ""일 때 기존 키를 없는 키로 오인합니다.',
          '이스케이프 순서에서 / -> ~1을 먼저 하면 새로 생긴 ~가 ~0으로 변질되므로 반드시 ~ -> ~0을 먼저 수행해야 합니다.'
        ]
      },
      audit: {
        bugSummary: 'hasOwnProperty 대신 truthiness 검사(prev[k] == null)를 사용해 값이 null/0인 기존 필드의 변경을 add로 오분류합니다.',
        checklist: ['값이 0, false, null일 때 replace가 아닌 add/remove로 잘못 판정되지 않는지 확인', '포인터 ~0/~1 순서 검증'],
        focusLine: 6,
        buggyCode: `function diffFlatObjects(prev, next) {
  const esc = (s) => s.replace(/~/g, '~0').replace(/\\//g, '~1');
  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).sort();
  const ops = [];
  for (const k of keys) {
    const inPrev = prev[k] != null;
    const inNext = next[k] != null;
    const path = '/' + esc(k);
    if (!inPrev && inNext) {
      ops.push({ op: 'add', path, value: next[k] });
    } else if (inPrev && !inNext) {
      ops.push({ op: 'remove', path });
    } else if (prev[k] !== next[k]) {
      ops.push({ op: 'replace', path, value: next[k] });
    }
  }
  return ops;
}`
      },
      entryPoint: 'diffFlatObjects',
      code: `function diffFlatObjects(prev, next) {
  const esc = (s) => s.replace(/~/g, '~0').replace(/\\//g, '~1');
  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).sort();
  const ops = [];
  for (const k of keys) {
    const inPrev = Object.prototype.hasOwnProperty.call(prev, k);
    const inNext = Object.prototype.hasOwnProperty.call(next, k);
    const path = '/' + esc(k);
    if (!inPrev && inNext) {
      ops.push({ op: 'add', path, value: next[k] });
    } else if (inPrev && !inNext) {
      ops.push({ op: 'remove', path });
    } else if (prev[k] !== next[k]) {
      ops.push({ op: 'replace', path, value: next[k] });
    }
  }
  return ops;
}`,
      skeleton: `function diffFlatObjects(prev, next) {
  const esc = (s) => s.replace(/~/g, '~0').replace(/\\//g, ____);
  const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).sort();
  const ops = [];
  for (const k of keys) {
    const inPrev = Object.prototype.____.call(prev, k);
    const inNext = Object.prototype.hasOwnProperty.call(next, k);
    const path = '/' + esc(k);
    if (!inPrev && inNext) {
      ops.push({ op: 'add', path, value: next[k] });
    } else if (inPrev && !inNext) {
      ops.push({ op: 'remove', path });
    } else if (prev[k] !== ____) {
      ops.push({ op: 'replace', path, value: next[k] });
    }
  }
  return ops;
}`,
      tests: [
        { input: [{ a: null, b: 1 }, { a: 0, c: false }], expected: [{ op: 'replace', path: '/a', value: 0 }, { op: 'remove', path: '/b' }, { op: 'add', path: '/c', value: false }], name: 'null/0/false falsy 값 보존' },
        { input: [{ 'a/b': 1, '~k': 2 }, { 'a/b': 2, '~k': 2 }], expected: [{ op: 'replace', path: '/a~1b', value: 2 }], name: 'RFC 6901 ~ 및 / 이스케이프' },
        { input: [{ x: 1 }, { x: 1 }], expected: [], name: '변경 없음' }
      ]
    },
    {
      id: 'js_adv_ai_toolcall_stream',
      title: '스트리밍 LLM Tool Call 델타 재조립기',
      tier: 4,
      level: 'advanced',
      track: 'ai',
      category: 'AI 엔지니어링 · 스트리밍 Tool Call',
      complexity: { time: 'O(N log N + C)', space: 'O(N + C)' },
      description: 'LLM 스트리밍 응답으로 분할 도착하는 tool call 델타 청크({ index, id?, name?, argsChunk? })를 인덱스별로 결합하고, 완성된 JSON 인자를 안전하게 파싱(실패 시 valid: false, args: null)해 오름차순 반환하세요.',
      explanation: {
        summary: 'index별 버퍼에 문자열 조각을 누적한 뒤 오름차순 정렬하고 예외 안전 JSON 파싱을 수행합니다.',
        keyConcepts: ['index 기반 멀티 툴콜 버퍼링', '문자열 청크 += 누적', 'try/catch 예외 격리 JSON 파싱', '인덱스 오름차순 정렬 보장'],
        lineByLine: [
          { line: 1, code: 'function assembleToolCalls(deltas) {', explain: '스트리밍 tool call 델타 청크 배열을 받습니다.' },
          { line: 2, code: '  const byIdx = new Map();', explain: 'index별로 조각을 합칠 누적 맵을 초기화합니다.' },
          { line: 3, code: '  for (const d of deltas) {', explain: '도착한 델타 이벤트를 순회합니다.' },
          { line: 4, code: '    if (!byIdx.has(d.index)) {', explain: '처음 등장한 툴 호출 인덱스면 버퍼 엔트리를 생성합니다.' },
          { line: 5, code: '      byIdx.set(d.index, { index: d.index, id: \'\', name: \'\', raw: \'\' });', explain: '빈 누적 상태를 맵에 저장합니다.' },
          { line: 6, code: '    }', explain: '초기화 조건문을 닫습니다.' },
          { line: 7, code: '    const cur = byIdx.get(d.index);', explain: '해당 인덱스의 누적 객체를 참조합니다.' },
          { line: 8, code: '    if (d.id) cur.id = d.id;', explain: '호출 ID가 포함되면 기록합니다.' },
          { line: 9, code: '    if (d.name) cur.name += d.name;', explain: '함수명 조각이 오면 이어붙입니다.' },
          { line: 10, code: '    if (d.argsChunk) cur.raw += d.argsChunk;', explain: 'JSON 인자 문자열 조각을 누적합니다.' },
          { line: 11, code: '  }', explain: '델타 병합 루프를 닫습니다.' },
          { line: 12, code: '  return Array.from(byIdx.values())', explain: '모든 누적 엔트리를 배열로 꺼냅니다.' },
          { line: 13, code: '    .sort((a, b) => a.index - b.index)', explain: '도착 순서와 무관하게 index 오름차순을 보장합니다.' },
          { line: 14, code: '    .map((c) => {', explain: '각 툴 호출을 최종 파싱 결과로 변환합니다.' },
          { line: 15, code: '      let args = null;', explain: '파싱 실패 시 반환할 기본값 null입니다.' },
          { line: 16, code: '      let valid = false;', explain: 'JSON 유효성 플래그를 false로 초기화합니다.' },
          { line: 17, code: '      try {', explain: '불완전한 스트림 중단 JSON에도 프로세스가 멈추지 않게 감쌉니다.' },
          { line: 18, code: '        args = JSON.parse(c.raw || \'{}\');', explain: '빈 인자는 {}로 간주하고 JSON 객체로 파싱합니다.' },
          { line: 19, code: '        valid = true;', explain: '파싱 성공 시 valid를 true로 설정합니다.' },
          { line: 20, code: '      } catch (e) {}', explain: '구문 오류 시 args=null, valid=false 상태를 유지합니다.' },
          { line: 21, code: '      return { index: c.index, id: c.id, name: c.name, args, valid };', explain: '정규화된 tool call 객체를 반환합니다.' },
          { line: 22, code: '    });', explain: 'map 변환 콜백을 닫습니다.' },
          { line: 23, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(N log N + C)',
          timeWhy: 'N개 청크 누적과 인덱스 정렬에 O(N log N), 전체 JSON 문자 길이 C 파싱에 O(C)가 듭니다.',
          space: 'O(N + C)',
          spaceWhy: '인덱스별 버퍼와 누적된 원시 문자열 길이 C만큼 메모리를 사용합니다.'
        },
        pitfalls: [
          'argsChunk를 += 대신 =으로 덮어쓰면 앞선 JSON 청크가 유실됩니다.',
          '스트림이 중간에 끊겨 JSON.parse가 실패할 때 try/catch가 없으면 전체 에이전트 루프가 중단됩니다.'
        ]
      },
      audit: {
        bugSummary: 'argsChunk를 이어붙이지 않고 덮어쓰기(=) 처리하여 분할 전송된 JSON 인자 조각을 유실합니다.',
        checklist: ['cur.raw += d.argsChunk로 누적되는지 확인', 'try/catch 파싱 실패 시 valid: false 반환 점검'],
        focusLine: 10,
        buggyCode: `function assembleToolCalls(deltas) {
  const byIdx = new Map();
  for (const d of deltas) {
    if (!byIdx.has(d.index)) {
      byIdx.set(d.index, { index: d.index, id: '', name: '', raw: '' });
    }
    const cur = byIdx.get(d.index);
    if (d.id) cur.id = d.id;
    if (d.name) cur.name += d.name;
    if (d.argsChunk) cur.raw = d.argsChunk;
  }
  return Array.from(byIdx.values())
    .sort((a, b) => a.index - b.index)
    .map((c) => {
      let args = null;
      let valid = false;
      try {
        args = JSON.parse(c.raw || '{}');
        valid = true;
      } catch (e) {}
      return { index: c.index, id: c.id, name: c.name, args, valid };
    });
}`
      },
      entryPoint: 'assembleToolCalls',
      code: `function assembleToolCalls(deltas) {
  const byIdx = new Map();
  for (const d of deltas) {
    if (!byIdx.has(d.index)) {
      byIdx.set(d.index, { index: d.index, id: '', name: '', raw: '' });
    }
    const cur = byIdx.get(d.index);
    if (d.id) cur.id = d.id;
    if (d.name) cur.name += d.name;
    if (d.argsChunk) cur.raw += d.argsChunk;
  }
  return Array.from(byIdx.values())
    .sort((a, b) => a.index - b.index)
    .map((c) => {
      let args = null;
      let valid = false;
      try {
        args = JSON.parse(c.raw || '{}');
        valid = true;
      } catch (e) {}
      return { index: c.index, id: c.id, name: c.name, args, valid };
    });
}`,
      skeleton: `function assembleToolCalls(deltas) {
  const byIdx = new Map();
  for (const d of deltas) {
    if (!byIdx.has(d.index)) {
      byIdx.set(d.index, { index: d.index, id: '', name: '', raw: '' });
    }
    const cur = byIdx.get(d.index);
    if (d.id) cur.id = d.id;
    if (d.name) cur.name += d.name;
    if (d.argsChunk) cur.raw ____ d.argsChunk;
  }
  return Array.from(byIdx.values())
    .sort((a, b) => a.index - b.index)
    .map((c) => {
      let args = null;
      let valid = false;
      try {
        args = JSON.parse(c.raw || ____);
        valid = ____;
      } catch (e) {}
      return { index: c.index, id: c.id, name: c.name, args, valid };
    });
}`,
      tests: [
        { input: [[{ index: 1, id: 'c2', name: 'weather', argsChunk: '{"city":' }, { index: 0, id: 'c1', name: 'search', argsChunk: '{"q":"rag"}' }, { index: 1, argsChunk: '"Seoul"}' }]], expected: [{ index: 0, id: 'c1', name: 'search', args: { q: 'rag' }, valid: true }, { index: 1, id: 'c2', name: 'weather', args: { city: 'Seoul' }, valid: true }], name: '역순 멀티 툴콜 병합 및 정렬' },
        { input: [[{ index: 0, id: 'c3', name: 'broken', argsChunk: '{"x":' }]], expected: [{ index: 0, id: 'c3', name: 'broken', args: null, valid: false }], name: '잘린 스트림 JSON 안전 격리' },
        { input: [[]], expected: [], name: '빈 델타 스트림' }
      ]
    },
    {
      id: 'js_adv_ai_semantic_cache',
      title: '코사인 유사도 + LRU 시맨틱 캐시',
      tier: 4,
      level: 'advanced',
      track: 'ai',
      category: 'AI 엔지니어링 · 시맨틱 캐시',
      complexity: { time: 'O(Q * M * D)', space: 'O(M * D)' },
      adr: {
        scenario: '동일한 의미의 질문이 어미·문구만 조금씩 바뀌어 들어올 때 완전 일치(Exact Match) 캐시로는 LLM API 비용을 줄일 수 없습니다.',
        prompt: 'LLM 게이트웨이 앞단에서 유사 질의 응답을 재사용하는 실무 캐시 전략은?',
        options: [
          { id: 'exact', label: 'A. 원시 프롬프트 문자열 SHA-256 해시 일치만 캐싱', recommended: false, critique: '문장 부호나 띄어쓰기 하나만 달라도 캐시 미스가 발생해 토큰 절감 효과가 낮습니다.' },
          { id: 'semantic', label: 'B. 임베딩 코사인 유사도 >= threshold 매칭 + 히트 시 MRU 승격 LRU 축출', recommended: true, critique: '정확합니다! 영벡터 방어와 L2 정규화 코사인 유사도로 의미적 일치를 판정하고 핫 응답을 LRU 끝에 유지합니다.' }
        ]
      },
      description: '임계값 threshold, 최대 보관 수 maxEntries, 요청 목록 queries({ op: \'store\'|\'lookup\', vec, answer? })에 대해 코사인 유사도 최댓값 매칭 및 LRU 축출 시맨틱 캐시를 구현하고 lookup 결과 배열을 반환하세요.',
      explanation: {
        summary: '정규화된 코사인 유사도를 계산해 최고 점수 캐시 항목을 찾고 LRU 순서를 유지합니다.',
        keyConcepts: ['코사인 유사도(영벡터 0 방어)', '임계값 threshold 기반 시맨틱 히트', '히트 시 LRU 꼬리로 이동(MRU 승격)', 'maxEntries 초과 시 최선두 축출'],
        lineByLine: [
          { line: 1, code: 'function runSemanticCache(threshold, maxEntries, queries) {', explain: '유사도 임계치, 캐시 용량, 쿼리 목록을 받습니다.' },
          { line: 2, code: '  const cosSim = (a, b) => {', explain: '두 임베딩 벡터 간 코사인 유사도를 계산하는 헬퍼입니다.' },
          { line: 3, code: '    let dot = 0, na = 0, nb = 0;', explain: '내적과 각 벡터의 제곱합을 초기화합니다.' },
          { line: 4, code: '    for (let i = 0; i < a.length; i++) {', explain: '각 차원을 순회하며 누적합니다.' },
          { line: 5, code: '      dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];', explain: '내적과 L2 노름 제곱을 동시에 구합니다.' },
          { line: 6, code: '    }', explain: '벡터 내적 루프를 닫습니다.' },
          { line: 7, code: '    const denom = Math.sqrt(na) * Math.sqrt(nb);', explain: '두 벡터 크기의 곱(분모)을 계산합니다.' },
          { line: 8, code: '    return denom === 0 ? 0 : dot / denom;', explain: '영벡터 나눗셈을 방어하며 코사인 값을 반환합니다.' },
          { line: 9, code: '  };', explain: 'cosSim 헬퍼 정의를 닫습니다.' },
          { line: 10, code: '  const cache = [];', explain: '앞쪽이 LRU(오래됨), 뒤쪽이 MRU(최신)인 배열 캐시입니다.' },
          { line: 11, code: '  const out = [];', explain: 'lookup 요청 결과를 저장할 배열입니다.' },
          { line: 12, code: '  for (const q of queries) {', explain: '모든 캐시 요청을 순서대로 처리합니다.' },
          { line: 13, code: '    if (q.op === \'store\') {', explain: '응답 저장 연산 분기입니다.' },
          { line: 14, code: '      if (maxEntries <= 0) continue;', explain: '용량이 0 이하면 저장하지 않고 건너뜁니다.' },
          { line: 15, code: '      if (cache.length >= maxEntries) cache.shift();', explain: '가득 찼으면 가장 오래된 LRU 항목을 제거합니다.' },
          { line: 16, code: '      cache.push({ vec: q.vec, answer: q.answer });', explain: '신규 임베딩과 응답을 MRU 끝에 추가합니다.' },
          { line: 17, code: '    } else if (q.op === \'lookup\') {', explain: '유사 질문 조회 연산 분기입니다.' },
          { line: 18, code: '      let bestIdx = -1, bestScore = threshold;', explain: '임계치 이상인 최고 유사도 인덱스를 찾습니다.' },
          { line: 19, code: '      for (let i = 0; i < cache.length; i++) {', explain: '현재 캐시 항목을 스캔합니다.' },
          { line: 20, code: '        const sim = cosSim(q.vec, cache[i].vec);', explain: '질의 벡터와 캐시 벡터의 코사인 유사도를 구합니다.' },
          { line: 21, code: '        if (sim >= bestScore) { bestScore = sim; bestIdx = i; }', explain: '기존 최고치 이상이면 후보 인덱스를 갱신합니다.' },
          { line: 22, code: '      }', explain: '캐시 스캔 루프를 닫습니다.' },
          { line: 23, code: '      if (bestIdx === -1) { out.push(null); continue; }', explain: '유사도 기준을 넘지 못하면 캐시 미스(null)입니다.' },
          { line: 24, code: '      const hit = cache.splice(bestIdx, 1)[0];', explain: '히트된 항목을 현재 위치에서 꺼낸 뒤,' },
          { line: 25, code: '      cache.push(hit);', explain: 'MRU(가장 최근 사용) 위치로 승격시킵니다.' },
          { line: 26, code: '      out.push(hit.answer);', explain: '재사용할 응답 문자열을 기록합니다.' },
          { line: 27, code: '    }', explain: 'lookup 분기를 닫습니다.' },
          { line: 28, code: '  }', explain: '쿼리 처리 루프를 닫습니다.' },
          { line: 29, code: '  return out;', explain: '전체 lookup 결과 배열을 반환합니다.' },
          { line: 30, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(Q * M * D)',
          timeWhy: 'Q번의 질의마다 최대 M개의 D차원 캐시 벡터와 코사인 유사도를 계산합니다.',
          space: 'O(M * D)',
          spaceWhy: '최대 M개의 D차원 임베딩과 응답만 캐시에 유지합니다.'
        },
        pitfalls: [
          '벡터 크기 정규화(denom) 없이 내적(dot)만 쓰면 벡터 스케일에 따라 코사인 임계치 비교가 왜곡됩니다.',
          'lookup 히트 시 cache.splice + push로 MRU 승격을 하지 않으면 자주 쓰는 응답이 FIFO로 축출됩니다.'
        ]
      },
      audit: {
        bugSummary: '크기 정규화 분모(||a||*||b||) 없이 단순 내적(dot)으로 threshold를 비교해 정규화되지 않은 임베딩에서 히트 판정이 실패합니다.',
        checklist: ['dot / (sqrt(na) * sqrt(nb)) 코사인 정규화 확인', '히트 시 LRU -> MRU 승격 점검'],
        focusLine: 8,
        buggyCode: `function runSemanticCache(threshold, maxEntries, queries) {
  const cosSim = (a, b) => {
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  };
  const cache = [];
  const out = [];
  for (const q of queries) {
    if (q.op === 'store') {
      if (maxEntries <= 0) continue;
      if (cache.length >= maxEntries) cache.shift();
      cache.push({ vec: q.vec, answer: q.answer });
    } else if (q.op === 'lookup') {
      let bestIdx = -1, bestScore = threshold;
      for (let i = 0; i < cache.length; i++) {
        const sim = cosSim(q.vec, cache[i].vec);
        if (sim >= bestScore) { bestScore = sim; bestIdx = i; }
      }
      if (bestIdx === -1) { out.push(null); continue; }
      const hit = cache.splice(bestIdx, 1)[0];
      cache.push(hit);
      out.push(hit.answer);
    }
  }
  return out;
}`
      },
      entryPoint: 'runSemanticCache',
      code: `function runSemanticCache(threshold, maxEntries, queries) {
  const cosSim = (a, b) => {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
  };
  const cache = [];
  const out = [];
  for (const q of queries) {
    if (q.op === 'store') {
      if (maxEntries <= 0) continue;
      if (cache.length >= maxEntries) cache.shift();
      cache.push({ vec: q.vec, answer: q.answer });
    } else if (q.op === 'lookup') {
      let bestIdx = -1, bestScore = threshold;
      for (let i = 0; i < cache.length; i++) {
        const sim = cosSim(q.vec, cache[i].vec);
        if (sim >= bestScore) { bestScore = sim; bestIdx = i; }
      }
      if (bestIdx === -1) { out.push(null); continue; }
      const hit = cache.splice(bestIdx, 1)[0];
      cache.push(hit);
      out.push(hit.answer);
    }
  }
  return out;
}`,
      skeleton: `function runSemanticCache(threshold, maxEntries, queries) {
  const cosSim = (a, b) => {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / ____;
  };
  const cache = [];
  const out = [];
  for (const q of queries) {
    if (q.op === 'store') {
      if (maxEntries <= 0) continue;
      if (cache.length >= maxEntries) cache.shift();
      cache.push({ vec: q.vec, answer: q.answer });
    } else if (q.op === 'lookup') {
      let bestIdx = -1, bestScore = threshold;
      for (let i = 0; i < cache.length; i++) {
        const sim = cosSim(q.vec, cache[i].vec);
        if (sim >= ____) { bestScore = sim; bestIdx = i; }
      }
      if (bestIdx === -1) { out.push(null); continue; }
      const hit = cache.splice(bestIdx, ____)[0];
      cache.push(____);
      out.push(hit.answer);
    }
  }
  return out;
}`,
      tests: [
        { input: [0.9, 2, [{ op: 'store', vec: [0.3, 0], answer: 'A1' }, { op: 'lookup', vec: [0.3, 0] }, { op: 'lookup', vec: [0, 1] }]], expected: ['A1', null], name: '비단위 벡터 코사인 정규화 매칭' },
        { input: [0.95, 2, [{ op: 'store', vec: [1, 0], answer: 'Hot' }, { op: 'store', vec: [0, 1], answer: 'Cold' }, { op: 'lookup', vec: [1, 0] }, { op: 'store', vec: [1, 1], answer: 'New' }, { op: 'lookup', vec: [0, 1] }, { op: 'lookup', vec: [1, 0] }]], expected: ['Hot', null, 'Hot'], name: '히트 항목 MRU 승격 및 LRU 축출' },
        { input: [0.8, 0, [{ op: 'store', vec: [1, 0], answer: 'X' }, { op: 'lookup', vec: [1, 0] }]], expected: [null], name: '용량 0 비활성 캐시' }
      ]
    },
    {
      id: 'js_adv_consistent_hash_ring',
      title: '일관된 해싱 링(Consistent Hashing + VNodes)',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: '시스템 설계 · 일관된 해싱 링',
      complexity: { time: 'O(R log R + K log R)', space: 'O(R)' },
      adr: {
        scenario: '분산 캐시 노드 10대 중 1대가 증설·장애로 빠졌을 때 key % N 모듈러 방식은 거의 모든 캐시 키가 다른 노드로 쏠립니다.',
        prompt: '노드 증감 시 캐시 스톰과 키 재배치 비율을 최소화하는 샤딩 토폴로지는?',
        options: [
          { id: 'modulo', label: 'A. 단순 hash(key) % nodeCount 모듈러 분배', recommended: false, critique: '노드 수가 바뀌면 (N-1)/N 비율 이상의 키가 대거 재배치되어 DB 부하 스파이크를 유발합니다.' },
          { id: 'ring', label: 'B. FNV-1a 32비트 가상 노드(vnodes) 링 + 시계 방향 이진 탐색 래핑', recommended: true, critique: '정확합니다! 평균 K/N 키만 재매핑되며 가상 노드가 물리 노드 간 부하 편차를 고르게 분산합니다.' }
        ]
      },
      description: '서버 목록 nodes, 노드당 가상 노드 수 vnodes, 요청 키 목록 keys가 주어질 때 FNV-1a(32비트 unsigned) 링 위에서 각 키가 시계 방향으로 만나는 첫 노드를 매핑한 객체를 반환하세요.',
      explanation: {
        summary: '각 서버의 vnodes 복제본을 32비트 해시 링에 정렬한 뒤 이진 탐색과 모듈로 래핑으로 키를 라우팅합니다.',
        keyConcepts: ['FNV-1a 32비트 무부호 해시(>>> 0)', '가상 노드(vnodes)로 핫스팟 완화', '이진 탐색(lower_bound)', '링 끝 초과 시 index % len 래핑'],
        lineByLine: [
          { line: 1, code: 'function routeConsistentHash(nodes, vnodes, keys) {', explain: '물리 노드 목록, 가상 노드 수, 라우팅할 키 목록을 받습니다.' },
          { line: 2, code: '  if (nodes.length === 0 || vnodes <= 0) return {};', explain: '노드나 가상 노드가 없으면 빈 매핑을 반환합니다.' },
          { line: 3, code: '  const hash32 = (s) => {', explain: '결정적 32비트 무부호 FNV-1a 해시 함수를 정의합니다.' },
          { line: 4, code: '    let h = 0x811c9dc5;', explain: 'FNV-1a 32비트 오프셋 기반값을 설정합니다.' },
          { line: 5, code: '    for (let i = 0; i < s.length; i++) {', explain: '문자열의 각 문자 코드를 반영합니다.' },
          { line: 6, code: '      h ^= s.charCodeAt(i);', explain: '현재 문자 코드와 XOR 연산합니다.' },
          { line: 7, code: '      h = Math.imul(h, 0x01000193);', explain: '32비트 정수 곱셈으로 FNV 프라임을 곱합니다.' },
          { line: 8, code: '    }', explain: '해시 누적 루프를 닫습니다.' },
          { line: 9, code: '    return h >>> 0;', explain: '부호 없는 32비트 양의 정수로 정규화합니다.' },
          { line: 10, code: '  };', explain: 'hash32 헬퍼를 닫습니다.' },
          { line: 11, code: '  const ring = [];', explain: '가상 노드 포인트를 담을 링 배열입니다.' },
          { line: 12, code: '  for (const node of nodes) {', explain: '각 물리 노드에 대해 가상 노드를 생성합니다.' },
          { line: 13, code: '    for (let i = 0; i < vnodes; i++) {', explain: 'vnodes 횟수만큼 복제 포인트를 만듭니다.' },
          { line: 14, code: '      ring.push({ h: hash32(node + \'#\' + i), node });', explain: '가상 노드 식별자 해시와 소유 노드를 등록합니다.' },
          { line: 15, code: '    }', explain: '가상 노드 루프를 닫습니다.' },
          { line: 16, code: '  }', explain: '물리 노드 루프를 닫습니다.' },
          { line: 17, code: '  ring.sort((a, b) => a.h - b.h || (a.node < b.node ? -1 : 1));', explain: '해시 위치 오름차순(충돌 시 노드명순)으로 정렬합니다.' },
          { line: 18, code: '  const res = {};', explain: '키별 라우팅 결과 객체를 생성합니다.' },
          { line: 19, code: '  for (const key of keys) {', explain: '각 키의 해시 이상인 첫 링 노드를 찾습니다.' },
          { line: 20, code: '    const kh = hash32(key);', explain: '요청 키의 32비트 해시 좌표를 계산합니다.' },
          { line: 21, code: '    let lo = 0, hi = ring.length;', explain: 'lower_bound 이진 탐색 구간을 설정합니다.' },
          { line: 22, code: '    while (lo < hi) {', explain: 'lo와 hi가 수렴할 때까지 반복합니다.' },
          { line: 23, code: '      const mid = (lo + hi) >>> 1;', explain: '중앙 인덱스를 계산합니다.' },
          { line: 24, code: '      if (ring[mid].h < kh) lo = mid + 1;', explain: '중앙 해시가 작으면 오른쪽 절반을 탐색합니다.' },
          { line: 25, code: '      else hi = mid;', explain: '이상이면 왼쪽 경계를 좁힙니다.' },
          { line: 26, code: '    }', explain: '이진 탐색 루프를 닫습니다.' },
          { line: 27, code: '    res[key] = ring[lo % ring.length].node;', explain: '마지막 노드보다 큰 해시는 index 0으로 순환 매핑합니다.' },
          { line: 28, code: '  }', explain: '키 라우팅 루프를 닫습니다.' },
          { line: 29, code: '  return res;', explain: '최종 라우팅 맵을 반환합니다.' },
          { line: 30, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(R log R + K log R)',
          timeWhy: '전체 가상 노드 R = N * V 정렬에 O(R log R), K개 키 이진 탐색에 O(K log R)이 소요됩니다.',
          space: 'O(R)',
          spaceWhy: '총 R개의 가상 노드 엔트리를 링 배열에 보관합니다.'
        },
        pitfalls: [
          'ring[lo % ring.length] 모듈로 래핑을 빠뜨리면 최대 해시 이후의 키가 undefined 노드를 참조해 오류가 납니다.',
          'hash32 마지막에 >>> 0을 누락하면 음수/양수 정렬이 깨져 일관성이 무너집니다.'
        ]
      },
      audit: {
        bugSummary: '이진 탐색 결과가 ring.length일 때 index 0으로 순환(% ring.length)하지 않아 링 끝 이후 키 매핑 시 예외가 발생합니다.',
        checklist: ['ring[lo % ring.length] 순환 매핑 확인', '>>> 0 무부호 32비트 정규화 점검'],
        focusLine: 27,
        buggyCode: `function routeConsistentHash(nodes, vnodes, keys) {
  if (nodes.length === 0 || vnodes <= 0) return {};
  const hash32 = (s) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  };
  const ring = [];
  for (const node of nodes) {
    for (let i = 0; i < vnodes; i++) {
      ring.push({ h: hash32(node + '#' + i), node });
    }
  }
  ring.sort((a, b) => a.h - b.h || (a.node < b.node ? -1 : 1));
  const res = {};
  for (const key of keys) {
    const kh = hash32(key);
    let lo = 0, hi = ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (ring[mid].h < kh) lo = mid + 1;
      else hi = mid;
    }
    res[key] = ring[lo].node;
  }
  return res;
}`
      },
      entryPoint: 'routeConsistentHash',
      code: `function routeConsistentHash(nodes, vnodes, keys) {
  if (nodes.length === 0 || vnodes <= 0) return {};
  const hash32 = (s) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  };
  const ring = [];
  for (const node of nodes) {
    for (let i = 0; i < vnodes; i++) {
      ring.push({ h: hash32(node + '#' + i), node });
    }
  }
  ring.sort((a, b) => a.h - b.h || (a.node < b.node ? -1 : 1));
  const res = {};
  for (const key of keys) {
    const kh = hash32(key);
    let lo = 0, hi = ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (ring[mid].h < kh) lo = mid + 1;
      else hi = mid;
    }
    res[key] = ring[lo % ring.length].node;
  }
  return res;
}`,
      skeleton: `function routeConsistentHash(nodes, vnodes, keys) {
  if (nodes.length === 0 || vnodes <= 0) return {};
  const hash32 = (s) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> ____;
  };
  const ring = [];
  for (const node of nodes) {
    for (let i = 0; i < vnodes; i++) {
      ring.push({ h: hash32(node + '#' + i), node });
    }
  }
  ring.sort((a, b) => a.h - b.h || (a.node < b.node ? -1 : 1));
  const res = {};
  for (const key of keys) {
    const kh = hash32(key);
    let lo = 0, hi = ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (ring[mid].h < kh) lo = ____ + 1;
      else hi = mid;
    }
    res[key] = ring[lo % ____].node;
  }
  return res;
}`,
      tests: [
        { input: [['nodeA', 'nodeB', 'nodeC'], 4, ['user:1', 'user:2', 'sess:99', 'zzz_wrap']], expected: { 'user:1': 'nodeB', 'user:2': 'nodeB', 'sess:99': 'nodeA', 'zzz_wrap': 'nodeC' }, name: '가상 노드 FNV-1a 링 라우팅' },
        { input: [[], 3, ['k1']], expected: {}, name: '빈 노드 목록 방어' }
      ]
    }
  );

  curr.python.push(
    {
      id: 'py_adv_dijkstra_shortest',
      title: '우선순위 큐 기반 다익스트라 최단 경로',
      tier: 4,
      level: 'advanced',
      track: 'algorithm',
      category: '그래프 · 다익스트라 최단경로',
      complexity: { time: 'O((V + E) log V)', space: 'O(V + E)' },
      description: '음수 가중치가 없는 방향 그래프(정점 0..n-1, 간선 [u, v, w])에서 src에서 dst까지의 최소 비용을 heapq로 계산하고, 도달 불가능하면 -1을 반환하세요.',
      explanation: {
        summary: '최소 힙에서 가장 가까운 확정 정점을 꺼내며 거리를 완화(Relaxation)하고 만료된 힙 항목은 건너뜁니다.',
        keyConcepts: ['heapq 최소 힙', 'pop 시점 만료 항목 스킵(d > dist[u])', '간선 완화 조건(d + w < dist[v])', '도달 불가 시 -1 반환'],
        lineByLine: [
          { line: 1, code: 'import heapq', explain: '우선순위 큐를 위한 표준 heapq 모듈을 불러옵니다.' },
          { line: 2, code: 'def dijkstra_distance(n, edges, src, dst):', explain: '정점 수, 가중치 간선, 출발/도착 노드를 받습니다.' },
          { line: 3, code: '    adj = [[] for _ in range(n)]', explain: '각 정점의 (이웃, 가중치) 인접 리스트를 만듭니다.' },
          { line: 4, code: '    for u, v, w in edges:', explain: '모든 방향 간선을 순회합니다.' },
          { line: 5, code: '        adj[u].append((v, w))', explain: 'u에서 v로 가는 비용 w 간선을 등록합니다.' },
          { line: 6, code: '    INF = 10**18', explain: '도달 불가 상태를 나타내는 충분히 큰 상수입니다.' },
          { line: 7, code: '    dist = [INF] * n', explain: '최단 거리 테이블을 INF로 초기화합니다.' },
          { line: 8, code: '    dist[src] = 0', explain: '출발 노드의 거리는 0입니다.' },
          { line: 9, code: '    pq = [(0, src)]', explain: '(누적 비용, 정점) 튜플로 최소 힙을 시작합니다.' },
          { line: 10, code: '    while pq:', explain: '힙에 후보가 남아 있는 동안 반복합니다.' },
          { line: 11, code: '        d, u = heapq.heappop(pq)', explain: '현재까지 누적 비용이 가장 작은 정점을 꺼냅니다.' },
          { line: 12, code: '        if d > dist[u]:', explain: '이미 더 짧은 경로로 갱신된 낡은 힙 항목이면,' },
          { line: 13, code: '            continue', explain: '이웃을 다시 탐색하지 않고 건너뜁니다.' },
          { line: 14, code: '        if u == dst:', explain: '목적지가 힙에서 최초 확정되면 즉시 최단 거리를 확정합니다.' },
          { line: 15, code: '            return d', explain: '음이 아닌 가중치 조건상 최초 pop 비용이 최소입니다.' },
          { line: 16, code: '        for v, w in adj[u]:', explain: 'u에서 나가는 모든 간선을 검사합니다.' },
          { line: 17, code: '            nd = d + w', explain: 'u를 경유해 v로 가는 후보 비용을 계산합니다.' },
          { line: 18, code: '            if nd < dist[v]:', explain: '기존 최단 거리보다 짧으면,' },
          { line: 19, code: '                dist[v] = nd', explain: '거리를 갱신하고,' },
          { line: 20, code: '                heapq.heappush(pq, (nd, v))', explain: '새 후보를 우선순위 큐에 넣습니다.' },
          { line: 21, code: '    return -1', explain: '힙이 빌 때까지 dst를 못 찾으면 도달 불가(-1)입니다.' }
        ],
        complexity: {
          time: 'O((V + E) log V)',
          timeWhy: '간선 완화마다 힙 푸시가 최대 E번 일어나므로 O((V + E) log V) 시간에 완료됩니다.',
          space: 'O(V + E)',
          spaceWhy: '인접 리스트와 거리 배열 및 힙 저장에 O(V + E) 공간을 사용합니다.'
        },
        pitfalls: [
          'BFS처럼 이웃을 힙에 넣을 때(push 시점) 곧바로 visited로 막아버리면 더 짧은 우회 경로를 무시해 오답이 됩니다.',
          '만료 엔트리 스킵(d > dist[u])을 누락하면 동일 정점을 중복 탐색해 시간 복잡도가 크게 나빠집니다.'
        ]
      },
      audit: {
        bugSummary: '이웃 노드를 큐에 처음 넣는 순간(push 시점) visited로 잠가버려 더 짧은 경유 경로의 거리를 갱신하지 못합니다.',
        checklist: ['방문/확정 처리를 push가 아닌 pop + dist[v] 비교로 수행하는지 확인', '도달 불가 시 -1 반환 점검'],
        focusLine: 18,
        buggyCode: `import heapq
def dijkstra_distance(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist = [10**18] * n
    dist[src] = 0
    seen = {src}
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == dst:
            return d
        for v, w in adj[u]:
            if v not in seen:
                seen.add(v)
                dist[v] = d + w
                heapq.heappush(pq, (d + w, v))
    return -1`
      },
      entryPoint: 'dijkstra_distance',
      code: `import heapq
def dijkstra_distance(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = 10**18
    dist = [INF] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        if u == dst:
            return d
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return -1`,
      skeleton: `import heapq
def dijkstra_distance(n, edges, src, dst):
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    INF = 10**18
    dist = [INF] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > ____[u]:
            continue
        if u == dst:
            return d
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[____]:
                dist[v] = ____
                heapq.heappush(pq, (nd, v))
    return ____`,
      tests: [
        { input: [3, [[0, 1, 10], [0, 2, 2], [2, 1, 3]], 0, 1], expected: 5, name: '우회 최단 경로(직통보다 짧음)' },
        { input: [4, [[0, 1, 1], [1, 2, 4]], 0, 3], expected: -1, name: '도달 불가 정점 -1' },
        { input: [2, [[0, 1, 7]], 0, 0], expected: 0, name: '출발지 == 목적지' }
      ]
    },
    {
      id: 'py_adv_topo_sort_kahn',
      title: '사전순 빌드 의존성 위상 정렬 (Heap Kahn)',
      tier: 4,
      level: 'advanced',
      track: 'algorithm',
      category: '그래프 · 빌드 순서 결정',
      complexity: { time: 'O(V log V + E)', space: 'O(V + E)' },
      description: '패키지 목록 targets와 의존성 목록 deps([pkg, need]: pkg는 need 이후 빌드)가 주어질 때 최소 힙 기반 Kahn 알고리즘으로 사전순 가장 앞선 빌드 순서를 구하고, 순환 의존성 시 []를 반환하세요.',
      explanation: {
        summary: '진입 차수가 0인 패키지를 최소 힙에 담아 이름 사전순으로 꺼내며 의존성 순서를 결정적으로 확정합니다.',
        keyConcepts: ['문자열 키 그래프 인접 딕셔너리', 'heapq 기반 사전순 동률 해소', '부분 사이클 길이 불일치 검증', '중복 간선 및 독립 타깃 처리'],
        lineByLine: [
          { line: 1, code: 'import heapq', explain: '사전순 동률 해소를 위해 최소 힙 모듈을 불러옵니다.' },
          { line: 2, code: 'def resolve_build_order(targets, deps):', explain: '빌드 대상 이름 리스트와 [pkg, need] 의존성 쌍을 받습니다.' },
          { line: 3, code: '    adj = {t: [] for t in targets}', explain: '선행 패키지 -> 후행 패키지 인접 딕셔너리를 만듭니다.' },
          { line: 4, code: '    indeg = {t: 0 for t in targets}', explain: '각 타깃의 선행 의존성 개수를 0으로 초기화합니다.' },
          { line: 5, code: '    for pkg, need in deps:', explain: 'pkg가 need에 의존한다는 명세를 순회합니다.' },
          { line: 6, code: '        adj[need].append(pkg)', explain: 'need가 끝난 뒤 pkg가 실행되도록 간선을 연결합니다.' },
          { line: 7, code: '        indeg[pkg] += 1', explain: 'pkg의 진입 차수를 1 증가시킵니다.' },
          { line: 8, code: '    heap = [t for t in targets if indeg[t] == 0]', explain: '선행 의존성이 없는 타깃을 모아 초기 힙을 만듭니다.' },
          { line: 9, code: '    heapq.heapify(heap)', explain: '리스트를 제자리(O(V))로 최소 힙 구조로 정렬합니다.' },
          { line: 10, code: '    order = []', explain: '확정된 빌드 순서를 저장합니다.' },
          { line: 11, code: '    while heap:', explain: '실행 가능한 패키지가 남은 동안 반복합니다.' },
          { line: 12, code: '        cur = heapq.heappop(heap)', explain: '사전순 가장 앞선 타깃을 꺼냅니다.' },
          { line: 13, code: '        order.append(cur)', explain: '빌드 순서에 기록합니다.' },
          { line: 14, code: '        for nxt in adj[cur]:', explain: 'cur을 기다리던 후행 타깃들을 확인합니다.' },
          { line: 15, code: '            indeg[nxt] -= 1', explain: '후행 타깃의 남은 의존성 수를 1 감소시킵니다.' },
          { line: 16, code: '            if indeg[nxt] == 0:', explain: '모든 선행 조건이 해소되었으면,' },
          { line: 17, code: '                heapq.heappush(heap, nxt)', explain: '최소 힙에 추가해 사전순 순서를 맞춥니다.' },
          { line: 18, code: '    return order if len(order) == len(targets) else []', explain: '사이클 때문에 일부 타깃이 빠졌으면 []를 반환합니다.' }
        ],
        complexity: {
          time: 'O(V log V + E)',
          timeWhy: '모든 정점 V가 최소 힙에 한 번씩 들어가고 나오며 O(V log V), 모든 간선 E를 1회 검사합니다.',
          space: 'O(V + E)',
          spaceWhy: '인접 딕셔너리, 진입 차수 맵, 최소 힙이 정점과 간선 수에 비례합니다.'
        },
        pitfalls: [
          'deps = [pkg, need]의 방향을 뒤집지 않도록 need -> pkg로 연결해야 합니다.',
          '순환 그래프에 독립 정점이 섞여 있을 때 len(order) == len(targets) 검사를 빼먹으면 빈 배열 대신 부분 결과를 반환합니다.'
        ]
      },
      audit: {
        bugSummary: '일부 정점만 사이클에 얽혀 있을 때 len(order) == len(targets) 검사를 생략해 부분 결과만 잘못 반환합니다.',
        checklist: ['len(order) == len(targets) 검증 여부 확인', 'need -> pkg 간선 방향 점검'],
        focusLine: 18,
        buggyCode: `import heapq
def resolve_build_order(targets, deps):
    adj = {t: [] for t in targets}
    indeg = {t: 0 for t in targets}
    for pkg, need in deps:
        adj[need].append(pkg)
        indeg[pkg] += 1
    heap = [t for t in targets if indeg[t] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        cur = heapq.heappop(heap)
        order.append(cur)
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)
    return order`
      },
      entryPoint: 'resolve_build_order',
      code: `import heapq
def resolve_build_order(targets, deps):
    adj = {t: [] for t in targets}
    indeg = {t: 0 for t in targets}
    for pkg, need in deps:
        adj[need].append(pkg)
        indeg[pkg] += 1
    heap = [t for t in targets if indeg[t] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        cur = heapq.heappop(heap)
        order.append(cur)
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)
    return order if len(order) == len(targets) else []`,
      skeleton: `import heapq
def resolve_build_order(targets, deps):
    adj = {t: [] for t in targets}
    indeg = {t: 0 for t in targets}
    for pkg, need in deps:
        adj[____].append(pkg)
        indeg[____] += 1
    heap = [t for t in targets if indeg[t] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        cur = heapq.heappop(heap)
        order.append(cur)
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)
    return order if len(order) == len(____) else []`,
      tests: [
        { input: [['ui', 'core', 'api', 'db'], [['ui', 'api'], ['api', 'core'], ['ui', 'db']]], expected: ['core', 'api', 'db', 'ui'], name: '사전순 우선 + 의존성 해결' },
        { input: [['util', 'a', 'b'], [['a', 'b'], ['b', 'a']]], expected: [], name: '독립 노드 + 부분 사이클 탐지' },
        { input: [['z', 'a', 'm'], []], expected: ['a', 'm', 'z'], name: '의존성 없는 사전순 정렬' }
      ]
    },
    {
      id: 'py_adv_sliding_window_max',
      title: '단조 감소 덱(Deque) 슬라이딩 윈도우 최댓값',
      tier: 4,
      level: 'advanced',
      track: 'algorithm',
      category: '덱 · 슬라이딩 윈도우 최댓값',
      complexity: { time: 'O(N)', space: 'O(K)' },
      description: '정수 배열 nums와 윈도우 크기 k가 주어질 때 크기 k의 모든 연속 구간 최댓값을 단조 감소 덱(collections.deque)을 이용해 O(N) 시간에 구하세요.',
      explanation: {
        summary: '인덱스를 저장하는 단조 감소 덱에서 만료된 좌측 인덱스와 현재 값 이하의 우측 후보를 제거합니다.',
        keyConcepts: ['단조 감소 덱(Monotonic Queue)', '윈도우 경계 만료 검사(dq[0] <= i - k)', '인덱스 기반 위치 추적', '잘못된 k 경계 방어'],
        lineByLine: [
          { line: 1, code: 'from collections import deque', explain: '양끝 O(1) 삽입/삭제를 지원하는 deque를 불러옵니다.' },
          { line: 2, code: 'def max_sliding_window(nums, k):', explain: '숫자 리스트와 윈도우 폭 k를 입력받습니다.' },
          { line: 3, code: '    if not nums or k <= 0 or k > len(nums):', explain: '빈 입력이나 유효하지 않은 윈도우 크기를 먼저 거릅니다.' },
          { line: 4, code: '        return []', explain: '결과를 만들 수 없으므로 빈 리스트를 반환합니다.' },
          { line: 5, code: '    dq = deque()', explain: '내림차순 값에 대응하는 인덱스를 담을 덱입니다.' },
          { line: 6, code: '    out = []', explain: '윈도우별 최댓값을 모을 결과 리스트입니다.' },
          { line: 7, code: '    for i, val in enumerate(nums):', explain: '배열 인덱스와 값을 순회합니다.' },
          { line: 8, code: '        if dq and dq[0] <= i - k:', explain: '덱 맨 앞 인덱스가 현재 윈도우를 벗어났는지 확인합니다.' },
          { line: 9, code: '            dq.popleft()', explain: '만료된 최댓값 후보를 좌측에서 제거합니다.' },
          { line: 10, code: '        while dq and nums[dq[-1]] <= val:', explain: '새 값보다 작거나 같은 기존 후보는 가치가 없으므로,' },
          { line: 11, code: '            dq.pop()', explain: '우측에서 모두 제거해 단조 감소를 유지합니다.' },
          { line: 12, code: '        dq.append(i)', explain: '현재 인덱스를 덱 우측에 추가합니다.' },
          { line: 13, code: '        if i >= k - 1:', explain: '최초 크기 k 윈도우가 완성된 시점부터,' },
          { line: 14, code: '            out.append(nums[dq[0]])', explain: '덱 맨 앞(최댓값 인덱스)의 값을 결과에 기록합니다.' },
          { line: 15, code: '    return out', explain: '모든 윈도우 최댓값 리스트를 반환합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: '모든 원소는 최대 1번 push되고 1번 pop되므로 총 연산 횟수가 2N 이하입니다.',
          space: 'O(K)',
          spaceWhy: '덱 안에 동시에 존재하는 인덱스 수는 최대 윈도우 크기 K입니다.'
        },
        pitfalls: [
          '좌측 만료 검사(dq[0] <= i - k)를 빼먹으면 지나간 윈도우의 큰 값이 계속 최댓값으로 남습니다.',
          '인덱스 대신 값을 직접 덱에 넣으면 언제 윈도우 밖으로 나가는지 판별할 수 없습니다.'
        ]
      },
      audit: {
        bugSummary: '좌측에서 윈도우를 벗어난 인덱스 만료 제거(dq[0] <= i - k)를 빠뜨려 과거 구간의 큰 값이 잔존합니다.',
        checklist: ['dq[0] <= i - k 만료 popleft() 존재 확인', '우측 while pop으로 단조 감소 유지 점검'],
        focusLine: 8,
        buggyCode: `from collections import deque
def max_sliding_window(nums, k):
    if not nums or k <= 0 or k > len(nums):
        return []
    dq = deque()
    out = []
    for i, val in enumerate(nums):
        while dq and nums[dq[-1]] <= val:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`
      },
      entryPoint: 'max_sliding_window',
      code: `from collections import deque
def max_sliding_window(nums, k):
    if not nums or k <= 0 or k > len(nums):
        return []
    dq = deque()
    out = []
    for i, val in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= val:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      skeleton: `from collections import deque
def max_sliding_window(nums, k):
    if not nums or k <= 0 or k > len(nums):
        return []
    dq = deque()
    out = []
    for i, val in enumerate(nums):
        if dq and dq[0] <= i - ____:
            dq.popleft()
        while dq and nums[dq[-1]] <= ____:
            dq.pop()
        dq.append(i)
        if i >= k - ____:
            out.append(nums[dq[0]])
    return ____`,
      tests: [
        { input: [[9, 3, -1, -3, 5, 3, 6, 7], 3], expected: [9, 3, 5, 5, 6, 7], name: '앞선 큰 값 만료 및 슬라이딩' },
        { input: [[4, 2, 1], 1], expected: [4, 2, 1], name: '윈도우 크기 1' },
        { input: [[1, 2], 5], expected: [], name: 'k > len(nums) 경계' }
      ]
    },
    {
      id: 'py_adv_trie_prefix_count',
      title: '트라이(Trie) 접두사 빈도 카운터 아키텍처',
      tier: 4,
      level: 'advanced',
      track: 'architecture',
      category: '아키텍처 · 라우팅 트라이 인덱스',
      complexity: { time: 'O(W + Q)', space: 'O(W)' },
      description: '문자열 목록 words를 통과 횟수(_cnt)가 기록된 트라이로 인덱싱한 뒤, 질의 접두사 리스트 queries에 대해 각 접두사로 시작하는 문자열 총 개수(중복 단어 포함)를 리스트로 반환하세요.',
      explanation: {
        summary: '트라이의 모든 경유 노드에 _cnt 카운터를 누적해 각 접두사 조회를 길이 비례 O(P)로 응답합니다.',
        keyConcepts: ['노드별 통과 카운터 _cnt 누적', '사전/딕셔너리 기반 자식 참조', '빈 접두사("") 시 루트 전체 건수 반환', '질의당 O(P) 상수 수준 조회'],
        lineByLine: [
          { line: 1, code: 'def count_prefix_matches(words, queries):', explain: '색인할 단어 리스트와 접두사 질의 리스트를 받습니다.' },
          { line: 2, code: '    root = {"_cnt": 0}', explain: '총 단어 수도 함께 기록할 루트 트라이 노드를 생성합니다.' },
          { line: 3, code: '    for w in words:', explain: '각 문자열을 트라이 경로에 삽입합니다.' },
          { line: 4, code: '        node = root', explain: '루트에서 출발합니다.' },
          { line: 5, code: '        node["_cnt"] += 1', explain: '빈 문자열 접두사("") 매칭을 위해 루트 카운트를 올립니다.' },
          { line: 6, code: '        for ch in w:', explain: '문자열의 모든 문자를 순회합니다.' },
          { line: 7, code: '            if ch not in node:', explain: '해당 문자 분기가 아직 없으면,' },
          { line: 8, code: '                node[ch] = {"_cnt": 0}', explain: '새 자식 노드 딕셔너리를 만듭니다.' },
          { line: 9, code: '            node = node[ch]', explain: '자식 노드로 이동합니다.' },
          { line: 10, code: '            node["_cnt"] += 1', explain: '이 접두사를 거쳐간 문자열 횟수를 누적합니다.' },
          { line: 11, code: '    res = []', explain: '각 질의 결과를 모을 리스트입니다.' },
          { line: 12, code: '    for q in queries:', explain: '질의 접두사를 하나씩 조회합니다.' },
          { line: 13, code: '        cur = root', explain: '루트부터 접두사 경로를 따라 내려갑니다.' },
          { line: 14, code: '        for ch in q:', explain: '질의 문자를 순회합니다.' },
          { line: 15, code: '            if ch not in cur:', explain: '경로가 존재하지 않으면,' },
          { line: 16, code: '                cur = None', explain: '매칭 없음을 표시하고 즉시 탈출합니다.' },
          { line: 17, code: '                break', explain: '문자 탐색 루프를 종료합니다.' },
          { line: 18, code: '            cur = cur[ch]', explain: '다음 문자 노드로 이동합니다.' },
          { line: 19, code: '        res.append(0 if cur is None else cur["_cnt"])', explain: '경로가 끊겼으면 0, 있으면 해당 노드의 _cnt를 기록합니다.' },
          { line: 20, code: '    return res', explain: '전체 질의 결과 리스트를 반환합니다.' }
        ],
        complexity: {
          time: 'O(W + Q)',
          timeWhy: '전체 입력 문자 길이 W와 전체 질의 문자 길이 Q에 각각 선형으로 비례합니다.',
          space: 'O(W)',
          spaceWhy: '트라이 노드 딕셔너리가 최대 전체 삽입 문자 수 W만큼 할당됩니다.'
        },
        pitfalls: [
          '노드의 _cnt를 += 1 대신 = 1로 대입하면 여러 단어가 공유하는 접두사 개수가 1로 덮어써집니다.',
          '예약 키 "_cnt"가 일반 단일 문자 키와 충돌하지 않도록 관리해야 합니다.'
        ]
      },
      audit: {
        bugSummary: '새 노드가 아닌 기존 노드를 통과할 때도 _cnt를 += 1 하지 않고 = 1로 덮어써 공유 접두사 카운트가 1로 고정됩니다.',
        checklist: ['경유 노드마다 node["_cnt"] += 1 누적 여부 확인', '존재하지 않는 접두사 0 반환 점검'],
        focusLine: 10,
        buggyCode: `def count_prefix_matches(words, queries):
    root = {"_cnt": 0}
    for w in words:
        node = root
        node["_cnt"] += 1
        for ch in w:
            if ch not in node:
                node[ch] = {"_cnt": 0}
            node = node[ch]
            node["_cnt"] = 1
    res = []
    for q in queries:
        cur = root
        for ch in q:
            if ch not in cur:
                cur = None
                break
            cur = cur[ch]
        res.append(0 if cur is None else cur["_cnt"])
    return res`
      },
      entryPoint: 'count_prefix_matches',
      code: `def count_prefix_matches(words, queries):
    root = {"_cnt": 0}
    for w in words:
        node = root
        node["_cnt"] += 1
        for ch in w:
            if ch not in node:
                node[ch] = {"_cnt": 0}
            node = node[ch]
            node["_cnt"] += 1
    res = []
    for q in queries:
        cur = root
        for ch in q:
            if ch not in cur:
                cur = None
                break
            cur = cur[ch]
        res.append(0 if cur is None else cur["_cnt"])
    return res`,
      skeleton: `def count_prefix_matches(words, queries):
    root = {"_cnt": 0}
    for w in words:
        node = root
        node["_cnt"] += 1
        for ch in w:
            if ch not in node:
                node[ch] = {"_cnt": 0}
            node = node[ch]
            node["_cnt"] ____ 1
    res = []
    for q in queries:
        cur = root
        for ch in q:
            if ch not in cur:
                cur = None
                break
            cur = cur[____]
        res.append(____ if cur is None else cur["_cnt"])
    return res`,
      tests: [
        { input: [['api/v1/users', 'api/v1/orders', 'api/v1/users', 'api/v2/ping'], ['api/v1', 'api/v', 'auth', '']], expected: [3, 4, 0, 4], name: '공유 접두사 · 중복 · 빈 접두사 카운트' },
        { input: [[], ['a', '']], expected: [0, 0], name: '빈 인덱스 방어' }
      ]
    },
    {
      id: 'py_adv_ai_shingle_dedup',
      title: 'k-Shingle 자카드 기반 RAG 문서 중복 제거',
      tier: 4,
      level: 'advanced',
      track: 'ai',
      category: 'AI 엔지니어링 · Shingle 문서 중복 제거',
      complexity: { time: 'O(N^2 * L)', space: 'O(N * L)' },
      adr: {
        scenario: 'RAG 코퍼스에 공백·대소문자만 다르거나 일부 문단만 복제된 문서가 다수 유입되어 Top-k 검색 슬롯을 독점하고 있습니다.',
        prompt: '짧은 고유 문서가 긴 문서에 삼켜져 삭제되지 않으면서도 근접 중복만 정확히 제거하는 방법은?',
        options: [
          { id: 'containment', label: 'A. 교집합 / 대상 문서 Shingle 수(|A&B| / |A|) 포함도로 판정', recommended: false, critique: '짧은 핵심 문구가 긴 매뉴얼 문서에 포함될 때마다 비율 1.0으로 간주되어 독립 문서까지 지워집니다.' },
          { id: 'jaccard', label: 'B. 공백·소문자 정규화 + 대칭 자카드 유사도(|A&B| / |A|B|) >= threshold 필터', recommended: true, critique: '정확합니다! 분모에 합집합(|A|B|)을 사용해 길이가 비슷한 실제 복제·유사 문서만 정밀하게 중복 제거합니다.' }
        ]
      },
      description: '문서 목록 docs, shingle 크기 k, 유사도 임계치 threshold가 주어질 때 순서대로 보존할 문서들의 인덱스 리스트를 반환하세요(유지된 문서 중 어느 하나와라도 자카드 유사도 >= threshold면 중복 제거).',
      explanation: {
        summary: '정규화된 문서마다 k-문자 부분집합을 추출하고 이미 유지된 집합들과의 교집합/합집합 비율로 중복을 걸러냅니다.',
        keyConcepts: ['공백/대소문자 정규화', 'k-Shingle 집합 생성', '대칭 자카드 유사도(|A&B|/|A|B|)', '첫 원본 보존(First-seen keeps)'],
        lineByLine: [
          { line: 1, code: 'def dedup_near_duplicates(docs, k, threshold):', explain: '문서 리스트, shingle 길이 k, 중복 판정 임계치를 받습니다.' },
          { line: 2, code: '    def make_shingles(text):', explain: '정규화된 텍스트를 k-shingle 집합으로 바꾸는 내부 함수입니다.' },
          { line: 3, code: '        norm = " ".join(text.lower().split())', explain: '소문자화와 연속 공백 압축으로 표기 노이즈를 없앱니다.' },
          { line: 4, code: '        if not norm:', explain: '내용이 전혀 없는 빈 문서면,' },
          { line: 5, code: '            return set()', explain: '빈 집합을 반환합니다.' },
          { line: 6, code: '        if len(norm) < k:', explain: '문서 길이가 k보다 짧으면 단일 토큰 전체를 사용합니다.' },
          { line: 7, code: '            return {norm}', explain: '문서 자체 1개를 원소로 갖는 집합을 반환합니다.' },
          { line: 8, code: '        return {norm[i:i + k] for i in range(len(norm) - k + 1)}', explain: '슬라이딩 윈도우로 길이 k 부분 문자열 집합을 만듭니다.' },
          { line: 9, code: '    kept_indices = []', explain: '최종 보존할 문서 인덱스를 담습니다.' },
          { line: 10, code: '    kept_sets = []', explain: '이미 채택된 문서들의 shingle 집합을 보관합니다.' },
          { line: 11, code: '    for idx, doc in enumerate(docs):', explain: '모든 문서를 입력 순서대로 검사합니다.' },
          { line: 12, code: '        sh = make_shingles(doc)', explain: '현재 문서의 shingle 집합을 생성합니다.' },
          { line: 13, code: '        is_dup = False', explain: '중복 여부를 False로 초기화합니다.' },
          { line: 14, code: '        for prev in kept_sets:', explain: '이미 보존한 모든 문서 집합과 비교합니다.' },
          { line: 15, code: '            union_len = len(sh | prev)', explain: '두 문서의 합집합 크기를 계산합니다.' },
          { line: 16, code: '            sim = 1.0 if union_len == 0 else len(sh & prev) / union_len', explain: '둘 다 빈 문서면 1.0, 아니면 대칭 자카드 유사도를 구합니다.' },
          { line: 17, code: '            if sim >= threshold:', explain: '유사도가 기준 이상이면,' },
          { line: 18, code: '                is_dup = True', explain: '근접 중복으로 판정하고 비교를 중단합니다.' },
          { line: 19, code: '                break', explain: '내부 루프를 빠져나갑니다.' },
          { line: 20, code: '        if not is_dup:', explain: '기존 어떤 문서와도 중복되지 않으면,' },
          { line: 21, code: '            kept_indices.append(idx)', explain: '원본 인덱스를 결과에 추가하고,' },
          { line: 22, code: '            kept_sets.append(sh)', explain: '비교 대상 집합 목록에 등록합니다.' },
          { line: 23, code: '    return kept_indices', explain: '중복이 제거된 문서 인덱스 리스트를 반환합니다.' }
        ],
        complexity: {
          time: 'O(N^2 * L)',
          timeWhy: '최악의 경우 N개 문서 쌍마다 평균 길이 L개의 shingle 집합 연산을 수행합니다.',
          space: 'O(N * L)',
          spaceWhy: '보존된 문서들의 shingle 집합을 kept_sets에 저장합니다.'
        },
        pitfalls: [
          '분모에 len(sh | prev) 대신 len(sh)만 쓰면 짧은 문서가 긴 문서에 포함될 때 항상 유사도 1.0으로 잘못 제거됩니다.',
          '합집합 크기가 0(빈 문서 2개)일 때 ZeroDivisionError를 방어해야 합니다.'
        ]
      },
      audit: {
        bugSummary: '자카드 합집합(len(sh | prev)) 대신 한쪽 크기(len(sh))로 나누어 짧은 독립 문서가 긴 문서의 중복으로 오삭제됩니다.',
        checklist: ['대칭 자카드 분모 len(sh | prev) 확인', '빈 문서 union_len == 0 방어 점검'],
        focusLine: 15,
        buggyCode: `def dedup_near_duplicates(docs, k, threshold):
    def make_shingles(text):
        norm = " ".join(text.lower().split())
        if not norm:
            return set()
        if len(norm) < k:
            return {norm}
        return {norm[i:i + k] for i in range(len(norm) - k + 1)}
    kept_indices = []
    kept_sets = []
    for idx, doc in enumerate(docs):
        sh = make_shingles(doc)
        is_dup = False
        for prev in kept_sets:
            sim = 1.0 if (not sh and not prev) else (len(sh & prev) / len(sh) if sh else 0.0)
            if sim >= threshold:
                is_dup = True
                break
        if not is_dup:
            kept_indices.append(idx)
            kept_sets.append(sh)
    return kept_indices`
      },
      entryPoint: 'dedup_near_duplicates',
      code: `def dedup_near_duplicates(docs, k, threshold):
    def make_shingles(text):
        norm = " ".join(text.lower().split())
        if not norm:
            return set()
        if len(norm) < k:
            return {norm}
        return {norm[i:i + k] for i in range(len(norm) - k + 1)}
    kept_indices = []
    kept_sets = []
    for idx, doc in enumerate(docs):
        sh = make_shingles(doc)
        is_dup = False
        for prev in kept_sets:
            union_len = len(sh | prev)
            sim = 1.0 if union_len == 0 else len(sh & prev) / union_len
            if sim >= threshold:
                is_dup = True
                break
        if not is_dup:
            kept_indices.append(idx)
            kept_sets.append(sh)
    return kept_indices`,
      skeleton: `def dedup_near_duplicates(docs, k, threshold):
    def make_shingles(text):
        norm = " ".join(text.lower().split())
        if not norm:
            return set()
        if len(norm) < k:
            return {norm}
        return {norm[i:i + k] for i in range(len(norm) - k + 1)}
    kept_indices = []
    kept_sets = []
    for idx, doc in enumerate(docs):
        sh = make_shingles(doc)
        is_dup = False
        for prev in kept_sets:
            union_len = len(sh | ____)
            sim = 1.0 if union_len == 0 else len(sh & prev) / ____
            if sim >= threshold:
                is_dup = ____
                break
        if not is_dup:
            kept_indices.append(idx)
            kept_sets.append(sh)
    return kept_indices`,
      tests: [
        { input: [['RAG cache vector guide for production latency tuning', '  rag   cache vector guide for production latency tuning  ', 'RAG cache'], 4, 0.8], expected: [0, 2], name: '정규화 중복 제거 + 짧은 문서 오삭제 방지' },
        { input: [['', '   ', 'alpha'], 3, 0.9], expected: [0, 2], name: '빈 문서 중복 안전 처리' }
      ]
    },
    {
      id: 'py_adv_refactor_event_sourcing',
      title: '멱등성 이벤트 소싱 원장 리듀서 리팩토링',
      tier: 4,
      level: 'advanced',
      track: 'refactoring',
      category: '리팩토링 · 이벤트 소싱 리듀서',
      complexity: { time: 'O(N)', space: 'O(N)' },
      refactoringGoal: '중복 재전송 방어와 잠금 상태 불변식이 없는 단순 if-else 루프를 seen_ids 멱등성 세트와 순수 리듀서 규칙으로 리팩토링하세요.',
      refactoringBefore: `def replay_account_ledger(events):
    bal = 0
    for ev in events:
        if ev['type'] == 'DEPOSIT':
            bal += ev['amount']
        elif ev['type'] == 'WITHDRAW':
            bal -= ev['amount']
    return {'balance': bal, 'locked': False, 'applied': len(events)}`,
      description: '이벤트 목록 events({ id, type, amount? })를 재생해 { balance, locked, applied } 상태를 계산하세요. 동일 id 재전송은 무시하며, LOCK 중이나 잔액 초과/비양수 출금·입금은 거절(applied 미포함)합니다.',
      explanation: {
        summary: 'seen_ids로 중복 이벤트를 걸러내고 유효한 상태 전이만 적용해 재실행(Replay) 시 항상 동일한 원장을 보장합니다.',
        keyConcepts: ['이벤트 ID 기반 멱등성(Idempotency)', '불변식 검증(잠금/잔액 부족/음수 방어)', '유효 적용 건수 applied 추적', 'LOCK/UNLOCK 상태 전이'],
        lineByLine: [
          { line: 1, code: 'def replay_account_ledger(events):', explain: '원장 이벤트 시퀀스를 입력받습니다.' },
          { line: 2, code: '    balance = 0', explain: '초기 계좌 잔액은 0입니다.' },
          { line: 3, code: '    locked = False', explain: '계좌 잠금 상태 플래그입니다.' },
          { line: 4, code: '    applied = 0', explain: '실제로 유효하게 반영된 이벤트 수입니다.' },
          { line: 5, code: '    seen = set()', explain: '멱등성 보장을 위해 이미 처리한 이벤트 ID를 기록합니다.' },
          { line: 6, code: '    for ev in events:', explain: '로그에 기록된 모든 이벤트를 순회합니다.' },
          { line: 7, code: '        eid = ev["id"]', explain: '고유 이벤트 ID를 추출합니다.' },
          { line: 8, code: '        if eid in seen:', explain: '네트워크 재시도 등으로 중복 전달된 이벤트라면,' },
          { line: 9, code: '            continue', explain: '상태를 바꾸지 않고 건너뜁니다.' },
          { line: 10, code: '        seen.add(eid)', explain: '이번 이벤트 ID를 처리 목록에 등록합니다.' },
          { line: 11, code: '        etype = ev["type"]', explain: '이벤트 종류를 확인합니다.' },
          { line: 12, code: '        amt = ev.get("amount", 0)', explain: '금액 필드가 없는 LOCK/UNLOCK을 위해 기본값 0을 씁니다.' },
          { line: 13, code: '        if etype == "LOCK":', explain: '계좌 잠금 명령 처리 분기입니다.' },
          { line: 14, code: '            locked = True', explain: '계좌를 잠금 상태로 전환합니다.' },
          { line: 15, code: '            applied += 1', explain: '적용 횟수를 1 증가시킵니다.' },
          { line: 16, code: '        elif etype == "UNLOCK":', explain: '잠금 해제 명령 처리 분기입니다.' },
          { line: 17, code: '            locked = False', explain: '잠금을 해제합니다.' },
          { line: 18, code: '            applied += 1', explain: '적용 횟수를 1 증가시킵니다.' },
          { line: 19, code: '        elif etype == "DEPOSIT" and not locked and amt > 0:', explain: '잠기지 않았고 양수 금액일 때만 입금을 허용합니다.' },
          { line: 20, code: '            balance += amt', explain: '잔액을 증가시킵니다.' },
          { line: 21, code: '            applied += 1', explain: '입금 반영 건수를 증가시킵니다.' },
          { line: 22, code: '        elif etype == "WITHDRAW" and not locked and 0 < amt <= balance:', explain: '잠기지 않았고 잔액 내 양수일 때만 출금을 허용합니다.' },
          { line: 23, code: '            balance -= amt', explain: '잔액을 차감합니다.' },
          { line: 24, code: '            applied += 1', explain: '출금 반영 건수를 증가시킵니다.' },
          { line: 25, code: '    return {"balance": balance, "locked": locked, "applied": applied}', explain: '최종 원장 스냅샷 딕셔너리를 반환합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: 'N개 이벤트를 순회하면서 set 해시 조회 O(1)만 수행합니다.',
          space: 'O(N)',
          spaceWhy: '중복 방지용 seen 집합에 최대 N개의 이벤트 ID를 보관합니다.'
        },
        pitfalls: [
          'seen 집합 검사를 빠뜨리면 재전송된 DEPOSIT 이벤트가 두 번 입금되는 심각한 회계 오류가 발생합니다.',
          'WITHDRAW 시 locked 상태나 잔액 부족(amt > balance) 검증을 누락하면 마이너스 통장이 됩니다.'
        ]
      },
      audit: {
        bugSummary: '이미 처리한 이벤트 ID를 seen 집합으로 거르지 않아 재시도된 입금 이벤트가 중복 반영됩니다.',
        checklist: ['if eid in seen: continue 멱등성 가드 확인', '잠금 및 잔액 불변식 검사 점검'],
        focusLine: 8,
        buggyCode: `def replay_account_ledger(events):
    balance = 0
    locked = False
    applied = 0
    for ev in events:
        etype = ev["type"]
        amt = ev.get("amount", 0)
        if etype == "LOCK":
            locked = True
            applied += 1
        elif etype == "UNLOCK":
            locked = False
            applied += 1
        elif etype == "DEPOSIT" and not locked and amt > 0:
            balance += amt
            applied += 1
        elif etype == "WITHDRAW" and not locked and 0 < amt <= balance:
            balance -= amt
            applied += 1
    return {"balance": balance, "locked": locked, "applied": applied}`
      },
      entryPoint: 'replay_account_ledger',
      code: `def replay_account_ledger(events):
    balance = 0
    locked = False
    applied = 0
    seen = set()
    for ev in events:
        eid = ev["id"]
        if eid in seen:
            continue
        seen.add(eid)
        etype = ev["type"]
        amt = ev.get("amount", 0)
        if etype == "LOCK":
            locked = True
            applied += 1
        elif etype == "UNLOCK":
            locked = False
            applied += 1
        elif etype == "DEPOSIT" and not locked and amt > 0:
            balance += amt
            applied += 1
        elif etype == "WITHDRAW" and not locked and 0 < amt <= balance:
            balance -= amt
            applied += 1
    return {"balance": balance, "locked": locked, "applied": applied}`,
      skeleton: `def replay_account_ledger(events):
    balance = 0
    locked = False
    applied = 0
    seen = set()
    for ev in events:
        eid = ev["id"]
        if eid in ____:
            continue
        seen.add(eid)
        etype = ev["type"]
        amt = ev.get("amount", 0)
        if etype == "LOCK":
            locked = True
            applied += 1
        elif etype == "UNLOCK":
            locked = ____
            applied += 1
        elif etype == "DEPOSIT" and not locked and amt > 0:
            balance += amt
            applied += 1
        elif etype == "WITHDRAW" and not locked and 0 < amt <= ____:
            balance -= amt
            applied += 1
    return {"balance": balance, "locked": locked, "applied": ____}`,
      tests: [
        { input: [[{ id: 'e1', type: 'DEPOSIT', amount: 100 }, { id: 'e1', type: 'DEPOSIT', amount: 100 }, { id: 'e2', type: 'WITHDRAW', amount: 40 }]], expected: { balance: 60, locked: false, applied: 2 }, name: '중복 입금 멱등성 방어' },
        { input: [[{ id: 'e1', type: 'DEPOSIT', amount: 50 }, { id: 'e2', type: 'LOCK' }, { id: 'e3', type: 'WITHDRAW', amount: 10 }, { id: 'e4', type: 'UNLOCK' }, { id: 'e5', type: 'WITHDRAW', amount: 80 }]], expected: { balance: 50, locked: false, applied: 3 }, name: '잠금 및 잔액 초과 출금 거절' }
      ]
    },
    {
      id: 'py_adv_consistent_shard_router',
      title: 'Rendezvous(HRW) 해싱 기반 분산 샤드 라우터',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: '시스템 설계 · Rendezvous 샤드 라우터',
      complexity: { time: 'O(K * S)', space: 'O(K + S)' },
      adr: {
        scenario: '수십 대 규모의 분산 캐시·워커 클러스터에서 별도의 가상 노드 링 상태 동기화 없이 독립 게이트웨이가 동일한 키를 같은 노드로 보내야 합니다.',
        prompt: '별도 링 자료구조 없이 최소 키 재배치(1/S)와 무상태 결정성을 달성하는 라우팅 방식은?',
        options: [
          { id: 'py_hash', label: 'A. Python 내장 hash(key) % len(shards) 사용', recommended: false, critique: 'Python hash()는 프로세스 재시작마다 시드(PYTHONHASHSEED)가 달라져 서버 간 라우팅이 불일치합니다.' },
          { id: 'hrw', label: 'B. hashlib.sha256(shard:key) 기반 Rendezvous(HRW) 최대 가중치 선택', recommended: true, critique: '정확합니다! 암호화 해시로 모든 게이트웨이에서 동일 결과를 보장하며 샤드 증감 시 1/S 키만 이동합니다.' }
        ]
      },
      description: '활성 샤드 목록 shards와 요청 키 목록 keys가 주어질 때 hashlib.sha256(f"{shard}:{key}") 16진수 다이제스트가 최대인 샤드로 각 키를 라우팅한 딕셔너리({ key: shard })를 반환하세요(shards가 비면 {}).',
      explanation: {
        summary: '모든 (샤드, 키) 쌍에 대해 결정적 SHA-256 가중치를 계산하고 최댓값 샤드를 선택해 노드 증감 시 최소 키만 이동시킵니다.',
        keyConcepts: ['Highest Random Weight(HRW) 라우팅', 'hashlib.sha256 무상태 결정성', 'max() 키 함수 비교', '빈 샤드 리스트 방어'],
        lineByLine: [
          { line: 1, code: 'import hashlib', explain: '결정적 암호화 해시를 계산할 표준 모듈을 불러옵니다.' },
          { line: 2, code: 'def assign_shards(shards, keys):', explain: '샤드 이름 리스트와 라우팅할 키 목록을 받습니다.' },
          { line: 3, code: '    if not shards:', explain: '사용 가능한 샤드가 하나도 없으면,' },
          { line: 4, code: '        return {}', explain: '빈 딕셔너리를 즉시 반환합니다.' },
          { line: 5, code: '    def score(shard, key):', explain: '(샤드, 키) 조합의 결정적 가중치를 계산하는 내부 함수입니다.' },
          { line: 6, code: '        raw = f"{shard}:{key}".encode("utf-8")', explain: '구분자 콜론으로 결합해 UTF-8 바이트로 인코딩합니다.' },
          { line: 7, code: '        return hashlib.sha256(raw).hexdigest()', explain: '256비트 고정 길이 16진수 해시를 가중치로 반환합니다.' },
          { line: 8, code: '    out = {}', explain: '키별 배정 샤드를 저장할 딕셔너리입니다.' },
          { line: 9, code: '    for k in keys:', explain: '각 요청 키에 대해 최적 샤드를 찾습니다.' },
          { line: 10, code: '        out[k] = max(shards, key=lambda s: (score(s, k), s))', explain: '가장 큰 해시 점수를 얻은 샤드를(동률 시 샤드명순) 선택합니다.' },
          { line: 11, code: '    return out', explain: '전체 키-샤드 매핑을 반환합니다.' }
        ],
        complexity: {
          time: 'O(K * S)',
          timeWhy: 'K개 키마다 S개 활성 샤드의 SHA-256 가중치를 비교합니다.',
          space: 'O(K + S)',
          spaceWhy: '결과 딕셔너리 외에 별도 해시 링이나 가상 노드 테이블을 저장하지 않습니다.'
        },
        pitfalls: [
          '파이썬 내장 hash(s)는 프로세스 실행마다 랜덤 시드(PYTHONHASHSEED)가 바뀌어 분산 노드 간 라우팅 결과가 일치하지 않으므로 절대 쓰면 안 됩니다.',
          'shards가 빈 리스트일 때 max()를 그대로 호출하면 ValueError가 발생합니다.'
        ]
      },
      audit: {
        bugSummary: '결정적인 SHA-256 대신 프로세스별 해시 시드 영향을 받는 내장 hash() 또는 잘못된 키 추출(key만 해싱)을 사용해 분산 노드 일관성이 깨집니다.',
        checklist: ['hashlib.sha256(f"{shard}:{key}")처럼 양쪽 모두 입력에 포함하는지 확인', '빈 shards 방어 점검'],
        focusLine: 6,
        buggyCode: `import hashlib
def assign_shards(shards, keys):
    if not shards:
        return {}
    def score(shard, key):
        raw = f"{key}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()
    out = {}
    for k in keys:
        out[k] = max(shards, key=lambda s: (score(s, k), s))
    return out`
      },
      entryPoint: 'assign_shards',
      code: `import hashlib
def assign_shards(shards, keys):
    if not shards:
        return {}
    def score(shard, key):
        raw = f"{shard}:{key}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()
    out = {}
    for k in keys:
        out[k] = max(shards, key=lambda s: (score(s, k), s))
    return out`,
      skeleton: `import hashlib
def assign_shards(shards, keys):
    if not shards:
        return {}
    def score(shard, key):
        raw = f"{____}:{key}".encode("utf-8")
        return hashlib.sha256(raw).hexdigest()
    out = {}
    for k in keys:
        out[k] = ____(shards, key=lambda s: (score(s, k), s))
    return ____`,
      tests: [
        { input: [['shard-a', 'shard-b', 'shard-c'], ['tenant:1', 'tenant:2', 'order:42']], expected: { 'tenant:1': 'shard-c', 'tenant:2': 'shard-c', 'order:42': 'shard-a' }, name: 'HRW 결정적 분산 샤드 배정' },
        { input: [[], ['k1']], expected: {}, name: '활성 샤드 없음 방어' }
      ]
    }
  );

  curr.c.push(
    {
      id: 'c_adv_ema_fixed_filter',
      title: 'Q8 고정소수점 지수이동평균(EMA) 센서 필터',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: '임베디드 · Q8 고정소수점 EMA 필터',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: 'FPU가 없는 MCU 환경에서 부호 있는 32비트 Q8 고정소수점(스케일 256)으로 지수이동평균 EMA를 계산하고 반올림한 최종 정수값을 반환하세요(n <= 0이면 0).',
      explanation: {
        summary: '첫 샘플을 Q8로 시드(samples[0] << 8)한 뒤 (256 - alpha_q8)과 alpha_q8 가중합을 매 샘플 시프트하여 부동소수점 없이 스무딩합니다.',
        keyConcepts: ['Q8 고정소수점(<< 8)', '초기값 시딩(samples[0] << 8)', '반올림 쉬프트((ema + 128) >> 8)', 'alpha_q8 범위 [0..256] 가중합'],
        lineByLine: [
          { line: 1, code: 'int ema_filter_q8(int samples[], int n, int alpha_q8) {', explain: '샘플 배열, 길이 n, Q8 스무딩 계수(0~256)를 받습니다.' },
          { line: 2, code: '    if (n <= 0) return 0;', explain: '유효한 샘플이 없으면 0을 반환합니다.' },
          { line: 3, code: '    int ema = samples[0] << 8;', explain: '초기 EMA 상태를 첫 번째 샘플의 Q8 값으로 설정합니다.' },
          { line: 4, code: '    int beta = 256 - alpha_q8;', explain: '이전 상태 보존 비율(1 - alpha)을 Q8로 계산합니다.' },
          { line: 5, code: '    for (int i = 1; i < n; i++) {', explain: '두 번째 샘플부터 순차적으로 필터를 갱신합니다.' },
          { line: 6, code: '        int scaled = samples[i] << 8;', explain: '현재 원시 샘플을 Q8 스케일로 승격합니다.' },
          { line: 7, code: '        ema = (beta * ema + alpha_q8 * scaled) >> 8;', explain: 'Q8*Q8 곱을 8비트 내려 Q8 상태 정밀도를 유지합니다.' },
          { line: 8, code: '    }', explain: '필터 갱신 루프를 닫습니다.' },
          { line: 9, code: '    return (ema + 128) >> 8;', explain: '0.5(128)를 더해 반올림한 뒤 정수 스케일로 복원합니다.' },
          { line: 10, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: 'N개 센서 샘플을 단일 루프로 스캔하며 정수 곱셈·시프트만 수행합니다.',
          space: 'O(1)',
          spaceWhy: '누적 상태 변수 ema와 beta만 사용해 정적 메모리로 동작합니다.'
        },
        pitfalls: [
          'samples[i]를 << 8 하지 않고 곱하면 단위가 맞지 않아 값이 0 근처로 급격히 붕괴합니다.',
          '복원 시 128을 더하지 않으면 항상 내림(Truncation) 오차가 누적됩니다.'
        ]
      },
      audit: {
        bugSummary: '루프 내부에서 현재 샘플을 Q8(<< 8)로 스케일링하지 않아 누적 단위 불일치로 출력이 0으로 수렴합니다.',
        checklist: ['samples[i] << 8 스케일 일치 확인', '반올림 상수 128 반영 점검'],
        focusLine: 6,
        buggyCode: `int ema_filter_q8(int samples[], int n, int alpha_q8) {
    if (n <= 0) return 0;
    int ema = samples[0] << 8;
    int beta = 256 - alpha_q8;
    for (int i = 1; i < n; i++) {
        int scaled = samples[i];
        ema = (beta * ema + alpha_q8 * scaled) >> 8;
    }
    return (ema + 128) >> 8;
}`
      },
      entryPoint: 'ema_filter_q8',
      code: `int ema_filter_q8(int samples[], int n, int alpha_q8) {
    if (n <= 0) return 0;
    int ema = samples[0] << 8;
    int beta = 256 - alpha_q8;
    for (int i = 1; i < n; i++) {
        int scaled = samples[i] << 8;
        ema = (beta * ema + alpha_q8 * scaled) >> 8;
    }
    return (ema + 128) >> 8;
}`,
      skeleton: `int ema_filter_q8(int samples[], int n, int alpha_q8) {
    if (n <= 0) return 0;
    int ema = samples[0] << ____;
    int beta = 256 - alpha_q8;
    for (int i = 1; i < n; i++) {
        int scaled = samples[i] << ____;
        ema = (beta * ema + alpha_q8 * scaled) >> 8;
    }
    return (ema + ____) >> 8;
}`,
      tests: [
        { input: [[100, 100, 100], 3, 64], expected: 100, name: '안정 입력 불변성(100 유지)' },
        { input: [[0, 100], 2, 64], expected: 25, name: '25% 스텝 응답 계산' },
        { input: [[], 0, 64], expected: 0, name: '빈 샘플 배열 방어' }
      ]
    },
    {
      id: 'c_adv_varint_encode_len',
      title: 'ZigZag + LEB128 Varint 직렬화 바이트 계산기',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: '시스템 설계 · LEB128 Varint 바이트 계산',
      complexity: { time: 'O(N log M)', space: 'O(1)' },
      adr: {
        scenario: '임베디드 텔레메트리 직렬화에서 매 측정값을 고정 32비트로 보내면 작은 양수·음수(-1 등)마다 상위 0/1 비트로 대역폭을 크게 낭비합니다.',
        prompt: '고정 크기 버퍼에 맞춰 정확한 바이트 길이를 사전 산출하면서 작은 음수까지 1~2바이트로 압축하는 방법은?',
        options: [
          { id: 'raw_u32', label: 'A. 음수를 2의 보수 그대로 LEB128 인코딩', recommended: false, critique: '-1의 상위 비트가 모두 1이므로 작은 음수마저 항상 최대 5~10바이트를 차지합니다.' },
          { id: 'zigzag_leb', label: 'B. ZigZag 양수 접기 후 do-while 7비트 LEB128 길이 누적', recommended: true, critique: '정확합니다! 0, -1, -64 모두 1바이트로 압축되고 do-while이 0 값의 1바이트 보장까지 지킵니다.' }
        ]
      },
      description: '부호 있는 정수 배열 vals[] (길이 n)의 각 원소에 ZigZag 매핑(0->0, -1->1, 1->2)을 적용한 뒤 LEB128 7비트 Varint로 인코딩할 때 필요한 총 바이트 수를 반환하세요.',
      explanation: {
        summary: '음수를 양수 짝수/홀수로 매핑한 뒤 do-while 7비트 시프트로 0을 포함한 모든 값의 최소 1바이트 인코딩 길이를 합산합니다.',
        keyConcepts: ['ZigZag 매핑(음수/양수 교차 배치)', 'do-while 기반 0 값 1바이트 보장', '>> 7 단위 LEB128 분할', '다중 필드 직렬화 총합'],
        lineByLine: [
          { line: 1, code: 'int varint_byte_len(int vals[], int n) {', explain: '직렬화할 정수 배열과 원소 수 n을 받습니다.' },
          { line: 2, code: '    int total = 0;', explain: '전체 인코딩 바이트 합계를 0으로 초기화합니다.' },
          { line: 3, code: '    for (int i = 0; i < n; i++) {', explain: '각 정수를 순회합니다.' },
          { line: 4, code: '        int v = vals[i];', explain: '현재 값을 꺼냅니다.' },
          { line: 5, code: '        int zz = v < 0 ? (-v * 2 - 1) : (v * 2);', explain: '음수를 양수 홀수로, 0 이상을 짝수로 ZigZag 변환합니다.' },
          { line: 6, code: '        do {', explain: '값이 0이어도 최소 1바이트는 기록되므로 do-while을 씁니다.' },
          { line: 7, code: '            total++;', explain: '7비트 청크 하나당 1바이트를 추가합니다.' },
          { line: 8, code: '            zz = zz >> 7;', explain: '이미 처리한 하위 7비트를 버립니다.' },
          { line: 9, code: '        } while (zz > 0);', explain: '남은 비트가 있으면 0x80 연속 비트가 필요하므로 반복합니다.' },
          { line: 10, code: '    }', explain: '배열 순회 루프를 닫습니다.' },
          { line: 11, code: '    return total;', explain: '총 Varint 바이트 크기를 반환합니다.' },
          { line: 12, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(N log M)',
          timeWhy: 'N개 원소마다 최댓값 M의 비트 수에 비례(최대 5회)해 7비트 시프트를 반복합니다.',
          space: 'O(1)',
          spaceWhy: '상수 개의 지역 정수 변수만 사용합니다.'
        },
        pitfalls: [
          'do-while 대신 while (zz > 0)를 쓰면 0이 0바이트로 계산되어 직렬화 버퍼가 부족해집니다.',
          'ZigZag 없이 음수를 2의 보수 그대로 인코딩하면 -1 같은 작은 음수도 항상 5~10바이트를 차지합니다.'
        ]
      },
      audit: {
        bugSummary: 'do-while 대신 while (zz > 0)를 사용해 입력값 0의 인코딩 길이를 1바이트가 아닌 0바이트로 누락합니다.',
        checklist: ['값이 0일 때도 1바이트로 계산되는 do-while 구조 확인', '음수 ZigZag 매핑 점검'],
        focusLine: 6,
        buggyCode: `int varint_byte_len(int vals[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        int v = vals[i];
        int zz = v < 0 ? (-v * 2 - 1) : (v * 2);
        while (zz > 0) {
            total++;
            zz = zz >> 7;
        }
    }
    return total;
}`
      },
      entryPoint: 'varint_byte_len',
      code: `int varint_byte_len(int vals[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        int v = vals[i];
        int zz = v < 0 ? (-v * 2 - 1) : (v * 2);
        do {
            total++;
            zz = zz >> 7;
        } while (zz > 0);
    }
    return total;
}`,
      skeleton: `int varint_byte_len(int vals[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        int v = vals[i];
        int zz = v < 0 ? (-v * 2 - 1) : (v * 2);
        ____ {
            total++;
            zz = zz >> ____;
        } while (zz > 0);
    }
    return ____;
}`,
      tests: [
        { input: [[0, -1, -64], 3], expected: 3, name: '작은 정수 및 0 (각 1바이트)' },
        { input: [[64, -65, 8192], 3], expected: 7, name: '멀티바이트 경계 (2+2+3=7바이트)' },
        { input: [[], 0], expected: 0, name: '빈 스트림' }
      ]
    },
    {
      id: 'c_adv_debounce_gpio',
      title: '연속 안정화 기반 GPIO 스위치 디바운스 FSM',
      tier: 4,
      level: 'advanced',
      track: 'architecture',
      category: '임베디드 · GPIO 디바운스 FSM',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '초기 상태 stable = 0에서 시작하는 GPIO 핀 샘플 배열 samples[](길이 n)에 대해, 현재 상태와 다른 값이 threshold회 연속 측정될 때만 상태 전이(edge)로 확정할 때 총 확정 에지 수를 반환하세요.',
      explanation: {
        summary: '연속 일치 카운터(streak)가 목표치에 도달하기 전 원시 신호가 복귀하면 streak를 0으로 리셋해 채터링을 제거합니다.',
        keyConcepts: ['디바운스 연속 카운터 FSM', '원상태 복귀 시 streak 리셋', '초기 threshold <= 0 방어', '단일 패스 O(1) 메모리'],
        lineByLine: [
          { line: 1, code: 'int debounce_gpio(int samples[], int n, int threshold) {', explain: '핀 샘플 배열, 샘플 수, 안정 판정 연속 횟수를 받습니다.' },
          { line: 2, code: '    if (threshold <= 0) return 0;', explain: '비정상 임계값일 때 0을 반환해 방어합니다.' },
          { line: 3, code: '    int stable = 0;', explain: '초기 확정 핀 상태는 LOW(0)입니다.' },
          { line: 4, code: '    int streak = 0;', explain: '상태 반전이 연속 유지된 틱 수를 기록합니다.' },
          { line: 5, code: '    int edges = 0;', explain: '최종 확정된 상승/하강 에지 횟수입니다.' },
          { line: 6, code: '    for (int i = 0; i < n; i++) {', explain: '매 샘플 틱을 순차 처리합니다.' },
          { line: 7, code: '        int raw = samples[i] != 0 ? 1 : 0;', explain: '0 이외의 값을 논리 HIGH(1)로 정규화합니다.' },
          { line: 8, code: '        if (raw != stable) {', explain: '현재 확정 상태와 반대 신호가 들어오면,' },
          { line: 9, code: '            streak++;', explain: '연속 유지 카운터를 1 올립니다.' },
          { line: 10, code: '            if (streak >= threshold) {', explain: '연속 횟수가 threshold에 도달하면 노이즈가 아니므로,' },
          { line: 11, code: '                stable = raw;', explain: '확정 상태를 새 논리 레벨로 전환합니다.' },
          { line: 12, code: '                streak = 0;', explain: '다음 전이를 위해 카운터를 0으로 비웁니다.' },
          { line: 13, code: '                edges++;', explain: '유효 상태 에지 발생 횟수를 기록합니다.' },
          { line: 14, code: '            }', explain: '임계치 도달 분기를 닫습니다.' },
          { line: 15, code: '        } else {', explain: '다시 기존 확정 상태와 같아졌다면 채터링이므로,' },
          { line: 16, code: '            streak = 0;', explain: '누적 카운터를 반드시 0으로 리셋합니다.' },
          { line: 17, code: '        }', explain: '신호 비교 분기를 닫습니다.' },
          { line: 18, code: '    }', explain: '샘플 루프를 닫습니다.' },
          { line: 19, code: '    return edges;', explain: '총 확정 에지 수를 반환합니다.' },
          { line: 20, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: 'N개의 샘플 틱을 한 번만 순회하며 상태 전이 여부를 판정합니다.',
          space: 'O(1)',
          spaceWhy: '고정된 4개의 정수 상태 변수만으로 동작합니다.'
        },
        pitfalls: [
          'else { streak = 0; } 리셋을 생략하면 산발적인 노이즈 펄스가 누적되어 스위치를 누르지 않아도 상태가 바뀝니다.',
          '전이 직후 streak = 0 초기화를 빼먹으면 이후 전이 조건이 어긋납니다.'
        ]
      },
      audit: {
        bugSummary: '신호가 기존 확정 상태로 되돌아왔을 때 else { streak = 0; } 리셋을 생략해 간헐적 채터링이 누적되어 오작동합니다.',
        checklist: ['else 분기에서 streak = 0 초기화 수행 여부 확인', 'threshold <= 0 경계 처리 점검'],
        focusLine: 15,
        buggyCode: `int debounce_gpio(int samples[], int n, int threshold) {
    if (threshold <= 0) return 0;
    int stable = 0;
    int streak = 0;
    int edges = 0;
    for (int i = 0; i < n; i++) {
        int raw = samples[i] != 0 ? 1 : 0;
        if (raw != stable) {
            streak++;
            if (streak >= threshold) {
                stable = raw;
                streak = 0;
                edges++;
            }
        }
    }
    return edges;
}`
      },
      entryPoint: 'debounce_gpio',
      code: `int debounce_gpio(int samples[], int n, int threshold) {
    if (threshold <= 0) return 0;
    int stable = 0;
    int streak = 0;
    int edges = 0;
    for (int i = 0; i < n; i++) {
        int raw = samples[i] != 0 ? 1 : 0;
        if (raw != stable) {
            streak++;
            if (streak >= threshold) {
                stable = raw;
                streak = 0;
                edges++;
            }
        } else {
            streak = 0;
        }
    }
    return edges;
}`,
      skeleton: `int debounce_gpio(int samples[], int n, int threshold) {
    if (threshold <= 0) return 0;
    int stable = 0;
    int streak = 0;
    int edges = 0;
    for (int i = 0; i < n; i++) {
        int raw = samples[i] != 0 ? 1 : 0;
        if (raw != stable) {
            streak++;
            if (streak >= threshold) {
                stable = ____;
                streak = 0;
                edges++;
            }
        } else {
            ____ = 0;
        }
    }
    return ____;
}`,
      tests: [
        { input: [[1, 0, 1, 0, 1, 1, 1], 7, 3], expected: 1, name: '간헐 노이즈 무시 후 3연속 HIGH 확정' },
        { input: [[1, 1, 1, 0, 0, 0], 6, 3], expected: 2, name: '상승 + 하강 에지 2회' },
        { input: [[1, 1, 0, 1, 1], 5, 3], expected: 0, name: '미달성 바운스 0회' }
      ]
    },
    {
      id: 'c_adv_ai_maxpool1d_relu',
      title: '임베디드 AI 퓨즈드 ReLU + MaxPool1D 커널',
      tier: 4,
      level: 'advanced',
      track: 'ai',
      category: '온디바이스 AI · ReLU + MaxPool1D 커널',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '별도 중간 활성화 버퍼를 두지 않는 온디바이스 엣지 추론을 위해, 배열 arr[](길이 n)에 크기 k 윈도우(stride = k, 완전 윈도우만 처리)마다 ReLU(max(0, x))와 1D Max Pooling을 결합 적용한 풀링 출력 총합을 반환하세요.',
      explanation: {
        summary: '윈도우 최댓값 시드를 0으로 시작(ReLU 하한 내장)하면 별도 배열 쓰기 없이 1패스로 ReLU+MaxPool을 퓨징할 수 있습니다.',
        keyConcepts: ['커널 퓨전(Kernel Fusion)', 'ReLU 하한선(best = 0) 활용', '유효 완전 윈도우 경계(i + k <= n)', 'k <= 0 || n < k 방어'],
        lineByLine: [
          { line: 1, code: 'int relu_maxpool_sum(int arr[], int n, int k) {', explain: '특징 맵 배열, 길이 n, 풀링 커널 크기 k를 받습니다.' },
          { line: 2, code: '    if (k <= 0 || n < k) return 0;', explain: '완전한 풀링 윈도우를 하나도 만들 수 없으면 0을 반환합니다.' },
          { line: 3, code: '    int total = 0;', explain: '풀링된 출력 원소들의 누적 합계입니다.' },
          { line: 4, code: '    for (int i = 0; i + k <= n; i += k) {', explain: '겹치지 않도록 stride = k로 완전 윈도우만 순회합니다.' },
          { line: 5, code: '        int best = 0;', explain: 'ReLU 하한이 0이므로 윈도우 초기 최댓값을 0으로 둡니다.' },
          { line: 6, code: '        for (int j = 0; j < k; j++) {', explain: '커널 크기 k 내부 원소를 스캔합니다.' },
          { line: 7, code: '            int v = arr[i + j];', explain: '현재 활성화 값을 읽습니다.' },
          { line: 8, code: '            if (v > best) best = v;', explain: '0 이상인 더 큰 값이 있을 때만 최댓값을 갱신합니다.' },
          { line: 9, code: '        }', explain: '커널 내부 탐색 루프를 닫습니다.' },
          { line: 10, code: '        total += best;', explain: '풀링 결과를 출력 합계에 누적합니다.' },
          { line: 11, code: '    }', explain: '외부 스트라이드 루프를 닫습니다.' },
          { line: 12, code: '    return total;', explain: '전체 풀링 출력의 총합을 반환합니다.' },
          { line: 13, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: '스트라이드 k로 크기 k 윈도우를 순회하므로 모든 원소를 최대 1번만 읽습니다.',
          space: 'O(1)',
          spaceWhy: '중간 ReLU 배열을 동적 할당하지 않고 누적 변수만 사용합니다.'
        },
        pitfalls: [
          'best를 arr[i]로 초기화하고 음수 클램핑을 잊으면 전부 음수인 윈도우에서 ReLU 규칙(0)을 위반하고 음수가 합산됩니다.',
          '조건을 i < n으로 두면 남은 원소 수가 k보다 작을 때 배열 경계를 넘어 읽습니다.'
        ]
      },
      audit: {
        bugSummary: '윈도우 초기 최댓값을 0 대신 arr[i]로 초기화해 모든 원소가 음수인 윈도우에서 ReLU(0 클램핑)가 적용되지 않습니다.',
        checklist: ['전부 음수인 윈도우 결과가 0으로 고정되는지 확인', 'i + k <= n 경계 검사 점검'],
        focusLine: 5,
        buggyCode: `int relu_maxpool_sum(int arr[], int n, int k) {
    if (k <= 0 || n < k) return 0;
    int total = 0;
    for (int i = 0; i + k <= n; i += k) {
        int best = arr[i];
        for (int j = 1; j < k; j++) {
            int v = arr[i + j];
            if (v > best) best = v;
        }
        total += best;
    }
    return total;
}`
      },
      entryPoint: 'relu_maxpool_sum',
      code: `int relu_maxpool_sum(int arr[], int n, int k) {
    if (k <= 0 || n < k) return 0;
    int total = 0;
    for (int i = 0; i + k <= n; i += k) {
        int best = 0;
        for (int j = 0; j < k; j++) {
            int v = arr[i + j];
            if (v > best) best = v;
        }
        total += best;
    }
    return total;
}`,
      skeleton: `int relu_maxpool_sum(int arr[], int n, int k) {
    if (k <= 0 || n < k) return 0;
    int total = 0;
    for (int i = 0; i + k <= n; i += ____) {
        int best = ____;
        for (int j = 0; j < k; j++) {
            int v = arr[i + j];
            if (v > best) best = ____;
        }
        total += best;
    }
    return total;
}`,
      tests: [
        { input: [[-5, -2, 3, 7, -1, 4], 6, 2], expected: 11, name: '음수 ReLU 클램핑 + MaxPool(k=2)' },
        { input: [[-3, -1, 5, 2, 9], 5, 3], expected: 5, name: '음수 포함 k=3 + 꼬리 불완전 윈도우 무시' },
        { input: [[1, 2], 2, 4], expected: 0, name: 'n < k 경계 방어' }
      ]
    },
    {
      id: 'c_adv_merge_sorted_kth',
      title: '무할당 투포인터 정렬 배열 k번째 원소 탐색',
      tier: 4,
      level: 'advanced',
      track: 'algorithm',
      category: '분할 투포인터 · 정렬 배열 k번째 원소',
      complexity: { time: 'O(K)', space: 'O(1)' },
      description: '오름차순 정렬된 두 정수 배열 a[](길이 na)와 b[](길이 nb)를 병합 배열 동적 할당 없이 O(1) 공간으로 순회해 전체 1-based k번째 작은 원소를 반환하세요(범위 밖이면 -1).',
      explanation: {
        summary: '두 배열 인덱스를 전진시키며 한쪽 배열이 먼저 소진된 경우(i >= na 또는 j >= nb)를 안전하게 분기합니다.',
        keyConcepts: ['무할당 투포인터 병합', '한쪽 소진 경계 체크(j >= nb)', '1-based k 유효 범위 검증', 'O(1) 공간 탐색'],
        lineByLine: [
          { line: 1, code: 'int kth_merged(int a[], int na, int b[], int nb, int k) {', explain: '두 정렬 배열과 크기, 찾을 순위 k(1부터)를 받습니다.' },
          { line: 2, code: '    if (k <= 0 || k > na + nb) return -1;', explain: 'k가 유효 범위를 벗어나면 -1을 반환합니다.' },
          { line: 3, code: '    int i = 0;', explain: '배열 a의 현재 읽기 인덱스입니다.' },
          { line: 4, code: '    int j = 0;', explain: '배열 b의 현재 읽기 인덱스입니다.' },
          { line: 5, code: '    int picked = 0;', explain: '매 단계에서 선택된 최솟값을 저장합니다.' },
          { line: 6, code: '    for (int step = 0; step < k; step++) {', explain: 'k번째 원소에 도달할 때까지 k회 선택을 반복합니다.' },
          { line: 7, code: '        if (i < na && (j >= nb || a[i] <= b[j])) {', explain: 'a가 남았고 b가 끝났거나 a[i]가 더 작거나 같으면,' },
          { line: 8, code: '            picked = a[i];', explain: '배열 a의 원소를 선택합니다.' },
          { line: 9, code: '            i++;', explain: 'a 포인터를 전진합니다.' },
          { line: 10, code: '        } else {', explain: '그렇지 않으면 b의 남은 원소를 꺼냅니다.' },
          { line: 11, code: '            picked = b[j];', explain: '배열 b의 원소를 선택합니다.' },
          { line: 12, code: '            j++;', explain: 'b 포인터를 전진합니다.' },
          { line: 13, code: '        }', explain: '두 배열 비교 분기를 닫습니다.' },
          { line: 14, code: '    }', explain: '선택 루프를 닫습니다.' },
          { line: 15, code: '    return picked;', explain: 'k번째로 선택된 원소를 반환합니다.' },
          { line: 16, code: '}', explain: '함수 본문을 종료합니다.' }
        ],
        complexity: {
          time: 'O(K)',
          timeWhy: '최대 k번만 투포인터를 비교·전진하고 즉시 종료합니다.',
          space: 'O(1)',
          spaceWhy: '병합용 임시 배열을 생성하지 않고 포인터 3개만 유지합니다.'
        },
        pitfalls: [
          'j >= nb 단락 평가(short-circuit) 조건을 빼먹으면 b가 먼저 끝난 뒤 쓰레기 값/배열 범위 밖 b[j]에 접근합니다.',
          'k가 0 이하이거나 na + nb보다 큰 경계 조건을 놓치면 잘못된 값이 반환됩니다.'
        ]
      },
      audit: {
        bugSummary: 'b가 먼저 끝났을 때 j >= nb 검사를 빠뜨려 b[nb] 범위 밖과 비교 후 else로 진입합니다.',
        checklist: ['i < na && (j >= nb || a[i] <= b[j]) 단락 평가 확인', '범위 밖 k 시 -1 반환 점검'],
        focusLine: 7,
        buggyCode: `int kth_merged(int a[], int na, int b[], int nb, int k) {
    if (k <= 0 || k > na + nb) return -1;
    int i = 0;
    int j = 0;
    int picked = 0;
    for (int step = 0; step < k; step++) {
        if (i < na && a[i] <= b[j]) {
            picked = a[i];
            i++;
        } else {
            picked = b[j];
            j++;
        }
    }
    return picked;
}`
      },
      entryPoint: 'kth_merged',
      code: `int kth_merged(int a[], int na, int b[], int nb, int k) {
    if (k <= 0 || k > na + nb) return -1;
    int i = 0;
    int j = 0;
    int picked = 0;
    for (int step = 0; step < k; step++) {
        if (i < na && (j >= nb || a[i] <= b[j])) {
            picked = a[i];
            i++;
        } else {
            picked = b[j];
            j++;
        }
    }
    return picked;
}`,
      skeleton: `int kth_merged(int a[], int na, int b[], int nb, int k) {
    if (k <= 0 || k > na + nb) return -1;
    int i = 0;
    int j = 0;
    int picked = 0;
    for (int step = 0; step < k; step++) {
        if (i < na && (____ || a[i] <= b[j])) {
            picked = a[i];
            i++;
        } else {
            picked = b[j];
            ____++;
        }
    }
    return ____;
}`,
      tests: [
        { input: [[10, 20, 30], 3, [1, 2], 2, 5], expected: 30, name: '작은 배열 b 조기 소진 후 k=5' },
        { input: [[1, 5, 9], 3, [2, 6, 8], 3, 4], expected: 6, name: '교차 병합 중간 순위' },
        { input: [[1], 1, [2], 1, 3], expected: -1, name: 'k 범위 초과 방어' }
      ]
    },
    {
      id: 'c_adv_refactor_crc8_table',
      title: 'CRC-8(다항식 0x07) 체크섬 헬퍼 분리 리팩토링',
      tier: 4,
      level: 'advanced',
      track: 'refactoring',
      category: '리팩토링 · CRC-8 헬퍼 분리',
      complexity: { time: 'O(N)', space: 'O(1)' },
      refactoringGoal: '복잡한 인라인 비트 시프트 루프를 순수 헬퍼 crc8_step()으로 추출하고, 8비트 오버플로를 막기 위해 모든 연산 결과를 & 0xFF로 마스킹하세요.',
      refactoringBefore: `int calc_crc8(int data[], int n) {
    int crc = 0;
    for (int i = 0; i < n; i++) {
        crc = crc ^ data[i];
        for (int b = 0; b < 8; b++) {
            if ((crc & 0x80) != 0) crc = (crc << 1) ^ 0x07;
            else crc = crc << 1;
        }
    }
    return crc;
}`,
      description: '생성 다항식 0x07(MSB-first, 초기값 0x00) 기반 CRC-8 1바이트 전이 함수 crc8_step과 바이트 배열 전체 체크섬 calc_crc8을 작성해 정확한 8비트 체크섬(0~255)을 반환하세요.',
      explanation: {
        summary: '바이트 단위 XOR 및 8비트 시프트 다항식 나눗셈을 crc8_step으로 모듈화하고 매 단계 0xFF 마스크로 상위 비트 누수를 막습니다.',
        keyConcepts: ['모듈화된 순수 함수 crc8_step', '다항식 0x07 MSB-first XOR', '매 시프트 & 0xFF 8비트 마스킹', '메시지+CRC 연접 시 0 검증'],
        lineByLine: [
          { line: 1, code: 'int crc8_step(int crc, int byte_val) {', explain: '현재 CRC 상태와 입력 1바이트를 받는 헬퍼 함수입니다.' },
          { line: 2, code: '    crc = (crc ^ byte_val) & 0xFF;', explain: '새 바이트를 XOR 결합하고 하위 8비트로 마스킹합니다.' },
          { line: 3, code: '    for (int bit = 0; bit < 8; bit++) {', explain: '8개 비트를 최상위부터 한 비트씩 나눕니다.' },
          { line: 4, code: '        if ((crc & 0x80) != 0) {', explain: '최상위 비트(MSB)가 1이면,' },
          { line: 5, code: '            crc = ((crc << 1) ^ 0x07) & 0xFF;', explain: '좌시프트 후 다항식 0x07을 XOR하고 8비트로 자릅니다.' },
          { line: 6, code: '        } else {', explain: 'MSB가 0이면 다항식 XOR 없이,' },
          { line: 7, code: '            crc = (crc << 1) & 0xFF;', explain: '좌시프트 후 8비트 마스크만 유지합니다.' },
          { line: 8, code: '        }', explain: 'MSB 분기문을 닫습니다.' },
          { line: 9, code: '    }', explain: '8비트 순회 루프를 닫습니다.' },
          { line: 10, code: '    return crc;', explain: '갱신된 1바이트 CRC 값을 반환합니다.' },
          { line: 11, code: '}', explain: 'crc8_step 함수를 종료합니다.' },
          { line: 12, code: 'int calc_crc8(int data[], int n) {', explain: '바이트 배열 전체 체크섬 진입점입니다.' },
          { line: 13, code: '    int crc = 0;', explain: 'CRC 누산기를 초기값 0x00으로 시작합니다.' },
          { line: 14, code: '    for (int i = 0; i < n; i++) {', explain: '배열의 각 바이트를 순서대로 투입합니다.' },
          { line: 15, code: '        crc = crc8_step(crc, data[i]);', explain: '헬퍼 함수를 호출해 상태를 갱신합니다.' },
          { line: 16, code: '    }', explain: '배열 루프를 닫습니다.' },
          { line: 17, code: '    return crc;', explain: '최종 8비트 CRC-8 체크섬을 반환합니다.' },
          { line: 18, code: '}', explain: 'calc_crc8 함수를 종료합니다.' }
        ],
        complexity: {
          time: 'O(N)',
          timeWhy: '바이트 N개마다 상수 8비트 시프트를 수행하므로 입력 바이트 수 N에 선형 비례합니다.',
          space: 'O(1)',
          spaceWhy: '상수 크기의 정수 지역 변수만 사용합니다.'
        },
        pitfalls: [
          '시프트 후 & 0xFF 마스크를 빠뜨리면 32비트 int 상위 비트에 쓰레기가 쌓여 255를 초과하는 오답이 나옵니다.',
          'uint8_t가 아닌 int 파라미터에서는 입력 바이트에도 & 0xFF를 적용해야 안전합니다.'
        ]
      },
      audit: {
        bugSummary: '좌시프트 연산 후 & 0xFF 8비트 마스킹을 생략해 9번째 비트 이상으로 값이 번지며 체크섬이 255를 초과합니다.',
        checklist: ['모든 << 1 연산 뒤에 & 0xFF 마스킹 적용 확인', '0x07 다항식 XOR 위치 점검'],
        focusLine: 5,
        buggyCode: `int crc8_step(int crc, int byte_val) {
    crc = crc ^ byte_val;
    for (int bit = 0; bit < 8; bit++) {
        if ((crc & 0x80) != 0) {
            crc = (crc << 1) ^ 0x07;
        } else {
            crc = crc << 1;
        }
    }
    return crc;
}
int calc_crc8(int data[], int n) {
    int crc = 0;
    for (int i = 0; i < n; i++) {
        crc = crc8_step(crc, data[i]);
    }
    return crc;
}`
      },
      entryPoint: 'calc_crc8',
      code: `int crc8_step(int crc, int byte_val) {
    crc = (crc ^ byte_val) & 0xFF;
    for (int bit = 0; bit < 8; bit++) {
        if ((crc & 0x80) != 0) {
            crc = ((crc << 1) ^ 0x07) & 0xFF;
        } else {
            crc = (crc << 1) & 0xFF;
        }
    }
    return crc;
}
int calc_crc8(int data[], int n) {
    int crc = 0;
    for (int i = 0; i < n; i++) {
        crc = crc8_step(crc, data[i]);
    }
    return crc;
}`,
      skeleton: `int crc8_step(int crc, int byte_val) {
    crc = (crc ^ byte_val) & 0xFF;
    for (int bit = 0; bit < 8; bit++) {
        if ((crc & ____) != 0) {
            crc = ((crc << 1) ^ ____) & 0xFF;
        } else {
            crc = (crc << 1) & 0xFF;
        }
    }
    return crc;
}
int calc_crc8(int data[], int n) {
    int crc = 0;
    for (int i = 0; i < n; i++) {
        crc = ____(crc, data[i]);
    }
    return crc;
}`,
      tests: [
        { input: [[1], 1], expected: 7, name: '단일 바이트 0x01 -> 다항식 0x07' },
        { input: [[1, 7], 2], expected: 0, name: '메시지 + CRC 연접 시 나머지 0 성질' },
        { input: [[2], 1], expected: 14, name: '단일 바이트 0x02 체크섬' },
        { input: [[], 0], expected: 0, name: '빈 패킷 0' }
      ]
    }
  );

  curr.spec.push(
    {
      id: 'spec_adv_schema_multi_agent',
      title: '멀티에이전트 작업 핸드오프 JSON Schema 설계',
      tier: 4,
      level: 'advanced',
      track: 'spec',
      specKind: 'schema',
      category: 'AI 스펙 · 멀티에이전트 핸드오프 스키마',
      complexity: { time: 'O(F)', space: 'O(D)' },
      description: '에이전트 간 작업 위임 페이로드(traceId, targetRole, priority, maxBudgetUsd, tools)를 엄격히 검증하는 JSON Schema를 작성하세요(미정의 필드 금지, 빈 도구 목록 금지, 역할 enum 제한).',
      explanation: {
        summary: 'required, enum, 범위 제약, minItems 및 additionalProperties: false로 에이전트 간 불량 계약을 조기에 차단합니다.',
        keyConcepts: ['additionalProperties: false 계약 잠금', 'enum 기반 허용 역할 제한', 'array minItems: 1 비어있지 않은 도구 목록', '정수 priority [1..5] 범위 검증'],
        lineByLine: [
          { line: 1, code: '{', explain: '루트 JSON Schema 객체를 시작합니다.' },
          { line: 2, code: '  "type": "object",', explain: '페이로드는 반드시 JSON 객체여야 합니다.' },
          { line: 3, code: '  "additionalProperties": false,', explain: '스키마에 선언되지 않은 임의 필드를 차단합니다.' },
          { line: 4, code: '  "required": ["traceId", "targetRole", "priority", "maxBudgetUsd", "tools"],', explain: '5개 필수 계약 필드를 지정합니다.' },
          { line: 5, code: '  "properties": {', explain: '각 필드의 타입과 세부 제약을 정의합니다.' },
          { line: 6, code: '    "traceId": { "type": "string", "minLength": 8 },', explain: '추적 ID는 최소 8자 이상 문자열이어야 합니다.' },
          { line: 7, code: '    "targetRole": { "type": "string", "enum": ["planner", "coder", "reviewer", "verifier"] },', explain: '위임 대상 역할은 4가지 허용 값만 통과시킵니다.' },
          { line: 8, code: '    "priority": { "type": "integer", "minimum": 1, "maximum": 5 },', explain: '우선순위는 1~5 사이의 정수여야 합니다.' },
          { line: 9, code: '    "maxBudgetUsd": { "type": "number", "minimum": 0 },', explain: '예산 상한은 0 이상의 숫자여야 합니다.' },
          { line: 10, code: '    "tools": { "type": "array", "minItems": 1, "items": { "type": "string", "minLength": 1 } }', explain: '도구 배열은 최소 1개 이상의 비어있지 않은 문자열을 요구합니다.' },
          { line: 11, code: '  }', explain: 'properties 정의 블록을 닫습니다.' },
          { line: 12, code: '}', explain: '루트 스키마를 종료합니다.' }
        ],
        complexity: {
          time: 'O(F)',
          timeWhy: '페이로드의 필드 수 F와 도구 배열 길이 합에 선형 비례해 검증합니다.',
          space: 'O(D)',
          spaceWhy: '중첩 객체 깊이 D만큼의 재귀 검증 스택만 사용합니다.'
        },
        pitfalls: [
          '"additionalProperties": false를 빼먹으면 오타 필드(예: target_role)가 경고 없이 통과합니다.',
          'minItems: 1이 빠지면 도구 0개짜리 무력 위임 요청이 허용됩니다.'
        ]
      },
      audit: {
        bugSummary: '"additionalProperties": false 설정을 누락해 스키마 외 미허용 확장 필드가 검증을 그대로 통과합니다.',
        checklist: ['"additionalProperties": false 포함 여부 확인', 'enum / minItems / range 제약 점검'],
        focusLine: 3,
        buggyCode: `{
  "type": "object",
  "required": ["traceId", "targetRole", "priority", "maxBudgetUsd", "tools"],
  "properties": {
    "traceId": { "type": "string", "minLength": 8 },
    "targetRole": { "type": "string", "enum": ["planner", "coder", "reviewer", "verifier"] },
    "priority": { "type": "integer", "minimum": 1, "maximum": 5 },
    "maxBudgetUsd": { "type": "number", "minimum": 0 },
    "tools": { "type": "array", "minItems": 1, "items": { "type": "string", "minLength": 1 } }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "additionalProperties": false,
  "required": ["traceId", "targetRole", "priority", "maxBudgetUsd", "tools"],
  "properties": {
    "traceId": { "type": "string", "minLength": 8 },
    "targetRole": { "type": "string", "enum": ["planner", "coder", "reviewer", "verifier"] },
    "priority": { "type": "integer", "minimum": 1, "maximum": 5 },
    "maxBudgetUsd": { "type": "number", "minimum": 0 },
    "tools": { "type": "array", "minItems": 1, "items": { "type": "string", "minLength": 1 } }
  }
}`,
      skeleton: `{
  "type": "object",
  "additionalProperties": ____,
  "required": ["traceId", "targetRole", "priority", "maxBudgetUsd", "tools"],
  "properties": {
    "traceId": { "type": "string", "minLength": 8 },
    "targetRole": { "type": "string", "enum": ["planner", "____", "reviewer", "verifier"] },
    "priority": { "type": "integer", "minimum": 1, "maximum": ____ },
    "maxBudgetUsd": { "type": "number", "minimum": 0 },
    "tools": { "type": "array", "minItems": ____, "items": { "type": "string", "minLength": 1 } }
  }
}`,
      tests: [
        { input: [{ traceId: 'trc-9821a', targetRole: 'coder', priority: 2, maxBudgetUsd: 1.5, tools: ['read_file'] }], expected: true, name: '정상 핸드오프 페이로드 통과' },
        { input: [{ traceId: 'trc-9821a', targetRole: 'coder', priority: 2, maxBudgetUsd: 1.5, tools: ['read_file'], extraHack: 1 }], expected: false, name: '미정의 필드 거부' },
        { input: [{ traceId: 'trc-9821a', targetRole: 'admin', priority: 2, maxBudgetUsd: 1.5, tools: ['read_file'] }], expected: false, name: '허용 목록 외 역할 거부' },
        { input: [{ traceId: 'trc-9821a', targetRole: 'verifier', priority: 6, maxBudgetUsd: 1.5, tools: [] }], expected: false, name: '우선순위 초과 및 빈 도구 목록 거부' }
      ]
    },
    {
      id: 'spec_adv_arch_cqrs_read_replica',
      title: 'CQRS + Outbox CDC 읽기 복제본 아키텍처 다이어그램',
      tier: 4,
      level: 'advanced',
      track: 'spec',
      specKind: 'diagram',
      category: '아키텍처 다이어그램 · CQRS + Outbox 토폴로지',
      complexity: { time: 'O(V + E)', space: 'O(V + E)' },
      adr: {
        scenario: '단일 OLTP 데이터베이스에서 복잡한 검색 조회와 고빈도 주문 쓰기가 경합해 락 대기로 응답 지연이 급증하고 있습니다.',
        prompt: '쓰기 트랜잭션 성능과 읽기 검색 확장성을 동시에 확보하는 분산 데이터 흐름은?',
        options: [
          { id: 'sync_join', label: 'A. 단일 마스터 DB에 읽기 인덱스만 추가해 직접 조인 조회', recommended: false, critique: '쓰기 시 다수 인덱스 갱신 비용과 조회 락 경합이 그대로 남아 스케일 아웃이 불가능합니다.' },
          { id: 'cqrs_outbox', label: 'B. Command/Query API 분리 + WriteDB CDC Outbox -> Broker -> ReadDB 비동기 투영', recommended: true, critique: '정확합니다! 최종 일관성을 허용하는 대신 쓰기/읽기 모델을 완전히 독립 확장하고 트랜잭션 유실 없이 복제합니다.' }
        ]
      },
      description: '클라이언트 쓰기 명령(WriteAPI -> WriteDB)과 CDC Outbox 비동기 투영(Broker -> ReadDB) 및 분리된 읽기 조회 경로(ReadAPI -> ReadDB)를 좌우 방향(flowchart LR) Mermaid 다이어그램으로 작성하세요.',
      explanation: {
        summary: '쓰기 모델과 읽기 모델 저장소를 물리·논리 분리하고 CDC 브로커를 통해 Outbox 패턴으로 비동기 동기화합니다.',
        keyConcepts: ['flowchart LR 좌->우 데이터 흐름', 'Command / Query 경로 분리', 'CDC Outbox -> Event Broker 투영', '최종 일관성(Eventual Consistency)'],
        lineByLine: [
          { line: 1, code: 'flowchart LR', explain: '좌에서 우로 흐르는 아키텍처 토폴로지를 선언합니다.' },
          { line: 2, code: '  Client[Client App] -->|Write Command| WriteAPI[Command API]', explain: '쓰기 요청은 전담 Command API로 라우팅합니다.' },
          { line: 3, code: '  Client -->|Read Query| ReadAPI[Query API]', explain: '조회 요청은 전담 Query API로 분리합니다.' },
          { line: 4, code: '  WriteAPI -->|Tx Commit| WriteDB[(Primary Write DB)]', explain: 'Command API는 트랜잭션으로 쓰기 DB와 Outbox를 함께 기록합니다.' },
          { line: 5, code: '  WriteDB -->|CDC Outbox| Broker([Event Broker])', explain: 'CDC 릴레이가 변경 이벤트를 브로커로 발행합니다.' },
          { line: 6, code: '  Broker -->|Async Project| ReadDB[(Read Replica)]', explain: '프로젝터가 읽기 전용 뷰 DB에 비동기 반영합니다.' },
          { line: 7, code: '  ReadAPI -->|Fast Lookup| ReadDB', explain: 'Query API는 락 경합 없는 Read Replica만 조회합니다.' }
        ],
        complexity: {
          time: 'O(V + E)',
          timeWhy: '정점(V=6)과 방향 간선(E=6)을 선형 파싱해 토폴로지 계약을 검증합니다.',
          space: 'O(V + E)',
          spaceWhy: '노드 맵과 간선 리스트 크기만큼 메모리를 사용합니다.'
        },
        pitfalls: [
          'WriteDB와 Broker 간 CDC Outbox 간선을 빼먹으면 읽기 복제본이 영구히 갱신되지 않는 단절 토폴로지가 됩니다.',
          '요구 방향 flowchart LR 대신 TD를 쓰면 수평 토폴로지 검증에서 실패합니다.'
        ]
      },
      audit: {
        bugSummary: 'flowchart TD 방향 오류와 WriteDB -> Broker CDC Outbox 연결 누락으로 비동기 투영 파이프라인이 끊어져 있습니다.',
        checklist: ['flowchart LR 선언 확인', 'WriteDB -> Broker, Broker -> ReadDB, ReadAPI -> ReadDB 6개 간선 점검'],
        focusLine: 1,
        buggyCode: `flowchart TD
  Client[Client App] -->|Write Command| WriteAPI[Command API]
  Client -->|Read Query| ReadAPI[Query API]
  WriteAPI -->|Tx Commit| WriteDB[(Primary Write DB)]
  Broker([Event Broker]) -->|Async Project| ReadDB[(Read Replica)]
  ReadAPI -->|Fast Lookup| ReadDB`
      },
      entryPoint: 'diagram',
      code: `flowchart LR
  Client[Client App] -->|Write Command| WriteAPI[Command API]
  Client -->|Read Query| ReadAPI[Query API]
  WriteAPI -->|Tx Commit| WriteDB[(Primary Write DB)]
  WriteDB -->|CDC Outbox| Broker([Event Broker])
  Broker -->|Async Project| ReadDB[(Read Replica)]
  ReadAPI -->|Fast Lookup| ReadDB`,
      skeleton: `flowchart ____
  Client[Client App] -->|Write Command| WriteAPI[Command API]
  Client -->|Read Query| ReadAPI[Query API]
  WriteAPI -->|Tx Commit| WriteDB[(Primary Write DB)]
  WriteDB -->|CDC Outbox| ____([Event Broker])
  Broker -->|Async Project| ReadDB[(Read Replica)]
  ReadAPI -->|Fast Lookup| ____`,
      tests: [
        { input: [{ kind: 'direction', direction: 'LR' }], expected: true, name: '좌->우(LR) 토폴로지 방향' },
        { input: [{ kind: 'edge', from: 'WriteDB', to: 'Broker', label: 'CDC Outbox' }], expected: true, name: 'WriteDB -> Broker CDC Outbox 연결' },
        { input: [{ kind: 'edge', from: 'Broker', to: 'ReadDB', label: 'Async Project' }], expected: true, name: 'Broker -> ReadDB 비동기 투영' },
        { input: [{ kind: 'edge', from: 'ReadAPI', to: 'ReadDB', label: 'Fast Lookup' }], expected: true, name: 'ReadAPI -> ReadDB 분리 조회' },
        { input: [{ kind: 'minCount', nodes: 6, edges: 6 }], expected: true, name: '6개 컴포넌트 · 6개 연결 완전성' }
      ]
    },
    {
      id: 'spec_adv_seq_multi_agent_verify',
      title: '멀티에이전트 검증-재시도 시퀀스 다이어그램',
      tier: 4,
      level: 'advanced',
      track: 'spec',
      specKind: 'diagram',
      category: '시퀀스 다이어그램 · 멀티에이전트 검증 핸드오프',
      complexity: { time: 'O(M)', space: 'O(P + M)' },
      adr: {
        scenario: '단일 AI 코딩 에이전트가 패치 생성과 완료 보고를 스스로 승인하면 테스트 실패나 회귀 버그가 그대로 통과합니다.',
        prompt: '에이전트 워크플로우에서 품질 게이트와 자가 수정을 강제하는 오케스트레이션 구조는?',
        options: [
          { id: 'self_report', label: 'A. Executor가 수정 직후 Orchestrator에게 바로 완료 보고', recommended: false, critique: '독립 검증자 Gate가 없어 컴파일 오류나 린트 위반이 사용자에게 전달됩니다.' },
          { id: 'verifier_gate', label: 'B. Planner -> Executor -> 독립 Verifier 반려 루프 후 Verifier만 최종 승인 보고', recommended: true, critique: '정확합니다! 실행자와 검증자의 역할을 분리해 통과 시그널을 엄격히 통제합니다.' }
        ]
      },
      description: 'Orchestrator, Planner, Executor, Verifier 4명의 참여자 간 계획 수립, 실행, 린트 실패 피드백, 재제출 및 최종 검증 승인 핸드오프를 Mermaid sequenceDiagram으로 작성하세요.',
      explanation: {
        summary: '실행자와 검증자 간 실패 피드백-재제출 루프를 거쳐 최종 검증자만 Orchestrator에 완료 신호를 보내도록 모델링합니다.',
        keyConcepts: ['역할 분리(Executor vs Verifier)', '실패 피드백(-->>) 재시도 루프', '최종 Gate 보고(Verifier -> Orchestrator)', '참여자 4 · 메시지 7 계약'],
        lineByLine: [
          { line: 1, code: 'sequenceDiagram', explain: 'Mermaid 시퀀스 다이어그램을 선언합니다.' },
          { line: 2, code: '  participant Orchestrator', explain: '전체 작업 수명주기를 조율하는 코디네이터입니다.' },
          { line: 3, code: '  participant Planner', explain: '목표를 실행 단계로 분해하는 플래너 에이전트입니다.' },
          { line: 4, code: '  participant Executor', explain: '실제 코드 편집 및 도구를 호출하는 실행 에이전트입니다.' },
          { line: 5, code: '  participant Verifier', explain: '독립적으로 테스트와 린트를 판정하는 검증 에이전트입니다.' },
          { line: 6, code: '  Orchestrator->>Planner: Assign goal', explain: '오케스트레이터가 목표를 플래너에게 위임합니다.' },
          { line: 7, code: '  Planner-->>Orchestrator: Action plan', explain: '플래너가 수립된 실행 계획을 회신합니다.' },
          { line: 8, code: '  Orchestrator->>Executor: Execute step', explain: '오케스트레이터가 실행자에게 구현을 지시합니다.' },
          { line: 9, code: '  Executor->>Verifier: Submit diff', explain: '실행자가 작업 결과를 검증자에게 제출합니다.' },
          { line: 10, code: '  Verifier-->>Executor: Fail lint check', explain: '검증자가 린트 실패 사유를 실행자에게 반려합니다.' },
          { line: 11, code: '  Executor->>Verifier: Resubmit fix', explain: '실행자가 수정본을 다시 검증자에게 제출합니다.' },
          { line: 12, code: '  Verifier-->>Orchestrator: Pass verified', explain: '검증 통과 후 최종 승인 보고를 오케스트레이터에 보냅니다.' }
        ],
        complexity: {
          time: 'O(M)',
          timeWhy: '선언된 참여자 P=4와 메시지 M=7 라인을 1회 파싱해 시퀀스 제약을 검사합니다.',
          space: 'O(P + M)',
          spaceWhy: '참여자 세트와 메시지 흐름 배열을 메모리에 보관합니다.'
        },
        pitfalls: [
          'Verifier -> Orchestrator 최종 보고 없이 Executor가 스스로 완료 보고를 하면 검증 Gate가 무력화됩니다.',
          '실패 후 재제출 메시지 턴(7개 메시지)이 빠지면 자가 수정 루프가 생략됩니다.'
        ]
      },
      audit: {
        bugSummary: 'Verifier가 Orchestrator에게 최종 검증 통과를 보고하는 Gate 메시지가 빠져 Executor가 무검증 상태로 끝나는 흐름이 되었습니다.',
        checklist: ['4명 참여자 모두 선언 확인', 'Verifier -> Orchestrator Pass verified 메시지 및 7개 메시지 수 점검'],
        focusLine: 11,
        buggyCode: `sequenceDiagram
  participant Orchestrator
  participant Planner
  participant Executor
  participant Verifier
  Orchestrator->>Planner: Assign goal
  Planner-->>Orchestrator: Action plan
  Orchestrator->>Executor: Execute step
  Executor->>Verifier: Submit diff
  Verifier-->>Executor: Fail lint check`
      },
      entryPoint: 'diagram',
      code: `sequenceDiagram
  participant Orchestrator
  participant Planner
  participant Executor
  participant Verifier
  Orchestrator->>Planner: Assign goal
  Planner-->>Orchestrator: Action plan
  Orchestrator->>Executor: Execute step
  Executor->>Verifier: Submit diff
  Verifier-->>Executor: Fail lint check
  Executor->>Verifier: Resubmit fix
  Verifier-->>Orchestrator: Pass verified`,
      skeleton: `sequenceDiagram
  participant Orchestrator
  participant Planner
  participant Executor
  participant Verifier
  Orchestrator->>Planner: Assign goal
  Planner-->>Orchestrator: Action plan
  Orchestrator->>____: Execute step
  Executor->>Verifier: Submit diff
  Verifier-->>Executor: Fail lint check
  Executor->>____: Resubmit fix
  Verifier-->>Orchestrator: ____`,
      tests: [
        { input: [{ kind: 'message', from: 'Orchestrator', to: 'Planner' }], expected: true, name: 'Orchestrator -> Planner 목표 위임' },
        { input: [{ kind: 'message', from: 'Planner', to: 'Orchestrator', isDashed: true }], expected: true, name: 'Planner -->> Orchestrator 실행 계획 회신' },
        { input: [{ kind: 'message', from: 'Executor', to: 'Verifier' }], expected: true, name: 'Executor -> Verifier 검증 제출' },
        { input: [{ kind: 'message', from: 'Verifier', to: 'Executor', isDashed: true }], expected: true, name: 'Verifier -->> Executor 실패 반려 루프' },
        { input: [{ kind: 'message', from: 'Verifier', to: 'Orchestrator', isDashed: true }], expected: true, name: 'Verifier -->> Orchestrator 최종 검증 보고' },
        { input: [{ kind: 'minCount', nodes: 4, edges: 7 }], expected: true, name: '4명 참여자 · 7개 메시지 완전성' }
      ]
    }
  );
})(window);
