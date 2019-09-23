<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
class Stionic_Includes_Users extends WP_REST_Controller {
	public function __construct() {
		// when rest api init
		add_action( 'rest_api_init', array( $this, 'register_routes' ));
	}
	public function register_routes() {
		// add featured_url field to post, page endpoint
		register_rest_field( array('user'),
			'm_avatar',
			array(
				'get_callback'    => array($this, 'm_avatar'),
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}
	function m_avatar( $object ){
		$avatar = get_avatar( $object['id'], 100 );
		if(!empty($avatar)) preg_match_all('/<img.+src=[\'"]([^\'"]+)[\'"].*>/i', $avatar, $avatar, PREG_SET_ORDER);
		$avatar = !empty($avatar) ? wp_specialchars_decode($avatar[0][1]) : null;
		return $avatar;
	}
}
new Stionic_Includes_Users();