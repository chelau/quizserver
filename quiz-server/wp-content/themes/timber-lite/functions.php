<?php
/**
 * Timber Lite functions and definitions
 *
 * @package Timber Lite
 */

if ( ! function_exists( 'timber_lite_setup' ) ) :
	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * Note that this function is hooked into the after_setup_theme hook, which
	 * runs before the init hook. The init hook is too late for some features, such
	 * as indicating support for post thumbnails.
	 */
	function timber_lite_setup() {
		/*
		 * Make theme available for translation.
		 * Translations can be filed in the /languages/ directory.
		 * If you're building a theme based on Timber, use a find and replace
		 * to change 'timber-lite' to the name of your theme in all the template files
		 */
		load_theme_textdomain( 'timber-lite', get_template_directory() . '/languages' );

		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );

		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
		add_theme_support( 'title-tag' );

		add_theme_support( 'custom-logo'  );

		/*
		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * @link http://codex.wordpress.org/Function_Reference/add_theme_support#Post_Thumbnails
		 */
		add_theme_support( 'post-thumbnails' );

		//used for the small images of projects
		add_image_size( 'timber-small-image', 400, 9999, false );

		//used for the large images of projects
		add_image_size( 'timber-large-image', 1920, 9999, false );

		// Used for single project full view
		add_image_size( 'timber-fullview-image', 2560, 2560, false );

		//used for blog archive
		add_image_size( 'timber-square-image', 350, 350, true );

		// This theme uses wp_nav_menu() in two locations.
		register_nav_menus( array(
			'primary' => esc_html__( 'Primary Menu', 'timber-lite' ),
			'social' => esc_html__( 'Social Menu', 'timber-lite' )
		) );

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support( 'html5', array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
		) );

		/**
		 * Enable support for Post Formats.
		 * See http://codex.wordpress.org/Post_Formats
		 */
		add_theme_support( 'post-formats', array(
			'aside',
			'image',
			'gallery',
			'video',
			'audio',
			'quote',
			'link',
		) );

		add_filter( 'attachment_link', 'timber_lite_filter_attachment_links_on_singles', 2, 2 );
	}
endif; // timber_lite_setup
add_action( 'after_setup_theme', 'timber_lite_setup' );

/**
 * We need to force ajax off attachment links on posts and pages since it is a chance to trigger a modal opening
 * and an ajax call
 * @param $link
 * @param $id
 *
 * @return string
 */
function timber_lite_filter_attachment_links_on_singles( $link, $id  ){
	if ( wp_attachment_is_image( $id ) && ( is_singular( 'post' ) || is_page()) ) {
		return $link . '#';
	}
	return $link;
}

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *x
 * @global int $content_width
 */
function timber_lite_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'timber_content_width', 2570 );
}
add_action( 'after_setup_theme', 'timber_lite_content_width', 0 );

/*
 * Disable comments for the Portfolio CPT
 */
function timber_lite_remove_custom_post_comment() {
	remove_post_type_support( 'jetpack-portfolio', 'comments' );
}
add_action( 'init', 'timber_lite_remove_custom_post_comment' );

/**
 * Enqueue scripts and styles.
 */
