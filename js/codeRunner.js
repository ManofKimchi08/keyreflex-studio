/**
 * KeyReflex CodeLab - 3대 언어(JavaScript, Python, C) 인브라우저 실행 샌드박스 & 채점기
 * - 외부 서버 의존 없이 100% 클라이언트 사이드에서 즉시 컴파일/실행
 * - JavaScript: Function 클로저 + 콘솔 캡처 + 루프 무한실행 방어(AST-free 토큰 계측)
 * - Python: Pyodide WebAssembly (CPython 3.12) + 안전한 인자 바인딩 + stdout 복원
 * - C: 경량 C99 토크나이저 & 재귀하강 트랜스파일러 (실제 포인터 역참조/산술/정수나눗셈/배열 실행)
 */

class CodeRunner {
  constructor() {
    this.pyodideInstance = null;
    this.isPyodideLoading = false;
    this.pyodideLoadPromise = null;
    this.pyodideStatus = 'idle'; // 'idle' | 'loading' | 'ready' | 'error'
    this.pyodideStatusListeners = new Set();
    this.maxLoopIterations = 200000;
  }

  setPyodideStatus(status, message = '') {
    this.pyodideStatus = status;
    this.pyodideStatusListeners.forEach(cb => {
      try { cb(status, message); } catch (_) { /* ignore listener errors */ }
    });
  }

  onPyodideStatusChange(cb) {
    if (typeof cb === 'function') {
      this.pyodideStatusListeners.add(cb);
      cb(this.pyodideStatus, '');
    }
    return () => this.pyodideStatusListeners.delete(cb);
  }

  // =========================================================================
  // 1. 공통 유틸리티 (Deep Equal & 안전 직렬화)
  // =========================================================================
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

