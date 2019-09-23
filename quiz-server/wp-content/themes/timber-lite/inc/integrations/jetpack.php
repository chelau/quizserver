<?php
/**
 * Jetpack Compatibility File - load the theme's duplicate files if Jetpack is not present
 * This way we provide a smooth transition to those that decide to use Jetpack
 * See: http://jetpack.me/
 *
 * @package Timber Lite
 */
function timber_lite_load_jetpack_compatibility() {

	//first test if Jetpack is present and activated
	// only if it is not present load the duplicated code from the theme
	if ( ! class_exists( 'Jetpack' ) ) {
		//this is not safe -- needed to prefix the functions
		require_once get_template_directory() . '/inc/integrations/jetpack/responsive-videos.php';
	}
}
add_action( 'after_setup_theme', 'timber_lite_load_jetpack_compatibility' );

function timber_lite_jetpack_setup() {

	/**
	 * Add theme support for Jetpack responsive videos
	 */
	add_theme_support( 'jetpack-responsive-videos' );
}
add_action( 'after_setup_theme', 'timber_lite_jetpack_setup' );

/**
 * This functions returns true if the current page should display a project layout
 * @param null $post
 *
 * @return bool
 */
function timber_lite_post_is_project( $post = null ) {

	if ( $post === null ) {
		global $post;
	}

	// if we can't determine the post type we quit
	if ( ! isset( $post->post_type ) ) {
		return false;
	}

	if ( $post->post_type === 'jetpack-portfolio' ) {
		return true;
	} elseif ( $post->post_type === 'page' ) {
		$custom_portfolio_page_type = get_post_meta( timber_lite_get_post_id(), 'custom_portfolio_page_type', true);
		if ( $custom_portfolio_page_type === 'project' ) {
			return true;
		}
	}

	return false;
}
