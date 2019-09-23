<?php
/**
 * The template for displaying archive pages for the portfolio types.
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
<div class="site-container">
    <div class="site-content  portfolio-archive  portfolio-category">
        <?php
        $data = '';
        if ( have_posts() ) {
            $queried_object = get_queried_object();
            if ( ! empty( $queried_object->taxonomy ) ) {
                $data .= ' data-taxonomy="' . esc_attr( $queried_object->taxonomy ) .'"';
                $data .= ' data-termid="' . esc_attr( $queried_object->term_taxonomy_id ) .'"';
            }
        } ?>
        <div class="site-sidebar  site-sidebar--archive">
            <h1 class="site-sidebar__content  site-sidebar__text"><?php $portfolio_type = get_queried_object(); echo esc_html( $portfolio_type->name ); ?></h1>
        </div>
        <div class="portfolio-wrapper" <?php echo $data; ?>>
        <?php
        if ( have_posts() ) :
            while ( have_posts() ) : the_post();
                get_template_part( 'template-parts/content', 'portfolio' );
            endwhile;
        else :
            get_template_part( 'template-parts/content', 'none' );
        endif;
        ?>
        </div>
    </div>
</div>

<?php get_footer();
