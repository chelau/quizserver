// Platform Detection
function getIOSVersion( ua ) {
	ua = ua || navigator.userAgent;
	return parseFloat(
			(
			'' + (
			/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec( ua ) || [0, '']
			)[1]
			)
			.replace( 'undefined', '3_2' ).replace( '_', '.' ).replace( '_', '' )
		) || false;
}

function getAndroidVersion( ua ) {
	var matches;
	ua = ua || navigator.userAgent;
	matches = ua.match( /[A|a]ndroid\s([0-9\.]*)/ );
	return matches ? matches[1] : false;
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
	var ua = window.navigator.userAgent;

	// Test values; Uncomment to check result …

	// IE 10
	// ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

	// IE 11
	// ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

	// Edge 12 (Spartan)
	// ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

	// Edge 13
	// ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

	var msie = ua.indexOf( 'MSIE ' );
	if ( msie > 0 ) {
		// IE 10 or older => return version number
		return parseInt( ua.substring( msie + 5, ua.indexOf( '.', msie ) ), 10 );
	}

	var trident = ua.indexOf( 'Trident/' );
	if ( trident > 0 ) {
		// IE 11 => return version number
		var rv = ua.indexOf( 'rv:' );
		return parseInt( ua.substring( rv + 3, ua.indexOf( '.', rv ) ), 10 );
	}

	var edge = ua.indexOf( 'Edge/' );
	if ( edge > 0 ) {
		// Edge (IE 12+) => return version number
		return parseInt( ua.substring( edge + 5, ua.indexOf( '.', edge ) ), 10 );
	}

	// other browser
	return false;
}

function platformDetect() {

	var navUA = navigator.userAgent.toLowerCase(),
		navPlat = navigator.platform.toLowerCase();

	isiPhone = navPlat.indexOf( "iphone" );
	isiPod = navPlat.indexOf( "ipod" );
	isAndroidPhone = navPlat.indexOf( "android" );
	isSafari = navUA.indexOf( 'safari' ) != - 1 && navUA.indexOf( 'chrome' ) == - 1;
	isIE = typeof (
			is_ie
		) !== "undefined" || (
	       ! (
		       window.ActiveXObject
	       ) && "ActiveXObject" in window
	       );
	isiele10 = ua.match( /msie (9|([1-9][0-9]))/i ),
		ieMobile = ua.match( /Windows Phone/i ) ? true : false;
	iOS = getIOSVersion();
	android = getAndroidVersion();
	isMac = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;
	isWindows = navigator.platform.toUpperCase().indexOf( 'WIN' ) !== - 1;
	isiPad = navigator.userAgent.match( /iPad/i ) != null;

	if ( iOS && iOS < 8 ) {
		$html.addClass( 'no-scroll-fx' )
	}

	if ( detectIE() ) {
		$html.addClass( 'is--ie' );
	}

	if ( isiele10 ) {
		$html.addClass( 'is--ie-le10' );
	}

	if ( ieMobile ) {
		$html.addClass( 'is--ie-mobile' )
	}

	if ( isiPad ) {
		$html.addClass( 'is--ipad' );
	}

	var browser = {
		isIe: function() {
			return navigator.appVersion.indexOf( "MSIE" ) != - 1;
		},
		navigator: navigator.appVersion,
		getVersion: function() {
			var version = 999; // we assume a sane browser
			if ( navigator.appVersion.indexOf( "MSIE" ) != - 1 )
			// bah, IE again, lets downgrade version number
			{
				version = parseFloat( navigator.appVersion.split( "MSIE" )[1] );
			}
			return version;
		}
	};

	if ( browser.isIe() && browser.getVersion() == 9 ) {
		$( 'html' ).addClass( 'is--ie9' );
	}
}