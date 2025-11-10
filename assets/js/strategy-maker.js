function init() {
  const root = document.getElementById('strategy-maker-root');
  if (!root) return;
  const siteBody = document.getElementById('lqd-site-content') || document.body;
  siteBody.classList.add('min-h-screen', 'bg-slate-950', 'text-slate-100', 'antialiased');

    // -----------------------------
    // Multiplier dataset (user managed)
    // -----------------------------
    const SAMPLE_MULTIPLIERS = [
      "1.89x", "7.16x", "1.7x", "4.42x", "3.51x", "2.85x", "3.38x", "3.48x", "1.13x", "1.64x"
    ].map(s => parseFloat(s.replace(/x$/i, '')));

    let multipliers = [];
    let pendingCsvSessions = [];
    let pendingCsvFileName = '';
    // -----------------------------
    // Constants (bankroll logic)
    // -----------------------------
    const INITIAL_BANKROLL = 5000;
    const INITIAL_BET = INITIAL_BANKROLL * 0.015; // => 75
    const MARTI_SEQ = [1.00, 1.37, 1.88, 2.58, 3.54, 4.85, 6.65, 9.12, 12.50];

    // -----------------------------
    // UI helpers (multiplier pill colors)
    // -----------------------------
    const multisWrap = document.getElementById('multis');
    const statusEl = document.getElementById('status');
    const statusMessage = (text) => {
      if (statusEl) {
        statusEl.textContent = text || '';
      }
    };
    const formatMult = (x) => x.toFixed(2);
    const formatAmount = (value) => Number.isFinite(value)
      ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '0.00';

    function hexToRgba(hex, alpha = 1) {
      let h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h, 16);
      const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    function colorForMultiplier(m) {
      if (m < 2) return '#34b4ff';   // < 2
      if (m < 10) return '#913ef8';  // >= 2 and < 10
      return '#c017b4';              // >= 10
    }
    function renderLastMultipliers(list) {
      if (!multisWrap) return;
      multisWrap.innerHTML = '';
      list.slice(-25).reverse().forEach(m => {
        const primary = colorForMultiplier(m);
        const pill = document.createElement('span');
        pill.className = 'px-2.5 py-1 rounded-full border text-xs mono w-fit';
        pill.style.color = primary;
        pill.style.borderColor = primary;
        pill.style.backgroundColor = hexToRgba(primary, 0.15);
        pill.textContent = formatMult(m);
        multisWrap.appendChild(pill);
      });
    }

    function formatMultiplierLabel(value) {
      if (!Number.isFinite(value)) return '';
      const normalized = Number(value.toFixed(2));
      return `${normalized.toString()}x`;
    }

    function multipliersToText(list) {
      return list.length
        ? list.map(formatMultiplierLabel).map(label => `"${label}"`).join(',\n')
        : '';
    }

    function parseMultiplierInput(text) {
      return text
        .split(/[\s,]+/)
        .map(token => token.trim().replace(/^['"]+|['"]+$/g, ''))
        .filter(Boolean)
        .map(token => parseFloat(token.replace(/x$/i, '')))
        .filter(num => !Number.isNaN(num) && num > 0);
    }

    function parseMultipliersFromCsv(content) {
      if (typeof content !== 'string' || !content.trim()) {
        return [];
      }

      const lines = content
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      const sessions = [];
      let current = null;

      const pushCurrent = () => {
        if (current && current.multipliers.length) {
          sessions.push({ ...current, multipliers: current.multipliers.slice() });
        }
      };

      lines.forEach((line) => {
        const cells = line.split(';').map(cell => cell.trim());
        const headerIndex = cells.findIndex(cell => cell.toLowerCase() === 'multiplier');
        const isHeader = headerIndex !== -1;

        if (isHeader) {
          pushCurrent();
          current = {
            header: line,
            multiplierColumn: headerIndex,
            multipliers: [],
            startLabel: '',
          };
          return;
        }

        if (!current || current.multiplierColumn === -1) {
          return;
        }

        if (cells.length <= current.multiplierColumn) {
          return;
        }

        let rawValue = cells[current.multiplierColumn];
        if (!rawValue) {
          return;
        }

        rawValue = rawValue.replace(/^['"]+|['"]+$/g, '');
        if (rawValue.includes(',') && !rawValue.includes('.')) {
          rawValue = rawValue.replace(/,/g, '.');
        }
        rawValue = rawValue.replace(/x$/i, '');
        const value = parseFloat(rawValue);
        if (Number.isNaN(value) || value <= 0) {
          return;
        }

        current.multipliers.push(value);

        if (!current.startLabel) {
          const firstCell = cells[0] || '';
          const timestamp = firstCell.split(',')[0].trim();
          if (timestamp) {
            current.startLabel = timestamp;
          } else {
            const match = line.match(/\d{4}\/\d{2}\/\d{2}|\d{2}:\d{2}:\d{2}/);
            if (match && match[0]) {
              current.startLabel = match[0];
            }
          }
        }
      });

      pushCurrent();

      return sessions.map((session, index) => {
        const count = session.multipliers.length;
        const suffix = count === 1 ? 'multiplier' : 'multipliers';
        return {
          label: `Session ${index + 1} - ${count} ${suffix}`,
          header: session.header,
          multipliers: session.multipliers,
          startLabel: session.startLabel || '',
        };
      });
    }

    function clearPendingSessions() {
      pendingCsvSessions = [];
      pendingCsvFileName = '';
      if (multipliersSessionsWrap) {
        multipliersSessionsWrap.classList.add('hidden');
      }
      if (multipliersSessionSelect) {
        multipliersSessionSelect.innerHTML = '';
        multipliersSessionSelect.value = '';
      }
      if (multipliersSessionDetails) {
        multipliersSessionDetails.textContent = '';
        multipliersSessionDetails.classList.add('hidden');
      }
    }

    function updateSessionDetailText() {
      if (!multipliersSessionDetails) {
        return;
      }

      if (!multipliersSessionSelect || !multipliersSessionSelect.value) {
        multipliersSessionDetails.textContent = '';
        multipliersSessionDetails.classList.add('hidden');
        return;
      }

      const idx = parseInt(multipliersSessionSelect.value, 10);
      if (!Number.isInteger(idx) || !pendingCsvSessions[idx]) {
        multipliersSessionDetails.textContent = '';
        multipliersSessionDetails.classList.add('hidden');
        return;
      }

      const session = pendingCsvSessions[idx];
      const details = [`${session.multipliers.length} multipliers`];
      if (session.startLabel) {
        details.push(`starting ${session.startLabel}`);
      }
      if (pendingCsvFileName) {
        details.push(pendingCsvFileName);
      }

      multipliersSessionDetails.textContent = details.join(' • ');
      multipliersSessionDetails.classList.remove('hidden');
    }

    function renderSessionChooser(sessions) {
      if (!multipliersSessionsWrap || !multipliersSessionSelect) {
        return;
      }

      multipliersSessionSelect.innerHTML = '';

      sessions.forEach((session, index) => {
        const option = document.createElement('option');
        option.value = index.toString();
        option.textContent = session.label || `Session ${index + 1}`;
        multipliersSessionSelect.appendChild(option);
      });

      if (sessions.length) {
        multipliersSessionSelect.value = '0';
      }

      multipliersSessionsWrap.classList.remove('hidden');
      updateSessionDetailText();
    }

    function readFileAsText(file) {
      return new Promise((resolve, reject) => {
        if (typeof FileReader === 'undefined') {
          reject(new Error('FileReader is not supported'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve(typeof reader.result === 'string' ? reader.result : '');
        };
        reader.onerror = () => {
          reject(reader.error);
        };
        reader.readAsText(file);
      });
    }

    function renderMultipliersPreview(list) {
      if (!multipliersPreview) return;
      multipliersPreview.innerHTML = '';
      if (!list.length) {
        const empty = document.createElement('p');
        empty.className = 'text-xs text-slate-500';
        empty.textContent = 'No multipliers configured yet.';
        multipliersPreview.appendChild(empty);
        return;
      }
      const previewSlice = list.slice(0, 150);
      previewSlice.forEach((value) => {
        const primary = colorForMultiplier(value);
        const pill = document.createElement('span');
        pill.className = 'px-2.5 py-1 rounded-full border text-xs mono w-fit';
        pill.style.color = primary;
        pill.style.borderColor = primary;
        pill.style.backgroundColor = hexToRgba(primary, 0.15);
        pill.textContent = formatMultiplierLabel(value);
        multipliersPreview.appendChild(pill);
      });
      if (list.length > previewSlice.length) {
        const more = document.createElement('span');
        more.className = 'text-xs text-slate-500 self-center';
        more.textContent = `+${list.length - previewSlice.length} more`;
        multipliersPreview.appendChild(more);
      }
    }

    function updateMultipliersMeta() {
      if (multipliersCount) {
        multipliersCount.textContent = multipliers.length.toString();
      }
      renderMultipliersPreview(multipliers);
    }

    function syncMultipliersEditor() {
      if (multipliersInput) {
        multipliersInput.value = multipliersToText(multipliers);
      }
      updateMultipliersMeta();
    }

    let multipliersFeedbackTimeout = null;

    function showMultipliersFeedback(message, type = 'success') {
      if (!multipliersFeedback) return;
      multipliersFeedback.textContent = message;
      multipliersFeedback.classList.remove('hidden', 'text-emerald-400', 'text-rose-400');
      multipliersFeedback.classList.add(type === 'error' ? 'text-rose-400' : 'text-emerald-400');
      if (multipliersFeedbackTimeout) clearTimeout(multipliersFeedbackTimeout);
      multipliersFeedbackTimeout = setTimeout(() => {
        if (multipliersFeedback) multipliersFeedback.classList.add('hidden');
      }, 2400);
    }

    function setMultipliers(newList, { keepRunningState = true, clearSessions = true } = {}) {
      const sanitized = newList.filter(num => Number.isFinite(num) && num > 0);
      multipliers = sanitized;
      if (clearSessions && (sanitized.length || !pendingCsvSessions.length)) {
        clearPendingSessions();
      }
      syncMultipliersEditor();

      const hasMultipliers = multipliers.length > 0;
      const previousRunning = running;
      resetSimulation({ keepRunningState, clearStatus: false, skipSave: true });

      if (!hasMultipliers) {
        running = false;
        btnToggle.textContent = 'Resume';
        statusMessage('No multipliers configured. Add values in Settings → Multipliers to run the simulation.');
        saveState();
        return { message: 'Please enter at least one multiplier.', type: 'error', count: 0 };
      }

      const restarted = previousRunning && keepRunningState;
      const message = restarted
        ? 'Simulation restarted with updated multipliers.'
        : 'Multipliers saved. Press Resume to start the simulation.';

      saveState();
      return { message, type: 'success', count: multipliers.length };
    }

    function importMultipliersFromFile(file) {
      if (!file) {
        return;
      }

      if (multipliersFeedback) {
        multipliersFeedback.classList.add('hidden');
      }

      readFileAsText(file)
        .then((text) => {
          const sessions = parseMultipliersFromCsv(text);
          if (!sessions.length) {
            clearPendingSessions();
            const message = 'No multipliers were found in that CSV file.';
            showMultipliersFeedback(message, 'error');
            statusMessage(message);
            return;
          }

          if (sessions.length === 1) {
            const session = sessions[0];
            const result = setMultipliers(session.multipliers, { keepRunningState: true });
            const sessionLabel = session.label ? ` (${session.label})` : '';
            const message = `Imported ${result.count} multipliers from ${file.name || 'CSV file'}${sessionLabel}.`;
            showMultipliersFeedback(message, 'success');
            statusMessage(message);
            return;
          }

          pendingCsvSessions = sessions;
          pendingCsvFileName = file.name || 'CSV file';
          renderSessionChooser(sessions);
          const message = `Found ${sessions.length} sessions in ${pendingCsvFileName}. Select one to import.`;
          showMultipliersFeedback(message, 'success');
          statusMessage(message);
        })
        .catch(() => {
          clearPendingSessions();
          const message = 'Could not read the CSV file. Please try again.';
          showMultipliersFeedback(message, 'error');
          statusMessage(message);
        });
    }

    function setDropZoneActive(isActive) {
      if (!multipliersDropZone) return;
      multipliersDropZone.classList.toggle('border-indigo-400', isActive);
      multipliersDropZone.classList.toggle('border-slate-600', !isActive);
      multipliersDropZone.classList.toggle('bg-slate-900/60', isActive);
      multipliersDropZone.classList.toggle('bg-slate-900/40', !isActive);
    }

    function activateTab(target) {
      tabButtons.forEach((btn) => {
        const isActive = btn.dataset.tab === target;
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.classList.toggle('bg-slate-700', isActive);
        btn.classList.toggle('text-slate-100', isActive);
        btn.classList.toggle('text-slate-400', !isActive);
      });
      tabPanels.forEach((panel) => {
        panel.classList.toggle('hidden', panel.dataset.tabPanel !== target);
      });
    }

    // -----------------------------
    // Chart.js setup (dark)
    // -----------------------------
    const ctx = document.getElementById('chart').getContext('2d');
    const COLOR_PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#3B82F6', '#EF4444', '#14B8A6', '#8B5CF6'];
    const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

    function hslToHex(h, s, l) {
      s /= 100;
      l /= 100;
      const k = n => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = n => l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
      return `#${[f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;
    }

    function generateRandomColor() {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 60 + Math.random() * 20;
      const lightness = 45 + Math.random() * 15;
      return hslToHex(hue, saturation, lightness);
    }

    const maxPointsDefault = 120;
    let tick = 0;
    let labels = Array.from({ length: maxPointsDefault }, (_, i) => i - maxPointsDefault);

    const strategies = [];

    function createTrigger() {
      return { conditions: [] };
    }

    function normalizeCondition(raw) {
      const allowedOps = ['>', '<', '>=', '<=', '=='];
      const pos = parseInt(raw?.pos, 10);
      const value = parseFloat(raw?.value);
      const op = typeof raw?.op === 'string' && allowedOps.includes(raw.op) ? raw.op : '>';
      return {
        pos: Number.isInteger(pos) && pos > 0 ? pos : 1,
        op,
        value: Number.isFinite(value) ? value : 1,
      };
    }

    function buildConditionGroups(conditions) {
      if (!Array.isArray(conditions) || conditions.length === 0) {
        return [];
      }

      return conditions.reduce((groups, condition, index) => {
        if (index === 0) {
          groups.push([condition]);
          return groups;
        }

        const joiner = typeof condition.logic === 'string'
          ? condition.logic.trim().toUpperCase()
          : 'AND';

        if (joiner === 'OR') {
          groups.push([condition]);
        } else if (groups.length) {
          groups[groups.length - 1].push(condition);
        } else {
          groups.push([condition]);
        }

        return groups;
      }, []);
    }

    function normalizeTriggers(saved) {
      const normalized = Array.isArray(saved?.triggers)
        ? saved.triggers.map(trigger => ({
            conditions: Array.isArray(trigger?.conditions)
              ? trigger.conditions.map(normalizeCondition)
              : []
          }))
        : [];

      if (normalized.length) {
        return normalized;
      }

      const legacyGroups = buildConditionGroups(Array.isArray(saved?.conditions) ? saved.conditions : []);
      if (legacyGroups.length) {
        return legacyGroups.map(group => ({
          conditions: group.map(normalizeCondition)
        }));
      }

      return [createTrigger()];
    }
    function normalizeColorList(list) {
      return list.map(color => (color || '').toLowerCase());
    }

    function nextStrategyColor() {
      const used = normalizeColorList(strategies.map(s => s.color));
      const available = COLOR_PALETTE.filter(color => !used.includes(color.toLowerCase()));
      return available.length ? available[0] : generateRandomColor();
    }

    function randomStrategyColor(exclude = []) {
      const used = normalizeColorList(exclude);
      const available = COLOR_PALETTE.filter(color => !used.includes(color.toLowerCase()));
      if (available.length) {
        return available[Math.floor(Math.random() * available.length)];
      }
      return generateRandomColor();
    }

    const STORAGE_KEY = 'strategy-maker-state';

    // Multipliers state
    let usedMultipliers = [];
    let prevMult = null;
    let preloadIdx = 0;

    let defaultCashout = 3.7;

    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.08)' } }
        },
        plugins: {
          legend: { labels: { color: '#cbd5e1' } },
          tooltip: {
            backgroundColor: 'rgba(2,6,23,.95)',
            borderColor: 'rgba(51,65,85,.7)',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
          }
        }
      }
    });

    // -----------------------------

    // Simulation & UI logic
    const btnToggle        = document.getElementById('btnToggle');
    const btnReset         = document.getElementById('btnReset');
    const btnSettings      = document.getElementById('btnSettings');
    const settingsModal    = document.getElementById('settingsModal');
    const settingsClose    = document.getElementById('settingsClose');
    const speedEl          = document.getElementById('speed');
    const windowEl         = document.getElementById('window');
    const strategiesWrap   = document.getElementById('strategiesWrap');
    const addStrategyBtn   = document.getElementById('addStrategy');
    const multipliersInput = document.getElementById('multipliersInput');
    const saveMultipliersBtn = document.getElementById('saveMultipliers');
    const resetMultipliersBtn = document.getElementById('resetMultipliers');
    const multipliersFeedback = document.getElementById('multipliersFeedback');
    const multipliersCount = document.getElementById('multipliersCount');
    const multipliersPreview = document.getElementById('multipliersPreview');
    const multipliersDropZone = document.getElementById('multipliersDropZone');
    const multipliersFileInput = document.getElementById('multipliersFile');
    const multipliersSessionsWrap = document.getElementById('multipliersSessions');
    const multipliersSessionSelect = document.getElementById('multipliersSessionSelect');
    const multipliersSessionDetails = document.getElementById('multipliersSessionDetails');
    const applyMultipliersSessionBtn = document.getElementById('applyMultipliersSession');
    const debugWrap = document.getElementById('debugWrap');
    const tabButtons = Array.from(settingsModal ? settingsModal.querySelectorAll('[data-tab]') : []);
    const tabPanels = Array.from(settingsModal ? settingsModal.querySelectorAll('[data-tab-panel]') : []);

    let running = false;
    let interval = null;

    function resolveWindowLimit(value) {
      if (value === 'all') return null;
      const parsed = parseInt(value, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return maxPointsDefault;
      }
      return parsed;
    }

    function getWindowLimit() {
      if (!windowEl) return maxPointsDefault;
      const limit = resolveWindowLimit(windowEl.value);
      if (limit === maxPointsDefault && windowEl.value !== 'all' && windowEl.value !== maxPointsDefault.toString()) {
        windowEl.value = maxPointsDefault.toString();
      }
      return limit;
    }

    function getInitialSeriesLength() {
      const limit = getWindowLimit();
      if (limit === null) {
        return labels.length || maxPointsDefault;
      }
      return limit;
    }

    function defaultStrategy() {
      const color = nextStrategyColor();
      const seriesLength = getInitialSeriesLength();
      return {
        name: '',
        cashout: defaultCashout,
        betAmount: INITIAL_BET,
        show: true,
        martingale: false,
        sequence: [],
        triggers: [createTrigger()],
        risk: { enabled:false, rounds:0, resumeAbove:0, restart:'start' },
        second: { enabled:false, amount:0, restart:'restart', lockRounds:0 },
        bankroll: INITIAL_BANKROLL,
        martiIdx: 0,
        lossStreak: 0,
        cooldown: false,
        resumeHits: 0,
        data: Array.from({ length: seriesLength }, () => INITIAL_BANKROLL),
        color,
        collapsed: false,
        debug: {
          rounds: [],
          expanded: true,
          selectedRound: null
        }
      };
    }

    function ensureStrategyDebug(strategy) {
      if (!strategy.debug || typeof strategy.debug !== 'object') {
        strategy.debug = { rounds: [], expanded: true, selectedRound: null };
      }
      if (!Array.isArray(strategy.debug.rounds)) {
        strategy.debug.rounds = [];
      }
      if (typeof strategy.debug.expanded !== 'boolean') {
        strategy.debug.expanded = true;
      }
      if (strategy.debug.selectedRound !== null && !Number.isInteger(strategy.debug.selectedRound)) {
        strategy.debug.selectedRound = null;
      }
      if (typeof strategy.debug.feedbackMessage !== 'string') {
        strategy.debug.feedbackMessage = '';
      }
      if (!['success', 'error'].includes(strategy.debug.feedbackTone)) {
        strategy.debug.feedbackTone = 'success';
      }
      if (!('feedbackTimeoutId' in strategy.debug)) {
        strategy.debug.feedbackTimeoutId = null;
      }
    }

    function pushDebugRound(strategy, entry) {
      ensureStrategyDebug(strategy);
      strategy.debug.rounds.push(entry);
      if (strategy.debug.rounds.length > 500) {
        strategy.debug.rounds.shift();
        if (strategy.debug.selectedRound !== null) {
          if (strategy.debug.selectedRound === 0) {
            strategy.debug.selectedRound = null;
          } else {
            strategy.debug.selectedRound = Math.min(strategy.debug.rounds.length - 1, strategy.debug.selectedRound - 1);
          }
        }
      }
    }

    function saveState() {
      const state = {
        speed: speedEl.value,
        window: windowEl.value,
        strategies: strategies.map(({ name, cashout, betAmount, show, martingale, sequence, triggers, risk, second, color, collapsed }) => ({
          name,
          cashout,
          betAmount,
          show,
          martingale,
          sequence,
          triggers: Array.isArray(triggers)
            ? triggers.map(trigger => ({
                conditions: Array.isArray(trigger.conditions)
                  ? trigger.conditions.map(cond => ({
                      pos: cond.pos,
                      op: cond.op,
                      value: cond.value,
                    }))
                  : []
              }))
            : [createTrigger()],
          risk,
          second,
          color,
          collapsed
        })),
        multipliers
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        if (state.speed) speedEl.value = state.speed;
        if (state.window && windowEl) {
          const options = Array.from(windowEl.options || []);
          const optionValues = options.map(opt => opt.value);
          const fallback = maxPointsDefault.toString();
          let selected;
          if (optionValues.includes(state.window)) {
            selected = state.window;
          } else if (state.window === '250') {
            selected = 'all';
          } else {
            selected = fallback;
          }
          windowEl.value = selected;
        }
        const initialLimit = getWindowLimit();
        if (initialLimit === null) {
          const baseLength = Math.max(labels.length, maxPointsDefault);
          labels = Array.from({ length: baseLength }, (_, i) => i - baseLength);
        } else {
          labels = Array.from({ length: initialLimit }, (_, i) => i - initialLimit);
        }
        chart.data.labels = labels;
        if (Array.isArray(state.multipliers)) {
          multipliers = state.multipliers
            .map(value => parseFloat(value))
            .filter(num => !Number.isNaN(num) && num > 0);
        }
        if (Array.isArray(state.strategies)) {
          strategies.splice(0, strategies.length);
          state.strategies.forEach(saved => {
            const base = defaultStrategy();
            Object.assign(base, saved);
            if (!HEX_COLOR_REGEX.test(base.color || '')) {
              base.color = randomStrategyColor(strategies.map(st => st.color));
            }
            base.bankroll = INITIAL_BANKROLL;
            base.martiIdx = 0;
            base.lossStreak = 0;
            base.cooldown = false;
            base.resumeHits = 0;
            const seriesLength = getInitialSeriesLength();
            base.data = Array.from({ length: seriesLength }, () => INITIAL_BANKROLL);
            base.triggers = normalizeTriggers(saved);
            ensureStrategyDebug(base);
            base.debug.rounds = [];
            base.debug.selectedRound = null;
            base.debug.expanded = true;
            delete base.conditions;
            strategies.push(base);
          });
        }
      } catch (e) {}
    }

    loadState();
    syncMultipliersEditor();
    renderStrategies();
    syncChartDatasets();

    function ensureStrategyTriggers(strategy) {
      if (!Array.isArray(strategy.triggers)) {
        strategy.triggers = [createTrigger()];
      }
      if (!strategy.triggers.length) {
        strategy.triggers.push(createTrigger());
      }
      strategy.triggers.forEach(trigger => {
        if (!Array.isArray(trigger.conditions)) {
          trigger.conditions = [];
        }
      });
    }

    function renderDebugPanel() {
      if (!debugWrap) return;
      if (!strategies.length) {
        debugWrap.innerHTML = '<p class="text-xs text-slate-500">Create a strategy to see its simulation log here.</p>';
        return;
      }

      const visibleStrategies = strategies
        .map((strategy, index) => ({ strategy, index }))
        .filter(({ strategy }) => strategy.show);

      if (!visibleStrategies.length) {
        debugWrap.innerHTML = '<p class="text-xs text-slate-500">Enable “Show” for a strategy to inspect its debug log.</p>';
        return;
      }

      debugWrap.innerHTML = visibleStrategies.map(({ strategy, index }) => {
        ensureStrategyDebug(strategy);
        const label = strategy.name ? `${strategy.name}` : `Strategy ${index + 1}`;
        const summary = `Cashout ${formatAmount(strategy.cashout)}x • Bet ${formatAmount(strategy.betAmount)}`;
        const rounds = strategy.debug.rounds;
        const feedbackMessage = strategy.debug.feedbackMessage;
        const feedbackTone = strategy.debug.feedbackTone === 'error' ? 'text-rose-400' : 'text-emerald-400';
        const feedbackMarkup = feedbackMessage ? `<div class="text-[11px] ${feedbackTone}">${feedbackMessage}</div>` : '';
        const roundsMarkup = rounds.length
          ? rounds.map((round, rIdx) => {
              const isSelected = strategy.debug.selectedRound === rIdx;
              const classes = [
                'w-full text-left px-3 py-2 rounded-lg border transition-colors duration-150',
                isSelected ? 'border-indigo-500 bg-indigo-500/10 text-slate-100' : 'border-slate-700 bg-slate-900/40 text-slate-200 hover:border-slate-500'
              ].join(' ');
              const betLine = round.bet > 0 ? ` • Bet: ${formatAmount(round.bet)}` : '';
              const decision = round.decision || 'Skip';
              const outcome = round.outcome || 'No bet';
              const bankrollLine = Number.isFinite(round.bankrollAfter) ? `Bankroll: ${formatAmount(round.bankrollAfter)}` : '';
              const hasDelta = Number.isFinite(round.bankrollAfter) && Number.isFinite(round.bankrollBefore);
              const deltaRaw = hasDelta ? round.bankrollAfter - round.bankrollBefore : null;
              const deltaClass = deltaRaw && deltaRaw !== 0 ? (deltaRaw > 0 ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-400';
              const deltaPrefix = deltaRaw && deltaRaw !== 0 ? (deltaRaw > 0 ? '+' : '−') : '±';
              const deltaLabel = hasDelta ? `${deltaPrefix}${formatAmount(Math.abs(deltaRaw || 0))}` : '';
              return `<button type="button" class="${classes}" data-debug-round="${rIdx}" data-debug-strategy="${index}">
                <div class="flex items-center justify-between text-xs font-semibold">
                  <span>Round ${round.round}</span>
                  <span>${formatMultiplierLabel(round.multiplier)}</span>
                </div>
                <div class="mt-1 text-[11px] text-slate-300">Decision: ${decision} • Outcome: ${outcome}${betLine}</div>
                <div class="mt-1 text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                  ${bankrollLine}
                  ${deltaLabel ? `<span class="${deltaClass}">Δ ${deltaLabel}</span>` : ''}
                </div>
              </button>`;
            }).join('')
          : '<p class="text-xs text-slate-500">No rounds processed yet. Start the simulation to populate this log.</p>';

        return `<div class="border border-slate-700 rounded-lg overflow-hidden" data-debug-card="${index}">
          <div class="flex items-center justify-between px-4 py-3 bg-slate-900/60 gap-3">
            <button type="button" data-debug-toggle="${index}" class="flex-1 flex items-center justify-between gap-3 text-left hover:text-slate-100">
              <span class="text-sm font-semibold text-slate-100 flex items-center gap-2"><span class="inline-flex size-2.5 rounded-full" style="background:${strategy.color};"></span>${label}</span>
              <span class="text-xs text-slate-400">${rounds.length} rounds</span>
            </button>
            <button type="button" data-debug-copy="${index}" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-600 text-slate-200 hover:border-indigo-500 hover:text-indigo-200 transition-colors duration-150">Copy log</button>
          </div>
          <div class="px-4 py-3 space-y-2 ${strategy.debug.expanded ? '' : 'hidden'}" data-debug-body="${index}">
            ${feedbackMarkup}
            <div class="text-xs text-slate-400">${summary}</div>
            <div class="space-y-2">${roundsMarkup}</div>
          </div>
        </div>`;
      }).join('');
    }

    function triggerToLines(trigger, index) {
      if (!trigger || !Array.isArray(trigger.conditions) || !trigger.conditions.length) {
        return [`  Trigger ${index + 1}: (no conditions defined)`];
      }
      const header = `  Trigger ${index + 1}:`;
      const lines = trigger.conditions.map(cond => {
        const position = Number.isFinite(cond.pos) ? cond.pos : 1;
        const operator = cond.op || '>';
        const value = Number.isFinite(cond.value) ? cond.value : 0;
        return `    - Prev Mult ${position} ${operator} ${formatAmount(value)}`;
      });
      return [header, ...lines];
    }

    function buildDebugExport(strategy, index) {
      ensureStrategyTriggers(strategy);
      ensureStrategyDebug(strategy);
      const label = strategy.name ? `${strategy.name}` : `Strategy ${index + 1}`;
      const lines = [];
      lines.push(`Strategy ${index + 1}: ${label}`);
      lines.push(`Color: ${strategy.color || 'N/A'}`);
      const cashoutLabel = Number.isFinite(strategy.cashout) ? formatMultiplierLabel(strategy.cashout) : '';
      lines.push(`Cashout target: ${cashoutLabel || 'N/A'}`);
      lines.push(`Base bet amount: ${formatAmount(strategy.betAmount)}`);

      const sequence = Array.isArray(strategy.sequence)
        ? strategy.sequence.map(val => parseFloat(val)).filter(num => Number.isFinite(num))
        : [];
      if (strategy.martingale) {
        if (sequence.length) {
          lines.push(`Martingale: Enabled (sequence: ${sequence.map(num => formatAmount(num)).join(', ')})`);
        } else {
          lines.push('Martingale: Enabled (no sequence provided)');
        }
      } else {
        lines.push('Martingale: Disabled');
      }

      const risk = strategy.risk || {};
      if (risk.enabled) {
        const rounds = Number.isFinite(risk.rounds) ? risk.rounds : 0;
        const resumeAbove = Number.isFinite(risk.resumeAbove) ? risk.resumeAbove : 0;
        const resumeRule = risk.restart === 'start' ? 'restart sequence on resume' : 'continue sequence on resume';
        lines.push(`Risk controls: Enabled — stop after ${rounds} losses, resume after ${resumeAbove} hits ≥ cashout, ${resumeRule}`);
      } else {
        lines.push('Risk controls: Disabled');
      }

      const second = strategy.second || {};
      if (second.enabled) {
        const lockRounds = Number.isFinite(second.lockRounds) ? second.lockRounds : 0;
        const restartLabel = second.restart === 'lock'
          ? `lock for ${lockRounds} rounds after wins`
          : 'restart after wins';
        lines.push(`Second bet: Enabled — amount ${formatAmount(second.amount)} (${restartLabel})`);
      } else {
        lines.push('Second bet: Disabled');
      }

      lines.push('');
      lines.push('Triggers:');
      if (Array.isArray(strategy.triggers) && strategy.triggers.length) {
        strategy.triggers.forEach((trigger, tIndex) => {
          triggerToLines(trigger, tIndex).forEach(line => lines.push(line));
        });
      } else {
        lines.push('  (no triggers configured)');
      }

      lines.push('');
      lines.push('Rounds:');
      const rounds = Array.isArray(strategy.debug.rounds) ? strategy.debug.rounds : [];
      if (!rounds.length) {
        lines.push('  No rounds logged yet. Start the simulation to collect results.');
      } else {
        rounds.forEach(round => {
          const parts = [];
          const roundIndex = Number.isFinite(round.round) ? round.round : '?';
          const multiplierLabel = Number.isFinite(round.multiplier) ? formatMultiplierLabel(round.multiplier) : '';
          parts.push(`Round ${roundIndex}`);
          parts.push(`Multiplier ${multiplierLabel || 'N/A'}`);
          parts.push(`Decision: ${round.decision || 'Skip'}`);
          parts.push(`Outcome: ${round.outcome || 'No bet'}`);
          if (round.bet > 0) {
            parts.push(`Bet: ${formatAmount(round.bet)}`);
          }
          if (Number.isFinite(round.bankrollBefore)) {
            parts.push(`Bankroll before: ${formatAmount(round.bankrollBefore)}`);
          }
          if (Number.isFinite(round.bankrollAfter)) {
            parts.push(`Bankroll after: ${formatAmount(round.bankrollAfter)}`);
          }
          if (Number.isFinite(round.bankrollBefore) && Number.isFinite(round.bankrollAfter)) {
            const delta = round.bankrollAfter - round.bankrollBefore;
            const sign = delta > 0 ? '+' : delta < 0 ? '-' : '±';
            parts.push(`Δ ${sign}${formatAmount(Math.abs(delta))}`);
          }
          lines.push(`  ${parts.join(' — ')}`);
        });
      }

      return lines.join('\n');
    }

    function copyToClipboard(text) {
      if (navigator?.clipboard?.writeText) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        try {
          textarea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (successful) {
            resolve();
          } else {
            reject(new Error('Copy command unsuccessful'));
          }
        } catch (err) {
          document.body.removeChild(textarea);
          reject(err);
        }
      });
    }

    function renderStrategies() {
      strategiesWrap.innerHTML = strategies.map((s,i) => {
        ensureStrategyTriggers(s);
        ensureStrategyDebug(s);
        const triggerBlocks = s.triggers.map((trigger, tIndex) => {
          const condRows = trigger.conditions.map((c,j)=>`
            <div class="flex items-center gap-2 mb-1" data-cond="${j}" data-trigger="${tIndex}">
              <span class="text-xs">Prev Mult</span>
              <select data-field="condPos" data-trigger="${tIndex}" data-cond="${j}" class="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs">
                ${Array.from({length:10},(_,k)=>`<option value="${k+1}" ${c.pos==k+1?'selected':''}>${k+1}</option>`).join('')}
              </select>
              <select data-field="condOp" data-trigger="${tIndex}" data-cond="${j}" class="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs">
                <option value=">" ${c.op==='>'?'selected':''}>&gt;</option>
                <option value="<" ${c.op==='<'?'selected':''}>&lt;</option>
                <option value=">=" ${c.op==='>='?'selected':''}>&ge;</option>
                <option value="<=" ${c.op==='<='?'selected':''}>&le;</option>
                <option value="==" ${c.op==='=='?'selected':''}>=</option>
              </select>
              <input type="number" step="0.01" data-field="condValue" data-trigger="${tIndex}" data-cond="${j}" value="${c.value}" class="w-20 bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs"/>
              <button type="button" data-action="remove-cond" data-trigger="${tIndex}" data-cond="${j}" class="text-rose-400 text-xs">&times;</button>
            </div>`).join('');
          const emptyState = !trigger.conditions.length
            ? '<p class="text-xs text-slate-500 mb-1">No conditions yet. Add one to define this trigger.</p>'
            : '';
          return `<div class="rounded border border-slate-700 p-3 bg-slate-900/40 space-y-2" data-trigger-block="${tIndex}">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-400">Trigger ${tIndex + 1}</h4>
              ${s.triggers.length > 1 ? `<button type="button" data-action="remove-trigger" data-trigger="${tIndex}" class="text-rose-400 text-xs">Remove trigger</button>` : ''}
            </div>
            ${emptyState}
            <div class="conditions" data-cond-wrap>${condRows}</div>
            <button type="button" data-action="add-cond" data-trigger="${tIndex}" class="mt-1 px-2 py-1 bg-slate-600 text-xs rounded">Add Condition</button>
          </div>`;
        }).join('');
        return `<div class="border border-slate-700 rounded-lg p-4 space-y-2" data-index="${i}">
          <div class="flex justify-between items-center gap-3">
            <div class="flex items-center gap-2 flex-1">
              <span class="inline-flex size-3 rounded-full border border-slate-600" data-role="color-dot" style="background:${s.color};"></span>
              <button type="button" data-action="toggle" class="text-sm font-medium text-slate-100 text-left flex-1">Strategy ${i+1}${s.name?`: ${s.name}`:''}</button>
            </div>
            <label class="flex items-center gap-1 text-xs text-slate-200 mr-2"><input type="checkbox" data-field="show" ${s.show?'checked':''}/>Show</label>
            <div class="flex items-center gap-2">
              <button type="button" data-action="duplicate" class="text-indigo-400 text-xs">Duplicate</button>
              <button type="button" data-action="remove" class="text-rose-400 text-xs">Remove</button>
            </div>
          </div>
          <div class="mt-2 space-y-2 ${s.collapsed?'hidden':''}" data-fields>
            <input type="text" data-field="name" placeholder="Name" value="${s.name}" class="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm" />
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 text-sm text-slate-200">
                <span>Color</span>
                <input type="color" data-field="color" value="${s.color}" class="h-9 w-16 rounded border border-slate-600 bg-slate-900/40 cursor-pointer" />
              </label>
              <span class="text-xs text-slate-400 font-mono" data-role="color-code">${(s.color || '').toUpperCase()}</span>
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-200">Cashout <input type="number" step="0.01" min="1.01" data-field="cashout" value="${s.cashout}" class="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"/></label>
            <label class="flex items-center gap-2 text-sm text-slate-200">Bet amount <input type="number" data-field="betAmount" value="${s.betAmount}" class="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"/></label>
            <label class="flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" data-field="martingale" ${s.martingale?'checked':''}/> Martingale</label>
            <input type="text" data-field="sequence" placeholder="1, 1.88, 2.31" value="${s.sequence.join(', ')}" class="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm ${s.martingale?'':'hidden'}" />
            <div class="mt-2 text-sm text-slate-200">Triggers</div>
            <div class="space-y-3">${triggerBlocks}</div>
            <button type="button" data-action="add-trigger" class="mt-1 px-2 py-1 bg-slate-600 text-xs rounded">Add Trigger</button>
            <label class="flex items-center gap-2 text-sm text-slate-200"><input type="checkbox" data-field="secondEnabled" ${s.second.enabled?'checked':''}/>Second bet</label>
            <div class="second-bet-fields ${s.second.enabled?'':'hidden'} space-y-2">
              <label class="flex items-center gap-2 text-sm text-slate-200">Bet amount<input type="number" data-field="secondAmount" value="${s.second.amount}" class="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"/></label>
              <label class="flex items-center gap-2 text-sm text-slate-200">When bet1 wins<select data-field="secondRestart" class="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"><option value="restart" ${s.second.restart==='restart'?'selected':''}>Restart</option><option value="lock" ${s.second.restart==='lock'?'selected':''}>Lock</option></select></label>
              <label class="flex items-center gap-2 text-sm text-slate-200">Lock rounds<input type="number" data-field="secondLockRounds" value="${s.second.lockRounds}" class="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"/></label>
            </div>
            <div class="mt-2 text-sm text-slate-200"><label class="flex items-center gap-2"><input type="checkbox" data-field="risk" ${s.risk.enabled?'checked':''}/>Enable Risk Management</label></div>
            <div class="risk-fields ${s.risk.enabled?'':'hidden'} space-y-2 mt-1">
              <label class="flex items-center gap-2 text-sm text-slate-200">Rounds before pause<input type="number" data-field="riskRounds" value="${s.risk.rounds}" class="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"/></label>
              <label class="flex items-center gap-2 text-sm text-slate-200">Resume after<input type="number" min="0" step="1" data-field="riskResume" value="${s.risk.resumeAbove}" class="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"/>hits &ge; cashout</label>
              <label class="flex items-center gap-2 text-sm text-slate-200">Restart martingale<select data-field="riskRestart" class="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"><option value="start" ${s.risk.restart==='start'?'selected':''}>From start</option><option value="continue" ${s.risk.restart==='continue'?'selected':''}>Where left off</option></select></label>
            </div>
          </div>
        </div>`;
      }).join('');
      renderDebugPanel();
    }

    strategiesWrap.addEventListener('input', (e) => {
      const idx = e.target.closest('[data-index]')?.dataset.index;
      if (idx === undefined) return;
      const s = strategies[idx];
      ensureStrategyTriggers(s);
      ensureStrategyDebug(s);
      const field = e.target.dataset.field;
      switch (field) {
        case 'show': s.show = e.target.checked; syncChartDatasets(); break;
        case 'name': s.name = e.target.value; syncChartDatasets(); break;
        case 'cashout': s.cashout = parseFloat(e.target.value) || s.cashout; break;
        case 'betAmount': s.betAmount = parseFloat(e.target.value) || s.betAmount; break;
        case 'martingale': s.martingale = e.target.checked; renderStrategies(); break;
        case 'sequence': s.sequence = e.target.value.split(',').map(v=>parseFloat(v.trim())).filter(n=>!isNaN(n)); break;
        case 'color': {
          const value = e.target.value;
          if (HEX_COLOR_REGEX.test(value)) {
            s.color = value;
            const container = e.target.closest('[data-index]');
            if (container) {
              const dot = container.querySelector('[data-role="color-dot"]');
              if (dot) dot.style.backgroundColor = value;
              const code = container.querySelector('[data-role="color-code"]');
              if (code) code.textContent = value.toUpperCase();
            }
            syncChartDatasets();
          }
          break;
        }
        case 'condPos': {
          const tIdx = parseInt(e.target.dataset.trigger, 10);
          const cIdx = parseInt(e.target.dataset.cond, 10);
          if (!Number.isInteger(tIdx) || !Number.isInteger(cIdx)) break;
          const trigger = s.triggers?.[tIdx];
          if (!trigger) break;
          if (!Array.isArray(trigger.conditions)) trigger.conditions = [];
          if (!trigger.conditions[cIdx]) break;
          trigger.conditions[cIdx].pos = parseInt(e.target.value,10) || 1;
          break;
        }
        case 'condOp': {
          const tIdx = parseInt(e.target.dataset.trigger, 10);
          const cIdx = parseInt(e.target.dataset.cond, 10);
          if (!Number.isInteger(tIdx) || !Number.isInteger(cIdx)) break;
          const trigger = s.triggers?.[tIdx];
          if (!trigger) break;
          if (!Array.isArray(trigger.conditions)) trigger.conditions = [];
          if (!trigger.conditions[cIdx]) break;
          trigger.conditions[cIdx].op = e.target.value;
          break;
        }
        case 'condValue': {
          const tIdx = parseInt(e.target.dataset.trigger, 10);
          const cIdx = parseInt(e.target.dataset.cond, 10);
          if (!Number.isInteger(tIdx) || !Number.isInteger(cIdx)) break;
          const trigger = s.triggers?.[tIdx];
          if (!trigger) break;
          if (!Array.isArray(trigger.conditions)) trigger.conditions = [];
          if (!trigger.conditions[cIdx]) break;
          trigger.conditions[cIdx].value = parseFloat(e.target.value);
          break;
        }
        case 'secondEnabled': s.second.enabled = e.target.checked; renderStrategies(); break;
        case 'secondAmount': s.second.amount = parseFloat(e.target.value) || 0; break;
        case 'secondRestart': s.second.restart = e.target.value; break;
        case 'secondLockRounds': s.second.lockRounds = parseInt(e.target.value,10) || 0; break;
        case 'risk': s.risk.enabled = e.target.checked; renderStrategies(); break;
        case 'riskRounds': s.risk.rounds = parseInt(e.target.value,10) || 0; break;
        case 'riskResume': s.risk.resumeAbove = parseInt(e.target.value,10) || 0; break;
        case 'riskRestart': s.risk.restart = e.target.value; break;
      }
      saveState();
      renderDebugPanel();
    });

    strategiesWrap.addEventListener('click', (e) => {
      const idx = e.target.closest('[data-index]')?.dataset.index;
      if (idx === undefined) return;
      const s = strategies[idx];
      ensureStrategyTriggers(s);
      ensureStrategyDebug(s);
      const action = e.target.dataset.action;
      if (action === 'remove') { strategies.splice(idx,1); renderStrategies(); syncChartDatasets(); }
      if (action === 'duplicate') {
        const clone = JSON.parse(JSON.stringify(s));
        ensureStrategyTriggers(clone);
        const randomColor = randomStrategyColor([...strategies.map(st => st.color), s.color]);
        clone.color = randomColor;
        const seriesLength = getInitialSeriesLength();
        clone.bankroll = INITIAL_BANKROLL;
        clone.martiIdx = 0;
        clone.lossStreak = 0;
        clone.cooldown = false;
        clone.resumeHits = 0;
        clone.data = Array.from({ length: seriesLength }, () => INITIAL_BANKROLL);
        clone.collapsed = false;
        clone.debug = { rounds: [], expanded: true, selectedRound: null };
        strategies.push(clone);
        strategies.forEach((st,j)=>{ st.collapsed = j === strategies.length-1 ? false : true; });
        renderStrategies();
        syncChartDatasets();
      }
      if (action === 'toggle') {
        const isOpening = s.collapsed;
        strategies.forEach((st,j)=>{ st.collapsed = j==idx ? !st.collapsed : (isOpening ? true : st.collapsed); });
        renderStrategies();
      }
      if (action === 'add-cond') {
        const tIdx = parseInt(e.target.dataset.trigger, 10);
        if (!Number.isInteger(tIdx)) return;
        ensureStrategyTriggers(s);
        s.triggers[tIdx].conditions.push({ pos:1, op:'>', value:1.0 });
        renderStrategies();
      }
      if (action === 'remove-cond') {
        const tIdx = parseInt(e.target.dataset.trigger, 10);
        const cIdx = parseInt(e.target.dataset.cond, 10);
        if (!Number.isInteger(tIdx) || !Number.isInteger(cIdx)) return;
        const trigger = s.triggers?.[tIdx];
        if (!trigger) return;
        trigger.conditions.splice(cIdx,1);
        renderStrategies();
      }
      if (action === 'add-trigger') {
        ensureStrategyTriggers(s);
        s.triggers.push(createTrigger());
        renderStrategies();
      }
      if (action === 'remove-trigger') {
        const tIdx = parseInt(e.target.dataset.trigger, 10);
        if (!Number.isInteger(tIdx)) return;
        if (s.triggers.length <= 1) return;
        s.triggers.splice(tIdx,1);
        renderStrategies();
      }
      saveState();
      renderDebugPanel();
    });

    if (addStrategyBtn) {
      addStrategyBtn.addEventListener('click', () => {
        strategies.forEach(st => st.collapsed = true);
        const ns = defaultStrategy();
        ensureStrategyTriggers(ns);
        ensureStrategyDebug(ns);
        ns.collapsed = false;
        strategies.push(ns);
        renderStrategies();
        syncChartDatasets();
        saveState();
      });
    }

    function syncChartDatasets() {
      chart.data.datasets = strategies.filter(s=>s.show).map(s => ({
        label: s.name || 'Strategy',
        data: s.data,
        borderColor: s.color,
        backgroundColor: hexToRgba(s.color, 0.15),
        fill: true,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0
      }));
      chart.update('none');
    }

    function evaluateTriggers(triggers, history) {
      if (!Array.isArray(triggers) || !triggers.length) return false;

      const evalCond = c => {
        const idx = history.length - c.pos;
        if (idx < 0) return false;
        const val = history[idx];
        if (val === undefined) return false;
        switch (c.op) {
          case '>': return val > c.value;
          case '<': return val < c.value;
          case '>=': return val >= c.value;
          case '<=': return val <= c.value;
          case '==': return val === c.value;
          default: return false;
        }
      };

      return triggers.some(trigger => Array.isArray(trigger.conditions) && trigger.conditions.length > 0 && trigger.conditions.every(cond => evalCond(cond)));
    }

    function clampWindow() {
      const limit = getWindowLimit();
      if (limit === null) {
        chart.data.labels = labels;
        return;
      }
      const excess = labels.length - limit;
      if (excess > 0) {
        labels.splice(0, excess);
        strategies.forEach(s => s.data.splice(0, excess));
      }
      chart.data.labels = labels;
    }

    function finishSimulation() {
      stopLoop();
      running = false;
      btnToggle.textContent = 'Resume';
      statusMessage('Simulation paused — reached end of the multipliers dataset. Add more under Settings → Multipliers or reset to play again.');
    }

    function step() {
      if (preloadIdx >= multipliers.length) {
        finishSimulation();
        return;
      }
      const currMult = multipliers[preloadIdx++];
      const roundNumber = preloadIdx;
      usedMultipliers.push(currMult);
      if (usedMultipliers.length > 10) usedMultipliers.shift();
      renderLastMultipliers(usedMultipliers);

      strategies.forEach(s => {
        ensureStrategyDebug(s);
        const bankrollBefore = s.bankroll;
        const shouldBet = evaluateTriggers(s.triggers, usedMultipliers);
        if (s.cooldown) {
          if (shouldBet && currMult >= s.cashout) {
            s.resumeHits++;
            if (s.resumeHits >= s.risk.resumeAbove) {
              s.cooldown = false;
              s.resumeHits = 0;
              s.lossStreak = 0;
              if (s.risk.restart === 'start') s.martiIdx = 0;
            }
          }
          s.data.push(s.bankroll);
          if (s.data.length > labels.length) s.data.shift();
          pushDebugRound(s, {
            round: roundNumber,
            multiplier: currMult,
            decision: 'Cooldown',
            outcome: 'Paused',
            bet: 0,
            bankrollAfter: s.bankroll,
            bankrollBefore
          });
          return;
        }

        let decision = 'Skip';
        let outcome = 'No bet';
        let bet = 0;
        if (shouldBet) {
          const seqMul = s.martingale && s.sequence.length ? (s.sequence[s.martiIdx] || 1) : 1;
          bet = s.betAmount * seqMul;
          decision = 'Bet';
          outcome = currMult >= s.cashout ? 'Win' : 'Loss';
          if (currMult >= s.cashout) {
            s.bankroll += bet * (s.cashout - 1);
            s.martiIdx = 0;
            s.lossStreak = 0;
          } else {
            s.bankroll -= bet;
            if (s.martingale && s.martiIdx < s.sequence.length - 1) s.martiIdx++;
            s.lossStreak++;
            if (s.risk.enabled && s.risk.rounds > 0 && s.lossStreak >= s.risk.rounds) {
              s.cooldown = true;
              s.resumeHits = 0;
            }
          }
        }
        s.data.push(s.bankroll);
        if (s.data.length > labels.length) s.data.shift();

        pushDebugRound(s, {
          round: roundNumber,
          multiplier: currMult,
          decision,
          outcome,
          bet,
          bankrollAfter: s.bankroll,
          bankrollBefore
        });
      });

      labels.push(tick++);
      clampWindow();
      syncChartDatasets();

      prevMult = currMult;
      renderDebugPanel();
    }

    function startLoop() {
      if (!multipliers.length) {
        stopLoop();
        running = false;
        btnToggle.textContent = 'Resume';
        statusMessage('No multipliers configured. Add values in Settings → Multipliers to run the simulation.');
        return;
      }
      if (preloadIdx >= multipliers.length) {
        finishSimulation();
        return;
      }
      stopLoop();
      const delay = Math.round(parseInt(speedEl.value, 10) * 1.5);
      interval = setInterval(step, delay);
    }
    function stopLoop() { if (interval) { clearInterval(interval); interval = null; } }

    function resetSimulation({ keepRunningState = false, clearStatus = true, skipSave = false } = {}) {
      const previousRunning = running;
      tick = 0;
      usedMultipliers = [];
      prevMult = null;
      preloadIdx = 0;

      const limit = getWindowLimit();
      const baseLength = limit === null ? maxPointsDefault : limit;
      labels = Array.from({ length: baseLength }, (_, i) => i - baseLength);
      chart.data.labels = labels;

      strategies.forEach(s => {
        s.bankroll = INITIAL_BANKROLL;
        s.martiIdx = 0;
        s.lossStreak = 0;
        s.cooldown = false;
        s.resumeHits = 0;
        s.data = Array.from({ length: baseLength }, () => INITIAL_BANKROLL);
        ensureStrategyDebug(s);
        s.debug.rounds = [];
        s.debug.selectedRound = null;
      });

      renderLastMultipliers([]);
      syncChartDatasets();
      chart.update();
      renderDebugPanel();

      const hasMultipliers = multipliers.length > 0;
      const shouldRun = keepRunningState ? previousRunning : true;
      running = shouldRun && hasMultipliers;
      btnToggle.textContent = running ? 'Pause' : 'Resume';

      if (running) {
        startLoop();
        if (clearStatus) statusMessage('');
      } else {
        stopLoop();
        if (clearStatus) {
          statusMessage(hasMultipliers ? '' : 'No multipliers configured. Add values in Settings → Multipliers to run the simulation.');
        }
      }

      if (!skipSave) {
        saveState();
      }

      return { previousRunning, hasMultipliers };
    }

    renderLastMultipliers([]);
    if (multipliers.length) {
      running = true;
      btnToggle.textContent = 'Pause';
      startLoop();
    } else {
      running = false;
      btnToggle.textContent = 'Resume';
      statusMessage('No multipliers configured. Add values in Settings → Multipliers to run the simulation.');
    }

    btnToggle.addEventListener('click', () => {
      running = !running;
      btnToggle.textContent = running ? 'Pause' : 'Resume';
      if (running) {
        statusMessage('');
        startLoop();
      } else {
        stopLoop();
      }
    });
    speedEl.addEventListener('input', () => { if (running) startLoop(); saveState(); });
    windowEl.addEventListener('change', () => { clampWindow(); syncChartDatasets(); saveState(); });
    btnReset.addEventListener('click', () => { resetSimulation(); });

    if (tabButtons.length) {
      activateTab('strategies');
      tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          activateTab(btn.dataset.tab);
        });
      });
    }

    if (saveMultipliersBtn) {
      saveMultipliersBtn.addEventListener('click', () => {
        if (!multipliersInput) return;
        const parsed = parseMultiplierInput(multipliersInput.value);
        const result = setMultipliers(parsed, { keepRunningState: true });
        if (result.type === 'success') {
          showMultipliersFeedback(`Saved ${result.count} multipliers.`, 'success');
        } else {
          showMultipliersFeedback(result.message, 'error');
        }
        statusMessage(result.message);
      });
    }

    if (resetMultipliersBtn) {
      resetMultipliersBtn.addEventListener('click', () => {
        const result = setMultipliers(Array.from(SAMPLE_MULTIPLIERS), { keepRunningState: true });
        if (result.type === 'success') {
          showMultipliersFeedback(`Loaded ${result.count} sample multipliers.`, 'success');
        } else {
          showMultipliersFeedback(result.message, 'error');
        }
        statusMessage(result.message);
      });
    }

    if (multipliersDropZone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        multipliersDropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          setDropZoneActive(true);
        });
      });

      ['dragleave', 'dragend'].forEach((eventName) => {
        multipliersDropZone.addEventListener(eventName, (event) => {
          event.preventDefault();
          setDropZoneActive(false);
        });
      });

      multipliersDropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        setDropZoneActive(false);
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        if (file) {
          importMultipliersFromFile(file);
        }
      });

      multipliersDropZone.addEventListener('click', () => {
        if (multipliersFileInput) {
          multipliersFileInput.click();
        }
      });
    }

    if (multipliersFileInput) {
      multipliersFileInput.addEventListener('change', () => {
        const file = multipliersFileInput.files && multipliersFileInput.files[0];
        if (file) {
          importMultipliersFromFile(file);
        }
        multipliersFileInput.value = '';
      });
    }

    if (multipliersSessionSelect) {
      multipliersSessionSelect.addEventListener('change', () => {
        updateSessionDetailText();
      });
    }

    if (applyMultipliersSessionBtn) {
      applyMultipliersSessionBtn.addEventListener('click', () => {
        if (!pendingCsvSessions.length) {
          showMultipliersFeedback('Import a CSV file and select a session to continue.', 'error');
          return;
        }

        if (!multipliersSessionSelect || !multipliersSessionSelect.value) {
          showMultipliersFeedback('Please choose a session to import.', 'error');
          return;
        }

        const idx = parseInt(multipliersSessionSelect.value, 10);
        if (!Number.isInteger(idx) || !pendingCsvSessions[idx]) {
          showMultipliersFeedback('Please choose a valid session to import.', 'error');
          return;
        }

        const chosen = pendingCsvSessions[idx];
        const fileLabel = pendingCsvFileName || 'CSV file';
        const sessionLabel = chosen.label || `Session ${idx + 1}`;
        const result = setMultipliers(chosen.multipliers, { keepRunningState: true, clearSessions: false });
        const message = result.type === 'success'
          ? `Imported ${result.count} multipliers from ${sessionLabel} in ${fileLabel}.`
          : result.message;
        showMultipliersFeedback(message, result.type === 'success' ? 'success' : 'error');
        statusMessage(message);
      });
    }

    if (debugWrap) {
      debugWrap.addEventListener('click', (event) => {
        const copyBtn = event.target.closest('[data-debug-copy]');
        if (copyBtn) {
          const idx = parseInt(copyBtn.dataset.debugCopy, 10);
          if (Number.isInteger(idx) && strategies[idx]) {
            const strategy = strategies[idx];
            ensureStrategyDebug(strategy);
            const exportText = buildDebugExport(strategy, idx);
            copyToClipboard(exportText).then(() => {
              strategy.debug.feedbackMessage = 'Copied strategy debug to the clipboard.';
              strategy.debug.feedbackTone = 'success';
              renderDebugPanel();
              if (strategy.debug.feedbackTimeoutId) {
                clearTimeout(strategy.debug.feedbackTimeoutId);
              }
              strategy.debug.feedbackTimeoutId = setTimeout(() => {
                strategy.debug.feedbackMessage = '';
                renderDebugPanel();
                strategy.debug.feedbackTimeoutId = null;
              }, 2500);
            }).catch(() => {
              strategy.debug.feedbackMessage = 'Copy failed. Please try again or copy manually.';
              strategy.debug.feedbackTone = 'error';
              renderDebugPanel();
              if (strategy.debug.feedbackTimeoutId) {
                clearTimeout(strategy.debug.feedbackTimeoutId);
              }
              strategy.debug.feedbackTimeoutId = setTimeout(() => {
                strategy.debug.feedbackMessage = '';
                renderDebugPanel();
                strategy.debug.feedbackTimeoutId = null;
              }, 4000);
            });
          }
          return;
        }

        const toggle = event.target.closest('[data-debug-toggle]');
        if (toggle) {
          const idx = parseInt(toggle.dataset.debugToggle, 10);
          if (Number.isInteger(idx) && strategies[idx]) {
            const strategy = strategies[idx];
            ensureStrategyDebug(strategy);
            strategy.debug.expanded = !strategy.debug.expanded;
            if (!strategy.debug.expanded) {
              strategy.debug.selectedRound = null;
            }
            renderDebugPanel();
          }
          return;
        }

        const roundBtn = event.target.closest('[data-debug-round]');
        if (roundBtn) {
          const sIdx = parseInt(roundBtn.dataset.debugStrategy, 10);
          const rIdx = parseInt(roundBtn.dataset.debugRound, 10);
          if (Number.isInteger(sIdx) && Number.isInteger(rIdx) && strategies[sIdx]) {
            const strategy = strategies[sIdx];
            ensureStrategyDebug(strategy);
            strategy.debug.selectedRound = strategy.debug.selectedRound === rIdx ? null : rIdx;
            renderDebugPanel();
          }
        }
      });
    }

    if (btnSettings && settingsModal) {
      btnSettings.addEventListener("click", () => {
        settingsModal.classList.remove("hidden");
        settingsModal.setAttribute("aria-hidden", "false");
      });
      if (settingsClose) {
        settingsClose.addEventListener("click", () => {
          settingsModal.classList.add("hidden");
          settingsModal.setAttribute("aria-hidden", "true");
        });
      }
      settingsModal.addEventListener("click", (event) => {
        if (event.target === settingsModal) {
          settingsModal.classList.add("hidden");
          settingsModal.setAttribute("aria-hidden", "true");
        }
      });
    }

    window.addEventListener('beforeunload', stopLoop);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
