var Nav = (function() {
	var isOpen,
		$mobileHeader = $( '.mobile-header' );

	function init() {
		isOpen = false;
		onResize();
		bindEvents();
	}

	function bindEvents() {
		$('.js-nav-toggle').off( 'click', toggle ).on( 'click', toggle );
	}

	function toggle(e) {
		e.preventDefault();
		if ( isOpen ) {
			close();
		} else {
			open();
		}
	}

	function onResize() {
		$( '.js-nav-toggle' ).css( {
			marginTop: $mobileHeader.outerHeight() / 2
		} );
	}

	function open() {
		$body.addClass( 'navigation--is-visible' );
		isOpen = true;
	}

	function close() {
		$body.removeClass( 'navigation--is-visible' );
		isOpen = false;
	}

	return {
		init: init,
		onResize: onResize,
		open: open,
		close: close
	}

})();