function timber_lite_scripts_styles() {

	$theme = wp_get_theme( get_template() );
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

	// Main Style - we use this path instead of get_stylesheet_uri() so a child theme can extend this not override it.
	wp_enqueue_style( 'timber-style', get_template_directory_uri() . '/style.css', array( 'wp-mediaelement' ), $theme->get( 'Version' ) );

	$script_dependencies = array( 'jquery', 'wp-mediaelement' );
	wp_enqueue_script( 'modernizr', get_template_directory_uri() . '/assets/js/plugins/modernizr.min.js', array( 'jquery' ), '3.3.1' );
	$script_dependencies[] = 'modernizr';
	wp_enqueue_script( 'tween-max', '//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.5/TweenMax.min.js', array( 'jquery' ) );
	$script_dependencies[] = 'tween-max';
	wp_enqueue_script( 'scroll-to-plugin', '//cdnjs.cloudflare.com/ajax/libs/gsap/1.18.5/plugins/ScrollToPlugin.min.js', array( 'jquery' ) );
	$script_dependencies[] = 'scroll-to-plugin';
	wp_enqueue_script( 'timber-rs', '//pxgcdn.com/js/rs/9.5.7/index.js', array( 'jquery' ) );
	$script_dependencies[] = 'timber-rs';
	wp_enqueue_script( 'timber-mix', '//pxgcdn.com/js/mixitup/2.1.11/index.js', array( 'jquery' ) );
	$script_dependencies[] = 'timber-mix';
	wp_register_script( 'timber-scripts', get_template_directory_uri() . '/assets/js/main' . $suffix . '.js', $script_dependencies, $theme->get( 'Version' ), true );

	// Localize the script with new data
	$translation_array = array(
		'tPrev' => esc_html__('Previous (Left arrow key)', 'timber-lite'),
		'tNext' => esc_html__('Next (Right arrow key)', 'timber-lite'),
		'tCounter' => esc_html__('of', 'timber-lite'),
		'infscrLoadingText' => wp_kses_post( __("<em>Loading more...</em>", 'timber-lite') ),
		'infscrReachedEnd' => wp_kses_post( __("<em>Nothing left to load.</em>", 'timber-lite') ),
	);

	wp_localize_script( 'timber-scripts', 'objectl10n', $translation_array );

	wp_localize_script( 'timber-scripts', 'timber_ajax', array(
		'ajax_url' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce( 'timber_ajax' ),
		'posts_number' => get_option( 'posts_per_page' ),
	) );

	// Enqueued script with localized data.
	wp_enqueue_script( 'timber-scripts' );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	wp_enqueue_script('mousewheel' , get_template_directory_uri() . '/assets/js/plugins/jquery.mousewheel.min.js', array('jquery'), '3.1.13', true );

	// For back to top link
	global $timber_show_footer;

	$timber_show_footer = false;
	if ( ! (get_post_type() == 'proof_gallery') && ! timber_lite_post_is_project() && ( is_page() || is_single() ) ) {
		$timber_show_footer = true;
		$this_template = basename( get_page_template() );

		if ( is_page() && $this_template  === 'custom-portfolio-page.php' ) {
			$custom_portfolio_page_type = get_post_meta( timber_lite_get_post_id(), 'custom_portfolio_page_type', true);

			if ( $custom_portfolio_page_type === 'project_slider' ) {
				$timber_show_footer = false;
			}
		}
	}

	// if jetpack's carousel is enabled, enqueue the scripts in root
	// this way the assets will get registered with the proper root url
	if ( class_exists( 'Jetpack_Carousel' ) ) {
		// Create new carousel so we can use the enqueue_assets() method. Not ideal, but there is a decent amount
		// of logic in that method that shouldn't be duplicated.
		$carousel = new Jetpack_Carousel();

		// First parameter is $output, which comes from filters, and causes bypass of the asset enqueuing. Passing null is correct.
		$carousel->enqueue_assets();
	}
	add_filter( 'jp_carousel_force_enable', true );

}
add_action( 'wp_enqueue_scripts', 'timber_lite_scripts_styles' );

/*
 * Enqueue some custom JS in the admin area for various small tasks
 */
function timber_lite_add_admin_page_scripts( $hook ){

	wp_enqueue_script(
		'timber_admin_custom_js', //unique handle
		get_template_directory_uri().'/assets/js/admin/admin.js', //location
		array('jquery') //dependencies
	);
}
add_action('admin_enqueue_scripts', 'timber_lite_add_admin_page_scripts' );


/*
 * Add custom css to the new-project admin page
 */
function timber_lite_add_new_project_admin_style( $hook ){
	global $typenow;

	if ( 'jetpack-portfolio' === $typenow ) {

$output = '
<style>

.collection-settings {
	display: none;
}

</style>';

		echo $output;
	}
}
add_action('admin_head', 'timber_lite_add_new_project_admin_style' );

function timber_lite_add_new_project_admin_editor_style() {
	global $typenow;

	if ( 'jetpack-portfolio' === $typenow ) {
		add_editor_style( 'project-editor-style.css' );
	}
}
add_action( 'admin_init', 'timber_lite_add_new_project_admin_editor_style' );

/**
 * Get an array with all queued scripts
 *
 * @return array
 */
function timber_lite_get_queued_scripts() {
	global $wp_scripts;

	$loading_scripts = array();
	foreach ( $wp_scripts->queue as $key => $handle ) {
		if ( strpos( $wp_scripts->registered[ $handle ]->src, 'http' ) === false && strpos( $wp_scripts->registered[ $handle ]->src, '//' ) !== 0 ) {
			$loading_scripts[ $handle ]['src'] = site_url() . $wp_scripts->registered[ $handle ]->src;
		} else {
			$loading_scripts[ $handle ]['src'] = $wp_scripts->registered[ $handle ]->src;
		}

		if ( isset( $wp_scripts->registered[ $handle ]->extra ) && isset( $wp_scripts->registered[ $handle ]->extra['data'] )){
			$loading_scripts[ $handle ]['data'] = $wp_scripts->registered[ $handle ]->extra['data'];
		}
	}
	return $loading_scripts;
}

/**
 * Get an array with all queued styles
 *
 * @return array
 */
function timber_lite_get_queued_styles() {
	global $wp_styles;

	$loading_styles = array();
	foreach ( $wp_styles->queue as $key => $handle ) {
		if ( strpos( $wp_styles->registered[ $handle ]->src, 'http' ) === false && strpos( $wp_styles->registered[ $handle ]->src, '//' ) !== 0 ) {
			$loading_styles[ $handle ] = site_url() . $wp_styles->registered[ $handle ]->src;
		} else {
			$loading_styles[ $handle ] = $wp_styles->registered[ $handle ]->src;
		}
	}
	return $loading_styles;
}

/**
 * Localize a static list with resources already loaded on the first page load this lists will be filled on
 * each d-jax request which has new resources
 *
 * Note: make this dependent to timber-scripts because we know for sure it is there
 */
