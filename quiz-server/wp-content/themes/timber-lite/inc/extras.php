<?php
/**
 * Custom functions that act independently of the theme templates
 *
 * Eventually, some of the functionality here could be replaced by core features
 *
 * @package Timber Lite
 * @since Timber 1.0
 */

/**
 * Returns the proper post id in case WPML is active and a the post has a translation
 *
 * @param $id
 * @param string $post_type
 *
 * @return int The id of the post
 */
function timber_lite_get_post_id( $id = null, $post_type = 'post' ) {
	global $post;

	if ( $id === null ) {
		$id = get_the_ID();
	}

	if ( function_exists( 'icl_object_id' ) ) {
		// make this work for any post type
		if ( isset( $post->post_type ) && $post->post_type !== $post_type ) {
			$post_type = $post->post_type;
		}

		return icl_object_id( $id, $post_type, true );
	} else {
		return $id;
	}
}

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 *
 * @return array
 */
function timber_lite_body_classes( $classes ) {
	// Adds a class of group-blog to blogs with more than 1 published author.
	if ( is_multi_author() ) {
		$classes[] = 'group-blog';
	}

	// let the body_class know what project layout we have and what height has the page slider
	if ( is_singular() && false !== get_post_type() ) {


		if ( post_password_required() ) {
			$classes[] = 'password-required';
		}

		// add classes for a project layout
		if ( timber_lite_post_is_project() ) {
			$project_layout = 'filmstrip';

			if ( empty( $project_layout ) && is_page() ) {
				$homepage_project = get_post_meta( timber_lite_get_post_id(), 'homepage_project', true );
				$project_layout   = get_post_meta( $homepage_project, 'project_template', true );
			}
			$classes[] = 'project_layout-' . $project_layout;

			$classes[] = 'single';
			$classes[] = 'single-jetpack-portfolio';
		} elseif ( is_page() ) {
			// add classes for a custom portfolio page
			// get_page_template() will trigger a notice if is called on a non-page template, so check this out first
			$this_template = basename( get_page_template() );

			// also see if the page has a featured-image
			if ( has_post_thumbnail() ) {
				$classes[] = 'page-has-featured-image';
			} else {
				$classes[] = 'page-no-featured-image';
			}

			if ( 'custom-portfolio-page.php' === $this_template ) {
				$custom_portfolio_page_type = get_post_meta( timber_lite_get_post_id(), 'custom_portfolio_page_type', true );

				if ( timber_lite_has_featured_projects() ) {
					$projects_slider_height = 'default';
				}

				if ( ! empty( $projects_slider_height ) ) {
					$classes[] = 'slider_height-' . $projects_slider_height;
				}

				if ( ! empty( $custom_portfolio_page_type ) ) {
					$classes[] = 'portfolio_page_type-' . $custom_portfolio_page_type;
				}
			}
		}
	} elseif ( is_category() || is_tag() ) {
		$classes[] = 'blog'; //blog archives are blog also :)
	}

	return $classes;
}
add_filter( 'body_class', 'timber_lite_body_classes' );

/**
 * Extend the default WordPress post classes.
 *
 * @since Timber 1.0
 *
 * @param array $classes A list of existing post class values.
 *
 * @return array The filtered post class list.
 */
function timber_lite_post_classes( $classes ) {

	//add classes for portfolio
	if ( 'jetpack-portfolio' == get_post_type( get_the_ID() ) ) {
		$custom_portfolio_page_type = '';
		//test to see if we are on a page with the Custom Portfolio Template and the Single project option
		if ( is_page() ) {
			$this_template = basename( get_page_template_slug( get_queried_object_id() ) );
			if ( 'custom-portfolio-page.php' === $this_template ) {
				$custom_portfolio_page_type = get_post_meta( get_queried_object_id(), 'custom_portfolio_page_type', true );
			}
		}

		if ( is_single() || 'project' === $custom_portfolio_page_type ) {
			$project_template = get_post_meta( timber_lite_get_post_id(), 'project_template', true );
			//this is the default layout - just in case something went wrong and the defaults didn't kick in
			if ( empty( $project_template ) ) {
				$project_template = 'filmstrip';
			}

			if ( 'filmstrip' == $project_template || 'thumbnails' == $project_template ) {
				$classes[] = 'portfolio  js-portfolio  js-portfolio--' . $project_template . '  entry-content';
			} else {
				$classes[] = 'portfolio  entry-content';
			}
		} else {
			//this is a project displayed in some sort of archive
			$classes[] = 'portfolio  portfolio--grid  portfolio--project  portfolio--visible  js-portfolio';
		}
	}

	return $classes;
}
add_filter( 'post_class', 'timber_lite_post_classes' );

