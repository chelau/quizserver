<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after
 *
 * @package Timber Lite
 * @since Timber 1.0
 */

if ( ! defined( 'ABSPATH' ) ){
	exit; // Exit if accessed directly
}

global $timber_show_footer;

if ( $timber_show_footer ) {
	get_template_part( 'footer-single' );
}

?>

</div><!-- #djaxContainer -->
</div><!-- #page -->

<div class="navigation-overlay  js-navigation-overlay"></div>

<div class="fullview">
    <div class="rsArrow rsArrowLeft">
        <div class="rsArrowIcn"></div>
    </div>
    <div class="rsArrow rsArrowRight">
        <div class="rsArrowIcn"></div>
    </div>
    <div class="fullview__close"></div>
</div>

<script>
     var loaderRandomImages = <?php timber_lite_the_random_projects_images_srcs(); ?>;
</script>

<?php wp_footer();?>
</body>
</html>
