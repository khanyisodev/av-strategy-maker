<div id="strategy-maker" class="strategy-maker dark min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
  <main class="max-w-[1500px] mx-auto px-4 py-10">
      <div class="flex justify-end mb-4">
        <button id="themeToggle" class="px-3 py-2 rounded-lg bg-gray-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100">Light Mode</button>
      </div>
      <header class="mb-6">
        <h1 class="text-3xl font-semibold tracking-tight">Bankroll Simulation (Dark • Preloaded)</h1>
        <p class="mt-1 text-gray-600 dark:text-slate-100">
          Bets only when <span class="font-semibold">previous &gt; 1.6</span>. Stream runs <span class="font-semibold">1.5× slower</span>.
        </p>
      </header>

      <section class="card rounded-2xl bg-white ring-1 ring-slate-200 p-5 md:p-6 dark:bg-slate-900/70 dark:ring-slate-800">
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <button id="btnToggle" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[.98] font-medium">
            Start
          </button>

          <div class="flex items-center gap-2">
            <label for="speed" class="text-sm text-gray-700 dark:text-slate-100">Speed</label>
            <input id="speed" type="range" min="50" max="1200" step="50" class="w-40 accent-indigo-500" value="250" />
            <span class="text-xs text-gray-500 dark:text-slate-300">(effective ×1.5 slower)</span>
          </div>

          <div class="flex items-center gap-2">
            <label for="window" class="text-sm text-gray-700 dark:text-slate-100">Window</label>
            <select id="window" class="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm dark:bg-slate-800/80 dark:border-slate-700">
              <option value="60">Last 60 pts</option>
              <option value="120" selected>Last 120 pts</option>
              <option value="240">Last 240 pts</option>
            </select>
          </div>

          <button id="btnSmooth" class="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm border border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700">
            Smooth On
          </button>

          <!-- Cashout input (default 3.7) -->
          <div class="flex items-center gap-2">
            <label for="cashout" class="text-sm text-gray-700 dark:text-slate-100">Cashout</label>
            <input id="cashout" type="number" step="0.01" min="1.01" value="3.70" class="w-24 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-100" />
          </div>

          <button id="btnReset" class="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm border border-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700">
            Reset
          </button>
        </div>

      <!-- Multipliers (left → right) -->
        <div class="mb-4">
          <h2 class="text-sm font-medium text-gray-700 dark:text-slate-100 mb-2">Last 10 multipliers</h2>
          <div id="multis" class="flex flex-wrap gap-2 justify-start" style="direction:ltr"></div>
          <div id="status" class="mt-2 text-xs text-gray-500 dark:text-slate-300"></div>
        </div>

      <!-- Chart -->
      <div class="relative h-[420px] md:h-[480px]">
        <canvas id="chart"></canvas>
      </div>

        <div class="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3 text-sm">
          <div class="flex items-center gap-2">
            <span class="inline-block size-3 rounded bg-indigo-500"></span>
            <span class="text-gray-700 dark:text-slate-100">No M - LM: fixed bet (R75)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block size-3 rounded bg-emerald-500"></span>
            <span class="text-gray-700 dark:text-slate-100">With M - LM: martingale sequence</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block size-3 rounded bg-amber-500"></span>
            <span class="text-gray-700 dark:text-slate-100">No M - LM (Curr %): 1.5% of current balance</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-block size-3 rounded bg-rose-500"></span>
            <span class="text-gray-700 dark:text-slate-100">With M - LM (Guard): martingale + stop &amp; resume rule</span>
          </div>
        </div>
    </section>
  </main>
</div>
