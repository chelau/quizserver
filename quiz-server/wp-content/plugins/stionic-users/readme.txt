=== Stionic Users - WordPress Users API ===
Contributors: Stionic
Donate link: https://stionic.com/donate/
Tags: create app, wordpress users, mobile app wordpress, api
Requires at least: 4.7
Tested up to: 5.1.1
Stable tag: 1.0.1
Requires PHP: 5.2.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Expanded the WordPress REST API for manager Users

== Description ==

Stionic Users has expanded the WordPress REST API for manager Users.
Allows you create [mobile app for WordPress](https://stionic.com/).

= Features =
* Register users
* Reset password by username
* Change users avatar
* Logout everywhere else
* This plugin support API login with Facebook by access token

= Docs & Support =

Register users
Send 'POST' request to '/wp-json/wp/v2/m_users/register' with params 'username' and 'email'.

Reset password
Send 'POST' request to '/wp-json/wp/v2/m_users/password' with params 'username'.

Change users avatar (login required)
Send 'POST' request to '/wp-json/wp/v2/m_users/avatar' with params 'base64' (base64 of image).

Delete users avatar (login required)
Send 'DELETE' request to '/wp-json/wp/v2/m_users/avatar'.

Logout everywhere else (login required)
Send 'POST' request to '/wp-json/wp/v2/m_users/keep'.

Login Facebook
Send 'POST' request to '/wp-json/wp/v2/m_facebook/login' with params 'token' is access token of Facebook.
Return: JWT Authentication data include token, use it in Header of [JWT authentication](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/).

You can find [docs](https://stionic.com/category/plugins/stionic-users/).
If you were unable to find the answer to your question on the documentation, you should check the [support forum](https://wordpress.org/support/plugin/stionic-users/) on WordPress.org.
If you can't locate any topics that pertain to your particular issue, post a new topic for it.

= Recommend Plugins =

The following plugins are recommend for Stionic Users:

* [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) by Enrique Chavez.
* [WP User Avatar](https://wordpress.org/plugins/wp-user-avatar/) by flippercode.
* [Nextend Social Login and Register](https://wordpress.org/plugins/nextend-facebook-connect/) by Nextendweb.

== Installation ==

1. Upload the entire `stionic-users` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.

For basic usage, you can also have a look at the [plugin web site](https://stionic.com/category/plugins/stionic-users/).

== Frequently Asked Questions ==

Do you have questions or issues with Stionic Users? Use these support channels appropriately.

1. [Stionic](https://stionic.com/category/plugins/stionic-users/)
1. [Support forum](https://wordpress.org/support/plugin/stionic-users/)

== Screenshots ==

== Changelog ==

= 1.0.1 =
* Support latest Nextend social plugin

For more information, see [Releases](https://stionic.com/category/plugins/stionic-users/).

== Upgrade Notice ==

= 1.0.1 =
Support latest Nextend social plugin

= 1.0.0 =