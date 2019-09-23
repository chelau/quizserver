<?php
/**
 * Template part for displaying featured projects.
 *
 * @package Timber Lite
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

//get the featured projects
$featured = timber_lite_get_featured_projects();
if ( ! empty( $featured ) ) :
	$numFeatured = count( $featured ); ?>

<div id="primary" class="content-area">
	<main id="main" class="site-main slider--show_next slider--default">
		<div class="projects-slider <?php if ( $numFeatured == 1 ) echo '  has--one-slide'; ?>">

			<?php
			foreach ( $featured as $post ) : setup_postdata( $post );

				get_template_part( 'template-parts/content', 'project-featured' );

			endforeach;
			wp_reset_postdata(); ?>

		</div><!-- .featured-projects-slider -->


		<?php if ( $numFeatured > 1 ) : ?>
		<div class="vertical-title prev"><span><?php echo esc_html( get_the_title( $featured[ $numFeatured - 1 ] ) ); ?></span></div>
		<?php endif; ?>

		<?php if ( ! empty( $featured[1] ) ) : ?>
		<div class="vertical-title next"><span><?php echo esc_html( get_the_title( $featured[1] ) ); ?></span></div>
		<?php endif; ?>

		<div class="project-slide__content">

			<?php timber_lite_the_project_types( $featured[0]->ID, '<div class="portfolio_types">', '</div>' ); ?>

			<a href="<?php echo esc_url( get_the_permalink( $featured[0]->ID ) ); ?>"
			   class="project-slide__link"
			   title="<?php
			   /* translators: 1: project title. */
               echo esc_attr( sprintf( __( 'Permalink to %s', 'timber-lite' ), the_title_attribute( array( 'echo' => 0, 'post' => $featured[0]->ID) ) ) ); ?>"
			   rel="bookmark">
				<div class="project-slide__title js-title-mask">
					<h1><?php echo esc_html( get_the_title( $featured[0] ) ); ?></h1>
				</div>
				<div class="project-slide__text"><?php esc_html_e( '&#8594; View Project', 'timber-lite' ); ?></div>
			</a>
		</div>
		<?php if ( $numFeatured != 1 ) : ?>
		<div class="projects-slider__bullets  rsBullets"></div>
		<?php endif; ?>
	</main><!-- #main -->
</div><!-- #primary -->

<?php else :

	get_template_part( 'template-parts/content', 'none' );

endif; ?>
