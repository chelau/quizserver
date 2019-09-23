<?php

/**
 * Class ATI_Object_Groups_Clear_Cache
 */
class ATI_Object_Groups_Clear_Cache {

	/**
	 * ATI_Object_Groups_Clear_Cache constructor.
	 */
	public function __construct() {
		add_action( 'save_post', array( $this, 'clear_post_field_groups' ) );
		add_action( 'profile_update', array( $this, 'clear_user_field_groups' ) );
		add_action( 'edit_term', array( $this, 'clear_term_field_groups' ) );

		add_action( 'init', array( $this, 'verify_field_groups' ), 30 );
	}

	/**
	 * Clear post field groups cache.
	 *
	 * @param int $post_id .
	 */
	public function clear_post_field_groups( $post_id ) {
		delete_post_meta( $post_id, '_field_groups' );
	}

	/**
	 * Clear the user field group cache.
	 *
	 * @param int $user_id .
	 */
	public function clear_user_field_groups( $user_id ) {
		delete_user_meta( $user_id, '_field_groups' );
	}

	/**
	 * Clear the term field group cache.
	 *
	 * @param int $term_id .
	 */
	public function clear_term_field_groups( $term_id ) {
		delete_term_meta( $term_id, '_field_groups' );
	}

	/**
	 * Clear all field group caches if field groups changed.
	 */
	public function verify_field_groups() {
		$existing_field_groups = get_option( 'existing_field_groups', array() );
		if ( function_exists( 'acf_local' ) ) {
			$groups = array_keys( acf_local()->groups );
		} else {
			$groups = apply_filters( 'acf/get_field_groups', array() );
			$groups = $groups ? array_map( function( $element ) {
				return $element['title'];
			}, $groups ) : $groups;
		}

		$groups_changed = ! empty( array_diff( $existing_field_groups, $groups ) ) || ! empty( array_diff( $groups, $existing_field_groups ) );
		if ( $groups_changed ) {
			delete_metadata( 'post', null, '_field_groups', '', true );
			delete_metadata( 'term', null, '_field_groups', '', true );
			delete_metadata( 'user', null, '_field_groups', '', true );
			update_option( 'existing_field_groups', $groups );
		}
	}
}