  formatConsoleArg(arg) {
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch (_) {
        return String(arg);
      }
    }
    return String(arg);
  }

  // =========================================================================
  // 2. JavaScript 실행기 (루프 무한 실행 가드 + 콘솔 캡처)
  // =========================================================================

  /**
   * 문자열/주석/템플릿 리터럴은 건드리지 않고 while / for / do 루프 본문에 __tick()을 삽입
   */
  instrumentJSLoops(source) {
    const out = [];
    const n = source.length;
    let i = 0;
    let braceStack = []; // 'normal' | 'templateExpr'

    const isIdentChar = (c) => /[a-zA-Z0-9_$]/.test(c);

    while (i < n) {
      const ch = source[i];
      const next = source[i + 1];

      // 1) 단일/다중 행 주석 건너뛰기
      if (ch === '/' && next === '/') {
        const start = i;
        while (i < n && source[i] !== '\n') i++;
        out.push(source.slice(start, i));
        continue;
      }
      if (ch === '/' && next === '*') {
        const start = i;
        i += 2;
        while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i++;
        i = Math.min(n, i + 2);
        out.push(source.slice(start, i));
        continue;
      }

      // 2) 문자열 리터럴 (' / ") 건너뛰기
      if (ch === '\'' || ch === '"') {
        const quote = ch;
        const start = i++;
        while (i < n) {
          if (source[i] === '\\') { i += 2; continue; }
          if (source[i] === quote) { i++; break; }
          i++;
        }
        out.push(source.slice(start, i));
        continue;
      }

      // 3) 템플릿 리터럴 (`...${expr}...`) 처리
      if (ch === '`') {
        i = this.consumeTemplateSegment(source, i + 1, out, '`', braceStack);
        continue;
      }
      if (ch === '}' && braceStack.length > 0) {
        const top = braceStack.pop();
        if (top === 'templateExpr') {
          out.push('}');
          i = this.consumeTemplateSegment(source, i + 1, out, '', braceStack);
          continue;
        }
      }
      if (ch === '{') {
        braceStack.push('normal');
      }

      // 4) while / for / do 키워드 탐지
      if (isIdentChar(ch) && (i === 0 || !isIdentChar(source[i - 1]))) {
        let j = i;
        while (j < n && isIdentChar(source[j])) j++;
        const word = source.slice(i, j);

        if (word === 'while' || word === 'for' || word === 'do') {
          // '.' 직후 메서드명(obj.for 등)이나 속성 키 제외
          let k = i - 1;
          while (k >= 0 && /\s/.test(source[k])) k--;
          if (k >= 0 && source[k] === '.') {
            out.push(word);
            i = j;
            continue;
          }

          if (word === 'do') {
            let bodyStart = j;
            while (bodyStart < n && /\s/.test(source[bodyStart])) bodyStart++;
            if (source[bodyStart] === '{') {
              out.push(source.slice(i, bodyStart + 1), ' __tick(); ');
              braceStack.push('normal');
              i = bodyStart + 1;
              continue;
            }
          } else {
            let pStart = j;
            while (pStart < n && /\s/.test(source[pStart])) pStart++;
            if (source[pStart] === '(') {
              const pEnd = this.findMatchingParen(source, pStart);
              if (pEnd !== -1) {
                let bStart = pEnd + 1;
                while (bStart < n && /\s/.test(source[bStart])) bStart++;
                // do { ... } while (...); 인 경우 블록이 뒤따르지 않으므로 제외
                if (source[bStart] === '{') {
                  out.push(source.slice(i, bStart + 1), ' __tick(); ');
                  braceStack.push('normal');
                  i = bStart + 1;
                  continue;
                }
              }
            }
          }
        }
        out.push(word);
        i = j;
        continue;
      }

      out.push(ch);
      i++;
    }

    return out.join('');
  }

  consumeTemplateSegment(source, startIdx, out, prefix, braceStack) {
    const n = source.length;
    let i = startIdx;
    let seg = prefix;
    while (i < n) {
      if (source[i] === '\\') {
        seg += source.slice(i, Math.min(n, i + 2));
        i += 2;
        continue;
      }
      if (source[i] === '$' && source[i + 1] === '{') {
        out.push(seg, '${');
        braceStack.push('templateExpr');
        return i + 2;
      }
      if (source[i] === '`') {
        seg += '`';
        i++;
        break;
      }
      seg += source[i];
      i++;
    }
    out.push(seg);
    return i;
  }

  findMatchingParen(source, openIdx) {
    const n = source.length;
    let depth = 0;
    let i = openIdx;
    while (i < n) {
      const ch = source[i];
      if (ch === '\'' || ch === '"' || ch === '`') {
        const q = ch;
        i++;
        while (i < n) {
          if (source[i] === '\\') { i += 2; continue; }
          if (source[i] === q) { i++; break; }
          i++;
        }
        continue;
      }
      if (ch === '/' && source[i + 1] === '/') {
        while (i < n && source[i] !== '\n') i++;
        continue;
      }
      if (ch === '/' && source[i + 1] === '*') {
        i += 2;
        while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i++;
        i += 2;
        continue;
      }
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) return i;
      }
      i++;
    }
    return -1;
  }

  async runJavaScript(code, entryPoint, tests) {
    const logs = [];
    const origLog = console.log;

    try {
      console.log = (...args) => {
        logs.push(args.map(a => this.formatConsoleArg(a)).join(' '));
        origLog.apply(console, args);
      };

      const startMs = performance.now();
      const instrumented = this.instrumentJSLoops(code);

      const fnWrapper = new Function('__tick', `
        "use strict";
        ${instrumented}
        if (typeof ${entryPoint} !== 'function') {
          throw new ReferenceError("함수 '${entryPoint}'가 정의되지 않았거나 올바르지 않습니다.");
        }
        return ${entryPoint};
      `);

      const maxIters = this.maxLoopIterations;
      let iterCount = 0;
      const tick = () => {
        if (++iterCount > maxIters) {
          throw new Error(`무한 루프 시간 초과: 반복 횟수(${maxIters.toLocaleString()}회)를 초과했습니다.`);
        }
      };

      const targetFn = fnWrapper(tick);
      const testResults = [];

      for (let i = 0; i < tests.length; i++) {
        iterCount = 0;
        const t = tests[i];
        const inputCopy = JSON.parse(JSON.stringify(t.input));
        const res = targetFn(...inputCopy);
        const passed = this.deepEqual(res, t.expected);

        testResults.push({
          name: t.name || `테스트 ${i + 1}`,
          input: t.input,
          expected: t.expected,
          actual: res,
          passed
        });
      }

      const elapsedMs = (performance.now() - startMs).toFixed(2);
      return {
        success: true,
        tests: testResults,
        logs,
        elapsedMs,
        allPassed: testResults.every(r => r.passed)
      };
    } catch (err) {
      return {
        success: false,
        error: err.toString(),
        tests: [],
        logs,
        elapsedMs: 0,
        allPassed: false
      };
    } finally {
      console.log = origLog;
    }
  }

  // =========================================================================
  // 3. Python (Pyodide WebAssembly) 실행기 — 안전 stdout 복원 및 전역 바인딩
  // =========================================================================
  async initPyodide(onProgress) {
    if (this.pyodideInstance) {
      this.setPyodideStatus('ready', '✅ Python 런타임 준비 완료');
      return this.pyodideInstance;
    }
    if (this.isPyodideLoading && this.pyodideLoadPromise) return this.pyodideLoadPromise;

    this.isPyodideLoading = true;
    this.setPyodideStatus('loading', '🐍 Pyodide WebAssembly 런타임 다운로드/초기화 중...');
    if (onProgress) onProgress('🐍 Pyodide WebAssembly 런타임 다운로드/초기화 중...');

    this.pyodideLoadPromise = new Promise((resolve, reject) => {
      const loadScript = () => {
        this.setPyodideStatus('loading', '🐍 Pyodide WebAssembly 런타임 초기화 중...');
        if (onProgress) onProgress('🐍 Pyodide WebAssembly 런타임 초기화 중...');
        window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
        }).then((pyodide) => {
          this.pyodideInstance = pyodide;
          this.isPyodideLoading = false;
          this.setPyodideStatus('ready', '✅ Python 런타임 준비 완료');
          if (onProgress) onProgress('✅ Python 런타임 준비 완료');
          resolve(pyodide);
        }).catch((err) => {
          this.isPyodideLoading = false;
          this.pyodideLoadPromise = null;
          this.setPyodideStatus('error', err && err.message ? err.message : 'Pyodide 초기화 실패');
          reject(err);
        });
      };

      if (window.loadPyodide) {
        loadScript();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = loadScript;
        script.onerror = () => {
          this.isPyodideLoading = false;
          this.pyodideLoadPromise = null;
          script.remove();
          const errMsg = 'Pyodide CDN 로드에 실패했습니다. 오프라인 환경이거나 네트워크 차단 상태일 수 있습니다.';
          this.setPyodideStatus('error', errMsg);
          reject(new Error(errMsg));
        };
        document.head.appendChild(script);
      }
    });

    return this.pyodideLoadPromise;
  }

  async runPython(code, entryPoint, tests, onStatus) {
    try {
      const pyodide = await this.initPyodide(onStatus);
      const startMs = performance.now();

      // 안전한 전역 바인딩으로 사용자 코드와 테스트 데이터를 주입 (문자열 이스케이프 오류 방지)
      pyodide.globals.set('__kr_user_code', code);
      pyodide.globals.set('__kr_entry_point', entryPoint);
      pyodide.globals.set('__kr_tests_json', JSON.stringify(tests));

      const harnessResultJson = pyodide.runPython(`
import sys, io, json

__kr_orig_stdout = sys.stdout
__kr_buf = io.StringIO()
sys.stdout = __kr_buf

__kr_payload = None
try:
    __kr_ns = {}
    exec(__kr_user_code, __kr_ns)
    __kr_fn = __kr_ns.get(__kr_entry_point)
    if __kr_fn is None or not callable(__kr_fn):
        raise NameError(f"함수 '{__kr_entry_point}'가 정의되지 않았습니다.")

    __kr_tests = json.loads(__kr_tests_json)
    __kr_results = []
    for idx, t in enumerate(__kr_tests):
        args_copy = json.loads(json.dumps(t['input']))
        actual_val = __kr_fn(*args_copy)
        # JSON 왕복 정규화
        __kr_results.append({
            "name": t.get("name", f"테스트 {idx + 1}"),
            "input": t["input"],
            "expected": t["expected"],
            "actual": json.loads(json.dumps(actual_val)) if actual_val is not None else None
        })
    __kr_payload = {
        "success": True,
        "tests": __kr_results,
        "logs": [line for line in __kr_buf.getvalue().splitlines() if line != ""]
    }
except Exception as ex:
    __kr_payload = {
        "success": False,
        "error": f"{type(ex).__name__}: {ex}",
        "tests": [],
        "logs": [line for line in __kr_buf.getvalue().splitlines() if line != ""]
    }
finally:
    sys.stdout = __kr_orig_stdout
    __kr_buf.close()

json.dumps(__kr_payload)
`);

      const parsed = JSON.parse(harnessResultJson);
      const elapsedMs = (performance.now() - startMs).toFixed(2);

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.error,
          tests: [],
          logs: parsed.logs || [],
          elapsedMs,
          allPassed: false
        };
      }

      const testResults = parsed.tests.map(r => ({
        name: r.name,
        input: r.input,
        expected: r.expected,
        actual: r.actual,
        passed: this.deepEqual(r.actual, r.expected)
      }));

      return {
        success: true,
        tests: testResults,
        logs: parsed.logs || [],
        elapsedMs,
        allPassed: testResults.every(r => r.passed)
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || err.toString(),
        tests: [],
        logs: [],
        elapsedMs: 0,
        allPassed: false
      };
    }
  }

  // =========================================================================
  // 4. C99 언어 실제 토크나이저 & 재귀하강 트랜스파일러 (Zero Mock)
  // =========================================================================
  runC(code, entryPoint, tests) {
    const startMs = performance.now();
    const logs = [];

    try {
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
          passed
        });
      }

      const elapsedMs = (performance.now() - startMs).toFixed(2);
      return {
        success: true,
        tests: testResults,
        logs,
        elapsedMs,
        allPassed: testResults.every(r => r.passed)
      };
    } catch (err) {
      return {
        success: false,
        error: `[C 컴파일/런타임 에러]: ${err.message || err.toString()}`,
        tests: [],
        logs,
        elapsedMs: 0,
        allPassed: false
      };
    }
  }

  /**
   * C99 소스코드 토크나이징 (주석, #include, 문자열, 문자 리터럴 ASCII 코드 변환 지원)
   */
  tokenizeC(src) {
    const tokens = [];
    const n = src.length;
    let i = 0;

    const decodeEscape = (seq) => {
      const map = { '0': 0, 'n': 10, 'r': 13, 't': 9, '\\': 92, "'": 39, '"': 34 };
      return Object.prototype.hasOwnProperty.call(map, seq) ? map[seq] : seq.charCodeAt(0);
    };

    const threeCharOps = new Set(['<<=', '>>=']);
    const twoCharOps = new Set(['->', '++', '--', '<=', '>=', '==', '!=', '&&', '||', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>']);

    while (i < n) {
      const ch = src[i];

      // 공백
      if (/\s/.test(ch)) { i++; continue; }

      // 전처리기 (#include 등)
      if (ch === '#') {
        while (i < n && src[i] !== '\n') {
          if (src[i] === '\\' && src[i + 1] === '\n') i += 2;
          else i++;
        }
        continue;
      }

      // 주석
      if (ch === '/' && src[i + 1] === '/') {
        while (i < n && src[i] !== '\n') i++;
        continue;
      }
      if (ch === '/' && src[i + 1] === '*') {
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
        i += 2;
        continue;
      }

      // 문자 리터럴 ('\0', 'A') -> C 의미에 맞게 ASCII 정수 코드로 표현
      if (ch === '\'') {
        i++;
        let codeVal = 0;
        if (i < n && src[i] === '\\') {
          i++;
          codeVal = i < n ? decodeEscape(src[i++]) : 0;
        } else if (i < n && src[i] !== '\'') {
          codeVal = src[i++].charCodeAt(0);
        }
        if (i >= n || src[i] !== '\'') {
          throw new Error('닫히지 않은 문자 리터럴(\')이 있습니다.');
        }
        i++;
        tokens.push({ type: 'char', value: codeVal });
        continue;
      }

      // 문자열 리터럴 ("...")
      if (ch === '"') {
        i++;
        let str = '';
        while (i < n && src[i] !== '"') {
          if (src[i] === '\\') {
            i++;
            if (i < n) str += String.fromCharCode(decodeEscape(src[i++]));
          } else {
            str += src[i++];
          }
        }
        if (i >= n || src[i] !== '"') {
          throw new Error('닫히지 않은 문자열 리터럴(")이 있습니다.');
        }
        i++;
        tokens.push({ type: 'string', value: str });
        continue;
      }

      // 숫자 리터럴
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let numStr = '';
        let isFloat = false;
        if (ch === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
          numStr = '0x';
          i += 2;
          while (i < n && /[0-9a-fA-F]/.test(src[i])) numStr += src[i++];
        } else {
          while (i < n && /[0-9.]/.test(src[i])) {
            if (src[i] === '.') isFloat = true;
            numStr += src[i++];
          }
          if (i < n && (src[i] === 'e' || src[i] === 'E')) {
            isFloat = true;
            numStr += src[i++];
            if (src[i] === '+' || src[i] === '-') numStr += src[i++];
            while (i < n && /[0-9]/.test(src[i])) numStr += src[i++];
          }
          while (i < n && /[uUlLfF]/.test(src[i])) {
            if (src[i] === 'f' || src[i] === 'F') isFloat = true;
            i++;
          }
        }
        tokens.push({ type: 'number', value: Number(numStr), raw: numStr, isFloat });
        continue;
      }

      // 식별자 / 키워드
      if (/[a-zA-Z_]/.test(ch)) {
        let id = '';
        while (i < n && /[a-zA-Z0-9_]/.test(src[i])) id += src[i++];
        tokens.push({ type: 'ident', value: id });
        continue;
      }

      // 3글자 및 2글자 연산자
      const triple = src.slice(i, i + 3);
      if (threeCharOps.has(triple)) {
        tokens.push({ type: 'op', value: triple });
        i += 3;
        continue;
      }

      const pair = src.slice(i, i + 2);
      if (twoCharOps.has(pair)) {
        tokens.push({ type: 'op', value: pair });
        i += 2;
        continue;
      }

      // 구분자 & 1글자 연산자
      if ('(){}[];,'.includes(ch)) {
        tokens.push({ type: 'punct', value: ch });
        i++;
        continue;
      }
      if ('+-*/%&|^~!<>?:='.includes(ch)) {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }

      throw new Error(`인식할 수 없는 토큰 '${ch}'`);
    }

    return tokens;
  }

  /**
   * 토큰 스트림을 실제 실행 가능한 JavaScript 코드로 컴파일 (포인터/C문자열/정수 나눗셈 지원)
   */
  transpileCToJS(cCode) {
    const tokens = this.tokenizeC(cCode);
    const C_BASE_TYPES = new Set(['void', 'int', 'long', 'short', 'char', 'float', 'double', 'size_t', 'bool', '_Bool']);
    const C_TYPE_QUALS = new Set(['const', 'unsigned', 'signed', 'static', 'inline', 'volatile', 'struct']);

    let pos = 0;
    const peek = (offset = 0) => tokens[pos + offset] || null;
    const consume = () => tokens[pos++] || null;
    const expect = (type, value) => {
      const t = consume();
      if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
        throw new Error(`문법 오류: '${value || type}'가 필요하지만 '${t ? t.value : 'EOF'}'가 왔습니다.`);
      }
      return t;
    };

    const isTypeStartAt = (idx) => {
      const t = tokens[idx];
      return t && t.type === 'ident' && (C_BASE_TYPES.has(t.value) || C_TYPE_QUALS.has(t.value));
    };

    const parseTypeSpec = () => {
      let base = null;
      while (peek() && peek().type === 'ident' && (C_TYPE_QUALS.has(peek().value) || C_BASE_TYPES.has(peek().value))) {
        const w = consume().value;
        if (C_BASE_TYPES.has(w)) base = w;
      }
      let ptrDepth = 0;
      while (peek() && peek().type === 'op' && peek().value === '*') {
        consume();
        ptrDepth++;
      }
      return { base: base || 'int', ptrDepth };
    };

    const classifyVarKind = (base, ptrDepth, isArray) => {
      if (base === 'char' && (ptrDepth > 0 || isArray)) return 'cstr';
      if (ptrDepth > 0) return 'ptr';
      if (isArray) return 'arr';
      if (base === 'float' || base === 'double') return 'float';
      return 'int';
    };

    // 스코프 스택 관리
    const scopes = [new Map()];
    const fnSigs = new Map();
    const pushScope = () => scopes.push(new Map());
    const popScope = () => scopes.pop();
    const declareVar = (name, kind) => scopes[scopes.length - 1].set(name, kind);
    const lookupVar = (name) => {
      for (let s = scopes.length - 1; s >= 0; s--) {
        if (scopes[s].has(name)) return scopes[s].get(name);
      }
      return null;
    };

    // 표현식 노드 빌더 (kind 추적: 'int' | 'float' | 'ptr' | 'cstr' | 'arr', lvalue 메타 보존)
    const parseExpr = () => parseAssign();

    const parseAssign = () => {
      const left = parseTernary();
      const t = peek();
      const assignOps = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);
      if (t && t.type === 'op' && assignOps.has(t.value)) {
        const op = consume().value;
        const right = parseAssign();

        if (left.lvalType === 'deref') {
          if (op === '=') {
            return { js: `__ptrWrite(${left.ptrJs}, ${right.js})`, kind: 'int' };
          }
          const binOp = op.slice(0, -1);
          const exprFn = binOp === '/' ? `__cDiv(__v, ${right.js})` : `(__v ${binOp} (${right.js}))`;
          return { js: `__ptrMod(${left.ptrJs}, (__v) => ${exprFn})`, kind: 'int' };
        }

        if (left.lvalType === 'index') {
          if (op === '=') {
            return { js: `__idxWrite(${left.baseJs}, ${left.idxJs}, ${right.js})`, kind: 'int' };
          }
          const binOp = op.slice(0, -1);
          const rhsEval = binOp === '/' ? `__cDiv(__v, ${right.js})` : `(__v ${binOp} (${right.js}))`;
          return { js: `__idxMod(${left.baseJs}, ${left.idxJs}, (__v) => ${rhsEval})`, kind: 'int' };
        }

        if (left.lvalType === 'var') {
          if (op === '=' && left.kind === 'cstr') {
            return { js: `(${left.varName} = __cstrClone(${right.js}))`, kind: 'cstr' };
          }
          if (op === '/=' && left.kind === 'int' && right.kind !== 'float') {
            return { js: `(${left.varName} = __cDiv(${left.varName}, ${right.js}))`, kind: 'int' };
          }
          if ((op === '+=' || op === '-=') && (left.kind === 'cstr' || left.kind === 'ptr')) {
            const sign = op === '+=' ? 1 : -1;
            return { js: `__ptrShift(${left.varName}, (${sign}) * (${right.js}))`, kind: left.kind };
          }
          return { js: `(${left.varName} ${op} ${right.js})`, kind: left.kind };
        }

        throw new Error('대입 연산자의 좌변(L-value)이 올바르지 않습니다.');
      }
      return left;
    };

    const parseTernary = () => {
      const cond = parseOr();
      if (peek() && peek().type === 'op' && peek().value === '?') {
        consume();
        const tBranch = parseExpr();
        expect('op', ':');
        const fBranch = parseTernary();
        return {
          js: `(${cond.js} ? ${tBranch.js} : ${fBranch.js})`,
          kind: tBranch.kind === 'float' || fBranch.kind === 'float' ? 'float' : tBranch.kind
        };
      }
      return cond;
    };

    const parseBinaryLevel = (ops, nextFn) => {
      let left = nextFn();
      while (peek() && peek().type === 'op' && ops.includes(peek().value)) {
        const op = consume().value;
        const right = nextFn();
        if (op === '+' || op === '-') {
          const isPtrA = left.kind === 'cstr' || left.kind === 'ptr';
          const isPtrB = right.kind === 'cstr' || right.kind === 'ptr';
          if (isPtrA || isPtrB) {
            const helper = op === '+' ? '__cPtrAdd' : '__cPtrSub';
            const resKind = (isPtrA && isPtrB) ? 'int' : (isPtrA ? left.kind : right.kind);
            left = { js: `${helper}(${left.js}, ${right.js})`, kind: resKind };
            continue;
          }
        }
        if (['<', '<=', '>', '>=', '==', '!='].includes(op)) {
          const isPtrA = left.kind === 'cstr' || left.kind === 'ptr';
          const isPtrB = right.kind === 'cstr' || right.kind === 'ptr';
          if (isPtrA || isPtrB) {
            left = { js: `__cPtrCmp(${left.js}, ${right.js}, ${JSON.stringify(op)})`, kind: 'int' };
            continue;
          }
        }
        if (op === '/' && left.kind !== 'float' && right.kind !== 'float') {
          left = { js: `__cDiv(${left.js}, ${right.js})`, kind: 'int' };
          continue;
        }
        const jsOp = op === '==' ? '===' : (op === '!=' ? '!==' : op);
        const resKind = (left.kind === 'float' || right.kind === 'float') ? 'float' : 'int';
        left = { js: `(${left.js} ${jsOp} ${right.js})`, kind: resKind };
      }
      return left;
    };

    const parseOr = () => parseBinaryLevel(['||'], parseAnd);
    const parseAnd = () => parseBinaryLevel(['&&'], parseBitOr);
    const parseBitOr = () => parseBinaryLevel(['|'], parseBitXor);
    const parseBitXor = () => parseBinaryLevel(['^'], parseBitAnd);
    const parseBitAnd = () => parseBinaryLevel(['&'], parseEq);
    const parseEq = () => parseBinaryLevel(['==', '!='], parseRel);
    const parseRel = () => parseBinaryLevel(['<', '<=', '>', '>='], parseShift);
    const parseShift = () => parseBinaryLevel(['<<', '>>'], parseAdd);
    const parseAdd = () => parseBinaryLevel(['+', '-'], parseMul);
    const parseMul = () => parseBinaryLevel(['*', '/', '%'], parseUnary);

    const parseUnary = () => {
      const t = peek();
      if (!t) throw new Error('예상치 못한 입력 종료');

      // C 스타일 타입 캐스트: (int), (const char*), (double) 등
      if (t.type === 'punct' && t.value === '(' && isTypeStartAt(pos + 1)) {
        const saved = pos;
        consume(); // '('
        const castType = parseTypeSpec();
        if (peek() && peek().type === 'punct' && peek().value === ')') {
          consume(); // ')'
          const inner = parseUnary();
          if (castType.ptrDepth === 0 && ['int', 'long', 'short', 'char', 'size_t'].includes(castType.base)) {
            return { js: `Math.trunc(${inner.js})`, kind: 'int' };
          }
          if (castType.base === 'float' || castType.base === 'double') {
            return { js: `Number(${inner.js})`, kind: 'float' };
          }
          return { js: inner.js, kind: castType.base === 'char' ? 'cstr' : 'ptr' };
        }
        pos = saved;
      }

      if (t.type === 'op' && (t.value === '++' || t.value === '--')) {
        const op = consume().value;
        const target = parseUnary();
        const delta = op === '++' ? 1 : -1;
        if (target.kind === 'cstr' || target.kind === 'ptr') {
          return { js: `__ptrPreStep(${target.js}, ${delta})`, kind: target.kind };
        }
        if (target.lvalType === 'deref') {
          return { js: `__ptrMod(${target.ptrJs}, (__v) => __v + (${delta}))`, kind: 'int' };
        }
        if (target.lvalType === 'index') {
          return { js: `__idxMod(${target.baseJs}, ${target.idxJs}, (__v) => __v + (${delta}))`, kind: 'int' };
        }
        return { js: `(${op}${target.js})`, kind: target.kind };
      }

      if (t.type === 'op' && t.value === '*') {
        consume();
        const inner = parseUnary();
        return { js: `__ptrRead(${inner.js})`, kind: 'int', lvalType: 'deref', ptrJs: inner.js };
      }

      if (t.type === 'op' && t.value === '&') {
        consume();
        const inner = parseUnary();
        if (inner.lvalType === 'var') {
          return {
            js: `{ __ref: true, __get: () => ${inner.varName}, __set: (__v) => { ${inner.varName} = __v; } }`,
            kind: 'ptr'
          };
        }
        if (inner.lvalType === 'index') {
          return {
            js: `((__b, __i) => ({ __ref: true, __get: () => __idxRead(__b, __i), __set: (__v) => __idxWrite(__b, __i, __v) }))(${inner.baseJs}, ${inner.idxJs})`,
            kind: 'ptr'
          };
        }
        throw new Error("'&' 주소 연산자는 변수나 배열 요소에만 사용할 수 있습니다.");
      }

      if (t.type === 'op' && (t.value === '+' || t.value === '-' || t.value === '!' || t.value === '~')) {
        const op = consume().value;
        const inner = parseUnary();
        return { js: `(${op}${inner.js})`, kind: op === '!' ? 'int' : inner.kind };
      }

      if (t.type === 'ident' && t.value === 'sizeof') {
        consume();
        expect('punct', '(');
        let depth = 1;
        while (peek() && depth > 0) {
          const tk = consume();
          if (tk.value === '(') depth++;
          else if (tk.value === ')') depth--;
        }
        return { js: '4', kind: 'int' };
      }

      return parsePostfix();
    };

    const parsePostfix = () => {
      let expr = parsePrimary();
      while (peek()) {
        const t = peek();
        if (t.type === 'punct' && t.value === '[') {
          consume();
          const idxExpr = parseExpr();
          expect('punct', ']');
          expr = {
            js: `__idxRead(${expr.js}, ${idxExpr.js})`,
            kind: 'int',
            lvalType: 'index',
            baseJs: expr.js,
            idxJs: idxExpr.js
          };
          continue;
        }
        if (t.type === 'punct' && t.value === '(') {
          consume();
          const args = [];
          while (peek() && !(peek().type === 'punct' && peek().value === ')')) {
            args.push(parseExpr().js);
            if (peek() && peek().type === 'punct' && peek().value === ',') consume();
            else break;
          }
          expect('punct', ')');
          const fnName = expr.varName || expr.js;
          if (fnName === 'printf') {
            expr = { js: `__cPrintf(${args.join(', ')})`, kind: 'int' };
          } else {
            const retKind = fnSigs.get(fnName) || 'int';
            expr = { js: `${fnName}(${args.join(', ')})`, kind: retKind };
          }
          continue;
        }
        if (t.type === 'op' && (t.value === '++' || t.value === '--')) {
          const op = consume().value;
          const delta = op === '++' ? 1 : -1;
          if (expr.kind === 'cstr' || expr.kind === 'ptr') {
            expr = { js: `__ptrPostStep(${expr.js}, ${delta})`, kind: expr.kind };
          } else if (expr.lvalType === 'deref') {
            expr = { js: `__ptrPostMod(${expr.ptrJs}, (__v) => __v + (${delta}))`, kind: 'int' };
          } else if (expr.lvalType === 'index') {
            expr = { js: `__idxPostMod(${expr.baseJs}, ${expr.idxJs}, (__v) => __v + (${delta}))`, kind: 'int' };
          } else {
            expr = { js: `(${expr.js}${op})`, kind: expr.kind };
          }
          continue;
        }
        break;
      }
      return expr;
    };

    const parsePrimary = () => {
      const t = peek();
      if (!t) throw new Error('표현식이 예상되었으나 파일 끝에 도달했습니다.');
      if (t.type === 'number') {
        consume();
        return { js: String(t.value), kind: t.isFloat ? 'float' : 'int' };
      }
      if (t.type === 'char') {
        consume();
        return { js: String(t.value), kind: 'int' };
      }
      if (t.type === 'string') {
        consume();
        return { js: `__cstrFrom(${JSON.stringify(t.value)})`, kind: 'cstr' };
      }
      if (t.type === 'ident') {
        consume();
        if (t.value === 'NULL') return { js: 'null', kind: 'ptr' };
        if (t.value === 'true') return { js: '1', kind: 'int' };
        if (t.value === 'false') return { js: '0', kind: 'int' };
        const knownKind = lookupVar(t.value);
        return { js: t.value, kind: knownKind || 'int', lvalType: 'var', varName: t.value };
      }
      if (t.type === 'punct' && t.value === '(') {
        consume();
        const inner = parseExpr();
        expect('punct', ')');
        return { js: `(${inner.js})`, kind: inner.kind };
      }
      throw new Error(`예상치 못한 토큰 '${t.value}'`);
    };

    // 변수 선언문 파싱 (decl; 또는 for-init 내 decl;)
    const parseDeclStmt = (expectSemicolon = true) => {
      const baseSpec = parseTypeSpec();
      const parts = [];

      while (true) {
        let ptrDepth = baseSpec.ptrDepth;
        while (peek() && peek().type === 'op' && peek().value === '*') {
          consume();
          ptrDepth++;
        }
        const nameTok = expect('ident');
        let isArray = false;
        let arraySizeJs = null;

        if (peek() && peek().type === 'punct' && peek().value === '[') {
          isArray = true;
          consume();
          if (peek() && !(peek().type === 'punct' && peek().value === ']')) {
            arraySizeJs = parseExpr().js;
          }
          expect('punct', ']');
        }

        const kind = classifyVarKind(baseSpec.base, ptrDepth, isArray);
        declareVar(nameTok.value, kind);

        let initJs = null;
        if (peek() && peek().type === 'op' && peek().value === '=') {
          consume();
          if (peek() && peek().type === 'punct' && peek().value === '{') {
            consume();
            const elems = [];
            while (peek() && !(peek().type === 'punct' && peek().value === '}')) {
              elems.push(parseExpr().js);
              if (peek() && peek().type === 'punct' && peek().value === ',') consume();
              else break;
            }
            expect('punct', '}');
            initJs = `[${elems.join(', ')}]`;
          } else {
            const initExpr = parseExpr();
            initJs = kind === 'cstr' ? `__cstrClone(${initExpr.js})` : initExpr.js;
          }
        } else {
          if (isArray) {
            initJs = arraySizeJs ? `new Array(${arraySizeJs}).fill(0)` : '[]';
          } else if (kind === 'ptr' || kind === 'cstr') {
            initJs = 'null';
          } else {
            initJs = '0';
          }
        }

        parts.push(`${nameTok.value} = ${initJs}`);
        if (peek() && peek().type === 'punct' && peek().value === ',') {
          consume();
          continue;
        }
        break;
      }

      if (expectSemicolon) expect('punct', ';');
      return `let ${parts.join(', ')};`;
    };

    const wrapLoopBody = (stmtJs) => {
      const trimmed = stmtJs.trim();
      if (trimmed.startsWith('{')) {
        return `{\n__tick();\n${trimmed.slice(1)}`;
      }
      return `{\n__tick();\n${stmtJs}\n}`;
    };

    const parseStmt = () => {
      const t = peek();
      if (!t) throw new Error('문장이 예상되었으나 파일 끝에 도달했습니다.');

      // 빈 문장
      if (t.type === 'punct' && t.value === ';') { consume(); return ';'; }

      // 블록
      if (t.type === 'punct' && t.value === '{') {
        consume();
        pushScope();
        const stmts = [];
        while (peek() && !(peek().type === 'punct' && peek().value === '}')) {
          stmts.push(parseStmt());
        }
        expect('punct', '}');
        popScope();
        return `{\n${stmts.join('\n')}\n}`;
      }

      // return
      if (t.type === 'ident' && t.value === 'return') {
        consume();
        if (peek() && peek().type === 'punct' && peek().value === ';') {
          consume();
          return 'return;';
        }
        const val = parseExpr();
        expect('punct', ';');
        return `return (${val.js});`;
      }

      // if
      if (t.type === 'ident' && t.value === 'if') {
        consume();
        expect('punct', '(');
        const cond = parseExpr();
        expect('punct', ')');
        const thenJs = parseStmt();
        let out = `if (${cond.js}) ${thenJs}`;
        if (peek() && peek().type === 'ident' && peek().value === 'else') {
          consume();
          out += ` else ${parseStmt()}`;
        }
        return out;
      }

      // while
      if (t.type === 'ident' && t.value === 'while') {
        consume();
        expect('punct', '(');
        const cond = parseExpr();
        expect('punct', ')');
        const bodyJs = wrapLoopBody(parseStmt());
        return `while (${cond.js}) ${bodyJs}`;
      }

      // do ... while
      if (t.type === 'ident' && t.value === 'do') {
        consume();
        const bodyJs = wrapLoopBody(parseStmt());
        expect('ident', 'while');
        expect('punct', '(');
        const cond = parseExpr();
        expect('punct', ')');
        expect('punct', ';');
        return `do ${bodyJs} while (${cond.js});`;
      }

      // for
      if (t.type === 'ident' && t.value === 'for') {
        consume();
        expect('punct', '(');
        pushScope();
        let initJs = '';
        if (!(peek() && peek().type === 'punct' && peek().value === ';')) {
          if (isTypeStartAt(pos)) {
            initJs = parseDeclStmt(true).replace(/;$/, '');
          } else {
            initJs = parseExpr().js;
            expect('punct', ';');
          }
        } else {
          consume();
        }

        let condJs = 'true';
        if (!(peek() && peek().type === 'punct' && peek().value === ';')) {
          condJs = parseExpr().js;
        }
        expect('punct', ';');

        let updJs = '';
        if (!(peek() && peek().type === 'punct' && peek().value === ')')) {
          const steps = [parseExpr().js];
          while (peek() && peek().type === 'punct' && peek().value === ',') {
            consume();
            steps.push(parseExpr().js);
          }
          updJs = steps.join(', ');
        }
        expect('punct', ')');

        const bodyJs = wrapLoopBody(parseStmt());
        popScope();
        return `for (${initJs}; ${condJs}; ${updJs}) ${bodyJs}`;
      }

      // break / continue
      if (t.type === 'ident' && (t.value === 'break' || t.value === 'continue')) {
        const kw = consume().value;
        expect('punct', ';');
        return `${kw};`;
      }

      // 지역 변수 선언
      if (isTypeStartAt(pos)) {
        return parseDeclStmt(true);
      }

      // 일반 식 문장
      const expr = parseExpr();
      expect('punct', ';');
      return `${expr.js};`;
    };

    // 1패스: 최상위 함수 선언 스캔 & 본문 변환
    const fnBodies = [];
    while (pos < tokens.length) {
      if (isTypeStartAt(pos)) {
        const retType = parseTypeSpec();
        const fnNameTok = expect('ident');
        expect('punct', '(');
        const params = [];
        if (peek() && !(peek().type === 'punct' && peek().value === ')')) {
          // void 단일 파라미터 (func(void)) 처리
          if (peek().type === 'ident' && peek().value === 'void' && peek(1) && peek(1).value === ')') {
            consume();
          } else {
            while (true) {
              const pType = parseTypeSpec();
              const pName = expect('ident').value;
              let isArray = false;
              if (peek() && peek().type === 'punct' && peek().value === '[') {
                isArray = true;
                consume();
                if (peek() && peek().type === 'punct' && peek().value === ']') consume();
              }
              params.push({
                name: pName,
                kind: classifyVarKind(pType.base, pType.ptrDepth, isArray)
              });
              if (peek() && peek().type === 'punct' && peek().value === ',') consume();
              else break;
            }
          }
        }
        expect('punct', ')');

        fnSigs.set(fnNameTok.value, classifyVarKind(retType.base, retType.ptrDepth, false));

        // 전방 선언 `;` 인 경우 건너뛰기
        if (peek() && peek().type === 'punct' && peek().value === ';') {
          consume();
          continue;
        }

        pushScope();
        const prelude = [];
        params.forEach(p => {
          declareVar(p.name, p.kind);
          if (p.kind === 'cstr') {
            prelude.push(`${p.name} = __cstrClone(${p.name});`);
          }
        });

        const bodyJs = parseStmt();
        popScope();

        const paramList = params.map(p => p.name).join(', ');
        fnBodies.push(`function ${fnNameTok.value}(${paramList}) {\n${prelude.join('\n')}\n${bodyJs.slice(1)}`);
        continue;
      }

      throw new Error(`최상위 구문을 해석할 수 없습니다: '${peek().value}'`);
    }

    if (fnBodies.length === 0) {
      throw new Error('실행 가능한 C 함수가 정의되지 않았습니다.');
    }
    return fnBodies.join('\n\n');
  }

  /**
   * C 런타임(포인터 커서, 참조 역참조, C 정수 나눗셈, printf, 무한 루프 가드) 생성
   */
  createCContext(sourceCode, logs) {
    const compiledJS = this.transpileCToJS(sourceCode);
    const maxIters = this.maxLoopIterations;

    const vmFactoryBody = `
      "use strict";
      let __iters = 0;
      const __tick = () => {
        if (++__iters > ${maxIters}) {
          throw new Error("무한 루프 시간 초과: 반복 횟수(${maxIters.toLocaleString()}회)를 초과했습니다.");
        }
      };

      const __cDiv = (a, b) => {
        if (b === 0) throw new Error("0으로 나누기 오류 (Division by zero)");
        return Math.trunc(a / b);
      };

      const __cstrFrom = (s) => {
        if (s && s.__cstr) return { __cstr: true, buf: s.buf, idx: s.idx };
        const str = String(s || "");
        const buf = [];
        for (let i = 0; i < str.length; i++) buf.push(str.charCodeAt(i));
        buf.push(0);
        return { __cstr: true, buf, idx: 0 };
      };

      const __cstrClone = (v) => {
        if (v == null) return null;
        if (typeof v === 'string') return __cstrFrom(v);
        if (v.__cstr) return { __cstr: true, buf: v.buf, idx: v.idx };
        return v;
      };

      const __cstrToStr = (c) => {
        if (typeof c === 'string') return c;
        if (!c || !c.__cstr) return String(c);
        let out = '';
        for (let i = c.idx; i < c.buf.length && c.buf[i] !== 0; i++) {
          out += String.fromCharCode(c.buf[i]);
        }
        return out;
      };

      const __ptrRead = (p) => {
        if (p == null) throw new Error("NULL 포인터 역참조 오류 (Segmentation Fault)");
        if (p.__ref) return p.__get();
        if (p.__cstr) return p.idx < p.buf.length ? p.buf[p.idx] : 0;
        if (Array.isArray(p)) return p[0];
        throw new Error("유효하지 않은 포인터 역참조");
      };

      const __ptrWrite = (p, val) => {
        if (p == null) throw new Error("NULL 포인터 쓰기 오류 (Segmentation Fault)");
        if (p.__ref) { p.__set(val); return val; }
        if (p.__cstr) { p.buf[p.idx] = val; return val; }
        if (Array.isArray(p)) { p[0] = val; return val; }
        throw new Error("유효하지 않은 포인터 대입");
      };

      const __ptrMod = (p, fn) => {
        const nextVal = fn(__ptrRead(p));
        return __ptrWrite(p, nextVal);
      };

      const __ptrPostMod = (p, fn) => {
        const oldVal = __ptrRead(p);
        __ptrWrite(p, fn(oldVal));
        return oldVal;
      };

      const __ptrPostStep = (p, delta) => {
        if (p && p.__cstr) {
          const snap = { __cstr: true, buf: p.buf, idx: p.idx };
          p.idx += delta;
          return snap;
        }
        throw new Error("지원되지 않는 포인터 후위 증감");
      };

      const __ptrPreStep = (p, delta) => {
        if (p && p.__cstr) {
          p.idx += delta;
          return p;
        }
        throw new Error("지원되지 않는 포인터 전위 증감");
      };

      const __ptrShift = (p, delta) => {
        if (p && p.__cstr) { p.idx += delta; return p; }
        throw new Error("지원되지 않는 포인터 오프셋 연산");
      };

      const __cPtrAdd = (a, b) => {
        if (a && a.__cstr && typeof b === 'number') return { __cstr: true, buf: a.buf, idx: a.idx + b };
        if (b && b.__cstr && typeof a === 'number') return { __cstr: true, buf: b.buf, idx: b.idx + a };
        return a + b;
      };

      const __cPtrSub = (a, b) => {
        if (a && a.__cstr && b && b.__cstr) return a.idx - b.idx;
        if (a && a.__cstr && typeof b === 'number') return { __cstr: true, buf: a.buf, idx: a.idx - b };
        return a - b;
      };

      const __cPtrCmp = (a, b, op) => {
        if (op === '==') {
          if (a && b && a.__cstr && b.__cstr) return a.buf === b.buf && a.idx === b.idx;
          return a === b;
        }
        if (op === '!=') {
          if (a && b && a.__cstr && b.__cstr) return a.buf !== b.buf || a.idx !== b.idx;
          return a !== b;
        }
        const av = (a && a.__cstr) ? a.idx : a;
        const bv = (b && b.__cstr) ? b.idx : b;
        if (op === '<') return av < bv;
        if (op === '<=') return av <= bv;
        if (op === '>') return av > bv;
        if (op === '>=') return av >= bv;
        return false;
      };

      const __idxRead = (base, idx) => {
        if (base && base.__cstr) {
          const pos = base.idx + idx;
          return (pos >= 0 && pos < base.buf.length) ? base.buf[pos] : 0;
        }
        return base[idx];
      };

      const __idxWrite = (base, idx, val) => {
        if (base && base.__cstr) {
          base.buf[base.idx + idx] = val;
          return val;
        }
        base[idx] = val;
        return val;
      };

      const __idxMod = (base, idx, fn) => __idxWrite(base, idx, fn(__idxRead(base, idx)));
      const __idxPostMod = (base, idx, fn) => {
        const oldVal = __idxRead(base, idx);
        __idxWrite(base, idx, fn(oldVal));
        return oldVal;
      };

      const __cPrintf = (fmt, ...args) => {
        let out = typeof fmt === 'string' ? fmt : __cstrToStr(fmt);
        let idx = 0;
        out = out.replace(/%[-+0-9.]*[dioxXucsfeg]/g, (spec) => {
          const arg = args[idx++];
          if (spec.endsWith('s')) return __cstrToStr(arg);
          if (spec.endsWith('c')) return String.fromCharCode(Number(arg) || 0);
          return String(arg);
        });
        __logs.push(out.replace(/\\n$/, ''));
        return out.length;
      };

      ${compiledJS}

      return {
        invoke: (fnName, args) => {
          __iters = 0;
          const fn = ({ ${this.extractDeclaredFnNames(compiledJS).join(', ')} })[fnName];
          if (typeof fn !== 'function') {
            throw new ReferenceError("C 함수 '" + fnName + "'를 찾을 수 없습니다.");
          }
          const res = fn(...args);
          return (res && res.__cstr) ? __cstrToStr(res) : res;
        }
      };
    `;

    try {
      const factory = new Function('__logs', vmFactoryBody);
      return factory(logs);
    } catch (e) {
      throw new Error('C 코드 구문 해석 오류: ' + e.message);
    }
  }

  extractDeclaredFnNames(jsCode) {
    const names = new Set();
    const re = /^function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
    let m;
    while ((m = re.exec(jsCode)) !== null) {
      names.add(m[1]);
    }
    return Array.from(names);
  }
}

window.CodeRunner = CodeRunner;
