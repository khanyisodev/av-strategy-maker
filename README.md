# Strategy Maker

WordPress plugin that delivers a bankroll simulation dashboard alongside an interactive multiplier pattern scanner. Both experiences ship with a polished dark UI, leverage Tailwind utilities and Chart.js where appropriate, and can be embedded in any post or page via dedicated shortcodes.

## Shortcodes

- `[strategy_maker]` – renders the bankroll simulation complete with configurable strategies, charting, multiplier history and a Tailwind-powered settings modal that persists to `localStorage`.
- `[multiplier_pattern_scanner]` – outputs the analytics console from the original HTML prototype, featuring KPI cards, an advanced condition builder, auto-generated diagnostics and demo data to experiment with different filters. The standalone `multiplier-pattern-scanner.html` file has been removed, so the shortcode is now the canonical implementation.

## Features

- Strategy cards support dual bets, martingale sequences, conditional groups (AND/OR) and risk controls, all adjustable through a responsive modal interface.
- The Chart.js canvas visualises the most recent multipliers while the toolbar provides controls for speed, window size, pausing and resetting the looped demo data.
- Pattern scanner includes timeframe filters, customisable occurrence targets and a diagnostics panel that runs automated tests to confirm the logic remains sound.
- Assets are registered and enqueued only when needed to keep page loads lean and to make future overrides easy via filters.