if ( ! function_exists( 'timber_lite_comment' ) ) :
	/**
	 * Display individual comment layout
	 *
	 * @since Timber 1.0
	 */
	function timber_lite_comment( $comment, $args, $depth ) {
		static $comment_number;

		if ( ! isset( $comment_number ) ) {
			$comment_number = $args['per_page'] * ( $args['page'] - 1 ) + 1;
		} else {
			$comment_number ++;
		}
		?>
		<li <?php comment_class(); ?>>
		<article id="comment-<?php comment_ID() ?>" class="comment-article  media">
			<span class="comment-number"><?php echo esc_html( $comment_number ); ?></span>
			<?php
			//grab the avatar - by default the Mystery Man
			$avatar = get_avatar( $comment, 60, '', '', array( 'extra_attr' => '' ) ); ?>

			<aside class="comment__avatar  media__img"><?php echo $avatar; ?></aside>

			<div class="media__body">
				<header class="comment__meta comment-author">
					<?php printf( '<span class="comment__author-name">%s</span>', get_comment_author_link() ) ?>
					<time class="comment__time" datetime="<?php comment_time( 'c' ); ?>">
						<a href="<?php echo esc_url( get_comment_link( get_comment_ID() ) ) ?>"
						   class="comment__timestamp"><?php
                            /* translators: 1: comment date, 2: comment time. */
							printf( esc_html__( 'on %1$s, at %2$s,', 'timber-lite' ), get_comment_date(), get_comment_time() ); ?></a>
					</time>
					<div class="comment__links">
						<?php
						//we need some space before Edit
						edit_comment_link( esc_html__( 'Edit', 'timber-lite' ), '  ' );

						comment_reply_link( array_merge( $args, array(
							'depth'     => $depth,
							'max_depth' => $args['max_depth']
						) ) );
						?>
					</div>
				</header>
				<!-- .comment-meta -->
				<?php if ( $comment->comment_approved == '0' ) : ?>
					<div class="alert info">
						<p><?php esc_html_e( 'Your comment is awaiting moderation.', 'timber-lite' ) ?></p>
					</div>
				<?php endif; ?>
				<section class="comment__content comment">
					<?php comment_text() ?>
				</section>
			</div>
		</article>
		<!-- </li> is added by WordPress automatically -->
		<?php
	} // don't remove this bracket!

endif;

/**
 * Filter the default editor content for projects when creating a new project
 *
 * @param string
 *
 * @return string
 */
function timber_lite_project_editor_content( $content, $post ) {
	if ( 'jetpack-portfolio' == $post->post_type ) {
		$content = "[gallery columns='6']";
	}

	return $content;
}
add_filter( 'default_content', 'timber_lite_project_editor_content', 10, 3 );

if ( ! function_exists( 'timber_lite_get_featured_projects' ) ) {
	function timber_lite_get_featured_projects() {

		$featured_projects     = array();
		$featured_projects_ids = get_post_meta( timber_lite_get_post_id(), 'portfolio_featured_projects', true );
		// turn from string to array
		$featured_projects_ids = explode( ',', $featured_projects_ids );

		if ( ! empty( $featured_projects_ids ) ) {
			$query_args        = array(
				'post_type'      => 'jetpack-portfolio',
				'post__in'       => $featured_projects_ids, // pass array of ids into `include` parameter
				'orderby'        => 'post__in',
				'posts_per_page' => - 1, //get all featured projects
			);
			$featured_projects = get_posts( $query_args );
		}

		return $featured_projects;
	}
}

