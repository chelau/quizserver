=== Disable REST API and Require JWT / OAuth Authentication ===
Contributors: bfintal, gambitph
Tags: json, web, api, rest-api, rest, oauth, authentication, jwt, wp-api, wp-json
Requires at least: 4.4
Tested up to: 4.8.2
Stable tag: 1.0
Requires PHP: 5.2
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5A97UAY68JHY4

Disables all REST API endpoints and requires JWT or OAuth Authentication.

== Description ==

**When you activate this plugin, all REST API endpoints will be disabled for non-authorized requests.**

Best used with any of these plugins:

* [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
* [WP OAuth Server](https://wordpress.org/plugins/oauth2-provider/)

Blocks *ALL* REST API endpoints except for:

* /jwt-auth/v1/token/validate
* /jwt-auth/v1/token
* /oauth/authorize
* /oauth/token
* /oauth/me

Allows all REST API endpoints if they come with a valid **Bearer Token Authentication** (authentication via GET URL variables are still blocked)

When used alone in your site, your REST API will essentially be disabled.

> Note that this plugin itself doesn't provide JWT or OAuth authentication, it only whitelists them.

= Features =

* No settings page
* You can whitelist other REST API endpoint via a filter hook (see FAQs below)
* Blocks all REST API endpoints.. but
* Allows requests with Bearer Token Authentication.. and
* Allows [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) & [WP OAuth Server](https://wordpress.org/plugins/oauth2-provider/) authentication endpoints

== Installation ==

1. Head over to Plugins > Add New in the admin
2. Search for "Disable REST API and Require Authentication"
3. Install & activate the plugin
4. Now your REST API endpoints are disabled for non-authenticated requests.

== Screenshots ==

1. Blocked REST API requests
2. Authenticated REST API requests are allowed

== Frequently Asked Questions ==

** How is this different from Disable REST API? **

This plugin is similar to Disable REST API, wherein it disables all REST API endpoints, *but it* still allows the authentication endpoints provided by:

* [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
* [WP OAuth Server](https://wordpress.org/plugins/oauth2-provider/)

And if a **Bearer Token Authentication** is provided, then the REST API becomes available.

** How can I check if my REST API is disabled? **

Open a new incognito browser tab or private browser tab and visit your `wp-json` URL:

> `http://mysite/wp-json/`

You will see this message:

> `{"code":"rest_not_logged_in","message":"You are not currently logged in.","data":{"status":401}}`

** What is a Bearer Token Authenticated REST API request? **

A Bearer Token Authenticated REST API request is a REST API call with this **header**:

> Authorization: Bearer XXXXXXX

The *XXXXXXX* corresponds to the authentication token given by any of these 2 plugins:

* [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
* [WP OAuth Server](https://wordpress.org/plugins/oauth2-provider/)

** How do I implement JWT / OAuth authentication? **

That is outside the scope of this plugin, please refer to the docs of the respective plugins:

* [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
* [WP OAuth Server](https://wordpress.org/plugins/oauth2-provider/)

** How do I whitelist other REST API endpoints? (via filter hook) **

I've placed a filter called `reqauth/allowed_endpoints` where you can add your own REST API endpoints to the whitelist.

For example, I want to allow `/my-endpoint` for non-authorized REST API calls:

`add_filter( 'reqauth/allowed_endpoints', 'allow_my_endpoints' );
function( $allowed_endpoints ) {
    $allowed_endpoints[] = '/my-endpoint';
    return $allowed_endpoints;
}`

== Upgrade Notice ==

None.

== Changelog ==

= v1.0 =

* Initial release
