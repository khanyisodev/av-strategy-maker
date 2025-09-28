# Strategy Maker

WordPress plugin displaying a bankroll simulation with a dark UI. Strategies are user-configurable via a modal and plotted with Chart.js using preloaded multipliers. The interface includes controls for speed, window size and a reset button, while dataset visibility can be toggled via the chart legend. Embed the UI in posts or pages using the `[strategy_maker]` shortcode.

The toolbar includes a Font Awesome gear that launches a Tailwind modal where you can add, remove, duplicate or configure strategies (name, cashout, bet amount, martingale sequence, dual-bet settings and risk options). Within a strategy, selecting **OR** starts a new condition group so multiple sets of **AND** conditions can be evaluated separately. Each strategy card collapses so only one is expanded at a time, yet its visibility can still be toggled, and settings persist across refreshes via `localStorage`. When risk management is enabled, a strategy pauses after a set number of consecutive losses and resumes only after seeing a configurable count of multipliers at or above its cashout target.

The latest 25 multipliers are displayed newest-first in a horizontal row of color-coded pills with widths that fit their content.
