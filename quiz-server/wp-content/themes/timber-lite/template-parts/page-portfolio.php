<?php
if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
} ?>

<div class="site-header  site-header--placeholder"></div>
<div class="site-container">
	<div class="site-content  portfolio-archive">

		<?php
		/**
		 * Displays portfolio page content if user opts to
		 * Can be controlled in Appearance > Customize > Theme Options
		 */

		if ( get_query_var( 'paged' ) ) :
			$page_number = get_query_var( 'paged' );
		elseif ( get_query_var( 'page' ) ) :
			$page_number = get_query_var( 'page' );
		else :
			$page_number = 1;
		endif;

		$posts_per_page = get_option( 'jetpack_portfolio_posts_per_page', '12' );

		$portfolio_types = get_terms( 'jetpack-portfolio-type' );

		$args = array(
			'post_type' => 'jetpack-portfolio',
			'paged' => $page_number,
			'posts_per_page' => $posts_per_page,
		);

		$project_query = new WP_Query( $args );

		if ( $project_query -> have_posts() ) : ?>

			<div class="site-sidebar  site-sidebar--archive">
				<h1 class="site-sidebar__content  site-sidebar__text"><?php the_title(); ?></h1>
				<?php if ( ! is_wp_error($portfolio_types) && ! empty( $portfolio_types ) ) : ?>
				<div class="mobile-filter-wrapper">
					<select class="filter  filter--mobile  js-filter-mobile-portfolio">
						<option class="filter__item active" data-filter="*"><?php _e( 'All categories', 'timber-lite' ); ?></option>

						<?php foreach ( $portfolio_types as $portfolio_type ) : ?>

							<option class="filter__item" data-filter=".jetpack-portfolio-type-<?php echo $portfolio_type->slug; ?>"><?php echo $portfolio_type->name; ?></option>

						<?php endforeach; ?>

					</select>
				</div>
				<?php endif; ?>
			</div>

			<div class="portfolio-wrapper">

				<?php while ( $project_query -> have_posts() ) : $project_query -> the_post();

					get_template_part( 'template-parts/content', 'portfolio' );

				endwhile;

				timber_lite_paging_nav( $project_query->max_num_pages );

				wp_reset_postdata(); ?>

			</div>

		<?php else :

			get_template_part( 'template-parts/content', 'none' );

		endif; ?>
	</div>
</div>