if ( ! function_exists( 'timber_lite_has_featured_projects' ) ) {
	function timber_lite_has_featured_projects() {
		$featured_projects_ids = get_post_meta( timber_lite_get_post_id(), 'portfolio_featured_projects', true );

		if ( ! empty( $featured_projects_ids ) ) {
			return true;
		}

		return false;
	}
}

/**
 * Filter comment_form_defaults to remove the notes after the comment form textarea.
 *
 * @since Timber 1.0
 *
 * @param array $defaults
 *
 * @return array
 */
function timber_lite_comment_form_remove_notes_after( $defaults ) {
	$defaults['comment_notes_after'] = '';

	return $defaults;
}
add_filter( 'comment_form_defaults', 'timber_lite_comment_form_remove_notes_after' );

/**
 * Filter wp_link_pages to wrap current page in span.
 *
 * @since Timber 1.0
 *
 * @param string $link
 *
 * @return string
 */
function timber_lite_link_pages( $link ) {
	if ( is_numeric( $link ) ) {
		return '<span class="current">' . $link . '</span>';
	}

	return $link;
}
add_filter( 'wp_link_pages_link', 'timber_lite_link_pages' );

/**
 * Wrap more link
 */
function timber_lite_read_more_link( $link ) {
	return '<div class="more-link-wrapper">' . $link . '</div>';
}
add_filter( 'the_content_more_link', 'timber_lite_read_more_link' );

/**
 * Constrain the excerpt length to 35 words - about a medium sized excerpt
 */
function timber_lite_excerpt_length( $length ) {
	return 35;
}
add_filter( 'excerpt_length', 'timber_lite_excerpt_length', 999 );

function timber_lite_remove_shortcode_from_excerpt( $content ) {
	$content = strip_shortcodes( $content );

	return $content;//always return $content
}
add_filter( 'get_the_excerpt', 'timber_lite_remove_shortcode_from_excerpt' );

/**
 * When dealing with gallery post format, we need to strip the first gallery in the content since we show it at the top
 */
function timber_lite_strip_first_content_gallery( $content ) {
	if ( 'gallery' == get_post_format() ) {
		$regex   = '/\[gallery.*]/';
		$content = preg_replace( $regex, '', $content, 1 );
	}

	return $content;
}
add_filter( 'the_content', 'timber_lite_strip_first_content_gallery' );

/**
 * This function was borrowed from CakePHP and adapted.
 * https://github.com/cakephp/cakephp/blob/53fdb18655119d4cca966d769b6c33f8eaaa8da0/src/Utility/Text.php
 *
 * Bellow is the copyright notice:
 *
 * ========================
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 *
 * ========================
 *
 * Truncates text.
 *
 * Cuts a string to the length of $length and replaces the last characters
 * with the ellipsis if the text is longer than length.
 *
 * ### Options:
 *
 * - `ellipsis` Will be used as ending and appended to the trimmed string
 * - `exact` If false, $text will not be cut mid-word
 * - `html` If true, HTML tags would be handled correctly
 *
 * @param string $text String to truncate.
 * @param int $length Length of returned string, including ellipsis.
 * @param array $options An array of HTML attributes and options.
 *
 * @return string Trimmed string.
 * @link http://book.cakephp.org/3.0/en/core-libraries/string.html#truncating-text
 */
