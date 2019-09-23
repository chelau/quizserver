<?php
/**
Plugin Name: Disable REST API and Require JWT / OAuth Authentication
Description: Blocks all REST API endpoints and requires JWT or OAuth Authentication.
Author: Benjamin Intal, Gambit Technologies, Inc.
Version: 1.0
Author URI: http://gambit.ph
Plugin URI: https://wordpress.org/plugins/disable-rest-api-and-require-jwt-oauth-authentication/
Domain Path: /languages
 *
 * @package Disable REST API and Require JWT / OAuth Authentication
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

if ( ! function_exists( 'require_auth_for_all_endpoints' ) ) {
	add_filter( 'rest_pre_dispatch', 'require_auth_for_all_endpoints', 10, 3 );
	function require_auth_for_all_endpoints( $result, $server, $request ) {
		if ( ! is_user_logged_in() ) {

			// Only allow these endpoints: JWT Auth.
			$allowed_endpoints = array(
				'/jwt-auth/v1/token/validate',
				'/jwt-auth/v1/token',
				'/oauth/authorize',
				'/oauth/token',
				'/oauth/me',
			);
			$allowed_endpoints = apply_filters( 'reqauth/allowed_endpoints', $allowed_endpoints );

			// Endpoint checker.
			$regex_checker = '#^(' . join( '|', $allowed_endpoints ) . ')#';
			$regex_checker = apply_filters( 'reqauth/regex_checker', $regex_checker );

			$is_allowed = preg_match( $regex_checker, $request->get_route() );
			$is_allowed = apply_filters( 'reqauth/is_allowed', $is_allowed );

			if ( ! $is_allowed ) {
				return new WP_Error( 'rest_not_logged_in', __( 'You are not currently logged in.' ), array( 'status' => 401 ) );
			}
		}
	}
}
