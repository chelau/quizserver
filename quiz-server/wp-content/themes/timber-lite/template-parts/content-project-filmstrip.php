<?php
/**
 * The template used for displaying a project (Jetpack Portfolio Single Post) using the Filmstrip layout
 *
 * @package Timber Lite
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
} ?>


<header class="site-sidebar">
    <div class="site-sidebar__content">

    <?php
    /*
     * Project Title
     */
    the_title( '<h1 ' . timber_lite_get_post_title_class_attr( 'site-sidebar__text' ) . '>', '</h1>' );
    echo '<div class="divider"></div>';
    timber_lite_the_project_types();
    ?>

    </div>
</header>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<?php
	/*
	 * Project film strip
	 */
	timber_lite_the_film_strip(get_the_ID(), true, true);
	?>

    <div class="portfolio__item  portfolio__item--text  portfolio__item--nav">
        <div>
            <?php next_post_link( '%link', '<div class="caption">' . esc_html__( 'next', 'timber-lite' ) . '</div> <div class="nav__label">%title</div>' ); ?>
            <?php previous_post_link( '%link', '<div class="caption">' . esc_html__( 'prev', 'timber-lite' ) . '</div> <div class="nav__label">%title</div>' ); ?>
            <a class="nav__link--archive" href="<?php echo timber_lite_get_portfolio_page_link(); ?>">
                <div class="caption"><?php esc_html_e( 'back to', 'timber-lite' ); ?></div>
                <div class="nav__label"><?php esc_html_e( "Index", 'timber-lite' ); ?></div>
            </a>
        </div>
    </div>

</article><!-- #post-<?php the_ID(); ?> .entry-content -->

<div class="site-content__mask  mask--project"></div>
