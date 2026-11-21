/**
 * KeyReflex CodeLab - AI 시대 확장 커리큘럼 & 설계/아키텍처/리팩터링/AI 인프라/스펙 모듈
 * - 기존 CODE_CURRICULUM(JS/Python/C)에 track 및 AI 코드 리뷰(audit) 메타데이터 병합
 * - 아키텍처 패턴, Before->After 리팩터링, AI/RAG 엔지니어링, ADR 트레이드오프, JSON Schema & Mermaid 다이어그램 추가
 */
(function (global) {
  'use strict';

  const curr = global.CODE_CURRICULUM;
  if (!curr) return;

  // 1. 기존 레슨 트랙 태깅 및 AI 리뷰(Audit) 시나리오 보강
  const existingTracks = {
    js_find_max: 'algorithm',
    js_arrow_filter: 'algorithm',
    js_destructuring_defaults: 'algorithm',
    js_array_reduce_sum: 'algorithm',
    js_map_frequency: 'algorithm',
    js_binary_search: 'algorithm',
    js_two_pointers_palindrome: 'algorithm',
    js_debounce_pattern: 'architecture',
    js_lru_cache_map: 'system_design',

    py_count_vowels: 'algorithm',
    py_list_comprehension: 'algorithm',
    py_dict_word_count: 'algorithm',
    py_deque_sliding: 'algorithm',
    py_stack_brackets: 'algorithm',
    py_binary_search: 'algorithm',
    py_two_sum_hash: 'algorithm',
    py_dp_fibonacci: 'algorithm',
    py_memoize_closure: 'architecture',
    py_sliding_rate_limiter: 'system_design',

    c_find_max: 'algorithm',
    c_pointer_swap: 'algorithm',
    c_strlen_pointer: 'algorithm',
    c_array_sum: 'algorithm',
    c_palindrome_ptr: 'algorithm',
    c_binary_search: 'algorithm',
    c_reverse_array: 'algorithm',
    c_bitmask_flags: 'architecture',
    c_ring_buffer_sum: 'system_design'
  };

  const existingAudits = {
    js_find_max: {
      bugSummary: 'AI가 최댓값 초기 기준(max)을 0으로 하드코딩하여 음수 배열 입력 시 0을 잘못 반환합니다.',
      checklist: ['음수 전용 배열([-10, -3, -7]) 경계값 확인', '초기값 numbers[0] 기반 비교'],
      focusLine: 2,
      buggyCode: `function findMax(numbers) {
    let max = 0;
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > max) max = numbers[i];
    }
    return max;
}`
    },
    js_arrow_filter: {
      bugSummary: 'AI가 홀수 비교 조건(n % 2 !== 0)을 반대로 작성해 짝수 필터링 테스트가 실패합니다.',
      checklist: ['나머지 연산 조건(n % 2 === 0) 확인', '불변 새 배열 반환 검증'],
      focusLine: 2,
      buggyCode: `function getEvens(numbers) {
    return numbers.filter((n) => n % 2 !== 0);
}`
    },
    js_binary_search: {
      bugSummary: 'AI가 탐색 범위 루프 조건을 left < right로 작성하여 원소 1개 남은 경계값(mid === target)을 놓칩니다.',
      checklist: ['while (left <= right) 경계 등호 검증', '단일 원소 배열 및 끝값 탐색 확인'],
      focusLine: 4,
      buggyCode: `function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`
    },
    js_debounce_pattern: {
      bugSummary: 'AI가 지연 만료 비교에 >= 대신 > 를 사용하여 정확히 delay ms 간격에 들어온 호출 이전 입력을 누락합니다.',
      checklist: ['경계 등호(nextTime - time >= delay) 확인', '마지막 이벤트 Infinity 폴백 검증'],
      focusLine: 6,
      buggyCode: `function simulateDebounce(events, delay) {
    const emitted = [];
    for (let i = 0; i < events.length; i++) {
        const [time, val] = events[i];
        const nextTime = i + 1 < events.length ? events[i + 1][0] : Infinity;
        if (nextTime - time > delay) {
            emitted.push(val);
        }
    }
    return emitted;
}`
    },
    py_count_vowels: {
      bugSummary: 'AI가 .lower() 정규화를 빠뜨려 대문자 모음("A", "E", "O")을 누락합니다.',
      checklist: ['대소문자 정규화(.lower()) 누락 확인', '모음 멤버십 검사 검증'],
      focusLine: 3,
      buggyCode: `def count_vowels(text: str) -> int:
    total = 0
    for ch in text:
        if ch in 'aeiou':
            total += 1
    return total`
    },
    py_two_sum_hash: {
      bugSummary: 'AI가 정답 탐색 전 현재 인덱스를 먼저 딕셔너리에 저장해 같은 원소를 자기 자신과 더하는 오답이 발생합니다.',
      checklist: ['조회(if need in seen) -> 저장(seen[num] = idx) 순서 검증', '중복 원소 [3, 3] 케이스 점검'],
      focusLine: 4,
      buggyCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for idx, num in enumerate(nums):
        seen[num] = idx
        need = target - num
        if need in seen:
            return [seen[need], idx]
    return []`
    },
    py_dp_fibonacci: {
      bugSummary: 'AI가 DP 루프 범위를 range(2, n)으로 잘못 잡아 마지막 dp[n]이 갱신되지 않고 0을 반환합니다.',
      checklist: ['range(2, n + 1) 상한 +1 포함 확인', '기저 조건 n <= 1 확인'],
      focusLine: 6,
      buggyCode: `def fib_dp(n: int) -> int:
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`
    },
    c_find_max: {
      bugSummary: 'AI가 max_val 초기값을 0으로 두어 모든 원소가 음수인 배열에서 -3 대신 0을 반환합니다.',
      checklist: ['arr[0] 기준값 초기화 확인', '음수 배열([-9, -3, -15, -4]) 방어 검증'],
      focusLine: 2,
      buggyCode: `int find_max(int arr[], int size) {
    int max_val = 0;
    for (int i = 1; i < size; i++) {
        if (arr[i] > max_val) {
            max_val = arr[i];
        }
    }
    return max_val;
}`
    },
    c_bitmask_flags: {
      bugSummary: 'AI가 권한 제거(revoke)에 비트 반전(~) 없이 flags &= revoke; 를 작성해 다른 비트까지 훼손합니다.',
      checklist: ['비트 클리어 관용구 &= ~revoke 확인', '토글(^=)과 OR(|=) 우선순위 검증'],
      focusLine: 4,
      buggyCode: `int manage_permissions(int flags, int grant, int revoke, int toggle) {
    int read_bit = 1 << 0;
    flags |= grant;
    flags &= revoke;
    flags ^= toggle;
    if ((flags & read_bit) == 0) {
        return 0;
    }
    return flags;
}`
    }
  };

  const existingAdrs = {
    js_lru_cache_map: {
      scenario: '초당 수만 건의 조회가 발생하는 API 서버에서 고정 용량(N)의 인메모리 캐시 만료 정책을 설계해야 합니다.',
      prompt: 'O(1) 조회 성능과 최근 사용 순서를 동시에 만족하기 위한 최적 자료구조 전략은?',
      options: [
        { id: 'array', label: 'A. 단순 배열 순회(O(N))로 가장 오래된 키 탐색', recommended: false, critique: '매 get/put마다 O(N) 선형 탐색이 발생해 캐시 병목이 생깁니다.' },
        { id: 'map', label: 'B. 삽입 순서를 보장하는 해시맵(Map)으로 O(1) delete + set 재삽입', recommended: true, critique: '정확합니다! 해시 O(1) 조회와 삽입 순서 큐 역할을 결합해 별도 이중 연결 리스트 구현 없이 O(1) LRU를 달성합니다.' },
        { id: 'random', label: 'C. 무작위 키 삭제(Random Eviction)', recommended: false, critique: '자주 쓰이는 Hot Key까지 삭제될 수 있어 캐시 적중률(Hit Rate)이 크게 떨어집니다.' }
      ]
    },
    py_sliding_rate_limiter: {
      scenario: '외부 공개 LLM API 게이트웨이에서 테넌트별 버스트 트래픽 악용을 막으려 합니다.',
      prompt: '분/초 경계 직전·직후에 2배 트래픽이 몰리는 "경계 버스트"를 막는 올바른 설계는?',
      options: [
        { id: 'fixed', label: 'A. 1분마다 카운터만 0으로 리셋하는 고정 윈도우(Fixed Window)', recommended: false, critique: '00:59초와 01:01초 사이에 허용량의 2배 트래픽이 한꺼번에 통과하는 취약점이 있습니다.' },
        { id: 'sliding', label: 'B. 타임스탬프 큐(deque)로 만료 요청을 비우는 슬라이딩 윈도우 로그', recommended: true, critique: '정확합니다! 임의의 T초 구간 어디를 잘라도 limit 이하를 정확히 보장하며 만료 로그를 O(1) popleft로 정리합니다.' }
      ]
    }
  };

  ['javascript', 'python', 'c'].forEach(lang => {
    (curr[lang] || []).forEach(lesson => {
      if (!lesson.track) lesson.track = existingTracks[lesson.id] || 'algorithm';
      if (!lesson.audit && existingAudits[lesson.id]) lesson.audit = existingAudits[lesson.id];
      if (!lesson.adr && existingAdrs[lesson.id]) lesson.adr = existingAdrs[lesson.id];
    });
  });

  // =========================================================================
  // 2. JavaScript 신규 확장 커리큘럼 (설계·아키텍처 / 리팩터링 / AI·RAG / ADR)
  // =========================================================================
  curr.javascript.push(
    {
      id: 'js_refactor_guard_clauses',
      title: '중첩 if 평탄화 (Guard Clause 리팩터링)',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '깊게 중첩된 권한/예산 검사 코드를 조기 반환(Guard Clause) 구조로 평탄하게 리팩터링합니다.',
      refactoringGoal: '3단계 중첩 if/else 피라미드를 조기 반환(Early Return)으로 펼쳐 가독성과 실패 사유 추적을 개선하세요.',
      refactoringBefore: `function authorizeOrder(user, amount) {
    if (user && user.active) {
        if (amount > 0) {
            if (user.balance >= amount) {
                return 'APPROVED';
            } else { return 'INSUFFICIENT'; }
        } else { return 'INVALID_AMOUNT'; }
    } else { return 'UNAUTHORIZED'; }
}`,
      explanation: {
        summary: '정상 경로(Happy Path)를 가장 아래에 두고 실패 조건을 함수 상단에서 즉시 return 하는 Guard Clause 리팩터링 패턴입니다.',
        keyConcepts: ['Guard Clause (조기 반환)', '중첩 깊이(Nesting) 감소', 'Happy Path 분리', 'Fail-Fast'],
        lineByLine: [
          { line: 1, code: 'function authorizeOrder(user, amount) {', explain: '사용자 객체 user와 결제 금액 amount를 검증하는 함수를 선언합니다.' },
          { line: 2, code: "    if (!user || !user.active) return 'UNAUTHORIZED';", explain: '미인증 또는 비활성 사용자는 진입 즉시 UNAUTHORIZED를 반환해 조기 차단합니다.' },
          { line: 3, code: "    if (amount <= 0) return 'INVALID_AMOUNT';", explain: '0 이하의 비정상 주문 금액을 즉시 거부합니다.' },
          { line: 4, code: "    if (user.balance < amount) return 'INSUFFICIENT';", explain: '잔액 부족 조건을 조기 반환으로 처리합니다.' },
          { line: 5, code: "    return 'APPROVED';", explain: '모든 가드를 통과한 정상 경로만 마지막 줄에 명확히 남깁니다.' },
          { line: 6, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: {
          time: 'O(1)',
          timeWhy: '고정된 3개의 조건 검사만 수행하므로 상수 시간입니다.',
          space: 'O(1)',
          spaceWhy: '추가 메모리 할당 없이 상태 문자열만 반환합니다.'
        },
        pitfalls: ['AI가 생성한 코드에는 방어 분기가 깊은 중첩으로 뭉치기 쉬운데, 리뷰 단계에서 Guard Clause로 펼치면 누락된 경계 조건이 바로 드러납니다.']
      },
      audit: {
        bugSummary: 'AI가 0원 결제 차단 조건을 amount < 0으로 잘못 작성해 0원 주문이 승인되는 결함이 있습니다.',
        checklist: ['경계값 0원(amount <= 0) 차단 확인', 'Guard Clause 조기 반환 순서 점검'],
        focusLine: 3,
        buggyCode: `function authorizeOrder(user, amount) {
    if (!user || !user.active) return 'UNAUTHORIZED';
    if (amount < 0) return 'INVALID_AMOUNT';
    if (user.balance < amount) return 'INSUFFICIENT';
    return 'APPROVED';
}`
      },
      entryPoint: 'authorizeOrder',
      code: `function authorizeOrder(user, amount) {
    if (!user || !user.active) return 'UNAUTHORIZED';
    if (amount <= 0) return 'INVALID_AMOUNT';
    if (user.balance < amount) return 'INSUFFICIENT';
    return 'APPROVED';
}`,
      skeleton: `function authorizeOrder(user, amount) {
    if (____) return 'UNAUTHORIZED';
    if (amount <= 0) return 'INVALID_AMOUNT';
    if (____) return 'INSUFFICIENT';
    return 'APPROVED';
}`,
      tests: [
        { input: [{ active: true, balance: 5000 }, 2000], expected: 'APPROVED', name: '정상 승인' },
        { input: [null, 1000], expected: 'UNAUTHORIZED', name: '비인증 차단' },
        { input: [{ active: true, balance: 5000 }, 0], expected: 'INVALID_AMOUNT', name: '0원 경계 차단' },
        { input: [{ active: true, balance: 1000 }, 3000], expected: 'INSUFFICIENT', name: '잔액 부족 차단' }
      ]
    },
    {
      id: 'js_llm_json_repair',
      title: 'LLM JSON 응답 추출 및 안전 파서',
      tier: 1,
      level: 'beginner',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: 'LLM이 ```json 코드블록이나 앞뒤 설명 문장을 섞어 응답해도 핵심 JSON 객체만 추출해 안전하게 파싱합니다.',
      explanation: {
        summary: '에이전트/LLM 파이프라인에서 가장 자주 겪는 "출력 형식 오염"을 방어하기 위해 첫 `{`부터 마지막 `}` 구간만 잘라 파싱하고 실패 시 null을 반환하는 가드 함수입니다.',
        keyConcepts: ['LLM Structured Output 방어', 'indexOf / lastIndexOf 경계 추출', 'try/catch 안전 폴백', 'JSON.parse'],
        lineByLine: [
          { line: 1, code: 'function extractJsonObject(rawText) {', explain: '모델의 원시 문자열 응답 rawText를 입력받습니다.' },
          { line: 2, code: "    const start = rawText.indexOf('{');", explain: '응답 내에서 JSON 객체가 시작되는 첫 중괄호 위치를 찾습니다.' },
          { line: 3, code: "    const end = rawText.lastIndexOf('}');", explain: '마지막 닫는 중괄호 위치를 찾습니다.' },
          { line: 4, code: '    if (start === -1 || end <= start) return null;', explain: '중괄호 쌍이 유효하지 않으면 예외 없이 null을 반환합니다.' },
          { line: 5, code: '    try {', explain: 'JSON 문법 손상 시 전체 파이프라인이 죽지 않도록 예외 처리를 시작합니다.' },
          { line: 6, code: '        return JSON.parse(rawText.slice(start, end + 1));', explain: '추출한 JSON 문자열 슬라이스를 파싱하여 객체로 반환합니다.' },
          { line: 7, code: '    } catch (_) {', explain: '잘못된 JSON 구문일 경우 에러를 삼키고' },
          { line: 8, code: '        return null;', explain: '안전 폴백 값 null을 반환합니다.' },
          { line: 9, code: '    }', explain: 'try-catch 블록을 닫습니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열 탐색과 JSON.parse 모두 응답 길이 N에 비례합니다.', space: 'O(N)', spaceWhy: '부분 문자열 슬라이스와 파싱된 객체 크기에 비례합니다.' },
        pitfalls: ['rawText.slice(start, end)처럼 +1을 빼먹으면 마지막 닫는 중괄호 `}`가 잘려 모든 JSON.parse가 실패합니다.']
      },
      audit: {
        bugSummary: 'AI가 slice 끝 인덱스에 +1을 누락해 닫는 중괄호 `}`가 잘려 모든 정상 JSON 파싱이 null로 실패합니다.',
        checklist: ['slice(start, end + 1) 끝 포함 확인', 'JSON 손상 시 try-catch null 폴백 검증'],
        focusLine: 6,
        buggyCode: `function extractJsonObject(rawText) {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
        return JSON.parse(rawText.slice(start, end));
    } catch (_) {
        return null;
    }
}`
      },
      entryPoint: 'extractJsonObject',
      code: `function extractJsonObject(rawText) {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
        return JSON.parse(rawText.slice(start, end + 1));
    } catch (_) {
        return null;
    }
}`,
      skeleton: `function extractJsonObject(rawText) {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (____) return null;
    try {
        return JSON.parse(____);
    } catch (_) {
        return null;
    }
}`,
      tests: [
        { input: ['결과입니다:\n```json\n{"intent":"search","ok":true}\n```'], expected: { intent: 'search', ok: true }, name: '마크다운 펜스 제거 파싱' },
        { input: ['{broken: json'], expected: null, name: '손상된 JSON 안전 폴백' },
        { input: ['plain text without json'], expected: null, name: 'JSON 미포함 응답 처리' }
      ]
    },
    {
      id: 'js_refactor_strategy_map',
      title: '조건 분기 → Strategy 맵 분리 (OCP)',
      tier: 2,
      level: 'intermediate',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '등급별 할인율 switch/if-else 분기를 전략 함수 레지스트리 맵으로 분리하여 개방-폐쇄 원칙(OCP)을 적용합니다.',
      refactoringGoal: '신규 등급이 추가될 때마다 거대한 switch 문을 고치는 대신, 전략 맵(strategies)에서 함수를 꺼내 실행하는 구조로 바꾸세요.',
      refactoringBefore: `function calcDiscount(tier, price) {
    if (tier === 'VIP') return Math.round(price * 0.8);
    else if (tier === 'PRO') return Math.round(price * 0.9);
    else if (tier === 'COUPON') return Math.max(0, price - 2000);
    return price;
}`,
      explanation: {
        summary: '분기문을 데이터/함수 매핑(Strategy Map)으로 대체해 확장에는 열려 있고 기존 디스패처 수정에는 닫혀 있는 설계 구조를 구현합니다.',
        keyConcepts: ['Strategy Pattern', 'OCP (개방-폐쇄 원칙)', 'Dispatch Table', '기본 폴백 전략'],
        lineByLine: [
          { line: 1, code: 'function calcDiscount(tier, price) {', explain: '회원 등급 tier와 원가 price를 받아 최종 금액을 계산합니다.' },
          { line: 2, code: '    const strategies = {', explain: '각 등급별 할인 계산 알고리즘을 키-함수 쌍의 전략 레지스트리로 등록합니다.' },
          { line: 3, code: '        VIP: (p) => Math.round(p * 0.8),', explain: 'VIP 등급은 20% 할인을 적용합니다.' },
          { line: 4, code: '        PRO: (p) => Math.round(p * 0.9),', explain: 'PRO 등급은 10% 할인을 적용합니다.' },
          { line: 5, code: '        COUPON: (p) => Math.max(0, p - 2000)', explain: 'COUPON은 2,000원 정액 차감 후 음수가 되지 않도록 0으로 하한을 둡니다.' },
          { line: 6, code: '    };', explain: '전략 레지스트리 객체를 닫습니다.' },
          { line: 7, code: '    const apply = strategies[tier] || ((p) => p);', explain: '해당 등급 전략을 조회하고, 미등록 등급이면 원가 그대로 반환하는 기본 전략을 선택합니다.' },
          { line: 8, code: '    return apply(price);', explain: '선택된 전략 함수를 실행해 할인 가격을 반환합니다.' },
          { line: 9, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '해시 프로퍼티 룩업 1회로 전략을 즉시 실행합니다.', space: 'O(1)', spaceWhy: '고정된 전략 테이블 크기만 사용합니다.' },
        pitfalls: ['strategies[tier]가 undefined일 때 기본 폴백 ((p) => p)이 없으면 TypeError가 발생합니다.']
      },
      audit: {
        bugSummary: 'AI가 COUPON 전략에서 음수 방어(Math.max(0, ...))를 빠뜨려 1000원 상품에 쿠폰 적용 시 -1000원이 반환됩니다.',
        checklist: ['COUPON 정액 차감 음수 하한(0원) 확인', '미등록 등급 기본 전략 폴백 검증'],
        focusLine: 5,
        buggyCode: `function calcDiscount(tier, price) {
    const strategies = {
        VIP: (p) => Math.round(p * 0.8),
        PRO: (p) => Math.round(p * 0.9),
        COUPON: (p) => p - 2000
    };
    const apply = strategies[tier] || ((p) => p);
    return apply(price);
}`
      },
      entryPoint: 'calcDiscount',
      code: `function calcDiscount(tier, price) {
    const strategies = {
        VIP: (p) => Math.round(p * 0.8),
        PRO: (p) => Math.round(p * 0.9),
        COUPON: (p) => Math.max(0, p - 2000)
    };
    const apply = strategies[tier] || ((p) => p);
    return apply(price);
}`,
      skeleton: `function calcDiscount(tier, price) {
    const strategies = {
        VIP: (p) => Math.round(p * 0.8),
        PRO: (p) => Math.round(p * 0.9),
        COUPON: (p) => Math.max(0, p - 2000)
    };
    const apply = ____ || ((p) => p);
    return ____;
}`,
      tests: [
        { input: ['VIP', 10000], expected: 8000, name: 'VIP 20% 할인' },
        { input: ['COUPON', 1000], expected: 0, name: '쿠폰 하한(0원) 방어' },
        { input: ['GUEST', 5000], expected: 5000, name: '미등록 등급 기본 폴백' }
      ]
    },
    {
      id: 'js_rag_chunk_overlap',
      title: 'RAG 오버랩 슬라이딩 텍스트 청커',
      tier: 2,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '검색 증강 생성(RAG) 색인 시 문맥이 끊어지지 않도록 overlap만큼 겹쳐 문서를 분할합니다.',
      explanation: {
        summary: '긴 문서를 임베딩 모델 토큰 한도에 맞춰 잘라낼 때 step = chunkSize - overlap 간격으로 전진하며 앞뒤 문맥을 보존하는 RAG 전처리 핵심 패턴입니다.',
        keyConcepts: ['RAG Text Splitting', 'Sliding Window Overlap', '무한 루프 방어 (step <= 0)', '문맥 보존'],
        lineByLine: [
          { line: 1, code: 'function chunkText(text, chunkSize, overlap) {', explain: '원본 텍스트, 청크 크기, 중첩 길이를 입력받습니다.' },
          { line: 2, code: '    const step = chunkSize - overlap;', explain: '다음 청크 시작점이 앞으로 전진하는 보폭을 계산합니다.' },
          { line: 3, code: '    if (chunkSize <= 0 || step <= 0) return [];', explain: 'overlap >= chunkSize일 때 인덱스가 정체되어 발생하는 무한루프를 차단합니다.' },
          { line: 4, code: '    const chunks = [];', explain: '분할된 청크를 담을 배열을 초기화합니다.' },
          { line: 5, code: '    for (let i = 0; i < text.length; i += step) {', explain: 'step 간격씩 이동하며 슬라이딩 윈도우를 전개합니다.' },
          { line: 6, code: '        chunks.push(text.slice(i, i + chunkSize));', explain: '현재 위치부터 chunkSize 길이만큼 잘라 추가합니다.' },
          { line: 7, code: '        if (i + chunkSize >= text.length) break;', explain: '이미 문서 끝에 도달했으면 꼬리 중복 청크를 방지하고 루프를 멈춥니다.' },
          { line: 8, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 9, code: '    return chunks;', explain: '분할된 RAG 청크 배열을 반환합니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'step >= 1일 때 문서 길이 N에 비례해 조각을 잘라냅니다.', space: 'O(N)', spaceWhy: '생성된 중첩 청크 목록을 저장합니다.' },
        pitfalls: ['끝 도달 break 조건이 없으면 마지막 몇 글자가 불필요한 중복 청크로 계속 추가되며, step <= 0 방어가 없으면 브라우저 탭이 정지합니다.']
      },
      audit: {
        bugSummary: 'AI가 마지막 끝 도달 break 조건과 step <= 0 방어를 누락하여 꼬리 잔여 조각이 불필요하게 중복 생성됩니다.',
        checklist: ['step <= 0 무한루프 방어 확인', 'i + chunkSize >= text.length 조기 종료 확인'],
        focusLine: 7,
        buggyCode: `function chunkText(text, chunkSize, overlap) {
    const step = chunkSize - overlap;
    if (chunkSize <= 0 || step <= 0) return [];
    const chunks = [];
    for (let i = 0; i < text.length; i += step) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
}`
      },
      entryPoint: 'chunkText',
      code: `function chunkText(text, chunkSize, overlap) {
    const step = chunkSize - overlap;
    if (chunkSize <= 0 || step <= 0) return [];
    const chunks = [];
    for (let i = 0; i < text.length; i += step) {
        chunks.push(text.slice(i, i + chunkSize));
        if (i + chunkSize >= text.length) break;
    }
    return chunks;
}`,
      skeleton: `function chunkText(text, chunkSize, overlap) {
    const step = ____;
    if (chunkSize <= 0 || step <= 0) return [];
    const chunks = [];
    for (let i = 0; i < text.length; i += step) {
        chunks.push(text.slice(i, i + chunkSize));
        if (____) break;
    }
    return chunks;
}`,
      tests: [
        { input: ['ABCDEFGH', 4, 1], expected: ['ABCD', 'DEFG', 'GH'], name: '오버랩 1 슬라이딩 청킹' },
        { input: ['ABCDEF', 4, 2], expected: ['ABCD', 'CDEF'], name: '꼬리 중복 청크 방지' },
        { input: ['ABC', 5, 2], expected: ['ABC'], name: '청크 크기보다 짧은 입력' },
        { input: ['ABCD', 3, 3], expected: [], name: 'overlap >= chunkSize 무한루프 방어' }
      ]
    },
    {
      id: 'js_di_payment_port',
      title: '의존성 역전(DI) 포트/어댑터 결제 서비스',
      tier: 3,
      level: 'intermediate',
      track: 'architecture',
      category: 'Architecture',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '구체 결제 SDK에 직접 의존하지 않고 gateway 포트 함수를 주입받아 실행하는 DI + 어댑터 경계를 구현합니다.',
      explanation: {
        summary: '헥사고날/클린 아키텍처의 핵심인 의존성 주입(Dependency Injection)을 클로저 팩토리로 구현하여 테스트 시 가짜(Mock) 게이트웨이로 손쉽게 교체 검증합니다.',
        keyConcepts: ['Dependency Injection (DI)', 'Ports & Adapters', '계약 검증 (Validation)', '테스트 용이성'],
        lineByLine: [
          { line: 1, code: 'function runPaymentFlow(amount, failLimit) {', explain: '결제 금액과 게이트웨이 한도를 시뮬레이션하는 DI 테스트 흐름을 정의합니다.' },
          { line: 2, code: '    const gateway = (amt) => amt <= failLimit ? `TX-${amt}` : null;', explain: '외부 결제 SDK 어댑터 역할을 하는 포트 함수를 구성합니다.' },
          { line: 3, code: '    const createService = (chargePort) => (amt) => {', explain: '고수준 비즈니스 서비스가 추상 포트 chargePort만 주입받도록 분리합니다.' },
          { line: 4, code: "        if (amt <= 0) return { ok: false, code: 'BAD_AMT' };", explain: '어댑터를 호출하기 전 도메인 불변식(양수 금액)을 서비스 계층에서 검증합니다.' },
          { line: 5, code: '        const txId = chargePort(amt);', explain: '주입된 포트 인터페이스 계약으로 결제를 위임합니다.' },
          { line: 6, code: "        return txId ? { ok: true, txId } : { ok: false, code: 'DECLINED' };", explain: '외부 결과를 도메인 표준 응답 형식으로 정규화해 반환합니다.' },
          { line: 7, code: '    };', explain: '서비스 핸들러를 반환합니다.' },
          { line: 8, code: '    const pay = createService(gateway);', explain: '실제 조합 루트(Composition Root)에서 포트 구현체를 주입합니다.' },
          { line: 9, code: '    return pay(amount);', explain: '주입된 서비스 인스턴스로 결제를 실행합니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '주입된 포트 1회 호출로 완료됩니다.', space: 'O(1)', spaceWhy: '단일 응답 객체만 생성합니다.' },
        pitfalls: ['고수준 서비스 내부에서 외부 API를 직접 import/new 하면 네트워크 없이 단위 테스트를 돌릴 수 없게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 txId가 null(승인 거절)일 때도 ok: true로 반환하는 경계 매핑 버그를 남겼습니다.',
        checklist: ['chargePort 실패(null) 시 ok: false 매핑 확인', '0원 이하 금액 도메인 가드 확인'],
        focusLine: 6,
        buggyCode: `function runPaymentFlow(amount, failLimit) {
    const gateway = (amt) => amt <= failLimit ? \`TX-\${amt}\` : null;
    const createService = (chargePort) => (amt) => {
        if (amt <= 0) return { ok: false, code: 'BAD_AMT' };
        const txId = chargePort(amt);
        return { ok: true, txId };
    };
    const pay = createService(gateway);
    return pay(amount);
}`
      },
      entryPoint: 'runPaymentFlow',
      code: `function runPaymentFlow(amount, failLimit) {
    const gateway = (amt) => amt <= failLimit ? \`TX-\${amt}\` : null;
    const createService = (chargePort) => (amt) => {
        if (amt <= 0) return { ok: false, code: 'BAD_AMT' };
        const txId = chargePort(amt);
        return txId ? { ok: true, txId } : { ok: false, code: 'DECLINED' };
    };
    const pay = createService(gateway);
    return pay(amount);
}`,
      skeleton: `function runPaymentFlow(amount, failLimit) {
    const gateway = (amt) => amt <= failLimit ? \`TX-\${amt}\` : null;
    const createService = (chargePort) => (amt) => {
        if (____) return { ok: false, code: 'BAD_AMT' };
        const txId = ____;
        return txId ? { ok: true, txId } : { ok: false, code: 'DECLINED' };
    };
    const pay = createService(gateway);
    return pay(amount);
}`,
      tests: [
        { input: [3000, 5000], expected: { ok: true, txId: 'TX-3000' }, name: '포트 주입 정상 승인' },
        { input: [8000, 5000], expected: { ok: false, code: 'DECLINED' }, name: '게이트웨이 한도 초과 거절' },
        { input: [0, 5000], expected: { ok: false, code: 'BAD_AMT' }, name: '서비스 도메인 가드 차단' }
      ]
    },
    {
      id: 'js_prompt_guard_sanitizer',
      title: 'AI 가드레일: Injection 탐지 & PII 마스킹',
      tier: 3,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Safety',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '사용자 프롬프트에서 시스템 지침 우회(Prompt Injection) 시도를 차단하고 이메일 PII를 마스킹합니다.',
      explanation: {
        summary: 'LLM 입력 전처리 계층에서 프롬프트 인젝션 시그니처를 탐지하여 차단하고, 개인정보(이메일)는 모델 컨텍스트로 넘어가기 전에 마스킹하는 실무 AI 가드레일입니다.',
        keyConcepts: ['AI Input Guardrail', 'Prompt Injection 탐지', 'PII Redaction (정규식)', '소문자 정규화 검사'],
        lineByLine: [
          { line: 1, code: 'function sanitizePrompt(input) {', explain: '사용자 입력 문자열 input을 검증/정화합니다.' },
          { line: 2, code: '    const lower = input.toLowerCase();', explain: '대소문자 변형 우회를 막기 위해 소문자로 정규화합니다.' },
          { line: 3, code: "    if (lower.includes('ignore previous') || lower.includes('system prompt')) {", explain: '지침 무력화 및 시스템 프롬프트 유출 시도 키워드를 탐지합니다.' },
          { line: 4, code: "        return { blocked: true, text: '[BLOCKED]' };", explain: '위험 입력이면 모델 전달을 차단하고 차단 응답을 반환합니다.' },
          { line: 5, code: '    }', explain: '인젝션 검사 블록을 닫습니다.' },
          { line: 6, code: "    const safeText = input.replace(/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/gi, '[EMAIL]');", explain: '이메일 형식의 개인정보(PII)를 [EMAIL] 토큰으로 치환합니다.' },
          { line: 7, code: '    return { blocked: false, text: safeText };', explain: '안전하게 마스킹된 텍스트를 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '문자열 소문자 변환 및 단일 패스 정규식 치환을 수행합니다.', space: 'O(N)', spaceWhy: '정화된 출력 문자열을 생성합니다.' },
        pitfalls: ['정규식에 전역 플래그 g가 빠지면 문장 속 첫 번째 이메일만 마스킹되고 두 번째 이메일이 그대로 LLM에 유출됩니다.']
      },
      audit: {
        bugSummary: 'AI가 이메일 정규식에서 /g 전역 플래그와 ignore previous 대소문자 정규화를 누락해 두 번째 이메일과 대문자 우회 공격이 통과합니다.',
        checklist: ['소문자 정규화(.toLowerCase()) 확인', '정규식 전역(/gi) 마스킹 확인'],
        focusLine: 6,
        buggyCode: `function sanitizePrompt(input) {
    const lower = input;
    if (lower.includes('ignore previous') || lower.includes('system prompt')) {
        return { blocked: true, text: '[BLOCKED]' };
    }
    const safeText = input.replace(/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/i, '[EMAIL]');
    return { blocked: false, text: safeText };
}`
      },
      entryPoint: 'sanitizePrompt',
      code: `function sanitizePrompt(input) {
    const lower = input.toLowerCase();
    if (lower.includes('ignore previous') || lower.includes('system prompt')) {
        return { blocked: true, text: '[BLOCKED]' };
    }
    const safeText = input.replace(/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/gi, '[EMAIL]');
    return { blocked: false, text: safeText };
}`,
      skeleton: `function sanitizePrompt(input) {
    const lower = ____;
    if (lower.includes('ignore previous') || lower.includes('system prompt')) {
        return { blocked: true, text: '[BLOCKED]' };
    }
    const safeText = input.replace(/[\\w.-]+@[\\w.-]+\\.[a-z]{2,}/gi, ____);
    return { blocked: false, text: safeText };
}`,
      tests: [
        { input: ['IGNORE PREVIOUS rules now'], expected: { blocked: true, text: '[BLOCKED]' }, name: '대문자 우회 인젝션 차단' },
        { input: ['Send to a@b.com and c@d.io'], expected: { blocked: false, text: 'Send to [EMAIL] and [EMAIL]' }, name: '복수 이메일 PII 마스킹' },
        { input: ['Explain clean architecture'], expected: { blocked: false, text: 'Explain clean architecture' }, name: '정상 질의 통과' }
      ]
    },
    {
      id: 'js_circuit_breaker',
      title: '서킷 브레이커 상태 머신 (CLOSED → OPEN)',
      tier: 4,
      level: 'advanced',
      track: 'architecture',
      category: 'Resilience',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '외부 API 장애 시 연속 실패 임계치에서 회로를 OPEN으로 차단(Fail-Fast)하고 쿨다운 후 HALF_OPEN으로 복구합니다.',
      adr: {
        scenario: '의존 중인 외부 LLM/결제 API 응답이 30초 타임아웃으로 장애가 났는데, 수천 개의 요청이 계속 대기 스레드를 점유해 우리 서버까지 연쇄 다운(Cascading Failure)되고 있습니다.',
        prompt: '장애 전파를 막기 위한 가장 적절한 복원력(Resilience) 상태 설계는?',
        options: [
          { id: 'retry', label: 'A. 실패할 때마다 즉시 5회 무한 재시도', recommended: false, critique: '죽어가는 외부 API에 5배 트래픽 폭탄을 보내 장애를 더 악화시킵니다(Retry Storm).' },
          { id: 'cb', label: 'B. CLOSED → OPEN(즉시 차단) → HALF_OPEN(탐침 복구) 서킷 브레이커', recommended: true, critique: '정확합니다! 임계치 초과 시 즉시 실패를 반환해 서버 스레드를 보호하고, 일정 쿨다운 후 단일 탐침 요청으로 정상화 여부를 확인합니다.' }
        ]
      },
      explanation: {
        summary: '분산 시스템 연쇄 장애(Cascading Failure)를 차단하는 3상태(CLOSED / OPEN / HALF_OPEN) 서킷 브레이커 시뮬레이터입니다.',
        keyConcepts: ['Circuit Breaker Pattern', 'Fail-Fast 격리', '3-State FSM', 'HALF_OPEN 탐침 복구'],
        lineByLine: [
          { line: 1, code: 'function simulateBreaker(events, threshold) {', explain: '요청 결과 배열(OK, FAIL, TICK)과 차단 임계치를 입력받습니다.' },
          { line: 2, code: "    let state = 'CLOSED';", explain: '초기 회로 상태는 정상 통과(CLOSED)로 시작합니다.' },
          { line: 3, code: '    let fails = 0;', explain: '연속 실패 카운터를 0으로 초기화합니다.' },
          { line: 4, code: '    const log = [];', explain: '각 이벤트 처리 결과(FAIL, OPEN, BLOCKED, HALF, OK)를 기록합니다.' },
          { line: 5, code: '    for (const ev of events) {', explain: '시뮬레이션 이벤트를 시간 순서대로 처리합니다.' },
          { line: 6, code: "        if (ev === 'TICK') {", explain: '쿨다운 타이머 틱(TICK) 이벤트가 도착한 경우' },
          { line: 7, code: "            if (state === 'OPEN') { state = 'HALF_OPEN'; log.push('HALF'); }", explain: 'OPEN 상태일 때만 반열림(HALF_OPEN)으로 전이하고, CLOSED 등 다른 상태의 TICK은 무시합니다.' },
          { line: 8, code: '            continue;', explain: 'TICK 이벤트가 실패 카운터로 떨어지지 않도록 다음 이벤트로 넘어갑니다.' },
          { line: 9, code: '        }', explain: 'TICK 분기 블록을 닫습니다.' },
          { line: 10, code: "        if (state === 'OPEN') { log.push('BLOCKED'); continue; }", explain: 'OPEN 상태의 요청은 외부 호출 없이 즉시 차단(Fail-Fast)합니다.' },
          { line: 11, code: "        if (ev === 'OK') { fails = 0; state = 'CLOSED'; log.push('OK'); }", explain: '성공하면 실패 카운트를 0으로 비우고 CLOSED로 완전 복구합니다.' },
          { line: 12, code: "        else if (++fails >= threshold || state === 'HALF_OPEN') { state = 'OPEN'; log.push('OPEN'); }", explain: '임계치 이상 실패하거나 HALF_OPEN 탐침이 실패하면 회로를 OPEN으로 차단합니다.' },
          { line: 13, code: "        else { log.push('FAIL'); }", explain: '아직 임계치 미만인 단일 실패는 CLOSED를 유지합니다.' },
          { line: 14, code: '    }', explain: '이벤트 루프를 종료합니다.' },
          { line: 15, code: '    return log;', explain: '전체 상태 전이 및 차단 이력을 반환합니다.' },
          { line: 16, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개 이벤트를 순차적으로 1회 순회합니다.', space: 'O(N)', spaceWhy: '이벤트 결과 로그 배열 크기에 비례합니다.' },
        pitfalls: ['HALF_OPEN 상태에서 단 한 번의 탐침만 실패해도 즉시 OPEN으로 되돌리지 않으면 불완전한 서버로 트래픽이 쏟아집니다. 또한 CLOSED 상태의 유휴 TICK이 실패 카운터로 새어 들어가지 않도록 반드시 조기 continue 해야 합니다.']
      },
      audit: {
        bugSummary: 'AI가 성공(OK) 시 fails = 0 초기화를 빠뜨리고 CLOSED 상태 TICK 처리까지 실패 분기로 흘려보내 회로가 오작동합니다.',
        checklist: ['OK 수신 시 fails = 0 초기화 확인', 'TICK 수신 시 OPEN 이외 상태에서도 조기 continue 확인'],
        focusLine: 11,
        buggyCode: `function simulateBreaker(events, threshold) {
    let state = 'CLOSED';
    let fails = 0;
    const log = [];
    for (const ev of events) {
        if (ev === 'TICK' && state === 'OPEN') { state = 'HALF_OPEN'; log.push('HALF'); continue; }
        if (state === 'OPEN') { log.push('BLOCKED'); continue; }
        if (ev === 'OK') { state = 'CLOSED'; log.push('OK'); }
        else if (++fails >= threshold || state === 'HALF_OPEN') { state = 'OPEN'; log.push('OPEN'); }
        else { log.push('FAIL'); }
    }
    return log;
}`
      },
      entryPoint: 'simulateBreaker',
      code: `function simulateBreaker(events, threshold) {
    let state = 'CLOSED';
    let fails = 0;
    const log = [];
    for (const ev of events) {
        if (ev === 'TICK') {
            if (state === 'OPEN') { state = 'HALF_OPEN'; log.push('HALF'); }
            continue;
        }
        if (state === 'OPEN') { log.push('BLOCKED'); continue; }
        if (ev === 'OK') { fails = 0; state = 'CLOSED'; log.push('OK'); }
        else if (++fails >= threshold || state === 'HALF_OPEN') { state = 'OPEN'; log.push('OPEN'); }
        else { log.push('FAIL'); }
    }
    return log;
}`,
      skeleton: `function simulateBreaker(events, threshold) {
    let state = 'CLOSED';
    let fails = 0;
    const log = [];
    for (const ev of events) {
        if (ev === 'TICK') {
            if (state === 'OPEN') { state = 'HALF_OPEN'; log.push('HALF'); }
            continue;
        }
        if (state === 'OPEN') { log.push(____); continue; }
        if (ev === 'OK') { ____; state = 'CLOSED'; log.push('OK'); }
        else if (++fails >= threshold || state === 'HALF_OPEN') { state = 'OPEN'; log.push('OPEN'); }
        else { log.push('FAIL'); }
    }
    return log;
}`,
      tests: [
        { input: [['FAIL', 'FAIL', 'OK', 'TICK', 'OK'], 2], expected: ['FAIL', 'OPEN', 'BLOCKED', 'HALF', 'OK'], name: '차단 -> Fail-Fast -> Half-Open 복구' },
        { input: [['FAIL', 'OK', 'FAIL', 'OK'], 2], expected: ['FAIL', 'OK', 'FAIL', 'OK'], name: '성공 시 연속 실패 카운터 초기화' },
        { input: [['TICK', 'FAIL', 'TICK', 'OK'], 2], expected: ['FAIL', 'OK'], name: 'CLOSED 유휴 TICK 무시' },
        { input: [['FAIL', 'FAIL', 'TICK', 'FAIL', 'OK'], 2], expected: ['FAIL', 'OPEN', 'HALF', 'OPEN', 'BLOCKED'], name: 'HALF_OPEN 탐침 실패 시 즉시 재차단' }
      ]
    },
    {
      id: 'js_adr_idempotency_guard',
      title: 'ADR 설계: 멱등성 키(Idempotency) 중복 차단',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: 'System Design',
      complexity: { time: 'O(N)', space: 'O(U)' },
      description: '네트워크 타임아웃으로 동일 결제/웹훅 요청이 여러 번 재전송되어도 1회만 실행하고 저장된 결과를 돌려주는 멱등성 게이트를 구현합니다.',
      adr: {
        scenario: '결제 완료 직후 응답 패킷이 유실되어 클라이언트가 2초 뒤 똑같은 결제 요청을 3번 재전송했습니다.',
        prompt: '이중 결제(Double Charge)를 방지하면서 동일한 성공 응답을 안전하게 돌려주는 아키텍처 선택은?',
        options: [
          { id: 'ui', label: 'A. 프론트엔드 버튼 클릭만 1초 막기(Debounce)', recommended: false, critique: '모바일 네트워크 재시도, 웹훅 재전송, 다중 탭 호출 시 서버로 들어오는 중복 요청을 전혀 막지 못합니다.' },
          { id: 'idem', label: 'B. 요청별 Idempotency-Key 결과를 서버 Map에 캐싱하고 동일 키 재수신 시 원 응답 반환', recommended: true, critique: '정확합니다! 분산 환경의 At-Least-Once 전달에서도 Exactly-Once 처리 효과를 보장합니다.' }
        ]
      },
      explanation: {
        summary: '요청의 고유 키(idempotencyKey)를 기준으로 최초 1회만 상태를 변경하고 이후 재시도에는 저장된 응답 스냅샷을 재사용하는 멱등성 가드 패턴입니다.',
        keyConcepts: ['Idempotency Key', 'At-Least-Once → Exactly-Once', 'Map Result Caching', '이중 결제 방지'],
        lineByLine: [
          { line: 1, code: 'function processIdempotentRequests(requests) {', explain: 'key와 amount를 담은 요청 목록 requests를 처리합니다.' },
          { line: 2, code: '    const cache = new Map();', explain: '처리 완료된 멱등성 키별 최초 응답을 보관할 저장소입니다.' },
          { line: 3, code: '    let chargedTotal = 0;', explain: '실제 결제 엔진이 차감한 누적 총액을 추적합니다.' },
          { line: 4, code: '    for (const req of requests) {', explain: '수신된 모든 요청(재전송 포함)을 순회합니다.' },
          { line: 5, code: '        if (!cache.has(req.key)) {', explain: '아직 한 번도 처리되지 않은 새로운 키인 경우에만' },
          { line: 6, code: '            chargedTotal += req.amount;', explain: '실제 결제 부수효과(Side Effect)를 딱 1회 실행합니다.' },
          { line: 7, code: '            cache.set(req.key, chargedTotal);', explain: '이후 동일 키 재요청에 응답할 결과를 캐시에 커밋합니다.' },
          { line: 8, code: '        }', explain: '이미 존재하는 키는 결제를 건너뛰어 멱등성을 유지합니다.' },
          { line: 9, code: '    }', explain: '요청 순회를 종료합니다.' },
          { line: 10, code: '    return { chargedTotal, uniqueOps: cache.size };', explain: '실제 청구 총액과 고유 처리 건수를 검증 결과로 반환합니다.' },
          { line: 11, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개의 요청을 Map O(1) 조회로 통과합니다.', space: 'O(U)', spaceWhy: '고유 키 U개만큼만 캐시 엔트리를 유지합니다.' },
        pitfalls: ['키 없이 금액과 시간만으로 중복을 판별하면 실제로 같은 금액을 연달아 두 번 구매하려는 정상 사용자까지 차단하게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 키를 확인만 하고 cache.set(req.key, ...)으로 기록하지 않아 재시도 요청 3건이 모두 중복 결제됩니다.',
        checklist: ['신규 키 처리 직후 cache.set(req.key, ...) 커밋 확인', 'chargedTotal 1회 실행 확인'],
        focusLine: 7,
        buggyCode: `function processIdempotentRequests(requests) {
    const cache = new Map();
    let chargedTotal = 0;
    for (const req of requests) {
        if (!cache.has(req.key)) {
            chargedTotal += req.amount;
        }
    }
    return { chargedTotal, uniqueOps: cache.size };
}`
      },
      entryPoint: 'processIdempotentRequests',
      code: `function processIdempotentRequests(requests) {
    const cache = new Map();
    let chargedTotal = 0;
    for (const req of requests) {
        if (!cache.has(req.key)) {
            chargedTotal += req.amount;
            cache.set(req.key, chargedTotal);
        }
    }
    return { chargedTotal, uniqueOps: cache.size };
}`,
      skeleton: `function processIdempotentRequests(requests) {
    const cache = new Map();
    let chargedTotal = 0;
    for (const req of requests) {
        if (____) {
            chargedTotal += req.amount;
            ____;
        }
    }
    return { chargedTotal, uniqueOps: cache.size };
}`,
      tests: [
        { input: [[{ key: 'k1', amount: 5000 }, { key: 'k1', amount: 5000 }, { key: 'k2', amount: 3000 }]], expected: { chargedTotal: 8000, uniqueOps: 2 }, name: '동일 키 재시도 이중 결제 방지' },
        { input: [[{ key: 'a', amount: 1000 }, { key: 'b', amount: 1000 }]], expected: { chargedTotal: 2000, uniqueOps: 2 }, name: '서로 다른 키 동일 금액 정상 처리' }
      ]
    },
    {
      id: 'js_refactor_optional_chain',
      title: '옵셔널 체이닝(?.) & 안전 기본값 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '깊게 중첩된 null 체크 사슬을 ES2020 옵셔널 체이닝(?.)과 정제 후 기본값 폴백으로 깔끔하게 리팩터링합니다.',
      refactoringGoal: 'order && order.shipping && order.shipping.address 반복 가드를 ?. 체이닝으로 단순화하고 공백 전용 도시명도 차단하세요.',
      refactoringBefore: `function getShippingCity(order) {
    if (order && order.shipping && order.shipping.address && order.shipping.address.city) {
        const clean = order.shipping.address.city.trim();
        return clean.length > 0 ? clean : 'UNKNOWN';
    }
    return 'UNKNOWN';
}`,
      explanation: {
        summary: '옵셔널 체이닝(?.)으로 중간 객체가 null/undefined여도 TypeError 없이 안전하게 평가하고, trim() 후 빈 문자열은 UNKNOWN으로 대체합니다.',
        keyConcepts: ['Optional Chaining (?.)', 'Short-Circuit Evaluation', 'String.prototype.trim()', 'Safe Fallback'],
        lineByLine: [
          { line: 1, code: 'function getShippingCity(order) {', explain: '중첩 배송 정보를 가진 order 객체를 입력받습니다.' },
          { line: 2, code: '    const city = order?.shipping?.address?.city?.trim();', explain: '어느 단계라도 null/undefined면 즉시 undefined를 반환해 TypeError를 방어합니다.' },
          { line: 3, code: "    return city || 'UNKNOWN';", explain: '추출된 도시명이 비어 있거나 undefined면 표준 폴백 UNKNOWN을 반환합니다.' },
          { line: 4, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '고정 깊이 4단계 프로퍼티 조회와 짧은 문자열 trim만 수행합니다.', space: 'O(1)', spaceWhy: '단일 정제 문자열만 반환합니다.' },
        pitfalls: ['city ?? "UNKNOWN"만 쓰면 city가 공백("   ")일 때 trim() 결과가 빈 문자열("")이 되어 그대로 통과할 수 있으므로 || 폴백이 안전합니다.']
      },
      audit: {
        bugSummary: 'AI가 옵셔널 체이닝(?.)을 빠져먹고 order.shipping.address에 직접 접근해 shipping 누락 시 TypeError로 중단됩니다.',
        checklist: ['중첩 프로퍼티 ?. 체이닝 적용 확인', '공백/null 입력 시 UNKNOWN 폴백 확인'],
        focusLine: 2,
        buggyCode: `function getShippingCity(order) {
    const city = order.shipping.address.city.trim();
    return city || 'UNKNOWN';
}`
      },
      entryPoint: 'getShippingCity',
      code: `function getShippingCity(order) {
    const city = order?.shipping?.address?.city?.trim();
    return city || 'UNKNOWN';
}`,
      skeleton: `function getShippingCity(order) {
    const city = ____;
    return city || ____;
}`,
      tests: [
        { input: [{ shipping: { address: { city: '  Seoul ' } } }], expected: 'Seoul', name: '공백 제거 후 도시명 반환' },
        { input: [{ shipping: {} }], expected: 'UNKNOWN', name: '중간 객체 누락 안전 폴백' },
        { input: [{ shipping: { address: { city: '   ' } } }], expected: 'UNKNOWN', name: '공백 전용 도시명 폴백' },
        { input: [null], expected: 'UNKNOWN', name: 'null 입력 TypeError 방지' }
      ]
    },
    {
      id: 'js_retry_backoff_schedule',
      title: '지수 백오프 재시도(Retry Backoff) 스케줄러',
      tier: 2,
      level: 'intermediate',
      track: 'system_design',
      category: 'Resilience',
      complexity: { time: 'O(R)', space: 'O(R)' },
      description: '일시적 네트워크 오류 재시도 시 서버 부하 폭주(Thundering Herd)를 막기 위해 2배씩 증가하되 상한(maxMs)으로 제한되는 대기 시간표를 생성합니다.',
      adr: {
        scenario: '외부 결제/Webhook 서버가 순간 과부하로 HTTP 503을 반환하고 있습니다.',
        prompt: '장애 복구를 도우면서 재시도 폭주(Retry Storm)를 피하기 위한 대기 전략은?',
        options: [
          { id: 'fixed', label: 'A. 매번 100ms 고정 간격으로 즉시 20회 재시도', recommended: false, critique: '실패한 모든 클라이언트가 같은 100ms 주기로 동시에 서버를 두드려 장애를 고착시킵니다.' },
          { id: 'exp', label: 'B. 2의 거듭제곱 지수 백오프(base * 2^i) + maxMs 상한 캡(Cap) 적용', recommended: true, critique: '정확합니다! 점진적으로 대기 시간을 넓혀 서버 회복 시간을 확보하고 상한 캡으로 무한 대기를 막습니다.' }
        ]
      },
      explanation: {
        summary: '재시도 횟수 i에 따라 baseMs * (2 ** i) 지수 간격으로 대기 시간을 늘리면서 Math.min(maxMs, raw)로 상한을 캡핑합니다.',
        keyConcepts: ['Exponential Backoff', 'Exponentiation (**)', 'Upper-Bound Cap (Math.min)', 'Retry Resilience'],
        lineByLine: [
          { line: 1, code: 'function calcBackoffDelays(retries, baseMs, maxMs) {', explain: '재시도 횟수 retries, 초기 대기 baseMs, 최대 상한 maxMs를 받습니다.' },
          { line: 2, code: '    const delays = [];', explain: '회차별 대기 시간(ms)을 담을 배열을 초기화합니다.' },
          { line: 3, code: '    for (let i = 0; i < retries; i++) {', explain: '0회차부터 retries - 1회차까지 재시도 간격을 계산합니다.' },
          { line: 4, code: '        const raw = baseMs * (2 ** i);', explain: '매 회차 대기 시간을 2배(2^i)씩 지수적으로 증가시킵니다.' },
          { line: 5, code: '        delays.push(Math.min(maxMs, raw));', explain: '계산값이 maxMs를 넘지 않도록 상한 캡을 씌워 기록합니다.' },
          { line: 6, code: '    }', explain: 'for 루프를 종료합니다.' },
          { line: 7, code: '    return delays;', explain: '생성된 지수 백오프 대기 스케줄 배열을 반환합니다.' },
          { line: 8, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(R)', timeWhy: '재시도 횟수 R에 비례해 상수 산술 연산을 반복합니다.', space: 'O(R)', spaceWhy: '크기 R의 대기 시간 배열을 생성합니다.' },
        pitfalls: ['Math.min(maxMs, raw) 상한 캡을 두지 않으면 retries=20일 때 대기 시간이 수십 시간을 넘어 요청이 사실상 멈춥니다.']
      },
      audit: {
        bugSummary: 'AI가 maxMs 상한 캡(Math.min)을 빠뜨려 4회차 지연이 maxMs(500ms)를 초과한 800ms로 계산됩니다.',
        checklist: ['Math.min(maxMs, raw) 상한 적용 확인', 'retries=0 빈 배열 반환 확인'],
        focusLine: 5,
        buggyCode: `function calcBackoffDelays(retries, baseMs, maxMs) {
    const delays = [];
    for (let i = 0; i < retries; i++) {
        const raw = baseMs * (2 ** i);
        delays.push(raw);
    }
    return delays;
}`
      },
      entryPoint: 'calcBackoffDelays',
      code: `function calcBackoffDelays(retries, baseMs, maxMs) {
    const delays = [];
    for (let i = 0; i < retries; i++) {
        const raw = baseMs * (2 ** i);
        delays.push(Math.min(maxMs, raw));
    }
    return delays;
}`,
      skeleton: `function calcBackoffDelays(retries, baseMs, maxMs) {
    const delays = [];
    for (let i = 0; i < retries; i++) {
        const raw = ____;
        delays.push(____);
    }
    return delays;
}`,
      tests: [
        { input: [4, 100, 500], expected: [100, 200, 400, 500], name: '지수 증가 + 500ms 상한 캡' },
        { input: [0, 100, 500], expected: [], name: '재시도 0회 빈 스케줄' },
        { input: [3, 250, 1000], expected: [250, 500, 1000], name: '정확한 1000ms 도달' }
      ]
    },
    {
      id: 'js_event_emitter_pubsub',
      title: 'Pub/Sub EventEmitter 구독 · 해제 브로커',
      tier: 3,
      level: 'intermediate',
      track: 'architecture',
      category: 'Architecture',
      complexity: { time: 'O(N + D)', space: 'O(S)' },
      description: '이벤트 기반 아키텍처의 핵심인 Map<Event, Set<Subscriber>> 기반 Pub/Sub 발행·구독·해제 브로커를 구현합니다.',
      explanation: {
        summary: '발행자(Producer)와 구독자(Consumer) 결합을 끊기 위해 Map과 Set을 결합해 중복 구독을 막고 안전한 구독 해제를 지원합니다.',
        keyConcepts: ['Pub/Sub EventEmitter', 'Map<string, Set>', 'Set 중복 구독 방지', '옵셔널 체이닝 해제 (?.)'],
        lineByLine: [
          { line: 1, code: 'function simulatePubSub(ops) {', explain: 'on/off/emit 연산 시퀀스 ops를 받아 전달된 메시지 로그를 반환합니다.' },
          { line: 2, code: '    const bus = new Map();', explain: '이벤트 이름별로 구독자 Set을 관리할 중앙 버스를 생성합니다.' },
          { line: 3, code: '    const delivered = [];', explain: 'emit 시 실제로 구독자에게 전달된 이벤트 기록 배열입니다.' },
          { line: 4, code: '    for (const [op, ev, val] of ops) {', explain: '구조분해할당으로 연산 종류, 이벤트명, 인자를 순회합니다.' },
          { line: 5, code: "        if (op === 'on') {", explain: '구독 등록(on) 연산 분기입니다.' },
          { line: 6, code: '            if (!bus.has(ev)) bus.set(ev, new Set());', explain: '최초 이벤트면 중복 방지용 Set 컬렉션을 초기화합니다.' },
          { line: 7, code: '            bus.get(ev).add(val);', explain: '구독자 ID(val)를 해당 이벤트 Set에 등록합니다.' },
          { line: 8, code: "        } else if (op === 'off') {", explain: '구독 해제(off) 연산 분기입니다.' },
          { line: 9, code: '            bus.get(ev)?.delete(val);', explain: '등록된 이벤트가 있는 경우 안전하게 해당 구독자를 제거합니다.' },
          { line: 10, code: "        } else if (op === 'emit') {", explain: '이벤트 발행(emit) 연산 분기입니다.' },
          { line: 11, code: '            for (const sub of bus.get(ev) || []) {', explain: '구독자가 없더라도 빈 배열로 안전하게 순회합니다.' },
          { line: 12, code: '                delivered.push(`${sub}:${val}`);', explain: '각 활성 구독자에게 페이로드를 전달한 기록을 남깁니다.' },
          { line: 13, code: '            }', explain: '구독자 브로드캐스트 루프를 닫습니다.' },
          { line: 14, code: '        }', explain: '연산 분기를 닫습니다.' },
          { line: 15, code: '    }', explain: '전체 연산 루프를 종료합니다.' },
          { line: 16, code: '    return delivered;', explain: '누적 전달 기록을 반환합니다.' },
          { line: 17, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N + D)', timeWhy: 'N개의 연산 처리와 총 발행 전달 수 D에 비례합니다.', space: 'O(S)', spaceWhy: '활성 구독자 S명과 전달 로그를 유지합니다.' },
        pitfalls: ['배열 대신 Set을 써야 동일 리스너가 실수로 중복 등록돼도 알림이 2번 발송되지 않으며, 삭제도 O(1)에 처리됩니다.']
      },
      audit: {
        bugSummary: 'AI가 off 분기에서 구독자 삭제(delete)를 누락해 구독 해지된 리스너까지 계속 이벤트를 수신합니다.',
        checklist: ['off 시 bus.get(ev)?.delete(val) 제거 확인', 'Set 기반 중복 등록 방지 확인'],
        focusLine: 9,
        buggyCode: `function simulatePubSub(ops) {
    const bus = new Map();
    const delivered = [];
    for (const [op, ev, val] of ops) {
        if (op === 'on') {
            if (!bus.has(ev)) bus.set(ev, new Set());
            bus.get(ev).add(val);
        } else if (op === 'off') {
            bus.get(ev)?.has(val);
        } else if (op === 'emit') {
            for (const sub of bus.get(ev) || []) {
                delivered.push(\`\${sub}:\${val}\`);
            }
        }
    }
    return delivered;
}`
      },
      entryPoint: 'simulatePubSub',
      code: `function simulatePubSub(ops) {
    const bus = new Map();
    const delivered = [];
    for (const [op, ev, val] of ops) {
        if (op === 'on') {
            if (!bus.has(ev)) bus.set(ev, new Set());
            bus.get(ev).add(val);
        } else if (op === 'off') {
            bus.get(ev)?.delete(val);
        } else if (op === 'emit') {
            for (const sub of bus.get(ev) || []) {
                delivered.push(\`\${sub}:\${val}\`);
            }
        }
    }
    return delivered;
}`,
      skeleton: `function simulatePubSub(ops) {
    const bus = new Map();
    const delivered = [];
    for (const [op, ev, val] of ops) {
        if (op === 'on') {
            if (!bus.has(ev)) bus.set(ev, new Set());
            bus.get(ev).add(val);
        } else if (op === 'off') {
            ____;
        } else if (op === 'emit') {
            for (const sub of ____) {
                delivered.push(\`\${sub}:\${val}\`);
            }
        }
    }
    return delivered;
}`,
      tests: [
        { input: [[['on', 'paid', 'mail'], ['on', 'paid', 'slack'], ['on', 'paid', 'mail'], ['emit', 'paid', '100'], ['off', 'paid', 'mail'], ['emit', 'paid', '200']]], expected: ['mail:100', 'slack:100', 'slack:200'], name: '구독 중복 제거 + emit + off 해제' },
        { input: [[['off', 'none', 'a'], ['emit', 'none', 'ping']]], expected: [], name: '미등록 이벤트 안전 무시' }
      ]
    },
    {
      id: 'js_context_token_trimmer',
      title: 'LLM 컨텍스트 윈도우 토큰 예산 트리머',
      tier: 3,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: 'LLM 프롬프트 길이 제한(maxTokens) 내에서 System 지침을 최상단에 고정 보존하고 최신 대화 턴부터 역방향으로 채웁니다.',
      explanation: {
        summary: '긴 대화 이력을 LLM에 전송할 때 맨 앞 system 프롬프트는 반드시 남기면서 최신 연속 대화를 토큰 예산 안에서 보존해 시간순으로 정렬 반환합니다.',
        keyConcepts: ['Context Window Management', 'System Prompt Pinning', '역순 그리디 적재', '대화 순서 복원 (reverse)'],
        lineByLine: [
          { line: 1, code: 'function trimMessagesToBudget(messages, maxTokens) {', explain: '대화 메시지 목록과 허용 최대 토큰 예산 maxTokens를 받습니다.' },
          { line: 2, code: '    if (messages.length === 0) return [];', explain: '빈 대화 입력은 즉시 빈 배열을 반환합니다.' },
          { line: 3, code: "    const sys = messages[0].role === 'system' ? messages[0] : null;", explain: '첫 메시지가 system 역할이면 고정 보존 대상으로 분리합니다.' },
          { line: 4, code: '    let budget = maxTokens - (sys ? sys.tokens : 0);', explain: 'system 프롬프트가 차지한 토큰을 먼저 차감해 가용 예산을 계산합니다.' },
          { line: 5, code: '    if (budget < 0) return [];', explain: 'system 프롬프트만으로 이미 예산을 초과하면 빈 배열을 반환합니다.' },
          { line: 6, code: '    const kept = [];', explain: '예산 내에 들어오는 최신 대화 턴들을 담을 배열입니다.' },
          { line: 7, code: '    const start = sys ? 1 : 0;', explain: '역순 탐색 시 system 메시지와 겹치지 않게 하한 인덱스를 정합니다.' },
          { line: 8, code: '    for (let i = messages.length - 1; i >= start; i--) {', explain: '가장 최근 메시지부터 거꾸로 예산 여유를 확인합니다.' },
          { line: 9, code: '        if (messages[i].tokens <= budget) {', explain: '현재 턴이 남은 예산 안에 들어오면' },
          { line: 10, code: '            kept.push(messages[i]);', explain: '유지 목록에 담고' },
          { line: 11, code: '            budget -= messages[i].tokens;', explain: '남은 토큰 예산을 차감합니다.' },
          { line: 12, code: '        } else { break; }', explain: '대화 연속성(연대기)이 깨지지 않도록 예산 초과 시 즉시 멈춥니다.' },
          { line: 13, code: '    }', explain: '역순 적재 루프를 닫습니다.' },
          { line: 14, code: '    kept.reverse();', explain: '뒤에서부터 모은 대화들을 원래 시간순으로 되돌립니다.' },
          { line: 15, code: '    return sys ? [sys, ...kept] : kept;', explain: 'system 지침을 맨 앞에 붙여 최종 프롬프트 배열을 반환합니다.' },
          { line: 16, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '메시지 목록을 뒤에서부터 1회 순회 후 reverse합니다.', space: 'O(N)', spaceWhy: '유지된 메시지 참조 배열을 반환합니다.' },
        pitfalls: ['break 없이 건너뛰어 예전 대화를 띄엄띄엄 넣거나 kept.reverse()를 빠뜨리면 질문-답변 문맥 순서가 뒤집혀 LLM 품질이 급락합니다.']
      },
      audit: {
        bugSummary: 'AI가 역순 탐색 후 kept.reverse() 호출을 누락해 대화가 최신->과거 역순으로 뒤집혀 모델에 전달됩니다.',
        checklist: ['kept.reverse() 시간순 복원 확인', 'system 메시지 선차감 및 앞부분 고정 확인'],
        focusLine: 14,
        buggyCode: `function trimMessagesToBudget(messages, maxTokens) {
    if (messages.length === 0) return [];
    const sys = messages[0].role === 'system' ? messages[0] : null;
    let budget = maxTokens - (sys ? sys.tokens : 0);
    if (budget < 0) return [];
    const kept = [];
    const start = sys ? 1 : 0;
    for (let i = messages.length - 1; i >= start; i--) {
        if (messages[i].tokens <= budget) {
            kept.push(messages[i]);
            budget -= messages[i].tokens;
        } else { break; }
    }
    return sys ? [sys, ...kept] : kept;
}`
      },
      entryPoint: 'trimMessagesToBudget',
      code: `function trimMessagesToBudget(messages, maxTokens) {
    if (messages.length === 0) return [];
    const sys = messages[0].role === 'system' ? messages[0] : null;
    let budget = maxTokens - (sys ? sys.tokens : 0);
    if (budget < 0) return [];
    const kept = [];
    const start = sys ? 1 : 0;
    for (let i = messages.length - 1; i >= start; i--) {
        if (messages[i].tokens <= budget) {
            kept.push(messages[i]);
            budget -= messages[i].tokens;
        } else { break; }
    }
    kept.reverse();
    return sys ? [sys, ...kept] : kept;
}`,
      skeleton: `function trimMessagesToBudget(messages, maxTokens) {
    if (messages.length === 0) return [];
    const sys = messages[0].role === 'system' ? messages[0] : null;
    let budget = maxTokens - (sys ? sys.tokens : 0);
    if (budget < 0) return [];
    const kept = [];
    const start = sys ? 1 : 0;
    for (let i = messages.length - 1; i >= start; i--) {
        if (messages[i].tokens <= budget) {
            kept.push(messages[i]);
            budget -= messages[i].tokens;
        } else { break; }
    }
    ____;
    return sys ? [sys, ...kept] : ____;
}`,
      tests: [
        {
          input: [[{ role: 'system', tokens: 20 }, { role: 'user', tokens: 40 }, { role: 'assistant', tokens: 30 }, { role: 'user', tokens: 25 }], 80],
          expected: [{ role: 'system', tokens: 20 }, { role: 'assistant', tokens: 30 }, { role: 'user', tokens: 25 }],
          name: 'System 유지 + 최신 2턴 시간순 보존'
        },
        {
          input: [[{ role: 'user', tokens: 30 }, { role: 'assistant', tokens: 20 }], 60],
          expected: [{ role: 'user', tokens: 30 }, { role: 'assistant', tokens: 20 }],
          name: 'System 없는 대화 전체 수용'
        },
        {
          input: [[{ role: 'system', tokens: 100 }, { role: 'user', tokens: 10 }], 50],
          expected: [],
          name: 'System 자체 예산 초과 시 빈 배열'
        }
      ]
    },
    {
      id: 'js_token_bucket_limiter',
      title: '토큰 버킷(Token Bucket) 버스트 Rate Limiter',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: 'System Design',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '일정량의 순간 버스트(cap)를 허용하면서도 장기 평균 처리율(refillPerSec)을 정밀 제어하는 Token Bucket 알고리즘을 구현합니다.',
      adr: {
        scenario: '사용자가 페이지를 열 때 초기 API 3개를 동시에 한 번에 호출하지만, 이후에는 초당 1회 속도로만 제한해야 합니다.',
        prompt: '초기 순간 버스트(Burst)는 부드럽게 허용하되 장기 유입량을 제한하는 표준 알고리즘은?',
        options: [
          { id: 'leaky', label: 'A. 모든 요청을 무조건 일정 간격으로만 꺼내는 엄격한 Leaky Bucket', recommended: false, critique: '초기 화면 로딩 시 동시 3건 호출조차 강제로 지연시켜 체감 UX가 느려집니다.' },
          { id: 'token', label: 'B. 버킷 용량(cap)까지 순간 버스트를 허용하고 경과 시간만큼 토큰을 보충하는 Token Bucket', recommended: true, critique: '정확합니다! cap 만큼의 정상 버스트를 허용하면서도 refillPerSec 속도로 평균 유량을 완벽히 제어합니다.' }
        ]
      },
      explanation: {
        summary: '요청이 들어올 때마다 마지막 시각과의 차이(elapsed) * refillPerSec 만큼 토큰을 채우되 Math.min(cap, ...)로 최대 수용량을 넘지 않도록 제한합니다.',
        keyConcepts: ['Token Bucket Algorithm', 'Burst Capacity (cap)', 'Lazy Refill (elapsed * rate)', 'Math.min 상한 제한'],
        lineByLine: [
          { line: 1, code: 'function simulateTokenBucket(timestamps, cap, refillPerSec) {', explain: '요청 시각 배열(초), 버킷 최대 용량 cap, 초당 충전량 refillPerSec을 받습니다.' },
          { line: 2, code: '    let tokens = cap;', explain: '초기 버킷에는 최대 용량 cap만큼의 토큰이 가득 찬 상태로 시작합니다.' },
          { line: 3, code: '    let lastTs = timestamps.length > 0 ? timestamps[0] : 0;', explain: '첫 요청 시각을 기준으로 경과 시간 측정을 초기화합니다.' },
          { line: 4, code: '    const results = [];', explain: '각 요청의 허용(true)/차단(false) 결과를 담을 배열입니다.' },
          { line: 5, code: '    for (const ts of timestamps) {', explain: '들어오는 요청 타임스탬프를 시간순으로 순회합니다.' },
          { line: 6, code: '        const elapsed = Math.max(0, ts - lastTs);', explain: '직전 갱신 이후 흐른 경과 시간(음수 방지)을 구합니다.' },
          { line: 7, code: '        tokens = Math.min(cap, tokens + elapsed * refillPerSec);', explain: '경과 시간만큼 토큰을 보충하되 버킷 용량 cap을 절대 넘지 않게 제한합니다.' },
          { line: 8, code: '        lastTs = ts;', explain: '마지막 토큰 갱신 기준 시각을 현재 시각으로 업데이트합니다.' },
          { line: 9, code: '        if (tokens >= 1) { tokens -= 1; results.push(true); }', explain: '토큰 1개 이상이 남아 있으면 1개를 소비하고 요청을 허용합니다.' },
          { line: 10, code: '        else { results.push(false); }', explain: '토큰이 부족하면 소비 없이 요청을 거절합니다.' },
          { line: 11, code: '    }', explain: '요청 루프를 종료합니다.' },
          { line: 12, code: '    return results;', explain: '각 요청의 허용 여부 배열을 반환합니다.' },
          { line: 13, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '요청 N개마다 별도 백그라운드 타이머 없이 지연 계산(Lazy Refill) O(1)로 처리합니다.', space: 'O(N)', spaceWhy: '요청별 허용 결과 배열 크기에 비례합니다.' },
        pitfalls: ['Math.min(cap, ...) 없이 오랫동안 유휴 상태였던 사용자가 들어오면 수백만 개의 토큰이 누적되어 버킷 제한이 무력화됩니다.']
      },
      audit: {
        bugSummary: 'AI가 토큰 보충 시 Math.min(cap, ...) 상한 제한을 빠뜨려 유휴 후 한꺼번에 버킷 용량을 초과한 버스트가 허용됩니다.',
        checklist: ['Math.min(cap, tokens + elapsed * refillPerSec) 상한 검증', '토큰 1 미만일 때 차단(false) 확인'],
        focusLine: 7,
        buggyCode: `function simulateTokenBucket(timestamps, cap, refillPerSec) {
    let tokens = cap;
    let lastTs = timestamps.length > 0 ? timestamps[0] : 0;
    const results = [];
    for (const ts of timestamps) {
        const elapsed = Math.max(0, ts - lastTs);
        tokens = tokens + elapsed * refillPerSec;
        lastTs = ts;
        if (tokens >= 1) { tokens -= 1; results.push(true); }
        else { results.push(false); }
    }
    return results;
}`
      },
      entryPoint: 'simulateTokenBucket',
      code: `function simulateTokenBucket(timestamps, cap, refillPerSec) {
    let tokens = cap;
    let lastTs = timestamps.length > 0 ? timestamps[0] : 0;
    const results = [];
    for (const ts of timestamps) {
        const elapsed = Math.max(0, ts - lastTs);
        tokens = Math.min(cap, tokens + elapsed * refillPerSec);
        lastTs = ts;
        if (tokens >= 1) { tokens -= 1; results.push(true); }
        else { results.push(false); }
    }
    return results;
}`,
      skeleton: `function simulateTokenBucket(timestamps, cap, refillPerSec) {
    let tokens = cap;
    let lastTs = timestamps.length > 0 ? timestamps[0] : 0;
    const results = [];
    for (const ts of timestamps) {
        const elapsed = Math.max(0, ts - lastTs);
        tokens = ____;
        lastTs = ts;
        if (tokens >= 1) { ____; results.push(true); }
        else { results.push(false); }
    }
    return results;
}`,
      tests: [
        { input: [[0, 0, 0, 1, 2], 2, 1], expected: [true, true, false, true, true], name: 'cap=2 버스트 후 1초당 1개 재충전' },
        { input: [[0, 100, 100, 100], 2, 1], expected: [true, true, true, false], name: '100초 유휴 후에도 cap=2 상한 초과 방지' },
        { input: [[], 3, 1], expected: [], name: '빈 요청 스트림 안전 처리' }
      ]
    }
  );

  // =========================================================================
  // 3. Python 신규 확장 커리큘럼 (전략 패턴 / SSE 스트림 / RAG 코사인 / 파이프라인 / Cache-Aside)
  // =========================================================================
  curr.python.push(
    {
      id: 'py_strategy_router',
      title: '전략 레지스트리(Strategy Dispatch) 명령 라우터',
      tier: 1,
      level: 'beginner',
      track: 'architecture',
      category: 'Architecture',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '조건문 분기 대신 딕셔너리 기반 람다 핸들러 레지스트리로 명령어를 확장 가능하게 라우팅합니다.',
      refactoringBefore: `def run_command(cmd: str, x: int) -> int:
    if cmd == 'double': return x * 2
    elif cmd == 'square': return x * x
    elif cmd == 'negate': return -x
    else: return x`,
      explanation: {
        summary: 'Python의 일급 함수(First-Class Function)와 dict.get을 결합해 거대한 if-elif 분기 없이 깔끔한 명령 디스패처(Command Dispatch)를 구축합니다.',
        keyConcepts: ['Strategy Registry Dict', 'First-Class Functions', 'dict.get 기본 폴백', 'OCP 확장성'],
        lineByLine: [
          { line: 1, code: 'def dispatch_command(cmd: str, value: int) -> int:', explain: '명령 이름 cmd와 정수 value를 받아 전략을 실행합니다.' },
          { line: 2, code: '    handlers = {', explain: '명령어 문자열과 실행 함수를 매핑한 딕셔너리를 선언합니다.' },
          { line: 3, code: "        'double': lambda v: v * 2,", explain: 'double 명령 시 값을 2배로 변환합니다.' },
          { line: 4, code: "        'square': lambda v: v * v,", explain: 'square 명령 시 값을 제곱합니다.' },
          { line: 5, code: "        'negate': lambda v: -v,", explain: 'negate 명령 시 부호를 반전합니다.' },
          { line: 6, code: '    }', explain: '핸들러 맵을 닫습니다.' },
          { line: 7, code: '    fn = handlers.get(cmd, lambda v: v)', explain: '등록된 전략을 꺼내고 미등록 명령어면 항등 함수를 기본값으로 사용합니다.' },
          { line: 8, code: '    return fn(value)', explain: '선택된 전략 핸들러를 호출해 결과를 반환합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '딕셔너리 해시 조회 1회로 분기합니다.', space: 'O(1)', spaceWhy: '상수 크기의 핸들러 매핑만 유지합니다.' },
        pitfalls: ['handlers[cmd]를 직접 인덱싱하면 알 수 없는 명령어 입력 시 KeyError 예외로 서비스가 중단될 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 handlers.get 대신 handlers[cmd]를 직접 조회하여 미지원 명령 입력 시 KeyError가 발생합니다.',
        checklist: ['handlers.get(cmd, fallback) 안전 조회 확인', '3개 기본 명령 정확성 확인'],
        focusLine: 7,
        buggyCode: `def dispatch_command(cmd: str, value: int) -> int:
    handlers = {
        'double': lambda v: v * 2,
        'square': lambda v: v * v,
        'negate': lambda v: -v,
    }
    fn = handlers[cmd]
    return fn(value)`
      },
      entryPoint: 'dispatch_command',
      code: `def dispatch_command(cmd: str, value: int) -> int:
    handlers = {
        'double': lambda v: v * 2,
        'square': lambda v: v * v,
        'negate': lambda v: -v,
    }
    fn = handlers.get(cmd, lambda v: v)
    return fn(value)`,
      skeleton: `def dispatch_command(cmd: str, value: int) -> int:
    handlers = {
        'double': lambda v: v * 2,
        'square': lambda v: v * v,
        'negate': lambda v: -v,
    }
    fn = handlers.get(____, lambda v: v)
    return ____`,
      tests: [
        { input: ['double', 6], expected: 12, name: 'double 전략' },
        { input: ['square', 5], expected: 25, name: 'square 전략' },
        { input: ['unknown', 9], expected: 9, name: '미등록 명령 안전 폴백' }
      ]
    },
    {
      id: 'py_sse_stream_parser',
      title: 'LLM SSE 스트리밍 토큰(data:) 청크 파서',
      tier: 2,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: 'OpenAI/Anthropic 호환 Server-Sent Events(SSE) 스트림 라인들에서 [DONE]을 제외하고 토큰 텍스트만 추출·조립합니다.',
      explanation: {
        summary: '실시간 AI 채팅 스트리밍 클라이언트의 핵심인 SSE 라인 파서입니다. 빈 줄/주석(`: ping`)을 건너뛰고 `data:` 접두사와 `[DONE]` 종료 신호를 안전하게 처리합니다.',
        keyConcepts: ['SSE (Server-Sent Events)', 'LLM 토큰 스트리밍', '[DONE] Sentinel 종료', 'list join 효율화'],
        lineByLine: [
          { line: 1, code: 'def parse_sse_tokens(lines: list[str]) -> str:', explain: '수신된 SSE 문자열 라인 리스트를 받습니다.' },
          { line: 2, code: '    parts = []', explain: '추출된 토큰 조각을 모을 리스트를 준비합니다.' },
          { line: 3, code: '    for line in lines:', explain: '각 SSE 라인을 순서대로 검사합니다.' },
          { line: 4, code: '        clean = line.strip()', explain: '앞뒤 공백과 개행 문자를 제거합니다.' },
          { line: 5, code: "        if not clean.startswith('data:'):", explain: 'event:/빈 줄 등 data: 라인이 아니면 건너뜁니다.' },
          { line: 6, code: '            continue', explain: '다음 라인으로 넘어갑니다.' },
          { line: 7, code: "        payload = clean[5:].strip()", explain: 'data: 접두사 5글자를 떼어낸 뒤 공백을 정리합니다.' },
          { line: 8, code: "        if payload == '[DONE]':", explain: '스트림 종료 신호([DONE])를 만나면' },
          { line: 9, code: '            break', explain: '스트림 파싱 루프를 즉시 마칩니다.' },
          { line: 10, code: '        parts.append(payload)', explain: '실제 토큰 페이로드를 조립 목록에 추가합니다.' },
          { line: 11, code: "    return ' '.join(parts)", explain: '추출한 토큰들을 공백으로 연결해 완성 문장을 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '전체 라인 수 N을 1회 스캔합니다.', space: 'O(N)', spaceWhy: '토큰 조각들을 임시 리스트에 저장합니다.' },
        pitfalls: ['[DONE] 마커 체크 없이 그대로 parts에 추가하면 AI 답변 끝에 [DONE] 문자열이 노출되는 흔한 버그가 발생합니다.']
      },
      audit: {
        bugSummary: 'AI가 [DONE] 종료 신호 검사를 빠뜨려 답변 문자열 끝에 "[DONE]"이 그대로 출력됩니다.',
        checklist: ["payload == '[DONE]' 종료 처리 확인", "non-data 라인 skip 확인"],
        focusLine: 8,
        buggyCode: `def parse_sse_tokens(lines: list[str]) -> str:
    parts = []
    for line in lines:
        clean = line.strip()
        if not clean.startswith('data:'):
            continue
        payload = clean[5:].strip()
        parts.append(payload)
    return ' '.join(parts)`
      },
      entryPoint: 'parse_sse_tokens',
      code: `def parse_sse_tokens(lines: list[str]) -> str:
    parts = []
    for line in lines:
        clean = line.strip()
        if not clean.startswith('data:'):
            continue
        payload = clean[5:].strip()
        if payload == '[DONE]':
            break
        parts.append(payload)
    return ' '.join(parts)`,
      skeleton: `def parse_sse_tokens(lines: list[str]) -> str:
    parts = []
    for line in lines:
        clean = line.strip()
        if not clean.startswith('data:'):
            continue
        payload = clean[5:].strip()
        if ____:
            break
        parts.append(payload)
    return ____`,
      tests: [
        { input: [['event: msg', 'data: Hello', '', 'data: AI', 'data: [DONE]', 'data: trailing']], expected: 'Hello AI', name: '[DONE] 종료 및 메타줄 스킵' },
        { input: [[': ping', 'data: Ready']], expected: 'Ready', name: 'Heartbeat 주석 무시' }
      ]
    },
    {
      id: 'py_refactor_pipeline',
      title: '레거시 루프 → 순수 함수 파이프라인 리팩터링',
      tier: 2,
      level: 'intermediate',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: '필터링·정규화·정렬이 한 루프에 뒤섞인 레거시 코드를 순수 단계(Filter -> Transform) 컴프리헨션 파이프라인으로 리팩터링합니다.',
      refactoringGoal: '원본 리스트를 mutate(수정)하며 처리하던 레거시 코드를 불변 순수 파이프라인으로 분리하세요.',
      refactoringBefore: `def summarize_scores(records):
    out = []
    for i in range(len(records)):
        if records[i]['score'] >= 60:
            records[i]['name'] = records[i]['name'].strip().upper()
            out.append(records[i]['name'])
    return sorted(out)`,
      explanation: {
        summary: '입력 딕셔너리를 직접 변경(Mutation)하던 스파게티 루프를 불변 변환 단계로 분리하여 부수효과 없는 선언적 파이프라인을 만듭니다.',
        keyConcepts: ['Pure Pipeline (불변 변환)', 'Side-Effect 제거', 'Comprehension 체이닝', 'sorted 반환'],
        lineByLine: [
          { line: 1, code: 'def passed_names_pipeline(records: list[dict]) -> list[str]:', explain: 'name과 score 키를 가진 딕셔너리 리스트를 입력받습니다.' },
          { line: 2, code: "    passed = [r for r in records if r.get('score', 0) >= 60]", explain: '1단계 Filter: 60점 이상인 합격 레코드만 원본 변형 없이 추려냅니다.' },
          { line: 3, code: "    normalized = [r['name'].strip().upper() for r in passed]", explain: '2단계 Normalize: 공백 제거 및 대문자 정규화를 적용한 새 리스트를 만듭니다.' },
          { line: 4, code: '    return sorted(normalized)', explain: '3단계 Sort: 알파벳 오름차순으로 정렬된 불변 결과 리스트를 반환합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: '필터링/정규화 O(N) 후 정렬에 O(N log N)이 소요됩니다.', space: 'O(N)', spaceWhy: '합격자 수만큼 새 리스트를 할당합니다.' },
        pitfalls: ['> 60과 >= 60처럼 커트라인 등호 누락은 실무 리팩터링에서 가장 흔한 회귀 버그입니다.']
      },
      audit: {
        bugSummary: 'AI가 합격 기준 경계를 >= 60 대신 > 60으로 리팩터링해 딱 60점을 받은 지원자가 탈락합니다.',
        checklist: ['경계값 60점(>= 60) 포함 확인', '이름 strip().upper() 및 정렬 검증'],
        focusLine: 2,
        buggyCode: `def passed_names_pipeline(records: list[dict]) -> list[str]:
    passed = [r for r in records if r.get('score', 0) > 60]
    normalized = [r['name'].strip().upper() for r in passed]
    return sorted(normalized)`
      },
      entryPoint: 'passed_names_pipeline',
      code: `def passed_names_pipeline(records: list[dict]) -> list[str]:
    passed = [r for r in records if r.get('score', 0) >= 60]
    normalized = [r['name'].strip().upper() for r in passed]
    return sorted(normalized)`,
      skeleton: `def passed_names_pipeline(records: list[dict]) -> list[str]:
    passed = [r for r in records if ____]
    normalized = [____ for r in passed]
    return sorted(normalized)`,
      tests: [
        { input: [[{ name: ' kim ', score: 60 }, { name: 'lee', score: 59 }, { name: ' park', score: 85 }]], expected: ['KIM', 'PARK'], name: '60점 경계 통과 및 정규화 정렬' },
        { input: [[{ name: 'a', score: 10 }]], expected: [], name: '합격자 없음' }
      ]
    },
    {
      id: 'py_cosine_similarity_topk',
      title: 'RAG 벡터 코사인 유사도 & Top-K 검색기',
      tier: 3,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(M * D + M log M)', space: 'O(M)' },
      description: '외부 벡터 DB 없이 pure Python으로 코사인 유사도를 계산하여 질의 임베딩과 가장 가까운 상위 K개 문서 ID를 검색합니다.',
      explanation: {
        summary: 'RAG 검색 엔진의 수학적 핵심인 코사인 유사도(내적 / 벡터 노름 곱)를 계산하고 영벡터(0 나눗셈)를 방어하여 Top-K 문서를 추출합니다.',
        keyConcepts: ['Cosine Similarity', 'Dot Product (zip)', 'Zero-Norm 방어', 'Top-K Ranking'],
        lineByLine: [
          { line: 1, code: 'def search_top_k(query: list[float], docs: list[dict], k: int) -> list[str]:', explain: '질의 벡터, {id, vec} 문서 리스트, 상위 개수 k를 입력받습니다.' },
          { line: 2, code: '    def cosine(a, b):', explain: '두 벡터 간 코사인 유사도를 계산하는 내부 헬퍼를 정의합니다.' },
          { line: 3, code: '        dot = sum(x * y for x, y in zip(a, b))', explain: '두 벡터의 대응 원소 곱을 합산해 내적을 구합니다.' },
          { line: 4, code: '        na = sum(x * x for x in a) ** 0.5', explain: '질의 벡터의 L2 노름(크기)을 구합니다.' },
          { line: 5, code: '        nb = sum(y * y for y in b) ** 0.5', explain: '문서 벡터의 L2 노름을 구합니다.' },
          { line: 6, code: '        return dot / (na * nb) if (na * nb) > 0 else 0.0', explain: '영벡터 입력 시 ZeroDivisionError를 막고 0.0을 반환합니다.' },
          { line: 7, code: "    scored = [(cosine(query, d['vec']), d['id']) for d in docs]", explain: '모든 문서의 (유사도, ID) 튜플 리스트를 생성합니다.' },
          { line: 8, code: '    scored.sort(key=lambda item: item[0], reverse=True)', explain: '유사도 내림차순으로 정렬합니다.' },
          { line: 9, code: '    return [doc_id for _, doc_id in scored[:k]]', explain: '가장 유사한 상위 k개 문서 ID만 추출해 반환합니다.' }
        ],
        complexity: { time: 'O(M * D + M log M)', timeWhy: 'D차원 벡터 M개에 대해 내적·정규화 후 정렬합니다.', space: 'O(M)', spaceWhy: 'M개 문서의 스코어 리스트를 유지합니다.' },
        pitfalls: ['영벡터(all zero vector)가 들어오면 분모 na * nb == 0이 되어 예외가 터지므로 반드시 가드가 필요합니다.']
      },
      audit: {
        bugSummary: 'AI가 scored.sort에서 reverse=True를 누락해 가장 관련성이 낮은 문서부터 먼저 반환합니다.',
        checklist: ['내림차순 정렬(reverse=True) 확인', '영벡터 분모 0 방어 확인'],
        focusLine: 8,
        buggyCode: `def search_top_k(query: list[float], docs: list[dict], k: int) -> list[str]:
    def cosine(a, b):
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        return dot / (na * nb) if (na * nb) > 0 else 0.0
    scored = [(cosine(query, d['vec']), d['id']) for d in docs]
    scored.sort(key=lambda item: item[0])
    return [doc_id for _, doc_id in scored[:k]]`
      },
      entryPoint: 'search_top_k',
      code: `def search_top_k(query: list[float], docs: list[dict], k: int) -> list[str]:
    def cosine(a, b):
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        return dot / (na * nb) if (na * nb) > 0 else 0.0
    scored = [(cosine(query, d['vec']), d['id']) for d in docs]
    scored.sort(key=lambda item: item[0], reverse=True)
    return [doc_id for _, doc_id in scored[:k]]`,
      skeleton: `def search_top_k(query: list[float], docs: list[dict], k: int) -> list[str]:
    def cosine(a, b):
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        return ____ if (na * nb) > 0 else 0.0
    scored = [(cosine(query, d['vec']), d['id']) for d in docs]
    scored.sort(key=lambda item: item[0], ____)
    return [doc_id for _, doc_id in scored[:k]]`,
      tests: [
        { input: [[1, 0], [{ id: 'd1', vec: [0, 1] }, { id: 'd2', vec: [0.9, 0.1] }, { id: 'd3', vec: [1, 1] }], 2], expected: ['d2', 'd3'], name: '유사도 Top-2 랭킹 검색' },
        { input: [[0, 0], [{ id: 'd1', vec: [1, 2] }], 1], expected: ['d1'], name: '영벡터 0 나눗셈 안전 처리' }
      ]
    },
    {
      id: 'py_adr_cache_aside',
      title: 'ADR 설계: Cache-Aside & Negative Cache 방어',
      tier: 4,
      level: 'advanced',
      track: 'system_design',
      category: 'System Design',
      complexity: { time: 'O(Q)', space: 'O(K)' },
      description: '존재하지 않는 키가 반복 조회되어 DB로 트래픽이 뚫리는 Cache Penetration을 막기 위해 Null Sentinel(Negative Cache) 전략을 구현합니다.',
      adr: {
        scenario: '악의적 봇이 존재하지 않는 상품 ID(`/items/-999`)를 초당 5,000건씩 조회하여, 매번 캐시 미스(Cache Miss)가 발생하고 DB CPU가 100%에 도달했습니다.',
        prompt: 'DB를 보호하는 가장 효과적인 캐시 설계 패턴은?',
        options: [
          { id: 'hit_only', label: 'A. DB에서 값이 None이 아닐 때만 캐시에 저장', recommended: false, critique: '존재하지 않는 키는 영원히 캐시에 적재되지 않으므로 5,000req/s가 그대로 DB를 강타합니다(Cache Penetration).' },
          { id: 'negative', label: 'B. Cache-Aside + 미존재 키도 _NULL 마커로 짧게 캐싱(Negative Cache)', recommended: true, critique: '정확합니다! 미존재 키 조회 시 마커를 캐시하여 두 번째 요청부터는 DB 조회 없이 캐시 계층에서 O(1)로 차단합니다.' }
        ]
      },
      explanation: {
        summary: 'Cache-Aside 패턴에서 미존재 데이터까지 센티넬(_NULL)로 캐싱해 DB 쿼리 횟수(db_hits)를 최소화하는 실무 방어 패턴입니다.',
        keyConcepts: ['Cache-Aside Pattern', 'Cache Penetration 방어', 'Negative Cache (_NULL Sentinel)', 'DB 부하 격리'],
        lineByLine: [
          { line: 1, code: 'def simulate_cache_aside(queries: list[str], db: dict) -> dict:', explain: '조회 키 순서 queries와 원본 DB 딕셔너리를 입력받습니다.' },
          { line: 2, code: '    cache = {}', explain: '메모리 캐시 저장소를 초기화합니다.' },
          { line: 3, code: '    db_hits = 0', explain: '실제 DB가 호출된 횟수를 집계합니다.' },
          { line: 4, code: '    results = []', explain: '각 조회에 대한 응답 결과 리스트를 준비합니다.' },
          { line: 5, code: '    for key in queries:', explain: '유입된 조회 트래픽을 순서대로 처리합니다.' },
          { line: 6, code: '        if key in cache:', explain: '캐시 히트 시(Negative Cache _NULL 마커 포함)' },
          { line: 7, code: "            val = cache[key]", explain: 'DB를 건드리지 않고 캐시 값을 꺼냅니다.' },
          { line: 8, code: "            results.append(None if val == '__NULL__' else val)", explain: '센티넬 마커면 None으로, 아니면 실제 값으로 복원해 응답합니다.' },
          { line: 9, code: '            continue', explain: '다음 쿼리로 넘어갑니다.' },
          { line: 10, code: '        db_hits += 1', explain: '캐시 미스일 때만 실제 DB를 1회 조회합니다.' },
          { line: 11, code: '        val = db.get(key)', explain: 'DB에서 키 존재 여부를 조회합니다.' },
          { line: 12, code: "        cache[key] = '__NULL__' if val is None else val", explain: '값이 None이어도 __NULL__ 마커로 캐싱해 재관통을 막습니다.' },
          { line: 13, code: '        results.append(val)', explain: '조회 결과를 응답 목록에 담습니다.' },
          { line: 14, code: "    return {'db_hits': db_hits, 'results': results}", explain: '총 DB 호출 수와 응답 리스트를 반환합니다.' }
        ],
        complexity: { time: 'O(Q)', timeWhy: '쿼리 Q개를 각각 O(1) 캐시 해시 조회로 처리합니다.', space: 'O(K)', spaceWhy: '고유 조회 키 K개만 캐시에 저장합니다.' },
        pitfalls: ['캐시 값이 진짜 None일 때 단순히 cache.get(key) is None으로 체크하면 캐시에 있는지 없는지 구분하지 못해 계속 DB를 찌르게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 val is None일 때 cache에 저장하지 않아 없는 키가 들어올 때마다 DB가 반복 호출됩니다(db_hits 폭증).',
        checklist: ['val is None일 때도 __NULL__ 마커 캐시 적재 확인', 'in cache 검사로 히트 여부 판별'],
        focusLine: 12,
        buggyCode: `def simulate_cache_aside(queries: list[str], db: dict) -> dict:
    cache = {}
    db_hits = 0
    results = []
    for key in queries:
        if key in cache:
            val = cache[key]
            results.append(None if val == '__NULL__' else val)
            continue
        db_hits += 1
        val = db.get(key)
        if val is not None:
            cache[key] = val
        results.append(val)
    return {'db_hits': db_hits, 'results': results}`
      },
      entryPoint: 'simulate_cache_aside',
      code: `def simulate_cache_aside(queries: list[str], db: dict) -> dict:
    cache = {}
    db_hits = 0
    results = []
    for key in queries:
        if key in cache:
            val = cache[key]
            results.append(None if val == '__NULL__' else val)
            continue
        db_hits += 1
        val = db.get(key)
        cache[key] = '__NULL__' if val is None else val
        results.append(val)
    return {'db_hits': db_hits, 'results': results}`,
      skeleton: `def simulate_cache_aside(queries: list[str], db: dict) -> dict:
    cache = {}
    db_hits = 0
    results = []
    for key in queries:
        if key in cache:
            val = cache[key]
            results.append(None if val == '__NULL__' else val)
            continue
        db_hits += 1
        val = db.get(key)
        cache[key] = ____
        results.append(val)
    return {'db_hits': db_hits, 'results': results}`,
      tests: [
        { input: [['u1', 'missing', 'missing', 'missing', 'u1'], { u1: 'Kim' }], expected: { db_hits: 2, results: ['Kim', null, null, null, 'Kim'] }, name: 'Negative Cache로 미존재 키 3회 공격 시 DB 1회만 조회' }
      ]
    },
    {
      id: 'py_prompt_template_safe',
      title: 'AI 프롬프트 안전 변수 치환기 ({{var}})',
      tier: 1,
      level: 'beginner',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '파이썬 정규식 치환(re.sub)을 이용해 템플릿의 {{var}} 플레이스홀더만 안전하게 렌더링하고 미정의 키나 중괄호 문법은 보존합니다.',
      explanation: {
        summary: '사용자 입력이나 JSON 예시가 섞인 AI 프롬프트에 str.format()을 쓰면 중괄호 충돌·KeyError가 발생합니다. re.sub 콜백으로 {{word}} 토큰만 안전하게 치환합니다.',
        keyConcepts: ['Safe Prompt Templating', 're.sub 콜백 치환', '미정의 키 보존 방어', 'Format Injection 방지'],
        lineByLine: [
          { line: 1, code: 'import re', explain: '정규표현식 모듈 re를 불러옵니다.' },
          { line: 3, code: 'def render_prompt(template: str, values: dict) -> str:', explain: '프롬프트 템플릿 문자열과 치환 변수 딕셔너리를 받습니다.' },
          { line: 4, code: '    def replace(match):', explain: '매칭된 {{key}} 패턴마다 호출되는 치환 콜백입니다.' },
          { line: 5, code: '        key = match.group(1)', explain: '첫 번째 캡처 그룹에서 변수 이름을 추출합니다.' },
          { line: 6, code: '        return str(values[key]) if key in values else match.group(0)', explain: '키가 존재하면 문자열로 치환하고 없으면 원본 플레이스홀더를 유지합니다.' },
          { line: 7, code: "    return re.sub(r'\\{\\{(\\w+)\\}\\}', replace, template)", explain: '이중 중괄호 토큰만 탐지해 치환 결과를 반환합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '템플릿 길이 N을 1회 정규식 스캔하며 치환합니다.', space: 'O(N)', spaceWhy: '치환된 완성 프롬프트 문자열 크기만큼 사용합니다.' },
        pitfalls: ['key in values 검사 없이 values[key]로 바로 접근하면 선택 변수가 빠졌을 때 KeyError로 에이전트 파이프라인이 중단됩니다.']
      },
      audit: {
        bugSummary: 'AI가 키 존재 검사(if key in values)를 생략해 미전달 변수 {{tone}} 처리 중 KeyError가 발생합니다.',
        checklist: ['key in values 존재 여부 확인 후 원본 보존', 'str(values[key]) 타입 변환 확인'],
        focusLine: 6,
        buggyCode: `import re

def render_prompt(template: str, values: dict) -> str:
    def replace(match):
        key = match.group(1)
        return str(values[key])
    return re.sub(r'\\{\\{(\\w+)\\}\\}', replace, template)`
      },
      entryPoint: 'render_prompt',
      code: `import re

def render_prompt(template: str, values: dict) -> str:
    def replace(match):
        key = match.group(1)
        return str(values[key]) if key in values else match.group(0)
    return re.sub(r'\\{\\{(\\w+)\\}\\}', replace, template)`,
      skeleton: `import re

def render_prompt(template: str, values: dict) -> str:
    def replace(match):
        key = match.group(1)
        return ____ if key in values else ____
    return re.sub(r'\\{\\{(\\w+)\\}\\}', replace, template)`,
      tests: [
        { input: ['안녕 {{user}}, 한도 {{top_k}}개 {{tone}}', { user: 'Kim', top_k: 5 }], expected: '안녕 Kim, 한도 5개 {{tone}}', name: '정수 변환 및 미정의 키 보존' },
        { input: ['JSON {a:1} for {{role}}', { role: 'admin' }], expected: 'JSON {a:1} for admin', name: '일반 중괄호 JSON 충돌 방지' }
      ]
    },
    {
      id: 'py_refactor_guard_extract',
      title: '중첩 결제 분기 → Guard + 단계 분리 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '복잡한 중첩 VIP 할인·쿠폰·무료배송 조건문을 조기 반환(Guard)과 명확한 3단계 순수 계산으로 리팩터링합니다.',
      refactoringGoal: 'if/else가 얽혀 배송비 조건과 음수 하한을 놓치기 쉬운 레거시 결제 로직을 단계별 변수로 평탄화하세요.',
      refactoringBefore: `def calc_checkout_total(subtotal: int, is_vip: bool, coupon: int) -> int:
    if subtotal > 0:
        if is_vip:
            total = subtotal * 9 // 10 - max(0, coupon)
            return max(0, total)
        else:
            total = max(0, subtotal - max(0, coupon))
            if total >= 30000: return total
            else: return total + 3000
    else:
        return 0`,
      explanation: {
        summary: '비정상 주문(0원 이하)을 맨 위에서 즉시 차단한 뒤 할인 → 쿠폰 → 배송비를 일직선 파이프라인으로 계산해 경계 버그를 없앱니다.',
        keyConcepts: ['Guard Clause (조기 차단)', '선형 파이프라인 계산', '경계값 (>= 30000)', '정수 나눗셈 (//)'],
        lineByLine: [
          { line: 1, code: 'def calc_checkout_total(subtotal: int, is_vip: bool, coupon: int) -> int:', explain: '상품 소계, VIP 여부, 쿠폰 금액을 입력받습니다.' },
          { line: 2, code: '    if subtotal <= 0:', explain: '0 이하의 비정상 주문 소계를 진입 즉시 차단하는 Guard 절입니다.' },
          { line: 3, code: '        return 0', explain: '무효 주문에 대해 0원을 즉시 반환합니다.' },
          { line: 4, code: '    discounted = (subtotal * 9 // 10) if is_vip else subtotal', explain: '1단계: VIP 고객에게 부동소수 오차 없이 10% 할인을 적용합니다.' },
          { line: 5, code: '    after_coupon = max(0, discounted - max(0, coupon))', explain: '2단계: 쿠폰을 차감하되 최종 상품 금액이 0원 미만이 되지 않게 보호합니다.' },
          { line: 6, code: '    shipping = 0 if (is_vip or after_coupon >= 30000) else 3000', explain: '3단계: VIP이거나 실결제액 30,000원 이상이면 무료배송을 적용합니다.' },
          { line: 7, code: '    return after_coupon + shipping', explain: '상품 결제액과 배송비를 합산해 최종 청구 금액을 반환합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '고정된 상수 시간 산술 및 조건 연산만 수행합니다.', space: 'O(1)', spaceWhy: '단순 지역 변수 3개만 사용합니다.' },
        pitfalls: ['subtotal * 0.9 같은 부동소수점은 값에 따라 1원 반올림 오차가 날 수 있고, shipping 기준에서 >= 대신 > 를 쓰면 정확히 30,000원 고객에게 배송비가 부과됩니다.']
      },
      audit: {
        bugSummary: 'AI가 무료배송 경계 조건을 after_coupon > 30000으로 작성해 딱 30,000원 주문 시 배송비 3,000원이 잘못 청구됩니다.',
        checklist: ['무료배송 경계 등호(after_coupon >= 30000) 확인', 'subtotal <= 0 가드 및 0원 하한 방어 확인'],
        focusLine: 6,
        buggyCode: `def calc_checkout_total(subtotal: int, is_vip: bool, coupon: int) -> int:
    if subtotal <= 0:
        return 0
    discounted = (subtotal * 9 // 10) if is_vip else subtotal
    after_coupon = max(0, discounted - max(0, coupon))
    shipping = 0 if (is_vip or after_coupon > 30000) else 3000
    return after_coupon + shipping`
      },
      entryPoint: 'calc_checkout_total',
      code: `def calc_checkout_total(subtotal: int, is_vip: bool, coupon: int) -> int:
    if subtotal <= 0:
        return 0
    discounted = (subtotal * 9 // 10) if is_vip else subtotal
    after_coupon = max(0, discounted - max(0, coupon))
    shipping = 0 if (is_vip or after_coupon >= 30000) else 3000
    return after_coupon + shipping`,
      skeleton: `def calc_checkout_total(subtotal: int, is_vip: bool, coupon: int) -> int:
    if subtotal <= 0:
        return 0
    discounted = (subtotal * 9 // 10) if is_vip else subtotal
    after_coupon = ____
    shipping = 0 if (____) else 3000
    return after_coupon + shipping`,
      tests: [
        { input: [20000, true, 1000], expected: 17000, name: 'VIP 10% 할인 + 무료배송' },
        { input: [35000, false, 5000], expected: 30000, name: '정확히 30,000원 무료배송 경계' },
        { input: [25000, false, 0], expected: 28000, name: '3만원 미만 배송비 3,000원 부과' },
        { input: [0, true, 1000], expected: 0, name: '0원 이하 주문 조기 차단' }
      ]
    },
    {
      id: 'py_heapq_task_scheduler',
      title: 'heapq 최소 힙 우선순위 작업 스케줄러',
      tier: 2,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: '파이썬 표준 라이브러리 heapq 최소 힙을 이용해 (우선순위 숫자, 작업명) 작업 중 가장 급한 상위 K개 작업을 O(N + K log N)에 추출합니다.',
      explanation: {
        summary: '우선순위 숫자가 작을수록 먼저 처리되는 최소 힙(Min-Heap)에 튜플 (priority, name)을 push/pop하여 상위 K개 작업을 꺼냅니다.',
        keyConcepts: ['collections heapq (Min-Heap)', '튜플 사전식 우선순위 비교', 'O(log N) heappush/heappop', '상위 K개 경계 추출'],
        lineByLine: [
          { line: 1, code: 'import heapq', explain: '이진 최소 힙 알고리즘 표준 모듈 heapq를 불러옵니다.' },
          { line: 3, code: 'def pick_top_tasks(tasks: list[list], k: int) -> list[str]:', explain: '[우선순위, 작업명] 목록과 추출 개수 k를 받습니다.' },
          { line: 4, code: '    heap = []', explain: '최소 힙으로 관리할 빈 리스트를 준비합니다.' },
          { line: 5, code: '    for priority, name in tasks:', explain: '입력 작업 쌍을 순회하며 언패킹합니다.' },
          { line: 6, code: '        heapq.heappush(heap, (priority, name))', explain: '우선순위(1순위) · 작업명 알파벳(2순위) 튜플로 힙에 삽입합니다.' },
          { line: 7, code: '    picked = []', explain: '선별된 작업 이름을 담을 결과 리스트입니다.' },
          { line: 8, code: '    while heap and len(picked) < k:', explain: '힙이 비지 않았고 아직 k개를 채우지 않았을 동안만 반복합니다.' },
          { line: 9, code: '        _, name = heapq.heappop(heap)', explain: '가장 우선순위가 높은 최소 튜플을 O(log N)에 꺼냅니다.' },
          { line: 10, code: '        picked.append(name)', explain: '작업 이름만 결과 목록에 추가합니다.' },
          { line: 11, code: '    return picked', explain: '우선순위 순으로 선별된 최대 k개 작업 리스트를 반환합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: 'N개 삽입 후 k개를 pop할 때마다 O(log N) 비용이 듭니다.', space: 'O(N)', spaceWhy: 'N개 작업 튜플을 힙 리스트에 보관합니다.' },
        pitfalls: ['while 루프 조건에 len(picked) < k 제한을 빠뜨리면 전체 작업이 모두 반환되어 상위 K 스케줄러의 의미가 사라집니다.']
      },
      audit: {
        bugSummary: 'AI가 while heap 조건에서 len(picked) < k 개수 제한을 빠뜨려 k=2여도 모든 작업을 전부 반환합니다.',
        checklist: ['while heap and len(picked) < k 조건 확인', '튜플 (priority, name) 동점 타이브레이킹 확인'],
        focusLine: 8,
        buggyCode: `import heapq

def pick_top_tasks(tasks: list[list], k: int) -> list[str]:
    heap = []
    for priority, name in tasks:
        heapq.heappush(heap, (priority, name))
    picked = []
    while heap:
        _, name = heapq.heappop(heap)
        picked.append(name)
    return picked`
      },
      entryPoint: 'pick_top_tasks',
      code: `import heapq

def pick_top_tasks(tasks: list[list], k: int) -> list[str]:
    heap = []
    for priority, name in tasks:
        heapq.heappush(heap, (priority, name))
    picked = []
    while heap and len(picked) < k:
        _, name = heapq.heappop(heap)
        picked.append(name)
    return picked`,
      skeleton: `import heapq

def pick_top_tasks(tasks: list[list], k: int) -> list[str]:
    heap = []
    for priority, name in tasks:
        heapq.heappush(heap, ____)
    picked = []
    while heap and ____:
        _, name = heapq.heappop(heap)
        picked.append(name)
    return picked`,
      tests: [
        { input: [[[3, 'logs'], [1, 'billing'], [1, 'auth'], [2, 'mail']], 2], expected: ['auth', 'billing'], name: '우선순위 1 동점 시 알파벳 순 Top-2' },
        { input: [[[2, 'job_b'], [1, 'job_a']], 5], expected: ['job_a', 'job_b'], name: 'k가 작업 수보다 클 때 전체 안전 반환' },
        { input: [[[1, 'urgent']], 0], expected: [], name: 'k=0 요청 시 빈 리스트' }
      ]
    },
    {
      id: 'py_graph_bfs_shortest',
      title: '그래프 너비 우선 탐색(BFS) 최단 경로',
      tier: 3,
      level: 'intermediate',
      track: 'algorithm',
      category: 'Algorithm',
      complexity: { time: 'O(V + E)', space: 'O(V)' },
      description: '가중치 없는 방향 그래프에서 collections.deque를 사용한 BFS로 시작 노드에서 목표 노드까지의 최소 홉(Hop) 거리를 구합니다.',
      explanation: {
        summary: '시작점에서 가까운 거리 순서(레벨별)로 탐색하는 BFS를 deque + visited 집합으로 구현하여 순환 그래프에서도 무한 루프 없이 최단 홉을 찾습니다.',
        keyConcepts: ['Breadth-First Search (BFS)', 'collections.deque popleft()', 'visited 사이클 방어', '최단 거리 (O(V + E))'],
        lineByLine: [
          { line: 1, code: 'from collections import deque', explain: '선입선출(FIFO) 큐를 O(1)로 처리하기 위해 deque를 불러옵니다.' },
          { line: 3, code: 'def shortest_path_steps(graph: dict, start: str, target: str) -> int:', explain: '인접 리스트 그래프, 시작 노드, 목표 노드를 받습니다.' },
          { line: 4, code: '    if start == target:', explain: '시작점과 목표점이 이미 같다면 이동이 필요 없으므로' },
          { line: 5, code: '        return 0', explain: '최단 거리 0을 즉시 반환합니다.' },
          { line: 6, code: '    q = deque([(start, 0)])', explain: '(현재 노드, 누적 거리) 쌍을 큐에 넣고 탐색을 시작합니다.' },
          { line: 7, code: '    visited = {start}', explain: '사이클(순환) 그래프에서 재방문을 막기 위해 시작 노드를 방문 처리합니다.' },
          { line: 8, code: '    while q:', explain: '탐색할 노드가 남아있는 동안 레벨 순서대로 꺼냅니다.' },
          { line: 9, code: '        node, dist = q.popleft()', explain: '큐 맨 앞에서 가장 가까운 노드를 O(1)로 꺼냅니다.' },
          { line: 10, code: '        for nxt in graph.get(node, []):', explain: '현재 노드에서 이동 가능한 인접 노드들을 확인합니다.' },
          { line: 11, code: '            if nxt == target:', explain: '목표 노드를 처음 발견하는 순간이 곧 최단 거리이므로' },
          { line: 12, code: '                return dist + 1', explain: 'dist + 1을 즉시 반환해 탐색을 종료합니다.' },
          { line: 13, code: '            if nxt not in visited:', explain: '아직 방문하지 않은 노드라면' },
          { line: 14, code: '                visited.add(nxt)', explain: '중복 큐 삽입을 막기 위해 큐에 넣기 직전 방문 표시합니다.' },
          { line: 15, code: '                q.append((nxt, dist + 1))', explain: '다음 거리(dist + 1)와 함께 큐 맨 뒤에 등록합니다.' },
          { line: 16, code: '    return -1', explain: '큐가 빌 때까지 목표에 도달하지 못하면 경로 없음을 뜻하는 -1을 반환합니다.' }
        ],
        complexity: { time: 'O(V + E)', timeWhy: '모든 정점 V와 간선 E를 최대 한 번씩만 확인합니다.', space: 'O(V)', spaceWhy: 'visited 집합과 큐에 최대 정점 수 V만큼 저장됩니다.' },
        pitfalls: ['q.popleft() 대신 q.pop()을 쓰면 스택(DFS)으로 바뀌어 최단 경로가 아닌 우회 경로 거리를 반환하게 됩니다.']
      },
      audit: {
        bugSummary: 'AI가 q.popleft() 대신 q.pop()을 사용해 너비 우선(BFS)이 아니라 깊이 우선(DFS)으로 동작하며 긴 우회 거리를 반환합니다.',
        checklist: ['FIFO 큐 꺼내기(q.popleft()) 확인', 'start == target 및 도달 불가(-1) 경계 확인'],
        focusLine: 9,
        buggyCode: `from collections import deque

def shortest_path_steps(graph: dict, start: str, target: str) -> int:
    if start == target:
        return 0
    q = deque([(start, 0)])
    visited = {start}
    while q:
        node, dist = q.pop()
        for nxt in graph.get(node, []):
            if nxt == target:
                return dist + 1
            if nxt not in visited:
                visited.add(nxt)
                q.append((nxt, dist + 1))
    return -1`
      },
      entryPoint: 'shortest_path_steps',
      code: `from collections import deque

def shortest_path_steps(graph: dict, start: str, target: str) -> int:
    if start == target:
        return 0
    q = deque([(start, 0)])
    visited = {start}
    while q:
        node, dist = q.popleft()
        for nxt in graph.get(node, []):
            if nxt == target:
                return dist + 1
            if nxt not in visited:
                visited.add(nxt)
                q.append((nxt, dist + 1))
    return -1`,
      skeleton: `from collections import deque

def shortest_path_steps(graph: dict, start: str, target: str) -> int:
    if start == target:
        return 0
    q = deque([(start, 0)])
    visited = {start}
    while q:
        node, dist = ____
        for nxt in graph.get(node, []):
            if nxt == target:
                return dist + 1
            if ____ not in visited:
                visited.add(nxt)
                q.append((nxt, dist + 1))
    return -1`,
      tests: [
        { input: [{ A: ['C', 'B'], C: ['Z'], B: ['D'], D: ['E'], E: ['Z'], Z: [] }, 'A', 'Z'], expected: 2, name: '다중 경로 중 최단 홉 (A->C->Z = 2)' },
        { input: [{ A: ['B'], B: ['A'] }, 'A', 'Z'], expected: -1, name: '순환 그래프에서 도달 불가(-1)' },
        { input: [{ A: ['B'] }, 'A', 'A'], expected: 0, name: '시작과 목표 동일(0)' }
      ]
    },
    {
      id: 'py_rag_rrf_hybrid_rank',
      title: 'RAG 하이브리드 검색 RRF 순위 융합',
      tier: 4,
      level: 'advanced',
      track: 'ai',
      category: 'AI Engineering',
      complexity: { time: 'O(N log N)', space: 'O(N)' },
      description: '키워드(BM25) 검색과 의미 벡터(Vector) 검색 결과를 Reciprocal Rank Fusion(RRF = 1 / (k + rank)) 점수로 융합해 최적 Top-N 문서를 선별합니다.',
      adr: {
        scenario: '고유 코드명/에러코드에는 BM25가 강하고, 자연어 의도 검색에는 Vector 검색이 강해 단일 검색기로는 정확도가 떨어집니다.',
        prompt: '서로 점수 척도(Scale)가 다른 두 검색기 결과를 가장 안정적으로 결합하는 실무 RAG 기법은?',
        options: [
          { id: 'raw', label: 'A. 정규화 없이 BM25 점수(0~30)와 Cosine 유사도(0~1)를 그대로 덧셈', recommended: false, critique: '점수 척도 차이로 인해 BM25 점수가 벡터 순위를 완전히 압도해 버립니다.' },
          { id: 'rrf', label: 'B. 순위 역수(1 / (k + rank))만 합산하는 Reciprocal Rank Fusion (RRF)', recommended: true, critique: '정확합니다! 원 점수의 스케일 차이 없이 순위 기반 합의(Consensus)로 두 검색기 상위권 문서를 안정적으로 끌어올립니다.' }
        ]
      },
      explanation: {
        summary: '각 검색 리스트의 1-based 순위(rank)를 이용해 1.0 / (k + rank) 점수를 누적한 뒤, 점수 내림차순 · ID 오름차순으로 정렬해 Top-N 문서를 추출합니다.',
        keyConcepts: ['Hybrid Search (BM25 + Dense)', 'Reciprocal Rank Fusion (RRF)', 'enumerate(..., start=1)', '결정적 타이브레이킹 (-score, id)'],
        lineByLine: [
          { line: 1, code: 'def rrf_fuse(bm25_ids: list[str], vec_ids: list[str], k: int, top_n: int) -> list[str]:', explain: 'BM25 순위 목록, 벡터 순위 목록, 완화 상수 k, 상위 개수 top_n을 받습니다.' },
          { line: 2, code: '    scores = {}', explain: '문서 ID별 RRF 누적 점수를 저장할 딕셔너리입니다.' },
          { line: 3, code: '    for rank, doc_id in enumerate(bm25_ids, start=1):', explain: '키워드 검색 결과에 1등부터 순위를 매겨 순회합니다.' },
          { line: 4, code: '        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)', explain: 'BM25 순위에 해당하는 RRF 점수 1/(k+rank)를 더합니다.' },
          { line: 5, code: '    for rank, doc_id in enumerate(vec_ids, start=1):', explain: '벡터 검색 결과에도 1등부터 순위를 매겨 순회합니다.' },
          { line: 6, code: '        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)', explain: '양쪽 모두에 등장한 합의 문서는 두 검색기 점수가 합산되어 크게 상승합니다.' },
          { line: 7, code: '    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))', explain: '점수 높은 순(-item[1]), 동점이면 문서 ID 오름차순(item[0])으로 결정적 정렬합니다.' },
          { line: 8, code: '    return [doc_id for doc_id, _ in ranked[:top_n]]', explain: '최종 상위 top_n개 문서 ID만 추출해 반환합니다.' }
        ],
        complexity: { time: 'O(N log N)', timeWhy: '문서 합산 O(N) 후 고유 문서 정렬 O(N log N)이 소요됩니다.', space: 'O(N)', spaceWhy: '합집합 문서 점수 딕셔너리를 유지합니다.' },
        pitfalls: ['sorted에서 -item[1] 대신 양수 item[1]을 키로 주면 가장 관련 없는 최하위 문서가 Top-1으로 올라옵니다.']
      },
      audit: {
        bugSummary: 'AI가 sorted 키에 음수 부호(-item[1])를 빠져 오름차순으로 정렬해 최하위 점수의 문서가 먼저 반환됩니다.',
        checklist: ['점수 내림차순(-item[1], item[0]) 정렬 확인', '1-based 순위(start=1) 계산 확인'],
        focusLine: 7,
        buggyCode: `def rrf_fuse(bm25_ids: list[str], vec_ids: list[str], k: int, top_n: int) -> list[str]:
    scores = {}
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(vec_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    ranked = sorted(scores.items(), key=lambda item: (item[1], item[0]))
    return [doc_id for doc_id, _ in ranked[:top_n]]`
      },
      entryPoint: 'rrf_fuse',
      code: `def rrf_fuse(bm25_ids: list[str], vec_ids: list[str], k: int, top_n: int) -> list[str]:
    scores = {}
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    for rank, doc_id in enumerate(vec_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [doc_id for doc_id, _ in ranked[:top_n]]`,
      skeleton: `def rrf_fuse(bm25_ids: list[str], vec_ids: list[str], k: int, top_n: int) -> list[str]:
    scores = {}
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + ____
    for rank, doc_id in enumerate(vec_ids, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    ranked = sorted(scores.items(), key=lambda item: (____, item[0]))
    return [doc_id for doc_id, _ in ranked[:top_n]]`,
      tests: [
        { input: [['d2', 'd1'], ['d3', 'd2'], 60, 2], expected: ['d2', 'd3'], name: '양쪽 등장 합의 문서(d2) 1위 승격' },
        { input: [['b'], ['a'], 60, 2], expected: ['a', 'b'], name: '동점 시 ID 알파벳 결정적 타이브레이킹' },
        { input: [[], [], 60, 3], expected: [], name: '빈 검색 결과 안전 처리' }
      ]
    }
  );

  // =========================================================================
  // 4. C99 신규 확장 커리큘럼 (데이터 주도 테이블 리팩터링 & FSM 상태 머신)
  // =========================================================================
  curr.c.push(
    {
      id: 'c_refactor_lookup_table',
      title: '중첩 분기 → 룩업 테이블(Data-Driven) 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '복잡한 점수 구간 if-else 분기를 임계치 테이블(min_scores[], grades[]) 순회 구조로 리팩터링합니다.',
      refactoringGoal: '점수 기준이 바뀔 때마다 수많은 if-else 문을 수정하는 대신, 데이터 테이블 배열만 바꾸면 되는 구조로 정리하세요.',
      refactoringBefore: `int grade_code(int score) {
    if (score >= 90) return 4;
    else if (score >= 80) return 3;
    else if (score >= 70) return 2;
    else if (score >= 60) return 1;
    else return 0;
}`,
      explanation: {
        summary: '제어 로직(if)과 정책 데이터(기준 점수표)를 분리하는 Data-Driven Table 설계 패턴을 C 배열로 구현합니다.',
        keyConcepts: ['Data-Driven Design', 'Lookup Table (C Array)', '로직과 데이터 분리', '구간 경계 매핑'],
        lineByLine: [
          { line: 1, code: 'int grade_code(int score) {', explain: '원점수 score를 입력받아 등급 코드(4~0)를 반환합니다.' },
          { line: 2, code: '    int min_scores[] = {90, 80, 70, 60};', explain: '내림차순으로 정렬된 점수 하한 기준 테이블을 정의합니다.' },
          { line: 3, code: '    int grades[] = {4, 3, 2, 1};', explain: '각 점수 기준에 대응하는 등급 코드 테이블을 정의합니다.' },
          { line: 4, code: '    for (int i = 0; i < 4; i++) {', explain: '테이블 4개 엔트리를 높은 등급부터 순차 탐색합니다.' },
          { line: 5, code: '        if (score >= min_scores[i]) {', explain: '점수가 현재 기준 이상에 해당하면' },
          { line: 6, code: '            return grades[i];', explain: '매칭된 등급 코드를 즉시 반환합니다.' },
          { line: 7, code: '        }', explain: 'if 블록을 닫습니다.' },
          { line: 8, code: '    }', explain: '테이블 순회 루프를 닫습니다.' },
          { line: 9, code: '    return 0;', explain: '60점 미만 기본 등급(0)을 반환합니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: '고정 크기 4 엔트리 테이블만 검사합니다.', space: 'O(1)', spaceWhy: '스택에 작은 고정 배열만 선언합니다.' },
        pitfalls: ['min_scores 테이블이 반드시 내림차순이어야 첫 매칭에서 올바른 최고 등급을 찾을 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 비교 연산자에 >= 대신 > 를 사용하여 딱 90, 80, 70, 60 경계 점수가 한 등급씩 낮게 책정됩니다.',
        checklist: ['score >= min_scores[i] 경계 등호 확인', '테이블 인덱스 범위 i < 4 확인'],
        focusLine: 5,
        buggyCode: `int grade_code(int score) {
    int min_scores[] = {90, 80, 70, 60};
    int grades[] = {4, 3, 2, 1};
    for (int i = 0; i < 4; i++) {
        if (score > min_scores[i]) {
            return grades[i];
        }
    }
    return 0;
}`
      },
      entryPoint: 'grade_code',
      code: `int grade_code(int score) {
    int min_scores[] = {90, 80, 70, 60};
    int grades[] = {4, 3, 2, 1};
    for (int i = 0; i < 4; i++) {
        if (score >= min_scores[i]) {
            return grades[i];
        }
    }
    return 0;
}`,
      skeleton: `int grade_code(int score) {
    int min_scores[] = {90, 80, 70, 60};
    int grades[] = {4, 3, 2, 1};
    for (int i = 0; i < 4; i++) {
        if (____) {
            return ____;
        }
    }
    return 0;
}`,
      tests: [
        { input: [90], expected: 4, name: '90점 경계값 A등급(4)' },
        { input: [75], expected: 2, name: '75점 C등급(2)' },
        { input: [55], expected: 0, name: '60점 미만(0)' }
      ]
    },
    {
      id: 'c_state_machine_vending',
      title: '임베디드 유한 상태 머신(FSM) 이벤트 전이',
      tier: 3,
      level: 'intermediate',
      track: 'architecture',
      category: 'Architecture',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '임베디드 제어의 표준인 유한 상태 머신(0: IDLE → 1: READY → 2: LOCKED)을 이벤트 루프로 안전하게 전이시킵니다.',
      explanation: {
        summary: '시스템 상태를 명시적 정수로 모델링하고 허용되지 않은 이벤트 입력이나 오류 이벤트(ev=9) 발생 시 안전 상태(IDLE 또는 LOCKED)로 전이시키는 저수준 아키텍처 패턴입니다.',
        keyConcepts: ['Finite State Machine (FSM)', 'Event-Driven Transition', 'Safe Fallback State', 'C 임베디드 제어'],
        lineByLine: [
          { line: 1, code: 'int run_fsm(int events[], int count) {', explain: '이벤트 코드 배열(1:코인투입, 2:배출, 9:오류, 0:리셋)과 길이를 입력받습니다.' },
          { line: 2, code: '    int state = 0;', explain: '초기 상태를 IDLE(0)으로 설정합니다. (1=READY, 2=LOCKED)' },
          { line: 3, code: '    for (int i = 0; i < count; i++) {', explain: '들어온 이벤트를 순서대로 처리합니다.' },
          { line: 4, code: '        int ev = events[i];', explain: '현재 이벤트 코드를 읽습니다.' },
          { line: 5, code: '        if (ev == 9) { state = 2; }', explain: '치명적 오류(ev=9) 시 어느 상태에서든 안전 잠금(LOCKED=2)으로 전이합니다.' },
          { line: 6, code: '        else if (state == 0 && ev == 1) { state = 1; }', explain: 'IDLE(0)에서 코인 투입(1)이 오면 READY(1) 상태로 전이합니다.' },
          { line: 7, code: '        else if (state == 1 && ev == 2) { state = 0; }', explain: 'READY(1)에서 배출(2) 완료 시 IDLE(0)으로 복귀합니다.' },
          { line: 8, code: '        else if (state == 2 && ev == 0) { state = 0; }', explain: 'LOCKED(2) 상태에서는 관리자 리셋(0) 이벤트만 IDLE로 복구할 수 있습니다.' },
          { line: 9, code: '    }', explain: '이벤트 루프를 종료합니다.' },
          { line: 10, code: '    return state;', explain: '최종 전이된 상태 번호를 반환합니다.' },
          { line: 11, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'N개의 이벤트를 1회 순회하며 상수 시간에 상태 전이를 판단합니다.', space: 'O(1)', spaceWhy: '단일 상태 레지스터 state 변수만 사용합니다.' },
        pitfalls: ['LOCKED(2) 상태에서 일반 코인 투입(ev=1)을 무시하지 않으면 오류 상태에서도 장비가 오작동할 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 LOCKED(2) 복구 가드에서 관리자 리셋(ev == 0) 대신 코인 투입(ev == 1)으로 해제되도록 잘못 연결했습니다.',
        checklist: ['LOCKED 해제 조건(state == 2 && ev == 0) 확인', '오류 이벤트(ev == 9) 즉시 잠금 확인'],
        focusLine: 8,
        buggyCode: `int run_fsm(int events[], int count) {
    int state = 0;
    for (int i = 0; i < count; i++) {
        int ev = events[i];
        if (ev == 9) { state = 2; }
        else if (state == 0 && ev == 1) { state = 1; }
        else if (state == 1 && ev == 2) { state = 0; }
        else if (state == 2 && ev == 1) { state = 0; }
    }
    return state;
}`
      },
      entryPoint: 'run_fsm',
      code: `int run_fsm(int events[], int count) {
    int state = 0;
    for (int i = 0; i < count; i++) {
        int ev = events[i];
        if (ev == 9) { state = 2; }
        else if (state == 0 && ev == 1) { state = 1; }
        else if (state == 1 && ev == 2) { state = 0; }
        else if (state == 2 && ev == 0) { state = 0; }
    }
    return state;
}`,
      skeleton: `int run_fsm(int events[], int count) {
    int state = 0;
    for (int i = 0; i < count; i++) {
        int ev = events[i];
        if (ev == 9) { state = 2; }
        else if (state == 0 && ev == 1) { state = 1; }
        else if (____) { state = 0; }
        else if (____) { state = 0; }
    }
    return state;
}`,
      tests: [
        { input: [[1, 2, 1], 3], expected: 1, name: '정상 전이 (IDLE->READY->IDLE->READY)' },
        { input: [[1, 9, 1], 3], expected: 2, name: '오류 발생 시 코인 투입 무시 & LOCKED 유지' },
        { input: [[9, 0], 2], expected: 0, name: '관리자 리셋(0)으로 IDLE 복귀' }
      ]
    },
    {
      id: 'c_refactor_clamp_normalize',
      title: '센서 경계 보정 헬퍼(clamp) 추출 리팩터링',
      tier: 1,
      level: 'beginner',
      track: 'refactoring',
      category: 'Refactoring',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '루프 안에 중복 섞여 있던 센서 값 상하한 보정 분기를 단일 순수 함수 clamp_int()로 추출해 모듈성과 테스트 용이성을 높입니다.',
      refactoringGoal: '배열 순회 루프 내부에 중복 작성된 [lo, hi] 범위 제한 로직을 재사용 가능한 헬퍼 함수 clamp_int로 분리하세요.',
      refactoringBefore: `int sum_clamped(int vals[], int n, int lo, int hi) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x = vals[i];
        if (x < lo) total += lo;
        else if (x > hi) total += hi;
        else total += x;
    }
    return total;
}`,
      explanation: {
        summary: '임베디드 센서 노이즈 스파이크를 [lo, hi] 허용 구간으로 잘라내는 clamp_int 함수를 추출하고, 합산 루프는 재사용에만 집중하도록 리팩터링합니다.',
        keyConcepts: ['Extract Function 리팩터링', 'Range Clamping [lo, hi]', '관심사 분리', '순수 C 헬퍼 함수'],
        lineByLine: [
          { line: 1, code: 'int clamp_int(int v, int lo, int hi) {', explain: '원본 정수 v와 허용 범위 [lo, hi]를 받는 클램핑 헬퍼 함수입니다.' },
          { line: 2, code: '    if (v < lo) return lo;', explain: '하한 미만이면 최솟값 lo로 보정해 즉시 반환합니다.' },
          { line: 3, code: '    if (v > hi) return hi;', explain: '상한 초과면 최댓값 hi로 보정해 즉시 반환합니다.' },
          { line: 4, code: '    return v;', explain: '정상 범위 안의 값은 그대로 반환합니다.' },
          { line: 5, code: '}', explain: 'clamp_int 헬퍼 함수를 닫습니다.' },
          { line: 7, code: 'int sum_clamped(int vals[], int n, int lo, int hi) {', explain: '센서 배열 vals[n]의 보정된 합계를 구합니다.' },
          { line: 8, code: '    int total = 0;', explain: '누적 합계 변수를 0으로 초기화합니다.' },
          { line: 9, code: '    for (int i = 0; i < n; i++) {', explain: '배열의 모든 n개 측정치를 순회합니다.' },
          { line: 10, code: '        total += clamp_int(vals[i], lo, hi);', explain: '추출한 헬퍼 함수로 각 샘플을 안전 범위로 정규화해 더합니다.' },
          { line: 11, code: '    }', explain: 'for 루프를 닫습니다.' },
          { line: 12, code: '    return total;', explain: '보정된 총합을 반환합니다.' },
          { line: 13, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: 'n개 원소를 순회하며 각 O(1) 헬퍼 함수를 호출합니다.', space: 'O(1)', spaceWhy: '단일 누적 변수만 사용합니다.' },
        pitfalls: ['상한 검사(v > hi)나 하한 검사 중 하나만 빠져도 센서 이상치 하나가 전체 평균·체크섬을 망가뜨립니다.']
      },
      audit: {
        bugSummary: 'AI가 clamp_int에서 상한 초과 가드(if (v > hi) return hi;)를 빠져먹어 250 같은 센서 스파이크가 그대로 합산됩니다.',
        checklist: ['하한(v < lo)과 상한(v > hi) 모두 검사 확인', '빈 배열 n=0 시 0 반환 확인'],
        focusLine: 3,
        buggyCode: `int clamp_int(int v, int lo, int hi) {
    if (v < lo) return lo;
    return v;
}

int sum_clamped(int vals[], int n, int lo, int hi) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += clamp_int(vals[i], lo, hi);
    }
    return total;
}`
      },
      entryPoint: 'sum_clamped',
      code: `int clamp_int(int v, int lo, int hi) {
    if (v < lo) return lo;
    if (v > hi) return hi;
    return v;
}

int sum_clamped(int vals[], int n, int lo, int hi) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += clamp_int(vals[i], lo, hi);
    }
    return total;
}`,
      skeleton: `int clamp_int(int v, int lo, int hi) {
    if (v < lo) return lo;
    if (____) return hi;
    return v;
}

int sum_clamped(int vals[], int n, int lo, int hi) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += ____;
    }
    return total;
}`,
      tests: [
        { input: [[-20, 50, 140], 3, 0, 100], expected: 150, name: '음수/상한 초과 모두 [0, 100]으로 클램핑 (0+50+100)' },
        { input: [[-30, -5, 8, 99], 4, -10, 10], expected: 3, name: '음수 구간 [-10, 10] 보정 (-10-5+8+10)' },
        { input: [[], 0, 0, 100], expected: 0, name: '빈 입력 n=0 안전 처리' }
      ]
    },
    {
      id: 'c_int8_quantized_dot',
      title: 'Edge AI Int8 양자화 벡터 내적 & 시프트',
      tier: 2,
      level: 'intermediate',
      track: 'ai',
      category: 'AI Inference / C',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '모바일·MCU 온디바이스 AI(NPU)에서 부동소수 없이 Int8 가중치와 활성화 값을 정수 누산 후 우측 시프트(>>)로 재스케일링합니다.',
      explanation: {
        summary: 'FP32 연산기가 없는 저전력 엣지 AI 디바이스에서 정수 곱셈·누산(MAC) 후 2^shift 나눗셈을 비트 우측 시프트(>>)로 고속 처리하는 커널 연산입니다.',
        keyConcepts: ['Edge AI Int8 Quantization', 'Multiply-Accumulate (MAC)', 'Arithmetic Right Shift (>>)', '부호 유지 스케일링'],
        lineByLine: [
          { line: 1, code: 'int quantized_dot_i8(int a[], int b[], int n, int shift) {', explain: '양자화된 두 정수 벡터 a, b와 길이 n, 출력 스케일 시프트 비트를 받습니다.' },
          { line: 2, code: '    int acc = 0;', explain: '곱셈 누적(Accumulator) 값을 0으로 초기화합니다.' },
          { line: 3, code: '    for (int i = 0; i < n; i++) {', explain: '벡터 차원 n만큼 MAC 연산을 반복합니다.' },
          { line: 4, code: '        acc += a[i] * b[i];', explain: '대응하는 두 양자화 원소를 곱해 정수 누산기에 더합니다.' },
          { line: 5, code: '    }', explain: '내적 루프를 닫습니다.' },
          { line: 6, code: '    if (shift <= 0) {', explain: '스케일 시프트가 0 이하면 시프트 연산을 건너뛰어 UB를 방지합니다.' },
          { line: 7, code: '        return acc;', explain: '누산된 원 내적값을 그대로 반환합니다.' },
          { line: 8, code: '    }', explain: '조건 블록을 닫습니다.' },
          { line: 9, code: '    return acc >> shift;', explain: '2의 shift 제곱으로 나눈 양자화 재스케일 결과를 반환합니다.' },
          { line: 10, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N)', timeWhy: '차원 길이 N에 비례해 정수 곱셈 및 덧셈을 수행합니다.', space: 'O(1)', spaceWhy: '단일 정수 누산 레지스터 acc만 사용합니다.' },
        pitfalls: ['우측 시프트(>>) 대신 좌측 시프트(<<)를 쓰면 나눗셈이 곱셈으로 뒤집혀 모든 레이어 출력값이 폭발합니다.']
      },
      audit: {
        bugSummary: 'AI가 출력 재스케일에 우측 시프트(>>) 대신 좌측 시프트(<<)를 잘못 써서 값이 4배 커집니다.',
        checklist: ['acc >> shift 우측 시프트 방향 확인', 'shift <= 0 가드 확인'],
        focusLine: 9,
        buggyCode: `int quantized_dot_i8(int a[], int b[], int n, int shift) {
    int acc = 0;
    for (int i = 0; i < n; i++) {
        acc += a[i] * b[i];
    }
    if (shift <= 0) {
        return acc;
    }
    return acc << shift;
}`
      },
      entryPoint: 'quantized_dot_i8',
      code: `int quantized_dot_i8(int a[], int b[], int n, int shift) {
    int acc = 0;
    for (int i = 0; i < n; i++) {
        acc += a[i] * b[i];
    }
    if (shift <= 0) {
        return acc;
    }
    return acc >> shift;
}`,
      skeleton: `int quantized_dot_i8(int a[], int b[], int n, int shift) {
    int acc = 0;
    for (int i = 0; i < n; i++) {
        acc += ____;
    }
    if (shift <= 0) {
        return acc;
    }
    return ____;
}`,
      tests: [
        { input: [[10, -20, 30], [2, 3, 4], 3, 2], expected: 20, name: '누산 80 >> 2 = 20 재스케일' },
        { input: [[3, 5], [4, 2], 2, 0], expected: 22, name: 'shift=0 시 원 내적 반환' },
        { input: [[-16, -16], [2, 2], 2, 3], expected: -8, name: '음수 누산 부호 유지 (-64 >> 3 = -8)' }
      ]
    },
    {
      id: 'c_bitpack_packet_parser',
      title: '네트워크 바이너리 헤더 비트 언패커',
      tier: 3,
      level: 'intermediate',
      track: 'system_design',
      category: 'Systems & Protocol',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '32비트 패킷 헤더에 압축된 Version(4bit), Flags(8bit), Payload Length(16bit) 필드를 시프트(>>)와 마스크(&)로 추출·검증합니다.',
      explanation: {
        summary: '네트워크 프로토콜 및 임베디드 통신 프레임을 32비트 정수 하나로 전송한 뒤, 비트 시프트와 16진수 마스크로 버전(1)·ACK 플래그(bit 0)·길이를 고속 추출합니다.',
        keyConcepts: ['Binary Header Unpacking', 'Bitwise Shift + Mask (>> &)', '16진수 마스크 (0x0F, 0xFF, 0xFFFF)', '프로토콜 버전 검증'],
        lineByLine: [
          { line: 1, code: 'int parse_packet_len(int header) {', explain: '압축된 32비트 프로토콜 헤더 정수를 입력받습니다.' },
          { line: 2, code: '    int version = (header >> 24) & 0x0F;', explain: '상위 24~27비트에 실린 4비트 프로토콜 버전 번호를 추출합니다.' },
          { line: 3, code: '    int flags = (header >> 16) & 0xFF;', explain: '16~23비트에 담긴 8비트 제어 플래그를 추출합니다.' },
          { line: 4, code: '    int length = header & 0xFFFF;', explain: '하위 16비트(0xFFFF) 마스크로 0~65535 범위 페이로드 길이를 분리합니다.' },
          { line: 5, code: '    if (version != 1) {', explain: '프로토콜 버전이 v1이 아니면 호환 불가 헤더이므로' },
          { line: 6, code: '        return -1;', explain: '오류 코드 -1을 반환합니다.' },
          { line: 7, code: '    }', explain: '버전 검증 블록을 닫습니다.' },
          { line: 8, code: '    if ((flags & 1) == 0) {', explain: '유효 패킷 필수 플래그(ACK 0번 비트)가 꺼져 있으면' },
          { line: 9, code: '        return -2;', explain: '오류 코드 -2를 반환합니다.' },
          { line: 10, code: '    }', explain: '플래그 검증 블록을 닫습니다.' },
          { line: 11, code: '    return length;', explain: '모든 헤더 검증을 통과한 페이로드 바이트 길이를 반환합니다.' },
          { line: 12, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(1)', timeWhy: 'CPU 비트 시프트와 AND 마스크 몇 회만으로 상수 시간에 파싱합니다.', space: 'O(1)', spaceWhy: '3개의 로컬 정수 레지스터만 사용합니다.' },
        pitfalls: ['length 마스크를 16비트(0xFFFF) 대신 8비트(0xFF)로 잘못 적으면 256바이트 이상 길이가 8비트로 잘려 데이터 손상이 일어납니다.']
      },
      audit: {
        bugSummary: 'AI가 length 추출 마스크를 16비트 0xFFFF 대신 0xFF로 잘못 작성해 512바이트 길이가 0으로 절단됩니다.',
        checklist: ['16비트 길이 마스크 0xFFFF 확인', 'flags & 1 괄호 우선순위 검증'],
        focusLine: 4,
        buggyCode: `int parse_packet_len(int header) {
    int version = (header >> 24) & 0x0F;
    int flags = (header >> 16) & 0xFF;
    int length = header & 0xFF;
    if (version != 1) {
        return -1;
    }
    if ((flags & 1) == 0) {
        return -2;
    }
    return length;
}`
      },
      entryPoint: 'parse_packet_len',
      code: `int parse_packet_len(int header) {
    int version = (header >> 24) & 0x0F;
    int flags = (header >> 16) & 0xFF;
    int length = header & 0xFFFF;
    if (version != 1) {
        return -1;
    }
    if ((flags & 1) == 0) {
        return -2;
    }
    return length;
}`,
      skeleton: `int parse_packet_len(int header) {
    int version = (header >> 24) & 0x0F;
    int flags = (header >> 16) & 0xFF;
    int length = header & ____;
    if (version != 1) {
        return -1;
    }
    if (____ == 0) {
        return -2;
    }
    return length;
}`,
      tests: [
        { input: [16974336], expected: 512, name: 'v1 + ACK + 512B 정상 언패킹 (0x01030200)' },
        { input: [33619968], expected: -1, name: 'v2 미지원 버전 거부 (-1)' },
        { input: [16908416], expected: -2, name: 'ACK 비트 누락 패킷 거부 (-2)' },
        { input: [16842752], expected: 0, name: '0바이트 빈 페이로드 패킷 통과' }
      ]
    },
    {
      id: 'c_fixed_slot_pool',
      title: '고정 크기 비트맵 메모리 풀 할당기 (No malloc)',
      tier: 4,
      level: 'advanced',
      track: 'architecture',
      category: 'Systems & Memory',
      complexity: { time: 'O(N * S)', space: 'O(1)' },
      description: '단편화(Fragmentation)를 원천 차단하기 위해 정수 비트맵으로 고정 슬롯을 O(1) 해제·재사용하는 임베디드 Pool 할당기를 구현합니다.',
      adr: {
        scenario: '실시간 펌웨어에서 초당 수천 번 malloc/free를 호출했다가 힙 단편화(Fragmentation)로 가용 메모리가 남았는데도 할당 실패(OOM)가 발생했습니다.',
        prompt: '실시간 안전(Deterministic) 시스템에 가장 적합한 동적 메모리 대체 설계는?',
        options: [
          { id: 'malloc', label: 'A. 범용 malloc/free 그대로 유지하고 주기적으로 재부팅', recommended: false, critique: '실시간 임베디드 장치에서 임의의 힙 단편화와 예기치 않은 지연·재부팅은 치명적 장애입니다.' },
          { id: 'pool', label: 'B. 고정 크기 슬롯 배열 + 비트맵 할당 상태를 추적하는 Fixed Slot Pool', recommended: true, critique: '정확합니다! 힙 단편화 0%, 결정적 실행 시간, 이중 해제(Double-Free) 방어를 동시에 달성합니다.' }
        ]
      },
      explanation: {
        summary: '정수 bitmap의 각 비트를 슬롯 사용 여부(0=빈 슬롯, 1=사용 중)로 삼아 op=1 시 가장 낮은 빈 슬롯을 할당하고, op<=0 시 이중 해제(Double-Free) 없이 안전 반환합니다.',
        keyConcepts: ['Fixed Slot Pool Allocator', 'Bitmap Allocation Table', 'Double-Free 방어', 'Heap Fragmentation 0%'],
        lineByLine: [
          { line: 1, code: 'int simulate_pool(int ops[], int n, int slots) {', explain: '할당(1)/해제(-slotIdx) 연산 배열, 길이 n, 총 슬롯 수 slots를 받습니다.' },
          { line: 2, code: '    int bitmap = 0;', explain: '각 비트 s가 슬롯 s의 사용 여부를 뜻하는 비트맵 레지스터입니다.' },
          { line: 3, code: '    int active = 0;', explain: '현재 사용 중인 슬롯 수를 추적합니다.' },
          { line: 4, code: '    for (int i = 0; i < n; i++) {', explain: '할당/해제 시퀀스를 순서대로 실행합니다.' },
          { line: 5, code: '        int op = ops[i];', explain: '현재 연산 코드를 읽습니다.' },
          { line: 6, code: '        if (op == 1) {', explain: '슬롯 할당 요청(op == 1)인 경우' },
          { line: 7, code: '            for (int s = 0; s < slots; s++) {', explain: '0번부터 빈 슬롯을 차례로 찾습니다.' },
          { line: 8, code: '                if ((bitmap & (1 << s)) == 0) {', explain: 's번 슬롯 비트가 0(미사용)인지 검사합니다.' },
          { line: 9, code: '                    bitmap |= (1 << s);', explain: 's번 비트를 1로 켜 할당 상태로 마킹합니다.' },
          { line: 10, code: '                    active++;', explain: '활성 슬롯 카운트를 1 증가시키고' },
          { line: 11, code: '                    break;', explain: '첫 빈 슬롯만 할당한 뒤 탐색을 마칩니다.' },
          { line: 12, code: '                }', explain: '슬롯 점유 검사 블록 종료' },
          { line: 13, code: '            }', explain: '슬롯 스캔 루프 종료' },
          { line: 14, code: '        } else if (op <= 0) {', explain: '0 또는 음수(-slotIndex)면 해당 슬롯 해제 요청입니다.' },
          { line: 15, code: '            int idx = -op;', explain: '해제할 슬롯 번호(0 이상)를 계산합니다.' },
          { line: 16, code: '            if (idx < slots && (bitmap & (1 << idx)) != 0) {', explain: '범위 유효성 및 실제로 사용 중인 슬롯인지 검사해 Double-Free를 막습니다.' },
          { line: 17, code: '                bitmap &= ~(1 << idx);', explain: '해당 비트를 0으로 지워 슬롯을 풀에 반납합니다.' },
          { line: 18, code: '                active--;', explain: '활성 슬롯 카운트를 1 감소시킵니다.' },
          { line: 19, code: '            }', explain: '해제 가드 블록 종료' },
          { line: 20, code: '        }', explain: '연산 분기 종료' },
          { line: 21, code: '    }', explain: '연산 루프 종료' },
          { line: 22, code: '    return active;', explain: '최종 점유 중인 활성 슬롯 개수를 반환합니다.' },
          { line: 23, code: '}', explain: '함수를 종료합니다.' }
        ],
        complexity: { time: 'O(N * S)', timeWhy: '연산 N회당 최대 슬롯 수 S비트를 스캔하며 힙 할당 없이 동작합니다.', space: 'O(1)', spaceWhy: '고정 비트맵 정수 하나만으로 최대 30여 개 슬롯 상태를 관리합니다.' },
        pitfalls: ['이중 해제 시 (bitmap & (1 << idx)) != 0 가드가 없으면 active 카운트가 계속 깎여 슬롯 계수 상태가 손상됩니다.']
      },
      audit: {
        bugSummary: 'AI가 해제 전에 해당 비트가 켜져 있는지 검사하는 Double-Free 가드를 빠뜨려 같은 슬롯을 두 번 해제할 때 active 수가 틀어집니다.',
        checklist: ['이중 해제 방지((bitmap & (1 << idx)) != 0) 확인', '범위 초과 인덱스(idx < slots) 방어 확인'],
        focusLine: 16,
        buggyCode: `int simulate_pool(int ops[], int n, int slots) {
    int bitmap = 0;
    int active = 0;
    for (int i = 0; i < n; i++) {
        int op = ops[i];
        if (op == 1) {
            for (int s = 0; s < slots; s++) {
                if ((bitmap & (1 << s)) == 0) {
                    bitmap |= (1 << s);
                    active++;
                    break;
                }
            }
        } else if (op <= 0) {
            int idx = -op;
            if (idx < slots) {
                bitmap &= ~(1 << idx);
                active--;
            }
        }
    }
    return active;
}`
      },
      entryPoint: 'simulate_pool',
      code: `int simulate_pool(int ops[], int n, int slots) {
    int bitmap = 0;
    int active = 0;
    for (int i = 0; i < n; i++) {
        int op = ops[i];
        if (op == 1) {
            for (int s = 0; s < slots; s++) {
                if ((bitmap & (1 << s)) == 0) {
                    bitmap |= (1 << s);
                    active++;
                    break;
                }
            }
        } else if (op <= 0) {
            int idx = -op;
            if (idx < slots && (bitmap & (1 << idx)) != 0) {
                bitmap &= ~(1 << idx);
                active--;
            }
        }
    }
    return active;
}`,
      skeleton: `int simulate_pool(int ops[], int n, int slots) {
    int bitmap = 0;
    int active = 0;
    for (int i = 0; i < n; i++) {
        int op = ops[i];
        if (op == 1) {
            for (int s = 0; s < slots; s++) {
                if ((bitmap & (1 << s)) == 0) {
                    bitmap |= (1 << s);
                    active++;
                    break;
                }
            }
        } else if (op <= 0) {
            int idx = -op;
            if (idx < slots && ____ != 0) {
                ____;
                active--;
            }
        }
    }
    return active;
}`,
      tests: [
        { input: [[1, 1, 1, 1], 4, 3], expected: 3, name: '최대 3슬롯 포화 시 추가 할당 안전 무시' },
        { input: [[1, 1, 0, 0, 1], 5, 3], expected: 2, name: '0번 슬롯 이중 해제(Double-Free) 방어 & 재할당' },
        { input: [[1, -5, 0], 3, 2], expected: 0, name: '범위 밖 슬롯(-5) 무시 후 0번 정상 해제' }
      ]
    }
  );

  // =========================================================================
  // 5. Spec & Architecture Diagrams (신규 'spec' 언어/트랙: JSON Schema & Mermaid SVG)
  // =========================================================================
  curr.spec = [
    {
      id: 'spec_schema_order_api',
      title: 'API 계약: 주문 요청 JSON Schema 검증기',
      tier: 1,
      level: 'beginner',
      track: 'spec',
      specKind: 'schema',
      category: 'Spec / Contract',
      complexity: { time: 'Schema', space: 'Strict' },
      description: '프론트엔드-백엔드 간 주문 API 페이로드 계약(필수 필드, 금액 하한, enum, 미정의 키 차단)을 JSON Schema로 작성합니다.',
      explanation: {
        summary: 'AI와 API 협업을 할 때 코드보다 먼저 정의하는 엄격한 JSON Schema 계약입니다. required와 additionalProperties: false로 예상 밖 필드를 막습니다.',
        keyConcepts: ['JSON Schema Contract', 'required 필수 필드', 'minimum 경계 제한', 'additionalProperties: false'],
        lineByLine: [
          { line: 1, code: '{', explain: '최상위 JSON Schema 객체를 엽니다.' },
          { line: 2, code: '  "type": "object",', explain: '루트 페이로드는 반드시 JSON 객체여야 합니다.' },
          { line: 3, code: '  "required": ["orderId", "amount", "currency"],', explain: '3가지 필수 키 중 하나라도 누락되면 요청을 거부합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: '계약에 명시되지 않은 임의의 주입 필드를 엄격히 차단합니다.' },
          { line: 5, code: '  "properties": {', explain: '각 프로퍼티의 세부 타입 제약 조건을 정의합니다.' },
          { line: 6, code: '    "orderId": { "type": "string", "minLength": 4 },', explain: '주문 ID는 최소 4글자 이상의 문자열이어야 합니다.' },
          { line: 7, code: '    "amount": { "type": "integer", "minimum": 100 },', explain: '결제 금액은 100원 이상의 정수로 강제합니다.' },
          { line: 8, code: '    "currency": { "type": "string", "enum": ["KRW", "USD"] }', explain: '지원 통화는 KRW 또는 USD로만 제한합니다.' },
          { line: 9, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 10, code: '}', explain: '루트 스키마 객체를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '요청 프로퍼티 수에 비례해 O(K)에 검증됩니다.', space: 'Strict', spaceWhy: '허용 키 집합을 고정해 계약 이탈을 방지합니다.' },
        pitfalls: ['additionalProperties: false를 생략하면 클라이언트가 role: "admin" 같은 미허용 필드를 슬쩍 끼워 보내도 통과해 버립니다.']
      },
      audit: {
        bugSummary: 'AI가 additionalProperties: false 규칙을 빠져먹어 계약 외 불법 필드(extraHack: true)가 포함된 요청도 통과합니다.',
        checklist: ['additionalProperties: false 미정의 키 차단 확인', 'minimum: 100 및 enum 제약 점검'],
        focusLine: 4,
        buggyCode: `{
  "type": "object",
  "required": ["orderId", "amount", "currency"],
  "properties": {
    "orderId": { "type": "string", "minLength": 4 },
    "amount": { "type": "integer", "minimum": 100 },
    "currency": { "type": "string", "enum": ["KRW", "USD"] }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["orderId", "amount", "currency"],
  "additionalProperties": false,
  "properties": {
    "orderId": { "type": "string", "minLength": 4 },
    "amount": { "type": "integer", "minimum": 100 },
    "currency": { "type": "string", "enum": ["KRW", "USD"] }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["orderId", "amount", "currency"],
  "additionalProperties": ____,
  "properties": {
    "orderId": { "type": "string", "minLength": 4 },
    "amount": { "type": "integer", "minimum": ____ },
    "currency": { "type": "string", "enum": ["KRW", "USD"] }
  }
}`,
      tests: [
        { input: [{ orderId: 'ORD1', amount: 5000, currency: 'KRW' }], expected: true, name: '유효 주문 페이로드 통과' },
        { input: [{ orderId: 'ORD1', amount: 50, currency: 'KRW' }], expected: false, name: '100원 미만 금액 거부' },
        { input: [{ orderId: 'ORD1', amount: 5000, currency: 'KRW', extraHack: true }], expected: false, name: '미정의 필드(additionalProperties) 거부' }
      ]
    },
    {
      id: 'spec_schema_tool_calling',
      title: 'AI Agent Tool-Calling 스펙 계약 (JSON Schema)',
      tier: 2,
      level: 'intermediate',
      track: 'spec',
      specKind: 'schema',
      category: 'AI Spec',
      complexity: { time: 'Schema', space: 'Strict' },
      description: 'LLM 에이전트가 함수(search_docs)를 호출할 때 출력 인자 환각을 막기 위한 Structured Output JSON Schema를 설계합니다.',
      explanation: {
        summary: 'AI Agent 도구의 파라미터 스펙을 정밀하게 제한(topK 1~20 범위, mode enum, 태그 배열 최소 1개)하여 에이전트가 엉뚱한 인자를 생성하지 못하도록 가드합니다.',
        keyConcepts: ['Function Calling Schema', 'Structured Output', 'topK 상한(maximum) 방어', 'items/minItems 제약'],
        lineByLine: [
          { line: 1, code: '{', explain: 'Tool 파라미터 루트 스키마를 시작합니다.' },
          { line: 2, code: '  "type": "object",', explain: '도구 인자는 객체 형태입니다.' },
          { line: 3, code: '  "required": ["query", "topK", "mode"],', explain: 'LLM이 반드시 채워야 하는 3개 파라미터를 선언합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: '에이전트가 임의로 지어낸 존재하지 않는 파라미터(Hallucination)를 차단합니다.' },
          { line: 5, code: '  "properties": {', explain: '도구 파라미터별 타입과 제약 범위를 선언합니다.' },
          { line: 6, code: '    "query": { "type": "string", "minLength": 2 },', explain: '검색 질의어는 최소 2글자 이상이어야 합니다.' },
          { line: 7, code: '    "topK": { "type": "integer", "minimum": 1, "maximum": 20 },', explain: '한 번에 조회할 문서 수는 1~20으로 제한해 컨텍스트 폭발을 방지합니다.' },
          { line: 8, code: '    "mode": { "type": "string", "enum": ["hybrid", "vector", "keyword"] },', explain: '지원하는 3가지 검색 모드 중 하나만 허용합니다.' },
          { line: 9, code: '    "tags": { "type": "array", "minItems": 1, "items": { "type": "string" } }', explain: '선택 필터 tags를 넣는 경우 비어 있지 않은 문자열 배열이어야 합니다.' },
          { line: 10, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 11, code: '}', explain: '도구 스키마를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '파라미터 구조 검증 비용이 상수에 가깝습니다.', space: 'Strict', spaceWhy: '에이전트 호출 페이로드 상한을 안전하게 고정합니다.' },
        pitfalls: ['topK에 maximum 제한이 없으면 모델이 topK: 99999를 생성해 벡터 DB 메모리/토큰 비용을 터뜨릴 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 topK의 상한(maximum: 20)을 누락해 에이전트가 topK: 500을 요청해도 스펙 검증을 통과해 버립니다.',
        checklist: ['topK 상한(maximum: 20) 확인', 'mode enum & additionalProperties: false 점검'],
        focusLine: 7,
        buggyCode: `{
  "type": "object",
  "required": ["query", "topK", "mode"],
  "additionalProperties": false,
  "properties": {
    "query": { "type": "string", "minLength": 2 },
    "topK": { "type": "integer", "minimum": 1 },
    "mode": { "type": "string", "enum": ["hybrid", "vector", "keyword"] },
    "tags": { "type": "array", "minItems": 1, "items": { "type": "string" } }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["query", "topK", "mode"],
  "additionalProperties": false,
  "properties": {
    "query": { "type": "string", "minLength": 2 },
    "topK": { "type": "integer", "minimum": 1, "maximum": 20 },
    "mode": { "type": "string", "enum": ["hybrid", "vector", "keyword"] },
    "tags": { "type": "array", "minItems": 1, "items": { "type": "string" } }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["query", "topK", "mode"],
  "additionalProperties": false,
  "properties": {
    "query": { "type": "string", "minLength": 2 },
    "topK": { "type": "integer", "minimum": 1, "maximum": ____ },
    "mode": { "type": "string", "enum": ____ },
    "tags": { "type": "array", "minItems": 1, "items": { "type": "string" } }
  }
}`,
      tests: [
        { input: [{ query: 'RAG chunking', topK: 5, mode: 'hybrid', tags: ['ai'] }], expected: true, name: '유효 에이전트 도구 호출 통과' },
        { input: [{ query: 'RAG chunking', topK: 500, mode: 'hybrid' }], expected: false, name: 'topK 상한(20) 초과 거부' },
        { input: [{ query: 'RAG', topK: 3, mode: 'magic_search' }], expected: false, name: '미허용 검색 모드(enum) 거부' }
      ]
    },
    {
      id: 'spec_arch_api_gateway',
      title: '아키텍처 흐름도: API Gateway · Auth · Cache · DB',
      tier: 3,
      level: 'intermediate',
      track: 'spec',
      specKind: 'diagram',
      category: 'Architecture DSL',
      complexity: { time: 'Arch', space: 'Live SVG' },
      description: 'Mermaid flowchart 문법으로 클라이언트 요청이 API 게이트웨이, 인증, Redis 캐시, DB로 흐르는 시스템 토폴로지를 설계하면 우측에 실시간 SVG 다이어그램이 그려집니다.',
      adr: {
        scenario: '백엔드 API에 인증 로직과 캐시 레이어를 추가해 트래픽을 분산하려 합니다.',
        prompt: '인증과 캐시 책임을 어디에 배치하는 것이 가장 깔끔할까요?',
        options: [
          { id: 'db_first', label: 'A. 클라이언트가 DB에 직접 연결하고 각 서비스마다 JWT 파싱', recommended: false, critique: 'DB 연결 고갈 및 서비스 간 보안 정책 중복이 발생합니다.' },
          { id: 'gateway', label: 'B. API Gateway에서 인증(Auth) 위임 후 Core Service -> Redis Cache -> DB 순으로 라우팅', recommended: true, critique: '정확합니다! 횡단 관심사(인증·레이트리밋)를 게이트웨이로 몰아 내부 서비스를 단순화합니다.' }
        ]
      },
      explanation: {
        summary: '타이핑한 아키텍처 DSL(flowchart LR)을 실시간 파싱하여 우측 스튜디오에 SVG 토폴로지로 시각화하고 필수 노드/연결선을 구조 검증합니다.',
        keyConcepts: ['Mermaid Architecture DSL', 'API Gateway 패턴', 'Cache-Aside 흐름', '구조 의존성 검증'],
        lineByLine: [
          { line: 1, code: 'flowchart LR', explain: '좌에서 우(Left-to-Right) 방향의 시스템 아키텍처 흐름도를 선언합니다.' },
          { line: 2, code: 'Client[Web Client] -->|HTTPS| GW[API Gateway]', explain: '외부 클라이언트가 HTTPS를 통해 단일 진입점 API Gateway로 요청을 보냅니다.' },
          { line: 3, code: 'GW -->|JWT| Auth{Auth Guard}', explain: '게이트웨이가 Auth Guard 분기 노드에 토큰 인증을 위임합니다.' },
          { line: 4, code: 'Auth -->|OK| Core(Core Service)', explain: '인증이 통과된 요청만 핵심 비즈니스 서비스로 진입시킵니다.' },
          { line: 5, code: 'Core -->|Hit| Cache[(Redis Cache)]', explain: '코어 서비스가 먼저 인메모리 Redis 캐시를 조회합니다.' },
          { line: 6, code: 'Core -.->|Miss| DB[(Primary DB)]', explain: '캐시 미스 시에만 점선(-.->) 경로로 주 데이터베이스(DB)에 접근합니다.' }
        ],
        complexity: { time: 'Arch', timeWhy: '실시간 AST 파싱으로 노드와 엣지를 즉시 시각화합니다.', space: 'Live SVG', spaceWhy: '우측 다이어그램 프리뷰에 토폴로지가 즉시 렌더링됩니다.' },
        pitfalls: ['방향 헤더(flowchart LR)나 화살표 라벨 닫는 파이프(|...|)가 빠지면 구조 연결이 누락됩니다.']
      },
      audit: {
        bugSummary: 'AI가 게이트웨이가 Auth를 거치지 않고 곧바로 DB로 직행하도록 잘못 설계했습니다(인증 우회 & 캐시 미경유).',
        checklist: ['GW --> Auth 인증 경유 연결 확인', 'Core -.-> DB 및 Core --> Cache 연결 확인'],
        focusLine: 3,
        buggyCode: `flowchart LR
Client[Web Client] -->|HTTPS| GW[API Gateway]
GW -->|Direct| DB[(Primary DB)]
Core(Core Service) -->|Hit| Cache[(Redis Cache)]`
      },
      entryPoint: 'diagram',
      code: `flowchart LR
Client[Web Client] -->|HTTPS| GW[API Gateway]
GW -->|JWT| Auth{Auth Guard}
Auth -->|OK| Core(Core Service)
Core -->|Hit| Cache[(Redis Cache)]
Core -.->|Miss| DB[(Primary DB)]`,
      skeleton: `flowchart LR
Client[Web Client] -->|HTTPS| ____
GW -->|JWT| Auth{Auth Guard}
Auth -->|OK| Core(Core Service)
Core -->|Hit| ____
Core -.->|Miss| DB[(Primary DB)]`,
      tests: [
        { input: [{ kind: 'direction', direction: 'LR' }], expected: true, name: '좌→우(LR) 아키텍처 방향' },
        { input: [{ kind: 'edge', from: 'GW', to: 'Auth' }], expected: true, name: 'Gateway → Auth 인증 경계 존재' },
        { input: [{ kind: 'edge', from: 'Core', to: 'Cache' }], expected: true, name: 'Core → Redis Cache 연결 존재' },
        { input: [{ kind: 'minCount', nodes: 6, edges: 5 }], expected: true, name: '6개 컴포넌트 · 5개 연결 완전성' }
      ]
    },
    {
      id: 'spec_seq_rag_pipeline',
      title: 'AI RAG 시퀀스 설계: Guardrail → VectorDB → LLM',
      tier: 4,
      level: 'advanced',
      track: 'spec',
      specKind: 'diagram',
      category: 'AI Sequence DSL',
      complexity: { time: 'Sequence', space: 'Live SVG' },
      description: 'Mermaid sequenceDiagram으로 사용자 질의가 가드레일 정화 → 벡터 검색 → LLM 생성으로 이어지는 상호작용 계약을 설계합니다.',
      adr: {
        scenario: '사내 문서 RAG 챗봇에서 개인정보(PII) 유출과 프롬프트 인젝션 사고를 예방해야 합니다.',
        prompt: '질의 정화(Guardrail)와 벡터 검색의 올바른 호출 순서는?',
        options: [
          { id: 'after', label: 'A. LLM 호출 후 응답만 검사하고 입력 정화는 생략', recommended: false, critique: '이미 사용자 PII와 인젝션 프롬프트가 외부 LLM 모델과 VectorDB 쿼리에 전송된 뒤라 사후 약방문입니다.' },
          { id: 'before', label: 'B. Guardrail 입력 차단/마스킹 통과 후에만 VectorDB 검색 및 LLM 호출 허용', recommended: true, critique: '정확합니다! 입력 경계에서 먼저 위험/PII를 정화해야 다운스트림 비용과 유출 위험을 원천 차단합니다.' }
        ]
      },
      explanation: {
        summary: '분산 AI 에이전트 서비스의 호출 순서를 sequenceDiagram 문법으로 기술하고, 가드레일·검색·생성·응답 화살표를 실시간 시퀀스 SVG로 시각화/채점합니다.',
        keyConcepts: ['Sequence Diagram DSL', 'Guardrail First', 'RAG Context Injection', '실시간 상호작용 시각화'],
        lineByLine: [
          { line: 1, code: 'sequenceDiagram', explain: '시간 순서에 따른 컴포넌트 호출 시퀀스 다이어그램을 시작합니다.' },
          { line: 2, code: 'User ->> Guard: Raw Prompt', explain: '사용자가 가드레일 게이트웨이로 원시 프롬프트를 전송합니다.' },
          { line: 3, code: 'Guard ->> VectorDB: Top-K Query', explain: '가드레일 인젝션/PII 검증을 통과한 안전 질의로 벡터 DB를 검색합니다.' },
          { line: 4, code: 'VectorDB -->> Guard: Context Chunks', explain: '벡터 DB가 점선(-->>) 응답으로 관련 문서 청크를 반환합니다.' },
          { line: 5, code: 'Guard ->> LLM: Grounded Prompt', explain: '검색된 컨텍스트를 결합해 외부 LLM에 생성을 요청합니다.' },
          { line: 6, code: 'LLM -->> User: Safe Answer', explain: '최종 검증된 근거 기반 응답을 사용자에게 반환합니다.' }
        ],
        complexity: { time: 'Sequence', timeWhy: '각 참여자의 호출 타임라인이 순서대로 렌더링됩니다.', space: 'Live SVG', spaceWhy: 'SVG 수직 라이프라인과 실선/점선 화살표를 동적 생성합니다.' },
        pitfalls: ['실선 동기 호출(->>)과 점선 응답(-->>)의 주체 방향이 어긋나면 데이터 흐름 명세가 모호해집니다.']
      },
      audit: {
        bugSummary: 'AI가 VectorDB 검색 결과를 LLM에 넘기지 않고 바로 사용자에게 보내며, Guardrail을 건너뛰었습니다.',
        checklist: ['User -> Guard -> VectorDB -> LLM 흐름 확인', 'VectorDB -->> Guard 및 LLM -->> User 응답 화살표 검증'],
        focusLine: 3,
        buggyCode: `sequenceDiagram
User ->> LLM: Raw Prompt
VectorDB -->> User: Raw Chunks`
      },
      entryPoint: 'diagram',
      code: `sequenceDiagram
User ->> Guard: Raw Prompt
Guard ->> VectorDB: Top-K Query
VectorDB -->> Guard: Context Chunks
Guard ->> LLM: Grounded Prompt
LLM -->> User: Safe Answer`,
      skeleton: `sequenceDiagram
User ->> ____: Raw Prompt
Guard ->> VectorDB: Top-K Query
VectorDB -->> Guard: ____
Guard ->> LLM: Grounded Prompt
LLM -->> User: Safe Answer`,
      tests: [
        { input: [{ kind: 'message', from: 'User', to: 'Guard' }], expected: true, name: 'User → Guard 가드레일 선행' },
        { input: [{ kind: 'message', from: 'Guard', to: 'VectorDB' }], expected: true, name: 'Guard → VectorDB 검색 요청' },
        { input: [{ kind: 'message', from: 'VectorDB', to: 'Guard', isDashed: true }], expected: true, name: 'VectorDB -->> Guard 청크 반환' },
        { input: [{ kind: 'message', from: 'LLM', to: 'User', isDashed: true }], expected: true, name: 'LLM -->> User 최종 응답' }
      ]
    },
    {
      id: 'spec_schema_webhook_event',
      title: '결제 Webhook 이벤트 스펙 계약 (JSON Schema)',
      tier: 1,
      level: 'beginner',
      track: 'spec',
      specKind: 'schema',
      category: 'Spec / Contract',
      complexity: { time: 'Schema', space: 'Strict' },
      description: '외부 결제 사에서 전달받는 Webhook 이벤트 페이로드의 ID 접두사 패턴(^evt_), 이벤트 종류(enum), 재시도 횟수 상한(1~10) 계약을 작성합니다.',
      explanation: {
        summary: '수신측 Webhook 핸들러가 위조되거나 비정상 재전송된 페이로드를 즉시 거절할 수 있도록 정규식 pattern과 범위 제약을 스펙으로 선언합니다.',
        keyConcepts: ['Webhook Payload Schema', 'pattern 정규식 검증', '재전송 attempt 상한(10)', 'enum 이벤트 제한'],
        lineByLine: [
          { line: 1, code: '{', explain: 'Webhook 루트 JSON Schema 객체를 엽니다.' },
          { line: 2, code: '  "type": "object",', explain: '루트 페이로드 타입을 객체로 제한합니다.' },
          { line: 3, code: '  "required": ["eventId", "type", "attempt"],', explain: '중복 차단을 위한 eventId, 이벤트 유형, 재시도 횟수를 필수로 지정합니다.' },
          { line: 4, code: '  "additionalProperties": false,', explain: '계약 외 주입 필드를 엄격히 차단합니다.' },
          { line: 5, code: '  "properties": {', explain: '각 필드별 검증 규칙을 정의합니다.' },
          { line: 6, code: '    "eventId": { "type": "string", "pattern": "^evt_[a-z0-9]+$" },', explain: '이벤트 ID가 표준 evt_ 접두사와 영소문자·숫자 형식인지 검증합니다.' },
          { line: 7, code: '    "type": { "type": "string", "enum": ["payment.paid", "payment.failed", "refund.done"] },', explain: '허용된 3가지 결제 상태 이벤트 문자열만 통과시킵니다.' },
          { line: 8, code: '    "attempt": { "type": "integer", "minimum": 1, "maximum": 10 }', explain: 'Webhook 전달 재시도 회차를 1~10 정수로 제한합니다.' },
          { line: 9, code: '  }', explain: 'properties 객체를 닫습니다.' },
          { line: 10, code: '}', explain: '루트 스키마를 닫습니다.' }
        ],
        complexity: { time: 'Schema', timeWhy: '필드 수 K에 비례해 O(K)에 계약 검증을 수행합니다.', space: 'Strict', spaceWhy: '허용되지 않은 임의 속성을 원천 차단합니다.' },
        pitfalls: ['eventId의 pattern 정규식을 빼먹으면 빈 ID나 형식 밖 문자열이 멱등성 캐시 키로 들어가 중복 처리 오류가 생길 수 있습니다.']
      },
      audit: {
        bugSummary: 'AI가 eventId의 pattern 정규식을 누락해 evt_ 접두사가 없는 잘못된 ID("bad_123")도 검증을 통과합니다.',
        checklist: ['eventId의 "^evt_[a-z0-9]+$" pattern 확인', 'attempt 1~10 정수 범위 확인'],
        focusLine: 6,
        buggyCode: `{
  "type": "object",
  "required": ["eventId", "type", "attempt"],
  "additionalProperties": false,
  "properties": {
    "eventId": { "type": "string" },
    "type": { "type": "string", "enum": ["payment.paid", "payment.failed", "refund.done"] },
    "attempt": { "type": "integer", "minimum": 1, "maximum": 10 }
  }
}`
      },
      entryPoint: 'schema',
      code: `{
  "type": "object",
  "required": ["eventId", "type", "attempt"],
  "additionalProperties": false,
  "properties": {
    "eventId": { "type": "string", "pattern": "^evt_[a-z0-9]+$" },
    "type": { "type": "string", "enum": ["payment.paid", "payment.failed", "refund.done"] },
    "attempt": { "type": "integer", "minimum": 1, "maximum": 10 }
  }
}`,
      skeleton: `{
  "type": "object",
  "required": ["eventId", "type", "attempt"],
  "additionalProperties": false,
  "properties": {
    "eventId": { "type": "string", "pattern": ____ },
    "type": { "type": "string", "enum": ["payment.paid", "payment.failed", "refund.done"] },
    "attempt": { "type": "integer", "minimum": 1, "maximum": ____ }
  }
}`,
      tests: [
        { input: [{ eventId: 'evt_901a', type: 'payment.paid', attempt: 1 }], expected: true, name: '유효 결제 Webhook 통과' },
        { input: [{ eventId: 'bad_901a', type: 'payment.paid', attempt: 1 }], expected: false, name: '잘못된 eventId 패턴 거부' },
        { input: [{ eventId: 'evt_901a', type: 'payment.paid', attempt: 11 }], expected: false, name: '재시도 상한(10) 초과 거부' },
        { input: [{ eventId: 'evt_901a', type: 'payment.paid', attempt: 1, spoof: true }], expected: false, name: '미정의 필드 거부' }
      ]
    },
    {
      id: 'spec_arch_cicd_bluegreen',
      title: '아키텍처 흐름도: Blue-Green 무중단 배포 파이프라인',
      tier: 2,
      level: 'intermediate',
      track: 'spec',
      specKind: 'diagram',
      category: 'Architecture DSL',
      complexity: { time: 'Arch', space: 'Live SVG' },
      description: '코드 Push부터 CI 빌드, 컨테이너 레지스트리, Load Balancer 라우팅 전환 및 Health Check 게이트까지 Blue-Green 무중단 배포 아키텍처를 설계합니다.',
      adr: {
        scenario: '주간 트래픽 피크 시간에 신규 API 버전을 배포해야 하며, 배포 중 1초의 중단도 허용되지 않습니다.',
        prompt: '신규 버전 장애 시 1초 만에 구버전으로 즉시 복구(Rollback)할 수 있는 안전 배포 아키텍처는?',
        options: [
          { id: 'inplace', label: 'A. 기존 서버 프로세스를 멈추고(In-Place) 새 코드 덮어쓰기 후 재기동', recommended: false, critique: '기동 시간 동안 서비스 중단이 발생하며, 장애 시 이전 빌드로 즉시 돌리기 어렵습니다.' },
          { id: 'bluegreen', label: 'B. Green 환경에 먼저 배포 후 Health Check 통과 시 LB 라우팅을 Blue -> Green으로 전환', recommended: true, critique: '정확합니다! 무중단 전환과 동시에 문제가 발견되면 LB만 다시 Blue로 돌려 1초 롤백이 가능합니다.' }
        ]
      },
      explanation: {
        summary: 'CI 빌드 이미지를 신규 Green 슬롯에 띄운 뒤 Health Probe가 정상 응답할 때만 Load Balancer 트래픽을 전환하는 무중단 배포 토폴로지입니다.',
        keyConcepts: ['Blue-Green Deployment', 'Health Check Gate', 'Load Balancer Traffic Switch', 'Instant Rollback'],
        lineByLine: [
          { line: 1, code: 'flowchart LR', explain: '좌→우 방향의 CI/CD 배포 파이프라인 흐름도를 선언합니다.' },
          { line: 2, code: 'Git[Git Repo] -->|Push| CI(CI Build)', explain: '코드 푸시 이벤트가 CI 빌드·테스트 파이프라인을 트리거합니다.' },
          { line: 3, code: 'CI -->|Push Image| Reg[(Image Registry)]', explain: '테스트를 통과한 컨테이너 이미지를 레지스트리에 등록합니다.' },
          { line: 4, code: 'LB[Load Balancer] -->|Active| Blue(Blue v1)', explain: '현재 운영 트래픽이 기존 Blue v1 클러스터로 흐르고 있습니다.' },
          { line: 5, code: 'LB -.->|Switch| Green(Green v2)', explain: '준비된 신규 Green v2로 무중단 트래픽 스위칭 경로를 연결합니다.' },
          { line: 6, code: 'Health{Health Probe} -->|Pass| LB', explain: '헬스 체크 게이트가 통과 신호를 주어야 LB가 전환을 승인합니다.' }
        ],
        complexity: { time: 'Arch', timeWhy: '실시간 Mermaid Flowchart 파싱으로 파이프라인 의존성을 즉시 시각화합니다.', space: 'Live SVG', spaceWhy: '우측 패널에 노드 6개 · 엣지 5개 토폴로지를 렌더링합니다.' },
        pitfalls: ['Health Check 게이트 연결(Health --> LB) 없이 CI가 곧바로 LB를 전환하면 부팅 실패 컨테이너로 트래픽이 쏟아집니다.']
      },
      audit: {
        bugSummary: 'AI가 Health Probe → LB 게이트와 LB -.-> Green 경로를 빠뜨리고 CI가 곧바로 Blue 서버를 덮어씁니다.',
        checklist: ['Git -> CI -> Reg 파이프라인 확인', 'LB -> Green 전환 및 Health -> LB 검증 게이트 확인'],
        focusLine: 5,
        buggyCode: `flowchart LR
Git[Git Repo] -->|Push| CI(CI Build)
CI -->|Overwrite| Blue(Blue v1)
LB[Load Balancer] -->|Active| Blue(Blue v1)`
      },
      entryPoint: 'diagram',
      code: `flowchart LR
Git[Git Repo] -->|Push| CI(CI Build)
CI -->|Push Image| Reg[(Image Registry)]
LB[Load Balancer] -->|Active| Blue(Blue v1)
LB -.->|Switch| Green(Green v2)
Health{Health Probe} -->|Pass| LB`,
      skeleton: `flowchart LR
Git[Git Repo] -->|Push| ____
CI -->|Push Image| Reg[(Image Registry)]
LB[Load Balancer] -->|Active| Blue(Blue v1)
LB -.->|Switch| ____
Health{Health Probe} -->|Pass| LB`,
      tests: [
        { input: [{ kind: 'direction', direction: 'LR' }], expected: true, name: '좌→우(LR) 배포 흐름' },
        { input: [{ kind: 'edge', from: 'Git', to: 'CI' }], expected: true, name: 'Git → CI 빌드 트리거 존재' },
        { input: [{ kind: 'edge', from: 'LB', to: 'Green' }], expected: true, name: 'LB → Green 무중단 스위칭 존재' },
        { input: [{ kind: 'edge', from: 'Health', to: 'LB' }], expected: true, name: 'Health → LB 검증 게이트 존재' },
        { input: [{ kind: 'minCount', nodes: 6, edges: 5 }], expected: true, name: '6개 컴포넌트 · 5개 연결 완전성' }
      ]
    },
    {
      id: 'spec_seq_saga_outbox',
      title: '분산 Saga 보상 트랜잭션 & Outbox 시퀀스',
      tier: 4,
      level: 'advanced',
      track: 'spec',
      specKind: 'diagram',
      category: 'Distributed Sequence',
      complexity: { time: 'Sequence', space: 'Live SVG' },
      description: '마이크로서비스 분산 환경에서 Outbox 패턴으로 결제 이벤트를 발행하고 결제 실패 시 주문 취소 보상(Compensate)을 수행하는 시퀀스를 설계합니다.',
      adr: {
        scenario: '주문 서비스 DB 커밋 직후 메시지 브로커로 결제 이벤트를 보내려다 네트워크가 끊어져 주문은 생성됐는데 결제가 안 된 불일치가 발생했습니다.',
        prompt: 'DB 저장과 이벤트 발행 원자성 + 후속 단계 실패 시 정합성 복구 전략은?',
        options: [
          { id: '2pc', label: 'A. 마이크로서비스 간 동기 2단계 커밋(2PC) 전역 락 유지', recommended: false, critique: '외부 결제 장애 시 주문 서비스 DB 락까지 장시간 묶여 전체 시스템 가용성이 떨어집니다.' },
          { id: 'saga', label: 'B. Transactional Outbox 이벤트 발행 + 실패 시 보상 이벤트(Saga)로 최종 일관성 달성', recommended: true, critique: '정확합니다! 로컬 트랜잭션과 Outbox 테이블을 원자 커밋하고, 결제 실패 시 보상 명령으로 안전하게 주문을 취소합니다.' }
        ]
      },
      explanation: {
        summary: 'Transactional OutboxDB에 이벤트를 안전 기록한 뒤 Broker를 거쳐 PaySvc가 실패하면 Compensate Cancel 보상 화살표로 주문을 원복하는 Saga 시퀀스입니다.',
        keyConcepts: ['Saga Choreography Pattern', 'Transactional Outbox', 'Compensating Transaction (보상)', 'Eventual Consistency'],
        lineByLine: [
          { line: 1, code: 'sequenceDiagram', explain: '시간 순서에 따른 분산 트랜잭션 호출 시퀀스를 시작합니다.' },
          { line: 2, code: 'OrderSvc ->> OutboxDB: Save Order + Event', explain: '주문 서비스가 단일 로컬 DB 트랜잭션에 주문과 Outbox 이벤트를 함께 커밋합니다.' },
          { line: 3, code: 'OutboxDB ->> Broker: Publish OrderCreated', explain: '릴레이가 Outbox 이벤트를 메시지 브로커로 안전 전달합니다.' },
          { line: 4, code: 'Broker ->> PaySvc: Request Payment', explain: '결제 서비스가 주문 생성 이벤트를 구독해 결제를 시도합니다.' },
          { line: 5, code: 'PaySvc -->> Broker: Payment Failed', explain: '잔액 부족 등으로 결제 실패 시 실패 이벤트를 브로커로 회신합니다.' },
          { line: 6, code: 'Broker -->> OrderSvc: Compensate Cancel', explain: '브로커가 주문 서비스에 보상 트랜잭션(주문 취소) 명령을 전달합니다.' }
        ],
        complexity: { time: 'Sequence', timeWhy: '실시간 메시지 흐름을 라이프라인과 화살표 SVG로 렌더링합니다.', space: 'Live SVG', spaceWhy: '비동기 요청(->>)과 실패/보상 회신(-->>)을 구분 표시합니다.' },
        pitfalls: ['PaySvc 실패 후 Broker -->> OrderSvc 보상 흐름이 누락되면 결제 실패 주문이 "결제 대기/완료" 상태로 영원히 유령 잔류합니다.']
      },
      audit: {
        bugSummary: 'AI가 결제 실패 이후 주문 서비스로 되돌아가는 보상 트랜잭션 메시지(Broker -->> OrderSvc)를 누락해 데이터 불일치가 남습니다.',
        checklist: ['OutboxDB -> Broker -> PaySvc 흐름 확인', 'PaySvc -->> Broker 및 Broker -->> OrderSvc 보상 회신 확인'],
        focusLine: 6,
        buggyCode: `sequenceDiagram
OrderSvc ->> OutboxDB: Save Order + Event
OutboxDB ->> Broker: Publish OrderCreated
Broker ->> PaySvc: Request Payment
PaySvc -->> Broker: Payment Failed`
      },
      entryPoint: 'diagram',
      code: `sequenceDiagram
OrderSvc ->> OutboxDB: Save Order + Event
OutboxDB ->> Broker: Publish OrderCreated
Broker ->> PaySvc: Request Payment
PaySvc -->> Broker: Payment Failed
Broker -->> OrderSvc: Compensate Cancel`,
      skeleton: `sequenceDiagram
OrderSvc ->> ____: Save Order + Event
OutboxDB ->> Broker: Publish OrderCreated
Broker ->> PaySvc: Request Payment
PaySvc -->> Broker: Payment Failed
Broker -->> OrderSvc: ____`,
      tests: [
        { input: [{ kind: 'message', from: 'OrderSvc', to: 'OutboxDB' }], expected: true, name: 'OrderSvc → OutboxDB 원자 기록' },
        { input: [{ kind: 'message', from: 'Broker', to: 'PaySvc' }], expected: true, name: 'Broker → PaySvc 결제 요청' },
        { input: [{ kind: 'message', from: 'PaySvc', to: 'Broker', isDashed: true }], expected: true, name: 'PaySvc -->> Broker 실패 회신' },
        { input: [{ kind: 'message', from: 'Broker', to: 'OrderSvc', isDashed: true }], expected: true, name: 'Broker -->> OrderSvc 보상 취소 전달' },
        { input: [{ kind: 'minCount', nodes: 4, edges: 5 }], expected: true, name: '4개 참여자 · 5개 시퀀스 흐름 완전성' }
      ]
    }
  ];
})(window);
