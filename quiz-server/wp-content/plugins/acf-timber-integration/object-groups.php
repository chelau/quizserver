<?php

/**
 * Class ATI_Object_Groups
 */
class ATI_Object_Groups {

	/**
	 * All field group registered. Only used in ACF 5.
	 *
	 * @var array
	 */
	private static $field_groups;

	/**
	 * Post, user or term.
	 *
	 * @var string
	 */
	private $type;
	/**
	 * WordPress object.
	 *
	 * @var WP_Post|WP_Term|WP_User
	 */
	private $object;
	/**
	 * Is ACF active.
	 *
	 * @var bool
	 */
	private $v5 = false;

	/**
	 * ATI_Object_Groups constructor.
	 *
	 * @param WP_Post|WP_Term|WP_User $object .
	 * @param string                  $type .
	 */
	public function __construct( $object, $type ) {
		$this->object = $object;
		$this->type   = $type;

		$this->v5 = function_exists( 'acf_local' );
		if ( ( ! is_admin() || defined( 'DOING_AJAX' ) && DOING_AJAX ) && empty( ATI_Object_Groups::$field_groups ) && $this->v5 ) {
			$acf_local = acf_local();

			ATI_Object_Groups::$field_groups = $acf_local->groups;
		}
	}

	/**
	 * Retuns an array of the field groups assigned to current object.
	 *
	 * @return array
	 */
	public function get_fields_groups() {
		$existing_fields = array();
		if ( 'post' === $this->type ) {
			if( is_preview() ) {
				$existing_fields = $this->get_post_fields_by_fieldgroup( $this->object );
			} else {
				$existing_fields = get_post_meta( $this->object->ID, '_field_groups', true );
				if ( '' === $existing_fields ) {
					$existing_fields = $this->get_post_fields_by_fieldgroup( $this->object );
					update_post_meta( $this->object->ID, '_field_groups', $existing_fields );
				}
			}
		}

		if ( 'term' === $this->type ) {
			$existing_fields = get_term_meta( $this->object->term_id, '_field_groups', true );
			if ( '' === $existing_fields ) {
				$existing_fields = $this->get_term_fields_by_fieldgroup( $this->object );
				update_term_meta( $this->object->term_id, '_field_groups', $existing_fields );
			}
		}

		if ( 'user' === $this->type ) {
			$existing_fields = get_user_meta( $this->object->ID, '_field_groups', true );
			if ( '' === $existing_fields ) {
				$existing_fields = $this->get_user_fields_by_fieldgroup( $this->object );
				update_user_meta( $this->object->ID, '_field_groups', $existing_fields );
			}
		}

		if ( $this->v5 ) {
			$field_groups = array();
			foreach ( ATI_Object_Groups::$field_groups as $group ) {
				if ( in_array( $group['key'], $existing_fields, true ) ) {
					$group           = acf_get_field_group( $group['key'] );
					$group['fields'] = acf_get_fields( $group );
					$field_groups[]  = $group;
				}
			}

			return $field_groups;

		} else {
			$new_existing_fields = array();
			foreach ( $existing_fields as $index => $existing_field ) {
				$new_existing_fields[ $index ]['id']     = $existing_field;
				$new_existing_fields[ $index ]['fields'] = apply_filters( 'acf/field_group/get_fields', array(), $existing_field );
			}

			return $new_existing_fields;
		}
	}

	/**
	 * Returns all the field available on post.
	 *
	 * @param \WP_Post $post .
	 *
	 * @return array
	 */
	protected function get_post_fields_by_fieldgroup( $post ) {
		$args = array(
			'post_id'       => $post->ID,
			'post_type'     => 'revision' !== $post->post_type ? $post->post_type : get_post_type( $post->post_parent ),
			'page_template' => get_post_meta( $post->ID, '_wp_page_template', true ),
			'page_parent'   => $post->post_parent,
			'page_type'     => $post->post_type,
			'post_status'   => $post->post_status,
			'post_format'   => get_post_format( $post->ID ),
			'post_taxonomy' => null,
			'taxonomy'      => null,
			'user_id'       => 0,
			'user_role'     => 0,
			'user_form'     => 0,
			'attachment'    => 0,
			'comment'       => 0,
			'widget'        => 0,
			'lang'          => function_exists( 'acf_get_setting' ) ? acf_get_setting( 'current_language' ) : get_locale(),
			'ajax'          => defined( 'DOING_AJAX' ) && DOING_AJAX,
		);

		if ( $this->v5 ) {
			return $this->get_fields_by_fieldgroup( $args, $post->ID );
		} else {
			return apply_filters( 'acf/location/match_field_groups', array(), $args );
		}
	}

