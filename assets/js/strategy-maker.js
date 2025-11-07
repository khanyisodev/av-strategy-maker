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

    function setMultipliers(newList, { keepRunningState = true } = {}) {
      const sanitized = newList.filter(num => Number.isFinite(num) && num > 0);
      multipliers = sanitized;
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
    const tabButtons = Array.from(settingsModal ? settingsModal.querySelectorAll('[data-tab]') : []);
    const tabPanels = Array.from(settingsModal ? settingsModal.querySelectorAll('[data-tab-panel]') : []);

    let running = false;
    let interval = null;

    function defaultStrategy() {
      const color = nextStrategyColor();
      const maxPoints = parseInt(windowEl.value, 10);
      return {
        name: '',
        cashout: defaultCashout,
        betAmount: INITIAL_BET,
        show: true,
        martingale: false,
        sequence: [],
        conditions: [],
        risk: { enabled:false, rounds:0, resumeAbove:0, restart:'start' },
        second: { enabled:false, amount:0, restart:'restart', lockRounds:0 },
        bankroll: INITIAL_BANKROLL,
        martiIdx: 0,
        lossStreak: 0,
        cooldown: false,
        resumeHits: 0,
        data: Array.from({ length: maxPoints }, () => INITIAL_BANKROLL),
        color,
        collapsed: false
      };
    }

    function saveState() {
      const state = {
        speed: speedEl.value,
        window: windowEl.value,
        strategies: strategies.map(({ name, cashout, betAmount, show, martingale, sequence, conditions, risk, second, color, collapsed }) => ({
          name, cashout, betAmount, show, martingale, sequence, conditions, risk, second, color, collapsed
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
        if (state.window) windowEl.value = state.window;
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
            const maxPoints = parseInt(windowEl.value, 10);
            base.bankroll = INITIAL_BANKROLL;
            base.martiIdx = 0;
            base.lossStreak = 0;
            base.cooldown = false;
            base.resumeHits = 0;
            base.data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);
            strategies.push(base);
          });
        }
      } catch (e) {}
    }

    loadState();
    syncMultipliersEditor();
    renderStrategies();
    syncChartDatasets();

    function renderStrategies() {
      strategiesWrap.innerHTML = strategies.map((s,i) => {
        const condRows = s.conditions.map((c,j)=>`
          <div class="flex items-center gap-2 mb-1" data-cond="${j}">
            ${j>0?`<select data-field="logic" class="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs">
                      <option value="AND" ${c.logic==='AND'?'selected':''}>AND</option>
                      <option value="OR" ${c.logic==='OR'?'selected':''}>OR</option>
                    </select>`:''}
            <span class="text-xs">Prev Mult</span>
            <select data-field="pos" class="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs">
              ${Array.from({length:10},(_,k)=>`<option value="${k+1}" ${c.pos==k+1?'selected':''}>${k+1}</option>`).join('')}
            </select>
            <select data-field="op" class="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs">
              <option value=">">></option>
              <option value="<"><</option>
              <option value=">=">>=</option>
              <option value="<="><=</option>
              <option value="==">=</option>
            </select>
            <input type="number" step="0.01" data-field="value" value="${c.value}" class="w-20 bg-slate-700 border border-slate-600 rounded px-1 py-1 text-xs"/>
            <button type="button" data-action="remove-cond" class="text-rose-400 text-xs">&times;</button>
          </div>`).join('');
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
            <div class="mt-2 text-sm text-slate-200">Conditions</div>
            <div class="conditions" data-cond-wrap>${condRows}</div>
            <button type="button" data-action="add-cond" class="mt-1 px-2 py-1 bg-slate-600 text-xs rounded">Add Condition</button>
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
    }

    strategiesWrap.addEventListener('input', (e) => {
      const idx = e.target.closest('[data-index]')?.dataset.index;
      if (idx === undefined) return;
      const s = strategies[idx];
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
        case 'logic': { const ci = e.target.closest('[data-cond]').dataset.cond; s.conditions[ci].logic = e.target.value; break; }
        case 'pos': { const ci = e.target.closest('[data-cond]').dataset.cond; s.conditions[ci].pos = parseInt(e.target.value,10); break; }
        case 'op': { const ci = e.target.closest('[data-cond]').dataset.cond; s.conditions[ci].op = e.target.value; break; }
        case 'value': { const ci = e.target.closest('[data-cond]').dataset.cond; s.conditions[ci].value = parseFloat(e.target.value); break; }
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
    });

    strategiesWrap.addEventListener('click', (e) => {
      const idx = e.target.closest('[data-index]')?.dataset.index;
      if (idx === undefined) return;
      const s = strategies[idx];
      const action = e.target.dataset.action;
      if (action === 'remove') { strategies.splice(idx,1); renderStrategies(); syncChartDatasets(); }
      if (action === 'duplicate') {
        const clone = JSON.parse(JSON.stringify(s));
        const randomColor = randomStrategyColor([...strategies.map(st => st.color), s.color]);
        clone.color = randomColor;
        const maxPoints = parseInt(windowEl.value, 10);
        clone.bankroll = INITIAL_BANKROLL;
        clone.martiIdx = 0;
        clone.lossStreak = 0;
        clone.cooldown = false;
        clone.resumeHits = 0;
        clone.data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);
        clone.collapsed = false;
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
      if (action === 'add-cond') { s.conditions.push({ logic: 'AND', pos:1, op:'>', value:1.0 }); renderStrategies(); }
      if (action === 'remove-cond') { const ci = e.target.closest('[data-cond]').dataset.cond; s.conditions.splice(ci,1); renderStrategies(); }
      saveState();
    });

    if (addStrategyBtn) {
      addStrategyBtn.addEventListener('click', () => {
        strategies.forEach(st => st.collapsed = true);
        const ns = defaultStrategy();
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

    function evaluateConditions(conds, history) {
      if (conds.length === 0) return false;

      const evalCond = c => {
        const val = history[history.length - c.pos];
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

      // Split conditions into groups separated by OR. Each group uses AND logic.
      const groups = [];
      let current = [];
      conds.forEach((c, i) => {
        if (i > 0 && c.logic === 'OR') {
          groups.push(current);
          current = [c];
        } else {
          current.push(c);
        }
      });
      groups.push(current);

      return groups.some(group => group.every(cond => evalCond(cond)));
    }

    function clampWindow() {
      const maxPoints = parseInt(windowEl.value, 10);
      const excess = labels.length - maxPoints;
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
      usedMultipliers.push(currMult);
      if (usedMultipliers.length > 10) usedMultipliers.shift();
      renderLastMultipliers(usedMultipliers);

      strategies.forEach(s => {
        if (s.cooldown) {
          if (currMult >= s.cashout) {
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
          return;
        }

        const shouldBet = evaluateConditions(s.conditions, usedMultipliers);
        if (shouldBet) {
          const seqMul = s.martingale && s.sequence.length ? (s.sequence[s.martiIdx] || 1) : 1;
          const bet = s.betAmount * seqMul;
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
      });

      labels.push(tick++);
      clampWindow();
      syncChartDatasets();

      prevMult = currMult;
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

      const maxPoints = parseInt(windowEl.value, 10);
      labels = Array.from({ length: maxPoints }, (_, i) => i - maxPoints);

      strategies.forEach(s => {
        s.bankroll = INITIAL_BANKROLL;
        s.martiIdx = 0;
        s.lossStreak = 0;
        s.cooldown = false;
        s.resumeHits = 0;
        s.data = Array.from({ length: maxPoints }, () => INITIAL_BANKROLL);
      });

      renderLastMultipliers([]);
      syncChartDatasets();
      chart.update();

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
