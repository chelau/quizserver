<?php
/**
Plugin Name: ACF Timber Integration
Description: Automatically enables in the Timber twig context variable all user-defined advanced custom fields.
Author: Dream Production
Author URI: https://dreamproduction.com/
Version: 1.3.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

require_once 'object-groups.php';
require_once 'object-groups-clear-cache.php';

/**
 * Main plugin class.
 *
 * Class ACF_Timber_Integration
 */
class ACF_Timber_Integration {

	/**
	 * ACF field groups.
	 *
	 * @var array
	 */
	private $field_groups = array();

	/**
	 * List of posts that have been processed.
	 *
	 * @var array
	 */
	private $processed_posts = array();

	/**
	 * List of users that have been processed.
	 *
	 * @var array
	 */
	private $processed_users = array();

	/**
	 * List of terms that have been processed.
	 *
	 * @var array
	 */
	private $processed_terms = array();

	/**
	 * This keeps track of the number of layers of Timber_Post/Timber_Term/Timber_User fields.
	 * This is used to stop posts fields recursions.
	 *
	 * @var int
	 */
	private $depth;

	/**
	 * This is used in correlation width $depth. Timber_Post will not get 'fields' if $depth has reached $post_fields_max_depth.
	 * @var int
	 */
	private $post_fields_max_depth;

	/**
	 * Array of keys and boolean values indicating if a post is being already processed. This is used to avoid infinite loops.
	 *
	 * @var array
	 */
	private $processing_posts = array();

	/**
	 * Array of keys and boolean values indicating if a terms is being already processed. This is used to avoid infinite loops.
	 *
	 * @var array
	 */
	private $processing_terms = array();

	/**
	 * Array of keys and boolean values indicating if a user is being already processed. This is used to avoid infinite loops.
	 *
	 * @var array
	 */
	private $processing_users = array();

	/**
	 * DP_Theme_Timber_Integration constructor.
	 */
	public function __construct() {

		add_filter( 'get_twig', array( $this, 'add_to_twig' ) );

		add_filter( 'timber_context', array( $this, 'add_to_context' ) );

		add_action( 'timber_post_get_meta', array( $this, 'add_fields_to_post' ), 10, 3 );

		add_filter( 'timber_user_get_meta', array( $this, 'add_fields_to_user' ), 10, 3 );

		add_filter( 'timber_term_get_meta', array( $this, 'add_fields_to_term' ), 10, 3 );

		$this->cache = new ATI_Object_Groups_Clear_Cache();

		$this->depth = 0;
		$this->post_fields_max_depth = apply_filters( 'acf_timber_posts_fields_max_depth', 2 );

		if ( ( ! is_admin() || defined( 'DOING_AJAX' ) && DOING_AJAX ) && function_exists( 'acf_local' ) ) {
			$acf_local          = acf_local();
			$this->field_groups = $acf_local->groups;
		}
	}

	/**
	 * Add function and filters to twig.
	 *
	 * @param \Twig_Environment $twig twig environment variable.
	 *
	 * @return \Twig_Environment
	 */
	public function add_to_twig( $twig ) {
		$twig->addFunction( new \Twig_SimpleFunction( 'srcset', array( $this, 'generate_image_srcset' ) ) );
		$twig->addFunction( new \Twig_SimpleFunction( 'image_attr', array( $this, 'generate_image_attributes' ) ) );

		return $twig;
	}

	/**
	 * Add global context variables
	 *
	 * @param array $context Array with variable from timber.
	 *
	 * @return array
	 */
	public function add_to_context( $context ) {
		global $_wp_registered_nav_menus;

		// Add menus to global context.
		$content['menus'] = array();
		if( $_wp_registered_nav_menus ) {
			foreach ( $_wp_registered_nav_menus as $menu_location => $menu_name ) {
				$args = array(
					'theme_location' => $menu_location,
					'container'      => '',
					'echo'           => false,
				);
				$name = str_replace( '-', '_', $menu_location );

				$context['menus'][$name] = wp_nav_menu( $args );
			}
		}

		// Add options fields to global context.
		$context['options'] = array();
		foreach ( $this->field_groups as $field_group ) {
			$field_group           = acf_get_field_group( $field_group['key'] );
			$field_group['fields'] = acf_get_fields( $field_group );
			$export                = false;

			foreach ( $field_group['location'] as $group_id => $group ) {
				if ( ! empty( $group ) ) {
					foreach ( $group as $rule_id => $rule ) {
						if ( 'options_page' === $rule['param'] ) {
							$export = true;
						}
					}
				}

				if ( $export ) {
					$aux_fields = $this->get_fields( 'options', $field_group['fields'] );

					$context['options'] = array_merge( $context['options'], $aux_fields );
				}
			}
		}

		$context['options'] = apply_filters( 'acf_timber_option_fields', $context['options'] );

		return $context;
	}