function timber_lite_truncate( $text, $length = 100, $options = array() ) {
	$default = array(
		'ellipsis' => apply_filters( 'excerpt_more', '[&#8230;]' ),
		'exact'    => false,
		'html'     => false,
	);

	if ( ! empty( $options['html'] ) && strtolower( mb_internal_encoding() ) === 'utf-8' ) {
		$default['ellipsis'] = "\xe2\x80\xa6";
	}
	$options = array_merge( $default, $options );
	extract( $options );

	if ( true === $html ) {
		if ( mb_strlen( preg_replace( '/<.*?>/', '', $text ) ) <= $length ) {
			return $text;
		}
		$totalLength = mb_strlen( strip_tags( $ellipsis ) );
		$openTags    = array();
		$truncate    = '';
		preg_match_all( '/(<\/?([\w+]+)[^>]*>)?([^<>]*)/', $text, $tags, PREG_SET_ORDER );
		foreach ( $tags as $tag ) {
			if ( ! preg_match( '/img|br|input|hr|area|base|basefont|col|frame|isindex|link|meta|param/s', $tag[2] ) ) {
				if ( preg_match( '/<[\w]+[^>]*>/s', $tag[0] ) ) {
					array_unshift( $openTags, $tag[2] );
				} elseif ( preg_match( '/<\/([\w]+)[^>]*>/s', $tag[0], $closeTag ) ) {
					$pos = array_search( $closeTag[1], $openTags );
					if ( false !== $pos ) {
						array_splice( $openTags, $pos, 1 );
					}
				}
			}
			$truncate .= $tag[1];
			$contentLength = mb_strlen( preg_replace( '/&[0-9a-z]{2,8};|&#[0-9]{1,7};|&#x[0-9a-f]{1,6};/i', ' ', $tag[3] ) );
			if ( $contentLength + $totalLength > $length ) {
				$left           = $length - $totalLength;
				$entitiesLength = 0;
				if ( preg_match_all( '/&[0-9a-z]{2,8};|&#[0-9]{1,7};|&#x[0-9a-f]{1,6};/i', $tag[3], $entities, PREG_OFFSET_CAPTURE ) ) {
					foreach ( $entities[0] as $entity ) {
						if ( $entity[1] + 1 - $entitiesLength <= $left ) {
							$left --;
							$entitiesLength += mb_strlen( $entity[0] );
						} else {
							break;
						}
					}
				}
				$truncate .= mb_substr( $tag[3], 0, $left + $entitiesLength );
				break;
			} else {
				$truncate .= $tag[3];
				$totalLength += $contentLength;
			}
			if ( $totalLength >= $length ) {
				break;
			}
		}
	} else {
		if ( mb_strlen( $text ) <= $length ) {
			return $text;
		}
		$truncate = mb_substr( $text, 0, $length - mb_strlen( $ellipsis ) );
	}
	if ( false === $exact ) {
		$spacepos = mb_strrpos( $truncate, ' ' );
		if ( true === $html ) {
			$truncateCheck = mb_substr( $truncate, 0, $spacepos );
			$lastOpenTag   = mb_strrpos( $truncateCheck, '<' );
			$lastCloseTag  = mb_strrpos( $truncateCheck, '>' );
			if ( $lastOpenTag > $lastCloseTag ) {
				preg_match_all( '/<[\w]+[^>]*>/s', $truncate, $lastTagMatches );
				$lastTag  = array_pop( $lastTagMatches[0] );
				$spacepos = mb_strrpos( $truncate, $lastTag ) + mb_strlen( $lastTag );
			}
			$bits = mb_substr( $truncate, $spacepos );
			preg_match_all( '/<\/([a-z]+)>/', $bits, $droppedTags, PREG_SET_ORDER );
			if ( ! empty( $droppedTags ) ) {
				if ( ! empty( $openTags ) ) {
					foreach ( $droppedTags as $closingTag ) {
						if ( ! in_array( $closingTag[1], $openTags ) ) {
							array_unshift( $openTags, $closingTag[1] );
						}
					}
				} else {
					foreach ( $droppedTags as $closingTag ) {
						$openTags[] = $closingTag[1];
					}
				}
			}
		}
		$truncate = mb_substr( $truncate, 0, $spacepos );
		// If truncate still empty, then we don't need to count ellipsis in the cut.
		if ( 0 === mb_strlen( $truncate ) ) {
			$truncate = mb_substr( $text, 0, $length );
		}
	}
	$truncate .= $ellipsis;
	if ( true === $html ) {
		foreach ( $openTags as $tag ) {
			$truncate .= '</' . $tag . '>';
		}
	}

	return $truncate;
}

function timber_lite_allow_skype_protocol( $protocols ) {
	$protocols[] = 'skype';

	return $protocols;
}
add_filter( 'kses_allowed_protocols', 'timber_lite_allow_skype_protocol' );

function timber_lite_get_img_alt( $attachment_ID ) {
	$img_alt = trim( strip_tags( get_post_meta( $attachment_ID, '_wp_attachment_image_alt', true ) ) );

	return $img_alt;
}

