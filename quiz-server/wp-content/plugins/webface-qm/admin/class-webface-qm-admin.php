<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://www.webfacemedia.com
 * @since      1.0.0
 *
 * @package    Webface_Qm
 * @subpackage Webface_Qm/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Webface_Qm
 * @subpackage Webface_Qm/admin
 * @author     Tommy Adeniyi <tommyadeniyi@gmail.com>
 */
class Webface_Qm_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Webface_Qm_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Webface_Qm_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/webface-qm-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Webface_Qm_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Webface_Qm_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/webface-qm-admin.js', array( 'jquery' ), $this->version, false );

	}
	public function create_post_type() {
		$labels = array(
			'name' => __('Quizzes','webface-qm'),
			'singular_name' => __('Quiz','webface-qm'),
			'add_new' => __('Add New','webface-qm'),
			'all_items' => __('All Quizzes','webface-qm'),
			'add_new_item' => __('Add New Quiz','webface-qm'),
			'edit_item' => __('Edit Quiz','webface-qm'),
			'new_item' => __('New Quiz','webface-qm'),
			'view_item' => __('View Quiz','webface-qm'),
			'search_items' => __('Search Quizzes','webface-qm'),
			'not_found' =>  __('No Quizzes found','webface-qm'),
			'not_found_in_trash' => __('No Quizzes found in trash','webface-qm'),
			'parent_item_colon' => __('Parent Quiz:','webface-qm'),
			'menu_name' => __('Quizzes','webface-qm')
		);
		$args = array(
			'labels' => $labels,
			'description' => "A quiz api",
			'public' => true,
			'exclude_from_search' => false,
			'publicly_queryable' => true,
			'show_ui' => true,
			'show_in_nav_menus' => true,
			'show_in_menu' => true,
			'show_in_admin_bar' => true,
			'show_in_rest' => true,
			'menu_position' => 20,
			'menu_icon' => null,
			'capability_type' => 'page',
			'hierarchical' => true,
			'supports' => array('title','editor','author','thumbnail','excerpt'),
			'has_archive' => true,
			'rewrite' => array('slug' => 'quiz', 'with_front' => 'true'),
			'query_var' => true,
			'can_export' => true
		);
		register_post_type('quiz',$args);
	}
	/**
	 * Define where the local JSON is saved
	 *
	 * @return string
	 */
	public function get_local_json_path() {
		return WEBFACE_QM_PATH . '/acf-json';
	}

	/**
	 * Add our path for the local JSON
	 *
	 * @param array $paths
	 *
	 * @return array
	 */
	public function add_local_json_path( $paths ) {
		$paths[] = WEBFACE_QM_PATH . '/acf-json';

		return $paths;
	}
}
?>
