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

    // CodeLab 3대 언어(JavaScript, Python, C) 실행 & 마스터리 상태
    this.codeRunner = new window.CodeRunner();
    this._nonCodeLang = 'ko';
    this.codeLab = {
      lang: 'javascript', // 'javascript' | 'python' | 'c' | 'spec'
      track: this.loadCodeLabTrack(), // 'all' | 'algorithm' | 'architecture' | 'refactoring' | 'ai' | 'system_design' | 'spec'
      difficulty: this.loadCodeLabDifficulty(), // 'all' | 'beginner' | 'intermediate' | 'advanced'
      typeMode: 'flow',   // 'flow' | 'skeleton' | 'sandbox' | 'audit'
      lessonIndex: 0,
      currentLesson: null,
      fullText: '',
      sandboxText: '',
      cursorIdx: 0,
      startTime: null,
      totalStrokes: 0,
      correctStrokes: 0,
      isRunning: false,
      lastWrongIdx: null,
      _wrongTimer: null,
      skeletonModel: null,
      activeBlankIdx: 0,
      showSkeletonHint: false,
      keyboardHidden: false,
      activeDescTab: 'overview',
      _lastSyncedLine: null,
      solvedLessons: this.loadCodeLabProgress()
    };

    // 통합 설정 (Proposal B+D LocalStorage 영속 상태)
    this.userSettings = this.loadUserSettings();
    this.lang = this.userSettings.lang;
    this._nonCodeLang = this.userSettings.lang;
    this.codeLab.keyboardHidden = Boolean(this.userSettings.codelabWideDefault);

    // 누적 통계 (LocalStorage 연동)
    this.stats = this.loadStats();

    this.bindElements();
    this.bindEvents();
    this.initCodeLabSplitResizer();
    this.initTelemetryResizer();
    this.applyUserSettings();
    this.syncSettingsUI();
    this.updatePyodideStatusBadge(this.codeRunner.pyodideStatus);
    this.codeRunner.onPyodideStatusChange((status, msg) => {
      this.updatePyodideStatusBadge(status, msg);
    });
    this.switchMode('reflex_single');
    this.renderMenuCodeLabCourseGrid();
    this.updateFingerStatsUI();
    this.updateWeakSymbolsUI();
  }

  renderAnalytics() {
    this.updateFingerStatsUI();
    this.updateWeakSymbolsUI();
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
      keys: {},
      symbols: {}
    };
    Object.keys(window.FINGER_INFO).forEach(fId => {
      defaultStats.fingers[fId] = { count: 0, totalMs: 0, misses: 0 };
    });

    try {
      const saved = localStorage.getItem('typing_reflex_stats_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStats,
          ...parsed,
          fingers: { ...defaultStats.fingers, ...(parsed.fingers || {}) },
          keys: { ...(parsed.keys || {}) },
          symbols: { ...(parsed.symbols || {}) }
        };
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
    this.updateWeakSymbolsUI();
    if (this.renderer.heatmapMode) {
      this.renderer.renderHeatmap(this.stats.keys);
      this.renderer.renderHeatmap(this.stats.keys);
    }
    this.syncSettingsUI();
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

    // 상단 접이식·크기 조절형 통합 통계 패널 요소
    this.elTelemetryDockWrap = document.getElementById('telemetry-dock-wrap');
    this.elTelemetryToggleBtn = document.getElementById('telemetry-toggle-btn');
    this.elTelemetrySheet = document.getElementById('telemetry-sheet');
    this.elTelemetryCollapseBtn = document.getElementById('telemetry-collapse-btn');
    this.elTelemetryWeakTag = document.getElementById('telemetry-weak-tag');
    this.elTelemetrySizeBadge = document.getElementById('telemetry-size-badge');
    this.elTelemetryResetSizeBtn = document.getElementById('telemetry-reset-size-btn');
    this.elTelemetryHeatmapBtn = document.getElementById('telemetry-heatmap-btn');
    this.elTelemetryResetStatsBtn = document.getElementById('telemetry-reset-stats-btn');
    this.elTelemetryResizeY = document.getElementById('telemetry-resize-y');
    this.elTelemetryResizeX = document.getElementById('telemetry-resize-x');
    this.elTelemetryResizeCorner = document.getElementById('telemetry-resize-corner');

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

    // 상단 Zen 헤더 · 통합 메뉴(B+C) · 빠른 설정 팝오버 엘리먼트
    this.elStudioMenuBtn = document.getElementById('studio-menu-btn');
    this.elStudioBreadcrumbBtn = document.getElementById('studio-breadcrumb-btn');
    this.elCodeFingerBadge = document.getElementById('codelab-finger-badge');

    this.elSettingsMenuWrap = document.getElementById('studio-settings-menu-wrap');
    this.elSettingsBtn = document.getElementById('studio-settings-btn');
    this.elSettingsSummary = document.getElementById('studio-settings-summary');
    this.elSettingsPopover = document.getElementById('settings-popover');

    this.elPopTileZones = document.getElementById('pop-tile-zones');
    this.elPopTileZonesSub = document.getElementById('pop-tile-zones-sub');
    this.elPopTileWide = document.getElementById('pop-tile-wide');
    this.elPopTileWideTitle = document.getElementById('pop-tile-wide-title');
    this.elPopTileWideSub = document.getElementById('pop-tile-wide-sub');
    this.elPopTileHeatmap = document.getElementById('pop-tile-heatmap');
    this.elPopTileHeatmapSub = document.getElementById('pop-tile-heatmap-sub');
    this.elPopTileLang = document.getElementById('pop-tile-lang');
    this.elPopTileLangSub = document.getElementById('pop-tile-lang-sub');
    this.elPopOpacitySlider = document.getElementById('pop-hand-opacity-slider');
    this.elPopOpacityVal = document.getElementById('pop-hand-opacity-val');
    this.elPopSoundBtns = document.querySelectorAll('.pop-sound-btn');
    this.elPopSubfilterSection = document.getElementById('pop-subfilter-section');
    this.elSubFilterLabel = document.getElementById('pop-subfilter-label');
    this.elSubFilterButtons = document.getElementById('pop-subfilter-buttons');
    this.elPopOpenHubBtn = document.getElementById('pop-open-hub-btn');
    this.elPopExplainBtn = document.getElementById('pop-explain-btn');
    this.elPopResetStatsBtn = document.getElementById('pop-reset-stats-btn');

    // 통합 메뉴창 (안 B + 안 C)
    this.elStudioMenuOverlay = document.getElementById('studio-menu-overlay');
    this.elStudioMenuBody = document.getElementById('studio-menu-body');
    this.elMenuCloseBtn = document.getElementById('menu-close-btn');
    this.elMenuConfirmBtn = document.getElementById('menu-confirm-btn');
    this.elHubRestoreDefaultsBtn = document.getElementById('hub-restore-defaults-btn');
    this.elMenuSearchInput = document.getElementById('menu-search-input');
    this.elMenuSearchClearBtn = document.getElementById('menu-search-clear-btn');
    this.elMenuSearchResults = document.getElementById('menu-search-results');
    this.elMenuRailBtns = document.querySelectorAll('.menu-rail-btn');
    this.elMenuPanes = document.querySelectorAll('.menu-pane');
    this.elMenuReflexSubfiltersWrap = document.getElementById('menu-reflex-subfilters-wrap');
    this.elMenuReflexSubfilters = document.getElementById('menu-reflex-subfilters');
    this.elMenuTypingSubfiltersWrap = document.getElementById('menu-typing-subfilters-wrap');
    this.elMenuTypingSubfilterLabel = document.getElementById('menu-typing-subfilter-label');
    this.elMenuTypingSubfilters = document.getElementById('menu-typing-subfilters');
    this.elMenuCodeLabCourseGrid = document.getElementById('menu-codelab-course-grid');
    this.elMenuCodeLabProgress = document.getElementById('menu-codelab-progress');

    // 통합 메뉴 우측 실시간 퀵 설정 독 (안 C)
    this.elMenuQuickDock = document.getElementById('menu-quick-dock');
    this.elDockTileZones = document.getElementById('dock-tile-zones');
    this.elDockTileZonesSub = document.getElementById('dock-tile-zones-sub');
    this.elDockTileWide = document.getElementById('dock-tile-wide');
    this.elDockTileWideTitle = document.getElementById('dock-tile-wide-title');
    this.elDockTileWideSub = document.getElementById('dock-tile-wide-sub');
    this.elDockTileHeatmap = document.getElementById('dock-tile-heatmap');
    this.elDockTileHeatmapSub = document.getElementById('dock-tile-heatmap-sub');
    this.elDockTileLang = document.getElementById('dock-tile-lang');
    this.elDockTileLangSub = document.getElementById('dock-tile-lang-sub');
    this.elDockOpacitySlider = document.getElementById('dock-hand-opacity-slider');
    this.elDockOpacityVal = document.getElementById('dock-hand-opacity-val');
    this.elDockSoundBtns = document.querySelectorAll('.dock-sound-btn');
    this.elDockExplainBtn = document.getElementById('dock-explain-btn');
    this.elDockOpenFullSettingsBtn = document.getElementById('dock-open-full-settings-btn');
    this.elDockResetStatsBtn = document.getElementById('dock-reset-stats-btn');

    // 상세 설정 컨트롤 (#hub-*)
    this.elHubLangKo = document.getElementById('hub-lang-ko');
    this.elHubLangEn = document.getElementById('hub-lang-en');
    this.elHubSubfilterRow = document.getElementById('hub-subfilter-row');
    this.elHubSubfilterTitle = document.getElementById('hub-subfilter-title');
    this.elHubSubfilterSelect = document.getElementById('hub-subfilter-select');
    this.elHubOpacitySlider = document.getElementById('hub-hand-opacity-slider');
    this.elHubOpacityVal = document.getElementById('hub-hand-opacity-val');
    this.elHubToggleZones = document.getElementById('hub-toggle-zones');
    this.elHubToggleHeatmap = document.getElementById('hub-toggle-heatmap');
    this.elHubSoundCards = document.querySelectorAll('.hub-sound-card');
    this.elHubWideOff = document.getElementById('hub-codelab-wide-off');
    this.elHubWideOn = document.getElementById('hub-codelab-wide-on');
    this.elHubOpenExplainBtn = document.getElementById('hub-open-explain-btn');
    this.elHubProgressText = document.getElementById('hub-codelab-progress-text');
    this.elHubResetCodelabBtn = document.getElementById('hub-reset-codelab-btn');
    this.elHubResetStatsBtn = document.getElementById('hub-reset-stats-btn');
    this.elHubResetHwBtn = document.getElementById('hub-reset-hw-btn');

    // CodeLab 스테이지 요소
    this.elCodeLabStage = document.getElementById('codelab-stage');
    this.elCodeLangBtns = document.querySelectorAll('.codelab-lang-btn');
    this.elCodeTrackSelect = document.getElementById('codelab-track-select');
    this.elCodeDiffBtns = document.querySelectorAll('.codelab-diff-btn');
    this.elCodeProblemSelect = document.getElementById('codelab-problem-select');
    this.elCodeProgressPill = document.getElementById('codelab-progress-pill');
    this.elCodePyodideStatus = document.getElementById('codelab-pyodide-status');
    this.elCodeTypeModeBtns = document.querySelectorAll('.codelab-type-mode-btn');
    this.elCodeRunBtn = document.getElementById('codelab-run-btn');
    this.elCodeResetBtn = document.getElementById('codelab-reset-btn');
    this.elCodeNextBtn = document.getElementById('codelab-next-btn');
    this.elCodeEditorPanel = document.getElementById('codelab-editor-panel');
    this.elCodeEditorBody = document.getElementById('codelab-editor-body');
    this.elCodeFilename = document.getElementById('codelab-filename');
    this.elCodeEditorModeHint = document.getElementById('codelab-editor-mode-hint');
    this.elCodeHintBtn = document.getElementById('codelab-hint-btn');
    this.elCodeSandboxResetBtn = document.getElementById('codelab-sandbox-reset-btn');
    this.elCodeImeBanner = document.getElementById('codelab-ime-banner');
    this.elCodeAuditBanner = document.getElementById('codelab-audit-banner');
    this.elCodeAuditSummary = document.getElementById('codelab-audit-summary');
    this.elCodeAuditHintBtn = document.getElementById('codelab-audit-hint-btn');
    this.elCodeAuditChecklist = document.getElementById('codelab-audit-checklist');
    this.elCodeAdrCard = document.getElementById('codelab-adr-card');
    this.elCodeRefactorCard = document.getElementById('codelab-refactor-card');
    this.elCodeDiagramPreview = document.getElementById('codelab-diagram-preview');
    this.elCodeDiagramCanvas = document.getElementById('codelab-diagram-canvas');
    this.elCodeLineNumbers = document.getElementById('codelab-line-numbers');
    this.elCodeContent = document.getElementById('codelab-code-content');
    this.elCodeSandboxWrap = document.getElementById('codelab-sandbox-wrap');
    this.elCodeSandboxHighlight = document.getElementById('codelab-sandbox-highlight');
    this.elCodeSandboxTextarea = document.getElementById('codelab-sandbox-textarea');
    this.elCodeHiddenInput = document.getElementById('codelab-hidden-input');
    this.elCodeSplitView = document.querySelector('.codelab-split-view');
    this.elCodeSplitResizer = document.getElementById('codelab-split-resizer');
    this.elCodeSidePanel = document.getElementById('codelab-side-panel');
    this.elCodeWideToggleBtn = document.getElementById('codelab-wide-toggle-btn');
    this.elCodeKbdDockBar = document.getElementById('codelab-kbd-dock-bar');
    this.elCodeKbdDockBtn = document.getElementById('codelab-kbd-dock-btn');
    this.elCodeUnifiedBody = document.getElementById('codelab-unified-body');
    this.elCodeTierBadge = document.getElementById('codelab-tier-badge');
    this.elCodeProblemTitle = document.getElementById('codelab-problem-title');
    this.elCodeComplexityBadge = document.getElementById('codelab-complexity-badge');
    this.elCodeProblemDesc = document.getElementById('codelab-problem-desc');
    this.elCodeTestsSummary = document.getElementById('codelab-tests-summary');
    this.elCodeTestsList = document.getElementById('codelab-tests-list');
    this.elCodeExecTime = document.getElementById('codelab-exec-time');
    this.elCodeConsoleOutput = document.getElementById('codelab-console-output');
    this.elCodeKpm = document.getElementById('codelab-kpm');
    this.elCodeAcc = document.getElementById('codelab-acc');
    this.elCodeTime = document.getElementById('codelab-time');
    this.elCodeWeakSymList = document.getElementById('codelab-weak-sym-list');

    // CodeLab 상세 해설 & 모달 & 실시간 힌트 바 엘리먼트
    this.elCodeTabBtns = document.querySelectorAll('.desc-tab-btn');
    this.elCodeTabOverview = document.getElementById('codelab-tab-overview');
    this.elCodeTabExplanation = document.getElementById('codelab-tab-explanation');
    this.elCodeTabTests = document.getElementById('codelab-tab-tests');
    this.elCodeExplainCount = document.getElementById('codelab-explain-count');
    this.elCodeTabTestsPill = document.getElementById('codelab-tab-tests-pill');
    this.elCodePanelStatusTest = document.getElementById('codelab-panel-status-test');
    this.elCodeExplanationContainer = document.getElementById('codelab-explanation-container');
    this.elCodeQuickTags = document.getElementById('codelab-quick-tags');
    this.elCodeLineHint = document.getElementById('codelab-current-line-hint');
    this.elCodeOpenModalBtn = document.getElementById('codelab-open-modal-btn');
    this.elCodeModalOverlay = document.getElementById('codelab-modal-overlay');
    this.elModalCloseBtn = document.getElementById('modal-close-btn');
    this.elModalConfirmBtn = document.getElementById('modal-confirm-btn');
    this.elModalProblemTitle = document.getElementById('modal-problem-title');
    this.elModalTierBadge = document.getElementById('modal-tier-badge');
    this.elModalLangBadge = document.getElementById('modal-lang-badge');
    this.elModalCodeMeta = document.getElementById('modal-code-meta');
    this.elModalCodeBlock = document.getElementById('modal-code-block');
    this.elModalDetailsContainer = document.getElementById('modal-details-container');

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

    // ------------------------------------------
    // 통합 메뉴창 (안 B+C) & 빠른 설정 팝오버 바인딩
    // ------------------------------------------
    if (this.elStudioMenuBtn) {
      this.elStudioMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isStudioMenuOpen()) this.closeStudioMenu();
        else this.openStudioMenu(null, { focusSearch: true });
      });
    }

    if (this.elSettingsBtn) {
      this.elSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSettingsPopover();
      });
    }

    if (this.elSettingsPopover) {
      this.elSettingsPopover.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('click', (e) => {
      if (!this.isSettingsPopoverOpen()) return;
      if (this.elSettingsMenuWrap && this.elSettingsMenuWrap.contains(e.target)) return;
      this.closeSettingsPopover();
    });

    // 전역 단축키: Ctrl+K/M (통합 메뉴), Ctrl+, (설정 탭), Ctrl+I (상단 통계 패널), Esc (메뉴 -> 팝오버 순 닫기)
    window.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.shiftKey && !e.altKey && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'm')) {
        e.preventDefault();
        if (this.isStudioMenuOpen()) {
          this.closeStudioMenu();
        } else {
          this.openStudioMenu(null, { focusSearch: true });
        }
        return;
      }
      if (mod && (e.key === ',' || e.code === 'Comma')) {
        e.preventDefault();
        if (this.isStudioMenuOpen() && this.elStudioMenuBody && this.elStudioMenuBody.classList.contains('is-settings-view')) {
          this.closeStudioMenu();
        } else {
          this.openStudioMenu('settings_keyboard');
        }
        return;
      }
      if (mod && !e.shiftKey && !e.altKey && (e.key.toLowerCase() === 'i' || e.code === 'KeyI')) {
        e.preventDefault();
        this.toggleTelemetryPanel();
        return;
      }
      if (e.key === 'Escape') {
        if (this.isStudioMenuOpen()) {
          e.preventDefault();
          if (this.elMenuSearchInput && this.elMenuSearchInput.value.trim() && document.activeElement === this.elMenuSearchInput) {
            this.elMenuSearchInput.value = '';
            this.renderMenuSearchResults('');
          } else {
            this.closeStudioMenu();
          }
        } else if (this.isSettingsPopoverOpen()) {
          e.preventDefault();
          this.closeSettingsPopover();
        }
      }
    });

    // 빠른 설정 팝오버 + 메뉴 우측 퀵 독 공통 토글 핸들러
    const bindZonesToggle = (el) => {
      if (!el) return;
      el.addEventListener('click', () => this.setZoneColorsSetting(!this.userSettings.showZoneColors));
    };
    const bindWideToggle = (el) => {
      if (!el) return;
      el.addEventListener('click', () => {
        if (this.currentMode === 'practice_code') {
          this.setCodeLabWideMode(!this.codeLab.keyboardHidden, { skipFocus: this.isStudioMenuOpen() });
        } else {
          this.setGeneralKbdHidden(!this.userSettings.generalKbdHidden);
        }
      });
    };
    const bindHeatmapToggle = (el) => {
      if (!el) return;
      el.addEventListener('click', () => this.setHeatmapEnabled(!this.userSettings.heatmapEnabled));
    };
    const bindLangToggle = (el) => {
      if (!el) return;
      el.addEventListener('click', () => {
        if (this.currentMode === 'practice_code') {
          const next = (this.userSettings.lang === 'ko') ? 'en' : 'ko';
          this.userSettings.lang = next;
          this._nonCodeLang = next;
          this.saveUserSettings();
          this.syncSettingsUI();
          return;
        }
        const nextLang = this.lang === 'ko' ? 'en' : 'ko';
        this.setLanguage(nextLang);
      });
    };

    bindZonesToggle(this.elPopTileZones);
    bindZonesToggle(this.elDockTileZones);
    bindWideToggle(this.elPopTileWide);
    bindWideToggle(this.elDockTileWide);
    bindHeatmapToggle(this.elPopTileHeatmap);
    bindHeatmapToggle(this.elDockTileHeatmap);
    bindLangToggle(this.elPopTileLang);
    bindLangToggle(this.elDockTileLang);

    // 손 투명도 슬라이더 (팝오버 & 메뉴 퀵 독)
    [this.elPopOpacitySlider, this.elDockOpacitySlider].forEach(sl => {
      if (!sl) return;
      sl.addEventListener('input', (e) => {
        this.setHandOpacitySetting(parseFloat(e.target.value));
      });
    });

    // 타건음 프로파일 5종 칩 (팝오버 & 메뉴 퀵 독)
    [this.elPopSoundBtns, this.elDockSoundBtns].forEach(group => {
      if (!group) return;
      group.forEach(btn => {
        btn.addEventListener('click', () => {
          this.setSoundProfileSetting(btn.getAttribute('data-sound'), { preview: true });
        });
      });
    });

    // 서브 옵션 칩 위임 (팝오버 + 메뉴 내부 순발력/타자 패널)
    [this.elSubFilterButtons, this.elMenuReflexSubfilters, this.elMenuTypingSubfilters].forEach(container => {
      if (!container) return;
      container.addEventListener('click', (e) => {
        const btn = e.target.closest('.sub-filter-btn');
        if (!btn) return;
        this.setSubOption(btn.getAttribute('data-filter'));
      });
    });

    // 팝오버 푸터 CTA
    if (this.elPopOpenHubBtn) {
      this.elPopOpenHubBtn.addEventListener('click', () => {
        this.openStudioMenu('settings_keyboard');
      });
    }

    if (this.elPopExplainBtn) {
      this.elPopExplainBtn.addEventListener('click', () => {
        this.closeSettingsPopover();
        this.openCodeLabModal();
      });
    }

    if (this.elPopResetStatsBtn) {
      this.elPopResetStatsBtn.addEventListener('click', () => {
        this.resetStats();
      });
    }

    // 퀵 독 푸터 액션 (안 C)
    if (this.elDockExplainBtn) {
      this.elDockExplainBtn.addEventListener('click', () => {
        this.closeStudioMenu();
        if (this.currentMode !== 'practice_code') this.switchMode('practice_code');
        this.openCodeLabModal();
      });
    }
    if (this.elDockOpenFullSettingsBtn) {
      this.elDockOpenFullSettingsBtn.addEventListener('click', () => {
        this.switchStudioMenuTab('settings_keyboard');
      });
    }
    if (this.elDockResetStatsBtn) {
      this.elDockResetStatsBtn.addEventListener('click', () => {
        this.resetStats();
      });
    }

    // 통합 메뉴 모달 이벤트 (안 B+C)
    if (this.elMenuCloseBtn) {
      this.elMenuCloseBtn.addEventListener('click', () => this.closeStudioMenu());
    }
    if (this.elMenuConfirmBtn) {
      this.elMenuConfirmBtn.addEventListener('click', () => this.closeStudioMenu());
    }
    if (this.elStudioMenuOverlay) {
      this.elStudioMenuOverlay.addEventListener('click', (e) => {
        if (e.target === this.elStudioMenuOverlay) this.closeStudioMenu();
      });
    }

    if (this.elMenuRailBtns) {
      this.elMenuRailBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchStudioMenuTab(btn.getAttribute('data-menutab'));
        });
      });
    }

    if (this.elMenuSearchInput) {
      this.elMenuSearchInput.addEventListener('input', (e) => {
        this.renderMenuSearchResults(e.target.value);
      });
      this.elMenuSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && this.elMenuSearchResults && this.elMenuSearchResults.style.display !== 'none') {
          e.preventDefault();
          const topHit = this.elMenuSearchResults.querySelector('.menu-search-hit');
          if (topHit) topHit.click();
        }
      });
    }

    if (this.elMenuSearchClearBtn) {
      this.elMenuSearchClearBtn.addEventListener('click', () => {
        if (this.elMenuSearchInput) {
          this.elMenuSearchInput.value = '';
          this.renderMenuSearchResults('');
          this.elMenuSearchInput.focus();
        }
      });
    }

    [this.elHubLangKo, this.elHubLangEn].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const targetLang = btn.getAttribute('data-lang');
        if (this.currentMode === 'practice_code') {
          this.userSettings.lang = targetLang;
          this._nonCodeLang = targetLang;
          this.saveUserSettings();
          this.syncSettingsUI();
        } else {
          this.setLanguage(targetLang);
        }
      });
    });

    if (this.elHubSubfilterSelect) {
      this.elHubSubfilterSelect.addEventListener('change', (e) => {
        this.setSubOption(e.target.value);
      });
    }

    if (this.elHubOpacitySlider) {
      this.elHubOpacitySlider.addEventListener('input', (e) => {
        this.setHandOpacitySetting(parseFloat(e.target.value));
      });
    }

    if (this.elHubToggleZones) {
      this.elHubToggleZones.addEventListener('change', (e) => {
        this.setZoneColorsSetting(e.target.checked);
      });
    }

    if (this.elHubToggleHeatmap) {
      this.elHubToggleHeatmap.addEventListener('change', (e) => {
        this.setHeatmapEnabled(e.target.checked);
      });
    }

    if (this.elHubSoundCards) {
      this.elHubSoundCards.forEach(card => {
        card.addEventListener('click', () => {
          this.setSoundProfileSetting(card.getAttribute('data-sound'), { preview: true });
        });
      });
    }

    if (this.elHubWideOff) {
      this.elHubWideOff.addEventListener('click', () => {
        this.setCodeLabWideMode(false, { skipFocus: true });
      });
    }
    if (this.elHubWideOn) {
      this.elHubWideOn.addEventListener('click', () => {
        this.setCodeLabWideMode(true, { skipFocus: true });
      });
    }

    if (this.elHubOpenExplainBtn) {
      this.elHubOpenExplainBtn.addEventListener('click', () => {
        this.closeSettingsHub();
        if (this.currentMode !== 'practice_code') {
          this.switchMode('practice_code');
        }
        this.openCodeLabModal();
      });
    }

    if (this.elHubResetCodelabBtn) {
      this.elHubResetCodelabBtn.addEventListener('click', () => {
        this.resetCodeLabProgress();
      });
    }

    if (this.elHubResetStatsBtn) {
      this.elHubResetStatsBtn.addEventListener('click', () => {
        this.resetStats();
      });
    }

    if (this.elHubResetHwBtn) {
      this.elHubResetHwBtn.addEventListener('click', () => {
        this.initHwMetrics();
        this.updateHwDashboardUI();
        if (this.elHwLogStream) {
          this.elHwLogStream.innerHTML = `<span class="hw-log-placeholder">하드웨어 측정 기록이 초기화되었습니다. 아무 키나 눌러 측정을 시작하세요...</span>`;
        }
      });
    }

    if (this.elHubRestoreDefaultsBtn) {
      this.elHubRestoreDefaultsBtn.addEventListener('click', () => {
        this.restoreDefaultSettings();
      });
    }

    // ==========================================
    // KeyReflex CodeLab 이벤트 바인딩
    // ==========================================
    if (this.elCodeLangBtns) {
      this.elCodeLangBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-codelang');
          this.setCodeLabLanguage(lang);
        });
      });
    }

    if (this.elCodeTrackSelect) {
      this.elCodeTrackSelect.addEventListener('change', (e) => {
        this.setCodeLabTrack(e.target.value);
      });
    }

    if (this.elCodeDiffBtns) {
      this.elCodeDiffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const diff = btn.getAttribute('data-diff');
          this.setCodeLabDifficulty(diff);
        });
      });
    }

    if (this.elCodeProblemSelect) {
      this.elCodeProblemSelect.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value, 10);
        this.loadCodeLabLesson(this.codeLab.lang, idx);
      });
    }

    if (this.elCodeTypeModeBtns) {
      this.elCodeTypeModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-typemode');
          this.setCodeLabTypeMode(mode);
        });
      });
    }

    if (this.elCodeRunBtn) {
      this.elCodeRunBtn.addEventListener('click', () => {
        this.executeCodeLabTests({ fromUserAction: true });
      });
    }

    if (this.elCodeResetBtn) {
      this.elCodeResetBtn.addEventListener('click', () => {
        this.loadCodeLabLesson(this.codeLab.lang, this.codeLab.lessonIndex);
      });
    }

    if (this.elCodeNextBtn) {
      this.elCodeNextBtn.addEventListener('click', () => {
        this.advanceCodeLabNextLesson();
      });
    }

    if (this.elCodeEditorPanel && this.elCodeHiddenInput) {
      this.elCodeEditorPanel.addEventListener('click', (e) => {
        if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
          if (!e.target.closest('button') && !e.target.closest('.editor-audit-banner')) {
            this.elCodeSandboxTextarea.focus();
          }
          return;
        }
        // 빈칸(blank-slot-pill) 클릭 시 해당 빈칸으로 포커스 이동
        const blankBtn = e.target.closest('.blank-slot-pill');
        if (blankBtn && this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
          const bIdx = parseInt(blankBtn.getAttribute('data-blank-idx'), 10);
          if (!Number.isNaN(bIdx) && this.codeLab.skeletonModel.blanks[bIdx]) {
            this.codeLab.activeBlankIdx = bIdx;
            this.renderCodeLabEditor();
            this.updateCodeLabTargetGuidance();
            this.updateCodeLabLineHint();
          }
        }
        this.elCodeHiddenInput.focus();
      });
    }

    if (this.elCodePyodideStatus) {
      this.elCodePyodideStatus.addEventListener('click', () => {
        if (this.codeLab.lang !== 'python') return;
        if (this.codeRunner.pyodideStatus === 'idle' || this.codeRunner.pyodideStatus === 'error') {
          this.codeRunner.initPyodide().catch(() => { /* badge shows error state */ });
        }
      });
    }

    if (this.elCodeAuditHintBtn && this.elCodeAuditChecklist) {
      this.elCodeAuditHintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const show = this.elCodeAuditChecklist.style.display === 'none';
        this.elCodeAuditChecklist.style.display = show ? 'flex' : 'none';
        this.elCodeAuditHintBtn.classList.toggle('active', show);
      });
    }

    if (this.elCodeSandboxResetBtn) {
      this.elCodeSandboxResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.codeLab.currentLesson && this.elCodeSandboxTextarea) {
          const auditData = this.codeLab.typeMode === 'audit'
            ? this.getLessonAuditData(this.codeLab.currentLesson)
            : null;
          this.codeLab.sandboxText = auditData
            ? auditData.buggyCode.replace(/\r\n/g, '\n')
            : this.codeLab.fullText;
          this.elCodeSandboxTextarea.value = this.codeLab.sandboxText;
          this.syncSandboxGutter();
          this.updateCodeLabLineHint();
          if (this.codeLab.typeMode === 'audit') {
            this.executeCodeLabTests();
          }
          this.elCodeSandboxTextarea.focus();
        }
      });
    }

    if (this.elCodeExplanationContainer) {
      this._hoveredExplainLine = null;
      this.elCodeExplanationContainer.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.line-explain-item');
        const ln = item ? parseInt(item.getAttribute('data-line'), 10) : null;
        if (ln !== this._hoveredExplainLine) {
          this._hoveredExplainLine = ln;
          this.setCodeLabPeekLine(ln);
        }
      });
      this.elCodeExplanationContainer.addEventListener('mouseleave', () => {
        this._hoveredExplainLine = null;
        this.setCodeLabPeekLine(null);
      });
      this.elCodeExplanationContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.line-explain-item');
        if (!item) return;
        const ln = parseInt(item.getAttribute('data-line'), 10);
        if (!Number.isNaN(ln)) {
          this.jumpToCodeLabEditorLine(ln);
        }
      });
    }

    if (this.elCodeSandboxTextarea) {
      this.elCodeSandboxTextarea.addEventListener('keydown', (e) => {
        if (this.currentMode !== 'practice_code' || !this.isEditableCodeMode() || this.isAnyModalBlockingTyping()) return;
        if (e.key === 'Tab') {
          e.preventDefault();
          const ta = this.elCodeSandboxTextarea;
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          if (!e.shiftKey) {
            ta.value = ta.value.slice(0, start) + '    ' + ta.value.slice(end);
            ta.selectionStart = ta.selectionEnd = start + 4;
          } else {
            const lineStart = ta.value.lastIndexOf('\n', start - 1) + 1;
            const before = ta.value.slice(lineStart, lineStart + 4);
            const spaces = before.match(/^ {1,4}/);
            if (spaces) {
              const trimLen = spaces[0].length;
              ta.value = ta.value.slice(0, lineStart) + ta.value.slice(lineStart + trimLen);
              ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - trimLen);
            }
          }
          this.codeLab.sandboxText = ta.value;
          this.syncSandboxGutter();
          if (window.soundEngine) window.soundEngine.playKey(true);
        }
      });

      this.elCodeSandboxTextarea.addEventListener('input', () => {
        this.codeLab.sandboxText = this.elCodeSandboxTextarea.value;
        this.syncSandboxGutter();
        this.updateCodeLabLineHint();
      });

      ['keyup', 'click'].forEach(evName => {
        this.elCodeSandboxTextarea.addEventListener(evName, () => {
          this.updateCodeLabLineHint();
        });
      });

      this.elCodeSandboxTextarea.addEventListener('scroll', () => {
        if (this.elCodeLineNumbers) {
          this.elCodeLineNumbers.scrollTop = this.elCodeSandboxTextarea.scrollTop;
        }
        if (this.elCodeSandboxHighlight) {
          this.elCodeSandboxHighlight.scrollTop = this.elCodeSandboxTextarea.scrollTop;
          this.elCodeSandboxHighlight.scrollLeft = this.elCodeSandboxTextarea.scrollLeft;
        }
      });
    }

    if (this.elCodeHintBtn) {
      this.elCodeHintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCodeLabSkeletonHint();
      });
    }

    if (this.elCodeWideToggleBtn) {
      this.elCodeWideToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setCodeLabWideMode(!this.codeLab.keyboardHidden);
      });
    }

    if (this.elCodeKbdDockBtn) {
      this.elCodeKbdDockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setCodeLabWideMode(false);
      });
    }

    if (this.elCodePanelStatusTest) {
      this.elCodePanelStatusTest.addEventListener('click', () => {
        this.switchCodeLabDescTab('tests');
      });
    }

    // 설명 탭 전환 (개요 vs 라인별 해설 vs 테스트·콘솔)
    if (this.elCodeTabBtns) {
      this.elCodeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-desctab');
          this.switchCodeLabDescTab(tab);
        });
      });
    }

    // 전체 상세 해설 모달 열기 버튼
    if (this.elCodeOpenModalBtn) {
      this.elCodeOpenModalBtn.addEventListener('click', () => this.openCodeLabModal());
    }

    // 모달 닫기 버튼
    if (this.elModalCloseBtn) {
      this.elModalCloseBtn.addEventListener('click', () => this.closeCodeLabModal());
    }
    if (this.elModalConfirmBtn) {
      this.elModalConfirmBtn.addEventListener('click', () => this.closeCodeLabModal());
    }
    if (this.elCodeModalOverlay) {
      this.elCodeModalOverlay.addEventListener('click', (e) => {
        if (e.target === this.elCodeModalOverlay) this.closeCodeLabModal();
      });
    }

    // CodeLab 전역 단축키 (F1: 해설 모달, F2: 빈칸 힌트, ESC: 닫기, Ctrl+Enter: 실행)
    window.addEventListener('keydown', (e) => {
      if (this.currentMode !== 'practice_code' || this.isSettingsHubOpen()) return;

      if (e.key === 'F1') {
        e.preventDefault();
        if (this.isCodeLabModalOpen()) this.closeCodeLabModal();
        else this.openCodeLabModal();
      } else if (e.key === 'F2' && this.codeLab.typeMode === 'skeleton' && !this.isAnyModalBlockingTyping()) {
        e.preventDefault();
        this.toggleCodeLabSkeletonHint();
      } else if (e.key === 'Escape') {
        if (this.isCodeLabModalOpen()) {
          this.closeCodeLabModal();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !this.isAnyModalBlockingTyping()) {
        e.preventDefault();
        this.executeCodeLabTests({ fromUserAction: true });
      }
    });

    if (this.elCodeHiddenInput) {
      this.elCodeHiddenInput.addEventListener('keydown', (e) => {
        if (this.currentMode !== 'practice_code' || this.isAnyModalBlockingTyping()) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === 'Tab') {
          e.preventDefault();
          this.handleCodeLabInputKey('Tab');
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleCodeLabInputKey('\n');
          return;
        }

        if (e.key === 'Backspace') {
          e.preventDefault();
          this.handleCodeLabBackspace();
          return;
        }
      });

      this.elCodeHiddenInput.addEventListener('compositionend', (e) => {
        if (this.currentMode !== 'practice_code' || this.isAnyModalBlockingTyping()) return;
        const val = e.target.value;
        e.target.value = '';
        if (!val) return;
        this.processCodeLabTextChunk(val);
      });

      this.elCodeHiddenInput.addEventListener('input', (e) => {
        if (this.currentMode !== 'practice_code' || this.isAnyModalBlockingTyping()) {
          e.target.value = '';
          return;
        }
        if (e.isComposing) return;
        const val = e.target.value;
        e.target.value = '';
        if (!val) return;
        this.processCodeLabTextChunk(val);
      });
    }

    // 상단 접이식·크기 조절형 통계 패널 컨트롤
    if (this.elTelemetryToggleBtn) {
      this.elTelemetryToggleBtn.addEventListener('click', () => {
        this.setTelemetryOpen(true);
      });
    }
    if (this.elTelemetryCollapseBtn) {
      this.elTelemetryCollapseBtn.addEventListener('click', () => {
        this.setTelemetryOpen(false);
      });
    }
    if (this.elTelemetryResetSizeBtn) {
      this.elTelemetryResetSizeBtn.addEventListener('click', () => {
        this.resetTelemetrySize();
      });
    }
    if (this.elTelemetryHeatmapBtn) {
      this.elTelemetryHeatmapBtn.addEventListener('click', () => {
        this.setHeatmapEnabled(!this.userSettings.heatmapEnabled);
      });
    }
    if (this.elTelemetryResetStatsBtn) {
      this.elTelemetryResetStatsBtn.addEventListener('click', () => {
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
    this.typingInput.addEventListener('input', () => {
      if (this.isAnyModalBlockingTyping()) return;
      this.handleTypingInput();
    });
    this.typingInput.addEventListener('compositionupdate', () => {
      if (this.isAnyModalBlockingTyping()) return;
      setTimeout(() => this.updateNextStrokeGuide(), 0);
    });
    this.typingInput.addEventListener('keydown', (e) => {
      if (this.isAnyModalBlockingTyping()) return;
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
    if (this.currentMode !== 'practice_code') {
      this._nonCodeLang = lang;
      this.userSettings.lang = lang;
      this.saveUserSettings();
    }
    this.targetText = '';
    this.nextTargetText = '';
    this._nextLitItem = null;
    this._nextSnippetItem = null;
    this.renderer.setLanguage(lang);
    this.renderSubFilterButtons();
    this.syncSettingsUI();
    this.updateStudioBreadcrumb();
    this.restartCurrentMode();
  }

  switchMode(mode) {
    const prevMode = this.currentMode;
    this.currentMode = mode;
    this.closeSettingsPopover();
    this.clearTimers();
    this.targetText = '';
    this.nextTargetText = '';
    this._nextLitItem = null;
    this._nextSnippetItem = null;

    if (mode === 'practice_code' && prevMode !== 'practice_code') {
      this._nonCodeLang = this.userSettings ? this.userSettings.lang : this.lang;
      if (this.lang !== 'en') {
        this.lang = 'en';
        this.renderer.setLanguage('en');
      }
    } else if (mode !== 'practice_code' && prevMode === 'practice_code') {
      const restored = (this.userSettings && this.userSettings.lang) || this._nonCodeLang || 'ko';
      if (this.lang !== restored) {
        this.lang = restored;
        this.renderer.setLanguage(restored);
      }
    }

    document.body.classList.toggle('is-codelab-active', mode === 'practice_code');
    if (mode !== 'practice_code') {
      document.body.classList.remove('codelab-kbd-hidden', 'codelab-settings-open');
      document.body.classList.toggle('general-kbd-hidden', Boolean(this.userSettings && this.userSettings.generalKbdHidden));
    } else {
      document.body.classList.remove('general-kbd-hidden');
      this.setCodeLabWideMode(
        Boolean(this.userSettings ? this.userSettings.codelabWideDefault : this.codeLab.keyboardHidden),
        { skipFocus: true, skipSave: true }
      );
    }

    document.querySelectorAll('.mode-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });

    this.renderSubFilterButtons();
    this.syncSettingsUI();
    this.restartCurrentMode();
    this.updateStudioBreadcrumb();
  }

  renderSubFilterButtons() {
    if (!this.elSubFilterButtons && !this.elHubSubfilterSelect) return;

    if (this.currentMode === 'hw_diagnostic' || this.currentMode === 'practice_code') {
      if (this.elPopSubfilterSection) this.elPopSubfilterSection.style.display = 'none';
      if (this.elHubSubfilterRow) this.elHubSubfilterRow.style.display = 'none';
      if (this.elMenuReflexSubfiltersWrap && this.currentMode === 'hw_diagnostic') {
        this.elMenuReflexSubfiltersWrap.style.display = 'none';
      }
      return;
    }

    if (this.elPopSubfilterSection) this.elPopSubfilterSection.style.display = 'flex';
    if (this.elHubSubfilterRow) this.elHubSubfilterRow.style.display = 'flex';
    let label = '출제 범위';
    let buttons = [];

    if (this.currentMode === 'reflex_single' || this.currentMode === 'reflex_rush' || this.currentMode === 'practice_position') {
      label = '출제 범위';
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
      label = this.lang === 'ko' ? '단어 테마' : 'Word Theme';
      buttons = [
        { filter: 'dev', text: this.lang === 'ko' ? '개발자 필수 영단어' : 'Developer Words' },
        { filter: 'all', text: this.lang === 'ko' ? '전체 혼합' : 'All Mixed' },
        { filter: 'general', text: this.lang === 'ko' ? '일상 빈출 영단어' : 'General Words' }
      ];
      if (!['dev', 'all', 'general'].includes(this.subOption)) {
        this.subOption = 'dev';
      }
    } else if (this.currentMode === 'practice_sentences') {
      label = this.lang === 'ko' ? '한국 문학 장르' : 'Literature Genre';
      buttons = this.lang === 'ko' ? [
        { filter: 'all', text: '전체 명작 구절' },
        { filter: 'novel', text: '소설 / 단편 (이효석·이상·황순원)' },
        { filter: 'poem', text: '서정시 (윤동주·김소월·백석)' },
        { filter: 'essay', text: '명수필 / 고전 (피천득·법정)' }
      ] : [
        { filter: 'all', text: 'All Literature' },
        { filter: 'novel', text: 'Classic Novels (Gatsby, 1984)' },
        { filter: 'poem', text: 'Poetry (Frost, Dickinson)' },
        { filter: 'essay', text: 'Drama & Essays (Shakespeare)' }
      ];
      if (!['all', 'novel', 'poem', 'essay'].includes(this.subOption)) {
        this.subOption = 'all';
      }
    }

    if (this.elSubFilterLabel) this.elSubFilterLabel.textContent = label;
    if (this.elHubSubfilterTitle) this.elHubSubfilterTitle.textContent = label;

    const fillChips = (container) => {
      if (!container) return;
      container.innerHTML = '';
      buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sub-filter-btn' + (b.filter === this.subOption ? ' active' : '');
        btn.setAttribute('data-filter', b.filter);
        btn.textContent = b.text;
        container.appendChild(btn);
      });
    };

    fillChips(this.elSubFilterButtons);

    if (this.currentMode === 'reflex_single' || this.currentMode === 'reflex_rush') {
      if (this.elMenuReflexSubfiltersWrap) this.elMenuReflexSubfiltersWrap.style.display = 'flex';
      fillChips(this.elMenuReflexSubfilters);
    } else if (['practice_position', 'practice_words', 'practice_sentences'].includes(this.currentMode)) {
      if (this.elMenuTypingSubfiltersWrap) this.elMenuTypingSubfiltersWrap.style.display = 'flex';
      if (this.elMenuTypingSubfilterLabel) this.elMenuTypingSubfilterLabel.textContent = label;
      fillChips(this.elMenuTypingSubfilters);
    }

    if (this.elHubSubfilterSelect) {
      this.elHubSubfilterSelect.innerHTML = '';
      buttons.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.filter;
        opt.textContent = b.text;
        this.elHubSubfilterSelect.appendChild(opt);
      });
      this.elHubSubfilterSelect.value = this.subOption;
    }
    this.updateStudioBreadcrumb();
  }

  restartCurrentMode() {
    this.clearTimers();
    this.combo = 0;
    this.totalStrokesInSession = 0;
    this.correctStrokesInSession = 0;
    this.targetKeyCode = null;
    this.targetShift = false;
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
      if (this.elCodeLabStage) this.elCodeLabStage.style.display = 'none';
      this.setupReflexIdleUI();
    } else if (this.currentMode === 'hw_diagnostic') {
      this.elReflexStage.style.display = 'none';
      this.elPracticeStage.style.display = 'none';
      this.elHwStage.style.display = 'flex';
      if (this.elCodeLabStage) this.elCodeLabStage.style.display = 'none';
      this.updateFingerBadge(null);
      this.updateHwDashboardUI();
    } else if (this.currentMode === 'practice_code') {
      this.elReflexStage.style.display = 'none';
      this.elPracticeStage.style.display = 'none';
      this.elHwStage.style.display = 'none';
      if (this.elCodeLabStage) this.elCodeLabStage.style.display = 'flex';
      this.startCodeLabMode();
    } else {
      this.elReflexStage.style.display = 'none';
      this.elPracticeStage.style.display = 'flex';
      this.elHwStage.style.display = 'none';
      if (this.elCodeLabStage) this.elCodeLabStage.style.display = 'none';
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
    this.updateFingerBadge(keyData.finger, `${nextChar} (${keyData.en})`, this.targetShift);
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
    if (this.currentMode !== 'practice_words' && this.currentMode !== 'practice_sentences') return;

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
      this.targetKeyCode = 'Enter';
      this.targetShift = false;
      this.renderer.setTargetKey('Enter', false);
      this.updateFingerBadge('R_PINKY', 'Enter ↵', false);
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
    if (this.isAnyModalBlockingTyping()) return;
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

    // 4) CodeLab 모드에서는 자체 hidden textarea & handleCodeLabInputKey에서 피드백/통계 처리
    if (this.currentMode === 'practice_code') {
      return;
    }

    // 5) 낱말 / 문장 연습 모드에서의 키 입력 시각 피드백 및 반응속도 측정
    if (this.currentMode === 'practice_words' || this.currentMode === 'practice_sentences') {
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

  recordKeyAndFingerStat(keyCode, reactionMs, isHit, symbolChar = null) {
    if (!this.stats.symbols) this.stats.symbols = {};
    const isCodeSym = symbolChar && /^[{}()[\];=<>*&:'"+\-/%!|^~?.,_\\@#$`]$/.test(symbolChar);

    if (isCodeSym) {
      if (!this.stats.symbols[symbolChar]) {
        this.stats.symbols[symbolChar] = { count: 0, totalMs: 0, misses: 0 };
      }
      if (isHit) {
        this.stats.symbols[symbolChar].count++;
        if (reactionMs !== null && reactionMs > 0) {
          this.stats.symbols[symbolChar].totalMs += reactionMs;
        }
      } else {
        this.stats.symbols[symbolChar].misses++;
      }
    }

    const keyData = window.KEY_MAP[keyCode];
    if (!keyData) {
      if (isCodeSym) {
        this.saveStats();
        this.updateWeakSymbolsUI();
      }
      return;
    }
    const fingerId = keyData.finger;

    if (isHit) {
      this.stats.totalHits++;
      if (reactionMs !== null && reactionMs > 0) {
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
      }
    } else {
      this.stats.totalMisses++;
      if (!this.stats.fingers[fingerId]) {
        this.stats.fingers[fingerId] = { count: 0, totalMs: 0, misses: 0 };
      }
      this.stats.fingers[fingerId].misses++;

      if (!this.stats.keys[keyCode]) {
        this.stats.keys[keyCode] = { count: 0, totalMs: 0, misses: 0 };
      }
      this.stats.keys[keyCode].misses++;
    }

    this.saveStats();
    this.updateFingerStatsUI();
    this.updateWeakSymbolsUI();
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
    let html = '';
    if (!fingerId || !window.FINGER_INFO[fingerId]) {
      html = `<span class="badge-dot" style="background:#f97316"></span>양손 손가락을 홈 자리(ㅁㄴㅇㄹ / ㅓㅏㅣ)에 올려두세요`;
    } else {
      const fInfo = window.FINGER_INFO[fingerId];
      const shiftText = needShift ? ' + 반대손 Shift' : '';
      html = `
        <span class="badge-dot" style="background:${fInfo.color}"></span>
        담당 손가락: <strong>${fInfo.name}</strong>${shiftText} → <span class="badge-key-highlight">${keyLabel}</span>
      `;
    }
    if (this.elFingerGuideBadge) this.elFingerGuideBadge.innerHTML = html;
    if (this.elCodeFingerBadge) this.elCodeFingerBadge.innerHTML = html;
  }

  /**
   * 4-Tier 배지 색상 위계 적용
   */
  applyTierBadgeClass(el, baseClass, tier) {
    if (!el) return;
    const t = Math.max(1, Math.min(4, Number(tier) || 1));
    el.className = `${baseClass} tier-${t}`;
  }

  /**
   * 좌우 스플릿 뷰 드래그 리사이저 초기화
   */
  initCodeLabSplitResizer() {
    if (!this.elCodeSplitResizer || !this.elCodeSplitView) return;
    try {
      const saved = localStorage.getItem('keyreflex_codelab_split_pct');
      if (saved) {
        const pct = parseFloat(saved);
        if (pct >= 42 && pct <= 74) {
          this.elCodeSplitView.style.setProperty('--codelab-editor-width', `${pct.toFixed(1)}%`);
        }
      }
    } catch (_) { /* ignore */ }

    let dragging = false;
    let startX = 0;
    let startWidth = 0;
    let totalWidth = 0;

    this.elCodeSplitResizer.addEventListener('pointerdown', (e) => {
      if (!this.elCodeEditorPanel || !this.elCodeSplitView) return;
      dragging = true;
      startX = e.clientX;
      startWidth = this.elCodeEditorPanel.getBoundingClientRect().width;
      totalWidth = this.elCodeSplitView.getBoundingClientRect().width - 10;
      this.elCodeSplitResizer.classList.add('is-dragging');
      document.body.style.userSelect = 'none';
      if (this.elCodeSplitResizer.setPointerCapture) {
        try { this.elCodeSplitResizer.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging || totalWidth <= 0) return;
      const dx = e.clientX - startX;
      const pct = Math.min(74, Math.max(42, ((startWidth + dx) / totalWidth) * 100));
      this.elCodeSplitView.style.setProperty('--codelab-editor-width', `${pct.toFixed(1)}%`);
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      this.elCodeSplitResizer.classList.remove('is-dragging');
      document.body.style.userSelect = '';
      try {
        const cur = this.elCodeSplitView.style.getPropertyValue('--codelab-editor-width');
        if (cur) localStorage.setItem('keyreflex_codelab_split_pct', String(parseFloat(cur)));
      } catch (_) { /* ignore */ }
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    this.elCodeSplitResizer.addEventListener('dblclick', () => {
      this.elCodeSplitView.style.setProperty('--codelab-editor-width', '58%');
      try { localStorage.removeItem('keyreflex_codelab_split_pct'); } catch (_) { /* ignore */ }
    });
  }

  /**
   * 오프라인 시맨틱 코드 구문 토크나이저 (JS / Python / C)
   * 문자 단위 tok-* 클래스 배열 반환
   */
  tokenizeCodeForDisplay(code, lang) {
    const src = code || '';
    const classes = new Array(src.length).fill('');
    const n = src.length;
    const isPy = lang === 'python';
    const isC = lang === 'c';
    const isSpec = lang === 'spec';

    const KW = new Set([
      'function', 'return', 'if', 'else', 'elif', 'for', 'while', 'of', 'in',
      'new', 'async', 'await', 'def', 'import', 'from', 'as', 'pass', 'break',
      'continue', 'and', 'or', 'not', 'is', 'lambda', 'nonlocal', 'global',
      'yield', 'try', 'except', 'throw', 'catch', 'switch', 'case', 'default', 'do',
      'flowchart', 'graph', 'sequenceDiagram', 'participant', 'LR', 'TD', 'RL', 'TB'
    ]);
    const TYPES = new Set([
      'const', 'let', 'var', 'class', 'int', 'void', 'char', 'size_t', 'long',
      'unsigned', 'short', 'float', 'double', 'bool', 'struct', 'typedef', 'sizeof',
      'true', 'false', 'True', 'False', 'None', 'null', 'undefined', 'NULL', 'nullptr',
      'Map', 'Set', 'Array', 'Math', 'Object', 'JSON', 'Promise', 'deque', 'defaultdict',
      'len', 'range', 'enumerate', 'abs', 'min', 'max', 'printf', 'malloc', 'free', 'strlen', 'this',
      'object', 'array', 'string', 'integer', 'number', 'boolean'
    ]);

    const paint = (start, end, cls) => {
      for (let k = start; k < end; k++) classes[k] = cls;
    };

    let i = 0;
    while (i < n) {
      const ch = src[i];
      const next = src[i + 1] || '';

      // 한 줄 주석 (JS/C '//', Python '#', Mermaid '%%')
      if ((!isPy && ch === '/' && next === '/') || (isPy && ch === '#') || (isSpec && ch === '%' && next === '%')) {
        const start = i;
        while (i < n && src[i] !== '\n') i++;
        paint(start, i, 'tok-cm');
        continue;
      }

      // 블록 주석 (JS / C)
      if (!isPy && ch === '/' && next === '*') {
        const start = i;
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
        i = Math.min(n, i + 2);
        paint(start, i, 'tok-cm');
        continue;
      }

      // C 전처리기 (#include, #define)
      if (isC && ch === '#') {
        const start = i;
        while (i < n && src[i] !== '\n') i++;
        paint(start, i, 'tok-meta');
        continue;
      }

      // Python 데코레이터 (@memoize)
      if (isPy && ch === '@' && /[A-Za-z_]/.test(next)) {
        const start = i;
        i++;
        while (i < n && /[A-Za-z0-9_]/.test(src[i])) i++;
        paint(start, i, 'tok-meta');
        continue;
      }

      // 문자열 ('...', "...", `...`)
      if (ch === '"' || ch === "'" || ch === '`') {
        const quote = ch;
        const start = i;
        i++;
        while (i < n) {
          if (src[i] === '\\' && i + 1 < n) {
            i += 2;
            continue;
          }
          if (src[i] === quote) {
            i++;
            break;
          }
          if (quote !== '`' && src[i] === '\n') break;
          i++;
        }
        paint(start, i, 'tok-str');
        continue;
      }

      // 숫자 리터럴
      if (/[0-9]/.test(ch)) {
        const start = i;
        if (ch === '0' && (next === 'x' || next === 'X')) {
          i += 2;
          while (i < n && /[0-9a-fA-F]/.test(src[i])) i++;
        } else {
          while (i < n && /[0-9.]/.test(src[i])) i++;
        }
        paint(start, i, 'tok-num');
        continue;
      }

      // 식별자 / 키워드 / 타입 / 함수
      if (/[A-Za-z_$]/.test(ch)) {
        const start = i;
        while (i < n && /[A-Za-z0-9_$]/.test(src[i])) i++;
        const word = src.slice(start, i);
        let j = i;
        while (j < n && src[j] === ' ') j++;
        if (KW.has(word)) paint(start, i, 'tok-kw');
        else if (TYPES.has(word)) paint(start, i, 'tok-type');
        else if (src[j] === '(') paint(start, i, 'tok-fn');
        else paint(start, i, 'tok-id');
        continue;
      }

      // 연산자 및 구두점 기호
      if (/[{}()[\];=<>*&+\-/%!|^~?:.,]/.test(ch)) {
        classes[i] = 'tok-op';
      }
      i++;
    }
    return classes;
  }

  buildHighlightedCodeHTML(code, lang) {
    const src = (code || '').replace(/\r\n/g, '\n');
    const tokClasses = this.tokenizeCodeForDisplay(src, lang);
    let out = '';
    let i = 0;
    while (i < src.length) {
      const cls = tokClasses[i];
      let j = i + 1;
      while (j < src.length && tokClasses[j] === cls && src[i] !== '\n' && src[j] !== '\n') {
        j++;
      }
      const chunk = this.escapeHtml(src.slice(i, j));
      out += cls ? `<span class="${cls}">${chunk}</span>` : chunk;
      i = j;
    }
    return out;
  }

  updateFingerStatsUI() {
    const container = document.getElementById('finger-stats-grid');
    if (!container) return;
    container.innerHTML = '';

    const handsSpec = [
      { title: '왼손 5지', fingers: ['L_PINKY', 'L_RING', 'L_MIDDLE', 'L_INDEX', 'L_THUMB'] },
      { title: '오른손 5지', fingers: ['R_THUMB', 'R_INDEX', 'R_MIDDLE', 'R_RING', 'R_PINKY'] }
    ];

    let totalHitsAll = 0;
    let recordedCount = 0;
    let slowest = null;

    const metricsById = {};
    handsSpec.forEach(group => {
      group.fingers.forEach(fId => {
        const info = window.FINGER_INFO[fId];
        const st = this.stats.fingers[fId] || { count: 0, totalMs: 0, misses: 0 };
        const avgMs = st.count > 0 ? Math.round(st.totalMs / st.count) : null;
        const totalAttempts = st.count + st.misses;
        const acc = totalAttempts > 0 ? Math.round((st.count / totalAttempts) * 100) : 100;
        const fillPercent = avgMs !== null
          ? Math.max(15, Math.min(100, Math.round(((620 - avgMs) / 420) * 100)))
          : 8;

        totalHitsAll += st.count;
        if (avgMs !== null) {
          recordedCount++;
          if (!slowest || avgMs > slowest.avgMs) {
            slowest = { id: fId, short: info.short, avgMs, acc, count: st.count };
          }
        }
        metricsById[fId] = { info, st, avgMs, acc, fillPercent };
      });
    });

    const slowId = (slowest && (recordedCount >= 2 || slowest.avgMs >= 320)) ? slowest.id : null;

    handsSpec.forEach(group => {
      const col = document.createElement('div');
      col.className = 'telemetry-hand-col';

      const titleEl = document.createElement('div');
      titleEl.className = 'telemetry-hand-title';
      titleEl.textContent = group.title;
      col.appendChild(titleEl);

      group.fingers.forEach(fId => {
        const { info, st, avgMs, acc, fillPercent } = metricsById[fId];
        const row = document.createElement('div');
        row.className = 'telemetry-finger-row' + (fId === slowId ? ' is-slow' : '');
        row.title = `${info.name}: ${avgMs !== null ? `${avgMs}ms` : '기록 없음'} · 정확도 ${acc}% (${st.count}타)`;
        row.innerHTML = `
          <span class="tf-name">
            <span class="tf-dot" style="background:${info.color}"></span>
            <span>${info.short}</span>
          </span>
          <div class="tf-track">
            <div class="tf-fill" style="width:${fillPercent}%; background:${info.color}"></div>
          </div>
          <span class="tf-ms">${avgMs !== null ? `${avgMs}ms` : '--'}</span>
          <span class="tf-acc">${acc}%</span>
        `;
        col.appendChild(row);
      });

      container.appendChild(col);
    });

    if (this.elTelemetryWeakTag) {
      if (slowest) {
        this.elTelemetryWeakTag.textContent = `보완 포인트: ${slowest.short} ${slowest.avgMs}ms (${slowest.acc}%) · 누적 ${totalHitsAll}타`;
        this.elTelemetryWeakTag.classList.toggle('is-warn', slowest.avgMs >= 280);
      } else {
        this.elTelemetryWeakTag.textContent = '측정 대기 중 · Ctrl+I로 접기/펼치기';
        this.elTelemetryWeakTag.classList.remove('is-warn');
      }
    }
  }

  updateWeakSymbolsUI() {
    if (!this.elCodeWeakSymList) return;
    const syms = this.stats && this.stats.symbols ? Object.entries(this.stats.symbols) : [];
    const ranked = syms
      .map(([sym, st]) => {
        const attempts = st.count + st.misses;
        const avgMs = st.count > 0 ? Math.round(st.totalMs / st.count) : 0;
        const errRate = attempts > 0 ? st.misses / attempts : 0;
        // 취약 점수: 오타 가중치 + 지연 시간 가중치
        const score = st.misses * 350 + errRate * 500 + (avgMs > 260 ? avgMs - 260 : 0);
        return { sym, misses: st.misses, count: st.count, avgMs, errRate, score };
      })
      .filter(item => item.misses > 0 || (item.count >= 2 && item.avgMs > 240))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (ranked.length === 0) {
      this.elCodeWeakSymList.innerHTML = '타이핑을 시작하면 느리거나 오타 난 기호 Top 5가 집계됩니다';
      return;
    }

    this.elCodeWeakSymList.innerHTML = ranked.map(item => {
      const cls = item.misses > 0 ? 'weak-sym-pill' : 'weak-sym-pill is-slow';
      const detail = item.misses > 0
        ? `오타 ${item.misses}${item.avgMs > 0 ? ` · ${item.avgMs}ms` : ''}`
        : `${item.avgMs}ms`;
      return `<span class="${cls}" title="정타 ${item.count}회 / 오타 ${item.misses}회"><code>${this.escapeHtml(item.sym)}</code> <small>${detail}</small></span>`;
    }).join('');
  }

  updatePyodideStatusBadge(status, _msg = '') {
    if (!this.elCodePyodideStatus) return;
    const show = this.codeLab && this.codeLab.lang === 'python';
    this.elCodePyodideStatus.style.display = show ? 'inline-flex' : 'none';
    if (!show) return;

    this.elCodePyodideStatus.className = 'codelab-pyodide-pill';
    if (status === 'ready') {
      this.elCodePyodideStatus.classList.add('state-ready');
      this.elCodePyodideStatus.textContent = 'Pyodide 준비됨';
      this.elCodePyodideStatus.title = 'Python WebAssembly 런타임이 활성화되어 즉시 실행 가능합니다';
    } else if (status === 'loading') {
      this.elCodePyodideStatus.classList.add('state-loading');
      this.elCodePyodideStatus.textContent = 'Pyodide 로딩...';
      this.elCodePyodideStatus.title = 'WebAssembly Python 런타임을 초기화하는 중입니다';
    } else if (status === 'error') {
      this.elCodePyodideStatus.classList.add('state-error');
      this.elCodePyodideStatus.textContent = 'Pyodide 오프라인 (재시도)';
      this.elCodePyodideStatus.title = '네트워크/CDN 연결 실패 — 클릭하여 다시 로드';
    } else {
      this.elCodePyodideStatus.classList.add('state-idle');
      this.elCodePyodideStatus.textContent = 'Pyodide 대기 (클릭 초기화)';
      this.elCodePyodideStatus.title = 'Python 첫 실행 시 또는 클릭 시 WebAssembly 런타임을 초기화합니다';
    }
  }

  // =========================================================================
  // 4.5. 통합 설정 시스템 (안 B 빠른 제어센터 팝오버 + 안 D 설정 허브 모달)
  // =========================================================================

  getDefaultUserSettings() {
    return {
      lang: 'ko',
      showZoneColors: true,
      handOpacity: 0.72,
      soundProfile: 'thock',
      heatmapEnabled: false,
      generalKbdHidden: false,
      codelabWideDefault: false,
      telemetryOpen: false,
      telemetryHeight: null,
      telemetryWidth: null
    };
  }

  loadUserSettings() {
    const defaults = this.getDefaultUserSettings();
    try {
      const raw = localStorage.getItem('keyreflex_user_settings_v1');
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return defaults;
      const validSounds = ['thock', 'tactile', 'linear', 'clicky', 'mute'];
      const opacity = Number(parsed.handOpacity);
      const rawTelH = parsed.telemetryHeight;
      const parsedTelH = (rawTelH !== null && rawTelH !== undefined && rawTelH !== '')
        ? Number(rawTelH)
        : null;
      const rawTelW = parsed.telemetryWidth;
      const parsedTelW = (rawTelW !== null && rawTelW !== undefined && rawTelW !== '')
        ? Number(rawTelW)
        : null;
      return {
        lang: parsed.lang === 'en' ? 'en' : 'ko',
        showZoneColors: parsed.showZoneColors !== undefined ? Boolean(parsed.showZoneColors) : defaults.showZoneColors,
        handOpacity: Number.isFinite(opacity) ? Math.round(Math.min(0.95, Math.max(0.15, opacity)) * 100) / 100 : defaults.handOpacity,
        soundProfile: validSounds.includes(parsed.soundProfile) ? parsed.soundProfile : defaults.soundProfile,
        heatmapEnabled: Boolean(parsed.heatmapEnabled),
        generalKbdHidden: Boolean(parsed.generalKbdHidden),
        codelabWideDefault: Boolean(parsed.codelabWideDefault),
        telemetryOpen: Boolean(parsed.telemetryOpen),
        telemetryHeight: (parsedTelH !== null && Number.isFinite(parsedTelH))
          ? Math.round(Math.min(420, Math.max(146, parsedTelH)))
          : null,
        telemetryWidth: (parsedTelW !== null && Number.isFinite(parsedTelW))
          ? Math.round(Math.min(1360, Math.max(700, parsedTelW)))
          : null
      };
    } catch (_) {
      return defaults;
    }
  }

  saveUserSettings() {
    try {
      localStorage.setItem('keyreflex_user_settings_v1', JSON.stringify(this.userSettings));
    } catch (_) {
      // ignore storage errors
    }
  }

  applyUserSettings() {
    const s = this.userSettings || this.getDefaultUserSettings();
    this._nonCodeLang = s.lang;
    if (this.currentMode !== 'practice_code') {
      this.lang = s.lang;
      if (this.renderer) this.renderer.setLanguage(s.lang);
    }
    if (this.renderer) {
      this.renderer.setShowZoneColors(Boolean(s.showZoneColors));
      this.renderer.setHandOpacity(Number(s.handOpacity));
    }
    this._applySoundEngine(s.soundProfile, false);
    this.setHeatmapEnabled(Boolean(s.heatmapEnabled), { skipSave: true, skipSync: true });
    document.body.classList.toggle('general-kbd-hidden', Boolean(s.generalKbdHidden) && this.currentMode !== 'practice_code');
    this.codeLab.keyboardHidden = Boolean(s.codelabWideDefault);
    if (this.currentMode === 'practice_code') {
      this.setCodeLabWideMode(this.codeLab.keyboardHidden, { skipFocus: true, skipSave: true });
    }
    this.setTelemetryOpen(Boolean(s.telemetryOpen), { skipSave: true });
    this.applyTelemetrySize();
  }

  isTelemetryOpen() {
    return Boolean(this.userSettings && this.userSettings.telemetryOpen);
  }

  setTelemetryOpen(open, { skipSave = false } = {}) {
    const isOpen = Boolean(open);
    if (this.userSettings) {
      this.userSettings.telemetryOpen = isOpen;
    }
    if (this.elTelemetryDockWrap) {
      this.elTelemetryDockWrap.classList.toggle('is-open', isOpen);
    }
    if (this.elTelemetrySheet) {
      this.elTelemetrySheet.style.display = isOpen ? 'flex' : 'none';
    }
    if (this.elTelemetryToggleBtn) {
      this.elTelemetryToggleBtn.setAttribute('aria-expanded', String(isOpen));
    }
    if (isOpen) {
      this.applyTelemetrySize();
    }
    if (!skipSave) {
      this.saveUserSettings();
    }
  }

  toggleTelemetryPanel() {
    this.setTelemetryOpen(!this.isTelemetryOpen());
  }

  applyTelemetrySize() {
    const sheet = this.elTelemetrySheet;
    if (!sheet || !this.userSettings) return;

    const h = this.userSettings.telemetryHeight;
    const w = this.userSettings.telemetryWidth;

    if (typeof h === 'number' && Number.isFinite(h)) {
      const clampedH = Math.round(Math.min(420, Math.max(146, h)));
      const scale = Math.min(1.28, Math.max(0.84, clampedH / 196));
      sheet.style.height = `${clampedH}px`;
      sheet.style.setProperty('--tel-scale', scale.toFixed(2));
      sheet.classList.toggle('is-compact-h', clampedH < 172);
      sheet.classList.toggle('is-tall-h', clampedH >= 250);
    } else {
      sheet.style.height = '';
      sheet.style.setProperty('--tel-scale', '1');
      sheet.classList.remove('is-compact-h', 'is-tall-h');
    }

    let appliedW = null;
    if (typeof w === 'number' && Number.isFinite(w)) {
      const maxAvailW = Math.min(1360, Math.max(700, window.innerWidth - 36));
      appliedW = Math.round(Math.min(maxAvailW, Math.max(700, w)));
      sheet.style.width = `${appliedW}px`;
      sheet.classList.toggle('is-narrow-w', appliedW < 860);
    } else {
      sheet.style.width = '';
      sheet.classList.remove('is-narrow-w');
    }

    const isCustom = (typeof h === 'number' && Number.isFinite(h)) || appliedW !== null;
    if (this.elTelemetryResetSizeBtn) {
      this.elTelemetryResetSizeBtn.style.display = isCustom ? 'inline-flex' : 'none';
    }
    if (this.elTelemetrySizeBadge) {
      if (isCustom) {
        const wTxt = appliedW !== null ? `${appliedW}` : '기본폭';
        const hTxt = (typeof h === 'number' && Number.isFinite(h)) ? `${Math.round(h)}` : '자동';
        this.elTelemetrySizeBadge.textContent = `${wTxt} × ${hTxt}`;
        this.elTelemetrySizeBadge.style.display = 'inline-flex';
      } else {
        this.elTelemetrySizeBadge.textContent = '';
        this.elTelemetrySizeBadge.style.display = 'none';
      }
    }
  }

  resetTelemetrySize() {
    if (!this.userSettings) return;
    this.userSettings.telemetryHeight = null;
    this.userSettings.telemetryWidth = null;
    this.applyTelemetrySize();
    this.saveUserSettings();
  }

  initTelemetryResizer() {
    const sheet = this.elTelemetrySheet;
    if (!sheet) return;

    let activeAxis = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const cursorMap = {
      y: 'ns-resize',
      x: 'ew-resize',
      xy: 'nwse-resize'
    };

    const startResize = (axis, e) => {
      if (!this.isTelemetryOpen()) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = sheet.getBoundingClientRect();
      activeAxis = axis;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      sheet.classList.add('is-resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = cursorMap[axis] || '';
      if (e.currentTarget && e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      }
    };

    const onMove = (e) => {
      if (!activeAxis) return;
      if (activeAxis === 'y' || activeAxis === 'xy') {
        const dy = e.clientY - startY;
        const nextH = Math.round(Math.min(420, Math.max(146, startHeight + dy)));
        this.userSettings.telemetryHeight = nextH;
      }
      if (activeAxis === 'x' || activeAxis === 'xy') {
        const dx = e.clientX - startX;
        const maxAvailW = Math.min(1360, Math.max(700, window.innerWidth - 36));
        const nextW = Math.round(Math.min(maxAvailW, Math.max(700, startWidth + dx * 2)));
        this.userSettings.telemetryWidth = nextW;
      }
      this.applyTelemetrySize();
    };

    const endResize = () => {
      if (!activeAxis) return;
      activeAxis = null;
      sheet.classList.remove('is-resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      this.saveUserSettings();
    };

    [
      [this.elTelemetryResizeY, 'y'],
      [this.elTelemetryResizeX, 'x'],
      [this.elTelemetryResizeCorner, 'xy']
    ].forEach(([handle, axis]) => {
      if (!handle) return;
      handle.addEventListener('pointerdown', (e) => startResize(axis, e));
      handle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.resetTelemetrySize();
      });
    });

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', endResize);
    window.addEventListener('pointercancel', endResize);
    window.addEventListener('resize', () => {
      if (this.isTelemetryOpen()) {
        this.applyTelemetrySize();
      }
    });
  }

  _applySoundEngine(profile, playPreview = false) {
    if (!window.soundEngine) return;
    if (profile === 'mute') {
      window.soundEngine.enabled = false;
    } else {
      window.soundEngine.enabled = true;
      window.soundEngine.profile = profile;
      if (playPreview) window.soundEngine.playKey(true);
    }
  }

  setHandOpacitySetting(val, { skipSave = false } = {}) {
    const clamped = Math.round(Math.min(0.95, Math.max(0.15, Number(val) || 0.72)) * 100) / 100;
    this.userSettings.handOpacity = clamped;
    if (this.renderer) this.renderer.setHandOpacity(clamped);
    if (!skipSave) this.saveUserSettings();
    this.syncSettingsUI();
  }

  setZoneColorsSetting(enabled, { skipSave = false } = {}) {
    this.userSettings.showZoneColors = Boolean(enabled);
    if (this.renderer) this.renderer.setShowZoneColors(this.userSettings.showZoneColors);
    if (!skipSave) this.saveUserSettings();
    this.syncSettingsUI();
  }

  setSoundProfileSetting(profile, { preview = true, skipSave = false } = {}) {
    const valid = ['thock', 'tactile', 'linear', 'clicky', 'mute'].includes(profile) ? profile : 'thock';
    this.userSettings.soundProfile = valid;
    this._applySoundEngine(valid, preview);
    if (!skipSave) this.saveUserSettings();
    this.syncSettingsUI();
  }

  setHeatmapEnabled(enabled, { skipSave = false, skipSync = false } = {}) {
    const target = Boolean(enabled);
    this.userSettings.heatmapEnabled = target;
    if (this.renderer && Boolean(this.renderer.heatmapMode) !== target) {
      this.renderer.renderHeatmap(this.stats.keys);
    }
    if (!skipSave) this.saveUserSettings();
    if (!skipSync) this.syncSettingsUI();
  }

  setGeneralKbdHidden(hidden, { skipSave = false } = {}) {
    this.userSettings.generalKbdHidden = Boolean(hidden);
    document.body.classList.toggle('general-kbd-hidden', this.userSettings.generalKbdHidden && this.currentMode !== 'practice_code');
    if (!skipSave) this.saveUserSettings();
    this.syncSettingsUI();
  }

  setSubOption(filterVal, { restart = true } = {}) {
    if (!filterVal) return;
    this.subOption = filterVal;
    [this.elSubFilterButtons, this.elMenuReflexSubfilters, this.elMenuTypingSubfilters].forEach(container => {
      if (!container) return;
      container.querySelectorAll('.sub-filter-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === filterVal);
      });
    });
    if (this.elHubSubfilterSelect) {
      this.elHubSubfilterSelect.value = filterVal;
    }
    this.syncSettingsUI();
    this.updateStudioBreadcrumb();
    if (restart) this.restartCurrentMode();
  }

  restoreDefaultSettings() {
    this.userSettings = this.getDefaultUserSettings();
    this.saveUserSettings();
    this.applyUserSettings();
    if (this.currentMode !== 'practice_code') {
      this.setLanguage(this.userSettings.lang);
    } else {
      this.setCodeLabWideMode(false, { skipFocus: true, skipSave: true });
      this.syncSettingsUI();
    }
  }

  resetCodeLabProgress() {
    this.codeLab.solvedLessons.clear();
    try {
      localStorage.removeItem('typing_reflex_codelab_solved_v1');
    } catch (_) {
      // ignore storage errors
    }
    if (typeof this.populateCodeLabProblems === 'function') {
      this.populateCodeLabProblems();
    }
    if (typeof this.updateCodeLabProgressUI === 'function') {
      this.updateCodeLabProgressUI();
    }
    this.syncSettingsUI();
  }

  isSettingsPopoverOpen() {
    return Boolean(
      this.elSettingsPopover &&
      this.elSettingsPopover.style.display &&
      this.elSettingsPopover.style.display !== 'none'
    );
  }

  openSettingsPopover() {
    if (!this.elSettingsPopover) return;
    this.syncSettingsUI();
    this.elSettingsPopover.style.display = 'flex';
    if (this.elSettingsBtn) {
      this.elSettingsBtn.classList.add('active');
      this.elSettingsBtn.setAttribute('aria-expanded', 'true');
    }
  }

  closeSettingsPopover() {
    if (!this.elSettingsPopover) return;
    this.elSettingsPopover.style.display = 'none';
    if (this.elSettingsBtn) {
      this.elSettingsBtn.classList.remove('active');
      this.elSettingsBtn.setAttribute('aria-expanded', 'false');
    }
  }

  toggleSettingsPopover() {
    if (this.isSettingsPopoverOpen()) this.closeSettingsPopover();
    else this.openSettingsPopover();
  }

  getDefaultMenuTabForMode() {
    if (this.currentMode === 'practice_code') return 'codelab';
    if (['practice_position', 'practice_words', 'practice_sentences'].includes(this.currentMode)) return 'typing';
    return 'reflex';
  }

  isStudioMenuOpen() {
    return Boolean(
      this.elStudioMenuOverlay &&
      this.elStudioMenuOverlay.style.display &&
      this.elStudioMenuOverlay.style.display !== 'none'
    );
  }

  openStudioMenu(tabName = null, { focusSearch = false } = {}) {
    if (!this.elStudioMenuOverlay) return;
    this.closeSettingsPopover();
    const targetTab = tabName || this.getDefaultMenuTabForMode();
    if (this.elMenuSearchInput) {
      this.elMenuSearchInput.value = '';
      this.renderMenuSearchResults('');
    }
    this.switchStudioMenuTab(targetTab);
    this.renderSubFilterButtons();
    this.renderMenuCodeLabCourseGrid();
    this.syncSettingsUI();
    this.elStudioMenuOverlay.style.display = 'flex';
    if (this.elStudioMenuBtn) this.elStudioMenuBtn.classList.add('active');
    if (focusSearch && this.elMenuSearchInput) {
      setTimeout(() => this.elMenuSearchInput.focus(), 40);
    }
  }

  closeStudioMenu() {
    if (this.elStudioMenuOverlay) {
      this.elStudioMenuOverlay.style.display = 'none';
    }
    if (this.elStudioMenuBtn) this.elStudioMenuBtn.classList.remove('active');
    if (this.elMenuSearchInput) {
      this.elMenuSearchInput.value = '';
      this.renderMenuSearchResults('');
    }
    if (this.currentMode === 'practice_code' && !this.isCodeLabModalOpen()) {
      if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
        setTimeout(() => this.elCodeSandboxTextarea.focus(), 60);
      } else if (this.elCodeHiddenInput) {
        setTimeout(() => this.elCodeHiddenInput.focus(), 60);
      }
    }
  }

  switchStudioMenuTab(tabName) {
    const validTabs = ['reflex', 'typing', 'codelab', 'settings_keyboard', 'settings_sound', 'settings_data'];
    const valid = validTabs.includes(tabName) ? tabName : 'codelab';
    const isSettings = valid.startsWith('settings_');

    if (this.elMenuSearchResults && this.elMenuSearchResults.style.display !== 'none') {
      if (this.elMenuSearchInput) this.elMenuSearchInput.value = '';
      this.elMenuSearchResults.style.display = 'none';
    }
    if (this.elMenuSearchClearBtn) this.elMenuSearchClearBtn.style.display = 'none';

    if (this.elStudioMenuBody) {
      this.elStudioMenuBody.classList.toggle('is-settings-view', isSettings);
    }
    if (this.elMenuRailBtns) {
      this.elMenuRailBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-menutab') === valid);
      });
    }
    if (this.elMenuPanes) {
      this.elMenuPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `menu-pane-${valid}`);
      });
    }
    if (valid === 'codelab') {
      this.renderMenuCodeLabCourseGrid();
    } else if (valid === 'reflex' || valid === 'typing') {
      this.renderSubFilterButtons();
    }
  }

  isSettingsHubOpen() {
    return this.isStudioMenuOpen();
  }

  openSettingsHub(tabName = 'keyboard') {
    const map = {
      keyboard: 'settings_keyboard',
      sound: 'settings_sound',
      codelab: 'settings_keyboard',
      data: 'settings_data'
    };
    this.openStudioMenu(map[tabName] || 'settings_keyboard', { focusSearch: false });
  }

  closeSettingsHub() {
    this.closeStudioMenu();
  }

  isAnyModalBlockingTyping() {
    return this.isCodeLabModalOpen() || this.isStudioMenuOpen();
  }

  updateStudioBreadcrumb() {
    if (!this.elStudioBreadcrumbBtn) return;
    const modeNames = {
      reflex_single: '순발력 (5회)',
      reflex_rush: '30초 리플렉스',
      hw_diagnostic: 'HW 진단',
      practice_position: '자리 연습',
      practice_words: '낱말 연습',
      practice_sentences: '짧은 글 연습',
      practice_code: '코드 연습'
    };

    if (this.currentMode === 'practice_code') {
      const lesson = this.codeLab.currentLesson || ((window.CODE_CURRICULUM && window.CODE_CURRICULUM[this.codeLab.lang]) || [])[this.codeLab.lessonIndex];
      const langMap = { javascript: 'JS', python: 'Python', c: 'C', spec: '스펙·설계' };
      const typeMap = { flow: 'Flow', skeleton: 'Skeleton', sandbox: 'Sandbox', audit: 'AI 리뷰' };
      const langLabel = langMap[this.codeLab.lang] || this.codeLab.lang;
      const typeLabel = typeMap[this.codeLab.typeMode] || 'Flow';
      if (lesson) {
        const tMeta = this.getTrackMeta(this.getLessonTrack(lesson));
        const dMeta = this.getDifficultyMeta(this.getLessonDifficulty(lesson));
        this.elStudioBreadcrumbBtn.textContent = `코드 연습 › ${langLabel} · ${tMeta.shortLabel} · ${dMeta.label} · ${lesson.title} · ${typeLabel}`;
      } else {
        this.elStudioBreadcrumbBtn.textContent = `코드 연습 › ${langLabel} · ${typeLabel}`;
      }
      return;
    }

    if (this.currentMode === 'hw_diagnostic') {
      this.elStudioBreadcrumbBtn.textContent = 'HW 진단 · 실시간 스위치 계측';
      return;
    }

    const subLabelMap = {
      all: this.currentMode === 'practice_sentences' ? (this.lang === 'ko' ? '전체 명작 구절' : 'All Literature') : (this.currentMode === 'practice_words' ? '전체 혼합' : '전체 자판'),
      home: '기본 자리',
      top: '윗자리',
      bottom: '아랫자리',
      weak: '소지·약지 집중',
      dev: this.lang === 'ko' ? '개발자 영단어' : 'Developer Words',
      general: this.lang === 'ko' ? '일상 영단어' : 'General Words',
      novel: this.lang === 'ko' ? '소설 / 단편' : 'Classic Novels',
      poem: this.lang === 'ko' ? '서정시' : 'Poetry',
      essay: this.lang === 'ko' ? '명수필 / 고전' : 'Drama & Essays'
    };
    const langTag = this.lang === 'ko' ? '한글' : 'EN';
    const subTag = subLabelMap[this.subOption] || this.subOption;
    this.elStudioBreadcrumbBtn.textContent = `${modeNames[this.currentMode] || '연습'} · ${subTag} · ${langTag}`;
  }

  renderMenuCodeLabCourseGrid() {
    if (!this.elMenuCodeLabCourseGrid || !window.CODE_CURRICULUM) return;
    const filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, this.codeLab.difficulty, this.codeLab.track);
    const solvedSet = this.codeLab.solvedLessons || new Set();
    const langNames = { javascript: 'JavaScript', python: 'Python', c: 'C99', spec: '스펙·설계' };

    let allTotal = 0;
    let allSolved = 0;
    Object.values(window.CODE_CURRICULUM).forEach(list => {
      if (!Array.isArray(list)) return;
      list.forEach(l => {
        allTotal++;
        if (solvedSet.has(l.id)) allSolved++;
      });
    });
    if (this.elMenuCodeLabProgress) {
      this.elMenuCodeLabProgress.textContent = `완료 ${allSolved} / ${allTotal}`;
    }

    this.elMenuCodeLabCourseGrid.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'menu-search-empty';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = '선택한 필터 조건에 맞는 코스가 없습니다.';
      this.elMenuCodeLabCourseGrid.appendChild(empty);
      return;
    }

    filtered.forEach(({ lesson, originalIndex }) => {
      const isCurrent = originalIndex === this.codeLab.lessonIndex;
      const isSolved = solvedSet.has(lesson.id);
      const tMeta = this.getTrackMeta(this.getLessonTrack(lesson));
      const dMeta = this.getDifficultyMeta(this.getLessonDifficulty(lesson));

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'menu-course-card' + (isCurrent ? ' is-current' : '') + (isSolved ? ' is-solved' : '');
      card.setAttribute('data-lesson-idx', String(originalIndex));
      card.innerHTML = `
        <div class="mcc-top">
          <span class="mcc-track">[${this.escapeHtml(tMeta.shortLabel)} · T${lesson.tier}]</span>
          ${isCurrent ? '<span class="mcc-badge-current">선택됨</span>' : (isSolved ? '<span class="mcc-badge-solved">완료</span>' : '')}
        </div>
        <div class="mcc-title">${this.escapeHtml(lesson.title)}</div>
        <div class="mcc-meta">
          <span>${this.escapeHtml(dMeta.label)} · ${this.escapeHtml((lesson.complexity && lesson.complexity.time) || 'O(1)')}</span>
          <span>${this.escapeHtml(langNames[this.codeLab.lang] || this.codeLab.lang)}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.codeLab.lessonIndex = originalIndex;
        if (this.elCodeProblemSelect) this.elCodeProblemSelect.value = String(originalIndex);
        if (this.currentMode !== 'practice_code') {
          this.switchMode('practice_code');
        } else {
          this.loadCodeLabLesson(this.codeLab.lang, originalIndex);
        }
        this.closeStudioMenu();
      });
      this.elMenuCodeLabCourseGrid.appendChild(card);
    });
  }

  renderMenuSearchResults(rawQuery) {
    if (!this.elMenuSearchResults) return;
    const query = (rawQuery || '').trim().toLowerCase();
    if (this.elMenuSearchClearBtn) {
      this.elMenuSearchClearBtn.style.display = query ? 'inline-flex' : 'none';
    }

    if (!query) {
      this.elMenuSearchResults.style.display = 'none';
      this.elMenuSearchResults.innerHTML = '';
      if (this.elMenuPanes && this.elMenuRailBtns) {
        const activeBtn = Array.from(this.elMenuRailBtns).find(b => b.classList.contains('active'));
        const activeTab = activeBtn ? activeBtn.getAttribute('data-menutab') : 'codelab';
        this.elMenuPanes.forEach(p => p.classList.toggle('active', p.id === `menu-pane-${activeTab}`));
        if (this.elStudioMenuBody) {
          this.elStudioMenuBody.classList.toggle('is-settings-view', activeTab.startsWith('settings_'));
        }
      }
      return;
    }

    if (this.elStudioMenuBody) this.elStudioMenuBody.classList.remove('is-settings-view');
    if (this.elMenuPanes) this.elMenuPanes.forEach(p => p.classList.remove('active'));
    this.elMenuSearchResults.style.display = 'flex';
    this.elMenuSearchResults.innerHTML = '';

    const hits = [];

    // 1. 연습 모드 검색
    const modeDefs = [
      { mode: 'reflex_single', title: '순발력 (5회)', desc: '무작위 키 반응속도 5회 평균 측정', keys: '순발력 반응속도 reflex 단일' },
      { mode: 'reflex_rush', title: '30초 리플렉스', desc: '30초 제한 시간 내 연속 반응속도 도전', keys: '30초 리플렉스 rush 반응속도' },
      { mode: 'hw_diagnostic', title: 'HW 진단', desc: '스위치 눌림 시간 · 폴링레이트 · 채터링 · NKRO 측정', keys: 'hw 하드웨어 진단 nkro 채터링 폴링' },
      { mode: 'practice_position', title: '자리 연습', desc: '한/영 기본 자리 및 키 위치 집중 반복', keys: '자리 자모 position 기초' },
      { mode: 'practice_words', title: '낱말 연습', desc: '개발자 필수 영단어 및 일상 단어', keys: '낱말 단어 words 개발자' },
      { mode: 'practice_sentences', title: '짧은 글 연습', desc: '한국 문학 구절 및 영미 고전 문장', keys: '짧은 글 문장 문학 소설 시' },
      { mode: 'practice_code', title: '코드 연습 (CodeLab)', desc: '47개 알고리즘·AI·아키텍처·스펙 실시간 코딩', keys: '코드 연습 codelab 알고리즘 ai' }
    ];
    modeDefs.forEach(m => {
      if (`${m.title} ${m.desc} ${m.keys}`.toLowerCase().includes(query)) {
        hits.push({
          kind: '연습 모드',
          title: m.title,
          sub: m.desc,
          run: () => {
            this.switchMode(m.mode);
            this.closeStudioMenu();
          }
        });
      }
    });

    // 2. CodeLab 커리큘럼 47개 전체 검색
    if (window.CODE_CURRICULUM) {
      const langNames = { javascript: 'JS', python: 'Python', c: 'C', spec: '스펙·설계' };
      Object.entries(window.CODE_CURRICULUM).forEach(([lang, list]) => {
        if (!Array.isArray(list)) return;
        list.forEach((lesson, idx) => {
          const tMeta = this.getTrackMeta(this.getLessonTrack(lesson));
          const dMeta = this.getDifficultyMeta(this.getLessonDifficulty(lesson));
          const hay = `${lesson.title} ${lesson.description || ''} ${tMeta.label} ${dMeta.label} ${langNames[lang] || lang}`.toLowerCase();
          if (hay.includes(query)) {
            hits.push({
              kind: `${langNames[lang] || lang} 코스`,
              title: `[${tMeta.shortLabel}·T${lesson.tier}] ${lesson.title}`,
              sub: `${dMeta.label} · ${tMeta.label} · ${lesson.description || ''}`,
              run: () => {
                this.codeLab.lang = lang;
                this.codeLab.track = 'all';
                this.codeLab.difficulty = 'all';
                this.codeLab.lessonIndex = idx;
                this.saveCodeLabTrack();
                this.saveCodeLabDifficulty();
                this.syncCodeLabLangButtons();
                this.syncCodeLabTrackSelect();
                this.syncCodeLabDifficultyButtons();
                this.populateCodeLabProblems();
                this.updateCodeLabProgressUI();
                if (this.currentMode !== 'practice_code') {
                  this.switchMode('practice_code');
                } else {
                  this.loadCodeLabLesson(lang, idx);
                }
                this.closeStudioMenu();
              }
            });
          }
        });
      });
    }

    // 3. 스튜디오 설정 빠른 실행 검색
    const settingActions = [
      { title: '상단 실시간 통계 패널 접기/펼치기', sub: '반응속도 · HW 지연 · 10지 밸런스 시트 토글 (Ctrl+I)', keys: '통계 패널 리포트 손가락 밸런스 telemetry ctrl+i', run: () => this.toggleTelemetryPanel() },
      { title: '손가락 구역 색상 토글', sub: '열손가락 키캡 컬러 힌트 켜기/끄기', keys: '손가락 구역 색상 컬러 zone', run: () => this.setZoneColorsSetting(!this.userSettings.showZoneColors) },
      { title: '속도 히트맵 오버레이 토글', sub: '키캡 위 평균 반응속도 및 오타율 시각화', keys: '히트맵 heatmap 속도', run: () => this.setHeatmapEnabled(!this.userSettings.heatmapEnabled) },
      { title: '넓게 보기 / 가상 키보드 토글', sub: 'CodeLab 풀높이 집중 뷰 또는 키보드 표시 전환', keys: '넓게 보기 가상 키보드 wide', run: () => { if (this.currentMode === 'practice_code') this.setCodeLabWideMode(!this.codeLab.keyboardHidden, { skipFocus: true }); else this.setGeneralKbdHidden(!this.userSettings.generalKbdHidden); } },
      { title: '타건음: 도각도각 (무접점 Thock)', sub: '토프레 무접점 키보드 사운드 적용', keys: '타건음 사운드 도각 thock', run: () => this.setSoundProfileSetting('thock', { preview: true }) },
      { title: '타건음: 사각사각 (갈축 Tactile)', sub: '갈축 택타일 스위치 타건음 적용', keys: '타건음 사운드 갈축 tactile', run: () => this.setSoundProfileSetting('tactile', { preview: true }) },
      { title: '타건음: 서걱서걱 (적축 Linear)', sub: '리니어 스위치 타건음 적용', keys: '타건음 사운드 적축 linear', run: () => this.setSoundProfileSetting('linear', { preview: true }) },
      { title: '타건음: 찰칵찰칵 (청축 Clicky)', sub: '청축 클릭키 스위치 타건음 적용', keys: '타건음 사운드 청축 clicky', run: () => this.setSoundProfileSetting('clicky', { preview: true }) },
      { title: '타건음: 음소거 (Mute)', sub: '모든 키보드 효과음 끄기', keys: '타건음 사운드 음소거 무음 mute', run: () => this.setSoundProfileSetting('mute', { preview: false }) },
      { title: '상세 환경 설정 열기', sub: '투명도 · 자판 · 통계 초기화 설정 탭으로 이동', keys: '설정 투명도 자판 초기화 통계', run: () => this.switchStudioMenuTab('settings_keyboard') }
    ];
    settingActions.forEach(s => {
      if (`${s.title} ${s.sub} ${s.keys}`.toLowerCase().includes(query)) {
        hits.push({
          kind: '설정',
          title: s.title,
          sub: s.sub,
          run: () => {
            s.run();
            if (s.kind !== 'keep') this.renderMenuSearchResults(this.elMenuSearchInput ? this.elMenuSearchInput.value : '');
          }
        });
      }
    });

    if (hits.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'menu-search-empty';
      empty.textContent = `"${rawQuery}" 에 해당하는 모드, 코스, 설정을 찾지 못했습니다.`;
      this.elMenuSearchResults.appendChild(empty);
      return;
    }

    const head = document.createElement('div');
    head.className = 'menu-search-section-label';
    head.textContent = `검색 결과 ${hits.length}건 (Enter 키로 첫 번째 항목 바로 실행)`;
    this.elMenuSearchResults.appendChild(head);

    hits.slice(0, 14).forEach((hit, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-search-hit' + (idx === 0 ? ' is-top-hit' : '');
      btn.innerHTML = `
        <div class="msh-main">
          <span class="msh-title">${this.escapeHtml(hit.title)}</span>
          <span class="msh-sub">${this.escapeHtml(hit.sub)}</span>
        </div>
        <span class="msh-kind">${this.escapeHtml(hit.kind)}</span>
      `;
      btn.addEventListener('click', hit.run);
      this.elMenuSearchResults.appendChild(btn);
    });
  }

  syncSettingsUI() {
    const s = this.userSettings || this.getDefaultUserSettings();
    const isCodeLab = this.currentMode === 'practice_code';
    const zonesOn = Boolean(s.showZoneColors);
    const heatmapOn = Boolean(s.heatmapEnabled);
    const opacityVal = Number(s.handOpacity);
    const opacityPct = Math.round(opacityVal * 100);
    const soundProf = s.soundProfile || 'thock';
    const codelabWide = Boolean(this.codeLab.keyboardHidden);
    const generalHidden = Boolean(s.generalKbdHidden);
    const effectiveLang = isCodeLab ? (s.lang || this._nonCodeLang || 'ko') : this.lang;
    const soundShortMap = {
      thock: '도각',
      tactile: '갈축',
      linear: '적축',
      clicky: '청축',
      mute: '무음'
    };

    const syncQuickTileSet = (zonesTile, zonesSub, wideTile, wideTitle, wideSub, heatTile, heatSub, langTile, langSub) => {
      if (zonesTile) {
        zonesTile.classList.toggle('is-active-teal', zonesOn);
        zonesTile.setAttribute('aria-pressed', String(zonesOn));
      }
      if (zonesSub) zonesSub.textContent = zonesOn ? '켜짐 · 구역 컬러' : '꺼짐';

      if (wideTile) {
        if (isCodeLab) {
          wideTile.classList.toggle('is-active-teal', codelabWide);
          wideTile.setAttribute('aria-pressed', String(codelabWide));
          if (wideTitle) wideTitle.textContent = '넓게 보기';
          if (wideSub) wideSub.textContent = codelabWide ? '2.1× 집중 모드 ON' : '기본 (키보드 표시)';
        } else {
          wideTile.classList.toggle('is-active-teal', !generalHidden);
          wideTile.setAttribute('aria-pressed', String(!generalHidden));
          if (wideTitle) wideTitle.textContent = '가상 키보드';
          if (wideSub) wideSub.textContent = generalHidden ? '숨김 (집중)' : '표시 중';
        }
      }

      if (heatTile) {
        heatTile.classList.toggle('is-active-orange', heatmapOn);
        heatTile.setAttribute('aria-pressed', String(heatmapOn));
      }
      if (heatSub) heatSub.textContent = heatmapOn ? '켜짐 · 키캡 오버레이' : '꺼짐';

      if (langTile) {
        langTile.classList.toggle('is-active-orange', !isCodeLab);
        langTile.classList.toggle('is-muted-note', isCodeLab);
      }
      if (langSub) {
        if (isCodeLab) {
          langSub.textContent = `EN 고정 (일반: ${effectiveLang === 'ko' ? '한글' : 'EN'})`;
        } else {
          langSub.textContent = effectiveLang === 'ko' ? '한글 두벌식' : '영문 QWERTY';
        }
      }
    };

    // 1) 상단 우측 빠른 설정 팝오버 동기화
    syncQuickTileSet(
      this.elPopTileZones, this.elPopTileZonesSub,
      this.elPopTileWide, this.elPopTileWideTitle, this.elPopTileWideSub,
      this.elPopTileHeatmap, this.elPopTileHeatmapSub,
      this.elPopTileLang, this.elPopTileLangSub
    );

    // 2) 통합 메뉴 우측 퀵 설정 독 (안 C) 동기화
    syncQuickTileSet(
      this.elDockTileZones, this.elDockTileZonesSub,
      this.elDockTileWide, this.elDockTileWideTitle, this.elDockTileWideSub,
      this.elDockTileHeatmap, this.elDockTileHeatmapSub,
      this.elDockTileLang, this.elDockTileLangSub
    );

    // 3) 투명도 슬라이더 3곳 동기화
    [
      [this.elPopOpacitySlider, this.elPopOpacityVal],
      [this.elDockOpacitySlider, this.elDockOpacityVal],
      [this.elHubOpacitySlider, this.elHubOpacityVal]
    ].forEach(([sl, labelEl]) => {
      if (sl) sl.value = String(opacityVal);
      if (labelEl) labelEl.textContent = `${opacityPct}%`;
    });

    // 4) 타건음 버튼/카드 동기화
    [this.elPopSoundBtns, this.elDockSoundBtns, this.elHubSoundCards].forEach(group => {
      if (!group) return;
      group.forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-sound') === soundProf);
      });
    });

    if (this.elPopExplainBtn) this.elPopExplainBtn.style.display = isCodeLab ? 'inline-flex' : 'none';
    if (this.elDockExplainBtn) this.elDockExplainBtn.style.display = isCodeLab ? 'inline-flex' : 'none';

    if (this.elSettingsSummary) {
      const langBadge = isCodeLab ? 'EN 고정' : (effectiveLang === 'ko' ? '한글' : 'EN');
      this.elSettingsSummary.textContent = `${langBadge} · ${soundShortMap[soundProf] || '도각'} · ${opacityPct}%${heatmapOn ? ' · 히트맵' : ''}`;
    }

    if (this.elTelemetryHeatmapBtn) {
      this.elTelemetryHeatmapBtn.classList.toggle('active', heatmapOn);
      this.elTelemetryHeatmapBtn.setAttribute('aria-pressed', String(heatmapOn));
    }

    if (this.elHubLangKo) this.elHubLangKo.classList.toggle('active', effectiveLang === 'ko');
    if (this.elHubLangEn) this.elHubLangEn.classList.toggle('active', effectiveLang === 'en');
    if (this.elHubToggleZones) this.elHubToggleZones.checked = zonesOn;
    if (this.elHubToggleHeatmap) this.elHubToggleHeatmap.checked = heatmapOn;
    if (this.elHubWideOff) this.elHubWideOff.classList.toggle('active', !codelabWide);
    if (this.elHubWideOn) this.elHubWideOn.classList.toggle('active', codelabWide);

    if ((this.elHubProgressText || this.elMenuCodeLabProgress) && window.CODE_CURRICULUM) {
      const lists = Object.values(window.CODE_CURRICULUM);
      let total = 0;
      let solved = 0;
      const solvedSet = this.codeLab.solvedLessons || new Set();
      lists.forEach(list => {
        if (!Array.isArray(list)) return;
        list.forEach(lesson => {
          total++;
          if (solvedSet.has(lesson.id)) solved++;
        });
      });
      if (this.elHubProgressText) this.elHubProgressText.textContent = `현재 완료한 레슨: ${solved} / ${total}`;
      if (this.elMenuCodeLabProgress) this.elMenuCodeLabProgress.textContent = `완료 ${solved} / ${total}`;
    }
  }

  // =========================================================================
  // 5. KeyReflex CodeLab: 실시간 실행형 알고리즘 & 3대 언어 마스터리 엔진
  // =========================================================================

  isCodeLabModalOpen() {
    return Boolean(
      this.elCodeModalOverlay &&
      this.elCodeModalOverlay.style.display &&
      this.elCodeModalOverlay.style.display !== 'none'
    );
  }

  loadCodeLabProgress() {
    try {
      const raw = localStorage.getItem('typing_reflex_codelab_solved_v1');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (_) {
      // ignore storage errors
    }
    return new Set();
  }

  saveCodeLabProgress() {
    try {
      localStorage.setItem(
        'typing_reflex_codelab_solved_v1',
        JSON.stringify(Array.from(this.codeLab.solvedLessons))
      );
    } catch (_) {
      // ignore storage errors
    }
  }

  markCodeLabLessonSolved(lessonId) {
    if (!lessonId) return;
    if (!this.codeLab.solvedLessons.has(lessonId)) {
      this.codeLab.solvedLessons.add(lessonId);
      this.saveCodeLabProgress();
      this.populateCodeLabProblems();
    }
    this.updateCodeLabProgressUI();
  }

  isEditableCodeMode() {
    return this.codeLab.typeMode === 'sandbox' || this.codeLab.typeMode === 'audit';
  }

  loadCodeLabTrack() {
    try {
      const saved = localStorage.getItem('keyreflex_codelab_track_v1');
      if (['all', 'algorithm', 'architecture', 'refactoring', 'ai', 'system_design', 'spec'].includes(saved)) {
        return saved;
      }
    } catch (_) { /* ignore storage errors */ }
    return 'all';
  }

  saveCodeLabTrack() {
    try {
      localStorage.setItem('keyreflex_codelab_track_v1', this.codeLab.track);
    } catch (_) { /* ignore storage errors */ }
  }

  getLessonTrack(lesson) {
    if (!lesson) return 'algorithm';
    return lesson.track || 'algorithm';
  }

  getTrackMeta(track) {
    const map = {
      all: { key: 'all', label: '전체 트랙', shortLabel: '전체', icon: '' },
      algorithm: { key: 'algorithm', label: '알고리즘', shortLabel: '알고리즘', icon: '' },
      architecture: { key: 'architecture', label: '설계·아키텍처', shortLabel: '설계', icon: '' },
      refactoring: { key: 'refactoring', label: '리팩터링', shortLabel: '리팩터링', icon: '' },
      ai: { key: 'ai', label: 'AI·RAG 인프라', shortLabel: 'AI·RAG', icon: '' },
      system_design: { key: 'system_design', label: '시스템 설계·ADR', shortLabel: '시스템', icon: '' },
      spec: { key: 'spec', label: '스펙·다이어그램', shortLabel: '스펙', icon: '' }
    };
    return map[track] || map.all;
  }

  getLessonAuditData(lesson) {
    if (!lesson) return null;
    if (lesson.audit && lesson.audit.buggyCode) {
      return lesson.audit;
    }
    // 기본 AI 버그 변이 생성 폴백 (상한/비교 연산자 미세 결함)
    let buggy = (lesson.code || '').replace(/\r\n/g, '\n');
    let hint = '경계 비교 연산자(===, <=, >=) 또는 초기값에 미세 결함이 없는지 확인하세요.';
    if (buggy.includes('===')) {
      buggy = buggy.replace('===', '!==');
      hint = '동등 비교 연산자(=== / !==) 조건이 뒤집혀 있지 않은지 확인하세요.';
    } else if (buggy.includes('<=')) {
      buggy = buggy.replace('<=', '<');
      hint = '경계 등호(<=)가 빠져 엣지 케이스가 누락되지 않았는지 확인하세요.';
    } else if (buggy.includes('>=')) {
      buggy = buggy.replace('>=', '>');
      hint = '경계 등호(>=)가 빠져 경계값이 탈락하지 않는지 확인하세요.';
    } else if (buggy.includes('+= ')) {
      buggy = buggy.replace('+= ', '-= ');
      hint = '누적 부호 연산자(+= / -=) 방향이 올바른지 확인하세요.';
    } else if (buggy.includes('return ')) {
      const idx = buggy.lastIndexOf('return ');
      const end = buggy.indexOf('\n', idx);
      const line = end === -1 ? buggy.slice(idx) : buggy.slice(idx, end);
      buggy = buggy.slice(0, idx) + (line.includes(';') ? 'return null;' : 'return None') + (end === -1 ? '' : buggy.slice(end));
      hint = '마지막 return 반환문 표현식이 누락되었거나 변형되었습니다.';
    }
    return {
      bugSummary: `AI 초안에서 미묘한 로직 결함이 발견되었습니다. (${hint})`,
      checklist: [hint, '모든 테스트 케이스 통과 여부 검증'],
      buggyCode: buggy,
      focusLine: 1
    };
  }

  loadCodeLabDifficulty() {
    try {
      const saved = localStorage.getItem('keyreflex_codelab_difficulty_v1');
      if (['all', 'beginner', 'intermediate', 'advanced'].includes(saved)) {
        return saved;
      }
    } catch (_) { /* ignore storage errors */ }
    return 'all';
  }

  saveCodeLabDifficulty() {
    try {
      localStorage.setItem('keyreflex_codelab_difficulty_v1', this.codeLab.difficulty);
    } catch (_) { /* ignore storage errors */ }
  }

  getLessonDifficulty(lesson) {
    if (!lesson) return 'beginner';
    if (['beginner', 'intermediate', 'advanced'].includes(lesson.level)) {
      return lesson.level;
    }
    const t = Number(lesson.tier) || 1;
    if (t <= 1) return 'beginner';
    if (t <= 3) return 'intermediate';
    return 'advanced';
  }

  getDifficultyMeta(diff) {
    const map = {
      all: { key: 'all', label: '전체', icon: '' },
      beginner: { key: 'beginner', label: '초급', icon: '' },
      intermediate: { key: 'intermediate', label: '중급', icon: '' },
      advanced: { key: 'advanced', label: '고급', icon: '' }
    };
    return map[diff] || map.all;
  }

  formatTierBadgeLabel(lesson) {
    if (!lesson) return 'Tier 1';
    const meta = this.getDifficultyMeta(this.getLessonDifficulty(lesson));
    const tMeta = this.getTrackMeta(this.getLessonTrack(lesson));
    return `${meta.label} · T${lesson.tier} · ${tMeta.shortLabel}`;
  }

  getFilteredCodeLabLessons(lang = this.codeLab.lang, diff = this.codeLab.difficulty, track = this.codeLab.track) {
    const lessons = (window.CODE_CURRICULUM && window.CODE_CURRICULUM[lang]) || [];
    const results = [];
    lessons.forEach((lesson, originalIndex) => {
      const diffOk = diff === 'all' || this.getLessonDifficulty(lesson) === diff;
      const trackOk = track === 'all' || this.getLessonTrack(lesson) === track;
      if (diffOk && trackOk) {
        results.push({ lesson, originalIndex });
      }
    });
    return results;
  }

  syncCodeLabDifficultyButtons() {
    if (!this.elCodeDiffBtns) return;
    this.elCodeDiffBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-diff') === this.codeLab.difficulty);
    });
  }

  syncCodeLabLangButtons() {
    if (!this.elCodeLangBtns) return;
    this.elCodeLangBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-codelang') === this.codeLab.lang);
    });
  }

  syncCodeLabTrackSelect() {
    if (this.elCodeTrackSelect) {
      this.elCodeTrackSelect.value = this.codeLab.track || 'all';
    }
  }

  setCodeLabTrack(track) {
    if (!['all', 'algorithm', 'architecture', 'refactoring', 'ai', 'system_design', 'spec'].includes(track)) return;
    this.codeLab.track = track;
    this.saveCodeLabTrack();
    this.syncCodeLabTrackSelect();

    let filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, this.codeLab.difficulty, track);
    if (filtered.length === 0) {
      const langs = ['javascript', 'python', 'c', 'spec'];
      const matchLang = langs.find(l => this.getFilteredCodeLabLessons(l, this.codeLab.difficulty, track).length > 0)
        || langs.find(l => this.getFilteredCodeLabLessons(l, 'all', track).length > 0);
      if (matchLang) {
        this.codeLab.lang = matchLang;
        this.syncCodeLabLangButtons();
        this.updatePyodideStatusBadge(this.codeRunner.pyodideStatus);
        filtered = this.getFilteredCodeLabLessons(matchLang, this.codeLab.difficulty, track);
      }
      if (filtered.length === 0 && this.codeLab.difficulty !== 'all') {
        this.codeLab.difficulty = 'all';
        this.saveCodeLabDifficulty();
        this.syncCodeLabDifficultyButtons();
        filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, 'all', track);
      }
    }

    this.populateCodeLabProblems();
    this.updateCodeLabProgressUI();

    const hasCurrent = filtered.some(item => item.originalIndex === this.codeLab.lessonIndex);
    const targetIdx = hasCurrent
      ? this.codeLab.lessonIndex
      : (filtered.length > 0 ? filtered[0].originalIndex : 0);

    if (this.elCodeProblemSelect) this.elCodeProblemSelect.value = String(targetIdx);
    this.loadCodeLabLesson(this.codeLab.lang, targetIdx);
  }

  setCodeLabDifficulty(diff) {
    if (!['all', 'beginner', 'intermediate', 'advanced'].includes(diff)) return;
    this.codeLab.difficulty = diff;
    this.saveCodeLabDifficulty();
    this.syncCodeLabDifficultyButtons();
    this.populateCodeLabProblems();
    this.updateCodeLabProgressUI();

    let filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, diff, this.codeLab.track);
    if (filtered.length === 0 && this.codeLab.track !== 'all') {
      // 해당 언어+트랙 조합이 해당 난이도에 없으면 전체 트랙으로 부드럽게 확장
      this.codeLab.track = 'all';
      this.saveCodeLabTrack();
      this.syncCodeLabTrackSelect();
      this.populateCodeLabProblems();
      this.updateCodeLabProgressUI();
      filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, diff, 'all');
    }

    const hasCurrent = filtered.some(item => item.originalIndex === this.codeLab.lessonIndex);
    const targetIdx = hasCurrent
      ? this.codeLab.lessonIndex
      : (filtered.length > 0 ? filtered[0].originalIndex : 0);

    if (this.elCodeProblemSelect) this.elCodeProblemSelect.value = String(targetIdx);
    this.loadCodeLabLesson(this.codeLab.lang, targetIdx);

    if (!this.isAnyModalBlockingTyping()) {
      if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
        setTimeout(() => this.elCodeSandboxTextarea.focus(), 60);
      } else if (this.elCodeHiddenInput) {
        setTimeout(() => this.elCodeHiddenInput.focus(), 60);
      }
    }
  }

  updateCodeLabProgressUI() {
    if (!this.elCodeProgressPill || !window.CODE_CURRICULUM) return;
    const allLists = Object.values(window.CODE_CURRICULUM);
    let allTotal = 0;
    let allSolved = 0;
    let filteredTotal = 0;
    let filteredSolved = 0;
    const diff = this.codeLab.difficulty || 'all';
    const track = this.codeLab.track || 'all';
    const solvedSet = this.codeLab.solvedLessons || new Set();

    allLists.forEach(list => {
      if (!Array.isArray(list)) return;
      list.forEach(lesson => {
        allTotal++;
        const isSolved = solvedSet.has(lesson.id);
        if (isSolved) allSolved++;
        const diffOk = diff === 'all' || this.getLessonDifficulty(lesson) === diff;
        const trackOk = track === 'all' || this.getLessonTrack(lesson) === track;
        if (diffOk && trackOk) {
          filteredTotal++;
          if (isSolved) filteredSolved++;
        }
      });
    });

    if (diff === 'all' && track === 'all') {
      this.elCodeProgressPill.textContent = `완료 ${allSolved}/${allTotal}`;
      this.elCodeProgressPill.title = '테스트 케이스를 모두 통과한 전체 문제 수';
    } else {
      const parts = [];
      if (track !== 'all') parts.push(this.getTrackMeta(track).shortLabel);
      if (diff !== 'all') parts.push(this.getDifficultyMeta(diff).label);
      this.elCodeProgressPill.textContent = `${parts.join('·')} ${filteredSolved}/${filteredTotal}`;
      this.elCodeProgressPill.title = `선택 필터 완료 수 (전체 ${allSolved}/${allTotal})`;
    }
    if (this.elHubProgressText) {
      this.elHubProgressText.textContent = `현재 완료한 레슨: ${allSolved} / ${allTotal}`;
    }
  }

  startCodeLabMode() {
    this.syncCodeLabLangButtons();
    this.syncCodeLabTrackSelect();
    this.syncCodeLabDifficultyButtons();
    this.populateCodeLabProblems();
    this.updateCodeLabProgressUI();

    const filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, this.codeLab.difficulty, this.codeLab.track);
    const hasCurrent = filtered.some(item => item.originalIndex === this.codeLab.lessonIndex);
    const initialIdx = hasCurrent
      ? this.codeLab.lessonIndex
      : (filtered.length > 0 ? filtered[0].originalIndex : 0);

    this.loadCodeLabLesson(this.codeLab.lang, initialIdx);
    if (!this.isAnyModalBlockingTyping()) {
      if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
        setTimeout(() => this.elCodeSandboxTextarea.focus(), 80);
      } else if (this.elCodeHiddenInput) {
        setTimeout(() => this.elCodeHiddenInput.focus(), 80);
      }
    }
  }

  populateCodeLabProblems() {
    if (!window.CODE_CURRICULUM) return;
    const filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, this.codeLab.difficulty, this.codeLab.track);

    if (this.elCodeProblemSelect) {
      this.elCodeProblemSelect.innerHTML = '';

      const tiers = {
        1: '초급 · Tier 1: 문법 · 기초 계약',
        2: '중급 · Tier 2: 자료구조 · AI 처리',
        3: '중급 · Tier 3: 알고리즘 · 아키텍처',
        4: '고급 · Tier 4: 시스템 설계 · 복원력 패턴'
      };

      const grouped = {};
      filtered.forEach(({ lesson, originalIndex }) => {
        if (!grouped[lesson.tier]) grouped[lesson.tier] = [];
        grouped[lesson.tier].push({ ...lesson, index: originalIndex });
      });

      Object.keys(grouped).sort().forEach(tierNum => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = tiers[tierNum] || `Tier ${tierNum}`;
        grouped[tierNum].forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.index;
          const solvedMark = this.codeLab.solvedLessons.has(item.id) ? '[완료] ' : '';
          const tMeta = this.getTrackMeta(this.getLessonTrack(item));
          opt.textContent = `${solvedMark}[${tMeta.shortLabel}·T${item.tier}] ${item.title}`;
          if (item.index === this.codeLab.lessonIndex) opt.selected = true;
          optGroup.appendChild(opt);
        });
        this.elCodeProblemSelect.appendChild(optGroup);
      });
    }

    this.renderMenuCodeLabCourseGrid();
  }

  setCodeLabLanguage(lang) {
    if (!['javascript', 'python', 'c', 'spec'].includes(lang)) return;
    this.codeLab.lang = lang;
    this.syncCodeLabLangButtons();

    if (lang === 'spec' && this.codeLab.track !== 'all' && this.codeLab.track !== 'spec') {
      this.codeLab.track = 'all';
      this.saveCodeLabTrack();
      this.syncCodeLabTrackSelect();
    } else if (lang !== 'spec' && this.codeLab.track === 'spec') {
      this.codeLab.track = 'all';
      this.saveCodeLabTrack();
      this.syncCodeLabTrackSelect();
    }

    let filtered = this.getFilteredCodeLabLessons(lang, this.codeLab.difficulty, this.codeLab.track);
    if (filtered.length === 0 && this.codeLab.track !== 'all') {
      this.codeLab.track = 'all';
      this.saveCodeLabTrack();
      this.syncCodeLabTrackSelect();
      filtered = this.getFilteredCodeLabLessons(lang, this.codeLab.difficulty, 'all');
    }
    if (filtered.length === 0 && this.codeLab.difficulty !== 'all') {
      this.codeLab.difficulty = 'all';
      this.saveCodeLabDifficulty();
      this.syncCodeLabDifficultyButtons();
      filtered = this.getFilteredCodeLabLessons(lang, 'all', this.codeLab.track);
    }

    this.updatePyodideStatusBadge(this.codeRunner.pyodideStatus);
    this.populateCodeLabProblems();
    this.updateCodeLabProgressUI();

    const firstIdx = filtered.length > 0 ? filtered[0].originalIndex : 0;
    this.codeLab.lessonIndex = firstIdx;
    if (this.elCodeProblemSelect) this.elCodeProblemSelect.value = String(firstIdx);
    this.loadCodeLabLesson(lang, firstIdx);
  }

  setCodeLabTypeMode(typeMode, customCode = null) {
    if (!['flow', 'skeleton', 'sandbox', 'audit'].includes(typeMode)) return;
    this.codeLab.typeMode = typeMode;

    if (this.elCodeTypeModeBtns) {
      this.elCodeTypeModeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-typemode') === typeMode);
      });
    }

    this.loadCodeLabLesson(this.codeLab.lang, this.codeLab.lessonIndex, customCode);
  }

  toggleCodeLabSkeletonHint() {
    if (this.codeLab.typeMode !== 'skeleton') return;
    this.codeLab.showSkeletonHint = !this.codeLab.showSkeletonHint;
    if (this.elCodeHintBtn) {
      this.elCodeHintBtn.classList.toggle('active', this.codeLab.showSkeletonHint);
      this.elCodeHintBtn.textContent = this.codeLab.showSkeletonHint ? '🙈 힌트 숨기기' : '👁️ 빈칸 힌트';
    }
    this.renderCodeLabEditor();
    if (this.elCodeHiddenInput) this.elCodeHiddenInput.focus();
  }

  buildSkeletonModel(fullCode, skeletonCode) {
    const cLines = fullCode.replace(/\r\n/g, '\n').split('\n');
    const sLines = (skeletonCode || fullCode).replace(/\r\n/g, '\n').split('\n');
    const rawSegments = [];
    const blanks = [];

    for (let i = 0; i < sLines.length; i++) {
      const sLine = sLines[i];
      const cLine = cLines[i] !== undefined ? cLines[i] : sLine;
      const eol = i < sLines.length - 1 ? '\n' : '';

      if (!sLine.includes('____')) {
        rawSegments.push({ type: 'static', text: sLine + eol });
        continue;
      }

      const parts = sLine.split('____');
      let searchPos = 0;

      for (let p = 0; p < parts.length - 1; p++) {
        const prefix = parts[p];
        const foundAt = cLine.indexOf(prefix, searchPos);
        const ansStart = foundAt !== -1 ? foundAt + prefix.length : searchPos;
        const nextPart = parts[p + 1];
        const isLastBlank = p === parts.length - 2;

        let ansEnd = cLine.length;
        if (nextPart !== '') {
          const nextIdx = isLastBlank
            ? cLine.lastIndexOf(nextPart)
            : cLine.indexOf(nextPart, ansStart);
          if (nextIdx >= ansStart) ansEnd = nextIdx;
        }

        if (prefix.length > 0) {
          rawSegments.push({ type: 'static', text: prefix });
        }

        const blank = {
          id: blanks.length,
          expected: cLine.slice(ansStart, ansEnd),
          userText: '',
          lineNum: i + 1
        };
        blanks.push(blank);
        rawSegments.push({ type: 'blank', blank });
        searchPos = ansEnd;
      }

      const tail = parts[parts.length - 1] + eol;
      if (tail.length > 0) {
        rawSegments.push({ type: 'static', text: tail });
      }
    }

    // 인접한 정적 세그먼트 병합
    const segments = [];
    for (const seg of rawSegments) {
      const prev = segments[segments.length - 1];
      if (seg.type === 'static' && prev && prev.type === 'static') {
        prev.text += seg.text;
      } else {
        segments.push(seg);
      }
    }

    return { segments, blanks };
  }

  reconstructSkeletonCode() {
    const model = this.codeLab.skeletonModel;
    if (!model) return { code: this.codeLab.fullText, missingBlankIdx: -1 };

    let missingBlankIdx = -1;
    const code = model.segments.map(seg => {
      if (seg.type === 'static') return seg.text;
      if (seg.blank.userText.length === 0 && missingBlankIdx === -1) {
        missingBlankIdx = seg.blank.id;
      }
      return seg.blank.userText.length > 0 ? seg.blank.userText : '____';
    }).join('');

    return { code, missingBlankIdx };
  }

  loadCodeLabLesson(lang, index, customSandboxCode = null) {
    const list = window.CODE_CURRICULUM[lang] || [];
    if (!list[index]) index = 0;
    this.codeLab.lessonIndex = index;
    const lesson = list[index];
    this.codeLab.currentLesson = lesson;
    this.updatePyodideStatusBadge(this.codeRunner.pyodideStatus);

    const filenames = {
      javascript: 'solution.js',
      python: 'solution.py',
      c: 'solution.c',
      spec: lesson.specKind === 'diagram' ? 'architecture.mmd' : 'contract.schema.json'
    };
    if (this.elCodeFilename) {
      this.elCodeFilename.textContent = filenames[lang] || 'solution.txt';
    }

    clearTimeout(this.codeLab._wrongTimer);
    this.codeLab.lastWrongIdx = null;
    this.codeLab.showSkeletonHint = false;
    this.codeLab.fullText = lesson.code.replace(/\r\n/g, '\n');

    const isAudit = this.codeLab.typeMode === 'audit';
    const isSandbox = this.codeLab.typeMode === 'sandbox';
    const isEditable = this.isEditableCodeMode();
    const isSkeleton = this.codeLab.typeMode === 'skeleton';
    const auditData = isAudit ? this.getLessonAuditData(lesson) : null;

    this.codeLab.sandboxText = typeof customSandboxCode === 'string'
      ? customSandboxCode.replace(/\r\n/g, '\n')
      : (auditData ? auditData.buggyCode.replace(/\r\n/g, '\n') : this.codeLab.fullText);
    this.codeLab.cursorIdx = 0;
    this.codeLab.startTime = null;
    this.codeLab.totalStrokes = 0;
    this.codeLab.correctStrokes = 0;
    this.codeLab.activeBlankIdx = 0;
    this.codeLab._lastSyncedLine = null;
    this.combo = 0;
    this.lastStrokeTime = 0;

    if (this.elCodeEditorPanel) {
      this.elCodeEditorPanel.classList.toggle('is-sandbox-mode', isEditable);
      this.elCodeEditorPanel.classList.toggle('is-audit-mode', isAudit);
    }
    if (this.elCodeContent) {
      this.elCodeContent.style.display = isEditable ? 'none' : '';
    }
    if (this.elCodeSandboxWrap) {
      this.elCodeSandboxWrap.style.display = isEditable ? 'block' : 'none';
    }
    if (this.elCodeSandboxTextarea) {
      this.elCodeSandboxTextarea.style.display = isEditable ? 'block' : 'none';
      if (isEditable) this.elCodeSandboxTextarea.value = this.codeLab.sandboxText;
    }
    if (this.elCodeHiddenInput) {
      this.elCodeHiddenInput.style.display = isEditable ? 'none' : '';
    }
    if (this.elCodeSandboxResetBtn) {
      this.elCodeSandboxResetBtn.style.display = isEditable ? 'inline-flex' : 'none';
      this.elCodeSandboxResetBtn.textContent = isAudit ? '↺ 버그 복원' : '↺ 원본 복원';
    }

    if (this.elCodeAuditBanner) {
      this.elCodeAuditBanner.style.display = isAudit && auditData ? 'flex' : 'none';
      if (isAudit && auditData) {
        if (this.elCodeAuditSummary) this.elCodeAuditSummary.textContent = auditData.bugSummary;
        if (this.elCodeAuditChecklist) {
          this.elCodeAuditChecklist.style.display = 'none';
          this.elCodeAuditChecklist.innerHTML = (auditData.checklist || [])
            .map(c => `<span class="audit-check-chip">✓ ${this.escapeHtml(c)}</span>`)
            .join('');
        }
        if (this.elCodeAuditHintBtn) this.elCodeAuditHintBtn.classList.remove('active');
      }
    }

    if (isSkeleton) {
      this.codeLab.skeletonModel = this.buildSkeletonModel(lesson.code, lesson.skeleton);
      if (this.elCodeHintBtn) {
        this.elCodeHintBtn.style.display = 'inline-flex';
        this.elCodeHintBtn.classList.remove('active');
        this.elCodeHintBtn.textContent = '👁️ 빈칸 힌트';
      }
      if (this.elCodeEditorModeHint) {
        this.elCodeEditorModeHint.textContent = '💡 빈칸에 로직 직접 입력 · Tab/Enter: 다음 빈칸 · F2: 힌트 · 실행: Ctrl+Enter';
      }
    } else if (isAudit) {
      this.codeLab.skeletonModel = null;
      if (this.elCodeHintBtn) this.elCodeHintBtn.style.display = 'none';
      if (this.elCodeEditorModeHint) {
        this.elCodeEditorModeHint.textContent = '🔍 AI 코드 리뷰: 버그 줄만 수정 후 Ctrl+Enter로 실패 테스트 해결';
      }
    } else if (isSandbox) {
      this.codeLab.skeletonModel = null;
      if (this.elCodeHintBtn) this.elCodeHintBtn.style.display = 'none';
      if (this.elCodeEditorModeHint) {
        this.elCodeEditorModeHint.textContent = '🛠️ 자유 수정: 코드 변형·리팩터링 · Tab: 4칸 들여쓰기 · 채점: Ctrl+Enter';
      }
    } else {
      this.codeLab.skeletonModel = null;
      if (this.elCodeHintBtn) this.elCodeHintBtn.style.display = 'none';
      if (this.elCodeEditorModeHint) {
        this.elCodeEditorModeHint.textContent = '💡 줄바꿈: Enter · 들여쓰기: Tab · 실행: Ctrl+Enter';
      }
    }

    if (this.elCodeImeBanner) this.elCodeImeBanner.style.display = 'none';
    if (this.elMetricCombo) this.elMetricCombo.textContent = '0';

    // 문제 설명 카드 렌더링
    if (this.elCodeTierBadge) {
      this.elCodeTierBadge.textContent = this.formatTierBadgeLabel(lesson);
      this.applyTierBadgeClass(this.elCodeTierBadge, 'tier-pill', lesson.tier);
    }
    if (this.elCodeProblemTitle) this.elCodeProblemTitle.textContent = lesson.title;
    if (this.elCodeComplexityBadge) {
      this.elCodeComplexityBadge.textContent = `${lesson.complexity.time} | ${lesson.complexity.space}`;
    }
    if (this.elCodeProblemDesc) this.elCodeProblemDesc.textContent = lesson.description;

    // AI 시대 확장 카드 (ADR / Before-After 리팩터링 / Live SVG 다이어그램)
    this.renderCodeLabSpecialCards(lesson);

    // 테스트 케이스 목록 렌더링
    this.renderCodeLabTestsList(lesson.tests);
    if (this.elCodeTestsSummary) {
      this.elCodeTestsSummary.className = 'tests-summary-badge';
      this.elCodeTestsSummary.textContent = '대기 중 ⏳';
    }
    this.updateCodeLabTestStatusIndicators('', '대기', '⏳ 테스트 대기 중');
    if (this.elCodeConsoleOutput) {
      this.elCodeConsoleOutput.className = 'console-output';
      this.elCodeConsoleOutput.innerHTML = isAudit
        ? '<span class="console-placeholder">> AI가 작성한 결함 코드입니다. [▶ 코드 실행] 또는 수정 후 Ctrl+Enter로 버그를 검증하세요.</span>'
        : isSandbox
          ? '<span class="console-placeholder">> 코드를 자유롭게 수정한 뒤 [▶ 코드 실행] 또는 Ctrl+Enter로 검증하세요.</span>'
          : '<span class="console-placeholder">> 코드를 타이핑 완료하거나 [코드 실행]을 누르면 결과가 출력됩니다.</span>';
    }
    if (this.elCodeExecTime) this.elCodeExecTime.textContent = '실행 시간: -- ms';

    // 상세 해설 렌더링
    this.renderCodeLabExplanation(lesson);

    // 에디터 렌더링
    this.renderCodeLabEditor();
    this.updateCodeLabTargetGuidance();
    this.updateCodeLabMetricsUI();
    this.updateCodeLabLineHint();

    // AI 리뷰 모드 진입 시 즉시 실패 테스트를 시각화해 버그 사냥 유도 (Python은 Pyodide 준비 시)
    if (isAudit && (lang !== 'python' || this.codeRunner.pyodideStatus === 'ready')) {
      setTimeout(() => {
        if (this.codeLab.currentLesson === lesson && this.codeLab.typeMode === 'audit') {
          this.executeCodeLabTests();
        }
      }, 30);
    }

    this.renderMenuCodeLabCourseGrid();
    this.updateStudioBreadcrumb();

    if (!this.isAnyModalBlockingTyping()) {
      if (isEditable && this.elCodeSandboxTextarea) {
        this.elCodeSandboxTextarea.focus();
      } else if (this.elCodeHiddenInput) {
        this.elCodeHiddenInput.value = '';
        this.elCodeHiddenInput.focus();
      }
    }
  }

  renderCodeLabSpecialCards(lesson) {
    // 1. ADR 트레이드오프 의사결정 위젯
    if (this.elCodeAdrCard) {
      if (lesson && lesson.adr && Array.isArray(lesson.adr.options)) {
        this.elCodeAdrCard.style.display = 'flex';
        const adr = lesson.adr;
        const optionsHtml = adr.options.map((opt, idx) => `
          <button type="button" class="adr-option-btn" data-adr-idx="${idx}">${this.escapeHtml(opt.label)}</button>
        `).join('');
        this.elCodeAdrCard.innerHTML = `
          <div class="adr-title-row">
            <span>⚖️ 시스템 설계 판단 (ADR)</span>
            <span style="display:inline-flex; align-items:center; gap:6px;">
              <span style="color:#94a3b8; font-weight:600;">트레이드오프 선택</span>
              <button type="button" class="special-card-fold-btn">접기</button>
            </span>
          </div>
          <div class="special-card-body">
            <p class="adr-scenario">${this.escapeHtml(adr.scenario)}<br/><strong>${this.escapeHtml(adr.prompt)}</strong></p>
            <div class="adr-options" style="margin-top:6px;">${optionsHtml}</div>
            <div class="adr-critique" id="codelab-adr-critique" style="display:none; margin-top:6px;"></div>
          </div>
        `;
        this.bindSpecialCardFold(this.elCodeAdrCard);
        const btns = this.elCodeAdrCard.querySelectorAll('.adr-option-btn');
        const critiqueBox = this.elCodeAdrCard.querySelector('#codelab-adr-critique');
        btns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const picked = adr.options[parseInt(btn.getAttribute('data-adr-idx'), 10)];
            btns.forEach(b => b.classList.remove('is-recommended', 'is-suboptimal'));
            btn.classList.add(picked.recommended ? 'is-recommended' : 'is-suboptimal');
            if (critiqueBox && picked) {
              critiqueBox.style.display = 'block';
              critiqueBox.innerHTML = `${picked.recommended ? '✅ ' : '⚠️ '}${this.escapeHtml(picked.critique)}`;
            }
          });
        });
      } else {
        this.elCodeAdrCard.style.display = 'none';
        this.elCodeAdrCard.innerHTML = '';
      }
    }

    // 2. 리팩터링 Before -> After 비교 카드
    if (this.elCodeRefactorCard) {
      if (lesson && lesson.refactoringBefore) {
        this.elCodeRefactorCard.style.display = 'flex';
        this.elCodeRefactorCard.innerHTML = `
          <div class="refactor-card-header">
            <span>🔄 Before: 기존 스파게티 레거시 코드</span>
            <button type="button" class="special-card-fold-btn">접기</button>
          </div>
          <div class="special-card-body">
            ${lesson.refactoringGoal ? `<div class="refactor-goal-text" style="margin-bottom:5px;">${this.escapeHtml(lesson.refactoringGoal)}</div>` : ''}
            <pre class="refactor-before-pre"><code>${this.buildHighlightedCodeHTML(lesson.refactoringBefore, this.codeLab.lang)}</code></pre>
          </div>
        `;
        this.bindSpecialCardFold(this.elCodeRefactorCard);
      } else {
        this.elCodeRefactorCard.style.display = 'none';
        this.elCodeRefactorCard.innerHTML = '';
      }
    }

    // 3. 실시간 아키텍처 다이어그램 SVG 프리뷰
    this.refreshCodeLabDiagramPreview();
  }

  getActiveDiagramSource() {
    const lesson = this.codeLab.currentLesson;
    if (!lesson) return '';
    if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
      return this.elCodeSandboxTextarea.value || '';
    }
    if (this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
      return this.codeLab.skeletonModel.segments
        .map(seg => seg.type === 'static' ? seg.text : (seg.blank.userText || '___'))
        .join('');
    }
    return lesson.code || '';
  }

  refreshCodeLabDiagramPreview() {
    if (!this.elCodeDiagramPreview || !this.elCodeDiagramCanvas) return;
    const lesson = this.codeLab.currentLesson;
    if (!lesson || lesson.specKind !== 'diagram' || !window.SpecEngine) {
      this.elCodeDiagramPreview.style.display = 'none';
      this.elCodeDiagramCanvas.innerHTML = '';
      return;
    }
    this.elCodeDiagramPreview.style.display = 'block';
    const src = this.getActiveDiagramSource();
    this.elCodeDiagramCanvas.innerHTML = window.SpecEngine.renderDiagramSVG(src);
  }

  renderCodeLabTestsList(tests) {
    if (!this.elCodeTestsList) return;
    this.elCodeTestsList.innerHTML = '';
    (tests || []).forEach((t, i) => {
      const item = document.createElement('div');
      item.className = 'test-case-item';
      item.id = `codelab-test-item-${i}`;

      const inStr = this.escapeHtml(JSON.stringify(t.input));
      const expStr = this.escapeHtml(JSON.stringify(t.expected));
      const testName = this.escapeHtml(t.name || `테스트 ${i + 1}`);

      item.innerHTML = `
        <div class="test-row-header">
          <span class="test-case-name">${testName}</span>
          <span class="test-case-badge" style="color:#94a3b8">대기 중</span>
        </div>
        <div class="test-case-details">
          <span>입력: <code>${inStr}</code></span>
          <span>기대값: <code>${expStr}</code></span>
        </div>
      `;
      this.elCodeTestsList.appendChild(item);
    });
  }

  renderCodeLabEditor() {
    if (!this.elCodeContent || !this.elCodeLineNumbers) return;
    if (this.isEditableCodeMode()) {
      this.syncSandboxGutter();
      return;
    }
    if (this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
      this.renderSkeletonEditor();
      this.refreshCodeLabDiagramPreview();
      return;
    }

    this.elCodeContent.innerHTML = '';
    this.elCodeLineNumbers.innerHTML = '';

    const tokenClasses = this.tokenizeCodeForDisplay(this.codeLab.fullText, this.codeLab.lang);
    const lines = this.codeLab.fullText.split('\n');
    let globalCharIdx = 0;

    lines.forEach((line, lineIdx) => {
      const numSpan = document.createElement('span');
      numSpan.textContent = String(lineIdx + 1);
      this.elCodeLineNumbers.appendChild(numSpan);

      const lineDiv = document.createElement('div');
      lineDiv.className = 'code-line';

      for (let c = 0; c < line.length; c++) {
        const charSpan = document.createElement('span');
        const ch = line[c];
        const tokCls = tokenClasses[globalCharIdx] || '';
        charSpan.className = 'code-char char-pending' + (tokCls ? ` ${tokCls}` : '');
        charSpan.setAttribute('data-idx', String(globalCharIdx));
        charSpan.textContent = ch === ' ' ? ' ' : ch;
        lineDiv.appendChild(charSpan);
        globalCharIdx++;
      }

      if (lineIdx < lines.length - 1) {
        const eolSpan = document.createElement('span');
        eolSpan.className = 'code-char char-pending char-eol';
        eolSpan.setAttribute('data-idx', String(globalCharIdx));
        eolSpan.textContent = '↵';
        lineDiv.appendChild(eolSpan);
        globalCharIdx++;
      }

      this.elCodeContent.appendChild(lineDiv);
    });

    this.updateCodeCharClasses();
  }

  renderSkeletonEditor() {
    const model = this.codeLab.skeletonModel;
    if (!model || !this.elCodeContent || !this.elCodeLineNumbers) return;

    this.elCodeContent.innerHTML = '';
    this.elCodeLineNumbers.innerHTML = '';

    const lineCount = this.codeLab.fullText.split('\n').length;
    for (let i = 1; i <= lineCount; i++) {
      const numSpan = document.createElement('span');
      numSpan.textContent = String(i);
      this.elCodeLineNumbers.appendChild(numSpan);
    }

    // 스켈레톤 정적 코드 시맨틱 토크나이징
    let synthStr = '';
    const segOffsets = [];
    model.segments.forEach((seg, sIdx) => {
      if (seg.type === 'static') {
        segOffsets[sIdx] = synthStr.length;
        synthStr += seg.text;
      } else {
        synthStr += ' __SKEL__ ';
      }
    });
    const skelTokens = this.tokenizeCodeForDisplay(synthStr, this.codeLab.lang);

    let curLineDiv = document.createElement('div');
    curLineDiv.className = 'code-line';
    this.elCodeContent.appendChild(curLineDiv);

    model.segments.forEach((seg, sIdx) => {
      if (seg.type === 'static') {
        const basePos = segOffsets[sIdx] || 0;
        for (let i = 0; i < seg.text.length; i++) {
          const ch = seg.text[i];
          if (ch === '\n') {
            curLineDiv = document.createElement('div');
            curLineDiv.className = 'code-line';
            this.elCodeContent.appendChild(curLineDiv);
          } else {
            const span = document.createElement('span');
            const tokCls = skelTokens[basePos + i] || '';
            span.className = 'code-char char-scaffold' + (tokCls ? ` ${tokCls}` : '');
            span.textContent = ch;
            curLineDiv.appendChild(span);
          }
        }
      } else {
        const b = seg.blank;
        const isActive = b.id === this.codeLab.activeBlankIdx;
        const isFilled = b.userText.length > 0;

        const blankEl = document.createElement('span');
        blankEl.className = 'blank-slot-pill'
          + (isActive ? ' active-blank' : '')
          + (isFilled ? ' filled-blank' : '');
        blankEl.setAttribute('data-blank-idx', String(b.id));
        blankEl.title = `빈칸 #${b.id + 1}: 클릭하여 입력`;

        if (isFilled) {
          const typedSpan = document.createElement('span');
          typedSpan.textContent = b.userText;
          blankEl.appendChild(typedSpan);
        } else {
          const dots = document.createElement('span');
          dots.className = 'blank-placeholder-dots';
          dots.textContent = isActive ? '' : '____';
          blankEl.appendChild(dots);
        }

        if (isActive) {
          const caret = document.createElement('span');
          caret.className = 'blank-cursor-caret';
          blankEl.appendChild(caret);

          if (this.codeLab.showSkeletonHint) {
            const ghost = document.createElement('span');
            ghost.className = 'blank-hint-ghost';
            if (b.expected.startsWith(b.userText)) {
              ghost.textContent = b.expected.slice(b.userText.length);
            } else {
              ghost.textContent = ` (정답: ${b.expected})`;
            }
            blankEl.appendChild(ghost);
          } else if (!isFilled) {
            const hintDots = document.createElement('span');
            hintDots.className = 'blank-placeholder-dots';
            hintDots.textContent = '____';
            blankEl.appendChild(hintDots);
          }
        }

        curLineDiv.appendChild(blankEl);
      }
    });

    const activePill = this.elCodeContent.querySelector('.blank-slot-pill.active-blank');
    if (activePill) {
      activePill.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    this.refreshCodeLabDiagramPreview();
  }

  updateCodeCharClasses() {
    if (!this.elCodeContent || this.codeLab.typeMode !== 'flow') return;
    const cur = this.codeLab.cursorIdx;
    const wrongIdx = this.codeLab.lastWrongIdx;
    const allChars = this.elCodeContent.querySelectorAll('.code-char');

    allChars.forEach(el => {
      const idx = parseInt(el.getAttribute('data-idx'), 10);
      el.classList.remove('char-current', 'char-correct', 'char-pending', 'char-incorrect');
      if (idx === wrongIdx) {
        el.classList.add('char-incorrect');
        return;
      }
      if (idx < cur) {
        el.classList.add('char-correct');
      } else if (idx === cur) {
        el.classList.add('char-current');
      } else {
        el.classList.add('char-pending');
      }
    });

    const activeEl = this.elCodeContent.querySelector(`[data-idx="${cur}"]`);
    if (activeEl && this.elCodeEditorPanel) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  syncSandboxGutter() {
    if (!this.elCodeLineNumbers || !this.elCodeSandboxTextarea) return;
    const text = this.elCodeSandboxTextarea.value || '';
    const lineCount = Math.max(1, text.split('\n').length);
    this.elCodeLineNumbers.innerHTML = '';
    for (let i = 1; i <= lineCount; i++) {
      const numSpan = document.createElement('span');
      numSpan.textContent = String(i);
      this.elCodeLineNumbers.appendChild(numSpan);
    }
    if (this.elCodeSandboxHighlight) {
      this.elCodeSandboxHighlight.innerHTML = this.buildHighlightedCodeHTML(text, this.codeLab.lang) + '\n';
      this.elCodeSandboxHighlight.scrollTop = this.elCodeSandboxTextarea.scrollTop;
      this.elCodeSandboxHighlight.scrollLeft = this.elCodeSandboxTextarea.scrollLeft;
    }
    this.elCodeLineNumbers.scrollTop = this.elCodeSandboxTextarea.scrollTop;
    this.refreshCodeLabDiagramPreview();
  }

  getExpectedCodeLabChar() {
    if (this.isEditableCodeMode()) return null;
    if (this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
      const b = this.codeLab.skeletonModel.blanks[this.codeLab.activeBlankIdx];
      if (!b) return null;
      if (b.userText.length < b.expected.length && b.expected.startsWith(b.userText)) {
        return b.expected[b.userText.length];
      }
      if (b.userText.length >= b.expected.length && b.userText === b.expected) {
        return '\n'; // 다음 빈칸 또는 실행 유도
      }
      return null;
    }

    const text = this.codeLab.fullText;
    const cur = this.codeLab.cursorIdx;
    return cur < text.length ? text[cur] : null;
  }

  resolveStrokeForChar(ch) {
    if (!ch) return null;
    if (ch === '\n') return { code: 'Enter', shift: false, label: 'Enter ↵' };
    if (ch === ' ') return { code: 'Space', shift: false, label: '스페이스바' };
    if (ch === '\t' || ch === 'Tab') return { code: 'Tab', shift: false, label: 'Tab' };
    if (window.CHAR_TO_KEY && window.CHAR_TO_KEY[ch]) {
      return { ...window.CHAR_TO_KEY[ch], label: ch };
    }
    return null;
  }

  updateCodeLabTargetGuidance() {
    const expectedChar = this.getExpectedCodeLabChar();
    const stroke = this.resolveStrokeForChar(expectedChar);

    if (stroke && window.KEY_MAP[stroke.code]) {
      const kData = window.KEY_MAP[stroke.code];
      this.targetKeyCode = stroke.code;
      this.targetShift = Boolean(stroke.shift);
      this.renderer.setTargetKey(stroke.code, this.targetShift);
      this.updateFingerBadge(kData.finger, stroke.label, this.targetShift);
    } else if (this.codeLab.typeMode === 'skeleton') {
      const model = this.codeLab.skeletonModel;
      const bIdx = this.codeLab.activeBlankIdx;
      const totalBlanks = model ? model.blanks.length : 0;
      const isLast = bIdx >= totalBlanks - 1;
      this.targetKeyCode = 'Enter';
      this.targetShift = false;
      this.renderer.setTargetKey('Enter', false);
      this.updateFingerBadge('R_PINKY', isLast ? 'Ctrl+Enter ▶ 실행' : `Enter (빈칸 #${bIdx + 1}/${totalBlanks})`, false);
    } else if (this.isEditableCodeMode()) {
      this.targetKeyCode = null;
      this.targetShift = false;
      this.renderer.clearTargets();
      if (this.elFingerGuideBadge) {
        const isAudit = this.codeLab.typeMode === 'audit';
        this.elFingerGuideBadge.innerHTML = isAudit
          ? `<span class="badge-dot" style="background:#f43f5e"></span>🔍 AI 코드 리뷰 — 결함이 있는 줄을 수정한 뒤 <strong>Ctrl+Enter</strong>로 버그를 해결하세요`
          : `<span class="badge-dot" style="background:#f97316"></span>🛠️ 자유 수정(Sandbox) — 코드를 자유롭게 변형·리팩터링하고 <strong>Ctrl+Enter</strong>로 테스트하세요`;
      }
    } else {
      this.targetKeyCode = null;
      this.targetShift = false;
      this.renderer.clearTargets();
      this.updateFingerBadge(null);
    }
  }

  recordCodeLabStroke(keyCode, isCorrect, symbolChar = null) {
    const now = performance.now();
    const deltaMs = this.lastStrokeTime > 0 ? Math.round(now - this.lastStrokeTime) : null;
    this.lastStrokeTime = now;

    if (window.soundEngine) window.soundEngine.playKey(isCorrect);
    if (keyCode) {
      this.renderer.triggerKeyPress(keyCode, isCorrect);
    }

    if (isCorrect) {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      if (this.elMetricCombo) this.elMetricCombo.textContent = String(this.combo);

      const validReactionMs = (deltaMs !== null && deltaMs >= 15 && deltaMs < 5000) ? deltaMs : null;
      if (validReactionMs !== null && this.elMetricReaction) {
        this.elMetricReaction.textContent = `${validReactionMs} ms`;
      }
      if (keyCode || symbolChar) {
        this.recordKeyAndFingerStat(keyCode, validReactionMs, true, symbolChar);
      }
    } else {
      this.combo = 0;
      if (this.elMetricCombo) this.elMetricCombo.textContent = '0';
      if (keyCode || symbolChar) {
        this.recordKeyAndFingerStat(keyCode, null, false, symbolChar);
      }
    }
  }

  processCodeLabTextChunk(val) {
    if (!val) return;
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(val)) {
      if (this.elCodeImeBanner) this.elCodeImeBanner.style.display = 'flex';
      if (window.soundEngine) window.soundEngine.playKey(false);
      return;
    }

    if (this.elCodeImeBanner) this.elCodeImeBanner.style.display = 'none';
    for (let i = 0; i < val.length; i++) {
      this.handleCodeLabInputKey(val[i]);
    }
  }

  handleCodeLabInputKey(ch) {
    if (this.currentMode !== 'practice_code' || this.isAnyModalBlockingTyping()) return;

    if (this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
      this.handleCodeLabSkeletonInputKey(ch);
      return;
    }

    const text = this.codeLab.fullText;
    const cur = this.codeLab.cursorIdx;
    if (cur >= text.length) return;

    if (!this.codeLab.startTime) {
      this.codeLab.startTime = performance.now();
    }

    this.codeLab.totalStrokes++;
    const targetChar = text[cur];

    // 공백 4칸 들여쓰기 Tab 스킵 처리
    if (ch === 'Tab' && text.substring(cur, cur + 4) === '    ') {
      this.codeLab.cursorIdx += 4;
      this.codeLab.correctStrokes += 4;
      this.codeLab.lastWrongIdx = null;
      this.recordCodeLabStroke('Tab', true);
      this.updateCodeCharClasses();
      this.updateCodeLabTargetGuidance();
      this.updateCodeLabMetricsUI();
      this.updateCodeLabLineHint();
      return;
    }

    const targetStroke = this.resolveStrokeForChar(targetChar);
    const isCorrect = ch === targetChar;

    if (isCorrect) {
      clearTimeout(this.codeLab._wrongTimer);
      this.codeLab.lastWrongIdx = null;
      this.codeLab.cursorIdx++;
      this.codeLab.correctStrokes++;
      this.recordCodeLabStroke(targetStroke ? targetStroke.code : null, true, targetChar);
    } else {
      const pressedStroke = this.resolveStrokeForChar(ch);
      this.recordCodeLabStroke(pressedStroke ? pressedStroke.code : (targetStroke ? targetStroke.code : null), false, targetChar);
      clearTimeout(this.codeLab._wrongTimer);
      this.codeLab.lastWrongIdx = cur;
      this.codeLab._wrongTimer = setTimeout(() => {
        this.codeLab.lastWrongIdx = null;
        this.updateCodeCharClasses();
      }, 340);
    }

    this.updateCodeCharClasses();
    this.updateCodeLabTargetGuidance();
    this.updateCodeLabMetricsUI();
    this.updateCodeLabLineHint();

    if (this.codeLab.cursorIdx >= text.length) {
      setTimeout(() => this.executeCodeLabTests(), 180);
    }
  }

  handleCodeLabSkeletonInputKey(ch) {
    const model = this.codeLab.skeletonModel;
    const blanks = model ? model.blanks : [];
    const activeBlank = blanks[this.codeLab.activeBlankIdx];
    if (!activeBlank) return;

    if (!this.codeLab.startTime) {
      this.codeLab.startTime = performance.now();
    }

    // Tab: 다음 빈칸으로 순환 이동
    if (ch === 'Tab') {
      if (blanks.length > 1) {
        this.codeLab.activeBlankIdx = (this.codeLab.activeBlankIdx + 1) % blanks.length;
      }
      this.recordCodeLabStroke('Tab', true);
      this.renderSkeletonEditor();
      this.updateCodeLabTargetGuidance();
      this.updateCodeLabLineHint();
      return;
    }

    // Enter: 다음 미완성 빈칸으로 이동 또는 마지막 빈칸이면 즉시 채점 실행
    if (ch === '\n') {
      this.recordCodeLabStroke('Enter', true);
      if (this.codeLab.activeBlankIdx < blanks.length - 1) {
        this.codeLab.activeBlankIdx++;
        this.renderSkeletonEditor();
        this.updateCodeLabTargetGuidance();
        this.updateCodeLabLineHint();
      } else {
        this.executeCodeLabTests();
      }
      return;
    }

    this.codeLab.totalStrokes++;
    const nextIdx = activeBlank.userText.length;
    const expectedSub = activeBlank.expected[nextIdx];
    const matchesExpected = activeBlank.expected.startsWith(activeBlank.userText) && ch === expectedSub;

    activeBlank.userText += ch;
    this.codeLab.correctStrokes++;

    const stroke = this.resolveStrokeForChar(ch);
    this.recordCodeLabStroke(stroke ? stroke.code : null, matchesExpected || expectedSub === undefined, expectedSub || ch);

    this.renderSkeletonEditor();
    this.updateCodeLabTargetGuidance();
    this.updateCodeLabMetricsUI();
    this.updateCodeLabLineHint();
  }

  handleCodeLabBackspace() {
    if (this.isAnyModalBlockingTyping()) return;
    if (this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
      const blanks = this.codeLab.skeletonModel.blanks;
      const curBlank = blanks[this.codeLab.activeBlankIdx];
      if (!curBlank) return;
      if (curBlank.userText.length > 0) {
        curBlank.userText = curBlank.userText.slice(0, -1);
      } else if (this.codeLab.activeBlankIdx > 0) {
        this.codeLab.activeBlankIdx--;
      }
      this.renderer.triggerKeyPress('Backspace', true);
      this.renderSkeletonEditor();
      this.updateCodeLabTargetGuidance();
      this.updateCodeLabMetricsUI();
      this.updateCodeLabLineHint();
      return;
    }

    if (this.codeLab.cursorIdx > 0) {
      clearTimeout(this.codeLab._wrongTimer);
      this.codeLab.lastWrongIdx = null;
      this.codeLab.cursorIdx--;
      this.renderer.triggerKeyPress('Backspace', true);
      this.updateCodeCharClasses();
      this.updateCodeLabTargetGuidance();
      this.updateCodeLabMetricsUI();
      this.updateCodeLabLineHint();
    }
  }

  advanceCodeLabNextLesson() {
    const filtered = this.getFilteredCodeLabLessons(this.codeLab.lang, this.codeLab.difficulty, this.codeLab.track);
    if (filtered.length > 0) {
      const pos = filtered.findIndex(item => item.originalIndex === this.codeLab.lessonIndex);
      const nextItem = filtered[(pos + 1) % filtered.length];
      if (this.elCodeProblemSelect) this.elCodeProblemSelect.value = String(nextItem.originalIndex);
      this.loadCodeLabLesson(this.codeLab.lang, nextItem.originalIndex);
      return;
    }
    const list = window.CODE_CURRICULUM[this.codeLab.lang] || [];
    const nextIdx = (this.codeLab.lessonIndex + 1) % list.length;
    if (this.elCodeProblemSelect) this.elCodeProblemSelect.value = nextIdx;
    this.loadCodeLabLesson(this.codeLab.lang, nextIdx);
  }

  updateCodeLabMetricsUI() {
    if (!this.elCodeKpm || !this.elCodeAcc || !this.elCodeTime) return;
    const now = performance.now();
    const elapsedSec = this.codeLab.startTime ? Math.max(0.1, (now - this.codeLab.startTime) / 1000) : 0;

    const kpm = elapsedSec > 0 ? Math.round((this.codeLab.correctStrokes / elapsedSec) * 60) : 0;
    const acc = this.codeLab.totalStrokes > 0
      ? Math.round((this.codeLab.correctStrokes / this.codeLab.totalStrokes) * 100)
      : 100;

    this.elCodeKpm.textContent = String(kpm);
    this.elCodeAcc.textContent = `${acc}%`;
    this.elCodeTime.textContent = `${elapsedSec.toFixed(1)}s`;

    // 상단 공통 지표 갱신 (WPM / KPM 단위 일관성 유지)
    const wpm = Math.round(kpm / 5);
    if (this.elMetricSpeed) this.elMetricSpeed.textContent = `${wpm} WPM`;
    if (this.elMetricSpeedUnit) this.elMetricSpeedUnit.textContent = `속도 (${kpm} KPM)`;
    if (this.elMetricAccuracy) this.elMetricAccuracy.textContent = `${acc}%`;
  }

  async executeCodeLabTests(options = {}) {
    const lesson = this.codeLab.currentLesson;
    if (!lesson) return;

    let codeToRun = lesson.code;
    if (this.isEditableCodeMode()) {
      codeToRun = this.elCodeSandboxTextarea ? this.elCodeSandboxTextarea.value : (this.codeLab.sandboxText || lesson.code);
    } else if (this.codeLab.typeMode === 'skeleton') {
      const recon = this.reconstructSkeletonCode();
      if (recon.missingBlankIdx !== -1) {
        this.codeLab.activeBlankIdx = recon.missingBlankIdx;
        this.renderSkeletonEditor();
        this.updateCodeLabTargetGuidance();
        this.updateCodeLabLineHint();
        if (this.elCodeTestsSummary) {
          this.elCodeTestsSummary.className = 'tests-summary-badge failed';
          this.elCodeTestsSummary.textContent = '빈칸 미입력 ⚠️';
        }
        this.updateCodeLabTestStatusIndicators('failed', '미입력', '⚠️ 빈칸 미입력 · 확인하기');
        if (this.elCodeConsoleOutput) {
          this.elCodeConsoleOutput.className = 'console-output has-error';
          this.elCodeConsoleOutput.textContent = `⚠️ [빈칸 #${recon.missingBlankIdx + 1}] 비어 있는 빈칸에 로직을 입력한 뒤 실행하세요.`;
        }
        if (options && options.fromUserAction) {
          this.switchCodeLabDescTab('tests');
        }
        if (this.elCodeHiddenInput) this.elCodeHiddenInput.focus();
        return;
      }
      codeToRun = recon.code;
    }

    if (this.elCodeTestsSummary) {
      this.elCodeTestsSummary.className = 'tests-summary-badge';
      this.elCodeTestsSummary.textContent = '실행 중 ⚙️...';
    }
    this.updateCodeLabTestStatusIndicators('', '실행중', '⚙️ 테스트 실행 중...');

    if (this.elCodeRunBtn) {
      this.elCodeRunBtn.disabled = true;
      this.elCodeRunBtn.textContent = '실행 중...';
    }

    let result = null;
    try {
      if (this.codeLab.lang === 'javascript') {
        result = await this.codeRunner.runJavaScript(codeToRun, lesson.entryPoint, lesson.tests);
      } else if (this.codeLab.lang === 'python') {
        result = await this.codeRunner.runPython(codeToRun, lesson.entryPoint, lesson.tests, (status) => {
          if (this.elCodeConsoleOutput) this.elCodeConsoleOutput.textContent = status;
        });
      } else if (this.codeLab.lang === 'c') {
        result = this.codeRunner.runC(codeToRun, lesson.entryPoint, lesson.tests);
      } else if (this.codeLab.lang === 'spec') {
        result = this.codeRunner.runSpec(codeToRun, lesson);
      }
    } catch (e) {
      result = { success: false, error: e.toString(), tests: [], logs: [], allPassed: false, elapsedMs: 0 };
    } finally {
      if (this.elCodeRunBtn) {
        this.elCodeRunBtn.disabled = false;
        this.elCodeRunBtn.textContent = '▶ 코드 실행 (Ctrl+Enter)';
      }
    }

    if (this.elCodeExecTime) {
      this.elCodeExecTime.textContent = `실행 시간: ${result.elapsedMs || 0} ms`;
    }

    if (this.elCodeConsoleOutput) {
      if (result.success) {
        this.elCodeConsoleOutput.className = 'console-output';
        const logText = (result.logs && result.logs.length > 0) ? result.logs.join('\n') : '';
        const summaryText = result.allPassed
          ? `🎉 [SUCCESS] 모든 테스트 케이스를 성공적으로 통과했습니다! (${lesson.tests.length}/${lesson.tests.length} Passed)`
          : `⚠️ [FAILED] 일부 테스트 케이스에서 불일치가 발생했습니다.`;
        this.elCodeConsoleOutput.textContent = logText ? `${logText}\n\n${summaryText}` : summaryText;
        if (result.allPassed && !this.isEditableCodeMode()) {
          const wrap = document.createElement('div');
          const ctaBtn = document.createElement('button');
          ctaBtn.type = 'button';
          ctaBtn.className = 'codelab-sandbox-cta';
          ctaBtn.id = 'codelab-postpass-sandbox-btn';
          ctaBtn.textContent = '🛠️ 자유 수정(Sandbox)으로 코드 변형·리팩터링하기';
          ctaBtn.addEventListener('click', () => {
            this.setCodeLabTypeMode('sandbox', codeToRun);
          });
          wrap.appendChild(ctaBtn);
          this.elCodeConsoleOutput.appendChild(wrap);
        }
      } else {
        this.elCodeConsoleOutput.className = 'console-output has-error';
        this.elCodeConsoleOutput.textContent = `[에러 발생]: ${result.error || '실행 오류'}`;
      }
    }

    // 이전 실행 결과 초기화 후 최신 결과 반영
    this.renderCodeLabTestsList(lesson.tests);
    if (result.tests && result.tests.length > 0) {
      result.tests.forEach((tRes, idx) => {
        const item = document.getElementById(`codelab-test-item-${idx}`);
        if (item) {
          item.className = 'test-case-item ' + (tRes.passed ? 'test-passed' : 'test-failed');
          const badge = item.querySelector('.test-case-badge');
          if (badge) {
            badge.style.color = tRes.passed ? '#34d399' : '#f87171';
            badge.textContent = tRes.passed ? '통과 ✅' : '실패 ❌';
          }
          const detailSuffix = tRes.detail ? ` (${tRes.detail})` : '';
          const actualStr = (tRes.actual === undefined ? 'undefined' : JSON.stringify(tRes.actual)) + detailSuffix;
          const actBox = document.createElement('div');
          actBox.className = 'test-actual-val';
          actBox.style.fontSize = '11px';
          actBox.style.fontFamily = 'monospace';
          actBox.innerHTML = `실제 반환값: <code style="color:${tRes.passed ? '#34d399' : '#f87171'}">${this.escapeHtml(actualStr)}</code>`;
          item.appendChild(actBox);
        }
      });
    }

    const totalCnt = (result.tests && result.tests.length) ? result.tests.length : lesson.tests.length;
    const passedCnt = result.tests ? result.tests.filter(t => t.passed).length : 0;

    if (this.elCodeTestsSummary) {
      if (result.allPassed) {
        this.elCodeTestsSummary.className = 'tests-summary-badge passed';
        this.elCodeTestsSummary.textContent = `모두 통과 (${lesson.tests.length}/${lesson.tests.length}) ✅`;
        this.updateCodeLabTestStatusIndicators(
          'passed',
          `${lesson.tests.length}/${lesson.tests.length} ✓`,
          `✓ 테스트 ${lesson.tests.length}/${lesson.tests.length} 통과 (${result.elapsedMs || 0}ms)`
        );
        this.markCodeLabLessonSolved(lesson.id);
        if (window.soundEngine) window.soundEngine.playComplete();
      } else {
        this.elCodeTestsSummary.className = 'tests-summary-badge failed';
        this.elCodeTestsSummary.textContent = '테스트 실패 ❌';
        this.updateCodeLabTestStatusIndicators(
          'failed',
          `${passedCnt}/${totalCnt} ❌`,
          `❌ 테스트 실패 (${passedCnt}/${totalCnt}) · 상세 보기`
        );
        if (options && options.fromUserAction) {
          this.switchCodeLabDescTab('tests');
        }
      }
    }
  }


  // =========================================================================
  // KeyReflex CodeLab: 안 D 하이브리드 전환 · 통합 탭 · 양방향 라인 동기화
  // =========================================================================

  bindSpecialCardFold(cardEl) {
    if (!cardEl) return;
    const foldBtn = cardEl.querySelector('.special-card-fold-btn');
    const bodyEl = cardEl.querySelector('.special-card-body');
    if (!foldBtn || !bodyEl) return;
    foldBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const collapsed = bodyEl.classList.toggle('is-collapsed');
      foldBtn.textContent = collapsed ? '펼치기' : '접기';
    });
  }

  updateCodeLabTestStatusIndicators(state, shortPillText, footerText) {
    if (this.elCodeTabTestsPill) {
      this.elCodeTabTestsPill.className = 'tab-status-pill' + (state ? ` ${state}` : '');
      this.elCodeTabTestsPill.textContent = shortPillText;
    }
    if (this.elCodePanelStatusTest) {
      this.elCodePanelStatusTest.className = 'panel-status-test-btn' + (state ? ` ${state}` : '');
      this.elCodePanelStatusTest.textContent = footerText;
    }
  }

  setCodeLabWideMode(isWide, options = {}) {
    const wide = Boolean(isWide);
    this.codeLab.keyboardHidden = wide;
    if (!options.skipSave && this.userSettings) {
      this.userSettings.codelabWideDefault = wide;
      this.saveUserSettings();
    }

    if (this.elCodeWideToggleBtn) {
      this.elCodeWideToggleBtn.classList.toggle('active', wide);
      this.elCodeWideToggleBtn.textContent = wide ? '기본 보기 (키보드)' : '넓게 보기';
    }

    if (this.currentMode !== 'practice_code') {
      this.syncSettingsUI();
      return;
    }

    document.body.classList.toggle('codelab-kbd-hidden', wide);
    this.syncSettingsUI();

    if (this.isEditableCodeMode()) {
      this.syncSandboxGutter();
    }

    if (!options.skipFocus && !this.isAnyModalBlockingTyping()) {
      if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
        this.elCodeSandboxTextarea.focus();
      } else if (this.elCodeHiddenInput) {
        this.elCodeHiddenInput.focus();
      }
    }
  }

  setCodeLabPeekLine(lineNum) {
    if (this.elCodeContent) {
      const codeLines = this.elCodeContent.querySelectorAll('.code-line');
      codeLines.forEach((el, idx) => {
        el.classList.toggle('is-peek-line', lineNum !== null && idx === lineNum - 1);
      });
    }
    if (this.elCodeLineNumbers) {
      const numSpans = this.elCodeLineNumbers.querySelectorAll('span');
      numSpans.forEach((el, idx) => {
        el.classList.toggle('is-peek-line', lineNum !== null && idx === lineNum - 1);
      });
    }
  }

  jumpToCodeLabEditorLine(lineNum) {
    if (!lineNum || lineNum < 1) return;
    if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
      const lines = (this.elCodeSandboxTextarea.value || '').split('\n');
      const safeIdx = Math.min(Math.max(0, lineNum - 1), Math.max(0, lines.length - 1));
      let offset = 0;
      for (let i = 0; i < safeIdx; i++) {
        offset += lines[i].length + 1;
      }
      this.elCodeSandboxTextarea.focus();
      this.elCodeSandboxTextarea.setSelectionRange(offset, offset);
      const lineH = document.body.classList.contains('codelab-kbd-hidden') ? 22 : 20;
      this.elCodeSandboxTextarea.scrollTop = Math.max(0, safeIdx * lineH - 60);
      this.updateCodeLabLineHint();
      return;
    }

    if (this.elCodeContent && this.elCodeEditorBody) {
      const codeLines = this.elCodeContent.querySelectorAll('.code-line');
      const targetEl = codeLines[lineNum - 1];
      if (targetEl) {
        const bodyTop = this.elCodeEditorBody.scrollTop;
        const bodyH = this.elCodeEditorBody.clientHeight;
        const elTop = targetEl.offsetTop;
        if (elTop < bodyTop + 12 || elTop > bodyTop + bodyH - 36) {
          this.elCodeEditorBody.scrollTo({ top: Math.max(0, elTop - bodyH / 3), behavior: 'smooth' });
        }
      }
    }
    this.setCodeLabPeekLine(lineNum);
    if (this.elCodeHiddenInput) this.elCodeHiddenInput.focus();
  }

  switchCodeLabDescTab(tabName) {
    const validTab = ['overview', 'explanation', 'tests'].includes(tabName) ? tabName : 'overview';
    this.codeLab.activeDescTab = validTab;

    if (this.elCodeTabBtns) {
      this.elCodeTabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-desctab') === validTab);
      });
    }
    if (this.elCodeTabOverview) {
      this.elCodeTabOverview.classList.toggle('active', validTab === 'overview');
    }
    if (this.elCodeTabExplanation) {
      this.elCodeTabExplanation.classList.toggle('active', validTab === 'explanation');
    }
    if (this.elCodeTabTests) {
      this.elCodeTabTests.classList.toggle('active', validTab === 'tests');
    }
    if (this.elCodeSidePanel) {
      this.elCodeSidePanel.classList.toggle('is-explanation-active', validTab === 'explanation');
      this.elCodeSidePanel.classList.toggle('is-tests-active', validTab === 'tests');
    }

    if (this.elCodeUnifiedBody) {
      const isWide = document.body.classList.contains('codelab-kbd-hidden');
      if (isWide && validTab === 'explanation' && this.elCodeTabExplanation) {
        const top = Math.max(0, this.elCodeTabExplanation.offsetTop - 8);
        this.elCodeUnifiedBody.scrollTo({ top, behavior: 'smooth' });
      } else {
        this.elCodeUnifiedBody.scrollTop = 0;
      }
    }

    if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
      setTimeout(() => this.elCodeSandboxTextarea.focus(), 60);
    } else if (this.elCodeHiddenInput) {
      setTimeout(() => this.elCodeHiddenInput.focus(), 60);
    }
  }

  openCodeLabModal() {
    const lesson = this.codeLab.currentLesson;
    if (!lesson || !this.elCodeModalOverlay) return;

    const langNames = {
      javascript: 'JavaScript (ES6+)',
      python: 'Python 3 (Pyodide)',
      c: 'C 언어 (C99)',
      spec: lesson.specKind === 'diagram' ? 'Architecture Diagram DSL' : 'JSON Schema Spec'
    };
    if (this.elModalProblemTitle) this.elModalProblemTitle.textContent = lesson.title;
    if (this.elModalTierBadge) {
      this.elModalTierBadge.textContent = this.formatTierBadgeLabel(lesson);
      this.applyTierBadgeClass(this.elModalTierBadge, 'modal-tier-pill', lesson.tier);
    }
    if (this.elModalLangBadge) this.elModalLangBadge.textContent = langNames[this.codeLab.lang] || this.codeLab.lang;
    if (this.elModalCodeMeta) this.elModalCodeMeta.textContent = `${lesson.complexity.time} / ${lesson.complexity.space}`;
    if (this.elModalCodeBlock) {
      this.elModalCodeBlock.innerHTML = this.buildHighlightedCodeHTML(lesson.code, this.codeLab.lang);
    }

    if (this.elModalDetailsContainer) {
      this.elModalDetailsContainer.innerHTML = this.buildExplanationHTML(lesson, { includeOverview: true });
    }

    this.elCodeModalOverlay.style.display = 'flex';
  }

  closeCodeLabModal() {
    if (this.elCodeModalOverlay) {
      this.elCodeModalOverlay.style.display = 'none';
    }
    if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
      setTimeout(() => this.elCodeSandboxTextarea.focus(), 80);
    } else if (this.elCodeHiddenInput) {
      setTimeout(() => this.elCodeHiddenInput.focus(), 80);
    }
  }

  buildExplanationHTML(lesson, options = {}) {
    const includeOverview = options.includeOverview !== false;
    const exp = lesson.explanation;
    if (!exp) {
      return `<p style="color:#94a3b8; font-size:13px;">${lesson.description}</p>`;
    }

    const conceptsHtml = (exp.keyConcepts || []).map(c => `<span class="concept-chip">${c}</span>`).join('');

    const linesHtml = (exp.lineByLine || []).map(item => `
      <div class="line-explain-item" data-line="${item.line}" title="클릭하면 왼쪽 에디터 L${item.line} 줄로 이동합니다">
        <div class="line-explain-header">
          <span class="line-num-badge">L${item.line}</span>
          <code class="line-code-snippet">${this.buildHighlightedCodeHTML((item.code || '').trim(), this.codeLab.lang)}</code>
          <span class="line-active-pill">● 현재 줄</span>
        </div>
        <p class="line-explain-text">${item.explain}</p>
      </div>
    `).join('');

    const pitfallsHtml = (exp.pitfalls || []).map(p => `
      <div class="pitfall-item">${p}</div>
    `).join('');

    let overviewBlocks = '';
    if (includeOverview) {
      const refactorHtml = lesson.refactoringBefore ? `
        <div>
          <div class="explain-section-title">🔄 Before: 리팩터링 전 레거시 코드</div>
          <pre class="refactor-before-pre" style="margin-top:8px;"><code>${this.buildHighlightedCodeHTML(lesson.refactoringBefore, this.codeLab.lang)}</code></pre>
        </div>
      ` : '';

      const adrRec = lesson.adr && Array.isArray(lesson.adr.options)
        ? lesson.adr.options.find(o => o.recommended)
        : null;
      const adrHtml = lesson.adr ? `
        <div>
          <div class="explain-section-title">⚖️ 아키텍처 설계 결정 근거 (ADR)</div>
          <div class="complexity-box" style="margin-top:8px;">
            <p class="explain-summary-text" style="margin-bottom:6px;">${this.escapeHtml(lesson.adr.scenario)}</p>
            ${adrRec ? `<div class="pitfall-item">✅ <b>권장 설계:</b> ${this.escapeHtml(adrRec.label)} — ${this.escapeHtml(adrRec.critique)}</div>` : ''}
          </div>
        </div>
      ` : '';

      overviewBlocks = `
        <!-- 요약 & 핵심 개념 -->
        <div class="explain-summary-card">
          <p class="explain-summary-text">${exp.summary || lesson.description}</p>
          <div class="concept-chips-container" style="margin:0;">${conceptsHtml}</div>
        </div>
        ${refactorHtml}
        ${adrHtml}
      `;
    }

    return `
      ${overviewBlocks}

      <!-- 라인별 상세 분석 -->
      <div>
        <div class="explain-section-title">📝 라인별 상세 분석 (클릭 시 에디터 줄 이동)</div>
        <div class="line-by-line-list" style="margin-top:8px;">${linesHtml}</div>
      </div>

      <!-- 복잡도 분석 -->
      <div>
        <div class="explain-section-title">⚡ 복잡도 도출 근거 (Complexity Analysis)</div>
        <div class="complexity-box" style="margin-top:8px;">
          <div class="complexity-row">
            <div class="complexity-header-line">
              <span class="complexity-tag">시간 복잡도</span>
              <span class="complexity-val">${exp.complexity?.time || lesson.complexity.time}</span>
            </div>
            <span class="complexity-why">${exp.complexity?.timeWhy || ''}</span>
          </div>
          <div class="complexity-row" style="margin-top:6px;">
            <div class="complexity-header-line">
              <span class="complexity-tag">공간 복잡도</span>
              <span class="complexity-val">${exp.complexity?.space || lesson.complexity.space}</span>
            </div>
            <span class="complexity-why">${exp.complexity?.spaceWhy || ''}</span>
          </div>
        </div>
      </div>

      <!-- 실무 주의점 -->
      <div>
        <div class="explain-section-title">⚠️ 실무 주의점 & 모범 사례 (Pro-Tips & Pitfalls)</div>
        <div class="pitfalls-box" style="margin-top:8px;">${pitfallsHtml}</div>
      </div>
    `;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderCodeLabExplanation(lesson) {
    if (!lesson) return;
    const exp = lesson.explanation;

    // 1. 개요 탭의 빠른 태그 렌더링
    if (this.elCodeQuickTags) {
      if (exp && exp.keyConcepts) {
        this.elCodeQuickTags.innerHTML = exp.keyConcepts.map(c => `<span class="concept-chip">${c}</span>`).join('');
      } else {
        this.elCodeQuickTags.innerHTML = '';
      }
    }

    // 2. 라인별 상세 해설 탭 렌더링 (개요 중복 카드 생략 → 즉시 L1~Ln 노출)
    if (this.elCodeExplainCount) {
      const cnt = (exp && Array.isArray(exp.lineByLine)) ? exp.lineByLine.length : 0;
      this.elCodeExplainCount.textContent = cnt > 0 ? String(cnt) : '';
    }
    if (this.elCodeExplanationContainer) {
      this.elCodeExplanationContainer.innerHTML = this.buildExplanationHTML(lesson, { includeOverview: false });
    }
  }

  updateCodeLabLineHint() {
    if (!this.elCodeLineHint) return;
    const lesson = this.codeLab.currentLesson;
    if (!lesson) return;

    let lineNum = 1;
    let lines = this.codeLab.fullText.split('\n');
    if (this.isEditableCodeMode() && this.elCodeSandboxTextarea) {
      const sbText = this.elCodeSandboxTextarea.value || '';
      const selStart = typeof this.elCodeSandboxTextarea.selectionStart === 'number'
        ? this.elCodeSandboxTextarea.selectionStart
        : 0;
      lineNum = (sbText.slice(0, selStart).match(/\n/g) || []).length + 1;
      lines = sbText.split('\n');
    } else if (this.codeLab.typeMode === 'skeleton' && this.codeLab.skeletonModel) {
      const b = this.codeLab.skeletonModel.blanks[this.codeLab.activeBlankIdx];
      lineNum = b ? b.lineNum : 1;
    } else {
      const textBefore = this.codeLab.fullText.substring(0, this.codeLab.cursorIdx);
      lineNum = (textBefore.match(/\n/g) || []).length + 1;
    }

    const curLineCode = lines[lineNum - 1] !== undefined ? lines[lineNum - 1].trim() : '';

    let explainText = '';
    if (lesson.explanation && lesson.explanation.lineByLine) {
      const match = lesson.explanation.lineByLine.find(item => item.line === lineNum);
      if (match) {
        explainText = match.explain;
      }
    }

    if (!explainText) {
      explainText = curLineCode === '' ? '함수 구분을 위한 빈 줄입니다 (Enter로 통과).' : (lesson.description || '코드를 정밀하게 입력하세요.');
    }

    const codeLabel = curLineCode || '(빈 줄)';
    this.elCodeLineHint.innerHTML = `<b>[Line ${lineNum}]</b> <span style="color:#e2e8f0; font-family:monospace; margin-right:6px;">${this.escapeHtml(codeLabel)}</span> <span style="color:#94a3b8;">→ ${this.escapeHtml(explainText)}</span>`;

    // 좌측 에디터 현재 줄 인디케이터 동기화
    if (this.elCodeContent) {
      this.elCodeContent.querySelectorAll('.code-line').forEach((el, idx) => {
        el.classList.toggle('is-active-line', idx === lineNum - 1);
      });
    }
    if (this.elCodeLineNumbers) {
      this.elCodeLineNumbers.querySelectorAll('span').forEach((el, idx) => {
        el.classList.toggle('is-active-line', idx === lineNum - 1);
      });
    }

    // 우측 라인별 상세 해설 동기화 + 가시 영역 내 부드러운 내부 스크롤
    if (this.elCodeExplanationContainer) {
      let activeItem = null;
      this.elCodeExplanationContainer.querySelectorAll('.line-explain-item').forEach(item => {
        const itemLine = parseInt(item.getAttribute('data-line'), 10);
        const isMatch = itemLine === lineNum;
        item.classList.toggle('active-line', isMatch);
        if (isMatch) activeItem = item;
      });

      const lineChanged = lineNum !== this.codeLab._lastSyncedLine;
      this.codeLab._lastSyncedLine = lineNum;
      const isWide = document.body.classList.contains('codelab-kbd-hidden');
      const isExplanationVisible = this.codeLab.activeDescTab === 'explanation' || (isWide && this.codeLab.activeDescTab !== 'tests');
      if (lineChanged && activeItem && isExplanationVisible && this.elCodeUnifiedBody) {
        const container = this.elCodeUnifiedBody;
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const viewTop = container.scrollTop;
        const viewBottom = viewTop + container.clientHeight;
        if (itemTop < viewTop + 12 || itemBottom > viewBottom - 12) {
          container.scrollTo({
            top: Math.max(0, itemTop - Math.round(container.clientHeight * 0.35)),
            behavior: 'smooth'
          });
        }
      }
    }
  }

}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new TypingReflexApp();
});
