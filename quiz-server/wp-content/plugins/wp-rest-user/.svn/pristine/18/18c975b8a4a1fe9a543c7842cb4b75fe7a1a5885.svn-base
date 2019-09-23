<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://sk8.tech
 * @since      1.1.0
 *
 * @package    Wp_Rest_User
 * @subpackage Wp_Rest_User/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Wp_Rest_User
 * @subpackage Wp_Rest_User/public
 * @author     SK8Tech <support@sk8.tech>
 */
class Wp_Rest_User_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.1.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.1.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.1.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct($plugin_name, $version) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Add the endpoints to the API
	 */
	public function add_api_routes() {
		/**
		 * Handle Register User request.
		 */
		register_rest_route('wp/v2', 'users/register', array(
			'methods' => 'POST',
			'callback' => array($this, 'register_user'),
		));
		register_rest_route('wp/v2', 'users/lostpassword', array(
			'methods' => 'POST',
			'callback' => array($this, 'lost_password'),
		));
		register_rest_route('wp/v2', 'users/lost-password', array(
			'methods' => 'POST',
			'callback' => array($this, 'lost_password'),
		));
	}

	/**
	 * Get the user and password in the request body and Register a User
	 *
	 * @author Jack
	 *
	 * @since    1.1.0
	 *
	 * @param [type] $request [description]
	 *
	 * @return [type] [description]
	 */
	public function register_user($request = null) {

		$response = array();
		$parameters = $request->get_json_params();
		$username = sanitize_text_field($parameters['username']);
		$email = sanitize_text_field($parameters['email']);
		$password = sanitize_text_field($parameters['password']);
		$role = sanitize_text_field($parameters['role']);
		$error = new WP_Error();

		if (empty($username)) {
			$error->add(400, __("Username field 'username' is required.", 'wp-rest-user'), array('status' => 400));
			return $error;
		}
		if (empty($email)) {
			$error->add(401, __("Email field 'email' is required.", 'wp-rest-user'), array('status' => 400));
			return $error;
		}
		if (empty($password)) {
			$error->add(404, __("Password field 'password' is required.", 'wp-rest-user'), array('status' => 400));
			return $error;
		}
		if (empty($role)) {
			// WooCommerce specific code
			if (class_exists('WooCommerce')) {
				$role = 'customer';
			} else {
				$role = 'subscriber';
			}
		} else {
			if ($GLOBALS['wp_roles']->is_role($role)) {
				if ($role == 'administrator' || $role == 'Editor' || $role == 'Author') {
					$error->add(406, __("Role field 'role' is not a permitted. Only 'contributor', 'subscriber' and your custom roles are allowed.", 'wp_rest_user'), array('status' => 400));
					return $error;
				} else {
					// Silence is gold
				}
			} else {
				$error->add(405, __("Role field 'role' is not a valid. Check your User Roles from Dashboard.", 'wp_rest_user'), array('status' => 400));
				return $error;
			}
		}

		$user_id = username_exists($username);
		if (!$user_id && email_exists($email) == false) {
			$user_id = wp_create_user($username, $password, $email);
			if (!is_wp_error($user_id)) {
				// Ger User Meta Data (Sensitive, Password included. DO NOT pass to front end.)
				$user = get_user_by('id', $user_id);
				$user->set_role($role);
				do_action('wp_rest_user_create_user', $user); // Deprecated
				do_action('wp_rest_user_user_register', $user);

				// Ger User Data (Non-Sensitive, Pass to front end.)
				$response['code'] = 200;
				$response['message'] = __("User '" . $username . "' Registration was Successful", "wp-rest-user");
			} else {
				return $user_id;
			}
		} else if ($user_id) {
			$error->add(406, __("Username already exists, please enter another username", 'wp-rest-user'), array('status' => 400));
			return $error;
		} else {
			$error->add(406, __("Email already exists, please try 'Reset Password'", 'wp-rest-user'), array('status' => 400));
			return $error;
		}

		return new WP_REST_Response($response, 200);
	}

	/**
	 * Get the username or email in the request body and Send a Forgot Password email
	 *
	 * @author Jack
	 *
	 * @since    1.3.0
	 *
	 * @param [type] $request [description]
	 *
	 * @return [type] [description]
	 */
	public function lost_password($request = null) {

		$response = array();
		$parameters = $request->get_json_params();
		$user_login = sanitize_text_field($parameters['user_login']);
		$error = new WP_Error();

		if (empty($user_login)) {
			$error->add(400, __("The field 'user_login' is required.", 'wp-rest-user'), array('status' => 400));
			return $error;
		} else {
			$user_id = username_exists($user_login);
			if ($user_id == false) {
				$user_id = email_exists($user_login);
				if ($user_id == false) {
					$error->add(401, __("User '" . $user_login . "' not found.", 'wp-rest-user'), array('status' => 401));
					return $error;
				}
			}
		}

		// run the action
		// ==============================================================
		//do_action('retrieve_password', $user_login);
		$user = null;
		$email = "";
		if (strpos($user_login, '@')) {
			$user = get_user_by('email', $user_login);
			$email = $user_login;
		} else {
			$user = get_user_by('login', $user_login);
			$email = $user->user_email;
		}
		$key = get_password_reset_key($user);
		$rp_link = '<a href="' . site_url() . "/wp-login.php?action=rp&key=$key&login=" . rawurlencode($user->user_login) . '">' . site_url() . "/wp-login.php?action=rp&key=$key&login=" . rawurlencode($user->user_login) . '';

		function wpdocs_set_html_mail_content_type() {
			return 'text/html';
		}
		add_filter('wp_mail_content_type', 'wpdocs_set_html_mail_content_type');
		$email_successful = wp_mail($email, 'Reset password', 'Click here in order to reset your password:<br><br>' . $rp_link);
		// Reset content-type to avoid conflicts -- https://core.trac.wordpress.org/ticket/23578
		remove_filter('wp_mail_content_type', 'wpdocs_set_html_mail_content_type');
		// ==============================================================

		if ($email_successful) {
			$response['code'] = 200;
			$response['message'] = __("Reset Password link had been send to your email.", "wp-rest-user");
		} else {
			$error->add(402, __("Failed to send Reset Password email. Check your WordPress Hosting Email Settings.", 'wp-rest-user'), array('status' => 402));
			return $error;
		}

		return new WP_REST_Response($response, 200);
	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.1.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Rest_User_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Rest_User_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style($this->plugin_name, plugin_dir_url(__FILE__) . 'css/wp-rest-user-public.css', array(), $this->version, 'all');

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.1.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Rest_User_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Rest_User_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/wp-rest-user-public.js', array('jquery'), $this->version, false);

	}

}
