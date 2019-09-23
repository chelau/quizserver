<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/** Requiere the JWT library. */
use \Firebase\JWT\JWT;

class Stionic_Endpoint_Facebook extends  WP_REST_Controller {
	public function __construct() {
		$this->namespace = 'wp/v2';
		add_action( 'rest_api_init', array( $this, 'register_api_hooks'));
	}
	public function register_api_hooks() {
		// login
		register_rest_route( $this->namespace, '/m_facebook/login', array(
			array(
				'methods'         => 'POST',
				'callback'        => array( $this, 'login' ),
				'args' => array(
					'token' => array(
						'required' => true,
						'sanitize_callback' => 'esc_sql'
					)
				),
			)
		) );
	}
	function login( $request ) {
        // require nextend facebook connect
		require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
		if ( !is_plugin_active( 'nextend-facebook-connect/nextend-facebook-connect.php' ) ) {
			return new WP_Error( 'nextend-social-connect-deactive', __( 'Nextend Social Connect Deactive' ), array( 'status' => 400 ) );
        }
        // require jwt auth
		if ( !is_plugin_active( 'jwt-authentication-for-wp-rest-api/jwt-auth.php' ) ) {
			return new WP_Error( 'jwt-auth-deactive', __( 'JWT Auth for WP REST API Deactive' ), array( 'status' => 400 ) );
        }

        if (!class_exists('Facebook')) {
            require_once( 'Facebook/autoload.php' );
        }
        $params = $request->get_params();
        $accessToken = $params['token'];

        $settings = maybe_unserialize(get_option('nsl_facebook'));
        if(empty($settings) || empty($settings['appid']) || empty($settings['secret'])) {
            $old_settings = maybe_unserialize(get_option('nextend_fb_connect'));
            $settings = array(
                'appid' => $old_settings['fb_appid'],
                'secret' => $old_settings['fb_secret']
            );
        }
        
        if (defined('NEXTEND_FB_APP_ID')) $settings['appid'] = NEXTEND_FB_APP_ID;
        if (defined('NEXTEND_FB_APP_SECRET')) $settings['secret'] = NEXTEND_FB_APP_SECRET;
    
        try {
            $fb = new Facebook\Facebook(array(
                'app_id'                  => $settings['appid'],
                'app_secret'              => $settings['secret']
            ));
        } catch(Exception $e) {
            return new WP_Error( 'wrong-config', __( 'Wrong config' ), array( 'status' => 404 ));
        }

        // The OAuth 2.0 client handler helps us manage access tokens
        $oAuth2Client = $fb->getOAuth2Client();

        // Exchanges a short-lived access token for a long-lived one
        try {
            $accessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);
        } catch (Facebook\Exceptions\FacebookSDKException $e) {
            return new WP_Error( 'access-token-not-long-live', __( 'Error getting long-lived access token' ), array( 'status' => 400 ));
        }

        $response = $fb->get('/me?fields=id,name,email,first_name,last_name', $accessToken);
        $user_profile = $response->getGraphUser();

        global $wpdb;
        $ID = $wpdb->get_var($wpdb->prepare('SELECT ID FROM ' . $wpdb->prefix . 'social_users WHERE type = "fb" AND identifier = "%s"', $user_profile['id']));
        if (!get_user_by('id', $ID)) {
            $wpdb->query($wpdb->prepare('DELETE FROM ' . $wpdb->prefix . 'social_users WHERE ID = "%d"', $ID));
            $ID = null;
        }

        if ($ID == NULL) { // Register
            // check settings user can register
            if(!(bool)get_option('users_can_register')) return new WP_Error( 'users_can_not_register', 'Registration disabled', array( 'status' => 403 ));
                
            if (!isset($user_profile['email'])) $user_profile['email'] = $user_profile['id'] . '@facebook.com';
            $ID = email_exists($user_profile['email']);
            if ($ID == false) { // Real register

                require_once(ABSPATH . WPINC . '/registration.php');
                $random_password = wp_generate_password($length = 12, $include_standard_special_chars = false);
                if (!isset($new_fb_settings['fb_user_prefix'])) $new_fb_settings['fb_user_prefix'] = 'facebook-';

                $username             = strtolower($user_profile['first_name'] . $user_profile['last_name']);
                $sanitized_user_login = sanitize_user($new_fb_settings['fb_user_prefix'] . $username);
                if (!validate_username($sanitized_user_login)) {
                    $sanitized_user_login = sanitize_user('facebook' . $user_profile['id']);
                }
                $defaul_user_name = $sanitized_user_login;
                $i                = 1;
                while (username_exists($sanitized_user_login)) {
                    $sanitized_user_login = $defaul_user_name . $i;
                    $i++;
                }
                $ID = wp_create_user($sanitized_user_login, $random_password, $user_profile['email']);
                if (!is_wp_error($ID)) {
                    wp_new_user_notification($ID, $random_password);
                    $user_info = get_userdata($ID);
                    wp_update_user(array(
                        'ID'           => $ID,
                        'display_name' => $user_profile['name'],
                        'first_name'   => $user_profile['first_name'],
                        'last_name'    => $user_profile['last_name']
                    ));

                    //update_user_meta( $ID, 'new_fb_default_password', $user_info->user_pass);
                    do_action('nextend_fb_user_registered', $ID, $user_profile, $fb);
                } else {
                    return;
                }
            }
            if ($ID) {
                $wpdb->insert($wpdb->prefix . 'social_users', array(
                    'ID'         => $ID,
                    'type'       => 'fb',
                    'identifier' => $user_profile['id']
                ), array(
                    '%d',
                    '%s',
                    '%s'
                ));
            }
        }
        if ($ID) { // Login JWT

            $secret_key = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;
            
            /** First thing, check the secret key if not exist return a error*/
            if (!$secret_key) {
                return new WP_Error(
                    'jwt_auth_bad_config',
                    __('JWT is not configurated properly, please contact the admin', 'wp-api-jwt-auth'),
                    array(
                        'status' => 403,
                    )
                );
            }

            $user = new WP_User($ID);
            if(!$user->exists()){
                return WP_Error( 'user-not-exists', __( 'User not exists' ), array( 'status' => 404 ));
            }

            update_user_meta($ID, 'fb_profile_picture', 'https://graph.facebook.com/' . $user_profile['id'] . '/picture?type=large');
            update_user_meta($ID, 'fb_user_access_token', $accessToken);

            /** Valid credentials, the user exists create the according Token */
            $issuedAt = time();
            $notBefore = apply_filters('jwt_auth_not_before', $issuedAt, $issuedAt);
            $expire = apply_filters('jwt_auth_expire', $issuedAt + (DAY_IN_SECONDS * 7), $issuedAt);

            $token = array(
                'iss' => get_bloginfo('url'),
                'iat' => $issuedAt,
                'nbf' => $notBefore,
                'exp' => $expire,
                'data' => array(
                    'user' => array(
                        'id' => $user->data->ID,
                    ),
                ),
            );

            /** Let the user modify the token data before the sign. */
            $token = JWT::encode(apply_filters('jwt_auth_token_before_sign', $token, $user), $secret_key);

            /** The token is signed, now create the object with no sensible user data to the client*/
            $data = array(
                'token' => $token,
                'user_email' => $user->data->user_email,
                'user_nicename' => $user->data->user_nicename,
                'user_display_name' => $user->data->display_name,
            );

            /** Let the user modify the data before send it back */
            return apply_filters('jwt_auth_token_before_dispatch', $data, $user);
        }
    }
}
new Stionic_Endpoint_Facebook();