<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://sk8.tech?utm_source=wp-admin&utm_medium=forum&utm_campaign=wp-rest-user
 * @since             1.1.0
 * @package           Wp_Rest_User
 *
 * @wordpress-plugin
 * Plugin Name:       WP REST User
 * Plugin URI:        https://sk8.tech?utm_source=wp-admin&utm_medium=forum&utm_campaign=wp-rest-user
 * Description:       WP REST User adds in the 'User Registration' function for REST API.
 * Version:           1.4.2
 * Author:            SK8Tech
 * Author URI:        https://sk8.tech?utm_source=wp-admin&utm_medium=forum&utm_campaign=wp-rest-user
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       wp-rest-user
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.1.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define('WP_REST_USER_VERSION', '1.4.2');

/**
 * Initialize Freemius SDK
 *
 * @link https://freemius.com/help/documentation/selling-with-freemius/integrating-freemius-sdk/ Freemius Intregration Guide
 * @since 1.4.0
 * @author Jacktator
 */
if (!function_exists('wru_fs')) {
	// Create a helper function for easy SDK access.
	function wru_fs() {
		global $wru_fs;

		if (!isset($wru_fs)) {
			// Include Freemius SDK.
			require_once dirname(__FILE__) . '/freemius/start.php';

			$wru_fs = fs_dynamic_init(array(
				'id' => '3362',
				'slug' => 'wp-rest-user',
				'premium_slug' => 'wp-rest-filter-premium',
				'type' => 'plugin',
				'public_key' => 'pk_ad92ea533f1c9236024e43c9bfeb7',
				'is_premium' => false,
				'has_addons' => false,
				'has_paid_plans' => false,
				'menu' => array(
					'first-path' => 'plugins.php',
					'account' => false,
				),
			));
		}

		return $wru_fs;
	}

	// Init Freemius.
	wru_fs();
	// Signal that SDK was initiated.
	do_action('wru_fs_loaded');

	function wru_fs_custom_connect_message_on_connect(
		$message,
		$user_first_name,
		$plugin_title,
		$user_login,
		$site_link,
		$freemius_link
	) {
		return sprintf(
			__('Hey %1$s') . ',<br>' .
			__('never miss an important update -- opt-in to our security and feature updates notifications, and non-sensitive diagnostic tracking.', 'wp-rest-filter'),
			$user_first_name,
			'<b>' . $plugin_title . '</b>',
			'<b>' . $user_login . '</b>',
			$site_link,
			$freemius_link
		);
	}

	wru_fs()->add_filter('connect_message', 'wru_fs_custom_connect_message_on_connect', 10, 6);

	function wru_fs_custom_connect_message_on_update(
		$message,
		$user_first_name,
		$plugin_title,
		$user_login,
		$site_link,
		$freemius_link
	) {
		return sprintf(
			__('Hey %1$s') . ',<br>' .
			__('Please help us improve %2$s! If you opt-in, some data about your usage of %2$s will be sent. If you skip this, that\'s okay! %2$s will still work just fine.', 'wp-rest-filter'),
			$user_first_name,
			'<b>' . $plugin_title . '</b>',
			'<b>' . $user_login . '</b>',
			$site_link,
			$freemius_link
		);
	}

	wru_fs()->add_filter('connect_message_on_update', 'wru_fs_custom_connect_message_on_update', 10, 6);

	// Not like register_uninstall_hook(), you do NOT have to use a static function.
	wru_fs()->add_action('after_uninstall', 'wru_fs_uninstall_cleanup');
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-wp-rest-user-activator.php
 */
function activate_wp_rest_user() {
	require_once plugin_dir_path(__FILE__) . 'includes/class-wp-rest-user-activator.php';
	Wp_Rest_User_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-wp-rest-user-deactivator.php
 */
function deactivate_wp_rest_user() {
	require_once plugin_dir_path(__FILE__) . 'includes/class-wp-rest-user-deactivator.php';
	Wp_Rest_User_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_wp_rest_user');
register_deactivation_hook(__FILE__, 'deactivate_wp_rest_user');

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path(__FILE__) . 'includes/class-wp-rest-user.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.1.0
 */
function run_wp_rest_user() {

	$plugin = new Wp_Rest_User();
	$plugin->run();

}
run_wp_rest_user();