function timber_lite_get_img_caption( $attachment_ID ) {
	$attachment  = get_post( $attachment_ID );
	$img_caption = '';
	if ( isset( $attachment->post_excerpt ) ) {
		$img_caption = trim( strip_tags( $attachment->post_excerpt ) );
	}

	return $img_caption;
}

function timber_lite_get_img_description( $attachment_ID ) {
	$attachment      = get_post( $attachment_ID );
	$img_description = '';
	if ( isset( $attachment->post_content ) ) {
		$img_description = trim( strip_tags( $attachment->post_content ) );
	}

	return $img_description;
}

function timber_lite_get_img_exif( $attachment_ID ) {
	$meta_data = wp_get_attachment_metadata( $attachment_ID );

	if ( isset( $meta_data['image_meta'] ) ) {
		$exif = array();

		if ( ! empty( $meta_data['image_meta']['camera'] ) ) {
			$exif['camera'] = $meta_data['image_meta']['camera'];
		}

		if ( ! empty( $meta_data['image_meta']['aperture'] ) ) {
			$exif['aperture'] = '&#402;/' . $meta_data['image_meta']['aperture'];
		}

		if ( ! empty( $meta_data['image_meta']['focal_length'] ) ) {
			$exif['focal'] = $meta_data['image_meta']['focal_length'] . 'mm';
		}

		if ( ! empty( $meta_data['image_meta']['shutter_speed'] ) ) {
			$exif['exposure'] = timber_lite_convert_exposure_to_frac( $meta_data['image_meta']['shutter_speed'] );
		}

		if ( ! empty( $meta_data['image_meta']['iso'] ) ) {
			$exif['iso'] = $meta_data['image_meta']['iso'];
		}

		return json_encode( $exif );
	}

	return '';
}

/**
 * conversion from decimal to fraction inspired by http://enliteart.com/blog/2008/08/30/quick-shutter-speed-fix-for-wordpress-exif/
 * this is the reverse of what WordPress does to raw EXIF data - quite dumb but that's life
 *
 * @param float $shutter_speed
 *
 * @return string
 */
function timber_lite_convert_exposure_to_frac( $shutter_speed ) {
	$frac = '';

	if ( ( 1 / $shutter_speed ) > 1 ) {
		$frac .= "1/";
		if ( ( number_format( ( 1 / $shutter_speed ), 1 ) ) == 1.3
		     or number_format( ( 1 / $shutter_speed ), 1 ) == 1.5
		     or number_format( ( 1 / $shutter_speed ), 1 ) == 1.6
		     or number_format( ( 1 / $shutter_speed ), 1 ) == 2.5
		) {
			$frac .= number_format( ( 1 / $shutter_speed ), 1, '.', '' );
		} else {
			$frac .= number_format( ( 1 / $shutter_speed ), 0, '.', '' );
		}
	} else {
		$frac .= $shutter_speed;
	}

	return $frac;
}

/**
 * Tries to convert an attachment URL into a post ID.
 * This is a modified version of the one from core to account for resized urls - thumbnails
 *
 * @global wpdb $wpdb WordPress database abstraction object.
 *
 * @param string $url The URL to resolve.
 *
 * @return int The found post ID, or 0 on failure.
 */
function timber_lite_attachment_url_to_postid( $url ) {
	global $wpdb;

	$dir  = wp_upload_dir();
	$path = $url;

	if ( 0 === strpos( $path, $dir['baseurl'] . '/' ) ) {
		$path = substr( $path, strlen( $dir['baseurl'] . '/' ) );
	}

	$path = preg_replace( '/-[0-9]{1,4}x[0-9]{1,4}\.(jpg|jpeg|png|gif|bmp)$/i', '.$1', $path );

	$sql     = $wpdb->prepare(
		"SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_wp_attached_file' AND meta_value = %s",
		$path
	);
	$post_id = $wpdb->get_var( $sql );

	/**
	 * Filter an attachment id found by URL.
	 *
	 * @since 4.2.0
	 *
	 * @param int|null $post_id The post_id (if any) found by the function.
	 * @param string $url The URL being looked up.
	 */
	$post_id = apply_filters( 'attachment_url_to_postid', $post_id, $url );

	return (int) $post_id;
}

