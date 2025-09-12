<?php
/*
Plugin Name: Strategy Maker
Description: Display the bankroll simulation UI via shortcode [strategy_maker].
Version: 1.0.0
*/

function strategy_maker_enqueue() {
    wp_enqueue_script('tailwind', 'https://cdn.tailwindcss.com', [], null, false);
    wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js', [], null, true);
    wp_enqueue_style('strategy-maker', plugins_url('strategy-maker.css', __FILE__), [], '1.0.0');
    wp_enqueue_script('strategy-maker', plugins_url('strategy-maker.js', __FILE__), ['chartjs'], '1.0.0', true);
}

function strategy_maker_shortcode() {
    strategy_maker_enqueue();
    ob_start();
    ?>
    <div id="strategy-maker-root">
      <main class="max-w-[1500px] mx-auto px-4 py-10">
        <header class="mb-6">
          <h1 class="text-3xl font-semibold tracking-tight">Bankroll Simulation (Dark • Preloaded)</h1>
          <p class="text-slate-400 mt-1">
            Bets only when <span class="font-semibold">previous &gt; 1.6</span>. Stream runs <span class="font-semibold">1.5× slower</span>.
          </p>
        </header>

        <section class="card rounded-2xl bg-slate-900/70 ring-1 ring-slate-800 p-5 md:p-6">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <button id="btnToggle" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[.98] font-medium">
              Pause
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
              </select>
            </div>

            <div class="flex items-center gap-2">
              <label for="cashout" class="text-sm text-slate-300">Cashout</label>
              <input id="cashout" type="number" step="0.01" min="1.01" value="3.70"
                     class="w-24 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100" />
            </div>

            <button id="btnReset" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm border border-slate-700">
              Reset
            </button>

            <button id="btnSettings" type="button" class="ml-auto p-2 text-slate-400 hover:text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M11.3 1.046a1 1 0 00-2.6 0l-.197.758a8.05 8.05 0 00-1.964.806l-.692-.4a1 1 0 00-1.366.366l-.5.866a1 1 0 00.366 1.366l.692.4a8.03 8.03 0 000 1.612l-.692.4a1 1 0 00-.366 1.366l.5.866a1 1 0 001.366.366l.692-.4a8.05 8.05 0 001.964.806l.197.758a1 1 0 002.6 0l.197-.758a8.05 8.05 0 001.964-.806l.692.4a1 1 0 001.366-.366l.5-.866a1 1 0 00-.366-1.366l-.692-.4a8.03 8.03 0 000-1.612l.692-.4a1 1 0 00.366-1.366l-.5-.866a1 1 0 00-1.366-.366l-.692.4a8.05 8.05 0 00-1.964-.806l-.197-.758zM10 13a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
              <span class="sr-only">Settings</span>
            </button>
          </div>

          <div class="mb-4">
            <h2 class="text-sm font-medium text-slate-300 mb-2">Last 10 multipliers</h2>
            <div id="multis" class="flex flex-wrap gap-2 justify-start" style="direction:ltr"></div>
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
        <div class="bg-slate-800 p-6 rounded-xl max-w-sm w-full">
          <h2 class="text-lg font-medium text-slate-100 mb-4">Settings</h2>
          <button id="settingsClose" type="button" class="mt-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('strategy_maker', 'strategy_maker_shortcode');
