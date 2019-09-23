/* ====== HELPER FUNCTIONS ====== */


/**
 * Detect what platform are we on (browser, mobile, etc)
 */

function browserSupport() {
	$.support.touch = Modernizr.touchevents;
	$.support.svg = (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) ? true : false;
	$.support.transform = getSupportedTransform();

	$html
		.addClass($.support.touch ? 'touch' : 'no-touch')
		.addClass($.support.svg ? 'svg' : 'no-svg')
		.addClass(!!$.support.transform ? 'transform' : 'no-transform');
}

function browserSize() {
	windowHeight = $window.height();
	windowWidth = $window.width();
	documentHeight = $document.height();
	myOrientation = windowWidth > windowHeight ? 'portrait' : 'landscape';
}

function getSupportedTransform() {
	var prefixes = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
	for (var i = 0; i < prefixes.length; i++) {
		if (document.createElement('div').style[prefixes[i]] !== undefined) {
			return prefixes[i];
		}
	}
	return false;
}

/**
 * Handler for the back to top button
 */
function scrollToTop() {
	$(document).on('click', 'a[href="#top"]', function (event) {
		event.preventDefault();
		event.stopPropagation();

		TweenMax.to($(window), 1, {
			scrollTo:{
				y: 0,
				autoKill: true
			},
			ease:Power3.easeOut
		});
	});
}

/**
 * function similar to PHP's empty function
 */

function empty(data) {
	if (typeof(data) == 'number' || typeof(data) == 'boolean') {
		return false;
	}
	if (typeof(data) == 'undefined' || data === null) {
		return true;
	}
	if (typeof(data.length) != 'undefined') {
		return data.length === 0;
	}
	var count = 0;
	for (var i in data) {
		// if(data.hasOwnProperty(i))
		//
		// This doesn't work in ie8/ie9 due the fact that hasOwnProperty works only on native objects.
		// http://stackoverflow.com/questions/8157700/object-has-no-hasownproperty-method-i-e-its-undefined-ie8
		//
		// for hosts objects we do this
		if (Object.prototype.hasOwnProperty.call(data, i)) {
			count++;
		}
	}
	return count === 0;
}

/**
 * function to add/modify a GET parameter
 */

function setQueryParameter(uri, key, value) {
	var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i"),
		separator = '';
	separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	} else {
		return uri + separator + key + "=" + value;
	}
}

function is_touch() {
	return $.support.touch;
}

function isElementInViewport(el) {

	//special bonus for those using jQuery
	if (typeof jQuery === "function" && el instanceof jQuery) {
		el = el[0];
	}

	var rect = el.getBoundingClientRect(),
		height = window.innerHeight || document.documentElement.clientHeight,
		width = window.innerWidth || document.documentElement.clientWidth;

	return (
	rect.top <= height * 1.5 && /*or $(window).height() */
	rect.left <= width * 1.5 && /*or $(window).width() */
	rect.bottom >= -0.5 * height &&
	rect.right >= -0.5 * width
	);
}

function sizeColumns() {

    $('.portfolio__item--text').each(function(i, obj) {
        var $item 		= $(obj).css('width', ''),
            itemOffset 	= $item.offset().left,
            $children, $last, height, width, totalHeight, totalWidth;

        $children = $(obj).children();
        height = $item.outerHeight();

        if ( !$children.length ) {
        	$item.remove();
        	return;
        }

        $last = $children.filter(':visible').last();

        if ( ! $last.length ) {
        	return;
        }

        totalHeight = $last.offset().top - $item.offset().top + $last.outerHeight();
        totalWidth = $last.offset().left - $item.offset().left + $last.outerWidth();

        if (totalHeight > height) {
        	width = $item.outerWidth() * (parseInt(totalHeight/height) + 1);
        } else {
        	width = $last.offset().left - itemOffset + $last.outerWidth();
        }

        $item.width(width);
    });

}