/**
 * Replace the submit input with button because the <input> tag doesn't allow CSS styling with ::before or ::after
 */
function timber_lite_search_form( $form ) {
	$form = '<form role="search" method="get" class="search-form" action="' . esc_url( home_url( '/' ) ) . '">
				<label>
					<span class="screen-reader-text">' . esc_html_x( 'Search for:', 'label', 'timber-lite' ) . '</span>
					<input type="search" class="search-field" placeholder="' . esc_attr_x( 'Search &hellip;', 'placeholder', 'timber-lite' ) . '" value="' . get_search_query() . '" name="s" title="' . esc_attr_x( 'Search for:', 'label', 'timber-lite' ) . '" />
				</label>
				<button class="search-submit"><i class="icon  icon-search"></i></button>
			</form>';

	return $form;
}
add_filter( 'get_search_form', 'timber_lite_search_form' );

/**
 * Add "Styles" drop-down
 */
add_filter( 'mce_buttons_2', 'timber_lite_mce_editor_buttons' );
function timber_lite_mce_editor_buttons( $buttons ) {
	array_unshift( $buttons, 'styleselect' );

	return $buttons;
}

/**
 * Add styles/classes to the "Styles" drop-down
 */
add_filter( 'tiny_mce_before_init', 'timber_lite_mce_before_init' );
function timber_lite_mce_before_init( $settings ) {

	$style_formats = array(
		array( 'title' => esc_html__( 'Intro Text', 'timber-lite' ), 'selector' => 'p', 'classes' => 'intro' ),
		array( 'title' => esc_html__( 'Dropcap', 'timber-lite' ), 'inline' => 'span', 'classes' => 'dropcap' ),
		array( 'title' => esc_html__( 'Highlight', 'timber-lite' ), 'inline' => 'span', 'classes' => 'highlight' ),
		array(
			'title'   => esc_html__( 'Two Columns', 'timber-lite' ),
			'block'   => 'div',
			'classes' => 'twocolumn',
			'wrapper' => true
		),
		array( 'title' => esc_html__( 'Caption', 'timber-lite' ), 'selector' => 'p', 'classes' => 'caption' ),
		array( 'title' => esc_html__( 'Small Caption', 'timber-lite' ), 'selector' => 'p', 'classes' => 'caption caption--small' )
	);

	$settings['style_formats'] = json_encode( $style_formats );

	return $settings;
}

/*
 * Ajax loading posts
 */
add_action( 'wp_ajax_timber_load_next_posts', 'timber_lite_load_next_posts' );
add_action( 'wp_ajax_nopriv_timber_load_next_posts', 'timber_lite_load_next_posts' );
function timber_lite_load_next_posts() {
	global $post;

	if ( ! wp_verify_nonce( $_REQUEST['nonce'], 'timber_ajax' ) ) {
		wp_send_json_error();
	}

	//set the query args
	$args        = array( 'post_type' => 'post', 'suppress_filters' => false );
	$count_posts = wp_count_posts();
	$count_posts = $count_posts->publish;

	if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
		$args['lang'] = ICL_LANGUAGE_CODE;
	}

	//check if we have a post_type in $_POST
	if ( isset( $_POST['post_type'] ) ) {
		$args['post_type'] = $_POST['post_type'];
	}

	if ( isset( $_REQUEST['posts_number'] ) && 'all' == $_REQUEST['posts_number'] ) {
		$args['posts_per_page'] = $count_posts;
	} else {
		$args['posts_per_page'] = get_option( 'posts_per_page' );
	}

	if ( isset( $_REQUEST['taxonomy'] ) ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => $_REQUEST['taxonomy'],
				'field'    => 'term_id',
				'terms'    => array( $_REQUEST['term_id'] ),
			),
		);
	} elseif ( isset( $_REQUEST['search'] ) ) {
		$args['s'] = $_REQUEST['search'];
	}

	//check if we have a offset in $_POST
	if ( isset( $_POST['offset'] ) ) {
		$args['offset'] = (int) $_POST['offset'];

		// the offset argument doesn't work if 'post_per_page' is -1.
		// in this case we get the total number of posts and get only the difference from the offset
		if ( 'all' == $_REQUEST['posts_number'] ) {
			$args['posts_per_page'] = (int) $count_posts - (int) $_POST['offset'];
		}
	}

	$posts = get_posts( $args );
	if ( ! empty( $posts ) ) {
		ob_start();

		foreach ( $posts as $post ) : setup_postdata( $post );
			$template_path = 'template-parts/content';
			$template_slug = get_post_format();

			get_template_part( $template_path, $template_slug );
		endforeach;

		/* Restore original Post Data */
		wp_reset_postdata();

		wp_send_json_success( array(
			'posts' => ob_get_clean(),
		) );
	} else {
		wp_send_json_error();
	}
}

