<?php
/**
 * Registers and renders plugin shortcodes.
 *
 * @package AVStrategyMaker
 */

declare(strict_types=1);

namespace AVStrategyMaker;

final class Shortcodes
{
    private Assets $assets;

    public function __construct(Assets $assets)
    {
        $this->assets = $assets;
    }

    public function register(): void
    {
        add_shortcode('strategy_maker', [$this, 'render_strategy_maker']);
        add_shortcode('multiplier_pattern_scanner', [$this, 'render_multiplier_pattern_scanner']);
    }

    public function render_strategy_maker(array $atts = [], string $content = '', string $tag = ''): string
    {
        $this->assets->enqueue_strategy_maker();
        $output = $this->render_template('strategy-maker');

        return (string) apply_filters('avsm_strategy_maker_output', $output, $atts, $content, $tag);
    }

    public function render_multiplier_pattern_scanner(array $atts = [], string $content = '', string $tag = ''): string
    {
        $this->assets->enqueue_multiplier_pattern_scanner();
        $output = $this->render_template('multiplier-pattern-scanner');

        return (string) apply_filters('avsm_multiplier_pattern_scanner_output', $output, $atts, $content, $tag);
    }

    private function render_template(string $slug, array $context = []): string
    {
        $template = $this->resolve_template($slug, $context);
        if (!file_exists($template)) {
            return '';
        }

        ob_start();
        if (!empty($context)) {
            extract($context, EXTR_SKIP);
        }

        include $template;

        return trim((string) ob_get_clean());
    }

    private function resolve_template(string $slug, array $context = []): string
    {
        $default = AVSM_PLUGIN_PATH . 'templates/' . $slug . '.php';

        /**
         * Filters the resolved template path for AV Strategy Maker shortcodes.
         *
         * @param string $default Default template path.
         * @param string $slug    Template slug.
         * @param array  $context Template context data.
         */
        return (string) apply_filters('avsm_template_path', $default, $slug, $context);
    }
}
