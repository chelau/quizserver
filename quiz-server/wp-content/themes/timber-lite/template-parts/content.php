<?php
/**
 * Template part for displaying posts on archive.
 *
 * @package Timber Lite
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
} ?>

<article id="post-<?php the_ID(); ?>" <?php post_class('filmstrip__item'); ?>>
	<?php $src = wp_get_attachment_image_src( get_post_thumbnail_id(get_the_ID()), 'timber-square-image' ); ?>
	<a href="<?php the_permalink(); ?>" class="item__thumb" <?php if ( !empty($src[0]) ) echo 'style="background-image: url('. esc_url( $src[0] ) .')"';?>>


			<?php if ( 'post' == get_post_type() && in_array( get_post_format(), array( 'gallery', 'video', 'audio' ) ) ) : ?>

				<div class="post-meta">
					<div class="post-meta__content">
						<?php
						$post_format = get_post_format();
						switch ( $post_format ) {
							case 'video':
							case 'audio': echo '<i class="icon  icon-play"></i>';
								break;
							case 'gallery': echo timber_lite_get_post_gallery_count();
                                break;
						} ?>
					</div>
				</div>

			<?php endif; ?>
	</a>
	<div class="item__text">
		<header class="entry-header">
			<div class="entry-meta">

				<?php if ( 'post' == get_post_type() ) {
					timber_lite_posted_on();
					timber_lite_first_category();
				} else {
					echo get_post_type();
				} ?>

			</div><!-- .entry-meta -->

			<?php the_title( sprintf( '<h1 ' . timber_lite_get_post_title_class_attr( 'entry-title h3' ) . '><a href="%s" rel="bookmark">', esc_url( get_permalink() ) ), '</a></h1>' ); ?>

		</header><!-- .entry-header -->

		<div class="entry-content">

			<?php timber_lite_post_excerpt(); ?>

			<?php
			wp_link_pages( array(
				'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'timber-lite' ),
				'after'  => '</div>',
			) );
			?>
		</div><!-- .entry-content -->
	</div>

</article><!-- #post-## -->