function isFilmstrip() {
    return $body.hasClass('blog')
        || $body.hasClass('project_layout-filmstrip')
        || $body.hasClass('project_layout-thumbnails')
}

function bindVertToHorScroll() {
	if ( isFilmstrip() && ! $html.hasClass('is--ie-le10') ) {
		// html body are for ie
		$('html, body, .filmstrip, .portfolio--filmstrip').bind('mousewheel',  vertToHorScroll);
		horToVertScroll = true;
	}
}

function vertToHorScroll(event, delta) {
	if ( $('.filmstrip').length || $('.portfolio--filmstrip.portfolio--visible').length ) {
		this.scrollLeft -= (delta * event.deltaFactor); // delta for macos
		event.preventDefault();
	}
}

function niceScrollInit() {
	var niceScrollOptions = {
		zindex: 5000,
		smoothscroll: false // because it interferes with the hor to ver scroll script
	};

	if( isWindows ) {
		$html.niceScroll( niceScrollOptions );
		$html.addClass('has--nicescroll');
		$html.addClass('is--windows');

		$(document).on('jp_carousel.afterClose', function() {
			$html.getNiceScroll().resize();
		});
	}
}

function filterHandler() {
	var $projectsFilter = $('.js-projects-filter');
	var $filterContent = $('.js-projects-filter-content');
	var $filterList = $('.js-projects-filter-list');

	$('.js-projects-filter-trigger').on('mouseenter', function() {
		$projectsFilter.addClass('is-open');
		TweenMax.to($filterContent, .2, {opacity: 1, onStart: function(){
			$filterList.css('display', 'block');
		}})
	});

	$projectsFilter.on('mouseleave', function() {
		$projectsFilter.removeClass('is-open');
		TweenMax.to($filterContent, .2, {opacity: 0, onComplete: function(){
			$filterList.css('display', 'none');
		}})
	})
}

var HandleParentMenuItems = (function() {
	// Handle parent menu items on tablet in landscape mode;
	// use case: normal, horizontal menu, touch events,
	// sub menus are not visible.
	function handleParentMenuItems() {
		// Make sure there are no open menu items
		$('.menu-item-has-children').removeClass('hover');

		$('.menu-item-has-children > a').each(function(){
			// Add a class so we know the items to handle
			$(this).addClass('prevent-one');

			// Store the original href
			$(this).attr('href-original', $(this).attr('href'));
			// Add a '#' at the end of href so dJax won't interfere
			$(this).attr('href', $(this).attr('href') + '#');
		});

		$('a.prevent-one').on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			// When a parent menu item is activated,
			// close other menu items on the same level
			$(this).parent().siblings().removeClass('hover');

			// Restore the original href so that
			// the menu item can now be used
			$(this).attr('href', $(this).attr('href-original') );

			// Open the sub menu of this parent item
			$(this).parent().addClass('hover');
		});
	}

	// Restore the original behaviour when in portrait mode;
	// use case: vertical menu, all menu items are visible.
	function unHandleParentMenuItems() {
		$('a.prevent-one').each(function(){
			// Unbind te click handler
			$(this).unbind();
			// Restore the original href so dJax can do its job
			$(this).attr('href', $(this).attr('href-original') );
			$(this).removeClass('prevent-one');
		});
	}

	// When a sub menu is open, close it by a touch on
	// any other part of the viewport than navigation.
	// use case: normal, horizontal menu, touch events,
	// sub menus are not visible.
	function bindOuterNavClick() {
		$('body').on( 'touchstart', function (e) {
			var container = $('.nav--main');

			if (!container.is(e.target) // if the target of the click isn't the container...
					&& container.has(e.target).length === 0) // ... nor a descendant of the container
			{
				$('.menu-item-has-children').removeClass('hover');
				$('a.prevent-one').each( function(){
					$(this).attr('href', $(this).attr('href-original') + '#');
				});
			}
		});
	}

	return {
		handle: handleParentMenuItems,
		unHandle: unHandleParentMenuItems,
		bindOuterNavClick: bindOuterNavClick
	}
}());
