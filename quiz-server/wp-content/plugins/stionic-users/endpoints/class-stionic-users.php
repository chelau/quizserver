<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
class Stionic_Endpoint_Users extends WP_REST_Controller {
	public function __construct() {
		$this->namespace = 'wp/v2';
		add_action( 'rest_api_init', array( $this, 'register_api_hooks'));
	}
	public function register_api_hooks() {
		// register users
		register_rest_route( $this->namespace, '/m_users/register', array(
			array(
				'methods'         => 'POST',
				'callback'        => array( $this, 'register' ),
				'args' => array(
					'username' => array(
						'required' => true,
						'sanitize_callback' => 'esc_sql'
					),
					'email' => array(
						'required' => true,
						'sanitize_callback' => 'esc_sql'
					)
				),
			)
		) );
		// forgot password
		register_rest_route( $this->namespace, '/m_users/password', array(
			array(
				'methods'         => 'POST',
				'callback'        => array( $this, 'password' ),
				'args' => array(
					'username' => array(
						'required' => true,
						'sanitize_callback' => 'esc_sql'
					)
				),
			)
		) );
		// avatar
		register_rest_route( $this->namespace, '/m_users/avatar', array(
			array(
				'methods'         => 'POST',
				'callback'        => array( $this, 'update_avatar' ),
				'args' => array(
					'base64' => array(
						'required' => true,
						'sanitize_callback' => 'esc_sql'
					)
				)
			),
			array(
				'methods'         => 'DELETE',
				'callback'        => array( $this, 'remove_avatar' )
			)
		) );
		// Sign out of other token
		register_rest_route( $this->namespace, '/m_users/keep', array(
			array(
				'methods'         => 'POST',
				'callback'        => array( $this, 'keep' )
			)
		) );
	}
	function register( $request ) {
		if(!(bool)get_option('users_can_register')) return new WP_Error( 'users_can_not_register', 'Registration disabled', array( 'status' => 403 ));

		$parameters = $request->get_params();
		// check username
		$user_id = username_exists( $parameters['username'] );
		if($user_id !== false) {
			return new WP_Error( 'username_exists', 'Username already exists', array( 'status' => 404 ) );
		}
		// check email
		if(isset($parameters['email']) && email_exists($parameters['email']) != false) {
			return new WP_Error( 'email_exists', 'Email already exists', array( 'status' => 404 ) );
		}
		// create password
		$random_password = wp_generate_password( 6, false );
		$user_id = wp_create_user( $parameters['username'], $random_password, @$parameters['email'] );
		// update firstname & lastname
		$new_user = array(
			'ID' 			=> $user_id,
			'user_nicename' => @$parameters['username'],
			'display_name' 	=> @$parameters['username'],
			'nickname' 		=> @$parameters['username']
		);
		$user_id = wp_update_user( $new_user );
		// send email
		$this->send_notification($user_id, null, 'both', $random_password);
		return true;
	}
	function send_notification( $user_id, $deprecated = null, $notify = '', $password = null ) {
		if ( $deprecated !== null ) {
			_deprecated_argument( __FUNCTION__, '4.3.1' );
		}
		$user = get_userdata( $user_id );		
		// The blogname option is escaped with esc_html on the way into the database in sanitize_option
		// we want to reverse this for the plain text arena of emails.
		$blogname = wp_specialchars_decode(get_option('blogname'), ENT_QUOTES);
		// email to admin
		if ( 'user' !== $notify ) {
			$message  = sprintf( __( 'New user registration on your site %s:' ), $blogname ) . "\r\n\r\n";
			$message .= sprintf( __( 'Username: %s' ), $user->user_login ) . "\r\n\r\n";
			$message .= sprintf( __( 'Email: %s' ), $user->user_email ) . "\r\n";
			@wp_mail( get_option( 'admin_email' ), sprintf( __( '[%s] New User Registration' ), $blogname ), $message );
		}
		// `$deprecated was pre-4.3 `$plaintext_pass`. An empty `$plaintext_pass` didn't sent a user notifcation.
		if ( 'admin' === $notify || ( empty( $deprecated ) && empty( $notify ) ) ) return;
		// create message
		$message = __( 'Howdy USERNAME,

Your new account is set up.

You can log in with the following information:
Username: USERNAME
Password: PASSWORD
LOGINLINK

Thanks!

--The Team @ SITE_NAME' );
		$message = str_replace( 'SITE_NAME', $blogname, $message );
		$message = str_replace( 'LOGINLINK', '', $message );
		$message = str_replace( 'USERNAME', $user->user_login, $message );
		$message = str_replace( 'PASSWORD', $password, $message );
		// email to customer
		wp_mail($user->user_email, sprintf(__('[%s] Your username and password info'), $blogname), $message);
	}
	function password( $request ) {
		$parameters = $request->get_params();
		// check username
		$user_id = username_exists( $parameters['username'] );
		if($user_id == false) {
			return new WP_Error( 'user_not_exists', 'User is not exist', array( 'status' => 401 ) );
		}
		global $wpdb, $wp_hasher;
		$user = get_userdata( $user_id );
		// Generate something random for a password reset key.
		$key = wp_generate_password( 20, false );
		/** This action is documented in wp-login.php */
		do_action( 'retrieve_password_key', $user->user_login, $key );
		// Now insert the key, hashed, into the DB.
		if ( empty( $wp_hasher ) ) {
			require_once ABSPATH . WPINC . '/class-phpass.php';
			$wp_hasher = new PasswordHash( 8, true );
		}
		$hashed = time() . ':' . $wp_hasher->HashPassword( $key );
		$wpdb->update( $wpdb->users, array( 'user_activation_key' => $hashed ), array( 'user_login' => $user->user_login ) );
		$message = __("Someone has requested a password reset for the following account:") . "\r\n\r\n";
		$message .= sprintf(__('Username: %s'), $user->user_login) . "\r\n\r\n";
		$message .= __('If this was a mistake, just ignore this email and nothing will happen.') . "\r\n\r\n";
		$message .= __('To reset your password, visit the following address:') . "\r\n\r\n";
		$message .= '<' . network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user->user_login), 'login') . ">\r\n\r\n";
		return wp_mail($user->user_email, sprintf(__('[%s] Password Reset'), $user->user_login), $message);
	}
	function update_avatar( $request ) {
		// require wp user avatar
		require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
		if ( !is_plugin_active( 'wp-user-avatar/wp-user-avatar.php' ) ) {
			return new WP_Error( 'need_wp_user_avatar', __( 'Need active WP User Avatar' ), array( 'status' => 400 ) );
		}
		if (!extension_loaded('gd') || !function_exists('gd_info'))
			return new WP_Error( 'gd_library_not_install', __( 'GD library is NOT installed on your PHP' ), array( 'status' => 400 ));
		// get current user
		$user_id = (int) get_current_user_id();
		if ( ! (bool)$user_id ) return new WP_Error( 'need_login', __( 'You need to login for change avatar' ), array( 'status' => 403 ) );

		$params = $request->get_params();
		$image_base64string = $params['base64'];
		if((int)(strlen(rtrim($image_base64string, '=')) * 3 / 4)/1024 > 2048)
			return new WP_Error( 'file_too_large', __('File too large'), array( 'status' => 400 ) );
		// update avatar
		global $blog_id, $wpdb;
		list($type, $image_base64string) = explode(';', $image_base64string);
		list(, $type) = explode(':', $type);
		list(, $type) = explode('/', $type);
		list(, $image_base64string) = explode(',', $image_base64string);
		// get extension of image
		$type = strtolower($type);
		$image_base64string = str_replace(' ','+', $image_base64string);
		$data = imagecreatefromstring(base64_decode($image_base64string));
		if (!$data) return new WP_Error( 'file_invalid', __( 'The file is corrupt' ), array( 'status' => 400 ) );
		$image = imagecreatetruecolor(200, 200);
		$width = imagesx($data);
		$height = imagesy($data);
		imagecopyresampled($image, $data, 0, 0, 0, 0, 200, 200, $width, $height);
		// upload to upload folder
		$wp_upload_dir = wp_upload_dir();
		$filename = "avatar_".time().".$type";
		$path_to_file = $wp_upload_dir['path']."/".$filename;
		$filetype = wp_check_filetype( basename( $filename), null );
		@unlink($path_to_file);
		@imagejpeg($image, $path_to_file, 90);
		@imagedestroy($image);
		// insert to Wordpress
		$attachment = array(
			'post_mime_type' => wp_check_filetype( basename( $filename), null )['type'],
			'post_title' => preg_replace( '/\.[^.]+$/', '', basename( $filename ) ),
			'post_content' => '',
			'post_status' => 'inherit',
			'post_author' => $user_id,
			'guid' => $wp_upload_dir['url']."/".$filename,
		);
		$attachment_id = wp_insert_attachment($attachment, $path_to_file);
		// if not insert
		if(is_wp_error($attachment_id)) return false;
		$meta_key = $wpdb->get_blog_prefix($blog_id).'user_avatar';
		// Generate the metadata for the attachment, and update the database record.
		$attach_data = wp_generate_attachment_metadata( $attachment_id, $path_to_file );
		wp_update_attachment_metadata( $attachment_id, $attach_data );
		// Remove old attachment postmeta dung trong wp-user-avatar plugin
		wp_delete_attachment(get_user_meta($user_id, $meta_key, true), true);
		delete_metadata('post', null, '_wp_attachment_wp_user_avatar', $user_id, true);
		// Create new attachment postmeta dung trong wp-user-avatar plugin
		add_post_meta($attachment_id, '_wp_attachment_wp_user_avatar', $user_id);
		// Update usermeta dung trong wp-user-avatar plugin
		update_user_meta($user_id, $meta_key, $attachment_id);
		return $wp_upload_dir['url']."/".$filename;
	}
	function remove_avatar(){
		global $wpdb;
		// get current user
		$user_id = (int) get_current_user_id();
		if ( ! (bool)$user_id ) return new WP_Error( 'need_login', __( 'You need to login for remove avatar' ), array( 'status' => 403 ) );

		try {
			$attachment_id = get_user_meta($user_id, $wpdb->get_blog_prefix($blog_id).'user_avatar', true);
			if(!$attachment_id) return false;
			wp_delete_attachment($attachment_id, true);
			delete_metadata('post', null, '_wp_attachment_wp_user_avatar', $user_id, true);
			delete_user_meta($user_id, $wpdb->get_blog_prefix($blog_id).'user_avatar');
			$avatar = get_avatar( $user_id, 100 );
			if(!empty($avatar)) preg_match_all('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $avatar, $avatar, PREG_SET_ORDER);
			$avatar = !empty($avatar) ? wp_specialchars_decode($avatar[0][1]) : null;
			return $avatar;
		} catch(Exception $e) {
			return false;
		}
	}
	function keep(){
		// get current user
		$user_id = (int) get_current_user_id();
		if ( ! (bool)$user_id ) return new WP_Error( 'need_login', __( 'You need to login' ), array( 'status' => 403 ) );

		$authHeader = $_SERVER['HTTP_AUTHORIZATION'];
		if ($authHeader) {
			list($token) = sscanf( $authHeader, 'Bearer %s' );
			if($token) {
				$sign = esc_sql(explode('.', $token)[2]);
				// only accept current JWT Token
				update_user_meta( $user_id, '_stionic_jwt_accept', array($sign) );
				// destroy session Wordpress
				$sessions = WP_Session_Tokens::get_instance($user_id);
				$sessions->destroy_all();
				return true;
			}
		}
		return false;
	}
}
new Stionic_Endpoint_Users();