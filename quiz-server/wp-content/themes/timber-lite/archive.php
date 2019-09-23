<?php
/**
 * The template for displaying archive pages.
 *
 * Learn more: http://codex.wordpress.org/Template_Hierarchy
 *
 * @package Timber Lite
 * @since Timber 1.0
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

get_header(); ?>

<div class="site-header  site-header--placeholder"></div>
<div class="site-container  site-content">
	<?php if ( have_posts() ) :

        $queried_object = get_queried_object();
        $data = '';
        if ( ! empty( $queried_object->taxonomy ) ) {
            $data .= ' data-taxonomy="' . esc_attr( $queried_object->taxonomy ) .'"';
            $data .= ' data-termid="' . esc_attr( $queried_object->term_taxonomy_id ) .'"';
        }
        ?>
		<div class="filmstrip" <?php echo $data; // phpcs:ignore ?>>
			<div class="site-sidebar  site-sidebar--archive  site-sidebar--journal">
				<div class="site-sidebar__content site-sidebar__text"><?php the_archive_title(); ?></div>
			</div>

			<?php
			/* Start the Loop */
			while ( have_posts() ) : the_post(); ?>
				<?php

					/*
					 * Include the Post-Format-specific template for the content.
					 * If you want to override this in a child theme, then include a file
					 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
					 */
					get_template_part( 'template-parts/content', get_post_format() );
				?>
			<?php endwhile; ?>
		    <?php timber_lite_paging_nav(); ?>
		</div>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content', 'none' ); ?>
	<?php endif; ?>
</div>

<div class="site-footer"></div>

<?php get_footer();
