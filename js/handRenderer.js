/**
 * KeyReflex Studio - SVG 가상 키보드 & 2D 벡터 인간 손 렌더러
 * - 위키미디어 / 어도비 일러스트레이터 표준 정밀 인체 해부학적 타이핑 손 기반
 * - 자연스러운 손목 인입각, 입체적 지간 웹(Webbing), 자연스러운 손가락 관절 굴곡
 * - 정밀 역운동학(IK) 손가락 이동 및 타건 애니메이션 지원
 */

const CANONICAL_SEGMENTS = [{"cmd": "M", "p": [[111.59, 489.74]]}, {"cmd": "C", "p": [[123.13, 471.45], [149.05, 434.0], [151.44, 427.49]]}, {"cmd": "C", "p": [[153.8, 421.1], [159.04, 412.81], [158.5, 405.47]]}, {"cmd": "C", "p": [[156.1, 372.6], [158.42, 332.72], [159.01, 288.51]]}, {"cmd": "C", "p": [[156.07, 272.53], [151.45, 255.46], [150.73, 241.48]]}, {"cmd": "C", "p": [[149.96, 226.32], [151.25, 209.64], [155.45, 192.45]]}, {"cmd": "C", "p": [[162.36, 164.17], [188.2, 167.5], [183.69, 192.63]]}, {"cmd": "C", "p": [[182.1, 201.48], [178.75, 211.12], [180.87, 231.22]]}, {"cmd": "C", "p": [[181.97, 241.66], [188.81, 255.07], [191.48, 273.79]]}, {"cmd": "C", "p": [[200.31, 232.46], [195.59, 224.72], [201.98, 204.76]]}, {"cmd": "C", "p": [[204.28, 197.57], [218.87, 174.18], [221.74, 170.24]]}, {"cmd": "C", "p": [[232.13, 155.99], [258.66, 161.98], [255.72, 176.36]]}, {"cmd": "C", "p": [[254.71, 181.3], [240.42, 206.19], [239.62, 211.24]]}, {"cmd": "C", "p": [[237.66, 223.61], [232.47, 245.04], [230.72, 260.62]]}, {"cmd": "C", "p": [[230.09, 266.25], [231.18, 270.14], [233.11, 270.63]]}, {"cmd": "C", "p": [[235.01, 271.11], [239.34, 267.34], [241.51, 260.2]]}, {"cmd": "C", "p": [[243.6, 253.32], [255.86, 213.43], [264.27, 200.79]]}, {"cmd": "C", "p": [[267.6, 195.77], [286.7, 172.06], [291.76, 166.78]]}, {"cmd": "C", "p": [[297.51, 160.79], [302.7, 157.6], [311.18, 159.21]]}, {"cmd": "C", "p": [[319.09, 160.71], [325.49, 165.82], [324.01, 174.64]]}, {"cmd": "C", "p": [[322.11, 185.99], [307.2, 208.38], [306.43, 210.41]]}, {"cmd": "C", "p": [[301.0, 224.82], [286.32, 264.03], [281.85, 273.16]]}, {"cmd": "C", "p": [[279.24, 278.48], [280.0, 282.52], [282.38, 282.99]]}, {"cmd": "C", "p": [[284.99, 283.5], [289.04, 279.97], [293.33, 274.05]]}, {"cmd": "C", "p": [[299.99, 264.84], [318.67, 222.59], [323.95, 216.83]]}, {"cmd": "C", "p": [[331.4, 208.7], [342.34, 188.02], [351.14, 180.46]]}, {"cmd": "C", "p": [[356.66, 175.71], [362.95, 171.4], [371.89, 174.73]]}, {"cmd": "C", "p": [[380.72, 178.01], [380.92, 185.83], [379.84, 191.8]]}, {"cmd": "C", "p": [[378.7, 198.15], [367.73, 223.67], [363.37, 232.28]]}, {"cmd": "C", "p": [[356.34, 246.14], [346.03, 270.6], [340.71, 287.88]]}, {"cmd": "C", "p": [[337.64, 297.85], [330.88, 319.66], [330.88, 327.29]]}, {"cmd": "C", "p": [[330.88, 337.46], [333.69, 355.26], [344.92, 346.36]]}, {"cmd": "C", "p": [[347.1, 342.55], [369.92, 321.25], [374.41, 320.94]]}, {"cmd": "C", "p": [[389.86, 299.33], [405.41, 292.2], [417.94, 288.09]]}, {"cmd": "C", "p": [[427.64, 284.91], [438.68, 285.8], [447.43, 291.7]]}, {"cmd": "C", "p": [[442.8, 301.26], [423.87, 314.11], [418.13, 327.51]]}, {"cmd": "C", "p": [[415.13, 341.28], [385.14, 357.81], [379.65, 377.7]]}, {"cmd": "C", "p": [[376.64, 384.12], [367.8, 390.74], [362.39, 394.04]]}, {"cmd": "C", "p": [[331.3, 432.04], [311.46, 435.77], [286.18, 443.39]]}, {"cmd": "C", "p": [[275.16, 446.71], [257.13, 477.01], [237.47, 514.59]]}];
const FINGER_WEIGHTS = {"pinky": [0.0, 0.0, 0.0, 0.0, 0.4, 1.0, 1.0, 0.7, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "ring": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.7, 1.0, 1.0, 0.8, 0.4, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "middle": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.4, 0.7, 1.0, 1.0, 1.0, 0.7, 0.4, 0.25, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "index": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.4, 0.7, 1.0, 1.0, 1.0, 0.7, 0.4, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], "thumb": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.15, 0.4, 0.75, 1.0, 1.0, 0.75, 0.3, 0.0, 0.0, 0.0]};

class KeyboardHandRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
    this.NS = 'http://www.w3.org/2000/svg';

    // 기본 설정 상태
    this.lang = 'ko';
    this.showFingerZoneColors = true;
    this.handOpacity = 0.72;
    this.heatmapMode = false;

    // 키 레이아웃 상수 (viewBox: 0 0 980 445)
    this.UNIT = 58;
    this.GAP = 6;
    this.START_X = 24;
    this.START_Y = 20;
    this.ROW_H = 58;

    // 홈 키 물리 중심축 (A:165, S:229, D:293, F:357 / J:549, K:613, L:677, ;:741)
    this.CENTER_X = 453.0;
    this.MIRROR_SUM = 906.0;

    this.keyElements = {};
    this.fingerStates = {};
    this.activeTargetCodes = new Set();

    this.initLayout();
    this.initHands();
    this.startAnimationLoop();
  }

  /**
   * SVG Defs & 키보드 베젤 및 키캡 생성
   */
  initLayout() {
    this.svg.innerHTML = '';

    const defs = document.createElementNS(this.NS, 'defs');
    defs.innerHTML = `
      <!-- Option B: 아노다이징 웜 차콜 알루미늄 섀시 그라데이션 -->
      <linearGradient id="boardBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#292732" />
        <stop offset="50%" stop-color="#1E1D25" />
        <stop offset="100%" stop-color="#141319" />
      </linearGradient>

      <!-- 리세스 스위치 플레이트 (딥 매트 블랙) -->
      <linearGradient id="plateRecessGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0E0D12" />
        <stop offset="100%" stop-color="#141319" />
      </linearGradient>

      <!-- 3D 이중사출 Alpha / Space 키캡 상단 표면 (웜 오프화이트 PBT) -->
      <linearGradient id="keyCapAlphaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#F0ECE3" />
        <stop offset="100%" stop-color="#DCD6C8" />
      </linearGradient>

      <!-- 3D Alpha 키캡 하단 베벨 스커트 -->
      <linearGradient id="keySkirtAlphaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B0A899" />
        <stop offset="100%" stop-color="#877F72" />
      </linearGradient>

      <!-- 3D 이중사출 Modifier 키캡 상단 표면 (다크 슬레이트 차콜) -->
      <linearGradient id="keyCapModGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#454252" />
        <stop offset="100%" stop-color="#2E2C38" />
      </linearGradient>

      <!-- 3D Modifier 키캡 하단 베벨 스커트 -->
      <linearGradient id="keySkirtModGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#24222D" />
        <stop offset="100%" stop-color="#15141B" />
      </linearGradient>

      <!-- 3D 포인트 Accent Enter 키캡 (시그니처 앰버 오렌지) -->
      <linearGradient id="keyCapAccentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FB923C" />
        <stop offset="100%" stop-color="#EA580C" />
      </linearGradient>

      <linearGradient id="keySkirtAccentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#B43D09" />
        <stop offset="100%" stop-color="#7C2D12" />
      </linearGradient>

      <!-- 정밀 캐노니컬 인간 손 필 (반투명 웜 알라바스터) -->
      <linearGradient id="refHandFill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.95" />
        <stop offset="55%" stop-color="#F7F3EA" stop-opacity="0.90" />
        <stop offset="100%" stop-color="#EDE7DA" stop-opacity="0.84" />
      </linearGradient>

      <!-- 활성(타겟) 손가락/키 앰버 오렌지 하이라이트 그라데이션 -->
      <linearGradient id="handActiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FB923C" stop-opacity="0.96" />
        <stop offset="100%" stop-color="#EA580C" stop-opacity="0.92" />
      </linearGradient>

      <!-- 발광 오라 필터 -->
      <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- 소프트 드롭 섀도우 -->
      <filter id="handShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#09080C" flood-opacity="0.5" />
      </filter>
    `;
    this.svg.appendChild(defs);

    // 외곽 아노다이징 섀시 프레임
    const frame = document.createElementNS(this.NS, 'rect');
    frame.setAttribute('x', '10');
    frame.setAttribute('y', '6');
    frame.setAttribute('width', '960');
    frame.setAttribute('height', '344');
    frame.setAttribute('rx', '16');
    frame.setAttribute('fill', 'url(#boardBgGrad)');
    frame.setAttribute('stroke', '#3C3847');
    frame.setAttribute('stroke-width', '2');
    this.svg.appendChild(frame);

    // 내부 리세스 스위치 플레이트
    const plate = document.createElementNS(this.NS, 'rect');
    plate.setAttribute('x', '19');
    plate.setAttribute('y', '15');
    plate.setAttribute('width', '942');
    plate.setAttribute('height', '326');
    plate.setAttribute('rx', '10');
    plate.setAttribute('fill', 'url(#plateRecessGrad)');
    plate.setAttribute('stroke', '#25232E');
    plate.setAttribute('stroke-width', '1');
    this.svg.appendChild(plate);

    // 코너 CNC 육각 나사 디테일
    [[16, 12], [964, 12], [16, 344], [964, 344]].forEach(([sx, sy]) => {
      const screw = document.createElementNS(this.NS, 'circle');
      screw.setAttribute('cx', String(sx));
      screw.setAttribute('cy', String(sy));
      screw.setAttribute('r', '2.5');
      screw.setAttribute('fill', '#22202A');
      screw.setAttribute('stroke', '#4A4658');
      screw.setAttribute('stroke-width', '0.9');
      this.svg.appendChild(screw);
    });

    // 키보드 레이어
    this.keyboardGroup = document.createElementNS(this.NS, 'g');
    this.keyboardGroup.setAttribute('id', 'keyboard-layer');
    this.svg.appendChild(this.keyboardGroup);

    // 3D 이중사출 PBT 키캡 생성
    window.KEYBOARD_ROWS.forEach((row, rIdx) => {
      let curX = this.START_X;
      const curY = this.START_Y + rIdx * (this.ROW_H + this.GAP);

      row.forEach((key) => {
        const kw = Math.round(key.w * this.UNIT + (key.w - 1) * this.GAP);
        const kh = this.ROW_H;
        key.cx = Math.round(curX + kw / 2);
        key.cy = Math.round(curY + (kh - 4) / 2);
        key.wPx = kw;
        key.hPx = kh;

        const isAccent = key.code === 'Enter';
        const isDarkMod = Boolean(key.isModifier) && !isAccent && key.code !== 'Space';
        const roleClass = isAccent ? 'key-role-accent' : (isDarkMod ? 'key-role-mod' : 'key-role-alpha');

        const g = document.createElementNS(this.NS, 'g');
        g.setAttribute('class', `key-unit key-group ${roleClass} key-${key.code}`);
        g.setAttribute('data-code', key.code);

        // 1) 3D 키캡 하단 스커트/베벨 립
        const skirt = document.createElementNS(this.NS, 'rect');
        skirt.setAttribute('class', 'key-skirt');
        skirt.setAttribute('x', curX);
        skirt.setAttribute('y', curY + 1);
        skirt.setAttribute('width', kw);
        skirt.setAttribute('height', kh - 1);
        skirt.setAttribute('rx', '8');
        skirt.setAttribute('fill', isAccent ? 'url(#keySkirtAccentGrad)' : (isDarkMod ? 'url(#keySkirtModGrad)' : 'url(#keySkirtAlphaGrad)'));
        skirt.setAttribute('stroke', isDarkMod ? '#111015' : (isAccent ? '#68210B' : '#6F685D'));
        skirt.setAttribute('stroke-width', '1');
        g.appendChild(skirt);

        // 2) 스컬프티드 상단 키 표면 (.key-cap)
        const dishW = kw - 6;
        const dishH = kh - 8;
        const dishX = curX + 3;
        const dishY = curY + 1.5;

        const rect = document.createElementNS(this.NS, 'rect');
        rect.setAttribute('class', 'key-cap');
        rect.setAttribute('x', dishX);
        rect.setAttribute('y', dishY);
        rect.setAttribute('width', dishW);
        rect.setAttribute('height', dishH);
        rect.setAttribute('rx', '6');
        rect.setAttribute('fill', isAccent ? 'url(#keyCapAccentGrad)' : (isDarkMod ? 'url(#keyCapModGrad)' : 'url(#keyCapAlphaGrad)'));
        rect.setAttribute('stroke', isAccent ? '#FDBA74' : (isDarkMod ? '#524E61' : '#FAF7F0'));
        rect.setAttribute('stroke-opacity', isDarkMod ? '0.45' : '0.8');
        rect.setAttribute('stroke-width', '1');
        g.appendChild(rect);

        // 3) 운지 구역 / 타겟 발광 오버레이 (.zone-tint)
        const zoneTint = document.createElementNS(this.NS, 'rect');
        zoneTint.setAttribute('x', dishX);
        zoneTint.setAttribute('y', dishY);
        zoneTint.setAttribute('width', dishW);
        zoneTint.setAttribute('height', dishH);
        zoneTint.setAttribute('rx', '6');
        zoneTint.setAttribute('class', 'zone-tint');
        const fInfo = window.FINGER_INFO[key.finger];
        zoneTint.setAttribute('fill', fInfo ? fInfo.color : 'transparent');
        zoneTint.setAttribute('fill-opacity', this.showFingerZoneColors && fInfo ? (isDarkMod ? '0.18' : '0.16') : '0');
        zoneTint.setAttribute('stroke', fInfo ? fInfo.color : 'transparent');
        zoneTint.setAttribute('stroke-width', '1.75');
        zoneTint.setAttribute('stroke-opacity', this.showFingerZoneColors && fInfo ? '0.68' : '0');
        g.appendChild(zoneTint);

        if (key.code === 'KeyF' || key.code === 'KeyJ') {
          const bump = document.createElementNS(this.NS, 'rect');
          bump.setAttribute('x', key.cx - 8);
          bump.setAttribute('y', curY + dishH - 6);
          bump.setAttribute('width', 16);
          bump.setAttribute('height', 2.5);
          bump.setAttribute('rx', 1.25);
          bump.setAttribute('fill', '#6F685D');
          bump.setAttribute('opacity', '0.85');
          g.appendChild(bump);
        }

        const mainLabel = document.createElementNS(this.NS, 'text');
        mainLabel.setAttribute('class', 'key-label-main');
        mainLabel.setAttribute('x', key.cx);
        mainLabel.setAttribute('y', curY + Math.round(dishH / 2) + (key.isModifier || key.code === 'Space' ? 6 : 7));
        mainLabel.setAttribute('text-anchor', 'middle');
        mainLabel.setAttribute('fill', isAccent ? '#FFFFFF' : (isDarkMod ? '#ECE8DF' : '#1E1B24'));
        mainLabel.setAttribute('font-size', key.isModifier ? '11.5px' : '15px');
        mainLabel.setAttribute('font-weight', '800');
        g.appendChild(mainLabel);

        const subLabel = document.createElementNS(this.NS, 'text');
        subLabel.setAttribute('class', 'key-label-sub');
        subLabel.setAttribute('x', dishX + 6);
        subLabel.setAttribute('y', dishY + 12);
        subLabel.setAttribute('fill', isAccent ? '#FFEDD5' : (isDarkMod ? '#9E99A8' : '#736C61'));
        subLabel.setAttribute('font-size', '9.5px');
        subLabel.setAttribute('font-weight', '700');
        g.appendChild(subLabel);

        const metricLabel = document.createElementNS(this.NS, 'text');
        metricLabel.setAttribute('class', 'key-metric-label');
        metricLabel.setAttribute('x', key.cx);
        metricLabel.setAttribute('y', curY + dishH - 2);
        metricLabel.setAttribute('text-anchor', 'middle');
        metricLabel.setAttribute('fill', isDarkMod || isAccent ? '#2DD4BF' : '#0F766E');
        metricLabel.setAttribute('font-size', '9px');
        metricLabel.setAttribute('font-weight', '800');
        metricLabel.style.display = 'none';
        g.appendChild(metricLabel);

        this.keyboardGroup.appendChild(g);

        this.keyElements[key.code] = {
          data: key,
          group: g,
          cap: rect,
          zoneTint: zoneTint,
          mainLabel: mainLabel,
          subLabel: subLabel,
          metricLabel: metricLabel,
          isDarkMod,
          isAccent
        };

        curX += kw + this.GAP;
      });
    });

    this.updateKeyLabels();
    this.setShowZoneColors(this.showFingerZoneColors);
  }

  /**
   * 캐노니컬 인간 손 모델 및 손가락/손톱 초기화
   */
  initHands() {
    this.handsGroup = document.createElementNS(this.NS, 'g');
    this.handsGroup.setAttribute('id', 'hands-layer');
    this.handsGroup.setAttribute('filter', 'url(#handShadow)');
    this.handsGroup.style.opacity = this.handOpacity;
    this.svg.appendChild(this.handsGroup);

    // 해부학적 손가락 좌표 (캐노니컬 베지어 손톱 중심 및 자연스러운 부채꼴 각도)
    const fingerDefs = {
      // 왼손
      L_PINKY:  { hand: 'left',  role: 'pinky',  homeX: 169.6, homeY: 192.5, nailRx: 6.0, nailRy: 9.5,  angle: -8 },
      L_RING:   { hand: 'left',  role: 'ring',   homeX: 238.7, homeY: 173.3, nailRx: 6.8, nailRy: 10.5, angle: -5 },
      L_MIDDLE: { hand: 'left',  role: 'middle', homeX: 301.5, homeY: 163.0, nailRx: 7.2, nailRy: 11.0, angle: -1 },
      L_INDEX:  { hand: 'left',  role: 'index',  homeX: 361.5, homeY: 177.6, nailRx: 6.8, nailRy: 10.5, angle: 6 },
      L_THUMB:  { hand: 'left',  role: 'thumb',  homeX: 418.0, homeY: 288.1, nailRx: 6.5, nailRy: 10.5, angle: 42, isThumb: true },

      // 오른손 (홈 로우 중심 453.0 기준 완벽 대칭 미러링: 906.0 - x)
      R_THUMB:  { hand: 'right', role: 'thumb',  homeX: 906.0 - 418.0, homeY: 288.1, nailRx: 6.5, nailRy: 10.5, angle: -42, isThumb: true },
      R_INDEX:  { hand: 'right', role: 'index',  homeX: 906.0 - 361.5, homeY: 177.6, nailRx: 6.8, nailRy: 10.5, angle: -6 },
      R_MIDDLE: { hand: 'right', role: 'middle', homeX: 906.0 - 301.5, homeY: 163.0, nailRx: 7.2, nailRy: 11.0, angle: 1 },
      R_RING:   { hand: 'right', role: 'ring',   homeX: 906.0 - 238.7, homeY: 173.3, nailRx: 6.8, nailRy: 10.5, angle: 5 },
      R_PINKY:  { hand: 'right', role: 'pinky',  homeX: 906.0 - 169.6, homeY: 192.5, nailRx: 6.0, nailRy: 9.5,  angle: 8 }
    };

    this.fingerStates = {};
    Object.keys(fingerDefs).forEach((fId) => {
      const def = fingerDefs[fId];
      this.fingerStates[fId] = {
        ...def,
        curX: def.homeX,
        curY: def.homeY,
        targetX: def.homeX,
        targetY: def.homeY,
        pressOffset: 0,
        isTarget: false,
        isHeld: false
      };
    });

    // 왼손 실루엣 Path
    this.leftHandPath = document.createElementNS(this.NS, 'path');
    this.leftHandPath.setAttribute('class', 'hand-silhouette left-hand');
    this.leftHandPath.setAttribute('fill', 'url(#refHandFill)');
    this.leftHandPath.setAttribute('stroke', '#0f172a');
    this.leftHandPath.setAttribute('stroke-width', '1.8');
    this.leftHandPath.setAttribute('stroke-linejoin', 'round');
    this.handsGroup.appendChild(this.leftHandPath);

    // 오른손 실루엣 Path
    this.rightHandPath = document.createElementNS(this.NS, 'path');
    this.rightHandPath.setAttribute('class', 'hand-silhouette right-hand');
    this.rightHandPath.setAttribute('fill', 'url(#refHandFill)');
    this.rightHandPath.setAttribute('stroke', '#0f172a');
    this.rightHandPath.setAttribute('stroke-width', '1.8');
    this.rightHandPath.setAttribute('stroke-linejoin', 'round');
    this.handsGroup.appendChild(this.rightHandPath);

    // 손톱 타원형 제거 (깔끔한 미니멀 실루엣)

    // 운지 텍스트 가이드 그룹
    this.labelsGroup = document.createElementNS(this.NS, 'g');
    this.labelsGroup.setAttribute('id', 'finger-labels');
    this.handsGroup.appendChild(this.labelsGroup);

    const fingerGuideLetters = {
      L_PINKY:  ['1', 'Q', 'A', 'Z'],
      L_RING:   ['2', 'W', 'S', 'X'],
      L_MIDDLE: ['3', 'E', 'D', 'C'],
      L_INDEX:  ['4', 'R', 'F', 'V'],
      L_THUMB:  ['SPACE'],
      R_THUMB:  ['SPACE'],
      R_INDEX:  ['7', 'U', 'J', 'M'],
      R_MIDDLE: ['8', 'I', 'K', ','],
      R_RING:   ['9', 'O', 'L', '.'],
      R_PINKY:  ['0', 'P', ';', '/']
    };

    this.fingerLabelElements = {};
    Object.keys(fingerDefs).forEach((fId) => {
      const def = fingerDefs[fId];
      const letters = fingerGuideLetters[fId] || [];
      const fInfo = window.FINGER_INFO[fId];
      const color = fInfo ? fInfo.color : '#64748b';

      const group = document.createElementNS(this.NS, 'g');
      group.setAttribute('class', `guide-group guide-${fId}`);
      group.setAttribute('opacity', this.showFingerZoneColors ? '0.85' : '0');

      if (def.isThumb) {
        const txt = document.createElementNS(this.NS, 'text');
        txt.textContent = 'SPACE';
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
        txt.setAttribute('font-size', '9px');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', color);
        group.appendChild(txt);
      } else {
        letters.forEach((ch) => {
          const txt = document.createElementNS(this.NS, 'text');
          txt.textContent = ch;
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
          txt.setAttribute('font-size', '9px');
          txt.setAttribute('font-weight', '700');
          txt.setAttribute('fill', color);
          group.appendChild(txt);
        });
      }

      this.labelsGroup.appendChild(group);
      this.fingerLabelElements[fId] = group;
    });
  }

  /**
   * 동적 손 실루엣 Path 생성 (캐노니컬 인체 해부학적 베지어 변형)
   */
  computeHandD(isRight) {
    const prefix = isRight ? 'R_' : 'L_';
    const roles = ['pinky', 'ring', 'middle', 'index', 'thumb'];

    // 5개 손가락의 상대적 이동 변위 (Canonical Left Hand 좌표계 기준)
    const deltas = {};
    roles.forEach((r) => {
      const fId = `${prefix}${r.toUpperCase()}`;
      const f = this.fingerStates[fId];
      if (f) {
        const rawDx = f.curX - f.homeX;
        // 오른손의 경우 x 변위 반전 (홈 로우 중심 453.0 기준 대칭)
        const dx = isRight ? -rawDx : rawDx;
        const dy = (f.curY + f.pressOffset * 3.5) - f.homeY;
        deltas[r] = { dx, dy };
      } else {
        deltas[r] = { dx: 0, dy: 0 };
      }
    });

    const dParts = [];
    const N = CANONICAL_SEGMENTS.length;

    for (let sIdx = 0; sIdx < N; sIdx++) {
      const seg = CANONICAL_SEGMENTS[sIdx];
      const cmd = seg.cmd;
      const pts = seg.p;

      // 누적 가중 변위 합산
      let totDx = 0;
      let totDy = 0;
      for (let rIdx = 0; rIdx < roles.length; rIdx++) {
        const r = roles[rIdx];
        const w = FINGER_WEIGHTS[r][sIdx];
        if (w > 0) {
          totDx += deltas[r].dx * w;
          totDy += deltas[r].dy * w;
        }
      }

      const shiftedPts = pts.map(([px, py]) => {
        let sx = px + totDx;
        const sy = py + totDy;
        if (isRight) {
          sx = 906.0 - sx;
        }
        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
      });

      if (cmd === 'M') {
        dParts.push(`M ${shiftedPts[0]}`);
      } else if (cmd === 'C') {
        dParts.push(`C ${shiftedPts[0]} ${shiftedPts[1]} ${shiftedPts[2]}`);
      }
    }

    dParts.push('Z');
    return dParts.join(' ');
  }

  /**
   * 애니메이션 렌더 루프 (60fps)
   */
  startAnimationLoop() {
    const loop = () => {
      // 1. 손가락 좌표 물리 보간 (Eased IK)
      Object.keys(this.fingerStates).forEach((fId) => {
        const f = this.fingerStates[fId];
        f.curX += (f.targetX - f.curX) * 0.25;
        f.curY += (f.targetY - f.curY) * 0.25;

        if (f.pressOffset > 0) {
          f.pressOffset = Math.max(0, f.pressOffset - 0.16);
        }
      });

      // 2. 캐노니컬 양손 실루엣 갱신 (453.0 기준 완전 대칭)
      this.leftHandPath.setAttribute('d', this.computeHandD(false));
      this.rightHandPath.setAttribute('d', this.computeHandD(true));

      // 3. 손톱(Oval Nails) 및 가이드 라벨 갱신
      Object.keys(this.fingerStates).forEach((fId) => {
        const f = this.fingerStates[fId];
        const labelGroup = this.fingerLabelElements[fId];

        const ty = f.curY + f.pressOffset * 3.5;
        const dx = f.curX - f.homeX;
        const angle = f.angle + dx * 0.15;

        // 운지 가이드 텍스트 배치
        if (labelGroup) {
          const children = labelGroup.children;
          if (f.isThumb) {
            if (children[0]) {
              const tx = f.hand === 'left' ? (f.curX - 42) : (f.curX + 42);
              const tyPos = ty + 36;
              const rotAngle = f.hand === 'left' ? 40 : -40;
              children[0].setAttribute('x', tx.toFixed(1));
              children[0].setAttribute('y', tyPos.toFixed(1));
              children[0].setAttribute('transform', `rotate(${rotAngle} ${tx.toFixed(1)} ${tyPos.toFixed(1)})`);
            }
          } else {
            for (let cIdx = 0; cIdx < children.length; cIdx++) {
              const textNode = children[cIdx];
              const dist = 18 + cIdx * 13;
              const lx = f.curX - dist * (-angle * 0.012);
              const ly = ty + dist;
              textNode.setAttribute('x', lx.toFixed(1));
              textNode.setAttribute('y', ly.toFixed(1));
            }
          }
        }
      });

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /**
   * 목표 키 설정 및 담당 손가락 이동
   */
  setTargetKey(keyCode, needShift = false) {
    this.clearTargets();
    if (!keyCode || !window.KEY_MAP[keyCode]) return;

    const targetKey = window.KEY_MAP[keyCode];
    const mainFingerId = targetKey.finger;

    this.highlightKeyAndMoveFinger(keyCode, mainFingerId, true);

    if (needShift) {
      const mainHand = window.FINGER_INFO[mainFingerId].hand;
      const shiftCode = mainHand === 'left' ? 'ShiftRight' : 'ShiftLeft';
      const shiftFingerId = window.KEY_MAP[shiftCode].finger;
      this.highlightKeyAndMoveFinger(shiftCode, shiftFingerId, true);
    }
  }

  /**
   * 기본 운지 구역 오버레이 스타일 복원 (공용 헬퍼)
   */
  applyIdleZoneAppearance(keyEl) {
    if (!keyEl) return;
    const fInfo = window.FINGER_INFO[keyEl.data.finger];
    if (this.showFingerZoneColors && fInfo) {
      keyEl.zoneTint.setAttribute('fill', fInfo.color);
      keyEl.zoneTint.setAttribute('fill-opacity', keyEl.isDarkMod ? '0.18' : '0.16');
      keyEl.zoneTint.setAttribute('stroke', fInfo.color);
      keyEl.zoneTint.setAttribute('stroke-opacity', '0.68');
    } else {
      keyEl.zoneTint.setAttribute('fill', 'transparent');
      keyEl.zoneTint.setAttribute('fill-opacity', '0');
      keyEl.zoneTint.setAttribute('stroke', 'transparent');
      keyEl.zoneTint.setAttribute('stroke-opacity', '0');
    }
  }

  highlightKeyAndMoveFinger(code, fingerId, isTarget = true) {
    const keyEl = this.keyElements[code];
    if (keyEl) {
      this.activeTargetCodes.add(code);
      keyEl.group.classList.add('key-target', 'is-target');
      keyEl.zoneTint.setAttribute('fill', 'url(#handActiveGrad)');
      keyEl.zoneTint.setAttribute('fill-opacity', '0.96');
      keyEl.zoneTint.setAttribute('stroke', '#FED7AA');
      keyEl.zoneTint.setAttribute('stroke-opacity', '0.95');
    }

    const f = this.fingerStates[fingerId];
    if (f && keyEl) {
      f.isTarget = isTarget;
      if (f.isThumb) {
        f.targetX = f.hand === 'left' ? 418.0 : (906.0 - 418.0);
        f.targetY = 288.1;
      } else {
        // 목표 키의 중심 좌표로 손가락 끝 이동
        f.targetX = keyEl.data.cx;
        f.targetY = keyEl.data.cy + 2;
      }
    }
  }

  /**
   * 모든 타겟 강조 해제 및 손가락 홈 복귀
   */
  clearTargets() {
    this.activeTargetCodes.forEach((code) => {
      const keyEl = this.keyElements[code];
      if (keyEl) {
        keyEl.group.classList.remove('key-target', 'is-target');
        this.applyIdleZoneAppearance(keyEl);
      }
    });
    this.activeTargetCodes.clear();

    Object.keys(this.fingerStates).forEach((fId) => {
      const f = this.fingerStates[fId];
      f.isTarget = false;
      f.isHeld = false;
      f.targetX = f.homeX;
      f.targetY = f.homeY;
    });
  }

  /**
   * 키 입력 피드백 탭 모션
   */
  triggerKeyPress(keyCode, isCorrect = true) {
    const keyEl = this.keyElements[keyCode];
    if (!keyEl) return;

    const fingerId = keyEl.data.finger;
    const fState = this.fingerStates[fingerId];

    keyEl.group.classList.remove('pressed-ok', 'pressed-err');
    void keyEl.group.offsetWidth;
    keyEl.group.classList.add(isCorrect ? 'pressed-ok' : 'pressed-err');

    if (fState) {
      fState.pressOffset = 1.0;
    }

    clearTimeout(keyEl._pressTimer);
    keyEl._pressTimer = setTimeout(() => {
      keyEl.group.classList.remove('pressed-ok', 'pressed-err');
    }, 180);
  }

  /**
   * 키 홀드 상태 처리
   */
  setKeyHoldState(keyCode, isHeld, dwellMsText = '') {
    const keyEl = this.keyElements[keyCode];
    if (!keyEl) return;

    const fingerId = keyEl.data.finger;
    const fState = this.fingerStates[fingerId];

    if (isHeld) {
      clearTimeout(keyEl._pressTimer);
      keyEl.group.classList.remove('pressed-err');
      keyEl.group.classList.add('pressed-ok');
      if (fState) {
        fState.isHeld = true;
        fState.pressOffset = 0.8;
      }
      if (dwellMsText) {
        keyEl.metricLabel.textContent = dwellMsText;
        keyEl.metricLabel.style.display = 'block';
      }
    } else {
      keyEl.group.classList.remove('pressed-ok');
      if (fState) {
        fState.isHeld = false;
        fState.pressOffset = 0;
      }
      if (!this.heatmapMode) {
        keyEl.metricLabel.style.display = 'none';
      }
    }
  }

  /**
   * 언어 전환
   */
  setLanguage(lang) {
    this.lang = lang;
    this.updateKeyLabels();
  }

  updateKeyLabels() {
    Object.values(this.keyElements).forEach(({ data, mainLabel, subLabel }) => {
      if (data.isModifier || data.code === 'Space') {
        mainLabel.textContent = this.lang === 'ko' ? data.ko : data.en;
        subLabel.textContent = '';
        return;
      }

      if (this.lang === 'ko') {
        mainLabel.textContent = data.ko || '';
        subLabel.textContent = data.en || '';
      } else {
        mainLabel.textContent = data.en || '';
        subLabel.textContent = data.ko || '';
      }
    });
  }

  /**
   * 손 투명도 조절
   */
  setHandOpacity(opacity) {
    this.handOpacity = opacity;
    if (this.handsGroup) {
      this.handsGroup.style.opacity = opacity;
    }
  }

  /**
   * 운지법 구역 색상 토글
   */
  setShowZoneColors(show) {
    this.showFingerZoneColors = show;
    Object.values(this.keyElements).forEach((keyEl) => {
      if (this.activeTargetCodes.has(keyEl.data.code)) return;
      this.applyIdleZoneAppearance(keyEl);
    });

    if (this.fingerLabelElements) {
      Object.values(this.fingerLabelElements).forEach((group) => {
        group.setAttribute('opacity', show ? '0.85' : '0');
      });
    }
  }

  /**
   * 히트맵 모드 전환
   */
  renderHeatmap(keyStats) {
    this.heatmapMode = !this.heatmapMode;
    Object.values(this.keyElements).forEach((keyEl) => {
      const { data, group, zoneTint, metricLabel } = keyEl;
      if (!this.heatmapMode) {
        group.classList.remove('is-heatmap');
        metricLabel.style.display = 'none';
        this.applyIdleZoneAppearance(keyEl);
        return;
      }

      group.classList.add('is-heatmap');
      const stat = keyStats[data.code];
      if (stat && stat.count > 0) {
        const ms = Math.round(stat.totalMs / stat.count);
        metricLabel.textContent = `${ms}ms`;
        metricLabel.style.display = 'block';

        let color = '#14B8A6';
        if (ms > 350) color = '#E11D48';
        else if (ms > 220) color = '#F97316';
        else if (ms > 150) color = '#0284C7';

        zoneTint.setAttribute('fill', color);
        zoneTint.setAttribute('fill-opacity', '0.42');
        zoneTint.setAttribute('stroke', color);
        zoneTint.setAttribute('stroke-opacity', '0.9');
      } else {
        metricLabel.style.display = 'none';
        zoneTint.setAttribute('fill', 'transparent');
        zoneTint.setAttribute('fill-opacity', '0');
      }
    });
    return this.heatmapMode;
  }
}

window.KeyboardHandRenderer = KeyboardHandRenderer;