	/**
	 * Returns all the fields available for user.
	 *
	 * @param \Timber\User $user .
	 *
	 * @return array
	 */
	protected function get_user_fields_by_fieldgroup( $user ) {

		$args = array(
			'post_id'       => 0,
			'post_type'     => 0,
			'page_template' => 0,
			'page_parent'   => 0,
			'page_type'     => 'user',
			'post_status'   => 0,
			'post_format'   => 0,
			'post_taxonomy' => null,
			'taxonomy'      => 0,
			'user_id'       => $user->ID,
			'ef_user'       => $user->ID,  // ACF 4.
			'user_form'     => 'edit',
			'user_role'     => 0,
			'attachment'    => 0,
			'comment'       => 0,
			'widget'        => 0,
			'lang'          => function_exists( 'acf_get_setting' ) ? acf_get_setting( 'current_language' ) : get_locale(),
			'ajax'          => defined( 'DOING_AJAX' ) && DOING_AJAX,
		);

		if ( $this->v5 ) {
			return $this->get_fields_by_fieldgroup( $args, 'user_' . $user->ID );
		} else {
			return apply_filters( 'acf/location/match_field_groups', array(), $args );
		}

	}

	/**
	 * Generate all fields for term.
	 *
	 * @param \Timber\Term $term .
	 *
	 * @return array
	 */
	protected function get_term_fields_by_fieldgroup( $term ) {
		$args = array(
			'post_id'       => 0,
			'post_type'     => 0,
			'page_template' => 0,
			'page_parent'   => 0,
			'page_type'     => 'taxonomy',
			'post_status'   => 0,
			'post_format'   => 0,
			'post_taxonomy' => null,
			'taxonomy'      => $term->taxonomy,
			'ef_taxonomy'   => $term->taxonomy, // ACF 4.
			'user_id'       => 0,
			'user_role'     => 0,
			'user_form'     => 0,
			'attachment'    => 0,
			'comment'       => 0,
			'widget'        => 0,
			'lang'          => function_exists( 'acf_get_setting' ) ? acf_get_setting( 'current_language' ) : get_locale(),
			'ajax'          => defined( 'DOING_AJAX' ) && DOING_AJAX,
		);

		if ( $this->v5 ) {
			return $this->get_fields_by_fieldgroup( $args, $term->taxonomy . '_' . $term->ID );
		} else {
			return apply_filters( 'acf/location/match_field_groups', array(), $args );
		}
	}

	/**
	 * Context agnostic fields retriever.
	 *
	 * @param array  $args arguments for location match.
	 * @param string $id second parameter of get_field().
	 *
	 * @return array
	 */
	protected function get_fields_by_fieldgroup( $args, $id ) {
		$fields = array();

		foreach ( ATI_Object_Groups::$field_groups as $field_group ) {
			$field_group           = acf_get_field_group( $field_group['key'] );
			$field_group['fields'] = acf_get_fields( $field_group );

			$export = false;
			foreach ( $field_group['location'] as $group_id => $group ) {
				// start of as true, this way, any rule that doesn't match will cause this varaible to false.
				$match_group = true;
				// loop over group rules.
				if ( ! empty( $group ) ) {
					foreach ( $group as $rule_id => $rule ) {
						$match = apply_filters( 'acf/location/rule_match/' . $rule['param'] , false, $rule, $args );
						if ( ! $match ) {
							$match_group = false;
							break;
						}
					}
				}
				// all rules must havematched!
				if ( $match_group ) {
					$export = true;
				}
			}
			if ( $export ) {
				$fields[] = $field_group['key'];
			}
		}

		return $fields;
	}
}