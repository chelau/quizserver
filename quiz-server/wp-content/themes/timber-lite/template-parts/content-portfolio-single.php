<?php
/**
 * The template used for displaying Portfolio posts on single project pages
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

    timber_lite_the_project_types();
    ?>
    </div>
</header>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

	<?php
	/*
	 * Project film strip
	 */
	timber_lite_the_film_strip();
	?>

	<div class="js-last"></div>
	<div class="js-reference"></div>

</article><!-- #post-<?php the_ID(); ?> .entry-content -->

<div class="site-content__mask  mask--project"></div>

<div class="fullview">
    <div class="fullview__image"></div>
    <div class="fullview__close">x</div>
</div>