	/**
	 * Returns fields of current of higher levels of depth.
	 * Return empty array if object is currently being processed.
	 * Returns false if none existent.
	 *
	 * @param $id
	 * @param $type
	 *
	 * @return array|bool
	 */
	private function get_processed_fields( $id, $type ) {
		if( isset( $this->{'processing_' . $type }[ $id ] ) && $this->{'processing_' . $type }[ $id ] ) {
			return array();
		}

		$type = 'processed_' . $type;
		for ( $i = 0; $i <= $this->depth; $i++ ) {
			if( isset( $this->$type[ $i ][ $id ] ) ) {
				return $this->$type[ $i ][ $id ];
			}
		}
		return false;
	}

	/**
	 * Store generated fields for object types at the current depth level.
	 *
	 * @param $id
	 * @param $type
	 * @param $fields
	 */
	private function set_processed_fields( $id, $type, $fields ) {
		$type = 'processed_' . $type;
		for ( $i = $this->post_fields_max_depth; $i > $this->depth; $i-- ) {
			if ( isset( $this->$type[ $i ][ $id ] ) ) {
				unset( $this->$type[ $i ][ $id ] );
			}
		}
		$this->$type[ $this->depth ][ $id ] = $fields;
	}

	/**
	 * Add fields to post.
	 *
	 * @param array        $custom_fields .
	 * @param int          $id .
	 * @param \Timber\Post $post .
	 *
	 * @return array
	 */
	public function add_fields_to_post( $custom_fields, $id, $post ) {

		if ( $this->get_processed_fields( $id, 'posts' ) !== false ) {
			$fields = $this->get_processed_fields( $id, 'posts' );
		} else {
			$this->processing_posts[ $id ] = true;

			$wp_post       = get_post( $id );
			$object_groups = new ATI_Object_Groups( $wp_post, 'post' );
			$field_groups  = $object_groups->get_fields_groups();

			$fields = $this->get_fields_form_groups( $id, $field_groups );
			$fields = apply_filters( 'acf_timber_post_fields', $fields, $post );

			$this->set_processed_fields( $id, 'posts', $fields );
			$this->processing_posts[ $id ] = false;
		}

		if ( $fields ) {
			foreach ( $fields as $key => $value ) {
				if ( isset( $custom_fields[ $key ] ) ) {
					unset( $custom_fields[ $key ] );
					unset( $custom_fields[ '_' . $key ] );
				}
			}

			unset( $custom_fields['_field_groups'] );
			$custom_fields['fields'] = $fields;
		}

		return $custom_fields;
	}

	/**
	 * Add fields to user.
	 *
	 * @param array        $custom_fields .
	 * @param int          $id .
	 * @param \Timber\User $user .
	 *
	 * @return array
	 */
	public function add_fields_to_user( $custom_fields, $id, $user ) {

		if ( $this->get_processed_fields( $id, 'users' ) !== false ) {
			$fields = $this->get_processed_fields( $id, 'users' );
		} else {
			$this->processing_users[ $id ] = true;

			$object_groups = new ATI_Object_Groups( $user, 'user' );
			$field_groups  = $object_groups->get_fields_groups();

			$fields = $this->get_fields_form_groups( 'user_' . $user->ID, $field_groups );
			$fields = apply_filters( 'acf_timber_user_fields', $fields, $user );

			$this->set_processed_fields( $id, 'users', $fields );

			$this->processing_users[ $id ] = false;
		}

		if ( ! empty( $fields ) ) {
			foreach ( $fields as $key => $value ) {
				if ( isset( $custom_fields[ $key ] ) ) {
					unset( $custom_fields[ $key ] );
					unset( $custom_fields[ '_' . $key ] );
				}
			}

			unset( $custom_fields['_field_groups'] );

			$custom_fields['fields'] = $fields;
		}

		return $custom_fields;
	}

