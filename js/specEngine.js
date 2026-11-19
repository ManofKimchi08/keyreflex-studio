/**
 * KeyReflex CodeLab - 스펙(JSON Schema) 검증 & 시스템 아키텍처 다이어그램(Mermaid Subset) 엔진
 * - 외부 라이브러리/CDN 없이 오프라인 100% 동작
 * - JSON Schema Draft 검증 + Flowchart/Sequence 다이어그램 구조 파싱 & 실시간 SVG 렌더링
 */
(function (global) {
  'use strict';

  class SpecEngine {
    static escapeXml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /**
     * JSON Schema 간이 표준 검증기 (재귀 지원)
     * 지원 키워드: type, properties, required, additionalProperties, enum,
     *            minimum, maximum, minLength, maxLength, pattern, minItems, items
     */
    static validateValueAgainstSchema(val, schema, path = '$') {
      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return { valid: false, reason: `${path}: 유효한 스키마 객체가 아닙니다.` };
      }

      if (schema.enum !== undefined) {
        if (!Array.isArray(schema.enum)) {
          return { valid: false, reason: `${path}: enum은 배열이어야 합니다.` };
        }
        const matched = schema.enum.some(opt => JSON.stringify(opt) === JSON.stringify(val));
        if (!matched) {
          return { valid: false, reason: `${path}: 허용된 enum(${JSON.stringify(schema.enum)}) 값이 아닙니다.` };
        }
      }

      if (schema.type !== undefined) {
        const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
        const typeOk = expectedTypes.some(t => SpecEngine.matchesJsonType(val, t));
        if (!typeOk) {
          return { valid: false, reason: `${path}: 타입 불일치 (기대: ${expectedTypes.join('|')})` };
        }
      }

      if (typeof val === 'string') {
        if (typeof schema.minLength === 'number' && val.length < schema.minLength) {
          return { valid: false, reason: `${path}: 문자열 길이(${val.length}) < minLength(${schema.minLength})` };
        }
        if (typeof schema.maxLength === 'number' && val.length > schema.maxLength) {
          return { valid: false, reason: `${path}: 문자열 길이(${val.length}) > maxLength(${schema.maxLength})` };
        }
        if (typeof schema.pattern === 'string') {
          try {
            const re = new RegExp(schema.pattern);
            if (!re.test(val)) {
              return { valid: false, reason: `${path}: 패턴 /${schema.pattern}/ 불일치` };
            }
          } catch (e) {
            return { valid: false, reason: `${path}: 잘못된 정규표현식 패턴(${e.message})` };
          }
        }
      }

      if (typeof val === 'number') {
        if (typeof schema.minimum === 'number' && val < schema.minimum) {
          return { valid: false, reason: `${path}: 값(${val}) < minimum(${schema.minimum})` };
        }
        if (typeof schema.maximum === 'number' && val > schema.maximum) {
          return { valid: false, reason: `${path}: 값(${val}) > maximum(${schema.maximum})` };
        }
      }

      if (Array.isArray(val)) {
        if (typeof schema.minItems === 'number' && val.length < schema.minItems) {
          return { valid: false, reason: `${path}: 배열 원소 수(${val.length}) < minItems(${schema.minItems})` };
        }
        if (schema.items) {
          for (let i = 0; i < val.length; i++) {
            const itemRes = SpecEngine.validateValueAgainstSchema(val[i], schema.items, `${path}[${i}]`);
            if (!itemRes.valid) return itemRes;
          }
        }
      }

      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        const props = (schema.properties && typeof schema.properties === 'object') ? schema.properties : {};
        if (Array.isArray(schema.required)) {
          for (const reqKey of schema.required) {
            if (!Object.prototype.hasOwnProperty.call(val, reqKey)) {
              return { valid: false, reason: `${path}.${reqKey}: 필수(required) 필드 누락` };
            }
          }
        }
        for (const [k, propVal] of Object.entries(val)) {
          if (Object.prototype.hasOwnProperty.call(props, k)) {
            const childRes = SpecEngine.validateValueAgainstSchema(propVal, props[k], `${path}.${k}`);
            if (!childRes.valid) return childRes;
          } else if (schema.additionalProperties === false) {
            return { valid: false, reason: `${path}.${k}: additionalProperties=false 규칙 위반` };
          }
        }
      }

      return { valid: true, reason: '유효' };
    }

    static matchesJsonType(val, typeName) {
      if (typeName === 'null') return val === null;
      if (typeName === 'array') return Array.isArray(val);
      if (typeName === 'object') return val !== null && typeof val === 'object' && !Array.isArray(val);
      if (typeName === 'integer') return typeof val === 'number' && Number.isInteger(val);
      if (typeName === 'number') return typeof val === 'number' && !Number.isNaN(val);
      if (typeName === 'string') return typeof val === 'string';
      if (typeName === 'boolean') return typeof val === 'boolean';
      return false;
    }

    /**
     * JSON Schema 스펙 검증 실행
     */
    static runSchemaTests(schemaText, tests) {
      const startMs = performance.now();
      let schema;
      try {
        schema = JSON.parse(schemaText);
      } catch (err) {
        return {
          success: false,
          error: `[JSON Schema 문법 오류]: ${err.message}`,
          tests: [],
          logs: [],
          elapsedMs: (performance.now() - startMs).toFixed(2),
          allPassed: false
        };
      }

      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
        return {
          success: false,
          error: '[JSON Schema 오류]: 최상위는 JSON 객체({ ... })여야 합니다.',
          tests: [],
          logs: [],
          elapsedMs: (performance.now() - startMs).toFixed(2),
          allPassed: false
        };
      }

      const logs = [];
      const results = (tests || []).map((t, idx) => {
        const payload = Array.isArray(t.input) ? t.input[0] : t.input;
        const checkRes = SpecEngine.validateValueAgainstSchema(payload, schema);
        const passed = checkRes.valid === Boolean(t.expected);
        logs.push(
          `[${passed ? 'PASS' : 'FAIL'}] ${t.name || `케이스 ${idx + 1}`}: 판정=${checkRes.valid} (기대=${Boolean(t.expected)}) · ${checkRes.reason}`
        );
        return {
          name: t.name || `테스트 ${idx + 1}`,
          input: t.input,
          expected: Boolean(t.expected),
          actual: checkRes.valid,
          passed
        };
      });

      return {
        success: true,
        tests: results,
        logs,
        elapsedMs: (performance.now() - startMs).toFixed(2),
        allPassed: results.every(r => r.passed)
      };
    }

    /**
     * Mermaid 스타일 Flowchart / Sequence 다이어그램 파서
     */
    static parseDiagram(dslText) {
      const lines = (dslText || '').replace(/\r\n/g, '\n').split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('%%'));

      if (lines.length === 0) {
        return { kind: 'unknown', header: '', nodes: new Map(), edges: [], participants: [], messages: [], error: '다이어그램 코드가 비어 있습니다.' };
      }

      const header = lines[0];
      if (/^(flowchart|graph)\b/i.test(header)) {
        return SpecEngine.parseFlowchart(header, lines.slice(1));
      }
      if (/^sequenceDiagram\b/i.test(header)) {
        return SpecEngine.parseSequence(header, lines.slice(1));
      }
      return {
        kind: 'unknown',
        header,
        nodes: new Map(),
        edges: [],
        participants: [],
        messages: [],
        error: `첫 줄은 'flowchart LR', 'flowchart TD' 또는 'sequenceDiagram' 이어야 합니다. (현재: '${header}')`
      };
    }

    static parseNodeToken(rawToken) {
      const tok = (rawToken || '').trim();
      const patterns = [
        { re: /^([A-Za-z0-9_]+)\[\((.+?)\)\]$/, shape: 'db' },
        { re: /^([A-Za-z0-9_]+)\[(.+?)\]$/, shape: 'rect' },
        { re: /^([A-Za-z0-9_]+)\{(.+?)\}$/, shape: 'diamond' },
        { re: /^([A-Za-z0-9_]+)\((.+?)\)$/, shape: 'round' },
        { re: /^([A-Za-z0-9_]+)$/, shape: 'rect' }
      ];
      for (const pat of patterns) {
        const m = tok.match(pat.re);
        if (m) {
          return { id: m[1], label: (m[2] || m[1]).trim(), shape: pat.shape };
        }
      }
      return null;
    }

    static parseFlowchart(header, bodyLines) {
      const nodes = new Map();
      const edges = [];
      const dirMatch = header.match(/^(?:flowchart|graph)\s+(LR|RL|TD|TB|BT)\b/i);
      const direction = dirMatch ? dirMatch[1].toUpperCase() : 'LR';

      const ensureNode = (spec) => {
        if (!spec) return null;
        const existing = nodes.get(spec.id);
        if (!existing) {
          nodes.set(spec.id, { id: spec.id, label: spec.label, shape: spec.shape });
        } else if (spec.label !== spec.id) {
          existing.label = spec.label;
          existing.shape = spec.shape;
        }
        return spec.id;
      };

      const edgeRe = /^(.+?)\s*(-->|-\.->|==>)\s*(?:\|([^|]+)\|\s*)?(.+)$/;
      for (const line of bodyLines) {
        const m = line.match(edgeRe);
        if (m) {
          const fromSpec = SpecEngine.parseNodeToken(m[1]);
          const toSpec = SpecEngine.parseNodeToken(m[4]);
          if (fromSpec && toSpec) {
            const fromId = ensureNode(fromSpec);
            const toId = ensureNode(toSpec);
            edges.push({
              from: fromId,
              to: toId,
              label: (m[3] || '').trim(),
              style: m[2]
            });
          }
          continue;
        }
        const single = SpecEngine.parseNodeToken(line);
        if (single) ensureNode(single);
      }

      return { kind: 'flowchart', header, direction, nodes, edges, participants: [], messages: [], error: null };
    }

    static parseSequence(header, bodyLines) {
      const participants = [];
      const participantLabels = new Map();
      const messages = [];

      const addParticipant = (id, alias) => {
        if (!id) return;
        if (!participantLabels.has(id)) {
          participants.push(id);
          participantLabels.set(id, alias || id);
        } else if (alias && alias !== id) {
          participantLabels.set(id, alias);
        }
      };

      const msgRe = /^([A-Za-z0-9_]+)\s*(-->>|->>|-->|->)\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/;
      const partRe = /^participant\s+([A-Za-z0-9_]+)(?:\s+as\s+(.+))?$/i;

      for (const line of bodyLines) {
        const pm = line.match(partRe);
        if (pm) {
          addParticipant(pm[1], (pm[2] || pm[1]).trim());
          continue;
        }
        const mm = line.match(msgRe);
        if (mm) {
          addParticipant(mm[1], mm[1]);
          addParticipant(mm[3], mm[3]);
          messages.push({
            from: mm[1],
            arrow: mm[2],
            to: mm[3],
            text: (mm[4] || '').trim(),
            isDashed: mm[2].startsWith('--')
          });
        }
      }

      return {
        kind: 'sequence',
        header,
        nodes: new Map(),
        edges: [],
        participants: participants.map(id => ({ id, label: participantLabels.get(id) })),
        messages,
        error: null
      };
    }

    /**
     * Flowchart / Sequence 구조 테스트 채점
     */
    static runDiagramTests(dslText, tests) {
      const startMs = performance.now();
      const parsed = SpecEngine.parseDiagram(dslText);
      if (parsed.error) {
        return {
          success: false,
          error: `[다이어그램 구문 오류]: ${parsed.error}`,
          tests: [],
          logs: [],
          elapsedMs: (performance.now() - startMs).toFixed(2),
          allPassed: false
        };
      }

      const logs = [];
      if (parsed.kind === 'flowchart') {
        logs.push(`Flowchart (${parsed.direction}): 노드 ${parsed.nodes.size}개, 연결선 ${parsed.edges.length}개 인식됨`);
      } else if (parsed.kind === 'sequence') {
        logs.push(`Sequence Diagram: 참여자 ${parsed.participants.length}개, 메시지 ${parsed.messages.length}개 인식됨`);
      }

      const results = (tests || []).map((t, idx) => {
        const spec = Array.isArray(t.input) ? t.input[0] : t.input;
        let passed = false;
        let actualSummary = '';

        if (spec && spec.kind === 'edge') {
          const hit = parsed.edges.find(e => e.from === spec.from && e.to === spec.to);
          const labelOk = !spec.labelIncludes || (hit && hit.label.includes(spec.labelIncludes));
          passed = Boolean(hit && labelOk);
          actualSummary = hit ? `${hit.from}->${hit.to}${hit.label ? `(${hit.label})` : ''}` : '연결 없음';
        } else if (spec && spec.kind === 'node') {
          const node = parsed.nodes.get(spec.id);
          passed = Boolean(node && (!spec.shape || node.shape === spec.shape));
          actualSummary = node ? `${node.id}[${node.label}]` : '노드 없음';
        } else if (spec && spec.kind === 'message') {
          const msg = parsed.messages.find(m =>
            m.from === spec.from &&
            m.to === spec.to &&
            (!spec.textIncludes || m.text.toLowerCase().includes(String(spec.textIncludes).toLowerCase())) &&
            (spec.isDashed === undefined || m.isDashed === spec.isDashed)
          );
          passed = Boolean(msg);
          actualSummary = msg ? `${msg.from}${msg.arrow}${msg.to}: ${msg.text}` : '메시지 없음';
        } else if (spec && spec.kind === 'minCount') {
          const nodeCount = parsed.kind === 'flowchart' ? parsed.nodes.size : parsed.participants.length;
          const edgeCount = parsed.kind === 'flowchart' ? parsed.edges.length : parsed.messages.length;
          passed = nodeCount >= (spec.nodes || 0) && edgeCount >= (spec.edges || 0);
          actualSummary = `요소=${nodeCount}, 흐름=${edgeCount}`;
        } else if (spec && spec.kind === 'direction') {
          passed = parsed.kind === 'flowchart' && parsed.direction === String(spec.direction).toUpperCase();
          actualSummary = parsed.direction || parsed.kind;
        }

        const expectedBool = t.expected !== undefined ? Boolean(t.expected) : true;
        return {
          name: t.name || `구조 검증 ${idx + 1}`,
          input: t.input,
          expected: expectedBool,
          actual: passed,
          detail: actualSummary,
          passed: passed === expectedBool
        };
      });

      return {
        success: true,
        tests: results,
        logs,
        elapsedMs: (performance.now() - startMs).toFixed(2),
        allPassed: results.every(r => r.passed)
      };
    }

    /**
     * Flowchart / Sequence 다이어그램 실시간 SVG 생성 (OLED 스튜디오 테마)
     */
    static renderDiagramSVG(dslText) {
      const parsed = SpecEngine.parseDiagram(dslText);
      if (parsed.error) {
        return `<div class="diagram-error-msg">⚠️ ${SpecEngine.escapeXml(parsed.error)}</div>`;
      }
      if (parsed.kind === 'flowchart') {
        return SpecEngine.renderFlowchartSVG(parsed);
      }
      if (parsed.kind === 'sequence') {
        return SpecEngine.renderSequenceSVG(parsed);
      }
      return '';
    }

    static renderFlowchartSVG(parsed) {
      const nodeList = Array.from(parsed.nodes.values());
      if (nodeList.length === 0) {
        return `<div class="diagram-error-msg">노드를 입력하면 아키텍처 다이어그램이 실시간으로 그려집니다.</div>`;
      }

      // BFS topological layer assignment
      const inDeg = new Map(nodeList.map(n => [n.id, 0]));
      const adj = new Map(nodeList.map(n => [n.id, []]));
      parsed.edges.forEach(e => {
        if (adj.has(e.from) && inDeg.has(e.to)) {
          adj.get(e.from).push(e.to);
          inDeg.set(e.to, inDeg.get(e.to) + 1);
        }
      });

      const level = new Map();
      const q = [];
      nodeList.forEach(n => {
        if ((inDeg.get(n.id) || 0) === 0) {
          level.set(n.id, 0);
          q.push(n.id);
        }
      });
      if (q.length === 0) {
        level.set(nodeList[0].id, 0);
        q.push(nodeList[0].id);
      }

      let qi = 0;
      while (qi < q.length) {
        const cur = q[qi++];
        const curLv = level.get(cur) || 0;
        for (const nxt of (adj.get(cur) || [])) {
          if (!level.has(nxt)) {
            level.set(nxt, curLv + 1);
            q.push(nxt);
          }
        }
      }
      nodeList.forEach(n => {
        if (!level.has(n.id)) level.set(n.id, 0);
      });

      const layers = new Map();
      nodeList.forEach(n => {
        const lv = level.get(n.id) || 0;
        if (!layers.has(lv)) layers.set(lv, []);
        layers.get(lv).push(n);
      });

      const isVertical = parsed.direction === 'TD' || parsed.direction === 'TB';
      const boxW = 114;
      const boxH = 38;
      const gapX = isVertical ? 26 : 48;
      const gapY = isVertical ? 44 : 24;
      const pad = 20;

      const coords = new Map();
      const sortedLevels = Array.from(layers.keys()).sort((a, b) => a - b);
      let maxW = 320;
      let maxH = 110;

      sortedLevels.forEach((lv, li) => {
        const group = layers.get(lv);
        group.forEach((n, gi) => {
          const x = isVertical ? (pad + gi * (boxW + gapX)) : (pad + li * (boxW + gapX));
          const y = isVertical ? (pad + li * (boxH + gapY)) : (pad + gi * (boxH + gapY));
          coords.set(n.id, { x, y, cx: x + boxW / 2, cy: y + boxH / 2, node: n });
          maxW = Math.max(maxW, x + boxW + pad);
          maxH = Math.max(maxH, y + boxH + pad);
        });
      });

      const edgesSvg = parsed.edges.map(e => {
        const a = coords.get(e.from);
        const b = coords.get(e.to);
        if (!a || !b) return '';
        const x1 = isVertical ? a.cx : a.x + boxW;
        const y1 = isVertical ? a.y + boxH : a.cy;
        const x2 = isVertical ? b.cx : b.x;
        const y2 = isVertical ? b.y : b.cy;
        const dash = e.style === '-.->' ? ' stroke-dasharray="4 3"' : '';
        const labelEl = e.label
          ? `<rect x="${(x1 + x2) / 2 - 26}" y="${(y1 + y2) / 2 - 9}" width="52" height="16" rx="4" fill="#100f14" stroke="#334155" stroke-width="1"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + 3}" text-anchor="middle" fill="#fdba74" font-size="9" font-family="monospace">${SpecEngine.escapeXml(e.label.slice(0, 10))}</text>`
          : '';
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#14b8a6" stroke-width="1.8"${dash} marker-end="url(#specArrow)"/>${labelEl}`;
      }).join('');

      const nodesSvg = Array.from(coords.values()).map(({ x, y, cx, cy, node }) => {
        const rx = node.shape === 'round' ? 16 : node.shape === 'diamond' ? 4 : 7;
        const stroke = node.shape === 'diamond' ? '#f97316' : node.shape === 'db' ? '#818cf8' : '#2dd4bf';
        const fill = node.shape === 'diamond' ? '#251a14' : '#18171f';
        const lbl = SpecEngine.escapeXml(node.label.slice(0, 16));
        return `<g><rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#f3f1ea" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif">${lbl}</text></g>`;
      }).join('');

      return `<svg class="spec-diagram-svg" viewBox="0 0 ${maxW} ${maxH}" xmlns="http://www.w3.org/2000/svg">
        <defs><marker id="specArrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><polygon points="0 0, 8 3.5, 0 7" fill="#14b8a6"/></marker></defs>
        ${edgesSvg}${nodesSvg}
      </svg>`;
    }

    static renderSequenceSVG(parsed) {
      const parts = parsed.participants;
      if (parts.length === 0) {
        return `<div class="diagram-error-msg">참여자와 메시지(->>)를 입력하면 시퀀스 다이어그램이 그려집니다.</div>`;
      }
      const colW = 112;
      const padX = 24;
      const topY = 14;
      const headH = 26;
      const rowH = 30;
      const width = Math.max(320, padX * 2 + (parts.length - 1) * colW + 90);
      const height = topY + headH + Math.max(1, parsed.messages.length) * rowH + 22;

      const xPos = new Map();
      const actorsSvg = parts.map((p, idx) => {
        const cx = padX + 45 + idx * colW;
        xPos.set(p.id, cx);
        return `
          <line x1="${cx}" y1="${topY + headH}" x2="${cx}" y2="${height - 10}" stroke="#334155" stroke-width="1.2" stroke-dasharray="4 3"/>
          <rect x="${cx - 44}" y="${topY}" width="88" height="${headH}" rx="6" fill="#1b1a23" stroke="#2dd4bf" stroke-width="1.3"/>
          <text x="${cx}" y="${topY + 17}" text-anchor="middle" fill="#f3f1ea" font-size="10.5" font-weight="700">${SpecEngine.escapeXml(p.label.slice(0, 12))}</text>
        `;
      }).join('');

      const msgsSvg = parsed.messages.map((m, i) => {
        const x1 = xPos.get(m.from) || 60;
        const x2 = xPos.get(m.to) || 180;
        const y = topY + headH + 18 + i * rowH;
        const stroke = m.isDashed ? '#fb923c' : '#38bdf8';
        const dash = m.isDashed ? ' stroke-dasharray="4 3"' : '';
        const marker = m.isDashed ? 'url(#seqArrowDash)' : 'url(#seqArrowSolid)';
        const midX = (x1 + x2) / 2;
        return `
          <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${stroke}" stroke-width="1.6"${dash} marker-end="${marker}"/>
          <text x="${midX}" y="${y - 5}" text-anchor="middle" fill="#e2e8f0" font-size="9.5" font-family="monospace">${SpecEngine.escapeXml(m.text.slice(0, 26))}</text>
        `;
      }).join('');

      return `<svg class="spec-diagram-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="seqArrowSolid" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0, 7 3.5, 0 7" fill="#38bdf8"/></marker>
          <marker id="seqArrowDash" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0, 7 3.5, 0 7" fill="#fb923c"/></marker>
        </defs>
        ${actorsSvg}${msgsSvg}
      </svg>`;
    }

    static run(codeText, lesson) {
      if (!lesson) {
        return { success: false, error: '활성 스펙 레슨을 찾을 수 없습니다.', tests: [], logs: [], elapsedMs: 0, allPassed: false };
      }
      if (lesson.specKind === 'diagram') {
        return SpecEngine.runDiagramTests(codeText, lesson.tests);
      }
      return SpecEngine.runSchemaTests(codeText, lesson.tests);
    }
  }

  global.SpecEngine = SpecEngine;
})(window);