/*
 * Ajax loading projects
 */
add_action( 'wp_ajax_timber_load_next_projects', 'timber_lite_load_next_projects' );
add_action( 'wp_ajax_nopriv_timber_load_next_projects', 'timber_lite_load_next_projects' );
function timber_lite_load_next_projects() {
	global $post;

	if ( ! wp_verify_nonce( $_REQUEST['nonce'], 'timber_ajax' ) ) {
		wp_send_json_error();
	}

	//set the query args
	$args = array( 'post_type' => 'jetpack-portfolio', 'suppress_filters' => false );

	$count_projects = wp_count_posts( 'jetpack-portfolio' );
	$count_projects = $count_projects->publish;

	if ( defined( 'ICL_LANGUAGE_CODE' ) ) {
		$args['lang'] = ICL_LANGUAGE_CODE;
	}

	if ( isset( $_REQUEST['posts_number'] ) && 'all' == $_REQUEST['posts_number'] ) {
		$args['posts_per_page'] = $count_projects;
	} else {
		$args['posts_per_page'] = get_option( 'jetpack_portfolio_posts_per_page', '7' );
	}

	if ( isset( $_REQUEST['taxonomy'] ) ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => $_REQUEST['taxonomy'],
				'field'    => 'term_id',
				'terms'    => array( $_REQUEST['term_id'] ),
			),
		);
	}

	//check if we have a offset in $_REQUEST
	if ( isset( $_REQUEST['offset'] ) ) {
		$args['offset'] = (int) $_REQUEST['offset'];

		if ( 'all' == $_REQUEST['posts_number'] ) {
			$args['posts_per_page'] = (int) $count_projects - (int) $_POST['offset'];
		}
	}

	$posts = get_posts( $args );
	if ( ! empty( $posts ) ) {
		ob_start();

		foreach ( $posts as $post ) : setup_postdata( $post );
			get_template_part( 'template-parts/content', 'portfolio' );
		endforeach;

		/* Restore original Post Data */
		wp_reset_postdata();

		wp_send_json_success( array(
			'posts' => ob_get_clean(),
		) );
	} else {
		wp_send_json_error();
	}
}