	/**
	 * Add fields to term.
	 *
	 * @param array        $custom_fields .
	 * @param int          $id .
	 * @param \Timber\Term $term .
	 *
	 * @return mixed
	 */
	public function add_fields_to_term( $custom_fields, $id, $term ) {

		if ( $this->get_processed_fields( $id, 'terms' ) !== false ) {
			$fields = $this->get_processed_fields( $id, 'terms' );
		} else {
			$this->processing_terms[ $id ] = true;

			$object_groups = new ATI_Object_Groups( $term, 'term' );
			$field_groups  = $object_groups->get_fields_groups();
			$fields        = $this->get_fields_form_groups( $term->taxonomy . '_' . $term->id, $field_groups );

			$fields = apply_filters( 'acf_timber_term_fields', $fields, $term );

			$this->set_processed_fields( $id, 'terms', $fields );

			$this->processing_terms[ $id ] = false;
		}

		if ( ! empty( $fields ) ) {
			foreach ( $fields as $key => $value ) {
				if ( isset( $custom_fields[ $key ] ) ) {
					unset( $custom_fields[ $key ] );
					unset( $custom_fields[ '_' . $key ] );
				}
			}

			unset( $custom_fields['_field_groups'] );

			$custom_fields['fields'] = $fields;
		}

		return $custom_fields;
	}

	/**
	 * Get all the fields with values for $id from $groups array.
	 *
	 * @param string $id post/term/user id, second parameter for get_field function.
	 * @param array  $groups array of all the groups assigned to $id.
	 *
	 * @return array
	 */
	public function get_fields_form_groups( $id, $groups ) {
		$fields = array();

		foreach ( $groups as $group ) {
			$fields = array_merge( $fields, $this->get_fields( $id, $group['fields'] ) );
		}

		return $fields;
	}

