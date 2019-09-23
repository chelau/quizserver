<?php
/**
 * Template Name: Custom Portfolio Template
 *
 * Aimed at being used as a static front page where you can showcase your featured projects in a fullscreen slideshow
 *
 * @package Timber Lite
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

get_header();

if ( post_password_required() ) {
	echo get_the_password_form();
} else {

	$custom_portfolio_page_type = get_post_meta( timber_lite_get_post_id(), 'custom_portfolio_page_type', true);
	// this is the default template
	$template_part = 'template-parts/page-featured-projects';

	// if user opts for a portfolio template
	if ( $custom_portfolio_page_type === 'portfolio' ) {
		$template_part = 'template-parts/page-portfolio';
	}

	// when user wants a project as this template, force it
	if ( $custom_portfolio_page_type === 'project' ) {
		$homepage_project = get_post_meta( timber_lite_get_post_id(), 'homepage_project', true );

		if ( is_numeric( $homepage_project ) ) {
			global $post;

			$the_project = get_post( $homepage_project );
			$post        = $the_project;
			setup_postdata( $post );
			get_template_part( 'template-parts/single-jetpack-portfolio' );
			wp_reset_postdata();
		}

	} else {
		get_template_part( $template_part );
	}
}
get_footer();
