<?php
/**
 * The template used for displaying page content in page.php
 *
 * @package Timber Lite
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

$background_image = wp_get_attachment_url( get_post_thumbnail_id($post->ID) ); ?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<?php if ( ! empty( $background_image ) ) : ?>

	<header class="entry-header  cover  full-height" style="background-image: url('<?php echo esc_url( $background_image ); ?>');">

	<?php else : ?>

	<header class="entry-header  cover  no-image">

	<?php endif; ?>

		<div class="cover-container">
		<?php the_title( '<h1 ' . timber_lite_get_post_title_class_attr( 'entry-title  h0' ) . '>', '</h1>' ); ?>
		</div>

	</header><!-- .entry-header -->

	<div class="entry-content">

		<?php the_content(); ?>
		<?php
			wp_link_pages( array(
				'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'timber-lite' ),
				'after'  => '</div>',
			) );
		?>

	</div><!-- .entry-content -->

	<footer class="entry-footer">
		<?php edit_post_link( esc_html__( 'Edit', 'timber-lite' ), '<span class="edit-link">', '</span>' ); ?>
	</footer><!-- .entry-footer -->
</article><!-- #post-## -->
