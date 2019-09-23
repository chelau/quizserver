<?php
/**
 * The Template for displaying a single project
 *
 * @package Timber Lite
 * @since Timber 1.0
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

get_header();

while ( have_posts() ) : the_post();

	if ( post_password_required() ) {
		echo get_the_password_form();
		continue;
	}

	get_template_part( 'template-parts/single-jetpack-portfolio');

endwhile;

get_footer();
