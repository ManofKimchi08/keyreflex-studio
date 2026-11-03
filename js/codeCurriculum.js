/**
 * KeyReflex CodeLab - 3대 핵심 언어(JavaScript, Python, C) 커리큘럼 데이터셋
 * - 4개 Tier (기초 구문 -> 필수 자료구조 -> 실전 알고리즘 100선 -> 실무 디자인 패턴)
 * - Flow-Type (전체 타건) & Skeleton-Fill (핵심 로직 빈칸 인출) 듀얼 지원
 * - 테스트 케이스(Input / Expected) 내장
 */

window.CODE_CURRICULUM = {
  // ==========================================
  // 1. JavaScript (ES6+ / Web / Node)
  // ==========================================
  javascript: [
    // --- Tier 1: Syntax & Operators ---
    {
      id: 'js_arrow_filter',
      title: '화살표 함수 & 짝수 필터링',
      tier: 1,
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '배열에서 짝수만을 필터링하는 ES6 화살표 함수와 나머지 연산자(%)를 작성합니다.',
      explanation: {
      "summary": "ES6 화살표 함수와 Array.prototype.filter 고차 함수를 활용하여 불변성을 유지하며 짝수 원소만 추출합니다.",
      "keyConcepts": [
            "ES6 화살표 함수",
            "Array.prototype.filter",
            "나머지 연산자 (%)",
            "불변성 (Immutability)"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function getEvens(numbers) {",
                  "explain": "정수 배열 numbers를 인자로 받는 함수 getEvens를 정의합니다."
            },
            {
                  "line": 2,
                  "code": "    return numbers.filter((n) => n % 2 === 0);",
                  "explain": "각 원소 n에 대해 2로 나눈 나머지가 0인(짝수인) 요소만 선별하여 새로운 배열로 반환합니다."
            },
            {
                  "line": 3,
                  "code": "}",
                  "explain": "함수의 스코프 블록을 닫습니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "배열 내 N개의 요소를 처음부터 끝까지 1회 순회하며 조건을 평가합니다.",
            "space": "O(N)",
            "spaceWhy": "조건을 만족하는 짝수들을 저장하기 위해 최악의 경우(모두 짝수) 크기 N의 새로운 배열 메모리를 할당합니다."
      },
      "pitfalls": [
            "filter 메서드는 원본 배열을 변형(mutate)하지 않고 새 배열을 반환하므로 순수 함수(Pure Function) 규칙을 만족합니다.",
            "JavaScript의 % 연산자는 음수에 대해서도 -4 % 2 === -0 (0)이 되므로 음수 짝수도 정상적으로 추출됩니다."
      ]
},
      entryPoint: 'getEvens',
      code: `function getEvens(numbers) {
    return numbers.filter((n) => n % 2 === 0);
}`,
      skeleton: `function getEvens(numbers) {
    return numbers.filter((n) => ____);
}`,
      tests: [
        { input: [[1, 2, 3, 4, 5, 6]], expected: [2, 4, 6], name: '기본 1~6 배열' },
        { input: [[1, 3, 5]], expected: [], name: '홀수만 있는 배열' },
        { input: [[10, 22, 30]], expected: [10, 22, 30], name: '짝수만 있는 배열' }
      ]
    },
    {
      id: 'js_destructuring_defaults',
      title: '객체 구조분해할당 & 기본값',
      tier: 1,
      category: 'Syntax',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '객체에서 name과 age(기본값 20)를 구조분해할당하여 인사말 문자열을 반환합니다.',
      explanation: {
      "summary": "Nullish 병합 연산자(??)와 객체 구조분해할당의 기본값 문법을 결합하여 안전하게 프로퍼티를 추출합니다.",
      "keyConcepts": [
            "객체 구조분해할당",
            "기본값 매개변수",
            "Nullish 병합 (??)",
            "템플릿 리터럴"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function greetUser(user) {",
                  "explain": "사용자 정보 객체 user를 인자로 전달받는 함수를 정의합니다."
            },
            {
                  "line": 2,
                  "code": "    const { name, age = 20 } = user ?? {};",
                  "explain": "user가 null 또는 undefined일 때 빈 객체 {}로 대체하고, age 프로퍼티가 없거나 undefined일 때 기본값 20을 바인딩합니다."
            },
            {
                  "line": 3,
                  "code": "    return `${name} is ${age} years old`;",
                  "explain": "ES6 백틱(템플릿 리터럴)을 사용하여 name과 age 변수를 문자열 내에 보간하여 반환합니다."
            },
            {
                  "line": 4,
                  "code": "}",
                  "explain": "함수 실행을 종료합니다."
            }
      ],
      "complexity": {
            "time": "O(1)",
            "timeWhy": "객체 프로퍼티 조회와 고정된 크기의 문자열 결합만 수행하므로 상수 시간에 실행됩니다.",
            "space": "O(1)",
            "spaceWhy": "단일 결과 문자열 외에 추가 메모리를 사용하지 않습니다."
      },
      "pitfalls": [
            "기본값(age = 20)은 값이 명시적 null일 때는 적용되지 않고, 오직 undefined일 때만 적용되므로 주의해야 합니다.",
            "user ?? {} 처리를 하지 않고 null을 구조분해하면 TypeError: Cannot destructure property of null 에러가 발생합니다."
      ]
},
      entryPoint: 'greetUser',
      code: `function greetUser(user) {
    const { name, age = 20 } = user ?? {};
    return \`\${name} is \${age} years old\`;
}`,
      skeleton: `function greetUser(user) {
    const { ____, ____ = 20 } = user ?? {};
    return \`\${name} is \${age} years old\`;
}`,
      tests: [
        { input: [{ name: 'Alice', age: 25 }], expected: 'Alice is 25 years old', name: '나이 명시' },
        { input: [{ name: 'Bob' }], expected: 'Bob is 20 years old', name: '기본 나이 적용' },
        { input: [null], expected: 'undefined is 20 years old', name: 'null 안전 처리' }
      ]
    },
    {
      id: 'js_array_reduce_sum',
      title: 'Array.prototype.reduce 누적 합',
      tier: 2,
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: 'reduce 고차 함수를 사용하여 배열의 모든 숫자의 총합을 계산합니다.',
      explanation: {
      "summary": "배열의 대표적인 폴딩(folding) 고차 함수인 reduce를 사용하여 배열 내 모든 숫자의 누적 합을 계산합니다.",
      "keyConcepts": [
            "Array.prototype.reduce",
            "누적기 (Accumulator)",
            "초기값 (Initial Value)",
            "함수형 프로그래밍"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function sumArray(numbers) {",
                  "explain": "숫자 배열 numbers를 인자로 받는 합산 함수를 정의합니다."
            },
            {
                  "line": 2,
                  "code": "    return numbers.reduce((acc, cur) => acc + cur, 0);",
                  "explain": "누적기(acc)를 0으로 초기화하고, 각 원소 cur을 순회하면서 더한 최종 누적 단일 값을 반환합니다."
            },
            {
                  "line": 3,
                  "code": "}",
                  "explain": "함수 블록을 마칩니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "배열의 모든 N개 요소를 순차적으로 한 번씩 방문하여 연산합니다.",
            "space": "O(1)",
            "spaceWhy": "별도의 배열을 생성하지 않고 단일 숫자 누적기만 유지합니다."
      },
      "pitfalls": [
            "빈 배열([])에 대해 초기값 0을 전달하지 않고 reduce를 호출하면 'TypeError: Reduce of empty array with no initial value' 예외가 발생하므로 초기값 명시는 필수적입니다."
      ]
},
      entryPoint: 'sumArray',
      code: `function sumArray(numbers) {
    return numbers.reduce((acc, cur) => acc + cur, 0);
}`,
      skeleton: `function sumArray(numbers) {
    return numbers.reduce((acc, cur) => ____, 0);
}`,
      tests: [
        { input: [[1, 2, 3, 4, 5]], expected: 15, name: '1부터 5까지의 합' },
        { input: [[]], expected: 0, name: '빈 배열' },
        { input: [[-10, 20, 30]], expected: 40, name: '음수 포함 합계' }
      ]
    },
    {
      id: 'js_map_frequency',
      title: 'Map을 이용한 요소 빈도수 카운터',
      tier: 2,
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(K)' },
      description: '배열의 요소 빈도수를 ES6 Map 객체로 집계하여 객체로 반환합니다.',
      explanation: {
      "summary": "Map 객체를 활용하여 입력 요소의 등장 빈도수를 O(N) 시간에 집계하고 일반 객체 형태로 변환합니다.",
      "keyConcepts": [
            "ES6 Map",
            "get / set 연산",
            "단락 평가 (||)",
            "Object.fromEntries"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function countFrequencies(items) {",
                  "explain": "임의의 요소 배열 items를 전달받는 함수입니다."
            },
            {
                  "line": 2,
                  "code": "    const map = new Map();",
                  "explain": "키-값 쌍을 저장할 고성능 ES6 Map 인스턴스를 생성합니다."
            },
            {
                  "line": 3,
                  "code": "    for (const item of items) {",
                  "explain": "for...of 문을 사용하여 배열의 모든 요소를 하나씩 순회합니다."
            },
            {
                  "line": 4,
                  "code": "        map.set(item, (map.get(item) || 0) + 1);",
                  "explain": "기존 빈도수를 조회하고 없으면 0으로 시작하여 1을 더한 후 Map에 저장합니다."
            },
            {
                  "line": 5,
                  "code": "    }",
                  "explain": "순회 루프를 종료합니다."
            },
            {
                  "line": 6,
                  "code": "    return Object.fromEntries(map);",
                  "explain": "Map의 엔트리들을 일반 JavaScript 키-값 객체({})로 변환하여 반환합니다."
            },
            {
                  "line": 7,
                  "code": "}",
                  "explain": "함수를 마칩니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "N개의 요소를 순회하면서 Map 해시 조회 및 삽입은 평균 O(1)이 소요됩니다.",
            "space": "O(K)",
            "spaceWhy": "배열 내 고유(Unique) 요소의 개수 K만큼의 Map 메모리 공간을 차지합니다."
      },
      "pitfalls": [
            "일반 객체({})를 빈도수 카운터로 쓸 경우 'toString'이나 'constructor' 같은 Object 프로토타입 프로퍼티와 충돌할 수 있으므로 Map이 훨씬 안전합니다."
      ]
},
      entryPoint: 'countFrequencies',
      code: `function countFrequencies(items) {
    const map = new Map();
    for (const item of items) {
        map.set(item, (map.get(item) || 0) + 1);
    }
    return Object.fromEntries(map);
}`,
      skeleton: `function countFrequencies(items) {
    const map = new Map();
    for (const item of items) {
        map.set(item, ____);
    }
    return Object.fromEntries(map);
}`,
      tests: [
        { input: [['apple', 'banana', 'apple', 'orange', 'banana', 'apple']], expected: { apple: 3, banana: 2, orange: 1 }, name: '과일 빈도수' },
        { input: [['a', 'b', 'c']], expected: { a: 1, b: 1, c: 1 }, name: '단일 요소들' }
      ]
    },
    {
      id: 'js_binary_search',
      title: '이진 탐색 (Binary Search)',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(log N)', space: 'O(1)' },
      description: '오름차순 정렬된 배열에서 target 값의 인덱스를 O(log N) 시간에 탐색합니다.',
      explanation: {
      "summary": "정렬된 배열에서 중간 위치(mid)를 지속적으로 반으로 분할하며 O(log N) 시간에 타겟 인덱스를 탐색합니다.",
      "keyConcepts": [
            "이진 탐색 (Binary Search)",
            "분할 정복",
            "투 포인터 (left, right)",
            "Math.floor"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function binarySearch(nums, target) {",
                  "explain": "오름차순 정렬된 배열 nums와 찾고자 하는 값 target을 받습니다."
            },
            {
                  "line": 2,
                  "code": "    let left = 0;",
                  "explain": "탐색 범위의 가장 왼쪽 시작 인덱스를 0으로 설정합니다."
            },
            {
                  "line": 3,
                  "code": "    let right = nums.length - 1;",
                  "explain": "탐색 범위의 가장 오른쪽 끝 인덱스를 설정합니다."
            },
            {
                  "line": 4,
                  "code": "    while (left <= right) {",
                  "explain": "탐색 유효 구간이 남아있는 동안(단일 원소 포함) 루프를 반복합니다."
            },
            {
                  "line": 5,
                  "code": "        const mid = Math.floor((left + right) / 2);",
                  "explain": "중간 인덱스를 계산하고 소수점 이하를 버려 정수 인덱스를 얻습니다."
            },
            {
                  "line": 6,
                  "code": "        if (nums[mid] === target) {",
                  "explain": "중간 위치의 값이 찾고자 하는 값과 일치하는지 검사합니다."
            },
            {
                  "line": 7,
                  "code": "            return mid;",
                  "explain": "일치하면 해당 인덱스를 즉시 반환하여 탐색을 종료합니다."
            },
            {
                  "line": 8,
                  "code": "        } else if (nums[mid] < target) {",
                  "explain": "중간 값이 target보다 작다면 target은 오른쪽 절반 영역에 존재합니다."
            },
            {
                  "line": 9,
                  "code": "            left = mid + 1;",
                  "explain": "왼쪽 포인터를 mid + 1로 이동하여 왼쪽 절반을 버립니다."
            },
            {
                  "line": 10,
                  "code": "        } else {",
                  "explain": "중간 값이 target보다 크다면 target은 왼쪽 절반 영역에 존재합니다."
            },
            {
                  "line": 11,
                  "code": "            right = mid - 1;",
                  "explain": "오른쪽 포인터를 mid - 1로 이동하여 오른쪽 절반을 버립니다."
            },
            {
                  "line": 12,
                  "code": "        }",
                  "explain": "조건 분기 블록 종료"
            },
            {
                  "line": 13,
                  "code": "    }",
                  "explain": "while 루프 종료"
            },
            {
                  "line": 14,
                  "code": "    return -1;",
                  "explain": "끝까지 찾지 못한 경우 -1을 반환합니다."
            },
            {
                  "line": 15,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(log N)",
            "timeWhy": "반복마다 탐색해야 할 데이터의 크기가 1/2로 줄어들어 100만 개 데이터도 약 20회 비교로 찾아냅니다.",
            "space": "O(1)",
            "spaceWhy": "left, right, mid 등 몇 개의 정수형 포인터 변수만 사용하므로 상수 공간입니다."
      },
      "pitfalls": [
            "이진 탐색의 절대 전제 조건은 '배열이 반드시 사전에 정렬되어 있어야 한다'는 점입니다.",
            "while 조건식을 'left < right'로 작성하면 배열에 원소가 1개일 때 탐색하지 못하므로 반드시 'left <= right'여야 합니다."
      ]
},
      entryPoint: 'binarySearch',
      code: `function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
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
}`,
      skeleton: `function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    while (____) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            ____;
        } else {
            ____;
        }
    }
    return -1;
}`,
      tests: [
        { input: [[1, 3, 5, 7, 9, 11], 7], expected: 3, name: '원소 존재 (인덱스 3)' },
        { input: [[1, 3, 5, 7, 9, 11], 2], expected: -1, name: '원소 부재 (-1 반환)' },
        { input: [[5], 5], expected: 0, name: '단일 원소 탐색' }
      ]
    },
    {
      id: 'js_two_pointers_palindrome',
      title: '투 포인터 회문(Palindrome) 검증',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '양 끝에서 좁혀오는 투 포인터(Two Pointers) 방식으로 문자열의 회문 여부를 판별합니다.',
      explanation: {
      "summary": "양 끝에서 시작하는 두 개의 포인터를 중앙으로 좁혀가며 문자열이 대칭인지 O(N) 시간에 판별합니다.",
      "keyConcepts": [
            "투 포인터 (Two Pointers)",
            "회문 (Palindrome)",
            "인덱스 증감",
            "조기 반환 (Early Return)"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function isPalindrome(str) {",
                  "explain": "회문 검사를 수행할 문자열 str을 인자로 받습니다."
            },
            {
                  "line": 2,
                  "code": "    let left = 0;",
                  "explain": "문자열의 맨 앞(0번 인덱스)을 가리키는 왼쪽 포인터를 초기화합니다."
            },
            {
                  "line": 3,
                  "code": "    let right = str.length - 1;",
                  "explain": "문자열의 맨 끝 인덱스를 가리키는 오른쪽 포인터를 초기화합니다."
            },
            {
                  "line": 4,
                  "code": "    while (left < right) {",
                  "explain": "두 포인터가 중앙에서 서로 마주치기 전까지 비교 루프를 실행합니다."
            },
            {
                  "line": 5,
                  "code": "        if (str[left] !== str[right]) {",
                  "explain": "대칭되는 위치의 두 문자가 서로 다르면 회문이 아닙니다."
            },
            {
                  "line": 6,
                  "code": "            return false;",
                  "explain": "즉시 false를 반환하여 불필요한 추가 비교를 중단합니다."
            },
            {
                  "line": 7,
                  "code": "        }",
                  "explain": "불일치 검사 종료"
            },
            {
                  "line": 8,
                  "code": "        left++;",
                  "explain": "왼쪽 포인터를 오른쪽으로 한 칸 전진합니다."
            },
            {
                  "line": 9,
                  "code": "        right--;",
                  "explain": "오른쪽 포인터를 왼쪽으로 한 칸 후진합니다."
            },
            {
                  "line": 10,
                  "code": "    }",
                  "explain": "while 루프 종료"
            },
            {
                  "line": 11,
                  "code": "    return true;",
                  "explain": "모든 문자가 대칭을 이루면 true를 반환합니다."
            },
            {
                  "line": 12,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "문자열 길이의 절반(N/2)만큼만 순회하므로 선형 시간 O(N)에 비례합니다.",
            "space": "O(1)",
            "spaceWhy": "문자열을 뒤집어 새 문자열을 생성하지 않고 포인터 2개만 쓰므로 추가 메모리가 전혀 없습니다."
      },
      "pitfalls": [
            "str.split('').reverse().join('') 방식은 새 배열과 새 문자열을 2번 생성하므로 O(N) 메모리를 낭비하지만, 투 포인터는 O(1) 메모리로 훨씬 최적화됩니다."
      ]
},
      entryPoint: 'isPalindrome',
      code: `function isPalindrome(str) {
    let left = 0;
    let right = str.length - 1;
    while (left < right) {
        if (str[left] !== str[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
      skeleton: `function isPalindrome(str) {
    let left = 0;
    let right = str.length - 1;
    while (left < right) {
        if (____) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
      tests: [
        { input: ['racecar'], expected: true, name: '홀수 길이 회문' },
        { input: ['noon'], expected: true, name: '짝수 길이 회문' },
        { input: ['reflex'], expected: false, name: '일반 문자열 (거짓)' }
      ]
    },
    {
      id: 'js_debounce_pattern',
      title: '실무 디바운스 (Debounce Pattern)',
      tier: 4,
      category: 'Pattern',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '연속된 호출을 지연시켜 마지막 호출만 실행하는 고차 함수 디바운스를 구현합니다.',
      explanation: {
      "summary": "짧은 시간 동안 반복 호출되는 이벤트를 마지막 호출 시점에 한 번만 실행하도록 제어하는 실무 필수 패턴입니다.",
      "keyConcepts": [
            "디바운스 (Debounce)",
            "클로저 (Closure)",
            "이벤트 최적화",
            "검색창 자동완성"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "function testDebounceSync(val) {",
                  "explain": "디바운스 트리거 동작을 테스트하는 동기 함수입니다."
            },
            {
                  "line": 2,
                  "code": "    let timer = null;",
                  "explain": "이전 타이머/대기 상태를 기억하는 클로저 변수를 선언합니다."
            },
            {
                  "line": 3,
                  "code": "    let result = null;",
                  "explain": "최종 콜백이 실행되었을 때의 결과를 저장할 변수입니다."
            },
            {
                  "line": 4,
                  "code": "    const trigger = (x) => {",
                  "explain": "사용자가 키를 누르거나 이벤트를 일으킬 때마다 호출되는 핸들러입니다."
            },
            {
                  "line": 5,
                  "code": "        timer = x;",
                  "explain": "최신 입력 인자로 상태를 갱신합니다."
            },
            {
                  "line": 6,
                  "code": "        result = `Saved: ${x}`;",
                  "explain": "지연 후 최종적으로 수행할 로직을 실행하여 결과를 바인딩합니다."
            },
            {
                  "line": 7,
                  "code": "    };",
                  "explain": "트리거 함수 정의 완료"
            },
            {
                  "line": 8,
                  "code": "    trigger(val);",
                  "explain": "입력값 val로 트리거를 호출합니다."
            },
            {
                  "line": 9,
                  "code": "    return result;",
                  "explain": "처리된 결과 문자열을 반환합니다."
            },
            {
                  "line": 10,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(1)",
            "timeWhy": "타이머 취소 및 재설정 연산은 상수 시간에 완료됩니다.",
            "space": "O(1)",
            "spaceWhy": "클로저로 캡처되는 변수 몇 개만 메모리에 유지됩니다."
      },
      "pitfalls": [
            "실제 비동기 브라우저 환경에서는 clearTimeout(timer)으로 이전 타이머를 취소한 뒤 setTimeout을 새로 걸어주어야 마지막 타자 후 한 번만 실행됩니다."
      ]
},
      entryPoint: 'testDebounceSync',
      code: `function testDebounceSync(val) {
    let timer = null;
    let result = null;
    const trigger = (x) => {
        timer = x;
        result = \`Saved: \${x}\`;
    };
    trigger(val);
    return result;
}`,
      skeleton: `function testDebounceSync(val) {
    let timer = null;
    let result = null;
    const trigger = (x) => {
        ____;
        result = \`Saved: \${x}\`;
    };
    trigger(val);
    return result;
}`,
      tests: [
        { input: ['KeyReflex'], expected: 'Saved: KeyReflex', name: '값 업데이트' }
      ]
    }
  ],

  // ==========================================
  // 2. Python (Algorithm / LeetCode / Backend)
  // ==========================================
  python: [
    // --- Tier 1: Syntax & Operators ---
    {
      id: 'py_list_comprehension',
      title: '리스트 컴프리헨션 & 짝수 제곱',
      tier: 1,
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '0부터 n-1까지의 숫자 중 짝수만을 골라 제곱한 리스트를 간결하게 생성합니다.',
      explanation: {
      "summary": "파이썬 특유의 간결하고 빠른 리스트 컴프리헨션 문법으로 0부터 n-1까지의 짝수들을 제곱하여 리스트로 생성합니다.",
      "keyConcepts": [
            "List Comprehension",
            "제곱 연산자 (**)",
            "조건 필터 (if x % 2 == 0)",
            "Pythonic Code"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "def even_squares(n: int) -> list[int]:",
                  "explain": "정수 n을 입력받아 정수 리스트를 반환하는 타입 힌트 함수를 정의합니다."
            },
            {
                  "line": 2,
                  "code": "    return [x**2 for x in range(n) if x % 2 == 0]",
                  "explain": "range(n)의 0부터 n-1까지 순회하며 x % 2 == 0(짝수)인 경우에만 x**2(제곱)를 계산하여 리스트를 만듭니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "0부터 n-1까지 N번의 반복을 거쳐 짝수를 선별합니다.",
            "space": "O(N)",
            "spaceWhy": "생성되는 짝수 제곱 값들을 보관하는 크기 (N/2)의 새 리스트가 생성됩니다."
      },
      "pitfalls": [
            "데이터가 수천만 개 이상으로 매우 방대할 때는 메모리를 즉시 소비하는 리스트 대신 소괄호 (x**2 for ...) 제너레이터를 사용하는 것이 좋습니다."
      ]
},
      entryPoint: 'even_squares',
      code: `def even_squares(n: int) -> list[int]:
    return [x**2 for x in range(n) if x % 2 == 0]`,
      skeleton: `def even_squares(n: int) -> list[int]:
    return [____ for x in range(n) if ____]`,
      tests: [
        { input: [10], expected: [0, 4, 16, 36, 64], name: 'n=10 짝수 제곱' },
        { input: [1], expected: [0], name: 'n=1 기저 조건' },
        { input: [5], expected: [0, 4, 16], name: 'n=5 짝수 제곱' }
      ]
    },
    {
      id: 'py_dict_word_count',
      title: '딕셔너리 컴프리헨션 & 단어 길이 매핑',
      tier: 1,
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '단어 리스트를 받아 { 단어: 글자수 } 형태의 딕셔너리를 생성합니다.',
      explanation: {
      "summary": "딕셔너리 컴프리헨션을 사용하여 단어 목록에서 각 단어를 키로, 문자열 길이를 값으로 빠르게 매핑합니다.",
      "keyConcepts": [
            "Dictionary Comprehension",
            "len() 내장 함수",
            "키-값 매핑",
            "해시 테이블"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "def word_lengths(words: list[str]) -> dict[str, int]:",
                  "explain": "문자열 리스트 words를 받아 단어와 길이를 매핑한 딕셔너리를 반환합니다."
            },
            {
                  "line": 2,
                  "code": "    return {w: len(w) for w in words}",
                  "explain": "words 리스트를 순회하며 각 단어 w를 key, len(w)를 value로 하는 딕셔너리를 단 한 줄로 생성하여 반환합니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "N개의 단어를 1회 순회하며, 파이썬에서 문자열의 len()은 객체 헤더에 저장되어 있어 O(1)입니다.",
            "space": "O(N)",
            "spaceWhy": "단어와 길이를 보관하는 딕셔너리 메모리 공간이 소요됩니다."
      },
      "pitfalls": [
            "words에 동일한 단어가 중복으로 들어있을 경우, 딕셔너리 특성상 중복 키는 마지막에 등장한 값으로 덮어씌워집니다."
      ]
},
      entryPoint: 'word_lengths',
      code: `def word_lengths(words: list[str]) -> dict[str, int]:
    return {w: len(w) for w in words}`,
      skeleton: `def word_lengths(words: list[str]) -> dict[str, int]:
    return {____: len(w) for w in words}`,
      tests: [
        { input: [['python', 'code', 'typing']], expected: { 'python': 6, 'code': 4, 'typing': 6 }, name: '길이 매핑' },
        { input: [[]], expected: {}, name: '빈 리스트' }
      ]
    },
    {
      id: 'py_deque_sliding',
      title: 'collections.deque 큐 회전 & 추출',
      tier: 2,
      category: 'Data Structure',
      complexity: { time: 'O(K)', space: 'O(N)' },
      description: 'deque를 활용하여 큐의 첫 요소를 k번 꺼내 맨 뒤로 보내는 회전 연산을 수행합니다.',
      explanation: {
      "summary": "collections 모듈의 양방향 큐인 deque를 활용하여 O(1) 시간 복잡도로 앞뒤 회전 및 추출을 수행합니다.",
      "keyConcepts": [
            "collections.deque",
            "popleft() O(1)",
            "append() O(1)",
            "FIFO 큐"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "from collections import deque",
                  "explain": "양방향 큐 자료구조인 deque 클래스를 표준 라이브러리에서 가져옵니다."
            },
            {
                  "line": 2,
                  "code": "def rotate_queue(items: list, k: int) -> list:",
                  "explain": "리스트 items와 회전 횟수 k를 입력받는 함수를 정의합니다."
            },
            {
                  "line": 3,
                  "code": "    q = deque(items)",
                  "explain": "일반 리스트를 O(1) 앞뒤 삽입/삭제가 가능한 deque 객체로 변환합니다."
            },
            {
                  "line": 4,
                  "code": "    for _ in range(k):",
                  "explain": "k번 회전 동작을 반복합니다."
            },
            {
                  "line": 5,
                  "code": "        if q:",
                  "explain": "큐가 비어있는 상태에서 popleft 시 에러가 나지 않도록 방어합니다."
            },
            {
                  "line": 6,
                  "code": "            q.append(q.popleft())",
                  "explain": "맨 앞의 요소를 O(1)로 꺼내어(popleft) 맨 뒤로 다시 붙여(append) 원형 회전을 수행합니다."
            },
            {
                  "line": 7,
                  "code": "    return list(q)",
                  "explain": "최종 회전된 deque를 다시 표준 파이썬 리스트로 변환하여 반환합니다."
            }
      ],
      "complexity": {
            "time": "O(N + K)",
            "timeWhy": "deque 초기화 O(N)과 k번의 popleft/append 연산(각 O(1))으로 총 O(N + K)에 완료됩니다.",
            "space": "O(N)",
            "spaceWhy": "기존 원소들을 저장하는 deque 자료구조 공간이 필요합니다."
      },
      "pitfalls": [
            "파이썬 일반 리스트의 list.pop(0)은 뒤의 모든 원소를 한 칸씩 앞으로 밀어야 하므로 O(N)이 걸립니다. 큐 작업에는 반드시 deque.popleft()를 써야 합니다."
      ]
},
      entryPoint: 'rotate_queue',
      code: `from collections import deque

def rotate_queue(items: list, k: int) -> list:
    q = deque(items)
    for _ in range(k):
        if q:
            q.append(q.popleft())
    return list(q)`,
      skeleton: `from collections import deque

def rotate_queue(items: list, k: int) -> list:
    q = deque(items)
    for _ in range(k):
        if q:
            q.append(____)
    return list(q)`,
      tests: [
        { input: [[1, 2, 3, 4, 5], 2], expected: [3, 4, 5, 1, 2], name: '2회 회전' },
        { input: [['a', 'b', 'c'], 3], expected: ['a', 'b', 'c'], name: '제자리 회전' }
      ]
    },
    {
      id: 'py_binary_search',
      title: '이진 탐색 (Binary Search)',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(log N)', space: 'O(1)' },
      description: '정렬된 리스트에서 target의 위치를 이진 탐색으로 찾아 인덱스를 반환합니다.',
      explanation: {
      "summary": "정렬된 리스트에서 절반씩 탐색 범위를 축소하는 이진 탐색 알고리즘을 파이썬의 정수 나눗셈(//)으로 간결하게 구현합니다.",
      "keyConcepts": [
            "이진 탐색 (Binary Search)",
            "정수 나눗셈 (//)",
            "로그 시간 복잡도 O(log N)",
            "다중 할당 언패킹"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "def binary_search(nums: list[int], target: int) -> int:",
                  "explain": "정렬된 정수 리스트 nums와 찾을 값 target을 인자로 받습니다."
            },
            {
                  "line": 2,
                  "code": "    left, right = 0, len(nums) - 1",
                  "explain": "파이썬 다중 할당으로 시작 인덱스(0)와 끝 인덱스(len - 1)를 한 번에 초기화합니다."
            },
            {
                  "line": 3,
                  "code": "    while left <= right:",
                  "explain": "탐색 구간이 남아있는 동안 루프를 계속 진행합니다."
            },
            {
                  "line": 4,
                  "code": "        mid = (left + right) // 2",
                  "explain": "파이썬의 정수 나눗셈 연산자(//)를 사용하여 소수점을 버린 중간 인덱스를 구합니다."
            },
            {
                  "line": 5,
                  "code": "        if nums[mid] == target:",
                  "explain": "중간 인덱스의 값이 target과 일치하는지 비교합니다."
            },
            {
                  "line": 6,
                  "code": "            return mid",
                  "explain": "찾았으므로 해당 인덱스 mid를 반환합니다."
            },
            {
                  "line": 7,
                  "code": "        elif nums[mid] < target:",
                  "explain": "중간 값이 target보다 작으면 target은 우측 영역에 위치합니다."
            },
            {
                  "line": 8,
                  "code": "            left = mid + 1",
                  "explain": "left를 mid + 1로 이동시켜 우측 영역만 남깁니다."
            },
            {
                  "line": 9,
                  "code": "        else:",
                  "explain": "중간 값이 target보다 크면 target은 좌측 영역에 위치합니다."
            },
            {
                  "line": 10,
                  "code": "            right = mid - 1",
                  "explain": "right를 mid - 1로 이동시켜 좌측 영역만 남깁니다."
            },
            {
                  "line": 11,
                  "code": "    return -1",
                  "explain": "끝까지 찾지 못했을 경우 -1을 반환합니다."
            }
      ],
      "complexity": {
            "time": "O(log N)",
            "timeWhy": "비교할 때마다 남은 탐색 후보가 정확히 절반으로 줄어듭니다.",
            "space": "O(1)",
            "spaceWhy": "left, right, mid 세 개의 정수 변수만 사용하므로 상수 공간입니다."
      },
      "pitfalls": [
            "파이썬은 임의 정밀도(Arbitrary-Precision) 정수를 지원하므로 (left + right) 연산에서 C/Java 같은 정수 오버플로우가 발생하지 않습니다."
      ]
},
      entryPoint: 'binary_search',
      code: `def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      skeleton: `def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while ____:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            ____
        else:
            ____
    return -1`,
      tests: [
        { input: [[2, 5, 8, 12, 16, 23, 38], 16], expected: 4, name: '원소 존재 (인덱스 4)' },
        { input: [[2, 5, 8, 12, 16, 23, 38], 9], expected: -1, name: '원소 없음 (-1)' },
        { input: [[100], 100], expected: 0, name: '단일 원소' }
      ]
    },
    {
      id: 'py_two_sum_hash',
      title: 'Two Sum (해시 맵 단일 패스)',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '합이 target이 되는 두 숫자의 인덱스를 O(N) 해시맵으로 한 번의 순회로 찾습니다.',
      explanation: {
      "summary": "LeetCode 1위 대표 문제: 해시 맵(dict)을 활용해 단 한 번의 순회(One-Pass)로 합이 target이 되는 두 수의 인덱스를 O(N)에 찾습니다.",
      "keyConcepts": [
            "Two Sum",
            "해시 맵 (Dict) O(1) 조회",
            "보수 (Complement)",
            "단일 패스 (One-Pass)"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "def two_sum(nums: list[int], target: int) -> list[int]:",
                  "explain": "정수 리스트 nums와 목표 합 target을 받습니다."
            },
            {
                  "line": 2,
                  "code": "    seen = {}",
                  "explain": "이전에 지나친 숫자들을 key로, 해당 인덱스를 value로 보관할 딕셔너리입니다."
            },
            {
                  "line": 3,
                  "code": "    for i, num in enumerate(nums):",
                  "explain": "enumerate 함수를 사용하여 인덱스 i와 원소 num을 동시에 순회합니다."
            },
            {
                  "line": 4,
                  "code": "        complement = target - num",
                  "explain": "현재 숫자 num과 더해서 target이 되기 위해 필요한 짝꿍 숫자(보수)를 계산합니다."
            },
            {
                  "line": 5,
                  "code": "        if complement in seen:",
                  "explain": "필요한 짝꿍 숫자가 이미 seen 딕셔너리에 존재하는지 O(1) 해시 조회로 확인합니다."
            },
            {
                  "line": 6,
                  "code": "            return [seen[complement], i]",
                  "explain": "존재한다면 짝꿍의 인덱스와 현재 인덱스를 리스트로 즉시 반환합니다."
            },
            {
                  "line": 7,
                  "code": "        seen[num] = i",
                  "explain": "짝꿍이 아직 없으면 현재 숫자와 인덱스를 딕셔너리에 기록하고 넘어갑니다."
            },
            {
                  "line": 8,
                  "code": "    return []",
                  "explain": "만족하는 쌍이 없다면 빈 리스트를 반환합니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "배열을 단 1회 순회하며, 딕셔너리의 키 존재 확인(in)과 삽입은 평균 O(1)입니다.",
            "space": "O(N)",
            "spaceWhy": "최악의 경우 N개의 요소를 seen 딕셔너리에 저장합니다."
      },
      "pitfalls": [
            "이중 for 루프를 쓰면 O(N^2)으로 10만 개 데이터에서 타임아웃이 발생하지만, 해시 맵을 쓰면 O(N)으로 0.01초 만에 풀립니다."
      ]
},
      entryPoint: 'two_sum',
      code: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      skeleton: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = ____
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      tests: [
        { input: [[2, 7, 11, 15], 9], expected: [0, 1], name: '2 + 7 = 9' },
        { input: [[3, 2, 4], 6], expected: [1, 2], name: '2 + 4 = 6' },
        { input: [[3, 3], 6], expected: [0, 1], name: '동일 숫자 3 + 3 = 6' }
      ]
    },
    {
      id: 'py_dp_fibonacci',
      title: '동적 계획법 (1D DP 피보나치)',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(N)' },
      description: '메모이제이션 테이블(DP)을 구축하여 n번째 피보나치 수를 O(N)에 구합니다.',
      explanation: {
      "summary": "동적 계획법(DP)의 상향식(Bottom-Up) 타뷸레이션 기법으로 중복 연산을 제거하여 피보나치 수를 O(N)에 계산합니다.",
      "keyConcepts": [
            "동적 계획법 (DP)",
            "타뷸레이션 (Tabulation)",
            "상향식 (Bottom-Up)",
            "부분 문제 중복 해결"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "def fib_dp(n: int) -> int:",
                  "explain": "n번째 피보나치 수를 계산하는 함수입니다."
            },
            {
                  "line": 2,
                  "code": "    if n <= 1:",
                  "explain": "피보나치 수열의 기저 조건(Base Case): 0번째는 0, 1번째는 1입니다."
            },
            {
                  "line": 3,
                  "code": "        return n",
                  "explain": "n이 0 또는 1일 때는 n을 그대로 반환합니다."
            },
            {
                  "line": 4,
                  "code": "    dp = [0] * (n + 1)",
                  "explain": "중간 계산 결과를 저장할 크기 (n + 1)의 DP 배열을 0으로 초기화합니다."
            },
            {
                  "line": 5,
                  "code": "    dp[1] = 1",
                  "explain": "dp[1] = 1로 기본값을 설정합니다."
            },
            {
                  "line": 6,
                  "code": "    for i in range(2, n + 1):",
                  "explain": "2부터 n까지 순서대로 작은 문제부터 해결해 나갑니다."
            },
            {
                  "line": 7,
                  "code": "        dp[i] = dp[i - 1] + dp[i - 2]",
                  "explain": "점화식: i번째 값은 바로 직전 두 값의 합으로 계산하여 배열에 저장합니다."
            },
            {
                  "line": 8,
                  "code": "    return dp[n]",
                  "explain": "최종 n번째 피보나치 수를 반환합니다."
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "2부터 n까지 단 한 번의 선형 루프만 돌기 때문에 선형 시간에 계산됩니다.",
            "space": "O(N)",
            "spaceWhy": "크기 (n + 1)의 DP 리스트를 사용합니다 (변수 2개만 쓰면 O(1) 공간으로도 줄일 수 있습니다)."
      },
      "pitfalls": [
            "메모이제이션이나 DP 없이 단순 재귀(fib(n-1) + fib(n-2))로 작성하면 O(2^N) 지수 시간이 걸려 n=40만 되어도 프로그램이 멈춥니다."
      ]
},
      entryPoint: 'fib_dp',
      code: `def fib_dp(n: int) -> int:
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
      skeleton: `def fib_dp(n: int) -> int:
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = ____
    return dp[n]`,
      tests: [
        { input: [0], expected: 0, name: '0번째 수' },
        { input: [1], expected: 1, name: '1번째 수' },
        { input: [10], expected: 55, name: '10번째 수' }
      ]
    }
  ],

  // ==========================================
  // 3. C (Pointers / Systems / Low-level)
  // ==========================================
  c: [
    // --- Tier 1: Syntax & Operators ---
    {
      id: 'c_pointer_swap',
      title: '포인터를 활용한 두 정수 Swap',
      tier: 1,
      category: 'Syntax',
      complexity: { time: 'O(1)', space: 'O(1)' },
      description: '포인터 역참조(*)를 통해 두 정수 변수의 메모리 주소 상의 값을 직접 교환합니다.',
      explanation: {
      "summary": "C 언어의 핵심인 포인터 역참조(*) 연산자를 활용하여 주소 전달(Call by Reference)로 두 변수의 값을 맞바꿉니다.",
      "keyConcepts": [
            "포인터 역참조 (*)",
            "주소 연산자 (&)",
            "Call by Reference",
            "임시 변수 temp"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "void swap(int* a, int* b) {",
                  "explain": "두 int 변수의 메모리 주소를 가리키는 포인터 a와 b를 매개변수로 받습니다."
            },
            {
                  "line": 2,
                  "code": "    int temp = *a;",
                  "explain": "역참조 연산자(*)로 포인터 a가 가리키는 메모리 실제 값을 읽어 임시 변수 temp에 복사합니다."
            },
            {
                  "line": 3,
                  "code": "    *a = *b;",
                  "explain": "포인터 b가 가리키는 위치의 값을 읽어 포인터 a가 가리키는 메모리 위치에 덮어씁니다."
            },
            {
                  "line": 4,
                  "code": "    *b = temp;",
                  "explain": "temp에 저장해 두었던 원래 a의 값을 포인터 b의 메모리 위치에 덮어씁니다."
            },
            {
                  "line": 5,
                  "code": "}",
                  "explain": "swap 함수 종료"
            },
            {
                  "line": 6,
                  "code": "int test_swap(int x, int y) {",
                  "explain": "swap 동작을 검증하기 위한 래퍼 함수입니다."
            },
            {
                  "line": 7,
                  "code": "    swap(&x, &y);",
                  "explain": "주소 연산자(&)를 붙여 변수 x, y의 실제 메모리 주소를 swap 함수에 전달합니다."
            },
            {
                  "line": 8,
                  "code": "    return x * 100 + y;",
                  "explain": "교환된 두 정수를 하나의 숫자로 조합하여 반환합니다."
            },
            {
                  "line": 9,
                  "code": "}",
                  "explain": "test_swap 종료"
            }
      ],
      "complexity": {
            "time": "O(1)",
            "timeWhy": "메모리 역참조 및 레지스터 값 대입 3번으로 상수 시간에 실행됩니다.",
            "space": "O(1)",
            "spaceWhy": "단일 4바이트 정수 temp 외에 추가 메모리를 쓰지 않습니다."
      },
      "pitfalls": [
            "C 언어는 기본적으로 값에 의한 전달(Call by Value)이므로, `void swap(int a, int b)`처럼 포인터 없이 호출하면 복사본만 바뀌고 호출부의 원본 변수는 절대 바뀌지 않습니다."
      ]
},
      entryPoint: 'test_swap',
      code: `void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int test_swap(int x, int y) {
    swap(&x, &y);
    return x * 100 + y;
}`,
      skeleton: `void swap(int* a, int* b) {
    int temp = *a;
    *a = ____;
    *b = ____;
}

int test_swap(int x, int y) {
    swap(&x, &y);
    return x * 100 + y;
}`,
      tests: [
        { input: [12, 34], expected: 3412, name: '12와 34 교환' },
        { input: [5, 9], expected: 905, name: '5와 9 교환' }
      ]
    },
    {
      id: 'c_strlen_pointer',
      title: '포인터 산술을 이용한 문자열 길이 계산 (strlen)',
      tier: 1,
      category: 'Syntax',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '널 종료 문자(\\0)를 만날 때까지 포인터를 전진시켜 문자열의 길이를 구합니다.',
      explanation: {
      "summary": "배열 인덱스 대신 포인터 산술(Pointer Arithmetic)과 널 종단 문자('\u0000')를 이용해 표준 라이브러리의 strlen을 직접 구현합니다.",
      "keyConcepts": [
            "포인터 산술 (ptr - str)",
            "널 종단 문자 (\\0)",
            "const char*",
            "포인터 증감 (ptr++)"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "int my_strlen(const char* str) {",
                  "explain": "원본 문자열 내용이 수정되지 않도록 const char*로 시작 주소를 받습니다."
            },
            {
                  "line": 2,
                  "code": "    const char* ptr = str;",
                  "explain": "문자열을 한 글자씩 전진하며 탐색할 순회 포인터 ptr을 시작 주소 str로 초기화합니다."
            },
            {
                  "line": 3,
                  "code": "    while (*ptr != '\\0') {",
                  "explain": "ptr이 가리키는 현재 문자가 C 문자열의 끝을 알리는 널 종단 문자('\\0')가 아닐 때까지 반복합니다."
            },
            {
                  "line": 4,
                  "code": "        ptr++;",
                  "explain": "포인터를 1바이트(다음 문자) 앞으로 전진시킵니다."
            },
            {
                  "line": 5,
                  "code": "    }",
                  "explain": "while 루프 종료 (ptr은 이제 '\\0' 문자의 주소를 가리킵니다)."
            },
            {
                  "line": 6,
                  "code": "    return (int)(ptr - str);",
                  "explain": "포인터 산술: 끝 주소(ptr)에서 시작 주소(str)를 빼면 두 주소 사이의 문자 개수가 즉시 계산됩니다."
            },
            {
                  "line": 7,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "문자열 길이 N만큼의 문자를 차례대로 한 번씩 방문합니다.",
            "space": "O(1)",
            "spaceWhy": "포인터 변수 ptr 하나만 사용하므로 상수 공간입니다."
      },
      "pitfalls": [
            "C 문자열은 마지막에 반드시 널 종단 문자('\\0')가 존재해야 하며, 널 문자가 빠진 비정상 버퍼를 넘기면 메모리 보호 위반(Segmentation Fault)이 일어납니다."
      ]
},
      entryPoint: 'my_strlen',
      code: `int my_strlen(const char* str) {
    const char* ptr = str;
    while (*ptr != '\\0') {
        ptr++;
    }
    return (int)(ptr - str);
}`,
      skeleton: `int my_strlen(const char* str) {
    const char* ptr = str;
    while (____) {
        ptr++;
    }
    return (int)(ptr - str);
}`,
      tests: [
        { input: ['KeyReflex'], expected: 9, name: 'KeyReflex 길이 (9)' },
        { input: [''], expected: 0, name: '빈 문자열 (0)' },
        { input: ['C_Language'], expected: 10, name: 'C_Language 길이 (10)' }
      ]
    },
    {
      id: 'c_array_sum',
      title: '배열 순회 및 총합 계산',
      tier: 2,
      category: 'Data Structure',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '주어진 정수 배열의 모든 요소를 반복문으로 순회하여 총합을 반환합니다.',
      explanation: {
      "summary": "배열의 시작 주소와 크기(size)를 전달받아 for 루프로 순회하며 원소들의 총합을 누적 계산합니다.",
      "keyConcepts": [
            "배열 매개변수 (int arr[])",
            "크기 명시 (size)",
            "누적 합산 (sum +=)",
            "기본 for 루프"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "int sum_array(int arr[], int size) {",
                  "explain": "배열의 시작 주소 arr과 배열 요소 개수 size를 매개변수로 받습니다."
            },
            {
                  "line": 2,
                  "code": "    int sum = 0;",
                  "explain": "원소들의 합을 누적할 변수 sum을 0으로 초기화합니다."
            },
            {
                  "line": 3,
                  "code": "    for (int i = 0; i < size; i++) {",
                  "explain": "인덱스 i를 0부터 size-1까지 1씩 증가시키며 순회합니다."
            },
            {
                  "line": 4,
                  "code": "        sum += arr[i];",
                  "explain": "배열의 i번째 원소를 sum에 더해 누적합니다."
            },
            {
                  "line": 5,
                  "code": "    }",
                  "explain": "for 루프 종료"
            },
            {
                  "line": 6,
                  "code": "    return sum;",
                  "explain": "계산된 최종 총합을 반환합니다."
            },
            {
                  "line": 7,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "배열 크기 size에 비례하여 N번의 덧셈을 수행합니다.",
            "space": "O(1)",
            "spaceWhy": "누적 변수 sum과 루프 인덱스 i 변수 외에 메모리를 쓰지 않습니다."
      },
      "pitfalls": [
            "C 언어에서 함수 인자로 전달된 int arr[]은 내부적으로 포인터(int*)로 감쇠(decay)되므로 sizeof(arr)를 통해 길이를 알 수 없습니다. 반드시 size를 함께 넘겨야 합니다."
      ]
},
      entryPoint: 'sum_array',
      code: `int sum_array(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    return sum;
}`,
      skeleton: `int sum_array(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        ____;
    }
    return sum;
}`,
      tests: [
        { input: [[10, 20, 30, 40], 4], expected: 100, name: '4개 원소 합' },
        { input: [[-5, 5, -10, 10], 4], expected: 0, name: '0이 되는 합' }
      ]
    },
    {
      id: 'c_binary_search',
      title: '이진 탐색 (Binary Search)',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(log N)', space: 'O(1)' },
      description: '오름차순 정렬된 C 정수 배열에서 target의 인덱스를 이진 탐색으로 찾습니다.',
      explanation: {
      "summary": "정수 오버플로우 방지 공식 mid = left + (right - left) / 2를 적용한 안전한 C 언어 이진 탐색 구현입니다.",
      "keyConcepts": [
            "이진 탐색 (Binary Search)",
            "정수 오버플로우 방지",
            "분할 정복",
            "조기 반환"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "int binary_search_c(int arr[], int size, int target) {",
                  "explain": "정렬된 배열 arr, 원소 수 size, 찾을 값 target을 받습니다."
            },
            {
                  "line": 2,
                  "code": "    int left = 0;",
                  "explain": "탐색 시작 인덱스를 0으로 초기화합니다."
            },
            {
                  "line": 3,
                  "code": "    int right = size - 1;",
                  "explain": "탐색 끝 인덱스를 size - 1로 초기화합니다."
            },
            {
                  "line": 4,
                  "code": "    while (left <= right) {",
                  "explain": "탐색 구간이 유효한 동안(left <= right) 루프를 진행합니다."
            },
            {
                  "line": 5,
                  "code": "        int mid = left + (right - left) / 2;",
                  "explain": "(left + right)가 21억(INT_MAX)을 넘어가 음수가 되는 오버플로우 버그를 원천 차단하는 표준 공식입니다."
            },
            {
                  "line": 6,
                  "code": "        if (arr[mid] == target) {",
                  "explain": "중간 위치의 값이 target과 일치하는지 확인합니다."
            },
            {
                  "line": 7,
                  "code": "            return mid;",
                  "explain": "일치하면 해당 인덱스를 즉시 반환합니다."
            },
            {
                  "line": 8,
                  "code": "        } else if (arr[mid] < target) {",
                  "explain": "중간 값이 target보다 작으면 target은 우측에 위치합니다."
            },
            {
                  "line": 9,
                  "code": "            left = mid + 1;",
                  "explain": "왼쪽 포인터를 mid + 1로 당깁니다."
            },
            {
                  "line": 10,
                  "code": "        } else {",
                  "explain": "중간 값이 target보다 크면 target은 좌측에 위치합니다."
            },
            {
                  "line": 11,
                  "code": "            right = mid - 1;",
                  "explain": "오른쪽 포인터를 mid - 1로 당깁니다."
            },
            {
                  "line": 12,
                  "code": "        }",
                  "explain": "조건문 종료"
            },
            {
                  "line": 13,
                  "code": "    }",
                  "explain": "while 루프 종료"
            },
            {
                  "line": 14,
                  "code": "    return -1;",
                  "explain": "배열에 target이 없으면 -1을 반환합니다."
            },
            {
                  "line": 15,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(log N)",
            "timeWhy": "매 단계마다 남은 탐색 대상이 절반으로 감소합니다.",
            "space": "O(1)",
            "spaceWhy": "left, right, mid 상수 개의 정수 변수만 사용합니다."
      },
      "pitfalls": [
            "많은 입문자가 `(left + right) / 2`로 작성하지만, 대규모 배열(size > 10억)에서는 덧셈 오버플로우로 인해 음수 인덱스 접근 크래시가 발생하므로 `left + (right - left) / 2`가 권장됩니다."
      ]
},
      entryPoint: 'binary_search_c',
      code: `int binary_search_c(int arr[], int size, int target) {
    int left = 0;
    int right = size - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
      skeleton: `int binary_search_c(int arr[], int size, int target) {
    int left = 0;
    int right = size - 1;
    while (____) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            ____;
        } else {
            ____;
        }
    }
    return -1;
}`,
      tests: [
        { input: [[2, 4, 6, 8, 10, 12], 6, 8], expected: 3, name: '8 탐색 (인덱스 3)' },
        { input: [[2, 4, 6, 8, 10, 12], 6, 5], expected: -1, name: '미포함 탐색 (-1)' }
      ]
    },
    {
      id: 'c_reverse_array',
      title: '투 포인터 배열 뒤집기 (In-Place Reverse)',
      tier: 3,
      category: 'Algorithm',
      complexity: { time: 'O(N)', space: 'O(1)' },
      description: '추가 배열 생성 없이 양 끝 포인터를 좁혀가며 배열 요소를 제자리에서 뒤집습니다.',
      explanation: {
      "summary": "별도의 메모리 할당 없이 O(1) 공간 복잡도로 양 끝의 포인터 인덱스를 좁혀가며 배열을 제자리 뒤집기(In-Place Reverse)합니다.",
      "keyConcepts": [
            "제자리 알고리즘 (In-Place)",
            "투 포인터 (Two Pointers)",
            "스왑(Swap) 연산",
            "메모리 최적화"
      ],
      "lineByLine": [
            {
                  "line": 1,
                  "code": "void reverse_array(int arr[], int size) {",
                  "explain": "뒤집을 배열 arr과 크기 size를 전달받는 함수입니다."
            },
            {
                  "line": 2,
                  "code": "    int left = 0;",
                  "explain": "배열 시작 위치를 가리키는 left 인덱스입니다."
            },
            {
                  "line": 3,
                  "code": "    int right = size - 1;",
                  "explain": "배열 끝 위치를 가리키는 right 인덱스입니다."
            },
            {
                  "line": 4,
                  "code": "    while (left < right) {",
                  "explain": "두 포인터가 중앙에서 교차하기 전까지 스왑을 진행합니다."
            },
            {
                  "line": 5,
                  "code": "        int temp = arr[left];",
                  "explain": "왼쪽 원소를 임시 변수 temp에 보관합니다."
            },
            {
                  "line": 6,
                  "code": "        arr[left] = arr[right];",
                  "explain": "오른쪽 원소를 왼쪽 위치에 덮어씁니다."
            },
            {
                  "line": 7,
                  "code": "        arr[right] = temp;",
                  "explain": "보관해 두었던 원래 왼쪽 원소를 오른쪽 위치에 덮어씁니다."
            },
            {
                  "line": 8,
                  "code": "        left++;",
                  "explain": "left 포인터를 오른쪽으로 한 칸 이동합니다."
            },
            {
                  "line": 9,
                  "code": "        right--;",
                  "explain": "right 포인터를 왼쪽으로 한 칸 이동합니다."
            },
            {
                  "line": 10,
                  "code": "    }",
                  "explain": "while 루프 종료"
            },
            {
                  "line": 11,
                  "code": "}",
                  "explain": "reverse_array 종료"
            },
            {
                  "line": 12,
                  "code": "int reverse_first_elem(int arr[], int size) {",
                  "explain": "뒤집힌 배열의 첫 번째 원소를 반환하는 테스트 래퍼 함수입니다."
            },
            {
                  "line": 13,
                  "code": "    reverse_array(arr, size);",
                  "explain": "배열을 제자리 뒤집기합니다."
            },
            {
                  "line": 14,
                  "code": "    return arr[0];",
                  "explain": "뒤집힌 후의 맨 첫 번째 원소를 반환합니다."
            },
            {
                  "line": 15,
                  "code": "}",
                  "explain": "함수 종료"
            }
      ],
      "complexity": {
            "time": "O(N)",
            "timeWhy": "배열 크기의 절반(size / 2)만큼 스왑을 실행하므로 선형 시간 O(N)입니다.",
            "space": "O(1)",
            "spaceWhy": "추가 배열을 생성하지 않고 기존 메모리 안에서 값을 교환하는 In-Place 방식입니다."
      },
      "pitfalls": [
            "In-Place 방식은 원본 배열이 직접 변경되므로, 원본 보존이 필요한 경우에는 사전에 복사본(memcpy 등)을 만들어 두어야 합니다."
      ]
},
      entryPoint: 'reverse_first_elem',
      code: `void reverse_array(int arr[], int size) {
    int left = 0;
    int right = size - 1;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}

int reverse_first_elem(int arr[], int size) {
    reverse_array(arr, size);
    return arr[0];
}`,
      skeleton: `void reverse_array(int arr[], int size) {
    int left = 0;
    int right = size - 1;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        ____;
        ____;
    }
}

int reverse_first_elem(int arr[], int size) {
    reverse_array(arr, size);
    return arr[0];
}`,
      tests: [
        { input: [[1, 2, 3, 4, 5], 5], expected: 5, name: '뒤집힌 후 첫 요소 5' },
        { input: [[99, 100], 2], expected: 100, name: '2개 원소 뒤집기' }
      ]
    }
  ]
};
