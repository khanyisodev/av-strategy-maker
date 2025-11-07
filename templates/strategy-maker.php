<?php
/**
 * Strategy Maker shortcode template.
 *
 * @package AVStrategyMaker
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div id="strategy-maker-root">
  <main class="max-w-[1500px] mx-auto px-4 py-10">
    <header class="mb-6">
      <h1 class="text-3xl font-semibold tracking-tight text-left">Bankroll Simulation (Dark)</h1>
      <p class="text-slate-400 mt-1">Build and simulate custom strategies with dual bets, martingale sequences and risk controls.</p>
    </header>

    <section class="card rounded-2xl bg-slate-900/70 ring-1 ring-slate-800 p-5 md:p-6">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <button id="btnToggle" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[.98] font-medium">
          Resume
        </button>

        <div class="flex items-center gap-2">
          <label for="speed" class="text-sm text-slate-300">Speed</label>
          <input id="speed" type="range" min="50" max="1200" step="50" class="w-40 accent-indigo-500" value="250" />
          <span class="text-xs text-slate-400">(effective ×1.5 slower)</span>
        </div>

        <div class="flex items-center gap-2">
          <label for="window" class="text-sm text-slate-300">Window</label>
          <select id="window" class="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm">
            <option value="60">Last 60 pts</option>
            <option value="120" selected>Last 120 pts</option>
            <option value="240">Last 240 pts</option>
            <option value="all">All</option>
          </select>
        </div>

        <button id="btnReset" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm border border-slate-700">
          Reset
        </button>

        <button id="btnSettings" type="button" class="ml-auto p-2 text-slate-400 hover:text-slate-200">
          <i class="fas fa-cog"></i>
          <span class="sr-only">Settings</span>
        </button>
      </div>

      <div class="mb-4">
        <h2 class="text-sm font-medium text-slate-300 mb-2 text-left">Last 25 multipliers</h2>
        <div id="multis" class="flex flex-wrap gap-1 justify-start w-fit"></div>
        <div id="status" class="mt-2 text-xs text-slate-400"></div>
      </div>

      <div class="relative h-[420px] md:h-[480px]">
        <canvas id="chart"></canvas>
      </div>

      <div class="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3 text-sm">
        <div class="flex items-center gap-2">
          <span class="inline-block size-3 rounded bg-indigo-500"></span>
          <span class="text-slate-300">No M - LM: fixed bet (R75)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block size-3 rounded bg-emerald-500"></span>
          <span class="text-slate-300">With M - LM: martingale sequence</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block size-3 rounded bg-amber-500"></span>
          <span class="text-slate-300">No M - LM (Curr %): 1.5% of current balance</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block size-3 rounded bg-rose-500"></span>
          <span class="text-slate-300">With M - LM (Guard): martingale + stop &amp; resume rule</span>
        </div>
      </div>
    </section>
  </main>
  <div id="settingsModal" aria-hidden="true" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-slate-900/60">
    <div class="bg-slate-800 p-6 rounded-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 class="text-lg font-medium text-slate-100">Settings</h2>
          <p class="text-sm text-slate-400 mt-1">Manage strategy configs and the multiplier dataset that powers the simulation.</p>
        </div>
        <button id="settingsClose" type="button" class="text-slate-400 hover:text-slate-200 text-2xl leading-none">&times;<span class="sr-only">Close</span></button>
      </div>
      <div class="flex items-center gap-2 border-b border-slate-700 pb-3 mb-4" role="tablist" aria-label="Settings tabs">
        <button type="button" data-tab="strategies" class="settings-tab px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150" aria-selected="true">Strategies</button>
        <button type="button" data-tab="multipliers" class="settings-tab px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 text-slate-400" aria-selected="false">Multipliers</button>
        <button type="button" data-tab="debug" class="settings-tab px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 text-slate-400" aria-selected="false">Debug</button>
      </div>
      <section id="tabStrategies" data-tab-panel="strategies" class="space-y-4">
        <div id="strategiesWrap" class="space-y-4"></div>
        <button id="addStrategy" type="button" class="mt-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm">Add Strategy</button>
      </section>
      <section id="tabMultipliers" data-tab-panel="multipliers" class="hidden">
        <p class="text-sm text-slate-300">Add multipliers exactly as they appear in the game log. Separate values with commas or new lines and keep the trailing <code class="text-xs bg-slate-700 px-1 py-0.5 rounded">x</code> for clarity.</p>
        <textarea id="multipliersInput" class="mt-3 w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" rows="8" placeholder="&quot;1.89x&quot;,&#10;&quot;7.16x&quot;,&#10;&quot;1.7x&quot;"></textarea>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <button id="saveMultipliers" type="button" class="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm">Save multipliers</button>
          <button id="resetMultipliers" type="button" class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">Load sample multipliers</button>
          <span id="multipliersFeedback" class="text-xs text-emerald-400 hidden"></span>
        </div>
        <div class="mt-4 text-xs text-slate-400">Active multipliers: <span id="multipliersCount">0</span></div>
        <div id="multipliersPreview" class="mt-2 flex flex-wrap gap-2"></div>
      </section>
      <section id="tabDebug" data-tab-panel="debug" class="hidden">
        <p class="text-sm text-slate-300">Monitor the live decisions for each strategy. Click a strategy header to reveal its rounds, then click any round to highlight it.</p>
        <div id="debugWrap" class="mt-3 space-y-3"></div>
      </section>
    </div>
  </div>
</div>
