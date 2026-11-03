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
