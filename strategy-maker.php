<?php
/**
 * Plugin Name:       AV Strategy Maker
 * Description:       Bankroll simulation and multiplier pattern analysis tools via shortcodes.
 * Version:           1.1.0
 * Author:            AV
 * Text Domain:       av-strategy-maker
 * Requires at least: 6.0
 * Requires PHP:      7.4
 *
 * @package AVStrategyMaker
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('AVSM_VERSION', '1.1.0');
define('AVSM_PLUGIN_FILE', __FILE__);
define('AVSM_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('AVSM_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once AVSM_PLUGIN_PATH . 'includes/class-avsm-plugin.php';

AVStrategyMaker\Plugin::instance();
