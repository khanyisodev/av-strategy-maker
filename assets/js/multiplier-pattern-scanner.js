(function(){
  const init = () => {
    const platformSelect = document.getElementById('platformSelect');
    if (!platformSelect) {
      return;
    }
    const root = platformSelect.closest('.avsm-multiplier-pattern-scanner');
    if (!root) {
      return;
    }
    const byId = (id) => root.querySelector(`#${id}`);
    const els = {
      platform: platformSelect,
      timeframe: byId('timeframeSelect'),
      avgVal: byId('avgVal'),
      avgTrend: byId('avgTrend'),
      countText: byId('countText'),
      outVal: byId('outlierVal'),
      outCount: byId('outlierCount'),
      outThreshText: byId('outlierThreshText'),
      successVal: byId('successVal'),
      successCount: byId('successCount'),
      targetEcho: byId('targetEcho'),
      conditionsList: byId('conditionsList'),
      addCond: byId('addCond'),
      clearCond: byId('clearCond'),
      patternTarget: byId('patternTarget'),
      scanBtn: byId('scanBtn'),
      scanResults: byId('scanResults'),
      tabBtnOverview: byId('tabBtnOverview'),
      tabBtnOcc: byId('tabBtnOcc'),
      tabOverview: byId('tabOverview'),
      tabOccurance: byId('tabOccurance'),
      occCount: byId('occCount'),
      succCount: byId('succCount'),
      succRate: byId('succRate'),
      hitList: byId('hitList'),
      tests: byId('tests'),
      toggleDiagBtn: byId('toggleDiagBtn'),
      diagCard: byId('diagnosticsCard')
    };
    if (Object.values(els).some((el) => !el)) {
      return;
    }
      // ---------------------------------------------
      // Demo Data
      // ---------------------------------------------
      const now = new Date();
      const hoursAgo = (h)=> new Date(now.getTime() - h*3600*1000);

      // Lottostar multipliers from the prompt (preserving order).
      const lottoMultipliers = [1, 7.71, 1.53, 6, 1, 1.07, 5.42, 1.2, 3.78, 1.42, 1.27, 1.45, 6.52, 1.35, 3.31, 1.57, 6.9, 2.18, 10.75];
      // Betway: synthetic but plausible.
      const betwayMultipliers = [1.1, 2.6, 1.3, 3.9, 1.0, 1.8, 5.2, 1.4, 2.1, 7.8, 1.2, 1.9, 3.2, 1.5, 4.6, 1.1, 2.4, 6.3, 1.3, 2.9, 10.2];

      function buildSeries(arr, gapHours=3){
        return arr.map((m, i)=>({ ts: hoursAgo((arr.length-1-i)*gapHours), m }));
      }

      const DATA = {
        Lottostar: buildSeries(lottoMultipliers, 6), // 6h gaps
        Betway:    buildSeries(betwayMultipliers, 4) // 4h gaps
      };

      // ---------------------------------------------
      // Utilities
      // ---------------------------------------------
      const fmt = (n, d=2)=> Number.isFinite(n) ? n.toFixed(d) : '—';
      const pct = (n)=> Number.isFinite(n) ? (n*100).toFixed(1)+"%" : '—';

      // Fixed outlier threshold used by KPI (was previously user-configurable)
      const OUTLIER_THRESHOLD = 2;

      function inThisWeek(date){
        // ISO week comparison (Mon start)
        const d = new Date(date);
        const today = new Date();
        const getWeek = (x)=>{
          const tmp = new Date(x.getTime());
          tmp.setHours(0,0,0,0);
          tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay()+6)%7));
          const week1 = new Date(tmp.getFullYear(),0,4);
          return 1 + Math.round(((tmp.getTime()-week1.getTime())/86400000 - 3 + ((week1.getDay()+6)%7))/7);
        };
        return d.getFullYear()===today.getFullYear() && getWeek(d)===getWeek(today);
      }

      function inThisMonth(date){
        const d=new Date(date), t=new Date();
        return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth();
      }

      function inThisHour(date){
        const d = new Date(date);
        const diff = Date.now() - d.getTime();
        return diff >= 0 && diff < 3600*1000; // within last 60 minutes
      }

      function isToday(date){
        const d = new Date(date);
        const t = new Date();
        return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate();
      }

      function filterByTimeframe(series, tf){
        if(tf==='hour')  return series.filter(r=> inThisHour(r.ts));
        if(tf==='today') return series.filter(r=> isToday(r.ts));
        if(tf==='week')  return series.filter(r=> inThisWeek(r.ts));
        if(tf==='month') return series.filter(r=> inThisMonth(r.ts));
        return series;
      }

      function computeStats(series, target=3, outlierThr=2){
        const vals = series.map(r=> r.m);
        const n = vals.length;
        if(!n) return {avg:null, count:0, outAvg:null, outCount:0, success:null, succCount:0};
        const avg = vals.reduce((a,b)=>a+b,0)/n;
        const outs = vals.filter(v=> v>=outlierThr);
        const outAvg = outs.length? outs.reduce((a,b)=>a+b,0)/outs.length : null;
        const succ = vals.filter(v=> v>=target).length;
        return {avg, count:n, outAvg, outCount:outs.length, success: succ/n, succCount:succ};
      }

      // Pattern scanner
      const OPS = {
        '>':  (a,b)=> a> b,
        '>=': (a,b)=> a>=b,
        '<':  (a,b)=> a< b,
        '<=': (a,b)=> a<=b,
        '==': (a,b)=> a==b,
        '!=': (a,b)=> a!=b
      };

      function scanPattern(series, conditions, target){
        const vals = series.map(r=> r.m);
        const maxOffset = Math.max(0, ...conditions.map(c=> c.offset||0));
        const hits = [];
        for(let i=maxOffset; i<vals.length; i++){
          const ok = conditions.every(c=>{
            const prev = vals[i - c.offset];
            const fn = OPS[c.op];
            return fn ? fn(prev, c.value) : false;
          });
          if(ok){
            const window = conditions.slice().sort((a,b)=>b.offset-a.offset).map(c=> vals[i-c.offset]);
            const cur = vals[i];
            const success = cur >= target; // success definition (≥)
            hits.push({index:i, window, current:cur, success});
          }
        }
        const succCount = hits.filter(h=> h.success).length;
        const rate = hits.length? succCount / hits.length : 0;
        return {hits, succCount, occurrences:hits.length, rate};
      }

      // ---------------------------------------------
      // UI Wiring
      // ---------------------------------------------

      function currentSeries(){
        const platform = els.platform.value;
        const tf = els.timeframe.value;
        return filterByTimeframe(DATA[platform]||[], tf);
      }

      function refreshKPIs(){
        const ser = currentSeries();
        const target = parseFloat(els.patternTarget.value)||3;
        const outThr = OUTLIER_THRESHOLD;

        // Base KPIs (not pattern-based)
        const {avg, count, outAvg, outCount} = computeStats(ser, target, outThr);
        els.avgVal.textContent = fmt(avg);
        els.countText.textContent = `${count} rounds`;
        els.avgTrend.textContent = count? `Last: ${fmt(ser[ser.length-1].m)}` : '—';

        els.outVal.textContent = outAvg==null? '—' : fmt(outAvg);
        els.outCount.textContent = `${outCount} outliers`;
        els.outThreshText.textContent = `≥ ${fmt(outThr)}`;

        // Success KPI should be pattern-based: wins over occurrences
        const conds = readConditions();
        const pattern = scanPattern(ser, conds, target);
        els.successVal.textContent = pattern.occurrences ? pct(pattern.rate) : '—';
        els.successCount.textContent = `${pattern.succCount} / ${pattern.occurrences}`;
        els.targetEcho.textContent = fmt(target);
      }

      // ----- Scanner condition rows -----
      function addConditionRow(offset=1, op='>', value=1.6){
        const row = document.createElement('div');
        row.className = 'avsm-cond-row';
        row.innerHTML = `
          <span class="avsm-subtext" aria-hidden="true">prev</span>
          <input type="number" min="1" step="1" value="${offset}" class="avsm-cond-offset" aria-label="Prev rounds offset" placeholder="1" />
          <select class="avsm-cond-op" aria-label="Operator">
            <option value=">">&gt;</option>
            <option value=">=">&gt;=</option>
            <option value="<">&lt;</option>
            <option value="<=">&lt;=</option>
            <option value="==">==</option>
            <option value="!=">!=</option>
          </select>
          <input type="number" step="0.01" value="${value}" class="avsm-cond-value" aria-label="Threshold value" placeholder="(e.g., prev 1 > 1.6)" />
          <button class="avsm-btn avsm-btn-secondary" title="Remove">✕</button>
        `;
        row.querySelector('.avsm-cond-op').value = op;
        row.querySelector('button').addEventListener('click', ()=>{ row.remove(); });
        els.conditionsList.appendChild(row);
      }

      function readConditions(){
        const rows = [...els.conditionsList.querySelectorAll('.avsm-cond-row')];
        return rows.map(r=>({
          offset: Math.max(1, parseInt(r.querySelector('.avsm-cond-offset').value||'1',10)),
          op: r.querySelector('.avsm-cond-op').value,
          value: parseFloat(r.querySelector('.avsm-cond-value').value||'0')
        }));
      }

      function runScan(){
        const ser = currentSeries();
        const conditions = readConditions();
        const target = parseFloat(els.patternTarget.value)||3;
        const res = scanPattern(ser, conditions, target);
        els.scanResults.hidden = false;
        // Switch to Occurance tab by default on scan
        activateTab('occ');
        els.occCount.textContent = res.occurrences;
        els.succCount.textContent = res.succCount;
        els.succRate.textContent = (res.rate*100).toFixed(1)+"%";
        els.hitList.innerHTML = '';
        res.hits.forEach(h=>{
          const item = document.createElement('div');
          item.className = 'avsm-hit';
          const left = document.createElement('div');
          left.className = 'avsm-mut-seq';
          const b = document.createElement('b');
          b.textContent = '#'+h.index;
          left.appendChild(b);
          left.appendChild(document.createTextNode(' → '+[...h.window, h.current].map(v=> Number(v).toFixed(2)).join(', ')));
          const right = document.createElement('div');
          right.className = h.success ? 'avsm-ok' : 'avsm-fail';
          right.textContent = h.success? '✔ Won' : '✖ Lost';
          item.appendChild(left);
          item.appendChild(right);
          els.hitList.appendChild(item);
        });
      }

      // Tabs
      function activateTab(which){
        const isOverview = which === 'ov';
        els.tabBtnOverview.classList.toggle('avsm-active', isOverview);
        els.tabBtnOcc.classList.toggle('avsm-active', !isOverview);
        els.tabOverview.classList.toggle('avsm-active', isOverview);
        els.tabOccurance.classList.toggle('avsm-active', !isOverview);
      }
      els.tabBtnOverview.addEventListener('click', ()=> activateTab('ov'));
      els.tabBtnOcc.addEventListener('click', ()=> activateTab('occ'));

      // Events
      els.platform.addEventListener('change', ()=>{ refreshKPIs(); els.scanResults.hidden=true; });
      els.timeframe.addEventListener('change', ()=>{ refreshKPIs(); els.scanResults.hidden=true; });
      els.patternTarget.addEventListener('input', refreshKPIs);
      els.addCond.addEventListener('click', ()=> addConditionRow());
      els.clearCond.addEventListener('click', ()=>{ els.conditionsList.innerHTML=''; els.scanResults.hidden=true; });
      els.scanBtn.addEventListener('click', ()=>{ runScan(); refreshKPIs(); });
      els.toggleDiagBtn.addEventListener('click', ()=>{
        const nowHidden = !els.diagCard.hidden;
        els.diagCard.hidden = nowHidden;
        els.toggleDiagBtn.textContent = nowHidden ? 'Show Diagnostics' : 'Hide Diagnostics';
        els.toggleDiagBtn.setAttribute('aria-expanded', String(!nowHidden));
      });

      // ---------------------------------------------
      // Tests / Diagnostics
      // ---------------------------------------------
      function addTestResult(ok, label, details){
        const div = document.createElement('div');
        div.className = 'avsm-test ' + (ok ? 'avsm-pass' : 'avsm-fail');
        const b = document.createElement('b');
        b.textContent = (ok? 'PASS':'FAIL') + ': ';
        const lbl = document.createElement('span');
        lbl.textContent = label;
        div.appendChild(b);
        div.appendChild(lbl);
        if(details){
          div.appendChild(document.createTextNode(' — '));
          const small = document.createElement('span');
          small.className = 'avsm-subtext';
          small.textContent = details;
          div.appendChild(small);
        }
        els.tests.appendChild(div);
      }

      function runTests(){
        els.tests.innerHTML = '';

        // Test 1: Lottostar example — prev1>1.6 & prev2>1.6, target 3
        const ser = DATA.Lottostar; // full series
        const conditions = [{offset:1, op:'>', value:1.6},{offset:2, op:'>', value:1.6}];
        const tRes = scanPattern(ser, conditions, 3);
        addTestResult(tRes.occurrences===5, 'Occurrences should be 5', `got ${tRes.occurrences}`);
        addTestResult(tRes.succCount===3, 'Success count should be 3', `got ${tRes.succCount}`);
        addTestResult(Math.abs(tRes.rate - 0.6) < 1e-9, 'Success rate should be 60%', `got ${(tRes.rate*100).toFixed(1)}%`);

        // Test 2: computeStats basic sanity
        const stats = computeStats(ser, 3, 2);
        addTestResult(stats.count===ser.length, 'Count equals series length', `count=${stats.count}`);
        addTestResult(stats.succCount<=stats.count, 'Success count ≤ total');

        // Test 3: timeframe filters produce non-empty subsets
        const hourCt  = filterByTimeframe(ser,'hour').length;
        const todayCt = filterByTimeframe(ser,'today').length;
        const weekCt  = filterByTimeframe(ser,'week').length;
        const monthCt = filterByTimeframe(ser,'month').length;
        addTestResult(hourCt>=1, 'This Hour includes the most recent round', `len=${hourCt}`);
        addTestResult(hourCt<=todayCt, 'This Hour ≤ Today', `hour=${hourCt}, today=${todayCt}`);
        addTestResult(todayCt<=weekCt, 'Today ≤ This Week', `today=${todayCt}, week=${weekCt}`);
        addTestResult(monthCt>=weekCt, 'This Month ≥ This Week (usually)', `week=${weekCt}, month=${monthCt}`);

        // Test 4: KPI Success Rate follows scanner target (patternTarget) and occurrences
        const prevTarget = els.patternTarget.value;
        els.patternTarget.value = '4';
        refreshKPIs();
        const res4 = scanPattern(ser, conditions, 4);
        const domPct = parseFloat(els.successVal.textContent); // strip %
        const expPct = (res4.rate||0)*100;
        addTestResult(Math.abs(domPct - expPct) < 0.1, 'KPI uses scanner target (4) & pattern rate', `dom=${domPct.toFixed(1)}%, exp=${expPct.toFixed(1)}%`);

        // Test 5: KPI badge shows success / occurrences for current conditions
        els.patternTarget.value = '3';
        refreshKPIs();
        const res3 = scanPattern(ser, conditions, 3);
        const parts = els.successCount.textContent.split('/');
        const domSucc = parseInt(parts[0]);
        const domOcc = parseInt(parts[1]);
        addTestResult(domSucc===res3.succCount && domOcc===res3.occurrences, 'KPI badge matches success/occurrences', `dom=${domSucc}/${domOcc}, exp=${res3.succCount}/${res3.occurrences}`);

        // Test 6: No-conditions scan should consider all rounds as occurrences
        const resNoCond = scanPattern(ser, [], 3);
        addTestResult(resNoCond.occurrences===ser.length, 'No-conditions occurrences == series length', `occ=${resNoCond.occurrences}, len=${ser.length}`);

        // Test 7: Impossible condition yields zero occurrences
        const resImpossible = scanPattern(ser, [{offset:1, op:'>', value:9999}], 3);
        addTestResult(resImpossible.occurrences===0, 'Impossible condition → 0 occurrences');

        // Test 8: Diagnostics toggle button hides/shows the card and updates label
        const wasHidden = els.diagCard.hidden;
        els.toggleDiagBtn.click();
        const afterHidden = els.diagCard.hidden;
        const afterLabel = els.toggleDiagBtn.textContent;
        addTestResult(afterHidden !== wasHidden && ((afterHidden && afterLabel.includes('Show')) || (!afterHidden && afterLabel.includes('Hide'))), 'Diagnostics toggle works', `hidden:${wasHidden}→${afterHidden}, label:"${afterLabel}"`);
        // restore
        els.toggleDiagBtn.click();

        // Test 9: Timeframe option order
        const tfValues = Array.from(els.timeframe.options).map(o=>o.value).slice(0,5).join(',');
        addTestResult(tfValues==='all,hour,today,week,month', 'Timeframe options order is correct', tfValues);

        // restore
        els.patternTarget.value = prevTarget;
        refreshKPIs();
      }

      // Boot
      addConditionRow(1,'>',1.6);
      addConditionRow(2,'>',1.6);
      refreshKPIs();
      runTests();

  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
