<?php
/**
 * Core plugin orchestrator.
 *
 * @package AVStrategyMaker
 */

declare(strict_types=1);

namespace AVStrategyMaker;

require_once AVSM_PLUGIN_PATH . 'includes/class-avsm-assets.php';
require_once AVSM_PLUGIN_PATH . 'includes/class-avsm-shortcodes.php';

final class Plugin
{
    private static ?Plugin $instance = null;

    private Assets $assets;

    private Shortcodes $shortcodes;

    private function __construct()
    {
        $this->assets     = new Assets(AVSM_VERSION);
        $this->shortcodes = new Shortcodes($this->assets);

        add_action('init', [$this, 'boot']);
    }

    public static function instance(): Plugin
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function boot(): void
    {
        $this->assets->register();
        $this->shortcodes->register();
    }
}
