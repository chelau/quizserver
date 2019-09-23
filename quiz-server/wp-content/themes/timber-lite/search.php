<?php
/**
 * The template for displaying search results pages.
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
        $search_term = get_search_query();
        $data = '';
        if ( ! empty( $search_term ) ) {
            $data .= ' data-search="' . esc_attr( $search_term ) .'"';
        }
        ?>

		<div class="filmstrip" <?php echo $data; // phpcs:ignore ?>>
			<div class="site-sidebar">
				<div class="site-sidebar__content  site-sidebar__text">
					<?php
					/* translators: s%: searched term. */
                    printf( esc_html__( 'Search Results for %s', 'timber-lite' ), '<div class="divider"></div><span>' . get_search_query() . '</span>' ); ?>
				</div>
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

<div class="site-footer">
	<div class="bar--fixed"></div>
</div>

<?php get_footer();
