<?php
/**
 * The template for displaying PixProof Galleries.
 *
 * @package Timber Lite
 * @since Timber 1.0
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

get_header();

if ( post_password_required() ) {
	echo get_the_password_form();
} else { ?>
<div class="site-header  site-header--placeholder"></div>
<main id="content" class="site-content site-container project_layout-grid  <?php echo 'image-scaling--';// . $image_scaling; ?>">

		<header class="site-sidebar">
		    <div class="site-sidebar__content">

		    <?php
		    /*
		     * Project Title
		     */
		    the_title( '<h1 ' . timber_lite_get_post_title_class_attr( 'site-sidebar__text' ) . '>', '</h1>' );
		    ?>

		    </div>
		</header>

		<article id="post-<?php the_ID(); ?>" <?php post_class('js-portfolio  portfolio  project_layout-thumbnails'); ?>>

					<?php while ( have_posts() ) : the_post();
						/* Include the Post-Format-specific template for the content.
						* If you want to override this in a child theme, then include a file
						* called content-___.php (where ___ is the Post Format name) in a template-parts directory and that will be used instead.
						*/

						the_content();

					endwhile; // End of the loop. ?>

					<?php
					// If comments are open or we have at least one comment, load up the comment template.
					if ( comments_open() || get_comments_number() ) :
						comments_template();
					endif;

					?>

				</div>
			</div>
		</article><!-- #post-<?php the_ID(); ?> .entry-content -->


		<div class="site-content__mask  mask--project"></div>

</main>

<footer id="colophon" class="site-footer" role="contentinfo">
	<div class="bar--fixed">

		<div class="project-addthis-container">
		</div>

		<div class="site-info">
			<div class="portfolio__position"></div>
			<button class="show-details caption js-details"><span><?php esc_html_e( 'details', 'timber-lite' ); ?></span></button>
		</div><!-- .site-info -->
	</div>
</footer><!-- #colophon -->

<?php }

get_footer();
