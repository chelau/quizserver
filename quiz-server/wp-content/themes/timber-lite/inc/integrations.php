<?php
/**
* Require files that deal with various plugin integrations.
*
* @package Timber Lite
*/

/**
 * Load Jetpack compatibility file.
 */
require_once get_template_directory() . '/inc/integrations/jetpack.php';

/**
 * Load Customify compatibility file.
 * https://wordpress.org/plugins/customify/
 */
require_once get_parent_theme_file_path( '/inc/integrations/customify.php' );
