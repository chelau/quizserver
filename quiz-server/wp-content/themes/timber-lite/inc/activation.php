<?php
/**
 * Theme activation hook
 *
 * @package Timber Lite
 * @since Timber 1.0
 */

if ( ! function_exists( 'timber_lite_config_getting_active' ) ) :
	function timber_lite_config_getting_active() {
		/**
		 * ACTIVATION SETTINGS
		 * These settings will be needed when the theme will get active
		 * Careful with the first setup, most of them will go in the clients database and they will be stored there
		 */

		$pixtypes_conf_settings = array(
			'first_activation' => true,
			'post_types'       => array(
				'jetpack-portfolio'   => array(
					'description' => esc_html__( 'Portfolio Items', 'timber-lite' ),
					'labels'        => array(
						'name'               => esc_html__( 'Projects', 'timber-lite' ),
						'singular_name'      => esc_html__( 'Project', 'timber-lite' ),
						'add_new'            => esc_html__( 'Add New', 'timber-lite' ),
						'add_new_item'       => esc_html__( 'Add New Project', 'timber-lite' ),
						'edit_item'          => esc_html__( 'Edit Project', 'timber-lite' ),
						'new_item'           => esc_html__( 'New Project', 'timber-lite' ),
						'all_items'          => esc_html__( 'All Projects', 'timber-lite' ),
						'view_item'          => esc_html__( 'View Project', 'timber-lite' ),
						'search_items'       => esc_html__( 'Search Projects', 'timber-lite' ),
						'not_found'          => esc_html__( 'No Projects found', 'timber-lite' ),
						'not_found_in_trash' => esc_html__( 'No Projects found in Trash', 'timber-lite' ),
						'menu_name'          => esc_html__( 'Portfolio', 'timber-lite' ),
					),
					'public'        => true,
					'rewrite' => array(
						'slug'       => 'portfolio',
						'with_front' => false,
						'feeds'      => true,
						'pages'      => true,
					),
					'supports' => array(
						'title',
						'editor',
						'thumbnail',
						'comments',
						'revisions',
						'publicize',
						'wpcom-markdown',
					),
					'has_archive'   => 'portfolio-archive',
					'menu_icon'     => 'dashicons-portfolio',
					'menu_position' => null,

					'show_ui'         => true,                   // below Pages
					'capability_type' => 'page',
					'map_meta_cap'    => true,
					'taxonomies'      => array( 'jetpack-portfolio-tag', 'jetpack-portfolio-type' ),
					'query_var'       => 'portfolio',

					//'yarpp_support' => true,
				),
			),
			'taxonomies'       => array(

				'jetpack-portfolio-type'   => array(
					'hierarchical'      => true,
					'labels'            => array(
						'name'              => esc_html__( 'Project Types',         'timber-lite' ),
						'singular_name'     => esc_html__( 'Project Type',          'timber-lite' ),
						'menu_name'         => esc_html__( 'Project Types',         'timber-lite' ),
						'all_items'         => esc_html__( 'All Project Types',     'timber-lite' ),
						'edit_item'         => esc_html__( 'Edit Project Type',     'timber-lite' ),
						'view_item'         => esc_html__( 'View Project Type',     'timber-lite' ),
						'update_item'       => esc_html__( 'Update Project Type',   'timber-lite' ),
						'add_new_item'      => esc_html__( 'Add New Project Type',  'timber-lite' ),
						'new_item_name'     => esc_html__( 'New Project Type Name', 'timber-lite' ),
						'parent_item'       => esc_html__( 'Parent Project Type',   'timber-lite' ),
						'parent_item_colon' => esc_html__( 'Parent Project Type:',  'timber-lite' ),
						'search_items'      => esc_html__( 'Search Project Types',  'timber-lite' ),
					),
					'public'            => true,
					'show_ui'           => true,
					'show_in_nav_menus' => true,
					'show_admin_column' => true,
					'query_var'         => true,
					'rewrite'           => array( 'slug' => 'project-type' ),
					'post_types'        => array( 'jetpack-portfolio' )
				),

				'jetpack-portfolio-tag'   => array(
					'hierarchical'      => false,
					'labels'            => array(
						'name'                       => esc_html__( 'Project Tags',                   'timber-lite' ),
						'singular_name'              => esc_html__( 'Project Tag',                    'timber-lite' ),
						'menu_name'                  => esc_html__( 'Project Tags',                   'timber-lite' ),
						'all_items'                  => esc_html__( 'All Project Tags',               'timber-lite' ),
						'edit_item'                  => esc_html__( 'Edit Project Tag',               'timber-lite' ),
						'view_item'                  => esc_html__( 'View Project Tag',               'timber-lite' ),
						'update_item'                => esc_html__( 'Update Project Tag',             'timber-lite' ),
						'add_new_item'               => esc_html__( 'Add New Project Tag',            'timber-lite' ),
						'new_item_name'              => esc_html__( 'New Project Tag Name',           'timber-lite' ),
						'search_items'               => esc_html__( 'Search Project Tags',            'timber-lite' ),
						'popular_items'              => esc_html__( 'Popular Project Tags',           'timber-lite' ),
						'separate_items_with_commas' => esc_html__( 'Separate tags with commas',      'timber-lite' ),
						'add_or_remove_items'        => esc_html__( 'Add or remove tags',             'timber-lite' ),
						'choose_from_most_used'      => esc_html__( 'Choose from the most used tags', 'timber-lite' ),
						'not_found'                  => esc_html__( 'No tags found.',                 'timber-lite' ),
					),
					'show_admin_column' => true,
					'rewrite'           => array( 'slug' => 'project-tag' ),
					'sort'              => true,
					'post_types'        => array( 'jetpack-portfolio' )
				),
			),

			'metaboxes'        => array(

				'custom_portfolio_page_settings'   => array(
					'id'         => 'custom_portfolio_page_settings',
					'title'      => esc_html__( 'Custom Portfolio Template Options', 'timber-lite' ),
					'pages'      => array( 'page' ), // Post type
					'context'    => 'normal',
					'priority'   => 'high',
					'show_on'    => array( 'key' => 'page-template', 'value' => array( 'page-templates/custom-portfolio-page.php' ), ),
					'show_names' => true, // Show field names on the left
					'fields'     => array(
						array(
							'name'    => wp_kses_post( __( 'Page Content<a class="tooltip" title="Select what content would you like to be on this page."></a>', 'timber-lite' ) ),
							'desc'    => wp_kses_post( __( ' <p class="cmb_metabox_description" style="font-size: 90%">If you want to set this page as your <a href="https://en.support.wordpress.com/pages/front-page/" target="_blank">Front page</a>, simply go to <a href="customize.php">Customizer</a>, click on the <b>Static Front Page</b> tab on the left and select this one.</p>', 'timber-lite' ) ),
							'id'      => 'custom_portfolio_page_type',
							'type'    => 'radio',
							'std'     => 'project_slider',
							'options' => array(
								array(
									'name'  => wp_kses_post( __( '<span class="dashicons dashicons-format-gallery"></span> Projects Slider', 'timber-lite' ) ),
									'value' => 'project_slider',
								),
								array(
									'name'  => wp_kses_post( __( '<span class="dashicons dashicons-portfolio"></span> Portfolio Archive', 'timber-lite' ) ),
									'value' => 'portfolio',
								),
							)
						),

						array(
							'name'    => esc_html__( 'Featured Projects', 'timber-lite' ),
							'id'      => 'portfolio_featured_projects',
							'desc'    => esc_html__( 'Choose your featured projects. Drag and drop to reorder them to your liking.', 'timber-lite' ),
							'type'    => 'pw_multiselect_cpt',
							'options' => array(
								'args' => array(
									'post_type' => 'jetpack-portfolio',
									'post_status' => 'publish'
								),
							),
							'sanitization_cb' => 'pw_select2_sanitise',

							'display_on' => array(
								'display' => true,
								'on'      => array(
									'field' => 'custom_portfolio_page_type',
									'value' => 'project_slider'
								)
							),
						),

						array(
							'name'       => esc_html__( 'Select the project', 'timber-lite' ),
							'desc'       => esc_html__( 'Example: You can have a Filmstrip or Fullscreen gallery on the Front page (see above for details).', 'timber-lite' ),
							'id'         => 'homepage_project',
							'type'       => 'select_cpt_post',
							'options'    => array(
								'args' => array(
									'post_type' => 'jetpack-portfolio',
								),
								//'hidden' => true,
							),

							'display_on' => array(
								'display' => true,
								'on'      => array(
									'field' => 'custom_portfolio_page_type',
									'value' => 'project',
								),
							),
							'sanitization_cb' => 'pw_select2_sanitise',
						),
					),
				),
			),
		);

		/**
		 * After this line we won't config nothing.
		 * Let's add these settings into WordPress's options db
		 */

		// First, Pixtypes
		$types_options = get_option( 'pixtypes_themes_settings' );
		if ( empty( $types_options ) ) {
			$types_options = array();
		}
		$types_options[ 'timber_pixtypes_theme' ] = $pixtypes_conf_settings;
		update_option( 'pixtypes_themes_settings', $types_options );

		// force some pixproof settings
		$pixproof_settings = get_option( 'pixproof_settings' );
		if ( is_array($pixproof_settings) ) {
			$pixproof_settings['disable_pixproof_style'] = '1';
			update_option( 'pixproof_settings', $pixproof_settings );
		} else {
			$pixproof_settings = array (
				'disable_pixproof_style' => '1'
			);
			update_option( 'pixproof_settings', $pixproof_settings );
		}
	}
endif; // end timber_lite_config_getting_active
add_action( 'after_switch_theme', 'timber_lite_config_getting_active' );


// pixtypes requires these things below for a pixelgrade theme
// for the moment we'll shim them until we update pixtypes
if ( ! class_exists( 'wpgrade' ) ) :
class wpgrade {
	static function shortname() {
		return 'timber';
	}

	/** @var WP_Theme */
	protected static $theme_data = null;

	/**
	 * @return WP_Theme
	 */
	static function themedata() {
		if ( self::$theme_data === null ) {
			if ( is_child_theme() ) {
				$theme_name       = get_template();
				self::$theme_data = wp_get_theme( $theme_name );
			} else {
				self::$theme_data = wp_get_theme();
			}
		}

		return self::$theme_data;
	}

	/**
	 * @return string
	 */
	static function themeversion() {
		return wpgrade::themedata()->Version;
	}
}

function wpgrade_callback_geting_active() {
	timber_lite_config_getting_active();
}

endif;
