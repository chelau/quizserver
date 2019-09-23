/* --- Royal Slider Init --- */

function royalSliderInit($container) {
	$container = typeof $container !== 'undefined' ? $container : $('body');

	// Find and initialize each slider
	$container.find('.js-pixslider').each(function () {

		sliderInit($(this));

		var slider = $(this).data('royalSlider');

		if (!slider.slides.length) {
			return;
		}

		var firstSlide 			= slider.slides[0],
			firstSlideContent 	= $(firstSlide.content),
			$video 				= firstSlideContent.hasClass('video') ? firstSlideContent : firstSlideContent.find('.video'),
			firstSlideAutoPlay 	= typeof $video.data('video_autoplay') !== "undefined";

		if ( firstSlideAutoPlay || ieMobile || iOS || android ) {
			firstSlide.holder.on('rsAfterContentSet', function () {
				slider.playVideo();
			});
		}

		slider.ev.on('rsBeforeAnimStart', function(event) {
			slider.stopVideo();
		});

		// auto play video sliders if is set so
		slider.ev.on('rsAfterSlideChange', function(event) {

			var $slide_content 		= $(slider.currSlide.content),
				$video 				= $slide_content.hasClass('video') ? $slide_content : $slide_content.find('.video'),
				rs_videoAutoPlay 	= typeof $video.data('video_autoplay') !== "undefined";

			if ( rs_videoAutoPlay || ieMobile || iOS || android ) {
				slider.stopVideo();
				slider.playVideo();
			}

		});

		// after destroying a video remove the autoplay class (this way the image gets visible)
		slider.ev.on('rsOnDestroyVideoElement', function(i ,el){

			var $slide_content 		= $( this.currSlide.content),
				$video 				= $slide_content.hasClass('video') ? $slide_content : $slide_content.find('.video');

			$video.removeClass('video_autoplay');

		});

	});

}

/*
 * Slider Initialization
 */
