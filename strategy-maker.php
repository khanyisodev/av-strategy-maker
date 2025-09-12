<?php
/*
Plugin Name: Strategy Maker
Description: Display the bankroll simulation UI via shortcode [strategy_maker].
Version: 1.0.0
*/

function strategy_maker_register_assets() {
    wp_register_script('tailwind', 'https://cdn.tailwindcss.com', [], null, false);
    wp_register_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js', [], null, true);
    wp_register_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', [], '6.5.1');
    wp_register_style('strategy-maker', plugins_url('strategy-maker.css', __FILE__), [], '1.0.0');
    wp_register_script('strategy-maker', plugins_url('strategy-maker.js', __FILE__), ['chartjs'], '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'strategy_maker_register_assets');

function strategy_maker_shortcode() {
    wp_enqueue_script('tailwind');
    wp_enqueue_script('chartjs');
    wp_enqueue_style('font-awesome');
    wp_enqueue_style('strategy-maker');
    wp_enqueue_script('strategy-maker');
    ob_start();
    ?>
    <div id="strategy-maker-root">
      <main class="max-w-[1500px] mx-auto px-4 py-10">
          <header class="mb-6">
            <h1 class="text-3xl font-semibold tracking-tight">Bankroll Simulation (Dark • Preloaded)</h1>
            <p class="text-slate-400 mt-1">Build and simulate custom strategies with dual bets, martingale sequences and risk controls.</p>
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

            <button id="btnReset" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm border border-slate-700">
              Reset
            </button>

            <button id="btnSettings" type="button" class="ml-auto p-2 text-slate-400 hover:text-slate-200">
              <i class="fas fa-cog"></i>
              <span class="sr-only">Settings</span>
            </button>
          </div>

          <div class="mb-4">
            <h2 class="text-sm font-medium text-slate-300 mb-2">Last 25 multipliers</h2>
            <div id="multis" class="flex flex-col gap-1 justify-start"></div>
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
        <div class="bg-slate-800 p-6 rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-slate-100">Strategies</h2>
            <button id="settingsClose" type="button" class="text-slate-400 hover:text-slate-200 text-2xl leading-none">&times;<span class="sr-only">Close</span></button>
          </div>
          <div id="strategiesWrap" class="space-y-4"></div>
          <button id="addStrategy" type="button" class="mt-4 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm">Add Strategy</button>
        </div>
      </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('strategy_maker', 'strategy_maker_shortcode');