function timber_lite_localize_scripts_and_styles() {
	wp_localize_script( 'timber-scripts', 'timber_static_resources', array(
		'scripts' => timber_lite_get_queued_scripts(),
		'styles'  => timber_lite_get_queued_styles()
	) );
}
add_action( 'wp_enqueue_scripts', 'timber_lite_localize_scripts_and_styles', 999999 );

function timber_lite_last_function(){
	/**
	 * Display dynamic generated data while runing d-jax requests :
	 *
	 * a script which will load others scripts on the run
	 */
	$dynamic_scripts = timber_lite_get_queued_scripts();
	$dynamic_styles  = timber_lite_get_queued_styles();?>
	<div id="djax_list_scripts_and_styles">
		<script id="timber_list_scripts_and_styles"  class="djax-updatable">
			(function ($) {
				// wait for all dom elements
				$(document).ready(function () {
					var globalDebug = false;
					// run this only if we have resources
					if (!window.hasOwnProperty('timber_static_resources')) return;
					window.timber_dynamic_loaded_scripts = <?php echo json_encode( $dynamic_scripts ); ?>;
					window.timber_dynamic_loaded_styles = <?php echo json_encode( $dynamic_styles ); ?>;

					// timber_dynamic_loaded_scripts is generated in footer when all the scripts should be already enqueued
					$.each( window.timber_dynamic_loaded_scripts, function (key, data) {

						if (key in timber_static_resources.scripts) return;

						var url = data['src'];
						// add this script to our global stack so we don't enqueue it again
						timber_static_resources.scripts[key] = url;

						// if this script has localized content, we need to ensure that it's presence in page
						if ( typeof data['data'] !== "undefined" && data['data'].indexOf('=')  > 0 ) {

							var object_name_start = data['data'].indexOf(' ' ) + 1,
								object_name_end = data['data'].indexOf('=') - 1,
								object_name = data['data'].substring( object_name_start, object_name_end );

							if ( typeof window[object_name] === "undefined") {
								// try to parse the data, but please, no errors here
								try {
									window[object_name] = JSON.parse( data['data'].substring( data['data'].indexOf('=') + 2, data['data'].length - 1 ) );
								} catch (e) {
									console.log( e );
								}
							}
						}

						$.getScript(url)
							.done(function (script, textStatus) {
								//console.log(textStatus);
								$(document).trigger('timber-lite' + key + ':script:loaded');
								//console.log( 'timber:' + key + ':script:loaded' );
							})
							.fail(function (jqxhr, settings, exception) {
								if (globalDebug) {
									console.log('I failed');
									console.log( exception );
								}
							});

						if (globalDebug) {console.groupEnd();}

						$(document).trigger('timber:page_scripts:loaded');
					});

					$.each( window.timber_dynamic_loaded_styles, function (key, url) {

						if (key in timber_static_resources.styles) return;

						if (globalDebug) {console.dir("Styles loaded dynamic");}
						if (globalDebug) {console.dir(key);}
						if (globalDebug) {console.log(url);}

						// add this style to our global stack so we don't enqueue it again
						timber_static_resources.styles[key] = url;

						// sorry no cache this time
						$.ajax({
							url: url,
							dataType: 'html',
							success: function (data) {
								$('<style type="text/css">\n' + data + '</style>').appendTo("head");
							}
						});

						if (globalDebug) {console.groupEnd();}

						$(document).trigger('timber:page_styles:loaded');
					});
				});
			})(jQuery);
		</script>
	</div>
	<?php
}
add_action('wp_footer', 'timber_lite_last_function', 999999);

/**
 * Registers/enqueues the scripts related to media JS APIs
 *
 */
function timber_lite_wp_enqueue_media() {

	// this will ensure all the resources needed for the media modal
	wp_enqueue_media();

	wp_enqueue_script( 'timber-image-widget-admin', get_template_directory_uri() . '/inc/widgets/assets/image.js', array(
		'media-upload',
		'media-views',
	) );

	wp_localize_script(
		'timber-image-widget-admin',
		'TimberImageWidget',
		array(
			'l10n' => array(
				'frameTitle'      => esc_html__( 'Choose an Image', 'timber-lite' ),
				'frameUpdateText' => esc_html__( 'Update Image', 'timber-lite' ),
			),
		)
	);
}
add_action( 'admin_enqueue_scripts', 'timber_lite_wp_enqueue_media' );

/**
 * And all the activation hooks.
 */
require_once get_template_directory() . '/inc/activation.php';

/**
 * Load various plugin integrations
 */
require_once get_template_directory() . '/inc/integrations.php';

/**
 * MB string functions for when the MB library is not available
 */
require_once get_template_directory() . '/inc/mb_compat.php';

/**
 * Custom template tags for this theme.
 */
require_once get_template_directory() . '/inc/template-tags.php';

/**
 * Custom functions that act independently of the theme templates.
 */
require_once get_template_directory() . '/inc/extras.php';

/**
 * Load the Hybrid Media Grabber class
 */
require_once get_template_directory() . '/inc/hybrid-media-grabber.php';

/**
 * Customizer additions.
 */
require_once get_template_directory() . '/inc/customizer.php';

/**
 * Admin dashboard related logic.
 */
require_once trailingslashit( get_template_directory() ) . 'inc/admin.php';