function sliderInit($slider) {
	// Helper function
	// examples
	// console.log(padLeft(23,5));       //=> '00023'
	// console.log(padLeft(23,5,'>>'));  //=> '>>>>>>23'
	function padLeft(nr, n, str){
		return Array(n-String(nr).length+1).join(str||'0')+nr;
	}

	if (globalDebug) {
		console.log("Royal Slider Init");
	}

	$slider.find('img').removeClass('invisible');

	var $children                   = $(this).children(),
		rs_arrows                   = typeof $slider.data('arrows') !== "undefined",
		rs_bullets                  = typeof $slider.data('bullets') !== "undefined" ? "bullets" : "none",
		rs_autoheight               = typeof $slider.data('autoheight') !== "undefined",
		rs_autoScaleSlider          = false,
		rs_autoScaleSliderWidth     = typeof $slider.data('autoscalesliderwidth') !== "undefined" && $slider.data('autoscalesliderwidth') != '' ? $slider.data('autoscalesliderwidth') : false,
		rs_autoScaleSliderHeight    = typeof $slider.data('autoscalesliderheight') !== "undefined" && $slider.data('autoscalesliderheight') != '' ? $slider.data('autoscalesliderheight') : false,
		rs_customArrows             = typeof $slider.data('customarrows') !== "undefined",
		rs_slidesSpacing            = typeof $slider.data('slidesspacing') !== "undefined" ? parseInt($slider.data('slidesspacing')) : 0,
		rs_imageScale               = $slider.data('imagescale'),
		rs_keyboardNav				= typeof $slider.data('keyboardnav') !== "undefined",
		rs_visibleNearby            = typeof $slider.data('visiblenearby') !== "undefined",
		rs_nearbyCenter				= typeof $slider.data('nearbycenter') !== "undefined",
		rs_imageAlignCenter         = typeof $slider.data('imagealigncenter') !== "undefined",
		rs_transition               = typeof $slider.data('slidertransition') !== "undefined" && $slider.data('slidertransition') != '' ? $slider.data('slidertransition') : 'fade',
		rs_transitionSpeed          = typeof $slider.data('slidertransitionspeed') !== "undefined" && $slider.data('slidertransitionspeed') != '' ? $slider.data('slidertransitionspeed') : 600,
		rs_autoPlay                 = typeof $slider.data('sliderautoplay') !== "undefined",
		rs_delay                    = typeof $slider.data('sliderdelay') !== "undefined" && $slider.data('sliderdelay') != '' ? $slider.data('sliderdelay') : '1000',
		rs_drag                     = true,
		rs_globalCaption            = typeof $slider.data('showcaptions') !== "undefined",
		hoverArrows                 = typeof $slider.data('hoverarrows') !== "undefined";

	if (rs_autoheight) {
		rs_autoScaleSlider = false;
	} else {
		rs_autoScaleSlider = true;
	}

	// Single slide case
	if ($children.length == 1) {
		rs_arrows = false;
		rs_bullets = 'none';
		rs_keyboardNav = false;
		rs_drag = false;
		rs_transition = 'fade';
		rs_customArrows = false;
	}

	// make sure default arrows won't appear if customArrows is set
	if (rs_customArrows) rs_arrows = false;

	//the main params for Royal Slider
	var royalSliderParams = {
		autoHeight: rs_autoheight,
		autoScaleSlider: rs_autoScaleSlider,
		loop: true,
		autoScaleSliderWidth: rs_autoScaleSliderWidth,
		autoScaleSliderHeight: rs_autoScaleSliderHeight,
		imageScaleMode: rs_imageScale,
		imageAlignCenter: rs_imageAlignCenter,
		slidesSpacing: rs_slidesSpacing,
		arrowsNav: rs_arrows,
		controlNavigation: rs_bullets,
		keyboardNavEnabled: rs_keyboardNav,
		arrowsNavAutoHide: false,
		sliderDrag: rs_drag,
		transitionType: rs_transition,
		transitionSpeed: rs_transitionSpeed,
		imageScalePadding: 0,
		autoPlay: {
			enabled: rs_autoPlay,
			stopAtAction: true,
			pauseOnHover: true,
			delay: rs_delay
		},
		addActiveClass: true,
		globalCaption: rs_globalCaption,
		numImagesToPreload: 4
	};

	var rs_centerArea = rs_nearbyCenter == true ? 0.90 : 0.95;

	if (rs_visibleNearby) {
		royalSliderParams['visibleNearby'] = {
			enabled: rs_visibleNearby,
			centerArea: rs_centerArea,
			center: rs_nearbyCenter,
			breakpoint: 650,
			breakpointCenterArea: 0.64,
			navigateByCenterClick: true
		}
	}

	//lets fire it up
	$slider.royalSlider(royalSliderParams);

	var royalSlider = $slider.data('royalSlider' ),
		slidesNumber = royalSlider.numSlides;

	// create the markup for the customArrows
	// don't need it if we have only one slide
	if (royalSlider && slidesNumber > 1) {

		var $slides_total = $('.js-gallery-slides-total' ),
			$decimal = $('.js-decimal' ),
			$unit = $('.js-unit');

		//slidesNumber = (slidesNumber < 10) ? padLeft(slidesNumber, 2) : slidesNumber;
		$slides_total.html(slidesNumber);

		royalSlider.ev.on('rsBeforeAnimStart', function(event) {
			var currentSlide = royalSlider.currSlideId + 1;
			$unit.html(currentSlide);
		});
	}

	if (slidesNumber == 1) {
		$slider.addClass('single-slide');
	}

	$slider.addClass('slider--loaded');

	if($slider.hasClass('pixslider')) {
		var $arrows = $slider.find('.rsArrow');
		$arrows.appendTo($slider);

		var tl = new TimelineLite({delay: 0.5, paused: true});
		tl.to($slider, 0, {'overflow': 'visible'})
			.fromTo($arrows, 0.3, {opacity: 0}, {opacity: 1});
		tl.play();
	}
}