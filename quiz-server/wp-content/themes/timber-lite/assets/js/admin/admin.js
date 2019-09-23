(function ($) {
	"use strict";

	$( document ).ready( function() {

		var $page_template = $( '#page_template' );

		// Make page builder visible only when the page builde template is selected
		if ( $page_template.val() === 'page-templates/custom-portfolio-page.php' ) {
			$( '#postdivrich' ).hide();
		} else {
			$( '#postdivrich' ).show();
		}

		$page_template.on('change', function() {

			if ($page_template.val() === 'page-templates/custom-portfolio-page.php') {
				$('#postdivrich').hide();
			} else {
				$('#postdivrich').show();
				// tinyMce will be messed, a simple resize will do the job
				$(window).resize();
			}
		});
	} );
})(jQuery);