	/**
	 * Returns values for requested $fields.
	 * Function works recursively for repeaters and flexible content.
	 *
	 * @param int   $id post/term/user id, second parameter for get_field function.
	 * @param array $fields array of fields.
	 * @param bool  $subfield true when $fields are actually sub fields.
	 *
	 * @return array
	 */
	protected function get_fields( $id, $fields, $subfield = false ) {
		$field_data = array();
		foreach ( $fields as $field ) {
			switch ( $field['type'] ) {
				case 'flexible_content':
					$layouts = array();
					foreach ( $field['layouts'] as $layout ) {
						$layouts[ $layout['name'] ] = $layout;
					}
					$field_data[ $field['name'] ] = array();
					while ( have_rows( $field['name'], $id ) ) {
						the_row();
						$current_layout        = get_row_layout();
						$current_layout_fields = $this->get_fields( $id, $layouts[ $current_layout ]['sub_fields'], true );

						$field_data[ $field['name'] ][] = array(
							'module' => $current_layout,
							'fields' => $current_layout_fields,
						);
					}

					break;
				case 'repeater':
					while ( have_rows( $field['name'], $id ) ) {
						the_row();
						$field_data[ $field['name'] ][] = $this->get_fields( $id, $field['sub_fields'], true );
					}
					break;
				case 'group':
					while ( have_rows( $field['name'], $id ) ) {
						the_row();
						$field_data[ $field['name'] ][] = $this->get_fields( $id, $field['sub_fields'], true );
					}
					break;
				case 'wysiwyg':
					ob_start();
					if ( ! $subfield ) {
						the_field( $field['name'], $id );
					} else {
						the_sub_field( $field['name'], $id );
					}
					$field_data[ $field['name'] ] = ob_get_clean();
					break;
				case 'post_object':
				case 'relationship':
					$post_object = $subfield ? get_sub_field( $field['name'], $id ) : get_field( $field['name'], $id );
					if ( $post_object ) {
						if ( is_array( $post_object ) ) {
							$post_object = array_map( array( $this, 'transform_post' ), $post_object );
						} else {
							$post_object = $this->transform_post( $post_object );
						}
					}
					$field_data[ $field['name'] ] = $post_object;

					break;
				case 'taxonomy':
					$term_object = $subfield ? get_sub_field( $field['name'], $id ) : get_field( $field['name'], $id );
					if ( $term_object ) {
						if ( is_array( $term_object ) ) {
							$term_object = array_map( array( $this, 'transform_term' ), $term_object );
						} else {
							$term_object = $this->transform_term( $term_object );
						}
					}
					$field_data[ $field['name'] ] = $term_object;
					break;
				case 'user':
					$user_object = $subfield ? get_sub_field( $field['name'], $id ) : get_field( $field['name'], $id );
					if ( ! empty( $user_object ) ) {
						if ( is_string( $user_object ) ) {
							$user_object = $this->transform_user( array( 'ID' => $user_object ) );
						} elseif ( isset( $user_object['ID'] ) ) {
							$user_object = $this->transform_user( $user_object );
						} else {
							$user_object = array_map( array( $this, 'transform_user' ), $user_object );
						}
					}
					$field_data[ $field['name'] ] = $user_object;
					break;
				case 'image':
					$image = $subfield ? get_sub_field( $field['name'], $id ) : get_field( $field['name'], $id );
					if ( $image ) {
						$image = $this->transform_image( $image );
					}
					$field_data[ $field['name'] ] = $image;
					break;
				case 'gallery':
					$images = $subfield ? get_sub_field( $field['name'], $id ) : get_field( $field['name'], $id );
					if ( $images ) {
						$images = array_map( array( $this, 'transform_image' ), $images );
					}
					$field_data[ $field['name'] ] = $images;
					break;
				case 'clone':
					if ( 'group' === $field['display'] ) {
						// At the moment of implementation ACF did not allow grouped cloned sub fields.
						if ( ! $subfield ) {
							$field_data[ $field['name'] ] = $this->get_fields( $id, $field['sub_fields'], true );
						} else {
							$field_data[ $field['name'] ] = get_sub_field( $field['name'] );
						}
					}
					break;
				default:
					$field_data[ $field['name'] ] = $subfield ? get_sub_field( $field['name'], $id ) : get_field( $field['name'], $id );
			}
		}
		return $field_data;
	}

	/**
	 * Transform post id or \WP_Post to \Timber\Post
	 *
	 * @param \WP_Post/int $post the post to be transformed.
	 *
	 * @return \Timber\Post
	 */
	protected function transform_post( $post ) {
		$this->before_timber_object_creation();

		if ( is_object( $post ) ) {
			$return = new \Timber\Post( $post->ID );
		} else {
			$return = new \Timber\Post( $post );
		}

		$this->after_tiber_object_creation();

		return $return;
	}

	/**
	 * Transform image id or image array to \Timber\Image
	 *
	 * @param array/int $image image to be transformed.
	 *
	 * @return \Timber\Image
	 */
	protected function transform_image( $image ) {
		if ( is_array( $image ) ) {
			if ( isset( $image['id'] ) ) { // ACF 4.
				return new \Timber\Image( $image['id'] );
			} else {
				return new \Timber\Image( $image['ID'] );
			}
		} else {
			return new \Timber\Image( $image );
		}
	}

	/**
	 * Transform wp term id or object to timber term object.
	 *
	 * @param WP_Term/int $term .
	 *
	 * @return \Timber\Term
	 */
	protected function transform_term( $term ) {
		$this->before_timber_object_creation();

		if ( is_object( $term ) ) {
			$return = new \Timber\Term( $term->term_id );
		} else {
			$return = new \Timber\Term( $term );
		}

		$this->after_tiber_object_creation();

		return $return;
	}

	/**
	 * Transform wp user id or object to timber user object.
	 *
	 * @param array $user .
	 *
	 * @return \Timber\User
	 */
	protected function transform_user( $user ) {
		$this->before_timber_object_creation();
		$return = new \Timber\User( $user['ID'] );
		$this->after_tiber_object_creation();

		return $return;
	}

