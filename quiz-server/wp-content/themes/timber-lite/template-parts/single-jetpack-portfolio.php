<?php

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

global $post;

$project_template 	= 'filmstrip';
$image_scaling 		= 'fill';

//in case nothing is returned default to a filmstrip template
if ( empty( $project_template ) ) {
	$project_template = 'filmstrip';
}

if ( empty( $image_scaling ) ) {
	$image_scaling = 'fill';
} ?>

<div class="site-header  site-header--placeholder"></div>

<main id="content" class="site-content site-container  <?php echo esc_attr( 'image-scaling--' . $image_scaling ); ?>">

	<?php get_template_part( 'template-parts/content', 'project-filmstrip' ); ?>

</main>

<footer id="colophon" class="site-footer" role="contentinfo">
	<div class="bar--fixed">
		<div class="site-info">
			<div class="portfolio__position"></div>
			<button class="show-details caption js-details"><span><?php esc_html_e( 'details', 'timber-lite' ); ?></span></button>
		</div><!-- .site-info -->
	</div>
</footer><!-- #colophon -->

<?php
