<?php
/**
 * Plugin Name: Strategy Maker
 * Description: Displays the bankroll simulation UI via shortcode [strategy_maker].
 * Version: 1.0.0
 * Author: ChatGPT
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function sm_enqueue_assets() {
    wp_enqueue_script('tailwind', 'https://cdn.tailwindcss.com', [], null, true);
    wp_add_inline_script('tailwind', 'tailwind.config = { darkMode: "class" };', 'before');
    wp_enqueue_script('chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js', [], null, true);
    wp_enqueue_style('sm-style', plugins_url('assets/css/strategy-maker.css', __FILE__));
    wp_enqueue_script('sm-script', plugins_url('assets/js/strategy-maker.js', __FILE__), ['chartjs'], null, true);
    wp_enqueue_script('sm-mode', plugins_url('assets/js/mode-toggle.js', __FILE__), ['sm-script'], null, true);
}
add_action('wp_enqueue_scripts', 'sm_enqueue_assets');

function sm_render_shortcode() {
    ob_start();
    include plugin_dir_path(__FILE__) . 'partials/strategy-maker.php';
    return ob_get_clean();
}
add_shortcode('strategy_maker', 'sm_render_shortcode');
