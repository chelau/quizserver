<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
use \Firebase\JWT\JWT;
class Stionic_Hook_JWT {
	public function __construct() {
		// add hooks
		add_filter( 'rest_pre_dispatch', array($this, 'rest_pre_dispatch'), 9 );
		add_filter( 'jwt_auth_expire', array($this, 'jwt_auth_expire') );
		add_filter( 'jwt_auth_token_before_dispatch', array($this, 'jwt_auth_token_before_dispatch'), 10, 2 );
	}
	function rest_pre_dispatch( ){
		if(isset($_SERVER['HTTP_AUTHORIZATION'])) {
			// check token is valid
			$authHeader = $_SERVER['HTTP_AUTHORIZATION'];
			// if request has HTTP_AUTHORIZATION
			if (!empty($authHeader)) {
				// get token from request header
				list($tokens) = sscanf( $authHeader, 'Bearer %s' );
				if(!empty($tokens)){
					$secret_key = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;
					try {
						$token = JWT::decode($tokens, $secret_key, array('HS256'));
						// if token valid
						if (isset($token->data->user->id)) {
							$accepts = get_user_meta($token->data->user->id, '_stionic_jwt_accept', true);
							// if token not in list token accepted
							if(is_array($accepts) && !in_array(explode('.', $tokens)[2], $accepts))
								return new WP_Error('token_not_accept', 'Token is not accepted', array('status'=>403));
						}
					} catch(Exception $e) {}
				}
			}
		}
	}
	function jwt_auth_expire(){
		// change expire token 10 year
		return time() + (DAY_IN_SECONDS * 3650);
	}
	function jwt_auth_token_before_dispatch($data, $user){
		// when user request login
		$data['id'] = $user->data->ID;
		// add token to list accept
		$accepts = get_user_meta( $data['id'], '_stionic_jwt_accept', true );
		if(empty($accepts)) $accepts = array();
		array_push($accepts, explode('.', $data['token'])[2]);
		// update list accept in database
		update_user_meta( $data['id'], '_stionic_jwt_accept', array_filter($accepts) );
		// rewrite response
		$avatar = get_avatar( $user->data->ID, 100 );
		if(!empty($avatar)) preg_match_all('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $avatar, $avatar, PREG_SET_ORDER);
		$data['avatar'] = !empty($avatar) ? wp_specialchars_decode($avatar[0][1]) : null;
		return $data;
	}
}
new Stionic_Hook_JWT();