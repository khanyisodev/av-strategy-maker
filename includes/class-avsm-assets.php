<?php
/**
 * Handles asset registration and enqueueing.
 *
 * @package AVStrategyMaker
 */

declare(strict_types=1);

namespace AVStrategyMaker;

final class Assets
{
    private string $version;

    public function __construct(string $version)
    {
        $this->version = $version;
    }

    public function register(): void
    {
        add_action('wp_enqueue_scripts', [$this, 'register_assets'], 5);
    }

    public function register_assets(): void
    {
        wp_register_script('avsm-tailwind', 'https://cdn.tailwindcss.com', [], null, false);
        wp_register_script('avsm-chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js', [], '4.4.6', true);
        wp_register_style('avsm-fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', [], '6.5.1');

        wp_register_style(
            'avsm-strategy-maker',
            AVSM_PLUGIN_URL . 'assets/css/strategy-maker.css',
            [],
            $this->asset_version('assets/css/strategy-maker.css')
        );

        wp_register_script(
            'avsm-strategy-maker',
            AVSM_PLUGIN_URL . 'assets/js/strategy-maker.js',
            ['avsm-chartjs'],
            $this->asset_version('assets/js/strategy-maker.js'),
            true
        );

        wp_register_style(
            'avsm-multiplier-pattern-scanner',
            AVSM_PLUGIN_URL . 'assets/css/multiplier-pattern-scanner.css',
            [],
            $this->asset_version('assets/css/multiplier-pattern-scanner.css')
        );

        wp_register_script(
            'avsm-multiplier-pattern-scanner',
            AVSM_PLUGIN_URL . 'assets/js/multiplier-pattern-scanner.js',
            [],
            $this->asset_version('assets/js/multiplier-pattern-scanner.js'),
            true
        );
    }

    public function enqueue_strategy_maker(): void
    {
        wp_enqueue_script('avsm-tailwind');
        wp_enqueue_script('avsm-chartjs');
        wp_enqueue_style('avsm-fontawesome');
        wp_enqueue_style('avsm-strategy-maker');
        wp_enqueue_script('avsm-strategy-maker');
    }

    public function enqueue_multiplier_pattern_scanner(): void
    {
        wp_enqueue_style('avsm-multiplier-pattern-scanner');
        wp_enqueue_script('avsm-multiplier-pattern-scanner');
    }

    private function asset_version(string $relative): string
    {
        $path = AVSM_PLUGIN_PATH . ltrim($relative, '/');
        $timestamp = file_exists($path) ? (int) filemtime($path) : 0;

        return $timestamp ? $this->version . '.' . $timestamp : $this->version;
    }
}
