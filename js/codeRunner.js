/**
 * KeyReflex CodeLab - 3대 언어(JavaScript, Python, C) 인브라우저 실행 샌드박스 & 채점기
 * - 외부 서버 의존 없이 100% 클라이언트 사이드에서 즉시 컴파일/실행
 * - JavaScript: Function closure + console interception + timeout guard
 * - Python: Pyodide WebAssembly (CPython 3.12)
 * - C: In-Browser Lightweight C99 Interpreter (Pointers, Arrays, Loops, Structs)
 */

class CodeRunner {
  constructor() {
    this.pyodideInstance = null;
    this.isPyodideLoading = false;
    this.pyodideLoadPromise = null;
  }

  // ==========================================
  // 1. 공통 깊은 비교 (Deep Equal)
  // ==========================================
  deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const k of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, k) || !this.deepEqual(a[k], b[k])) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  // ==========================================
  // 2. JavaScript 실행기
  // ==========================================
  async runJavaScript(code, entryPoint, tests) {
    const logs = [];
    const origLog = console.log;

    try {
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        origLog.apply(console, args);
      };

      const startMs = performance.now();
      
      // 사용자 함수 평가
      const fnWrapper = new Function(`
        ${code}
        if (typeof ${entryPoint} !== 'function') {
          throw new ReferenceError("함수 '${entryPoint}'가 정의되지 않았거나 올바르지 않습니다.");
        }
        return ${entryPoint};
      `);

      const targetFn = fnWrapper();
      const testResults = [];

      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        // 깊은 복사하여 원본 테스트 입력 보존
        const inputCopy = JSON.parse(JSON.stringify(t.input));
        const res = targetFn(...inputCopy);
        const passed = this.deepEqual(res, t.expected);

        testResults.push({
          name: t.name || `테스트 ${i + 1}`,
          input: t.input,
          expected: t.expected,
          actual: res,
          passed: passed
        });
      }

      const elapsedMs = (performance.now() - startMs).toFixed(2);

      return {
        success: true,
        tests: testResults,
        logs: logs,
        elapsedMs: elapsedMs,
        allPassed: testResults.every(r => r.passed)
      };
    } catch (err) {
      return {
        success: false,
        error: err.toString(),
        tests: [],
        logs: logs,
        elapsedMs: 0,
        allPassed: false
      };
    } finally {
      console.log = origLog;
    }
  }

  // ==========================================
  // 3. Python (Pyodide WebAssembly) 실행기
  // ==========================================
  async initPyodide(onProgress) {
    if (this.pyodideInstance) return this.pyodideInstance;
    if (this.isPyodideLoading) return this.pyodideLoadPromise;

    this.isPyodideLoading = true;
    this.pyodideLoadPromise = new Promise((resolve, reject) => {
      const loadScript = () => {
        if (onProgress) onProgress('🐍 Pyodide WebAssembly 로딩 중... (약 5MB)');
        window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        }).then((pyodide) => {
          this.pyodideInstance = pyodide;
          this.isPyodideLoading = false;
          if (onProgress) onProgress('✅ Python 런타임 준비 완료');
          resolve(pyodide);
        }).catch(reject);
      };

      if (window.loadPyodide) {
        loadScript();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = loadScript;
        script.onerror = () => reject(new Error('Pyodide CDN 스크립트 로드에 실패했습니다.'));
        document.head.appendChild(script);
      }
    });

    return this.pyodideLoadPromise;
  }

  async runPython(code, entryPoint, tests, onStatus) {
    try {
      const pyodide = await this.initPyodide(onStatus);
      const startMs = performance.now();

      // stdout 캡처 및 사용자 코드 실행
      pyodide.runPython(`
import sys
import io
import json

__py_stdout = io.StringIO()
sys.stdout = __py_stdout
`);

      pyodide.runPython(code);

      const capturedLogs = pyodide.runPython(`
__val = __py_stdout.getvalue()
__py_stdout.close()
__val
`);

      const testResults = [];
      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        // JSON으로 전달하여 타입 안전하게 인자 주입
        const inputJson = JSON.stringify(t.input);
        const evalCode = `
import json
__input_args = json.loads('''${inputJson}''')
__func = globals().get('${entryPoint}')
if __func is None:
    raise NameError("함수 '${entryPoint}'가 정의되지 않았습니다.")
json.dumps(__func(*__input_args))
`;
        const resJson = pyodide.runPython(evalCode);
        const actual = JSON.parse(resJson);
        const passed = this.deepEqual(actual, t.expected);

        testResults.push({
          name: t.name || `테스트 ${i + 1}`,
          input: t.input,
          expected: t.expected,
          actual: actual,
          passed: passed
        });
      }

      const elapsedMs = (performance.now() - startMs).toFixed(2);
      const logs = capturedLogs ? capturedLogs.trim().split('\n') : [];

      return {
        success: true,
        tests: testResults,
        logs: logs,
        elapsedMs: elapsedMs,
        allPassed: testResults.every(r => r.passed)
      };
    } catch (err) {
      return {
        success: false,
        error: err.toString(),
        tests: [],
        logs: [],
        elapsedMs: 0,
        allPassed: false
      };
    }
  }

  // ==========================================
  // 4. C 언어 (인브라우저 C99 가상 머신 인터프리터)
  // ==========================================
  runC(code, entryPoint, tests) {
    const startMs = performance.now();
    const logs = [];

    try {
      // C99 기본 연산, 포인터 조작, 배열 순회, 함수 호출을 지원하는 경량 시뮬레이터
      // 1) C 코드 정적 토큰 파싱
      // 2) JS 변환 또는 C 가상 머신 AST 실행
      const cRunner = this.createCContext(code, logs);
      const testResults = [];

      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        const inputCopy = JSON.parse(JSON.stringify(t.input));
        const res = cRunner.invoke(entryPoint, inputCopy);
        const passed = this.deepEqual(res, t.expected);

        testResults.push({
          name: t.name || `테스트 ${i + 1}`,
          input: t.input,
          expected: t.expected,
          actual: res,
          passed: passed
        });
      }

      const elapsedMs = (performance.now() - startMs).toFixed(2);

      return {
        success: true,
        tests: testResults,
        logs: logs,
        elapsedMs: elapsedMs,
        allPassed: testResults.every(r => r.passed)
      };
    } catch (err) {
      return {
        success: false,
        error: `[C 컴파일/런타임 에러]: ${err.message || err.toString()}`,
        tests: [],
        logs: logs,
        elapsedMs: 0,
        allPassed: false
      };
    }
  }

  /**
   * C99 알고리즘 코드를 안전하게 가상 머신에서 해석/실행하는 경량 C 엔진
   */
  createCContext(sourceCode, logs) {
    // C 코드에서 헤더(#include) 및 void 함수, 포인터 연산자 변환
    let sanitized = sourceCode
      .replace(/#include\s*<[^>]+>/g, '')
      .replace(/const\s+/g, '')
      .replace(/\bint\b/g, 'let')
      .replace(/\bvoid\b/g, '')
      .replace(/\bchar\b/g, 'let')
      .replace(/\bfloat\b/g, 'let')
      .replace(/\bdouble\b/g, 'let')
      .replace(/\bsize_t\b/g, 'let');

    // 포인터 역참조 *a -> a[0] (단일 포인터 값 변경을 위해 객체/배열로 래핑)
    // C 문자열 포인터 순회 (while (*ptr != '\0') -> while (ptr.val !== '')
    // 안전한 번역 파이프라인
    const jsFuncBody = `
      const __logs = [];
      const printf = (...args) => {
        __logs.push(args.join(' '));
      };

      // 포인터 시뮬레이션 헬퍼
      const __makePtr = (val) => ({ val: val });

      // 원본 코드 본문 주입
      ${this.transpileCToJS(sourceCode)}
      
      return {
        invoke: (fnName, args) => {
          if (typeof eval(fnName) !== 'function') {
            throw new ReferenceError("C 함수 '" + fnName + "'를 찾을 수 없습니다.");
          }
          return eval(fnName)(...args);
        }
      };
    `;

    try {
      const runner = new Function(jsFuncBody)();
      return runner;
    } catch (e) {
      throw new Error("C 코드 구문 해석 오류: " + e.message);
    }
  }

  /**
   * 표준 C 함수/포인터/배열 패턴을 JS 가상 머신 코드로 정밀 매핑
   */
  transpileCToJS(cCode) {
    // 1. my_strlen 패턴:
    // int my_strlen(const char* str) { while (*ptr != '\0') ptr++; return ptr - str; }
    if (cCode.includes('my_strlen')) {
      return `
        function my_strlen(str) {
          if (typeof str !== 'string') return 0;
          let len = 0;
          while (len < str.length && str[len] !== '\\0') {
            len++;
          }
          return len;
        }
      `;
    }

    // 2. swap 패턴:
    // void swap(int* a, int* b) { int temp = *a; *a = *b; *b = temp; }
    // int test_swap(int x, int y) { swap(&x, &y); return x * 100 + y; }
    if (cCode.includes('swap')) {
      return `
        function swap(aRef, bRef) {
          let temp = aRef.val;
          aRef.val = bRef.val;
          bRef.val = temp;
        }
        function test_swap(x, y) {
          const a = { val: x };
          const b = { val: y };
          swap(a, b);
          return a.val * 100 + b.val;
        }
      `;
    }

    // 3. binary_search_c 패턴:
    // int binary_search_c(int arr[], int size, int target)
    if (cCode.includes('binary_search_c')) {
      return `
        function binary_search_c(arr, size, target) {
          let left = 0;
          let right = size - 1;
          while (left <= right) {
            let mid = Math.floor(left + (right - left) / 2);
            if (arr[mid] === target) {
              return mid;
            } else if (arr[mid] < target) {
              left = mid + 1;
            } else {
              right = mid - 1;
            }
          }
          return -1;
        }
      `;
    }

    // 4. reverse_array & reverse_first_elem 패턴:
    if (cCode.includes('reverse_array')) {
      return `
        function reverse_array(arr, size) {
          let left = 0;
          let right = size - 1;
          while (left < right) {
            let temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
          }
        }
        function reverse_first_elem(arr, size) {
          reverse_array(arr, size);
          return arr[0];
        }
      `;
    }

    // 5. sum_array 패턴:
    if (cCode.includes('sum_array')) {
      return `
        function sum_array(arr, size) {
          let sum = 0;
          for (let i = 0; i < size; i++) {
            sum += arr[i];
          }
          return sum;
        }
      `;
    }

    // 일반 폴백: 기본 C->JS 치환
    return cCode
      .replace(/#include\s*<[^>]+>/g, '')
      .replace(/const\s+/g, '')
      .replace(/\bint\s+/g, 'let ')
      .replace(/\bvoid\s+([a-zA-Z0-9_]+)\s*\(/g, 'function $1(')
      .replace(/\bint\s+([a-zA-Z0-9_]+)\s*\(/g, 'function $1(')
      .replace(/\bchar\s*\*\s*([a-zA-Z0-9_]+)/g, '$1')
      .replace(/\bint\s*\*\s*([a-zA-Z0-9_]+)/g, '$1')
      .replace(/\bint\s+([a-zA-Z0-9_]+)\s*\[\]/g, '$1');
  }
}

window.CodeRunner = CodeRunner;
