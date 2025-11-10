# Strategy Maker

WordPress plugin that delivers a bankroll simulation dashboard alongside an interactive multiplier pattern scanner. Both experiences ship with a polished dark UI, leverage Tailwind utilities and Chart.js where appropriate, and can be embedded in any post or page via dedicated shortcodes.

## Shortcodes

- `[strategy_maker]` – renders the bankroll simulation complete with configurable strategies, charting, multiplier history and a Tailwind-powered settings modal (persisted to `localStorage`) that now includes tabs for strategies, multipliers and a live debug console.
- `[multiplier_pattern_scanner]` – outputs the analytics console from the original HTML prototype, featuring KPI cards, an advanced condition builder, auto-generated diagnostics and demo data to experiment with different filters. The standalone `multiplier-pattern-scanner.html` file has been removed, so the shortcode is now the canonical implementation.

## Features

- Strategy cards support dual bets, martingale sequences, trigger-based condition groups and risk controls, all adjustable through a responsive modal interface. Each trigger bundles AND conditions together, while adding another trigger gives you OR behaviour for scenarios such as <em>Prev Mult 2 &gt; 1.6</em> vs <em>Prev Mult 2 &lt; 1.6 AND Prev Mult 3 &gt; 1.6</em>.
- The Chart.js canvas visualises the most recent multipliers while the toolbar provides controls for speed, window size (60, 120, 240 or all points), pausing and resetting the simulation that advances exactly as far as your multiplier list.
- Multipliers can be edited from the modal’s tab using comma- or newline-separated values (quotes optional) with the familiar trailing `x`, or imported straight from a CSV export via drag-and-drop. When a file includes several sessions (each with its own header row), the importer lets you pick which session to load before refreshing the simulation, and all values are stored to `localStorage` for the next visit.
- Debug tab captures every simulated round per strategy, highlighting the multiplier processed, whether a bet fired, and the win/loss result so you can audit logic while the playback runs.
- Pattern scanner includes timeframe filters, customisable occurrence targets and a diagnostics panel that runs automated tests to confirm the logic remains sound.
- Assets are registered and enqueued only when needed to keep page loads lean and to make future overrides easy via filters.
