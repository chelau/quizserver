=== ACF Timber Integration ===
Contributors: dream-production, danieltelbis, sticksu
Tags: acf, timber, integration, twig, advanced custom fields
Requires at least: 3.7
Tested up to: 4.9.1
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Automatically enables in the Timber twig context variable all user-defined advanced custom fields.

== Description ==

This plugin is intended for developers that are using Advanced Custom Fields and Timber to develop their themes.

By enabling this plugin the user-defined advanced custom fields will be available in the Timber context variable as follows:

* Fields defined for settings pages will be available everywhere under the "options" key
* Fields defined for posts, pages and custom post types will be available on the \Timber\Post object under the "fields" key
* Fields defined for terms will be available on the \Timber\Term object under the "fields" key
* Fields defined for users will be available on the \Timber\User object under the "fields" key

* Defined menus will also be available everywhere under the "menus" key
* In order to reduce the amount of fields provided we limited the automatic processing to the first two levels of post fields. That means that if you have Post A which relates Post B, which relates Post C you will get the fields for Post A and Post B, while for Post C you will get the Timber Post without the processed fields. To modify the depth use the 'acf_timber_posts_fields_max_depth' filter.

Also adds twig functions for images:

* srcset - used to generate srcset attribute tag.
Usage: `<img src="{{ post.thumbnail.src('large') }}" {{ srcset(post.thumbnail,'large') }} />`
* image_attr - used to generate srcset, width, height and alt.
Usage: `<img src="{{ post.thumbnail.src('large') }}" {{ image_attr(post.thumbnail,'large') }} />`

== Installation ==

1. Install Advanced Custom Field v4 or v5 or Advanced Custom Fields Pro
2. Install Timber Wordpress Plugin
3. Install ACF Timber Integration
4. Start creating twig files
5. Profit

== Frequently Asked Questions ==

= Why not just use the get_field() function directly in the twig file? =

Because that's not a truly MVC approach. You can still use the get_field() function in twig, but it's easier for the frontend developer to have everything available directly in the context variable.

= Timber already plays nice with Advanced Custom Fields, why would I use your plugin? =

Timber does not transform Images, Galleries, Posts, Taxonomies or Users to the equivalent Timber Object when using get_field() or accessing the field directly in the post object. You will need to cast each of these in order to use them as Timber Objects without using our plugin.
 

== Changelog ==

= 1.3.0 =
* Fixed error notice if no nav menu is registered.
* Fixed missing fields on ajax requests.
* Fixed issue with missing fields on previews.
* Added posts fields limit, use acf_timber_posts_fields_max_depth filter to modify depth.

= 1.2.1 =
* Minor bug fixes.

= 1.2 =
* Added field group cache and cache clear.
* Added ACF 4 support.

= 1.1 =
* Added clone and group field support.

= 1.0 =
* Plugin initialization.
* Added main functionality.