	/**
	 * Generate the image srcset.
	 *
	 * @param \Timber\Image $image timber object images.
	 * @param string        $size one of the declared image sizes.
	 *
	 * @return string
	 */
	public function generate_image_srcset( $image, $size ) {
		if ( ! $image || is_bool( $image ) ) {
			return '';
		}

		if ( property_exists( $image, 'post_mime_type' ) && 'image/svg+xml' === $image->post_mime_type ) {
			return '';
		}

		if ( ! isset( $image->sizes[ $size ] ) ) {
			$downsize = image_downsize( $image->ID, $size );
			if ( ! $downsize ) {
				return '';
			}
		}

		$sources = array();

		if ( isset( $downsize ) ) {
			$size_array = array( $downsize[1], $downsize[2] );
		} else {
			$size_array = array( $image->sizes[ $size ]['width'], $image->sizes[ $size ]['height'] );
		}

		$required_ratio = $size_array[0] / $size_array[1]; // ratio = width / height.

		foreach ( $image->sizes as $size_label => $size_values ) {
			if ( $size_values['width'] <= $size_array[0] ) {
				$ratio = $size_values['width'] / $size_values['height'];
				if ( round( $ratio, 1 ) === round( $required_ratio, 1 ) || round( $ratio, 2 ) === round( $required_ratio, 2 ) || round( $ratio, 3 ) === round( $required_ratio, 3 ) ) {
					$sources[] = $image->src( $size_label ) . ' ' . $size_values['width'] . 'w';
				}
			}
		}

		if ( isset( $downsize ) && ! $downsize[3] ) {
			$sources[] = $downsize[0] . ' ' . $downsize[1] . 'w';
		}

		$sources = array_reverse( $sources );
		$srcset  = implode( ', ', $sources );

		return 'srcset="' . $srcset . '"';
	}

	/**
	 * Return the image srcset width height and alt.
	 *
	 * @param \Timber\Image $image timber object images.
	 * @param string        $size one of the declared image sizes.
	 *
	 * @return string
	 */
	public function generate_image_attributes( $image, $size ) {

		if ( ! $image || is_bool( $image ) ) {
			return '';
		}

		$srcset = $this->generate_image_srcset( $image, $size );

		if ( isset( $image->sizes[ $size ] ) ) {
			$width  = $image->sizes[ $size ]['width'];
			$height = $image->sizes[ $size ]['height'];
		} else {
			$downsize = image_downsize( $image->ID, $size );
			if ( $downsize ) {
				$width  = $downsize[1];
				$height = $downsize[2];
			}
		}

		$alt = 'alt="' . $image->alt() . '"';

		$return = $srcset . ' ' . $alt;

		if ( isset( $width ) && isset( $height ) &&
			! ( property_exists( $image, 'post_mime_type' ) && 'image/svg+xml' === $image->post_mime_type ) ) {
			$return .= ' width="' . $width . '" height="' . $height . '"';
		}

		return $return;
	}

	/**
	 * Call this function before creating new Timber_Post, Timber_Term, Timber_User.
	 */
	private function before_timber_object_creation() {
		$this->depth++;

		if ( $this->depth >= $this->post_fields_max_depth ) { // disable filters that add fields.
			remove_action( 'timber_post_get_meta', array( $this, 'add_fields_to_post' ), 10 );
			remove_filter( 'timber_user_get_meta', array( $this, 'add_fields_to_user' ), 10 );
			remove_filter( 'timber_term_get_meta', array( $this, 'add_fields_to_term' ), 10 );
		}
	}

	/**
	 * Call this function after creating new Timber_Post, Timber_Term, Timber_User.
	 */
	private function after_tiber_object_creation() {
		if ( $this->depth >= $this->post_fields_max_depth ) { // re-enable filters that add fields.
			add_action( 'timber_post_get_meta', array( $this, 'add_fields_to_post' ), 10, 3 );
			add_filter( 'timber_user_get_meta', array( $this, 'add_fields_to_user' ), 10, 3 );
			add_filter( 'timber_term_get_meta', array( $this, 'add_fields_to_term' ), 10, 3 );
		}

		$this->depth--;
	}
}

add_action( 'init', 'ati_initialize_integration', 20 );

function ati_initialize_integration() {
	$ati_object_class = apply_filters( 'ati_object_class', 'ACF_Timber_Integration' );
	new $ati_object_class();
}
