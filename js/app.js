/**
 * 키보드 반응속도 측정 (사람 순발력 + 키보드 하드웨어 입력 반응) & 타자 연습 메인 컨트롤러
 */
class TypingReflexApp {
  constructor() {
    this.svgEl = document.getElementById('keyboard-hand-svg');
    this.renderer = new window.KeyboardHandRenderer(this.svgEl);

    // 앱 상태
    this.lang = 'ko'; // 'ko' | 'en'
    this.currentMode = 'reflex_single'; // 'reflex_single' | 'reflex_rush' | 'hw_diagnostic' | 'practice_position' | 'practice_words' | 'practice_sentences'
    this.subOption = 'all'; // 자리/범위 필터: 'all' | 'home' | 'top' | 'bottom' | 'weak'

    // 반응속도 측정 상태
    this.reflexState = 'idle'; // 'idle' | 'waiting' | 'ready' | 'active' | 'finished'
    this.waitTimer = null;
    this.rushInterval = null;
    this.rushTimeLeft = 30;
    this.targetKeyCode = null;
    this.targetShift = false;
    this.signalStartTime = 0;
    this.roundReactions = [];
    this.maxSingleRounds = 5;

    // 타자 연습 상태
    this.targetText = '';
    this.nextTargetText = '';
    this.typingInput = document.getElementById('typing-input');
    this.sentenceStartTime = null;
    this.lastStrokeTime = 0;
    this.totalStrokesInSession = 0;
    this.correctStrokesInSession = 0;
    this.combo = 0;
    this.maxCombo = 0;

    // 키보드 하드웨어(HW) 입력 반응 측정 상태 초기화
    this.initHwMetrics();

    // 누적 통계 (LocalStorage 연동)
    this.stats = this.loadStats();

    this.bindElements();
    this.bindEvents();
    this.switchMode('reflex_single');
    this.updateFingerStatsUI();
  }

  initHwMetrics() {
    this.hw = {
      pressedKeys: new Map(), // code -> { downTimeStamp, downPerf }
      lastReleaseByKey: new Map(), // code -> releaseTimeStamp (채터링 감지용)
      lastEventTimeStamp: 0,
      minScanDeltaMs: null,
      estimatedPollingHz: null,
      pipelineLatencies: [],
      minPipelineMs: null,
      lastPipelineMs: null,
      dwellTimes: [],
      minDwellMs: null,
      lastDwellMs: null,
      currentNkro: 0,
      maxNkro: 0,
      chatterCount: 0,
      lastChatterKey: null,
      recentLogs: []
    };
  }

  loadStats() {
    const defaultStats = {
      bestReactionMs: null,
      totalHits: 0,
      totalMisses: 0,
      fingers: {},
      keys: {}
    };
    Object.keys(window.FINGER_INFO).forEach(fId => {
      defaultStats.fingers[fId] = { count: 0, totalMs: 0, misses: 0 };
    });

    try {
      const saved = localStorage.getItem('typing_reflex_stats_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultStats, ...parsed, fingers: { ...defaultStats.fingers, ...(parsed.fingers || {}) } };
      }
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
    return defaultStats;
  }

  saveStats() {
    try {
      localStorage.setItem('typing_reflex_stats_v1', JSON.stringify(this.stats));
    } catch (e) {
      // ignore storage errors
    }
  }

  resetStats() {
    localStorage.removeItem('typing_reflex_stats_v1');
    this.stats = this.loadStats();
    this.updateTopMetrics(null, 0, 100);
    this.updateFingerStatsUI();
    if (this.renderer.heatmapMode) {
      this.renderer.renderHeatmap(this.stats.keys);
      this.renderer.renderHeatmap(this.stats.keys);
    }
  }

  bindElements() {
    // 상단 지표 엘리먼트
    this.elMetricReaction = document.getElementById('metric-reaction');
    this.elMetricBest = document.getElementById('metric-best');
    this.elMetricHwDwell = document.getElementById('metric-hw-dwell');
    this.elMetricHwSub = document.getElementById('metric-hw-sub');
    this.elMetricSpeed = document.getElementById('metric-speed');
    this.elMetricSpeedUnit = document.getElementById('metric-speed-unit');
    this.elMetricAccuracy = document.getElementById('metric-accuracy');
    this.elMetricCombo = document.getElementById('metric-combo');

    // 중앙 스테이지 영역
    this.elReflexStage = document.getElementById('reflex-stage');
    this.elPracticeStage = document.getElementById('practice-stage');
    this.elHwStage = document.getElementById('hw-stage');

    // 반응속도 스테이지 내부 요소
    this.elReflexBox = document.getElementById('reflex-signal-box');
    this.elReflexBadge = document.getElementById('reflex-status-badge');
    this.elReflexTitle = document.getElementById('reflex-main-title');
    this.elReflexSub = document.getElementById('reflex-sub-desc');
    this.elReflexActionBtn = document.getElementById('reflex-start-btn');
    this.elReflexRoundPills = document.getElementById('reflex-round-pills');

    // 타자 연습 스테이지 내부 요소
    this.elFingerGuideBadge = document.getElementById('active-finger-badge');
    this.elTargetDisplay = document.getElementById('target-text-display');
    this.elNextDisplay = document.getElementById('next-text-preview');
    this.elPositionCard = document.getElementById('position-char-card');
    this.elPositionMainChar = document.getElementById('position-main-char');
    this.elPositionSubKey = document.getElementById('position-sub-key');
    this.elInputWrapper = document.getElementById('typing-input-wrapper');
    this.elCodeLangPill = document.getElementById('code-lang-pill');
    this.elCodeLangText = document.getElementById('code-lang-text');

    // 서브 필터 툴바 요소
    this.elSubFilterBar = document.getElementById('sub-filter-bar');
    this.elSubFilterLabel = document.getElementById('sub-filter-label');
    this.elSubFilterButtons = document.getElementById('sub-filter-buttons');

    // 키보드 하드웨어 진단 스테이지 요소
    this.elHwPipelineVal = document.getElementById('hw-pipeline-val');
    this.elHwPipelineSub = document.getElementById('hw-pipeline-sub');
    this.elHwDwellVal = document.getElementById('hw-dwell-val');
    this.elHwDwellSub = document.getElementById('hw-dwell-sub');
    this.elHwPollingVal = document.getElementById('hw-polling-val');
    this.elHwPollingSub = document.getElementById('hw-polling-sub');
    this.elHwNkroVal = document.getElementById('hw-nkro-val');
    this.elHwChatterSub = document.getElementById('hw-chatter-sub');
    this.elHwLogStream = document.getElementById('hw-log-stream');
  }

  bindEvents() {
    // 모드 탭 전환
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });

    // 세부 범위(서브 옵션) 버튼 이벤트 위임
    if (this.elSubFilterButtons) {
      this.elSubFilterButtons.addEventListener('click', (e) => {
        const btn = e.target.closest('.sub-filter-btn');
        if (!btn) return;
        this.elSubFilterButtons.querySelectorAll('.sub-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.subOption = btn.getAttribute('data-filter');
        this.restartCurrentMode();
      });
    }

    // 한/영 언어 토글
    document.querySelectorAll('.lang-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        this.setLanguage(lang);
      });
    });

    // 손 투명도 슬라이더
    const opacitySlider = document.getElementById('hand-opacity-slider');
    const opacityValue = document.getElementById('hand-opacity-value');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        opacityValue.textContent = `${Math.round(val * 100)}%`;
        this.renderer.setHandOpacity(val);
      });
    }

    // 운지법 구역 컬러 토글
    const zoneToggle = document.getElementById('toggle-zone-colors');
    if (zoneToggle) {
      zoneToggle.addEventListener('change', (e) => {
        this.renderer.setShowZoneColors(e.target.checked);
      });
    }

    // 사운드 토글
    const soundSelect = document.getElementById('sound-profile-select');
    if (soundSelect) {
      soundSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'mute') {
          window.soundEngine.enabled = false;
        } else {
          window.soundEngine.enabled = true;
          window.soundEngine.profile = val;
          window.soundEngine.playKey(true);
        }
      });
    }

    // 히트맵 토글 버튼
    const heatmapBtn = document.getElementById('btn-toggle-heatmap');
    if (heatmapBtn) {
      heatmapBtn.addEventListener('click', () => {
        const active = this.renderer.renderHeatmap(this.stats.keys);
        heatmapBtn.classList.toggle('active', active);
        heatmapBtn.textContent = active ? '🔥 히트맵 끄기' : '🗺️ 키보드 반응속도 히트맵';
      });
    }

    // 통계 초기화 버튼
    const resetStatsBtn = document.getElementById('btn-reset-stats');
    if (resetStatsBtn) {
      resetStatsBtn.addEventListener('click', () => {
        this.resetStats();
      });
    }

    // 하드웨어 측정값 초기화 버튼
    const resetHwBtn = document.getElementById('btn-reset-hw');
    if (resetHwBtn) {
      resetHwBtn.addEventListener('click', () => {
        this.initHwMetrics();
        this.updateHwDashboardUI();
        if (this.elHwLogStream) {
          this.elHwLogStream.innerHTML = `<span class="hw-log-placeholder">하드웨어 측정 기록이 초기화되었습니다. 아무 키나 눌러 측정을 시작하세요...</span>`;
        }
      });
    }

    // 반응속도 측정 시작 버튼
    this.elReflexActionBtn.addEventListener('click', () => {
      this.startReflexSession();
    });

    // 전역 키보드 이벤트 (keydown & keyup)
    window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleGlobalKeyUp(e));
    window.addEventListener('blur', () => {
      // 창 포커스 잃을 때 눌림 상태 해제
      this.hw.pressedKeys.forEach((_, kCode) => {
        this.renderer.setKeyHoldState(kCode, false);
      });
      this.hw.pressedKeys.clear();
      this.hw.currentNkro = 0;
      this.updateHwDashboardUI();
    });

    // 타자 연습(낱말/문장) 입력창 이벤트
    this.typingInput.addEventListener('input', () => this.handleTypingInput());
    this.typingInput.addEventListener('compositionupdate', () => {
      setTimeout(() => this.updateNextStrokeGuide(), 0);
    });
    this.typingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.checkSentenceSubmit();
      }
    });
  }

  // =========================================================================
  // 0. 키보드 하드웨어(HW) 입력 반응속도 측정 엔진 (상시 작동 & 전용 진단 탭)
  // =========================================================================

  recordHardwareKeyDown(e) {
    const perfNow = performance.now();
    const evTime = e.timeStamp || perfNow;
    const code = e.code;

    // 1) OS 커널(HID 인터럽트 타임스탬프) -> 브라우저 처리 파이프라인 지연 시간(ms)
    const rawLag = perfNow - evTime;
    const pipelineMs = Math.max(0.05, Math.min(80, Math.round(rawLag * 100) / 100));
    this.hw.lastPipelineMs = pipelineMs;
    this.hw.pipelineLatencies.push(pipelineMs);
    if (this.hw.pipelineLatencies.length > 100) this.hw.pipelineLatencies.shift();
    if (this.hw.minPipelineMs === null || pipelineMs < this.hw.minPipelineMs) {
      this.hw.minPipelineMs = pipelineMs;
    }

    // 2) 연속 이벤트 간 스캔 간격(Δt) 및 유효 폴링레이트(Hz) 추정
    if (this.hw.lastEventTimeStamp > 0) {
      const scanDelta = Math.abs(evTime - this.hw.lastEventTimeStamp);
      // 0.4ms 이상 16ms 이하의 연속 스캔 간격으로 폴링 주기 추정
      if (scanDelta >= 0.4 && scanDelta <= 25) {
        const roundedDelta = Math.round(scanDelta * 100) / 100;
        if (this.hw.minScanDeltaMs === null || roundedDelta < this.hw.minScanDeltaMs) {
          this.hw.minScanDeltaMs = roundedDelta;
        }
        // 표준 USB 폴링레이트 근사 (1000Hz=1ms, 500Hz=2ms, 250Hz=4ms, 125Hz=8ms)
        if (this.hw.minScanDeltaMs <= 1.35) this.hw.estimatedPollingHz = 1000;
        else if (this.hw.minScanDeltaMs <= 2.6) this.hw.estimatedPollingHz = 500;
        else if (this.hw.minScanDeltaMs <= 5.2) this.hw.estimatedPollingHz = 250;
        else this.hw.estimatedPollingHz = 125;
      }
    }
    this.hw.lastEventTimeStamp = evTime;

    // 3) 채터링(Chattering: 스위치 해제 직후 18ms 이내에 비정상 재입력) 감지
    let isChatter = false;
    if (this.hw.lastReleaseByKey.has(code)) {
      const sinceRelease = evTime - this.hw.lastReleaseByKey.get(code);
      if (sinceRelease >= 0 && sinceRelease < 18) {
        this.hw.chatterCount++;
        this.hw.lastChatterKey = code;
        isChatter = true;
      }
    }

    // 4) 동시 입력(NKRO) 및 키 눌림 시작 시각 기록
    this.hw.pressedKeys.set(code, { downTimeStamp: evTime, downPerf: perfNow, isChatter });
    this.hw.currentNkro = this.hw.pressedKeys.size;
    if (this.hw.currentNkro > this.hw.maxNkro) {
      this.hw.maxNkro = this.hw.currentNkro;
    }

    this.updateHwDashboardUI();
  }

  recordHardwareKeyUp(e) {
    const perfNow = performance.now();
    const evTime = e.timeStamp || perfNow;
    const code = e.code;

    // 연속 이벤트 스캔 간격 업데이트
    if (this.hw.lastEventTimeStamp > 0) {
      const scanDelta = Math.abs(evTime - this.hw.lastEventTimeStamp);
      if (scanDelta >= 0.4 && scanDelta <= 25) {
        const roundedDelta = Math.round(scanDelta * 100) / 100;
        if (this.hw.minScanDeltaMs === null || roundedDelta < this.hw.minScanDeltaMs) {
          this.hw.minScanDeltaMs = roundedDelta;
        }
        if (this.hw.minScanDeltaMs <= 1.35) this.hw.estimatedPollingHz = 1000;
        else if (this.hw.minScanDeltaMs <= 2.6) this.hw.estimatedPollingHz = 500;
        else if (this.hw.minScanDeltaMs <= 5.2) this.hw.estimatedPollingHz = 250;
        else this.hw.estimatedPollingHz = 125;
      }
    }
    this.hw.lastEventTimeStamp = evTime;

    // 스위치 눌림~해제 반응 시간 (Dwell / Release Time: keydown -> keyup) 계산
    let dwellMs = null;
    let wasChatter = false;
    if (this.hw.pressedKeys.has(code)) {
      const downInfo = this.hw.pressedKeys.get(code);
      wasChatter = downInfo.isChatter;
      const rawDwell = evTime - downInfo.downTimeStamp;
      dwellMs = Math.max(0.5, Math.round(rawDwell * 10) / 10);

      this.hw.lastDwellMs = dwellMs;
      this.hw.dwellTimes.push(dwellMs);
      if (this.hw.dwellTimes.length > 100) this.hw.dwellTimes.shift();

      if (this.hw.minDwellMs === null || dwellMs < this.hw.minDwellMs) {
        this.hw.minDwellMs = dwellMs;
      }
      this.hw.pressedKeys.delete(code);
    }

    this.hw.lastReleaseByKey.set(code, evTime);
    this.hw.currentNkro = this.hw.pressedKeys.size;

    // 하드웨어 진단 모드인 경우 키캡 위에 스위치 눌림 시간(ms) 표시 및 로그 추가
    if (this.currentMode === 'hw_diagnostic') {
      this.renderer.setKeyHoldState(code, false, dwellMs !== null ? `${dwellMs}ms` : '');
      if (dwellMs !== null) {
        const kData = window.KEY_MAP[code];
        const kLabel = kData ? (this.lang === 'ko' ? `${kData.ko}(${kData.en})` : kData.en) : code;
        this.hw.recentLogs.unshift({
          keyLabel: kLabel,
          dwellMs,
          pipelineMs: this.hw.lastPipelineMs || 0.2,
          isChatter: wasChatter
        });
        if (this.hw.recentLogs.length > 7) this.hw.recentLogs.pop();
        this.renderHwLogStream();
      }
    }

    this.updateHwDashboardUI();
  }

  updateHwDashboardUI() {
    // 1) 상단 바 HW 요약 카드 업데이트
    if (this.elMetricHwDwell) {
      this.elMetricHwDwell.textContent =
        this.hw.lastDwellMs !== null ? `${this.hw.lastDwellMs} ms` : '-- ms';
      const pipeTxt = this.hw.lastPipelineMs !== null ? `${this.hw.lastPipelineMs}ms` : '--';
      const minDwellTxt = this.hw.minDwellMs !== null ? `${this.hw.minDwellMs}ms` : '--';
      this.elMetricHwSub.textContent = `입력지연: ${pipeTxt} | 최단 눌림: ${minDwellTxt}`;
    }

    // 2) 하드웨어 진단 스테이지 상세 카드 업데이트
    if (!this.elHwPipelineVal) return;

    if (this.hw.lastPipelineMs !== null) {
      const avgPipe = (
        this.hw.pipelineLatencies.reduce((a, b) => a + b, 0) / this.hw.pipelineLatencies.length
      ).toFixed(2);
      this.elHwPipelineVal.textContent = `${this.hw.lastPipelineMs} ms`;
      this.elHwPipelineSub.textContent = `평균: ${avgPipe} ms | 최소: ${this.hw.minPipelineMs} ms`;
    } else {
      this.elHwPipelineVal.textContent = '-- ms';
      this.elHwPipelineSub.textContent = '평균: -- ms | 최소: -- ms (event.timeStamp 기준)';
    }

    if (this.hw.lastDwellMs !== null) {
      const avgDwell = Math.round(
        this.hw.dwellTimes.reduce((a, b) => a + b, 0) / this.hw.dwellTimes.length
      );
      this.elHwDwellVal.textContent = `${this.hw.lastDwellMs} ms`;
      this.elHwDwellSub.textContent = `최단 릴리즈 기록: ${this.hw.minDwellMs} ms | 평균: ${avgDwell} ms`;
    } else {
      this.elHwDwellVal.textContent = '-- ms';
      this.elHwDwellSub.textContent = '최단 릴리즈 기록: -- ms | 평균: -- ms';
    }

    if (this.hw.minScanDeltaMs !== null) {
      this.elHwPollingVal.textContent = `~${this.hw.estimatedPollingHz} Hz`;
      this.elHwPollingSub.textContent = `최소 스캔 간격(Δt): ${this.hw.minScanDeltaMs} ms`;
    } else {
      this.elHwPollingVal.textContent = '-- Hz';
      this.elHwPollingSub.textContent = '최소 이벤트 간격(Δt): -- ms (여러 키 연타/롤링 시 측정)';
    }

    this.elHwNkroVal.textContent = `${this.hw.currentNkro} 키 눌림 (최대 ${this.hw.maxNkro}KRO)`;
    if (this.hw.chatterCount > 0) {
      this.elHwChatterSub.textContent = `⚠️ 채터링 감지: ${this.hw.chatterCount}건 (최근: ${this.hw.lastChatterKey})`;
      this.elHwChatterSub.style.color = '#f43f5e';
    } else {
      this.elHwChatterSub.textContent = '스위치 채터링(<18ms 재입력): 정상 (0건)';
      this.elHwChatterSub.style.color = '#64748b';
    }
  }

  renderHwLogStream() {
    if (!this.elHwLogStream) return;
    this.elHwLogStream.innerHTML = '';
    this.hw.recentLogs.forEach(item => {
      const span = document.createElement('span');
      span.className = 'hw-log-pill' + (item.isChatter ? ' chatter-warn' : '');
      span.textContent = item.isChatter
        ? `⚠️ [${item.keyLabel}] 채터링 감지! (눌림 ${item.dwellMs}ms)`
        : `[${item.keyLabel}] 스위치 눌림 ${item.dwellMs}ms · 입력지연 ${item.pipelineMs}ms`;
      this.elHwLogStream.appendChild(span);
    });
  }

  // =========================================================================
  // 모드 및 언어 전환
  // =========================================================================

  setLanguage(lang) {
    this.lang = lang;
    this.targetText = '';
    this.nextTargetText = '';
    this._nextLitItem = null;
    this._nextSnippetItem = null;
    document.querySelectorAll('.lang-switch-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    this.renderer.setLanguage(lang);
    this.renderSubFilterButtons();
    this.restartCurrentMode();
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.clearTimers();
    this.targetText = '';
    this.nextTargetText = '';
    this._nextLitItem = null;
    this._nextSnippetItem = null;

    if (mode === 'practice_code' && this.lang !== 'en') {
      this.lang = 'en';
      document.querySelectorAll('.lang-switch-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang') === 'en');
      });
      this.renderer.setLanguage('en');
    }

    document.querySelectorAll('.mode-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });

    this.renderSubFilterButtons();
    this.restartCurrentMode();
  }

  renderSubFilterButtons() {
    if (!this.elSubFilterBar || !this.elSubFilterButtons) return;

    if (this.currentMode === 'hw_diagnostic') {
      this.elSubFilterBar.style.display = 'none';
      return;
    }

    this.elSubFilterBar.style.display = 'flex';
    let label = '출제 범위:';
    let buttons = [];

    if (this.currentMode === 'reflex_single' || this.currentMode === 'reflex_rush' || this.currentMode === 'practice_position') {
      label = '출제 범위:';
      buttons = [
        { filter: 'all', text: '전체 자판' },
        { filter: 'home', text: '기본 자리 (홈 로우)' },
        { filter: 'top', text: '윗자리 (상단열)' },
        { filter: 'bottom', text: '아랫자리 (하단열)' },
        { filter: 'weak', text: '소지·약지 집중 훈련' }
      ];
      if (!['all', 'home', 'top', 'bottom', 'weak'].includes(this.subOption)) {
        this.subOption = 'all';
      }
    } else if (this.currentMode === 'practice_words') {
      label = this.lang === 'ko' ? '단어 테마:' : 'Word Theme:';
      buttons = [
        { filter: 'dev', text: this.lang === 'ko' ? '💻 개발자 필수 영단어' : '💻 Developer Words' },
        { filter: 'all', text: this.lang === 'ko' ? '전체 혼합' : 'All Mixed' },
        { filter: 'general', text: this.lang === 'ko' ? '일상 빈출 영단어' : 'General Words' }
      ];
      if (!['dev', 'all', 'general'].includes(this.subOption)) {
        this.subOption = 'dev';
      }
    } else if (this.currentMode === 'practice_sentences') {
      label = this.lang === 'ko' ? '한국 문학 장르:' : 'Literature Genre:';
      buttons = this.lang === 'ko' ? [
        { filter: 'all', text: '📖 전체 명작 구절' },
        { filter: 'novel', text: '📚 소설 / 단편 (이효석·이상·황순원)' },
        { filter: 'poem', text: '🖋️ 서정시 (윤동주·김소월·백석)' },
        { filter: 'essay', text: '🌿 명수필 / 고전 (피천득·법정)' }
      ] : [
        { filter: 'all', text: '📖 All Literature' },
        { filter: 'novel', text: '📚 Classic Novels (Gatsby, 1984)' },
        { filter: 'poem', text: '🖋️ Poetry (Frost, Dickinson)' },
        { filter: 'essay', text: '🌿 Drama & Essays (Shakespeare)' }
      ];
      if (!['all', 'novel', 'poem', 'essay'].includes(this.subOption)) {
        this.subOption = 'all';
      }
    } else if (this.currentMode === 'practice_code') {
      label = '언어 선택:';
      buttons = [
        { filter: 'all', text: '💻 전체 언어 모음' },
        { filter: 'js', text: 'JavaScript / TypeScript' },
        { filter: 'py', text: 'Python' },
        { filter: 'cpp', text: 'C / C++ / Rust / Go' },
        { filter: 'web', text: 'HTML / CSS / SQL' }
      ];
      if (!['all', 'js', 'py', 'cpp', 'web'].includes(this.subOption)) {
        this.subOption = 'all';
      }
    }

    if (this.elSubFilterLabel) this.elSubFilterLabel.textContent = label;
    this.elSubFilterButtons.innerHTML = '';
    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'sub-filter-btn' + (b.filter === this.subOption ? ' active' : '');
      btn.setAttribute('data-filter', b.filter);
      btn.textContent = b.text;
      this.elSubFilterButtons.appendChild(btn);
    });
  }

  restartCurrentMode() {
    this.clearTimers();
    this.combo = 0;
    this.totalStrokesInSession = 0;
    this.correctStrokesInSession = 0;
    this.targetText = '';
    this.nextTargetText = '';
    this._nextLitItem = null;
    this._nextSnippetItem = null;
    this.renderer.clearTargets();
    this.updateTopMetrics(null, 0, 100);

    if (this.currentMode === 'reflex_single' || this.currentMode === 'reflex_rush') {
      this.elReflexStage.style.display = 'flex';
      this.elPracticeStage.style.display = 'none';
      this.elHwStage.style.display = 'none';
      this.setupReflexIdleUI();
    } else if (this.currentMode === 'hw_diagnostic') {
      this.elReflexStage.style.display = 'none';
      this.elPracticeStage.style.display = 'none';
      this.elHwStage.style.display = 'flex';
      this.updateFingerBadge(null);
      this.updateHwDashboardUI();
    } else {
      this.elReflexStage.style.display = 'none';
      this.elPracticeStage.style.display = 'flex';
      this.elHwStage.style.display = 'none';
      this.startPracticeMode();
    }
  }

  clearTimers() {
    if (this.waitTimer) {
      clearTimeout(this.waitTimer);
      this.waitTimer = null;
    }
    if (this.rushInterval) {
      clearInterval(this.rushInterval);
      this.rushInterval = null;
    }
  }

  getCandidateKeyCodes() {
    const allAlphaKeys = [];
    window.KEYBOARD_ROWS.forEach(row => {
      row.forEach(k => {
        if (!k.isModifier && k.row >= 1 && k.row <= 3 && k.code.startsWith('Key')) {
          allAlphaKeys.push(k);
        }
      });
    });

    if (this.subOption === 'home') {
      return allAlphaKeys.filter(k => k.rowType === 'home').map(k => k.code);
    }
    if (this.subOption === 'top') {
      return allAlphaKeys.filter(k => k.rowType === 'top').map(k => k.code);
    }
    if (this.subOption === 'bottom') {
      return allAlphaKeys.filter(k => k.rowType === 'bottom').map(k => k.code);
    }
    if (this.subOption === 'weak') {
      return allAlphaKeys
        .filter(k => k.finger.includes('PINKY') || k.finger.includes('RING'))
        .map(k => k.code);
    }
    return allAlphaKeys.map(k => k.code);
  }

  // =========================================================================
  // 1. 사람 순발력 반응속도 측정 모드 (단일 순발력 & 30초 연속 리플렉스)
  // =========================================================================

  setupReflexIdleUI() {
    this.reflexState = 'idle';
    this.roundReactions = [];
    this.elReflexBox.className = 'reflex-signal-box state-idle';

    if (this.currentMode === 'reflex_single') {
      this.elReflexBadge.textContent = '⚡ 단일 키 순발력 측정 (5회)';
      this.elReflexTitle.textContent = '양손을 기본 자리(ㅁㄴㅇㄹ / ㅓㅏㅣ)에 올려두세요';
      this.elReflexSub.textContent = '신호가 초록색으로 바뀌며 특정 키와 손가락이 빛나면 가장 빠르게 해당 키를 누르세요!';
      this.elReflexActionBtn.textContent = '측정 시작 (Space)';
      this.elReflexActionBtn.style.display = 'inline-flex';
      this.renderRoundPills();
    } else {
      this.elReflexBadge.textContent = '🔥 30초 연속 타겟 리플렉스';
      this.elReflexTitle.textContent = '30초 동안 켜지는 키를 해당 손가락으로 빠르게 타건하세요';
      this.elReflexSub.textContent = '연속 반응속도(ms), 초당 타건수(KPS), 손가락별 민첩성을 종합 측정합니다.';
      this.elReflexActionBtn.textContent = '30초 리플렉스 시작 (Space)';
      this.elReflexActionBtn.style.display = 'inline-flex';
      this.elReflexRoundPills.innerHTML = '';
    }

    this.updateFingerBadge(null);
  }

  renderRoundPills() {
    this.elReflexRoundPills.innerHTML = '';
    for (let i = 0; i < this.maxSingleRounds; i++) {
      const pill = document.createElement('span');
      pill.className = 'round-pill';
      if (this.roundReactions[i] !== undefined) {
        pill.classList.add('done');
        pill.textContent = `${i + 1}회: ${this.roundReactions[i]}ms`;
      } else {
        pill.textContent = `${i + 1}회 대기`;
      }
      this.elReflexRoundPills.appendChild(pill);
    }
  }

  startReflexSession() {
    this.clearTimers();
    this.combo = 0;
    this.totalStrokesInSession = 0;
    this.correctStrokesInSession = 0;

    if (this.currentMode === 'reflex_single') {
      this.roundReactions = [];
      this.renderRoundPills();
      this.startNextSingleReflexRound();
    } else if (this.currentMode === 'reflex_rush') {
      this.rushTimeLeft = 30;
      this.reflexState = 'active';
      this.elReflexActionBtn.style.display = 'none';
      this.elReflexBox.className = 'reflex-signal-box state-active';
      this.spawnNextRushTarget();

      this.rushInterval = setInterval(() => {
        this.rushTimeLeft -= 1;
        this.elReflexBadge.textContent = `🔥 남은 시간: ${this.rushTimeLeft}초`;
        if (this.rushTimeLeft <= 0) {
          this.finishRushSession();
        }
      }, 1000);
    }
  }

  startNextSingleReflexRound() {
    this.reflexState = 'waiting';
    this.targetKeyCode = null;
    this.renderer.clearTargets();
    this.updateFingerBadge(null);

    this.elReflexActionBtn.style.display = 'none';
    this.elReflexBox.className = 'reflex-signal-box state-waiting';
    this.elReflexBadge.textContent = `🔴 준비 (${this.roundReactions.length + 1} / ${this.maxSingleRounds}회)`;
    this.elReflexTitle.textContent = '기다리세요... 신호를 주시하세요';
    this.elReflexSub.textContent = '손가락을 홈 로우 위에 가볍게 올려두고 대기하세요 (미리 누르면 부정출발!)';

    const randomDelay = 1200 + Math.random() * 2000;
    this.waitTimer = setTimeout(() => {
      this.triggerSingleReflexSignal();
    }, randomDelay);
  }

  triggerSingleReflexSignal() {
    const candidates = this.getCandidateKeyCodes();
    const chosenCode = candidates[Math.floor(Math.random() * candidates.length)];
    this.targetKeyCode = chosenCode;
    this.targetShift = false;
    this.reflexState = 'active';

    const keyData = window.KEY_MAP[chosenCode];
    const fingerInfo = window.FINGER_INFO[keyData.finger];
    const displayChar = this.lang === 'ko' ? `${keyData.ko} (${keyData.en})` : keyData.en;

    this.renderer.setTargetKey(chosenCode, false);
    this.updateFingerBadge(keyData.finger, displayChar);
    window.soundEngine.playSignal();

    this.elReflexBox.className = 'reflex-signal-box state-go';
    this.elReflexBadge.textContent = '🟢 지금 누르세요!';
    this.elReflexTitle.textContent = `[ ${displayChar} ]`;
    this.elReflexSub.textContent = `${fingerInfo.name}으로 지금 즉시 누르세요!`;

    this.signalStartTime = performance.now();
  }

  spawnNextRushTarget() {
    const candidates = this.getCandidateKeyCodes();
    let nextCode = candidates[Math.floor(Math.random() * candidates.length)];
    if (candidates.length > 1 && nextCode === this.targetKeyCode) {
      nextCode = candidates[(candidates.indexOf(nextCode) + 1) % candidates.length];
    }

    this.targetKeyCode = nextCode;
    this.targetShift = false;
    const keyData = window.KEY_MAP[nextCode];
    const fingerInfo = window.FINGER_INFO[keyData.finger];
    const displayChar = this.lang === 'ko' ? `${keyData.ko} (${keyData.en})` : keyData.en;

    this.renderer.setTargetKey(nextCode, false);
    this.updateFingerBadge(keyData.finger, displayChar);

    this.elReflexBadge.textContent = `🔥 남은 시간: ${this.rushTimeLeft}초 | 콤보 ${this.combo}`;
    this.elReflexTitle.textContent = `[ ${displayChar} ]`;
    this.elReflexSub.textContent = `${fingerInfo.name}`;

    this.signalStartTime = performance.now();
  }

  finishRushSession() {
    this.clearTimers();
    this.reflexState = 'finished';
    this.renderer.clearTargets();
    window.soundEngine.playComplete();

    const avgMs = this.roundReactions.length > 0
      ? Math.round(this.roundReactions.reduce((a, b) => a + b, 0) / this.roundReactions.length)
      : 0;
    const kps = (this.correctStrokesInSession / 30).toFixed(2);

    this.elReflexBox.className = 'reflex-signal-box state-idle';
    this.elReflexBadge.textContent = '🏁 30초 리플렉스 측정 완료!';
    this.elReflexTitle.textContent = `평균 반응속도 ${avgMs}ms · 초당 ${kps}타 (총 ${this.correctStrokesInSession}타)`;
    this.elReflexSub.textContent = `최대 콤보: ${this.maxCombo} | 하단 손가락별 반응속도 리포트에서 취약 손가락을 확인해 보세요.`;
    this.elReflexActionBtn.textContent = '다시 도전하기 (Space)';
    this.elReflexActionBtn.style.display = 'inline-flex';
  }

  // =========================================================================
  // 2. 타자 연습 모드 (자리 연습 / 낱말 연습 / 문장 연습)
  // =========================================================================

  startPracticeMode() {
    this.roundReactions = [];
    this.lastStrokeTime = performance.now();

    if (this.currentMode === 'practice_position') {
      this.elPositionCard.style.display = 'flex';
      this.elTargetDisplay.style.display = 'none';
      this.elNextDisplay.style.display = 'none';
      this.elInputWrapper.style.display = 'none';
      this.spawnNextPositionChar();
    } else {
      this.elPositionCard.style.display = 'none';
      this.elTargetDisplay.style.display = 'flex';
      this.elNextDisplay.style.display = 'block';
      this.elInputWrapper.style.display = 'flex';
      this.typingInput.value = '';
      this.typingInput.focus();
      this.loadNextPracticePrompt();
    }
  }

  spawnNextPositionChar() {
    const dataset = window.PRACTICE_DATASETS[this.lang];
    let pool = dataset.position_all;
    if (this.subOption === 'home') pool = dataset.position_home;
    else if (this.subOption === 'top') pool = dataset.position_top;
    else if (this.subOption === 'bottom') pool = dataset.position_bottom;
    else if (this.subOption === 'weak') {
      const weakCodes = this.getCandidateKeyCodes();
      pool = weakCodes.map(c => (this.lang === 'ko' ? window.KEY_MAP[c].ko : window.KEY_MAP[c].en));
    }

    let nextChar = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && nextChar === this.targetText) {
      nextChar = pool[(pool.indexOf(nextChar) + 1) % pool.length];
    }

    this.targetText = nextChar;
    const strokes = window.decomposeCharToKeyStrokes(nextChar);
    const firstStroke = strokes[0];
    this.targetKeyCode = firstStroke.code;
    this.targetShift = firstStroke.shift;

    const keyData = window.KEY_MAP[this.targetKeyCode];
    this.elPositionMainChar.textContent = nextChar;
    this.elPositionSubKey.textContent = this.lang === 'ko' ? `영문 ${keyData.en} 자리` : `한글 ${keyData.ko} 자리`;

    this.renderer.setTargetKey(this.targetKeyCode, this.targetShift);
    this.updateFingerBadge(keyData.finger, `${nextChar} (${keyData.en})`);
    this.signalStartTime = performance.now();
  }

  loadNextPracticePrompt() {
    const dataset = window.PRACTICE_DATASETS[this.lang] || window.PRACTICE_DATASETS.en;

    if (this.currentMode === 'practice_words') {
      let pool = dataset.words;
      if (this.subOption === 'dev') {
        pool = dataset.prog_words || dataset.words;
      } else if (this.subOption === 'all') {
        pool = [...(dataset.words || []), ...(dataset.prog_words || [])];
      } else {
        pool = dataset.words;
      }

      const pickWords = () => {
        const arr = [];
        for (let i = 0; i < 5; i++) {
          arr.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return arr.join(' ');
      };

      let curWords = this.nextTargetText;
      if (!curWords || (this.lang === 'en' && /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(curWords)) || (this.lang === 'ko' && !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(curWords))) {
        curWords = pickWords();
      }
      this.targetText = curWords;
      this.nextTargetText = pickWords();

      if (this.elCodeLangPill) this.elCodeLangPill.style.display = 'none';
      if (this.elPracticeStage) this.elPracticeStage.classList.remove('is-code-mode');
    } else if (this.currentMode === 'practice_code') {
      const enDataset = window.PRACTICE_DATASETS.en;
      let pool = enDataset.code_snippets || [];

      if (this.subOption === 'js') {
        pool = pool.filter(item => item.lang === 'JavaScript' || item.lang === 'TypeScript');
      } else if (this.subOption === 'py') {
        pool = pool.filter(item => item.lang === 'Python');
      } else if (this.subOption === 'cpp') {
        pool = pool.filter(item => ['C', 'C++', 'Rust', 'Go'].includes(item.lang));
      } else if (this.subOption === 'web') {
        pool = pool.filter(item => ['HTML', 'CSS', 'SQL'].includes(item.lang));
      }

      if (pool.length === 0) pool = enDataset.code_snippets;

      const pickSnippet = () => pool[Math.floor(Math.random() * pool.length)];
      let curItem = this._nextSnippetItem;
      if (!curItem || !pool.includes(curItem)) {
        curItem = pickSnippet();
      }
      this._nextSnippetItem = pickSnippet();
      while (pool.length > 1 && this._nextSnippetItem === curItem) {
        this._nextSnippetItem = pickSnippet();
      }

      this.targetText = curItem.text;
      this.nextTargetText = this._nextSnippetItem.text;

      if (this.elCodeLangPill && this.elCodeLangText) {
        this.elCodeLangPill.className = 'code-lang-pill mode-code';
        const iconEl = this.elCodeLangPill.querySelector('.code-icon');
        if (iconEl) iconEl.textContent = '💻';
        this.elCodeLangText.textContent = curItem.lang;
        this.elCodeLangPill.style.display = 'inline-flex';
      }
      if (this.elPracticeStage) this.elPracticeStage.classList.add('is-code-mode');
    } else {
      // 짧은 글 연습 (한/영 문학 명구절)
      const litList = dataset.literature || [];
      let pool = litList;

      if (this.subOption === 'novel') {
        pool = litList.filter(item => item.category === 'novel');
      } else if (this.subOption === 'poem') {
        pool = litList.filter(item => item.category === 'poem');
      } else if (this.subOption === 'essay') {
        pool = litList.filter(item => item.category === 'essay' || item.category === 'drama_essay');
      }

      if (pool.length === 0) pool = litList;

      const pickLit = () => pool[Math.floor(Math.random() * pool.length)];
      let curItem = this._nextLitItem;
      if (!curItem || !pool.includes(curItem)) {
        curItem = pickLit();
      }
      this._nextLitItem = pickLit();
      while (pool.length > 1 && this._nextLitItem === curItem) {
        this._nextLitItem = pickLit();
      }

      this.targetText = curItem.text;
      this.nextTargetText = this._nextLitItem.text;

      if (this.elCodeLangPill && this.elCodeLangText) {
        this.elCodeLangPill.className = 'code-lang-pill mode-literature';
        const iconEl = this.elCodeLangPill.querySelector('.code-icon');
        if (iconEl) iconEl.textContent = '📖';
        this.elCodeLangText.textContent = `${curItem.author} · 《${curItem.title}》`;
        this.elCodeLangPill.style.display = 'inline-flex';
      }
      if (this.elPracticeStage) this.elPracticeStage.classList.remove('is-code-mode');
    }

    this.typingInput.value = '';
    this.sentenceStartTime = null;
    this.lastStrokeTime = performance.now();
    this.renderPromptCharacters('');
    this.elNextDisplay.textContent = `다음: ${this.nextTargetText}`;
    this.updateNextStrokeGuide();
  }

  renderPromptCharacters(typed) {
    this.elTargetDisplay.innerHTML = '';
    for (let i = 0; i < this.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'prompt-char';
      span.textContent = this.targetText[i] === ' ' ? '␣' : this.targetText[i];
      if (this.targetText[i] === ' ') span.classList.add('space-char');

      if (i < typed.length) {
        if (typed[i] === this.targetText[i]) {
          span.classList.add('char-correct');
        } else {
          span.classList.add('char-wrong');
        }
      } else if (i === typed.length) {
        span.classList.add('char-current');
      }
      this.elTargetDisplay.appendChild(span);
    }
  }

  updateNextStrokeGuide() {
    if (this.currentMode !== 'practice_words' && this.currentMode !== 'practice_sentences' && this.currentMode !== 'practice_code') return;

    const typed = this.typingInput.value;
    this.renderPromptCharacters(typed);

    let charIdx = typed.length;
    let strokeOffset = 0;

    if (typed.length > 0 && typed.length <= this.targetText.length) {
      const lastIdx = typed.length - 1;
      const typedLast = typed[lastIdx];
      const targetLast = this.targetText[lastIdx];

      if (typedLast !== targetLast) {
        const targetStrokes = window.decomposeCharToKeyStrokes(targetLast);
        const typedStrokes = window.decomposeCharToKeyStrokes(typedLast);

        let isPrefix = typedStrokes.length < targetStrokes.length;
        if (isPrefix) {
          for (let i = 0; i < typedStrokes.length; i++) {
            if (typedStrokes[i].code !== targetStrokes[i].code) {
              isPrefix = false;
              break;
            }
          }
        }
        if (isPrefix) {
          charIdx = lastIdx;
          strokeOffset = typedStrokes.length;
        }
      }
    }

    if (charIdx >= this.targetText.length) {
      this.renderer.setTargetKey('Enter', false);
      this.updateFingerBadge('R_PINKY', 'Enter ↵');
      return;
    }

    const targetChar = this.targetText[charIdx];
    const strokes = window.decomposeCharToKeyStrokes(targetChar);
    const nextStroke = strokes[strokeOffset] || strokes[0];

    if (nextStroke) {
      this.targetKeyCode = nextStroke.code;
      this.targetShift = nextStroke.shift;
      this.renderer.setTargetKey(nextStroke.code, nextStroke.shift);

      const keyData = window.KEY_MAP[nextStroke.code];
      const label = nextStroke.jamo
        ? `${nextStroke.jamo} (${keyData.en})`
        : (nextStroke.char === ' ' ? '스페이스바' : nextStroke.char);
      this.updateFingerBadge(keyData.finger, label, nextStroke.shift);
    }
  }

  handleTypingInput() {
    const typed = this.typingInput.value;
    if (!this.sentenceStartTime && typed.length > 0) {
      this.sentenceStartTime = performance.now();
    }

    this.updateNextStrokeGuide();

    if (this.sentenceStartTime && typed.length > 0) {
      const elapsedMin = (performance.now() - this.sentenceStartTime) / 60000;
      if (elapsedMin > 0.005) {
        let totalTypedStrokes = 0;
        let correctChars = 0;
        for (let i = 0; i < typed.length; i++) {
          totalTypedStrokes += window.decomposeCharToKeyStrokes(typed[i]).length;
          if (typed[i] === this.targetText[i]) correctChars++;
        }
        const cpm = Math.round(totalTypedStrokes / elapsedMin);
        const acc = Math.round((correctChars / typed.length) * 100);

        if (this.lang === 'en' || this.currentMode === 'practice_code') {
          const wpm = Math.round(cpm / 5);
          this.elMetricSpeed.textContent = `${wpm} WPM`;
          this.elMetricSpeedUnit.textContent = `속도 (${cpm} CPM)`;
        } else {
          this.elMetricSpeed.textContent = cpm;
          this.elMetricSpeedUnit.textContent = '타/분 (CPM)';
        }
        this.elMetricAccuracy.textContent = `${acc}%`;
      }
    }

    if (typed === this.targetText) {
      window.soundEngine.playComplete();
      this.loadNextPracticePrompt();
    }
  }

  checkSentenceSubmit() {
    if (this.typingInput.value.length >= this.targetText.length) {
      window.soundEngine.playComplete();
      this.loadNextPracticePrompt();
    }
  }

  // =========================================================================
  // 3. 전역 키 입력 핸들러 (keydown & keyup)
  // =========================================================================

  handleGlobalKeyUp(e) {
    this.recordHardwareKeyUp(e);
  }

  handleGlobalKeyDown(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.repeat) return;

    const code = e.code;

    // 모든 모드에서 키보드 하드웨어 반응 지표 측정
    this.recordHardwareKeyDown(e);

    // 0) 키보드 하드웨어(HW) 진단 전용 모드인 경우: 다중 키(NKRO) 및 실시간 손가락 홀드 표시
    if (this.currentMode === 'hw_diagnostic') {
      if (window.KEY_MAP[code]) {
        e.preventDefault();
        const kData = window.KEY_MAP[code];
        this.renderer.setKeyHoldState(code, true);
        window.soundEngine.playKey(true);
        const displayLabel = this.lang === 'ko' ? `${kData.ko} (${kData.en})` : kData.en;
        this.updateFingerBadge(kData.finger, displayLabel);
      }
      return;
    }

    // 1) 반응속도 측정 대기/완료 상태에서 Space로 바로 시작
    if (
      (this.currentMode === 'reflex_single' || this.currentMode === 'reflex_rush') &&
      (this.reflexState === 'idle' || this.reflexState === 'finished') &&
      code === 'Space'
    ) {
      e.preventDefault();
      this.startReflexSession();
      return;
    }

    // 2) 단일 순발력 모드: 부정출발 감지
    if (this.currentMode === 'reflex_single' && this.reflexState === 'waiting') {
      if (code.startsWith('Key') || code === 'Space') {
        e.preventDefault();
        this.clearTimers();
        window.soundEngine.playKey(false);
        this.elReflexBox.className = 'reflex-signal-box state-early';
        this.elReflexBadge.textContent = '⚠️ 부정출발 (Too Early!)';
        this.elReflexTitle.textContent = '신호가 초록색으로 바뀐 뒤에 누르세요!';
        this.elReflexSub.textContent = '스페이스바 또는 아래 버튼을 눌러 해당 라운드를 다시 시도하세요.';
        this.elReflexActionBtn.textContent = '라운드 다시 시도 (Space)';
        this.elReflexActionBtn.style.display = 'inline-flex';
        this.reflexState = 'idle';
      }
      return;
    }

    // 3) 반응속도 활성 상태 (단일 순발력 또는 30초 연속 리플렉스) 또는 자리 연습 모드
    if (
      ((this.currentMode === 'reflex_single' || this.currentMode === 'reflex_rush') &&
        this.reflexState === 'active') ||
      this.currentMode === 'practice_position'
    ) {
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.renderer.triggerKeyPress(code, true);
        return;
      }

      if (!window.KEY_MAP[code] || window.KEY_MAP[code].isModifier) return;
      e.preventDefault();

      const now = performance.now();
      const reactionMs = Math.round((now - this.signalStartTime) * 10) / 10;
      const isCorrect = code === this.targetKeyCode;

      this.totalStrokesInSession++;
      this.renderer.triggerKeyPress(code, isCorrect);
      window.soundEngine.playKey(isCorrect);

      if (isCorrect) {
        this.correctStrokesInSession++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        const roundedMs = Math.round(reactionMs);
        this.roundReactions.push(roundedMs);
        this.recordKeyAndFingerStat(code, roundedMs, true);

        const acc = Math.round((this.correctStrokesInSession / this.totalStrokesInSession) * 100);
        const kps = (1000 / Math.max(reactionMs, 80)).toFixed(1);
        this.updateTopMetrics(roundedMs, `${kps}`, acc, '타/초 (KPS)');

        if (this.currentMode === 'reflex_single') {
          this.renderRoundPills();
          if (this.roundReactions.length >= this.maxSingleRounds) {
            this.finishSingleReflexSession();
          } else {
            this.elReflexBox.className = 'reflex-signal-box state-idle';
            this.elReflexBadge.textContent = `✅ 정타! ${reactionMs}ms`;
            this.elReflexTitle.textContent = `${reactionMs} ms`;
            this.elReflexSub.textContent = '잠시 후 다음 라운드가 시작됩니다...';
            this.reflexState = 'ready';
            this.waitTimer = setTimeout(() => this.startNextSingleReflexRound(), 950);
          }
        } else if (this.currentMode === 'reflex_rush') {
          this.spawnNextRushTarget();
        } else if (this.currentMode === 'practice_position') {
          this.spawnNextPositionChar();
        }
      } else {
        this.combo = 0;
        this.recordKeyAndFingerStat(this.targetKeyCode, null, false);
        const acc = Math.round((this.correctStrokesInSession / this.totalStrokesInSession) * 100);
        this.elMetricAccuracy.textContent = `${acc}%`;
        this.elMetricCombo.textContent = '0';

        if (this.currentMode === 'reflex_single') {
          const pressedKey = window.KEY_MAP[code];
          const pressedLabel = this.lang === 'ko' ? pressedKey.ko : pressedKey.en;
          this.elReflexSub.textContent = `❌ 오타 (${pressedLabel} 입력됨)! 빛나는 목표 키를 정확히 누르세요.`;
        }
      }
      return;
    }

    // 4) 낱말 / 문장 / 코드 연습 모드에서의 키 입력 시각 피드백 및 반응속도 측정
    if (this.currentMode === 'practice_words' || this.currentMode === 'practice_sentences' || this.currentMode === 'practice_code') {
      if (document.activeElement !== this.typingInput && !window.KEY_MAP[code]?.isModifier) {
        this.typingInput.focus();
      }

      if (window.KEY_MAP[code]) {
        const now = performance.now();
        const deltaMs = Math.round(now - this.lastStrokeTime);
        this.lastStrokeTime = now;

        const isExpectedKey = code === this.targetKeyCode || code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Backspace';
        this.renderer.triggerKeyPress(code, isExpectedKey);
        window.soundEngine.playKey(isExpectedKey);

        if (code === this.targetKeyCode && deltaMs > 30 && deltaMs < 2500) {
          this.combo++;
          this.recordKeyAndFingerStat(code, deltaMs, true);
          this.elMetricReaction.textContent = `${deltaMs} ms`;
          this.elMetricCombo.textContent = `${this.combo}`;
        } else if (!isExpectedKey && !window.KEY_MAP[code].isModifier) {
          this.combo = 0;
          this.elMetricCombo.textContent = '0';
          if (this.targetKeyCode) {
            this.recordKeyAndFingerStat(this.targetKeyCode, null, false);
          }
        }
      }
    }
  }

  finishSingleReflexSession() {
    this.reflexState = 'finished';
    this.renderer.clearTargets();
    window.soundEngine.playComplete();

    const avgMs = Math.round(
      this.roundReactions.reduce((a, b) => a + b, 0) / this.roundReactions.length
    );
    const bestMs = Math.min(...this.roundReactions);

    let grade = '👍 안정적인 반응속도';
    if (avgMs < 230) grade = '⚡ 초인적인 프로게이머급 반사신경!';
    else if (avgMs < 290) grade = '🏆 최상위권 순발력!';
    else if (avgMs < 360) grade = '✨ 매우 우수한 반응속도!';

    this.elReflexBox.className = 'reflex-signal-box state-go';
    this.elReflexBadge.textContent = `🏁 5회 측정 완료 | ${grade}`;
    this.elReflexTitle.textContent = `평균 ${avgMs} ms (최고 ${bestMs} ms)`;
    this.elReflexSub.textContent = '스페이스바 또는 아래 버튼을 눌러 다시 측정할 수 있습니다.';
    this.elReflexActionBtn.textContent = '다시 측정하기 (Space)';
    this.elReflexActionBtn.style.display = 'inline-flex';
  }

  // =========================================================================
  // 4. 통계 기록 및 UI 업데이트
  // =========================================================================

  recordKeyAndFingerStat(keyCode, reactionMs, isHit) {
    const keyData = window.KEY_MAP[keyCode];
    if (!keyData) return;
    const fingerId = keyData.finger;

    if (isHit && reactionMs !== null) {
      this.stats.totalHits++;
      if (!this.stats.bestReactionMs || reactionMs < this.stats.bestReactionMs) {
        this.stats.bestReactionMs = reactionMs;
      }

      if (!this.stats.fingers[fingerId]) {
        this.stats.fingers[fingerId] = { count: 0, totalMs: 0, misses: 0 };
      }
      this.stats.fingers[fingerId].count++;
      this.stats.fingers[fingerId].totalMs += reactionMs;

      if (!this.stats.keys[keyCode]) {
        this.stats.keys[keyCode] = { count: 0, totalMs: 0, misses: 0 };
      }
      this.stats.keys[keyCode].count++;
      this.stats.keys[keyCode].totalMs += reactionMs;
    } else {
      this.stats.totalMisses++;
      if (this.stats.fingers[fingerId]) {
        this.stats.fingers[fingerId].misses++;
      }
    }

    this.saveStats();
    this.updateFingerStatsUI();
  }

  updateTopMetrics(reactionMs, speedVal, accuracyVal, speedUnit = null) {
    if (reactionMs !== null) {
      this.elMetricReaction.textContent = `${reactionMs} ms`;
    } else {
      this.elMetricReaction.textContent = '-- ms';
    }
    this.elMetricBest.textContent = this.stats.bestReactionMs ? `최고 기록: ${this.stats.bestReactionMs} ms` : '최고 기록: -- ms';
    this.elMetricSpeed.textContent = speedVal;
    if (speedUnit) {
      this.elMetricSpeedUnit.textContent = speedUnit;
    } else if (this.lang === 'en' || this.currentMode === 'practice_code') {
      this.elMetricSpeedUnit.textContent = '속도 (WPM / CPM)';
    } else {
      this.elMetricSpeedUnit.textContent = '타/초 (KPS)';
    }
    this.elMetricAccuracy.textContent = `${accuracyVal}%`;
    this.elMetricCombo.textContent = `${this.combo}`;
  }

  updateFingerBadge(fingerId, keyLabel = '', needShift = false) {
    if (!this.elFingerGuideBadge) return;
    if (!fingerId || !window.FINGER_INFO[fingerId]) {
      this.elFingerGuideBadge.innerHTML = `<span class="badge-dot" style="background:#38bdf8"></span>양손 손가락을 홈 자리(ㅁㄴㅇㄹ / ㅓㅏㅣ)에 올려두세요`;
      return;
    }
    const fInfo = window.FINGER_INFO[fingerId];
    const shiftText = needShift ? ' + 반대손 Shift' : '';
    this.elFingerGuideBadge.innerHTML = `
      <span class="badge-dot" style="background:${fInfo.color}"></span>
      담당 손가락: <strong>${fInfo.name}</strong>${shiftText} → <span class="badge-key-highlight">${keyLabel}</span>
    `;
  }

  updateFingerStatsUI() {
    const container = document.getElementById('finger-stats-grid');
    if (!container) return;
    container.innerHTML = '';

    const fingerOrder = [
      'L_PINKY', 'L_RING', 'L_MIDDLE', 'L_INDEX', 'L_THUMB',
      'R_THUMB', 'R_INDEX', 'R_MIDDLE', 'R_RING', 'R_PINKY'
    ];

    fingerOrder.forEach(fId => {
      const info = window.FINGER_INFO[fId];
      const st = this.stats.fingers[fId] || { count: 0, totalMs: 0, misses: 0 };
      const avgMs = st.count > 0 ? Math.round(st.totalMs / st.count) : null;
      const totalAttempts = st.count + st.misses;
      const acc = totalAttempts > 0 ? Math.round((st.count / totalAttempts) * 100) : 100;

      const fillPercent = avgMs
        ? Math.max(15, Math.min(100, Math.round(((620 - avgMs) / 420) * 100)))
        : 8;

      const card = document.createElement('div');
      card.className = 'finger-stat-card';
      card.innerHTML = `
        <div class="finger-stat-header">
          <span class="finger-color-dot" style="background:${info.color}"></span>
          <span class="finger-short-name">${info.short}</span>
        </div>
        <div class="finger-bar-wrap">
          <div class="finger-bar-fill" style="height:${fillPercent}%; background:${info.color}"></div>
        </div>
        <div class="finger-ms-val">${avgMs !== null ? `${avgMs}ms` : '--'}</div>
        <div class="finger-acc-val">정확도 ${acc}% (${st.count}회)</div>
      `;
      container.appendChild(card);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new TypingReflexApp();
});
