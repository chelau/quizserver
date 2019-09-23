var Project = (function() {

	var $film, $grid, $fullview,
		start, end,
		current,
		initialized = false,
		fullviewWidth = 0,
		fullviewHeight = 0,
		initialAlpha = 0,
		initialBeta = 0,
		initialGamma = 0,
		imageScaling = 'fill';

	fullviewWidth = windowWidth;
	fullviewHeight = windowHeight;

	function init() {

		if ( ! $( '.single-jetpack-portfolio' ).length ) {
			return;
		}

		if ( initialized ) {
			return;
		}

		if ( $( '.image-scaling--fit' ).length || (
				Modernizr.touchevents && typeof window.disable_mobile_panning !== "undefined" && window.disable_mobile_panning == true
			) ) {
			imageScaling = 'fit';
		}

		if ( $( '.project_layout-filmstrip' ).length ) {
			$film = $( '.js-portfolio' );
			$grid = $film.clone( true, true ).addClass( 'portfolio--grid' ).insertBefore( $film );
			$film.addClass( 'portfolio--filmstrip' ).addClass( 'portfolio--visible' );
		}  else {
			// this is some project type that we don't handle here - like fullscreen
			return;
		}

		$grid.find( '.js-portfolio-item' ).each( function( i, obj ) {
			var $item = $( obj );
			$item.data( 'src', $item.data( 'srcsmall' ) );
		} );

		$film.find( '.js-portfolio-item' ).each( function( i, obj ) {
			var $item = $( obj );
			$item.data( 'src', $item.data( 'srcfull' ) );
		} );

		$fullview = $( '.fullview' );

		addMetadata();
		bindEvents();

		initialized = true;
	}

	function onResize() {
		if ( $( '.single-jetpack-portfolio' ).length ) {
			resizeFullView();
			resizeFilmstrip();
			getMiddlePoints();
			getReferenceBounds();
		}
	}

	function resizeFilmstrip() {
		$( '.portfolio__item' ).each( function( i, item ) {

			var $item = $( item ),
				width = $item.data( 'width' ),
				height = $item.data( 'height' ),
				newHeight = $item.height(),
				newWidth = newHeight * $item.data( 'width' ) / $item.data( 'height' );

			$item.width( newWidth );

		} );
	}

	function resizeFullView() {
		$document.off('mousemove', panFullview);
		$(window).off('deviceorientation', panFullview);

		if ( Modernizr.touchevents ) {
			initialAlpha 	= latestDeviceAlpha;
			initialBeta 	= latestDeviceBeta;
			initialGamma 	= latestDeviceGamma;

			TweenMax.to($('.fullview__image img'), 0, {
				x: 0,
				y: 0
			});
		}

		if ( typeof $fullview === "undefined" ) {
			return;
		}

		var $target = $( '.fullview__image' ),
			targetWidth = $target.width(),
			targetHeight = $target.height(),
			newWidth = $fullview.width(),
			newHeight = $fullview.height(),
			scaleX = newWidth / targetWidth,
			scaleY = newHeight / targetHeight,
			scale = imageScaling === 'fill' ? Math.max( scaleX, scaleY ) : Math.min( scaleX, scaleY );

		fullviewWidth = targetWidth * scale;
		fullviewHeight = targetHeight * scale;

		$target.find( 'img' ).removeAttr( 'style' );
		$target.css({
			width: fullviewWidth,
			height: fullviewHeight,
			top: (fullviewHeight - newHeight) / -2,
			left: (fullviewWidth - newWidth) / -2
		});

		$document.on('mousemove', panFullview);
		$(window).on('deviceorientation', panFullview);
	}

	function addMetadata() {
		var $target = $( '.single-proof_gallery' ).length ? $film.add( $grid ) : $film;

		$target.find( '.js-portfolio-item' ).each( function( i, obj ) {
			var $item = $( obj ),
				captionText = $item.data( 'caption' ),
				$caption = $( '<div class="photometa__caption"></div>' ).html( captionText ),
				descriptionText = $item.data( 'description' ),
				$description = $( '<div class="photometa__description"></div>' ).html( '<div>' + descriptionText + '</div>' ),
				$exif = $( '<ul class="photometa__exif  exif"></ul>' ),
				$meta = $( '<div class="portfolio__meta  photometa"></div>' ),
				exifText = $item.data( 'exif' ),
				$full = $( '<button class="button-full js-button-full"></button>' );

			if ( empty( captionText ) ) {
				$meta.css( 'opacity', 0 );
				$meta.addClass( 'no-caption' );

				if ( empty( descriptionText ) && empty( exifText ) ) {
					$meta.hide();
				}
			}

			if ( ! empty( exifText ) ) {
				$.each( exifText, function( key, value ) {
					$( '<li class="exif__item"><i class="exif__icon exif__icon--' + key + '"></i>' + value + '</li>' ).appendTo( $exif );
				} );
			}

			$full.prependTo( $item );
			$caption.appendTo( $meta );
			$exif.appendTo( $meta );
			$description.appendTo( $meta );

			$meta.appendTo( $item );
		} );
	}

	function prepare() {

		if ( ! $( '.project_layout-filmstrip' ).length && ! $( '.project_layout-thumbnails' ).length || $( '.password-required' ).length ) {
			// we are not in a single project so bail
			return;
		}

		filmWidth = $film.width();
		contentWidth = $( '.site-content' ).width();
		sidebarWidth = $( '.site-sidebar' ).width();

		getMiddlePoints();
		getReferenceBounds();

		$grid.show();

		var $first = $film.find( '.js-portfolio-item' ).first().addClass( 'portfolio__item--active' );

		setCurrent( $first );

		if ( ! $( '.project_layout-filmstrip' ).length ) {
			showThumbnails( null, true );
		}
	}

	function bindEvents() {

		$( window ).on( 'project:resize', onResize );

		// if ( Modernizr.touchevents ) {
		// 	$('.portfolio--grid').on('click', '.js-portfolio-item', showFullView);
		// } else {
			$('.portfolio--grid').on('click', '.js-portfolio-item', showFilmstrip);
			$('.portfolio--filmstrip').on('click', '.js-portfolio-item', showFullView);
		// }

		$('.fullview__close').on('click', hideFullView);
		$('.fullview .rsArrowRight').on('click', showNext);
		$('.fullview .rsArrowLeft').on('click', showPrev);
		$('.fullview').on('click', hideFullView);
		$('.js-details').on('click', toggleDetails);

		$('.js-thumbs').on('click', function(e) {
			e.preventDefault();
			showThumbnails();
		});


		$(document).keydown(function(e) {

			if (!$('.portfolio--filmstrip.portfolio--visible').length) {
				return;
			}

			var $items = $film.find('.js-portfolio-item'),
				current, $current,
				next, $next;

			$items.each(function(i, obj) {
				if ($(obj).hasClass('portfolio__item--active')) {
					current = i;
				}
			});

			if (typeof current === "undefined") {
				return;
			}

			// a close is a close and nothing else
			switch ( e.which ) {
				case 27:
					if ( $( '.fullview--visible' ).length ) {
						hideFullView();
						e.preventDefault();
						return;
					}
					if ( $( '.portfolio--filmstrip.portfolio--visible' ).length ) {
						showThumbnails();
						e.preventDefault();
						return;
					}
				case 13:
					if ( $( '.portfolio--filmstrip.portfolio--visible' ).length && ! $( '.fullview--visible' ).length ) {
						showFullView.call( $( '.portfolio__item--active' ) );
						e.preventDefault();
						return;
					}
			}

			// in the fullview mode the next/prev keys should change the entire image
			if ( $( '.fullview--visible' ).length > 0 ) {
				switch ( e.which ) {
					case 37:
						showPrev();
						e.preventDefault();
						break; // left
					case 39:
						showNext();
						e.preventDefault();
						break; // right
				}
				return;
			} else { // but in the filmstrip mode the next/prev keys should move only the current position of the scroll
				switch ( e.which ) {
					case 37:
						if ( current === 0 ) {
							return;
						}
						next = current - 1;
						e.preventDefault();
						break;
					case 39:
						if ( current === $items.length - 1 ) {
							return;
						}
						next = current + 1;
						e.preventDefault();
						break;
					default:
						return;
				}
			}

			$next = $items.eq( next );

			var offset = parseInt( $( '.bar--fixed' ).css( 'left' ), 10 ),
				newScrollX = $next.data( 'middle' ) - $( '.site-content' ).width() / 2 + offset;

			TweenLite.to( window, 0.6, {
				scrollTo: {
					x: newScrollX
				},
				ease: Power1.easeInOut
			} );
		});
	}

	function unbindEvents() {
		$( window ).off( 'project:resize', onResize );
		$( '.portfolio--grid' ).off( 'click', '.js-portfolio-item', showFilmstrip );
		$( '.portfolio--filmstrip' ).off( 'click', '.js-portfolio-item', showFullView );
		$( '.fullview__close' ).off( 'click', hideFullView );
		$( '.fullview .rsArrowRight' ).off( 'click', showNext );
		$( '.fullview .rsArrowLeft' ).off( 'click', showPrev );
		$( '.fullview' ).off( 'click', hideFullView );
		$( '.js-details' ).off( 'click', toggleDetails );
	}

	function toggleDetails() {
		$body.toggleClass( 'portfolio--details' );
	}

	function destroy() {
		unbindEvents();
		initialized = false;
	}

	function showPrev( e ) {
		var $items = $film.find( '.js-portfolio-item' ),
			items = $items.length;

		if ( typeof e !== "undefined" ) {
			e.stopPropagation();
			e.preventDefault();
		}

		$items.each( function( i, obj ) {
			if ( $( obj ).hasClass( 'portfolio__item--active' ) ) {
				if ( i === 0 ) {
					fullViewTransition( $items.eq( items - 1 ) );
				} else {
					fullViewTransition( $items.eq( i - 1 ) );
				}
				return false;
			}
		} );
		panFullview();
	}

	function showNext( e ) {
		var $items = $film.find( '.js-portfolio-item' ),
			items = $items.length;

		if ( typeof e !== "undefined" ) {
			e.stopPropagation();
			e.preventDefault();
		}

		$items.each( function( i, obj ) {
			if ( $( obj ).hasClass( 'portfolio__item--active' ) ) {
				if ( i === items - 1 ) {
					fullViewTransition( $items.eq( 0 ) );
				} else {
					fullViewTransition( $items.eq( i + 1 ) );
				}
				return false;
			}
		} );
		panFullview();
	}

	function fullViewTransition( $source ) {

		var $target = addImageToFullView( $source ),
			$toRemove = $( '.fullview__image' ).not( $target );

		setCurrent( $source );
		panFullview();

		if ( imageScaling == 'fit' ) {
			TweenMax.fromTo( $toRemove, .3, {opacity: 1}, {opacity: 0} );
		}

		TweenMax.fromTo( $target, .3, {opacity: 0}, {
			opacity: 1,
			onComplete: function() {
				$toRemove.remove();
				centerFilmToTarget( $source );
			}
		} );
	}

	// loop through each portfolio item and find the one closest to center
	function getCurrent() {

		if ( typeof $film === "undefined" || ( ! $( '.single-jetpack-portfolio' ).length) || $( '.fullview--visible' ).length ) {
			return;
		}

		if ( ! initialized ) {
			return;
		}

		var current = $( '.portfolio__item--active' ).data( 'middle' ),
			reference = latestKnownScrollX + start + ( end - start ) * latestKnownScrollX / ( filmWidth - contentWidth ),
			min = Math.abs( reference - current ),
			$next;

		$( '.js-reference' ).css( 'left', reference ).text( parseInt( reference, 10 ) );

		$film.find( '.js-portfolio-item' ).each( function( i, obj ) {
			var compare = $( obj ).data( 'middle' );

			if ( Math.abs( compare - reference ) < min ) {
				min = Math.abs( compare - reference );
				$next = $( obj );
			}
		} );

		if ( typeof $next !== "undefined" ) {
			setCurrent( $next );
		}
	}

	function getReferenceBounds() {

		if ( typeof $film === "undefined" ) {
			return;
		}

		var $items = $film.find( '.js-portfolio-item' ),
			items = $items.length,
			max;

		if ( items < 2 ) {
			return;
		}

		var threshold = 10;
		start = $items.first().offset().left + $items.first().width();
		start = Math.min(start, windowWidth / 2) - threshold;
		end = windowWidth - $items.last().width();
		end = Math.max(end, windowWidth / 2) + threshold;
	}

	function getMiddlePoints() {
		$('.portfolio').each(function(i, portfolio) {
			$(portfolio).find('.js-portfolio-item').each(function(i, obj) {
				var $obj = $(obj);
				$obj.data('middle', getMiddle($obj));
				$obj.data('count', i);
			});
		});
	}

	function showThumbnails( e, initial ) {
		var $active = $( '.portfolio__item--active' ),
			$target = $grid.find( '.js-portfolio-item' ).eq( $active.data( 'count' ) ),
			selector = '.site-footer';

		TweenMax.to( selector, .3, {opacity: 0} );

		$( '.site-footer' ).css( 'pointer-events', 'none' )
		$( '.site-footer' ).fadeOut();

		$( '.photometa' ).addClass( 'no-transition' ).css( 'opacity', 0 );

		$grid.css( 'opacity', 1 );

		$( '.js-portfolio-item' ).addClass( 'no-transition' );

		TweenMax.to( $( '.mask--project' ), 0, {
			'transform-origin': '0 100%',
			'z-index': 300,
			scaleX: 0
		} );

		$film.css( 'z-index', 200 );
		$grid.css( 'z-index', 400 );

		if ( typeof initial === "undefined" ) {
			morph( $active, $target, {delay: .3}, function() {
				$target.imagesLoaded( function() {
					$target.find( '.portfolio__item--clone' ).remove();
					$( '.photometa' ).removeClass( 'no-transition' ).css( 'opacity', '' );
				} );
			}, false );
		} else {
			$( '.photometa' ).removeClass( 'no-transition' ).css( 'opacity', '' );
		}

		$grid.find( '.js-portfolio-item img' ).css( 'opacity', '' );

		if ( typeof initial === "undefined" ) {
			setTimeout( function() {
				var $items = $grid.find( '.js-portfolio-item img' );
				$items.sort( function() {
					return 0.5 - Math.random()
				} );

				TweenMax.staggerTo( $items, .3, {opacity: 1, ease: Quad.easeInOut}, 0.05 );
				$( '.js-portfolio-item' ).removeClass( 'no-transition' );
			}, 600 );
		}

		TweenMax.to( $( '.mask--project' ), .6, {
			x: 0,
			scaleX: 1,
			ease: Expo.easeInOut,
			onComplete: function() {
				$( '.site' ).css( 'overflow-x', 'hidden' );
				$film.removeClass( 'portfolio--visible' );
				$grid.addClass( 'portfolio--visible' );
				TweenMax.to( '.mask--project', 0, {scaleX: 0} );
			}
		} );

	}

	function showFilmstrip( e ) {

		if ( typeof e !== "undefined" && $( e.target ).is( '.js-thumbs, .js-plus, .js-minus' ) ) {
			return;
		}

		var $clicked = $( this ),
			$target = $film.find( '.js-portfolio-item' ).eq( $clicked.data( 'count' ) ),
			selector = '.site-footer';

		$( '.site' ).css( 'overflow-x', '' );

		$( '.photometa' ).addClass( 'no-transition' ).css( 'opacity', 0 );

		TweenMax.to( selector, .3, {opacity: 1, delay: .3} );

		$( '.site-footer' ).css( 'pointer-events', 'auto' )
		$( '.site-footer' ).fadeIn();

		$( '.js-portfolio-item' ).addClass( 'no-transition' );

		$clicked.css( 'opacity', 0 );
		$film.find( '.js-portfolio-item' ).css( 'opacity', 0 );
		$film.find( '.js-portfolio-item img' ).css( 'opacity', '' );

		$target.addClass( 'portfolio__item--target' );

		$film.addClass( 'portfolio--visible' );

		TweenMax.to( $( '.mask--project' ), 0, {
			'transform-origin': '100% 0',
			'z-index': 300
		} );
		$film.css( 'z-index', 400 );
		$grid.css( 'z-index', 200 );

		TweenMax.to( $( '.mask--project' ), .6, {
			scale: 1,
			ease: Expo.easeInOut,
			onComplete: function() {
				$grid.removeClass( 'portfolio--visible' );
				$grid.css( 'opacity', '' );
				TweenMax.to( $film.find( '.js-portfolio-item' ), .3, {
					opacity: 1,
					onComplete: function() {
						$( '.js-portfolio-item' ).removeClass( 'no-transition' );
						$film.find( '.photometa' ).removeClass( 'no-transition' ).css( 'opacity', '' );
					}
				} );
				$target.removeClass( 'portfolio__item--target' );
				TweenMax.to( '.mask--project', 0, {scaleX: 0} );
			}
		} );

		centerFilmToTarget( $target );
		morph( $clicked, $target, {}, function() {
			$target.imagesLoaded( function() {
				$target.find( '.portfolio__item--clone' ).remove();
			} );
		}, false );

	}

	function centerFilmToTarget( $target ) {
		var offset = parseInt( $( '.bar--fixed' ).css( 'left' ), 10 );

		if ( Modernizr.touchevents || $( 'html' ).hasClass( '.is--ie-le10' ) ) {
			TweenLite.to( '.site-content', 0, {
				scrollTo: {
					x: $target.data( 'middle' ) - $( '.site-content' ).width() / 2 + offset
				},
				ease: Power1.easeInOut
			} );
		} else {
			TweenLite.to( window, 0, {
				scrollTo: {
					x: $target.data( 'middle' ) - $( '.site-content' ).width() / 2 + offset
				},
				ease: Power1.easeInOut
			} );
		}
	}

	function addImageToFullView($source) {

		// prepare current for fullview
		var isVideo = $source.is( '.portfolio__item--video' ),
			width = $source.data( 'width' ),
			height = $source.data( 'height' ),
			newWidth = $fullview.width(),
			newHeight = $fullview.height(),
			scaleX = newWidth / width,
			scaleY = newHeight / height,
			scale = imageScaling == 'fill' ? Math.max( scaleX, scaleY ) : Math.min( scaleX, scaleY ),
			$target = $( '<div>' ).addClass( 'fullview__image' ),
			$image = $( document.createElement( 'img' ) );

		fullviewWidth = width * scale;
		fullviewHeight = height * scale;

		setCurrent($source);

		$target.css({
			width: fullviewWidth,
			height: fullviewHeight,
			top: (fullviewHeight - newHeight) / -2,
			left: (fullviewWidth - newWidth) / -2
		});

		$fullview.append( $target );

		if ( isVideo ) {
			$source.find( 'iframe' ).clone().prependTo( $target );
		} else {
			$image
			.attr( 'src', $source.data( 'srcfull' ) )
			.prependTo( $target );
		}

		return $target;
	}

	function showFullView(e) {

		if ( typeof e !== "undefined" && $( e.target ).is( '.js-thumbs, .js-plus, .js-minus' ) ) {
			return;
		}

		// prepare current for fullview
		var $source = $( this ),
			$target = addImageToFullView( $source );

		$( '.button-full' ).css( 'opacity', 0 );

		$source.addClass( 'hide-meta' );

		initialAlpha = latestDeviceAlpha;
		initialBeta = latestDeviceBeta;
		initialGamma = latestDeviceGamma;

		morph( $source, $target );

		if ( imageScaling === 'fit' ) {
			$fullview.css( 'backgroundColor', '#222222' );
		} else if ( Modernizr.touchevents ) {
			$( window ).on( 'deviceorientation', panFullview );
			$document.on( 'mousemove', panFullview );
		} else {
			setTimeout( function() {
				TweenMax.to( $( '.fullview__image img' ), .5, {
					x: (windowWidth / 2 - latestKnownMouseX) * (fullviewWidth - windowWidth) / windowWidth,
					y: (windowHeight / 2 - latestKnownMouseY) * (fullviewHeight - windowHeight) / windowHeight,
					ease: Back.easeOut,
					onComplete: function() {
						$document.on( 'mousemove', panFullview );
						$( window ).on( 'deviceorientation', panFullview );
						setCurrent( $source );
					}
				} );
			}, 500 );
		}

		$fullview.addClass( 'fullview--visible' );
	}

	function panFullview() {

		$( '.fullview__image img' ).each( function( i, obj ) {
			var $img = $( obj ),
				imgWidth = $img.width(),
				imgHeight = $img.height();

			if ( Modernizr.touchevents ) {

				var a = initialAlpha - latestDeviceAlpha,
					b = initialBeta - latestDeviceBeta,
					g = initialGamma - latestDeviceGamma,
					x, y;

				b = b < - 30 ? - 30 : b > 30 ? 30 : b;
				g = g < - 30 ? - 30 : g > 30 ? 30 : g;

				x = g;
				y = b;

				if ( windowWidth > windowHeight ) {
					x = - b;
					y = - g;
				}

				if ( imgWidth > windowWidth ) {
					TweenMax.to( $img, 0, {
						x: x / 60 * ( imgWidth - windowWidth )
					});
				}

				if ( imgHeight > windowHeight ) {
					TweenMax.to( $img, 0, {
						y: y / 60 * ( imgHeight - windowHeight )
					} );
				}

			} else {
				if ( imgWidth > windowWidth ) {
					TweenMax.to( $img, 0, {
						x: ( windowWidth / 2 - latestKnownMouseX ) * ( imgWidth - windowWidth ) / windowWidth
					} );
				}

				if ( imgHeight > windowHeight ) {
					TweenMax.to( $img, 0, {
						y: ( windowHeight / 2 - latestKnownMouseY ) * ( imgHeight - windowHeight ) / windowHeight
					} );
				}
			}
		});
	}

	function hideFullView( e ) {

		var $source = $( '.fullview__image' ),
			$target = $( '.portfolio__item--active' ).addClass( 'hide-meta' ),
			isVideo = $target.is( '.portfolio__item--video' );

		if ( typeof e !== "undefined" ) {
			e.stopPropagation();
			e.preventDefault();
		}

		$target.children().not( '.jetpack-video-wrapper' ).add( $target ).addClass( 'no-transition' ).css( 'opacity', 0 );
		setTimeout( function() {
			$target.children().add( $target ).removeClass( 'no-transition' );
		}, 10 );

		if ( imageScaling == 'fit' ) {
			$fullview.css( 'backgroundColor', 'transparent' );
		}

		$document.off( 'mousemove', panFullview );
		$( window ).off( 'deviceorientation', panFullview );

		setCurrent( $target );
		centerFilmToTarget( $target );

		$( '.site-content' ).addClass( 'site-content--fullview' );

		function finishHideFullView() {
			morph( $source, $target, {}, function() {
				$( '.site-content' ).removeClass( 'site-content--fullview' );
				$( '.button-full' ).css( 'opacity', 1 );
				$target.removeClass( 'hide-meta' );
			} );
			setTimeout( function() {
				$fullview.removeClass( 'fullview--visible' );
				$source.remove();
			}, 10 );
		}

		if ( isVideo ) {
			finishHideFullView();
			return;
		}

		if ( imageScaling === 'fill' ) {
			TweenMax.to( $( '.fullview__image img' ), .2, {
				x: 0,
				y: 0,
				onComplete: finishHideFullView
			} );
		} else {
			$fullview.css( 'backgroundColor', 'transparent' );
			setTimeout( function() {
				finishHideFullView();
			}, 200 );
		}
	}

	function morph( $source, $target, options, callback, remove ) {

		var sourceOffset = $source.offset(),
			sourceWidth = $source.width(),
			sourceHeight = $source.height(),
			targetOffset = $target.offset(),
			targetWidth = $target.width(),
			targetHeight = $target.height(),
			$clone = $source.clone().addClass( 'portfolio__item--clone' );

		remove = typeof remove === "undefined" ? true : remove;

		$clone.css( {
			position: 'absolute',
			top: sourceOffset.top - targetOffset.top,
			left: sourceOffset.left - targetOffset.left,
			width: sourceWidth,
			height: sourceHeight,
			background: 'none'
		} );

		$target.css( {
			position: 'relative',
			transition: 'none',
			'z-index': '10000',
			opacity: 1,
			background: 'none'
		} );

		$clone.css( 'opacity', 1 );
		$clone.find( 'img' ).css( 'opacity', 1 );
		$target.find( 'img' ).css( 'opacity', 0 );

		var defaults = {
				x: targetOffset.left - sourceOffset.left + (targetWidth - sourceWidth) / 2,
				y: targetOffset.top - sourceOffset.top + (targetHeight - sourceHeight) / 2,
				scale: targetWidth / sourceWidth,
				force3D: true,
				ease: Expo.easeInOut,
				onComplete: function() {
					$target.find( 'img' ).css( 'opacity', 1 );
					$target.css( {
						background: '',
						position: '',
						'z-index': '',
						transition: '',
						opacity: ''
					} );

					if ( ! empty( $target.data( 'caption' ) ) ) {
						$target.children( '.photometa' ).css( 'opacity', 1 );
					}

					$source.css( 'opacity', '' );

					if ( remove ) {
						$clone.remove();
					}

					if ( typeof callback !== "undefined" ) {
						callback();
					}
				}
			},
			config = $.extend( defaults, options );

		requestAnimationFrame( function() {
			TweenMax.to( $target.children( '.photometa' ), 0, {opacity: 0} );
			$clone.prependTo( $target );
			TweenMax.to( $clone.children( '.photometa' ), .3, {opacity: 0} );
			TweenMax.to( $clone, .5, config );
		} );
	}

	function getMiddle( $image ) {
		return $image.offset().left + $image.width() / 2 - $film.offset().left;
	}

	function setCurrent( $current ) {
		$film.find( '.js-portfolio-item' ).removeClass( 'portfolio__item--active' );
		$current.addClass( 'portfolio__item--active' );
		$( '.portfolio__position' ).text( $current.data( 'count' ) + 1 + ' ' + objectl10n.tCounter + ' ' + $film.find( '.js-portfolio-item' ).not( '.portfolio__item--clone' ).length );
	}

	return {
		init: init,
		prepare: prepare,
		onResize: onResize,
		getCurrent: getCurrent,
		destroy: destroy
	}
})();
