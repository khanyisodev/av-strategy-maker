<?php
/**
 * Multiplier Pattern Scanner shortcode template.
 *
 * @package AVStrategyMaker
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="avsm-multiplier-pattern-scanner">
  <div class="avsm-mps-inner">
    <header>
      <div class="avsm-title">Multiplier Pattern Analysis</div>
      <div class="avsm-controls">
        <label>
          <span class="avsm-subtext">Platform</span><br>
          <select id="platformSelect" aria-label="Platform">
            <option value="Lottostar">Lottostar</option>
            <option value="Betway">Betway</option>
          </select>
        </label>
        <label>
          <span class="avsm-subtext">Timeframe</span><br>
          <select id="timeframeSelect" aria-label="Timeframe">
            <option value="all">All time</option>
            <option value="hour">This Hour</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </label>
        <button class="avsm-btn avsm-btn-secondary" id="toggleDiagBtn" aria-controls="diagnosticsCard" aria-expanded="false">Show Diagnostics</button>
      </div>
    </header>

    <section class="avsm-grid">
      <div class="avsm-card avsm-card--kpi" id="avgCard">
        <h3>Average Multiplier</h3>
        <div class="avsm-metric" id="avgVal">—</div>
        <div class="avsm-stat-row">
          <span class="avsm-subtext" id="countText">0 rounds</span>
          <span class="avsm-badge"><span aria-hidden="true">📈</span><span id="avgTrend">—</span></span>
        </div>
      </div>

      <div class="avsm-card avsm-card--kpi" id="outlierCard">
        <h3>Average Outlier Multipliers</h3>
        <div class="avsm-metric" id="outlierVal">—</div>
        <div class="avsm-stat-row">
          <span class="avsm-subtext" id="outlierCount">0 outliers</span>
          <span class="avsm-badge"><span aria-hidden="true">🎯</span><span id="outlierThreshText">≥ 2.00</span></span>
        </div>
      </div>

      <div class="avsm-card avsm-card--kpi" id="successCard">
        <h3>Success Rate</h3>
        <div class="avsm-metric" id="successVal">—</div>
        <div class="avsm-stat-row">
          <span class="avsm-subtext">Target ≥ <b id="targetEcho">3.00</b></span>
          <span class="avsm-badge"><span aria-hidden="true">✅</span><span id="successCount">0 / 0</span></span>
        </div>
      </div>

      <div class="avsm-card avsm-card--scanner">
        <h3>Advanced Pattern Scanner</h3>
        <div class="avsm-hint">Add conditions inline, then set a target for the current round (also used by the Success Rate KPI) and scan.</div>
        <div class="conditions" id="conditions">
          <div class="avsm-panel" id="conditions-left">
            <h4>Conditions</h4>
            <div id="conditionsList"></div>
            <div class="avsm-row">
              <button class="avsm-btn" id="addCond">+ Add Condition</button>
              <button class="avsm-btn avsm-btn-secondary" id="clearCond">Clear</button>
            </div>
          </div>
          <div class="avsm-panel" id="conditions-right">
            <h4>Run Settings</h4>
            <div class="avsm-row" style="gap:12px; align-items:flex-end; flex-wrap:wrap">
              <label>
                <span class="avsm-subtext">Deposit</span><br>
                <input type="number" id="depositInput" placeholder="e.g., 1000" />
              </label>
              <label>
                <span class="avsm-subtext">From</span><br>
                <input type="datetime-local" id="fromDate" />
              </label>
              <label>
                <span class="avsm-subtext">To</span><br>
                <input type="datetime-local" id="toDate" />
              </label>
              <label style="flex:1 1 220px">
                <span class="avsm-subtext">Martingale sequence</span><br>
                <input type="text" id="martingaleInput" placeholder="1, 2, 4, 6, 9" />
              </label>
            </div>
          </div>
        </div>
        <div class="avsm-row">
          <div class="avsm-sep"></div>
          <label>
            <span class="avsm-subtext">Pattern target for current round (≥)</span><br>
            <input type="number" id="patternTarget" step="0.01" value="3" />
          </label>
          <button class="avsm-btn" id="scanBtn">Scan Pattern</button>
        </div>
        <div class="avsm-results" id="scanResults" hidden>
          <div class="avsm-tabs">
            <button class="avsm-tab-btn" id="tabBtnOverview">Overview</button>
            <button class="avsm-tab-btn avsm-active" id="tabBtnOcc">Occurance</button>
          </div>
          <div class="avsm-tab-panel" id="tabOverview">
            <div class="avsm-hint">Overview coming next — share what you’d like to see here and I’ll wire it up.</div>
          </div>
          <div class="avsm-tab-panel avsm-active" id="tabOccurance">
            <div class="avsm-legend">
              <span class="avsm-pill"><b id="occCount">0</b> occurrences</span>
              <span class="avsm-pill"><b id="succCount">0</b> wins</span>
              <span class="avsm-pill">Rate: <b id="succRate">0%</b></span>
            </div>
            <div class="avsm-list" id="hitList"></div>
          </div>
        </div>
      </div>

      <div class="avsm-card avsm-card--tests" id="diagnosticsCard" hidden>
        <h3>Diagnostics / Tests</h3>
        <div class="avsm-hint">Auto-runs basic checks to validate scanner logic and KPIs.</div>
        <div class="avsm-tests-list" id="tests"></div>
      </div>
    </section>

    <div class="avsm-footer">Tip: The timeframe filter uses timestamps relative to "now" so you can test This Week / This Month immediately with the demo data.</div>
  </div>
</div>
