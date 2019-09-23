// /* ====== ON DOCUMENT READY ====== */

$(function () {
	init();
});

function init() {
    browserSupport();
    platformDetect();
    browserSize();
    scrollToTop();

    Nav.init();
    updateHeader();
    $html.addClass('ready');

    $('.site-header, #page, .site-footer').css('opacity', 1);

    if( Modernizr.touchevents ) {
        HandleParentMenuItems.bindOuterNavClick();
    }
}

function softInit() {
    niceScrollInit();
    sizeColumns();

    $('html, body, *').unbind('mousewheel', vertToHorScroll);
    horToVertScroll = false;

    if( windowWidth > 900 && Modernizr.touchevents ) {
        HandleParentMenuItems.handle();
    }

    if ($('.single-jetpack-portfolio').length ) {
        Project.init();
        Placeholder.update();
        Project.prepare();
    } else {
        Placeholder.update();
    }

    Portfolio.init();
    Blog.init();

    frontpageSlider.init();

    royalSliderInit();
    videos.init();

    filterHandler();

    $('.site-header, #page, .site-footer').css('opacity', 1);

    $(".pixcode--tabs").organicTabs();

    if ( ! Modernizr.touchevents && ! horToVertScroll ) {
        bindVertToHorScroll();
    }

}

// /* ====== ON WINDOW LOAD ====== */
$window.load(function () {
    softInit();
    eventHandlers();
    loop();
});

// /* ====== ON RESIZE ====== */

function onResize() {
	browserSize();
    sizeColumns();

    if( Modernizr.touchevents ) {
        if( windowWidth >= 900 ) {
            // Handle parent menu items
            HandleParentMenuItems.handle();
        } else if ( windowWidth < 900 ) {
            // Remove handlers
            HandleParentMenuItems.unHandle();
        }
    }

    Project.onResize();
    Nav.onResize();

    frontpageSlider.onResize();
    videos.resize();

    if( isiele10 ) {
        Blog.calcIeFilmstrip();
    }

    Placeholder.resize();
}

function updateHeader() {
    if ($('.page-has-featured-image').length && latestKnownScrollY > windowHeight - 62) {
        $('body').addClass('header--not-light');
    } else {
        $('body').removeClass('header--not-light');
    }
}

var scrollTimeout,
    isScrolling = false;

function onScroll(e) {
    if ( $('.filmstrip').length || $('.portfolio--filmstrip.portfolio--visible').length ) {
        latestKnownScrollX = $(this).scrollLeft();
    } else {
        latestKnownScrollY = $(this).scrollTop();
    }
    if ( ! isScrolling ) {
        isScrolling = true;
        $body.addClass( 'is-scrolling' );
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(doneScrolling, 1000);
}

function doneScrolling() {
    $body.removeClass( 'is-scrolling' );
    isScrolling = false;
}

function loop() {
    Project.getCurrent();
    Portfolio.maybeloadNextProjects();
    Blog.maybeLoadNextPosts();
    updateHeader();

    requestAnimationFrame(loop)
}


function eventHandlers() {
    $window.on('debouncedresize', onResize);

    $window.on('scroll', onScroll);

    if ( Modernizr.touchevents && isFilmstrip() ) {
        $('.site-content').on('scroll', onScroll);
    }

    $window.on('mousemove', function(e) {
        latestKnownMouseX   = e.clientX;
        latestKnownMouseY   = e.clientY;
    });

    $window.on('deviceorientation', function(e) {
        latestDeviceAlpha   = e.originalEvent.alpha;
        latestDeviceBeta    = e.originalEvent.beta;
        latestDeviceGamma   = e.originalEvent.gamma;
    });

    if( windowWidth > 740 ) {
        bindVertToHorScroll();
    }
}

(function() {

    window.disable_mobile_panning = true;

    window.addEventListener( 'touchstart', function onFirstTouch() {
        Modernizr.touchevents = true;
        window.removeEventListener( 'touchstart', onFirstTouch, false );
    }, false );

    function onPointerDownHandler( event ) {
        if ( event.pointerType === 'touch' ) {
            Modernizr.touchevents = true;
        }
    }

    // For IE 10
    window.addEventListener( 'MSPointerDown', onPointerDownHandler );
    // For IE 11+
    window.addEventListener( 'pointerdown', onPointerDownHandler );
    window.addEventListener( "devicemotion", function( event ) {

        if ( ! event.rotationRate ) {
            return;
        }

        if ( event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma ) {
            window.disable_mobile_panning = false;
        }
    } );

})();