function timber_lite_callback_the_password_form( $form ) {
	global $post;
	$post      = get_post( $post );
	$post_type = get_post_type( $post );
	$postID    = timber_lite_get_post_id( $post->ID, $post_type );
	$label     = 'pwbox-' . ( empty( $postID ) ? rand() : $postID );

	global $timber_private_post;

	ob_start(); ?>
	<div class="site-container  site-content">
		<div class="content--client-area">
			<div class="form-container">
				<div class="lock-icon"></div>
				<div class="protected-area-text">
					<?php
					esc_html_e( 'This is a protected area.', 'timber-lite' );

					if ( $timber_private_post['error'] ) {
						echo $timber_private_post['error']; ?>
						<span class="gray"><?php esc_html_e( 'Please enter your password again.', 'timber-lite' ); ?></span>
					<?php } else { ?>
						<span class="gray"><?php esc_html_e( 'Please enter your password to continue.', 'timber-lite' ); ?></span>
					<?php } ?>

				</div>
				<form class="auth-form" method="post"
				      action="<?php echo wp_login_url() . '?action=postpass'; // just keep this action path ... WordPress will refear for us
				      ?>">
					<?php wp_nonce_field( 'password_protection', 'submit_password_nonce' ); ?>
					<input type="hidden" name="submit_password" value="1"/>
					<input type="password" name="post_password" id="auth_password" class="auth__pass"
					       placeholder="<?php esc_html_e( "Password", 'timber-lite' ) ?>"/>
					<input type="submit" name="Submit" id="auth_submit" class="auth__submit"
					       value="<?php esc_html_e( "Authenticate", 'timber-lite' ) ?>"/>
				</form>
			</div>
		</div><!-- .content -->
	</div>
	<?php
	$form = ob_get_clean();
	// on form submit put a wrong passwordp msg.
	if ( get_permalink() != wp_get_referer() ) {
		return $form;
	}

	// No cookie, the user has not sent anything until now.
	if ( ! isset ( $_COOKIE[ 'wp-postpass_' . COOKIEHASH ] ) ) {
		return $form;
	}

	require_once ABSPATH . 'wp-includes/class-phpass.php';
	$hasher = new PasswordHash( 8, true );

	$hash = wp_unslash( $_COOKIE[ 'wp-postpass_' . COOKIEHASH ] );
	if ( 0 !== strpos( $hash, '$P$B' ) ) {
		return $form;
	}

	return $form;
}
add_action( 'the_password_form', 'timber_lite_callback_the_password_form' );

function timber_lite_prepare_password_for_custom_post_types() {

	global $timber_private_post;

	$timber_private_post = timber_lite_is_password_protected();

}
add_action( 'wp', 'timber_lite_prepare_password_for_custom_post_types' );

function timber_lite_is_password_protected() {
	global $post;
	$private_post = array( 'allowed' => false, 'error' => '' );

	if ( isset( $_POST['submit_password'] ) ) { // when we have a submision check the password and its submision
		if ( isset( $_POST['submit_password_nonce'] ) && wp_verify_nonce( $_POST['submit_password_nonce'], 'password_protection' ) ) {
			if ( isset ( $_POST['post_password'] ) && ! empty( $_POST['post_password'] ) ) { // some simple checks on password
				// finally test if the password submitted is correct
				if ( $post->post_password === $_POST['post_password'] ) {
					$private_post['allowed'] = true;

					// ok if we have a correct password we should inform WordPress too
					// otherwise the mad dog will put the password form again in the_content() and other filters
					global $wp_hasher;
					if ( empty( $wp_hasher ) ) {
						require_once( ABSPATH . 'wp-includes/class-phpass.php' );
						$wp_hasher = new PasswordHash( 8, true );
					}
					setcookie( 'wp-postpass_' . COOKIEHASH, $wp_hasher->HashPassword( stripslashes( $_POST['post_password'] ) ), 0, COOKIEPATH );

				} else {
					$private_post['error'] = '<h3 class="text--error">' . esc_html__( 'Wrong Password', 'timber-lite' ) . '</h3>';
				}
			}
		}
	}

	if ( isset( $_COOKIE[ 'wp-postpass_' . COOKIEHASH ] ) && get_permalink() == wp_get_referer() ) {
		$private_post['error'] = '<h3 class="text--error">' . esc_html__( 'Wrong Password', 'timber-lite' ) . '</h3>';
	}


	return $private_post;
}

/**
 * Fix skip link focus in IE11.
 *
 * This does not enqueue the script because it is tiny and because it is only for IE11,
 * thus it does not warrant having an entire dedicated blocking script being loaded.
 *
 * @link https://git.io/vWdr2
 */
function timber_lite_skip_link_focus_fix() {
	// The following is minified via `terser --compress --mangle -- js/skip-link-focus-fix.js`.
	?>
    <script>
		/(trident|msie)/i.test(navigator.userAgent)&&document.getElementById&&window.addEventListener&&window.addEventListener("hashchange",function(){var t,e=location.hash.substring(1);/^[A-z0-9_-]+$/.test(e)&&(t=document.getElementById(e))&&(/^(?:a|select|input|button|textarea)$/i.test(t.tagName)||(t.tabIndex=-1),t.focus())},!1);
    </script>
	<?php
}
add_action( 'wp_print_footer_scripts', 'timber_lite_skip_link_focus_fix' );
