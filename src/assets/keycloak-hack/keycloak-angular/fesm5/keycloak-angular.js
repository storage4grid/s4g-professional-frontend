import { __awaiter, __generator, __spread } from 'tslib';
import { Injectable, NgModule } from '@angular/core';
import { HttpHeaders, HTTP_INTERCEPTORS } from '@angular/common/http';
import * as Keycloak_ from 'keycloak-js';
import { Observable, Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */
/** @enum {number} */
var KeycloakEventType = {
    /**
       * Called if there was an error during authentication.
       */
    OnAuthError: 0,
    /**
       * Called if the user is logged out
       * (will only be called if the session status iframe is enabled, or in Cordova mode).
       */
    OnAuthLogout: 1,
    /**
       * Called if there was an error while trying to refresh the token.
       */
    OnAuthRefreshError: 2,
    /**
       * Called when the token is refreshed.
       */
    OnAuthRefreshSuccess: 3,
    /**
       * Called when a user is successfully authenticated.
       */
    OnAuthSuccess: 4,
    /**
       * Called when the adapter is initialized.
       */
    OnReady: 5,
    /**
       * Called when the access token is expired. If a refresh token is available the token
       * can be refreshed with updateToken, or in cases where it is not (that is, with implicit flow)
       * you can redirect to login screen to obtain a new access token.
       */
    OnTokenExpired: 6,
};
KeycloakEventType[KeycloakEventType.OnAuthError] = 'OnAuthError';
KeycloakEventType[KeycloakEventType.OnAuthLogout] = 'OnAuthLogout';
KeycloakEventType[KeycloakEventType.OnAuthRefreshError] = 'OnAuthRefreshError';
KeycloakEventType[KeycloakEventType.OnAuthRefreshSuccess] = 'OnAuthRefreshSuccess';
KeycloakEventType[KeycloakEventType.OnAuthSuccess] = 'OnAuthSuccess';
KeycloakEventType[KeycloakEventType.OnReady] = 'OnReady';
KeycloakEventType[KeycloakEventType.OnTokenExpired] = 'OnTokenExpired';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * A simple guard implementation out of the box. This class should be inherited and
 * implemented by the application. The only method that should be implemented is #isAccessAllowed.
 * The reason for this is that the authorization flow is usually not unique, so in this way you will
 * have more freedom to customize your authorization flow.
 * @abstract
 */
var  /**
 * A simple guard implementation out of the box. This class should be inherited and
 * implemented by the application. The only method that should be implemented is #isAccessAllowed.
 * The reason for this is that the authorization flow is usually not unique, so in this way you will
 * have more freedom to customize your authorization flow.
 * @abstract
 */
KeycloakAuthGuard = /** @class */ (function () {
    function KeycloakAuthGuard(router, keycloakAngular) {
        this.router = router;
        this.keycloakAngular = keycloakAngular;
    }
    /**
     * CanActivate checks if the user is logged in and get the full list of roles (REALM + CLIENT)
     * of the logged user. This values are set to authenticated and roles params.
     *
     * @param route
     * @param state
     */
    /**
     * CanActivate checks if the user is logged in and get the full list of roles (REALM + CLIENT)
     * of the logged user. This values are set to authenticated and roles params.
     *
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    KeycloakAuthGuard.prototype.canActivate = /**
     * CanActivate checks if the user is logged in and get the full list of roles (REALM + CLIENT)
     * of the logged user. This values are set to authenticated and roles params.
     *
     * @param {?} route
     * @param {?} state
     * @return {?}
     */
    function (route, state) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        _a = this;
                        return [4 /*yield*/, this.keycloakAngular.isLoggedIn()];
                    case 1:
                        _a.authenticated = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.keycloakAngular.getUserRoles(true)];
                    case 2:
                        _b.roles = _c.sent();
                        return [4 /*yield*/, this.isAccessAllowed(route, state)];
                    case 3:
                        result = _c.sent();
                        resolve(result);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        reject('An error happened during access validation. Details:' + error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    return KeycloakAuthGuard;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/** @type {?} */
var Keycloak = Keycloak_;
/**
 * Service to expose existent methods from the Keycloak JS adapter, adding new
 * functionalities to improve the use of keycloak in Angular v > 4.3 applications.
 *
 * This class should be injected in the application bootstrap, so the same instance will be used
 * along the web application.
 */
var KeycloakService = /** @class */ (function () {
    function KeycloakService() {
        this._keycloakEvents$ = new Subject();
    }
    /**
     * Sanitizes the bearer prefix, preparing it to be appended to
     * the token.
     *
     * @param {?} bearerPrefix
     * Prefix to be appended to the authorization header as
     * Authorization: <bearer-prefix> <token>.
     * @return {?}
     * The bearer prefix sanitized, meaning that it will follow the bearerPrefix
     * param as described in the library initilization or the default value bearer,
     * with a space append in the end for the token concatenation.
     */
    KeycloakService.prototype.sanitizeBearerPrefix = /**
     * Sanitizes the bearer prefix, preparing it to be appended to
     * the token.
     *
     * @param {?} bearerPrefix
     * Prefix to be appended to the authorization header as
     * Authorization: <bearer-prefix> <token>.
     * @return {?}
     * The bearer prefix sanitized, meaning that it will follow the bearerPrefix
     * param as described in the library initilization or the default value bearer,
     * with a space append in the end for the token concatenation.
     */
    function (bearerPrefix) {
        /** @type {?} */
        var prefix = (bearerPrefix || 'bearer').trim();
        return prefix.concat(' ');
    };
    /**
     * Sets default value to true if it is undefined or null.
     *
     * @param {?} value - boolean value to be checked
     * @return {?}
     */
    KeycloakService.prototype.ifUndefinedIsTrue = /**
     * Sets default value to true if it is undefined or null.
     *
     * @param {?} value - boolean value to be checked
     * @return {?}
     */
    function (value) {
        /** @type {?} */
        var returnValue = value;
        if (returnValue === undefined || returnValue === null) {
            returnValue = true;
        }
        return returnValue;
    };
    /**
     * Binds the keycloak-js events to the keycloakEvents Subject
     * which is a good way to monitor for changes, if needed.
     *
     * The keycloakEvents returns the keycloak-js event type and any
     * argument if the source function provides any.
     * @return {?}
     */
    KeycloakService.prototype.bindsKeycloakEvents = /**
     * Binds the keycloak-js events to the keycloakEvents Subject
     * which is a good way to monitor for changes, if needed.
     *
     * The keycloakEvents returns the keycloak-js event type and any
     * argument if the source function provides any.
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this._instance) {
            console.warn('Keycloak Angular events could not be registered as the keycloak instance is undefined.');
            return;
        }
        this._instance.onAuthError = function (errorData) {
            _this._keycloakEvents$.next({ args: errorData, type: KeycloakEventType.OnAuthError });
        };
        this._instance.onAuthLogout = function () {
            _this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthLogout });
        };
        this._instance.onAuthRefreshError = function () {
            _this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthRefreshError });
        };
        this._instance.onAuthSuccess = function () {
            _this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthSuccess });
        };
        this._instance.onTokenExpired = function () {
            _this._keycloakEvents$.next({ type: KeycloakEventType.OnTokenExpired });
        };
        this._instance.onReady = function (authenticated) {
            _this._keycloakEvents$.next({ args: authenticated, type: KeycloakEventType.OnReady });
        };
    };
    /**
     * Keycloak initialization. It should be called to initialize the adapter.
     * Options is a object with 2 main parameters: config and initOptions. The first one
     * will be used to create the Keycloak instance. The second one are options to initialize the
     * keycloak instance.
     *
     * @param options
     * Config: may be a string representing the keycloak URI or an object with the
     * following content:
     * - url: Keycloak json URL
     * - realm: realm name
     * - clientId: client id
     *
     * initOptions:
     * - onLoad: Specifies an action to do on load. Supported values are 'login-required' or
     * 'check-sso'.
     * - token: Set an initial value for the token.
     * - refreshToken: Set an initial value for the refresh token.
     * - idToken: Set an initial value for the id token (only together with token or refreshToken).
     * - timeSkew: Set an initial value for skew between local time and Keycloak server in seconds
     * (only together with token or refreshToken).
     * - checkLoginIframe: Set to enable/disable monitoring login state (default is true).
     * - checkLoginIframeInterval: Set the interval to check login state (default is 5 seconds).
     * - responseMode: Set the OpenID Connect response mode send to Keycloak server at login
     * request. Valid values are query or fragment . Default value is fragment, which means
     * that after successful authentication will Keycloak redirect to javascript application
     * with OpenID Connect parameters added in URL fragment. This is generally safer and
     * recommended over query.
     * - flow: Set the OpenID Connect flow. Valid values are standard, implicit or hybrid.
     *
     * enableBearerInterceptor:
     * Flag to indicate if the bearer will added to the authorization header.
     *
     * loadUserProfileInStartUp:
     * Indicates that the user profile should be loaded at the keycloak initialization,
     * just after the login.
     *
     * bearerExcludedUrls:
     * String Array to exclude the urls that should not have the Authorization Header automatically
     * added.
     *
     * authorizationHeaderName:
     * This value will be used as the Authorization Http Header name.
     *
     * bearerPrefix:
     * This value will be included in the Authorization Http Header param.
     *
     * @returns
     * A Promise with a boolean indicating if the initialization was successful.
     */
    /**
     * Keycloak initialization. It should be called to initialize the adapter.
     * Options is a object with 2 main parameters: config and initOptions. The first one
     * will be used to create the Keycloak instance. The second one are options to initialize the
     * keycloak instance.
     *
     * @param {?=} options
     * Config: may be a string representing the keycloak URI or an object with the
     * following content:
     * - url: Keycloak json URL
     * - realm: realm name
     * - clientId: client id
     *
     * initOptions:
     * - onLoad: Specifies an action to do on load. Supported values are 'login-required' or
     * 'check-sso'.
     * - token: Set an initial value for the token.
     * - refreshToken: Set an initial value for the refresh token.
     * - idToken: Set an initial value for the id token (only together with token or refreshToken).
     * - timeSkew: Set an initial value for skew between local time and Keycloak server in seconds
     * (only together with token or refreshToken).
     * - checkLoginIframe: Set to enable/disable monitoring login state (default is true).
     * - checkLoginIframeInterval: Set the interval to check login state (default is 5 seconds).
     * - responseMode: Set the OpenID Connect response mode send to Keycloak server at login
     * request. Valid values are query or fragment . Default value is fragment, which means
     * that after successful authentication will Keycloak redirect to javascript application
     * with OpenID Connect parameters added in URL fragment. This is generally safer and
     * recommended over query.
     * - flow: Set the OpenID Connect flow. Valid values are standard, implicit or hybrid.
     *
     * enableBearerInterceptor:
     * Flag to indicate if the bearer will added to the authorization header.
     *
     * loadUserProfileInStartUp:
     * Indicates that the user profile should be loaded at the keycloak initialization,
     * just after the login.
     *
     * bearerExcludedUrls:
     * String Array to exclude the urls that should not have the Authorization Header automatically
     * added.
     *
     * authorizationHeaderName:
     * This value will be used as the Authorization Http Header name.
     *
     * bearerPrefix:
     * This value will be included in the Authorization Http Header param.
     *
     * @return {?}
     * A Promise with a boolean indicating if the initialization was successful.
     */
    KeycloakService.prototype.init = /**
     * Keycloak initialization. It should be called to initialize the adapter.
     * Options is a object with 2 main parameters: config and initOptions. The first one
     * will be used to create the Keycloak instance. The second one are options to initialize the
     * keycloak instance.
     *
     * @param {?=} options
     * Config: may be a string representing the keycloak URI or an object with the
     * following content:
     * - url: Keycloak json URL
     * - realm: realm name
     * - clientId: client id
     *
     * initOptions:
     * - onLoad: Specifies an action to do on load. Supported values are 'login-required' or
     * 'check-sso'.
     * - token: Set an initial value for the token.
     * - refreshToken: Set an initial value for the refresh token.
     * - idToken: Set an initial value for the id token (only together with token or refreshToken).
     * - timeSkew: Set an initial value for skew between local time and Keycloak server in seconds
     * (only together with token or refreshToken).
     * - checkLoginIframe: Set to enable/disable monitoring login state (default is true).
     * - checkLoginIframeInterval: Set the interval to check login state (default is 5 seconds).
     * - responseMode: Set the OpenID Connect response mode send to Keycloak server at login
     * request. Valid values are query or fragment . Default value is fragment, which means
     * that after successful authentication will Keycloak redirect to javascript application
     * with OpenID Connect parameters added in URL fragment. This is generally safer and
     * recommended over query.
     * - flow: Set the OpenID Connect flow. Valid values are standard, implicit or hybrid.
     *
     * enableBearerInterceptor:
     * Flag to indicate if the bearer will added to the authorization header.
     *
     * loadUserProfileInStartUp:
     * Indicates that the user profile should be loaded at the keycloak initialization,
     * just after the login.
     *
     * bearerExcludedUrls:
     * String Array to exclude the urls that should not have the Authorization Header automatically
     * added.
     *
     * authorizationHeaderName:
     * This value will be used as the Authorization Http Header name.
     *
     * bearerPrefix:
     * This value will be included in the Authorization Http Header param.
     *
     * @return {?}
     * A Promise with a boolean indicating if the initialization was successful.
     */
    function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            _this._enableBearerInterceptor = _this.ifUndefinedIsTrue(options.enableBearerInterceptor);
            _this._loadUserProfileAtStartUp = _this.ifUndefinedIsTrue(options.loadUserProfileAtStartUp);
            _this._bearerExcludedUrls = options.bearerExcludedUrls || [];
            _this._authorizationHeaderName = options.authorizationHeaderName || 'Authorization';
            _this._bearerPrefix = _this.sanitizeBearerPrefix(options.bearerPrefix);
            _this._silentRefresh = options.initOptions ? options.initOptions.flow === 'implicit' : false;
            _this._instance = Keycloak(options.config);
            _this.bindsKeycloakEvents();
            _this._instance
                .init(/** @type {?} */ ((options.initOptions)))
                .success(function (authenticated) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(authenticated && this._loadUserProfileAtStartUp)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadUserProfile()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            resolve(authenticated);
                            return [2 /*return*/];
                    }
                });
            }); })
                .error(function (error) {
                reject('An error happened during Keycloak initialization.');
            });
        });
    };
    /**
     * Redirects to login form on (options is an optional object with redirectUri and/or
     * prompt fields).
     *
     * @param options
     * Object, where:
     *  - redirectUri: Specifies the uri to redirect to after login.
     *  - prompt:By default the login screen is displayed if the user is not logged-in to Keycloak.
     * To only authenticate to the application if the user is already logged-in and not display the
     * login page if the user is not logged-in, set this option to none. To always require
     * re-authentication and ignore SSO, set this option to login .
     *  - maxAge: Used just if user is already authenticated. Specifies maximum time since the
     * authentication of user happened. If user is already authenticated for longer time than
     * maxAge, the SSO is ignored and he will need to re-authenticate again.
     *  - loginHint: Used to pre-fill the username/email field on the login form.
     *  - action: If value is 'register' then user is redirected to registration page, otherwise to
     * login page.
     *  - locale: Specifies the desired locale for the UI.
     * @returns
     * A void Promise if the login is successful and after the user profile loading.
     */
    /**
     * Redirects to login form on (options is an optional object with redirectUri and/or
     * prompt fields).
     *
     * @param {?=} options
     * Object, where:
     *  - redirectUri: Specifies the uri to redirect to after login.
     *  - prompt:By default the login screen is displayed if the user is not logged-in to Keycloak.
     * To only authenticate to the application if the user is already logged-in and not display the
     * login page if the user is not logged-in, set this option to none. To always require
     * re-authentication and ignore SSO, set this option to login .
     *  - maxAge: Used just if user is already authenticated. Specifies maximum time since the
     * authentication of user happened. If user is already authenticated for longer time than
     * maxAge, the SSO is ignored and he will need to re-authenticate again.
     *  - loginHint: Used to pre-fill the username/email field on the login form.
     *  - action: If value is 'register' then user is redirected to registration page, otherwise to
     * login page.
     *  - locale: Specifies the desired locale for the UI.
     * @return {?}
     * A void Promise if the login is successful and after the user profile loading.
     */
    KeycloakService.prototype.login = /**
     * Redirects to login form on (options is an optional object with redirectUri and/or
     * prompt fields).
     *
     * @param {?=} options
     * Object, where:
     *  - redirectUri: Specifies the uri to redirect to after login.
     *  - prompt:By default the login screen is displayed if the user is not logged-in to Keycloak.
     * To only authenticate to the application if the user is already logged-in and not display the
     * login page if the user is not logged-in, set this option to none. To always require
     * re-authentication and ignore SSO, set this option to login .
     *  - maxAge: Used just if user is already authenticated. Specifies maximum time since the
     * authentication of user happened. If user is already authenticated for longer time than
     * maxAge, the SSO is ignored and he will need to re-authenticate again.
     *  - loginHint: Used to pre-fill the username/email field on the login form.
     *  - action: If value is 'register' then user is redirected to registration page, otherwise to
     * login page.
     *  - locale: Specifies the desired locale for the UI.
     * @return {?}
     * A void Promise if the login is successful and after the user profile loading.
     */
    function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            _this._instance
                .login(options)
                .success(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this._loadUserProfileAtStartUp) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadUserProfile()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            resolve();
                            return [2 /*return*/];
                    }
                });
            }); })
                .error(function (error) {
                reject('An error happened during the login.');
            });
        });
    };
    /**
     * Redirects to logout.
     *
     * @param redirectUri
     * Specifies the uri to redirect to after logout.
     * @returns
     * A void Promise if the logout was successful, cleaning also the userProfile.
     */
    /**
     * Redirects to logout.
     *
     * @param {?=} redirectUri
     * Specifies the uri to redirect to after logout.
     * @return {?}
     * A void Promise if the logout was successful, cleaning also the userProfile.
     */
    KeycloakService.prototype.logout = /**
     * Redirects to logout.
     *
     * @param {?=} redirectUri
     * Specifies the uri to redirect to after logout.
     * @return {?}
     * A void Promise if the logout was successful, cleaning also the userProfile.
     */
    function (redirectUri) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            /** @type {?} */
            var options = {
                redirectUri: redirectUri
            };
            _this._instance
                .logout(options)
                .success(function () {
                _this._userProfile = /** @type {?} */ ((undefined));
                resolve();
            })
                .error(function (error) {
                reject('An error happened during logout.');
            });
        });
    };
    /**
     * Redirects to registration form. Shortcut for login with option
     * action = 'register'. Options are same as for the login method but 'action' is set to
     * 'register'.
     *
     * @param options
     * login options
     * @returns
     * A void Promise if the register flow was successful.
     */
    /**
     * Redirects to registration form. Shortcut for login with option
     * action = 'register'. Options are same as for the login method but 'action' is set to
     * 'register'.
     *
     * @param {?=} options
     * login options
     * @return {?}
     * A void Promise if the register flow was successful.
     */
    KeycloakService.prototype.register = /**
     * Redirects to registration form. Shortcut for login with option
     * action = 'register'. Options are same as for the login method but 'action' is set to
     * 'register'.
     *
     * @param {?=} options
     * login options
     * @return {?}
     * A void Promise if the register flow was successful.
     */
    function (options) {
        var _this = this;
        if (options === void 0) { options = { action: 'register' }; }
        return new Promise(function (resolve, reject) {
            _this._instance
                .register(options)
                .success(function () {
                resolve();
            })
                .error(function () {
                reject('An error happened during the register execution');
            });
        });
    };
    /**
     * Check if the user has access to the specified role. It will look for roles in
     * realm and clientId, but will not check if the user is logged in for better performance.
     *
     * @param role
     * role name
     * @returns
     * A boolean meaning if the user has the specified Role.
     */
    /**
     * Check if the user has access to the specified role. It will look for roles in
     * realm and clientId, but will not check if the user is logged in for better performance.
     *
     * @param {?} role
     * role name
     * @return {?}
     * A boolean meaning if the user has the specified Role.
     */
    KeycloakService.prototype.isUserInRole = /**
     * Check if the user has access to the specified role. It will look for roles in
     * realm and clientId, but will not check if the user is logged in for better performance.
     *
     * @param {?} role
     * role name
     * @return {?}
     * A boolean meaning if the user has the specified Role.
     */
    function (role) {
        /** @type {?} */
        var hasRole;
        hasRole = this._instance.hasResourceRole(role);
        if (!hasRole) {
            hasRole = this._instance.hasRealmRole(role);
        }
        return hasRole;
    };
    /**
     * Return the roles of the logged user. The allRoles parameter, with default value
     * true, will return the clientId and realm roles associated with the logged user. If set to false
     * it will only return the user roles associated with the clientId.
     *
     * @param allRoles
     * Flag to set if all roles should be returned.(Optional: default value is true)
     * @returns
     * Array of Roles associated with the logged user.
     */
    /**
     * Return the roles of the logged user. The allRoles parameter, with default value
     * true, will return the clientId and realm roles associated with the logged user. If set to false
     * it will only return the user roles associated with the clientId.
     *
     * @param {?=} allRoles
     * Flag to set if all roles should be returned.(Optional: default value is true)
     * @return {?}
     * Array of Roles associated with the logged user.
     */
    KeycloakService.prototype.getUserRoles = /**
     * Return the roles of the logged user. The allRoles parameter, with default value
     * true, will return the clientId and realm roles associated with the logged user. If set to false
     * it will only return the user roles associated with the clientId.
     *
     * @param {?=} allRoles
     * Flag to set if all roles should be returned.(Optional: default value is true)
     * @return {?}
     * Array of Roles associated with the logged user.
     */
    function (allRoles) {
        if (allRoles === void 0) { allRoles = true; }
        /** @type {?} */
        var roles = [];
        if (this._instance.resourceAccess) {
            for (var key in this._instance.resourceAccess) {
                if (this._instance.resourceAccess.hasOwnProperty(key)) {
                    /** @type {?} */
                    var resourceAccess = this._instance.resourceAccess[key];
                    /** @type {?} */
                    var clientRoles = resourceAccess['roles'] || [];
                    roles = roles.concat(clientRoles);
                }
            }
        }
        if (allRoles && this._instance.realmAccess) {
            /** @type {?} */
            var realmRoles = this._instance.realmAccess['roles'] || [];
            roles.push.apply(roles, __spread(realmRoles));
        }
        return roles;
    };
    /**
     * Check if user is logged in.
     *
     * @returns
     * A boolean that indicates if the user is logged in.
     */
    /**
     * Check if user is logged in.
     *
     * @return {?}
     * A boolean that indicates if the user is logged in.
     */
    KeycloakService.prototype.isLoggedIn = /**
     * Check if user is logged in.
     *
     * @return {?}
     * A boolean that indicates if the user is logged in.
     */
    function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updateToken(20)];
                    case 1:
                        _a.sent();
                        resolve(true);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        resolve(false);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns true if the token has less than minValidity seconds left before
     * it expires.
     *
     * @param minValidity
     * Seconds left. (minValidity) is optional. Default value is 0.
     * @returns
     * Boolean indicating if the token is expired.
     */
    /**
     * Returns true if the token has less than minValidity seconds left before
     * it expires.
     *
     * @param {?=} minValidity
     * Seconds left. (minValidity) is optional. Default value is 0.
     * @return {?}
     * Boolean indicating if the token is expired.
     */
    KeycloakService.prototype.isTokenExpired = /**
     * Returns true if the token has less than minValidity seconds left before
     * it expires.
     *
     * @param {?=} minValidity
     * Seconds left. (minValidity) is optional. Default value is 0.
     * @return {?}
     * Boolean indicating if the token is expired.
     */
    function (minValidity) {
        if (minValidity === void 0) { minValidity = 0; }
        return this._instance.isTokenExpired(minValidity);
    };
    /**
     * If the token expires within minValidity seconds the token is refreshed. If the
     * session status iframe is enabled, the session status is also checked.
     * Returns a promise telling if the token was refreshed or not. If the session is not active
     * anymore, the promise is rejected.
     *
     * @param minValidity
     * Seconds left. (minValidity is optional, if not specified 5 is used)
     * @returns
     * Promise with a boolean indicating if the token was succesfully updated.
     */
    /**
     * If the token expires within minValidity seconds the token is refreshed. If the
     * session status iframe is enabled, the session status is also checked.
     * Returns a promise telling if the token was refreshed or not. If the session is not active
     * anymore, the promise is rejected.
     *
     * @param {?=} minValidity
     * Seconds left. (minValidity is optional, if not specified 5 is used)
     * @return {?}
     * Promise with a boolean indicating if the token was succesfully updated.
     */
    KeycloakService.prototype.updateToken = /**
     * If the token expires within minValidity seconds the token is refreshed. If the
     * session status iframe is enabled, the session status is also checked.
     * Returns a promise telling if the token was refreshed or not. If the session is not active
     * anymore, the promise is rejected.
     *
     * @param {?=} minValidity
     * Seconds left. (minValidity is optional, if not specified 5 is used)
     * @return {?}
     * Promise with a boolean indicating if the token was succesfully updated.
     */
    function (minValidity) {
        var _this = this;
        if (minValidity === void 0) { minValidity = 5; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: this is a workaround until the silent refresh (issue #43)
                // is not implemented, avoiding the redirect loop.
                if (this._silentRefresh) {
                    if (this.isTokenExpired()) {
                        reject('Failed to refresh the token, or the session is expired');
                    }
                    else {
                        resolve(true);
                    }
                    return [2 /*return*/];
                }
                if (!this._instance) {
                    reject();
                    return [2 /*return*/];
                }
                this._instance
                    .updateToken(minValidity)
                    .success(function (refreshed) {
                    resolve(refreshed);
                })
                    .error(function (error) {
                    reject('Failed to refresh the token, or the session is expired');
                });
                return [2 /*return*/];
            });
        }); });
    };
    /**
     * Loads the users profile.
     * Returns promise to set functions to be invoked if the profile was loaded successfully, or if
     * the profile could not be loaded.
     *
     * @param forceReload
     * If true will force the loadUserProfile even if its already loaded.
     * @returns
     * A promise with the KeycloakProfile data loaded.
     */
    /**
     * Loads the users profile.
     * Returns promise to set functions to be invoked if the profile was loaded successfully, or if
     * the profile could not be loaded.
     *
     * @param {?=} forceReload
     * If true will force the loadUserProfile even if its already loaded.
     * @return {?}
     * A promise with the KeycloakProfile data loaded.
     */
    KeycloakService.prototype.loadUserProfile = /**
     * Loads the users profile.
     * Returns promise to set functions to be invoked if the profile was loaded successfully, or if
     * the profile could not be loaded.
     *
     * @param {?=} forceReload
     * If true will force the loadUserProfile even if its already loaded.
     * @return {?}
     * A promise with the KeycloakProfile data loaded.
     */
    function (forceReload) {
        var _this = this;
        if (forceReload === void 0) { forceReload = false; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._userProfile && !forceReload) {
                            resolve(this._userProfile);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.isLoggedIn()];
                    case 1:
                        if (!(_a.sent())) {
                            reject('The user profile was not loaded as the user is not logged in.');
                            return [2 /*return*/];
                        }
                        this._instance
                            .loadUserProfile()
                            .success(function (result) {
                            _this._userProfile = /** @type {?} */ (result);
                            resolve(_this._userProfile);
                        })
                            .error(function (err) {
                            reject('The user profile could not be loaded.');
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns the authenticated token, calling updateToken to get a refreshed one if
     * necessary. If the session is expired this method calls the login method for a new login.
     *
     * @returns
     * Promise with the generated token.
     */
    /**
     * Returns the authenticated token, calling updateToken to get a refreshed one if
     * necessary. If the session is expired this method calls the login method for a new login.
     *
     * @return {?}
     * Promise with the generated token.
     */
    KeycloakService.prototype.getToken = /**
     * Returns the authenticated token, calling updateToken to get a refreshed one if
     * necessary. If the session is expired this method calls the login method for a new login.
     *
     * @return {?}
     * Promise with the generated token.
     */
    function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.updateToken(10)];
                    case 1:
                        _a.sent();
                        // resolve(this._instance.token);
                        resolve(this._instance.refreshToken);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.login();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns the logged username.
     *
     * @returns
     * The logged username.
     */
    /**
     * Returns the logged username.
     *
     * @return {?}
     * The logged username.
     */
    KeycloakService.prototype.getUsername = /**
     * Returns the logged username.
     *
     * @return {?}
     * The logged username.
     */
    function () {
        if (!this._userProfile) {
            throw new Error('User not logged in or user profile was not loaded.');
        }
        return /** @type {?} */ ((this._userProfile.username));
    };
    /**
     * Clear authentication state, including tokens. This can be useful if application
     * has detected the session was expired, for example if updating token fails.
     * Invoking this results in onAuthLogout callback listener being invoked.
     */
    /**
     * Clear authentication state, including tokens. This can be useful if application
     * has detected the session was expired, for example if updating token fails.
     * Invoking this results in onAuthLogout callback listener being invoked.
     * @return {?}
     */
    KeycloakService.prototype.clearToken = /**
     * Clear authentication state, including tokens. This can be useful if application
     * has detected the session was expired, for example if updating token fails.
     * Invoking this results in onAuthLogout callback listener being invoked.
     * @return {?}
     */
    function () {
        this._instance.clearToken();
    };
    /**
     * Adds a valid token in header. The key & value format is:
     * Authorization Bearer <token>.
     * If the headers param is undefined it will create the Angular headers object.
     *
     * @param headers
     * Updated header with Authorization and Keycloak token.
     * @returns
     * An observable with with the HTTP Authorization header and the current token.
     */
    /**
     * Adds a valid token in header. The key & value format is:
     * Authorization Bearer <token>.
     * If the headers param is undefined it will create the Angular headers object.
     *
     * @param {?=} headersArg
     * @return {?}
     * An observable with with the HTTP Authorization header and the current token.
     */
    KeycloakService.prototype.addTokenToHeader = /**
     * Adds a valid token in header. The key & value format is:
     * Authorization Bearer <token>.
     * If the headers param is undefined it will create the Angular headers object.
     *
     * @param {?=} headersArg
     * @return {?}
     * An observable with with the HTTP Authorization header and the current token.
     */
    function (headersArg) {
        var _this = this;
        return Observable.create(function (observer) { return __awaiter(_this, void 0, void 0, function () {
            var headers, token, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = headersArg;
                        if (!headers) {
                            headers = new HttpHeaders();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getToken()];
                    case 2:
                        token = _a.sent();
                        headers = headers.set(this._authorizationHeaderName, this._bearerPrefix + token);
                        observer.next(headers);
                        observer.complete();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        observer.error(error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns the original Keycloak instance, if you need any customization that
     * this Angular service does not support yet. Use with caution.
     *
     * @returns
     * The KeycloakInstance from keycloak-js.
     */
    /**
     * Returns the original Keycloak instance, if you need any customization that
     * this Angular service does not support yet. Use with caution.
     *
     * @return {?}
     * The KeycloakInstance from keycloak-js.
     */
    KeycloakService.prototype.getKeycloakInstance = /**
     * Returns the original Keycloak instance, if you need any customization that
     * this Angular service does not support yet. Use with caution.
     *
     * @return {?}
     * The KeycloakInstance from keycloak-js.
     */
    function () {
        return this._instance;
    };
    Object.defineProperty(KeycloakService.prototype, "bearerExcludedUrls", {
        /**
         * Returns the excluded URLs that should not be considered by
         * the http interceptor which automatically adds the authorization header in the Http Request.
         *
         * @returns
         * The excluded urls that must not be intercepted by the KeycloakBearerInterceptor.
         */
        get: /**
         * Returns the excluded URLs that should not be considered by
         * the http interceptor which automatically adds the authorization header in the Http Request.
         *
         * @return {?}
         * The excluded urls that must not be intercepted by the KeycloakBearerInterceptor.
         */
        function () {
            return this._bearerExcludedUrls;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeycloakService.prototype, "enableBearerInterceptor", {
        /**
         * Flag to indicate if the bearer will be added to the authorization header.
         *
         * @returns
         * Returns if the bearer interceptor was set to be disabled.
         */
        get: /**
         * Flag to indicate if the bearer will be added to the authorization header.
         *
         * @return {?}
         * Returns if the bearer interceptor was set to be disabled.
         */
        function () {
            return this._enableBearerInterceptor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KeycloakService.prototype, "keycloakEvents$", {
        /**
         * Keycloak subject to monitor the events triggered by keycloak-js.
         * The following events as available (as described at keycloak docs -
         * https://www.keycloak.org/docs/latest/securing_apps/index.html#callback-events):
         * - OnAuthError
         * - OnAuthLogout
         * - OnAuthRefreshError
         * - OnAuthRefreshSuccess
         * - OnAuthSuccess
         * - OnReady
         * - OnTokenExpire
         * In each occurrence of any of these, this subject will return the event type,
         * described at {@link KeycloakEventType} enum and the function args from the keycloak-js
         * if provided any.
         *
         * @returns
         * A subject with the {@link KeycloakEvent} which describes the event type and attaches the
         * function args.
         */
        get: /**
         * Keycloak subject to monitor the events triggered by keycloak-js.
         * The following events as available (as described at keycloak docs -
         * https://www.keycloak.org/docs/latest/securing_apps/index.html#callback-events):
         * - OnAuthError
         * - OnAuthLogout
         * - OnAuthRefreshError
         * - OnAuthRefreshSuccess
         * - OnAuthSuccess
         * - OnReady
         * - OnTokenExpire
         * In each occurrence of any of these, this subject will return the event type,
         * described at {\@link KeycloakEventType} enum and the function args from the keycloak-js
         * if provided any.
         *
         * @return {?}
         * A subject with the {\@link KeycloakEvent} which describes the event type and attaches the
         * function args.
         */
        function () {
            return this._keycloakEvents$;
        },
        enumerable: true,
        configurable: true
    });
    KeycloakService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    KeycloakService.ctorParameters = function () { return []; };
    return KeycloakService;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * This interceptor includes the bearer by default in all HttpClient requests.
 *
 * If you need to exclude some URLs from adding the bearer, please, take a look
 * at the {\@link KeycloakOptions} bearerExcludedUrls property.
 */
var KeycloakBearerInterceptor = /** @class */ (function () {
    /**
     * KeycloakBearerInterceptor constructor.
     *
     * @param keycloak - Injected KeycloakService instance.
     */
    function KeycloakBearerInterceptor(keycloak) {
        this.keycloak = keycloak;
    }
    /**
     * @return {?}
     */
    KeycloakBearerInterceptor.prototype.loadExcludedUrlsRegex = /**
     * @return {?}
     */
    function () {
        /** @type {?} */
        var excludedUrls = this.keycloak.bearerExcludedUrls;
        this.excludedUrlsRegex = excludedUrls.map(function (urlPattern) { return new RegExp(urlPattern, 'i'); }) || [];
    };
    /**
     * Intercept implementation that checks if the request url matches the excludedUrls.
     * If not, adds the Authorization header to the request.
     *
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    KeycloakBearerInterceptor.prototype.intercept = /**
     * Intercept implementation that checks if the request url matches the excludedUrls.
     * If not, adds the Authorization header to the request.
     *
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    function (req, next) {
        // If keycloak service is not initialized yet, or the interceptor should not be execute
        if (!this.keycloak || !this.keycloak.enableBearerInterceptor) {
            return next.handle(req);
        }
        if (!this.excludedUrlsRegex) {
            this.loadExcludedUrlsRegex();
        }
        /** @type {?} */
        var urlRequest = req.url;
        /** @type {?} */
        var shallPass = !!this.excludedUrlsRegex.find(function (regex) { return regex.test(urlRequest); });
        if (shallPass) {
            return next.handle(req);
        }
        return this.keycloak.addTokenToHeader(req.headers).pipe(mergeMap(function (headersWithBearer) {
            /** @type {?} */
            var kcReq = req.clone({ headers: headersWithBearer });
            return next.handle(kcReq);
        }));
    };
    KeycloakBearerInterceptor.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    KeycloakBearerInterceptor.ctorParameters = function () { return [
        { type: KeycloakService }
    ]; };
    return KeycloakBearerInterceptor;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var CoreModule = /** @class */ (function () {
    function CoreModule() {
    }
    CoreModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                    providers: [
                        KeycloakService,
                        {
                            provide: HTTP_INTERCEPTORS,
                            useClass: KeycloakBearerInterceptor,
                            multi: true
                        }
                    ]
                },] },
    ];
    return CoreModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
var KeycloakAngularModule = /** @class */ (function () {
    function KeycloakAngularModule() {
    }
    KeycloakAngularModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CoreModule]
                },] },
    ];
    return KeycloakAngularModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { KeycloakEventType, KeycloakAuthGuard, KeycloakService, Keycloak, KeycloakBearerInterceptor, CoreModule, KeycloakAngularModule };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2xvYWstYW5ndWxhci5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8va2V5Y2xvYWstYW5ndWxhci9saWIvY29yZS9pbnRlcmZhY2VzL2tleWNsb2FrLWV2ZW50LnRzIiwibmc6Ly9rZXljbG9hay1hbmd1bGFyL2xpYi9jb3JlL3NlcnZpY2VzL2tleWNsb2FrLWF1dGgtZ3VhcmQudHMiLCJuZzovL2tleWNsb2FrLWFuZ3VsYXIvbGliL2NvcmUvc2VydmljZXMva2V5Y2xvYWsuc2VydmljZS50cyIsIm5nOi8va2V5Y2xvYWstYW5ndWxhci9saWIvY29yZS9pbnRlcmNlcHRvcnMva2V5Y2xvYWstYmVhcmVyLmludGVyY2VwdG9yLnRzIiwibmc6Ly9rZXljbG9hay1hbmd1bGFyL2xpYi9jb3JlL2NvcmUubW9kdWxlLnRzIiwibmc6Ly9rZXljbG9hay1hbmd1bGFyL2xpYi9rZXljbG9hay1hbmd1bGFyLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgTWF1cmljaW8gR2VtZWxsaSBWaWdvbG8gYW5kIGNvbnRyaWJ1dG9ycy5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9tYXVyaWNpb3ZpZ29sby9rZXljbG9hay1hbmd1bGFyL0xJQ0VOU0VcbiAqL1xuXG4vKipcbiAqIEtleWNsb2FrIGV2ZW50IHR5cGVzLCBhcyBkZXNjcmliZWQgYXQgdGhlIGtleWNsb2FrLWpzIGRvY3VtZW50YXRpb246XG4gKiBodHRwczovL3d3dy5rZXljbG9hay5vcmcvZG9jcy9sYXRlc3Qvc2VjdXJpbmdfYXBwcy9pbmRleC5odG1sI2NhbGxiYWNrLWV2ZW50c1xuICovXG5leHBvcnQgZW51bSBLZXljbG9ha0V2ZW50VHlwZSB7XG4gIC8qKlxuICAgKiBDYWxsZWQgaWYgdGhlcmUgd2FzIGFuIGVycm9yIGR1cmluZyBhdXRoZW50aWNhdGlvbi5cbiAgICovXG4gIE9uQXV0aEVycm9yLFxuICAvKipcbiAgICogQ2FsbGVkIGlmIHRoZSB1c2VyIGlzIGxvZ2dlZCBvdXRcbiAgICogKHdpbGwgb25seSBiZSBjYWxsZWQgaWYgdGhlIHNlc3Npb24gc3RhdHVzIGlmcmFtZSBpcyBlbmFibGVkLCBvciBpbiBDb3Jkb3ZhIG1vZGUpLlxuICAgKi9cbiAgT25BdXRoTG9nb3V0LFxuICAvKipcbiAgICogQ2FsbGVkIGlmIHRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSB0cnlpbmcgdG8gcmVmcmVzaCB0aGUgdG9rZW4uXG4gICAqL1xuICBPbkF1dGhSZWZyZXNoRXJyb3IsXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdG9rZW4gaXMgcmVmcmVzaGVkLlxuICAgKi9cbiAgT25BdXRoUmVmcmVzaFN1Y2Nlc3MsXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIHVzZXIgaXMgc3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWQuXG4gICAqL1xuICBPbkF1dGhTdWNjZXNzLFxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGFkYXB0ZXIgaXMgaW5pdGlhbGl6ZWQuXG4gICAqL1xuICBPblJlYWR5LFxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGFjY2VzcyB0b2tlbiBpcyBleHBpcmVkLiBJZiBhIHJlZnJlc2ggdG9rZW4gaXMgYXZhaWxhYmxlIHRoZSB0b2tlblxuICAgKiBjYW4gYmUgcmVmcmVzaGVkIHdpdGggdXBkYXRlVG9rZW4sIG9yIGluIGNhc2VzIHdoZXJlIGl0IGlzIG5vdCAodGhhdCBpcywgd2l0aCBpbXBsaWNpdCBmbG93KVxuICAgKiB5b3UgY2FuIHJlZGlyZWN0IHRvIGxvZ2luIHNjcmVlbiB0byBvYnRhaW4gYSBuZXcgYWNjZXNzIHRva2VuLlxuICAgKi9cbiAgT25Ub2tlbkV4cGlyZWRcbn1cblxuLyoqXG4gKiBTdHJ1Y3R1cmUgb2YgYW4gZXZlbnQgdHJpZ2dlcmVkIGJ5IEtleWNsb2FrLCBjb250YWlucyBpdCdzIHR5cGVcbiAqIGFuZCBhcmd1bWVudHMgKGlmIGFueSkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgS2V5Y2xvYWtFdmVudCB7XG4gIC8qKlxuICAgKiBFdmVudCB0eXBlIGFzIGRlc2NyaWJlZCBhdCB7QGxpbmsgS2V5Y2xvYWtFdmVudFR5cGV9LlxuICAgKi9cbiAgdHlwZTogS2V5Y2xvYWtFdmVudFR5cGU7XG4gIC8qKlxuICAgKiBBcmd1bWVudHMgZnJvbSB0aGUga2V5Y2xvYWstanMgZXZlbnQgZnVuY3Rpb24uXG4gICAqL1xuICBhcmdzPzogYW55O1xufVxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IE1hdXJpY2lvIEdlbWVsbGkgVmlnb2xvIGFuZCBjb250cmlidXRvcnMuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWF1cmljaW92aWdvbG8va2V5Y2xvYWstYW5ndWxhci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHsgQ2FuQWN0aXZhdGUsIFJvdXRlciwgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGVTbmFwc2hvdCB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEtleWNsb2FrU2VydmljZSB9IGZyb20gJy4va2V5Y2xvYWsuc2VydmljZSc7XG5cbi8qKlxuICogQSBzaW1wbGUgZ3VhcmQgaW1wbGVtZW50YXRpb24gb3V0IG9mIHRoZSBib3guIFRoaXMgY2xhc3Mgc2hvdWxkIGJlIGluaGVyaXRlZCBhbmRcbiAqIGltcGxlbWVudGVkIGJ5IHRoZSBhcHBsaWNhdGlvbi4gVGhlIG9ubHkgbWV0aG9kIHRoYXQgc2hvdWxkIGJlIGltcGxlbWVudGVkIGlzICNpc0FjY2Vzc0FsbG93ZWQuXG4gKiBUaGUgcmVhc29uIGZvciB0aGlzIGlzIHRoYXQgdGhlIGF1dGhvcml6YXRpb24gZmxvdyBpcyB1c3VhbGx5IG5vdCB1bmlxdWUsIHNvIGluIHRoaXMgd2F5IHlvdSB3aWxsXG4gKiBoYXZlIG1vcmUgZnJlZWRvbSB0byBjdXN0b21pemUgeW91ciBhdXRob3JpemF0aW9uIGZsb3cuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBLZXljbG9ha0F1dGhHdWFyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcbiAgLyoqXG4gICAqIEluZGljYXRlcyBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkIG9yIG5vdC5cbiAgICovXG4gIHByb3RlY3RlZCBhdXRoZW50aWNhdGVkOiBib29sZWFuO1xuICAvKipcbiAgICogUm9sZXMgb2YgdGhlIGxvZ2dlZCB1c2VyLiBJdCBjb250YWlucyB0aGUgY2xpZW50SWQgYW5kIHJlYWxtIHVzZXIgcm9sZXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgcm9sZXM6IHN0cmluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCByb3V0ZXI6IFJvdXRlciwgcHJvdGVjdGVkIGtleWNsb2FrQW5ndWxhcjogS2V5Y2xvYWtTZXJ2aWNlKSB7fVxuXG4gIC8qKlxuICAgKiBDYW5BY3RpdmF0ZSBjaGVja3MgaWYgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIGFuZCBnZXQgdGhlIGZ1bGwgbGlzdCBvZiByb2xlcyAoUkVBTE0gKyBDTElFTlQpXG4gICAqIG9mIHRoZSBsb2dnZWQgdXNlci4gVGhpcyB2YWx1ZXMgYXJlIHNldCB0byBhdXRoZW50aWNhdGVkIGFuZCByb2xlcyBwYXJhbXMuXG4gICAqXG4gICAqIEBwYXJhbSByb3V0ZVxuICAgKiBAcGFyYW0gc3RhdGVcbiAgICovXG4gIGNhbkFjdGl2YXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmF1dGhlbnRpY2F0ZWQgPSBhd2FpdCB0aGlzLmtleWNsb2FrQW5ndWxhci5pc0xvZ2dlZEluKCk7XG4gICAgICAgIHRoaXMucm9sZXMgPSBhd2FpdCB0aGlzLmtleWNsb2FrQW5ndWxhci5nZXRVc2VyUm9sZXModHJ1ZSk7XG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5pc0FjY2Vzc0FsbG93ZWQocm91dGUsIHN0YXRlKTtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmVqZWN0KCdBbiBlcnJvciBoYXBwZW5lZCBkdXJpbmcgYWNjZXNzIHZhbGlkYXRpb24uIERldGFpbHM6JyArIGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgeW91ciBvd24gY3VzdG9taXplZCBhdXRob3JpemF0aW9uIGZsb3cgaW4gdGhpcyBtZXRob2QuIEZyb20gaGVyZSB5b3UgYWxyZWFkeSBrbm93blxuICAgKiBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkICh0aGlzLmF1dGhlbnRpY2F0ZWQpIGFuZCB0aGUgdXNlciByb2xlcyAodGhpcy5yb2xlcykuXG4gICAqXG4gICAqIEBwYXJhbSByb3V0ZVxuICAgKiBAcGFyYW0gc3RhdGVcbiAgICovXG4gIGFic3RyYWN0IGlzQWNjZXNzQWxsb3dlZChcbiAgICByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgICBzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdFxuICApOiBQcm9taXNlPGJvb2xlYW4+O1xufVxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IE1hdXJpY2lvIEdlbWVsbGkgVmlnb2xvIGFuZCBjb250cmlidXRvcnMuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWF1cmljaW92aWdvbG8va2V5Y2xvYWstYW5ndWxhci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuLy8gV29ya2Fyb3VuZCBmb3Igcm9sbHVwIGxpYnJhcnkgYmVoYXZpb3VyLCBhcyBwb2ludGVkIG91dCBvbiBpc3N1ZSAjMTI2NyAoaHR0cHM6Ly9naXRodWIuY29tL3JvbGx1cC9yb2xsdXAvaXNzdWVzLzEyNjcpLlxuaW1wb3J0ICogYXMgS2V5Y2xvYWtfIGZyb20gJ2tleWNsb2FrLWpzJztcbmV4cG9ydCBjb25zdCBLZXljbG9hayA9IEtleWNsb2FrXztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgS2V5Y2xvYWtPcHRpb25zIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9rZXljbG9hay1vcHRpb25zJztcbmltcG9ydCB7IEtleWNsb2FrRXZlbnQsIEtleWNsb2FrRXZlbnRUeXBlIH0gZnJvbSAnLi4vaW50ZXJmYWNlcy9rZXljbG9hay1ldmVudCc7XG5cbi8qKlxuICogU2VydmljZSB0byBleHBvc2UgZXhpc3RlbnQgbWV0aG9kcyBmcm9tIHRoZSBLZXljbG9hayBKUyBhZGFwdGVyLCBhZGRpbmcgbmV3XG4gKiBmdW5jdGlvbmFsaXRpZXMgdG8gaW1wcm92ZSB0aGUgdXNlIG9mIGtleWNsb2FrIGluIEFuZ3VsYXIgdiA+IDQuMyBhcHBsaWNhdGlvbnMuXG4gKlxuICogVGhpcyBjbGFzcyBzaG91bGQgYmUgaW5qZWN0ZWQgaW4gdGhlIGFwcGxpY2F0aW9uIGJvb3RzdHJhcCwgc28gdGhlIHNhbWUgaW5zdGFuY2Ugd2lsbCBiZSB1c2VkXG4gKiBhbG9uZyB0aGUgd2ViIGFwcGxpY2F0aW9uLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgS2V5Y2xvYWtTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEtleWNsb2FrLWpzIGluc3RhbmNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfaW5zdGFuY2U6IEtleWNsb2FrLktleWNsb2FrSW5zdGFuY2U7XG4gIC8qKlxuICAgKiBVc2VyIHByb2ZpbGUgYXMgS2V5Y2xvYWtQcm9maWxlIGludGVyZmFjZS5cbiAgICovXG4gIHByaXZhdGUgX3VzZXJQcm9maWxlOiBLZXljbG9hay5LZXljbG9ha1Byb2ZpbGU7XG4gIC8qKlxuICAgKiBGbGFnIHRvIGluZGljYXRlIGlmIHRoZSBiZWFyZXIgd2lsbCBub3QgYmUgYWRkZWQgdG8gdGhlIGF1dGhvcml6YXRpb24gaGVhZGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfZW5hYmxlQmVhcmVySW50ZXJjZXB0b3I6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBXaGVuIHRoZSBpbXBsaWNpdCBmbG93IGlzIGNob29zZW4gdGhlcmUgbXVzdCBleGlzdCBhIHNpbGVudFJlZnJlc2gsIGFzIHRoZXJlIGlzXG4gICAqIG5vIHJlZnJlc2ggdG9rZW4uXG4gICAqL1xuICBwcml2YXRlIF9zaWxlbnRSZWZyZXNoOiBib29sZWFuO1xuICAvKipcbiAgICogSW5kaWNhdGVzIHRoYXQgdGhlIHVzZXIgcHJvZmlsZSBzaG91bGQgYmUgbG9hZGVkIGF0IHRoZSBrZXljbG9hayBpbml0aWFsaXphdGlvbixcbiAgICoganVzdCBhZnRlciB0aGUgbG9naW4uXG4gICAqL1xuICBwcml2YXRlIF9sb2FkVXNlclByb2ZpbGVBdFN0YXJ0VXA6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBUaGUgYmVhcmVyIHByZWZpeCB0aGF0IHdpbGwgYmUgYXBwZW5kZWQgdG8gdGhlIEF1dGhvcml6YXRpb24gSGVhZGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfYmVhcmVyUHJlZml4OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBWYWx1ZSB0aGF0IHdpbGwgYmUgdXNlZCBhcyB0aGUgQXV0aG9yaXphdGlvbiBIdHRwIEhlYWRlciBuYW1lLlxuICAgKi9cbiAgcHJpdmF0ZSBfYXV0aG9yaXphdGlvbkhlYWRlck5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFRoZSBleGNsdWRlZCB1cmxzIHBhdHRlcm5zIHRoYXQgbXVzdCBza2lwIHRoZSBLZXljbG9ha0JlYXJlckludGVyY2VwdG9yLlxuICAgKi9cbiAgcHJpdmF0ZSBfYmVhcmVyRXhjbHVkZWRVcmxzOiBzdHJpbmdbXTtcbiAgLyoqXG4gICAqIE9ic2VydmVyIGZvciB0aGUga2V5Y2xvYWsgZXZlbnRzXG4gICAqL1xuICBwcml2YXRlIF9rZXljbG9ha0V2ZW50cyQ6IFN1YmplY3Q8S2V5Y2xvYWtFdmVudD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fa2V5Y2xvYWtFdmVudHMkID0gbmV3IFN1YmplY3Q8S2V5Y2xvYWtFdmVudD4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTYW5pdGl6ZXMgdGhlIGJlYXJlciBwcmVmaXgsIHByZXBhcmluZyBpdCB0byBiZSBhcHBlbmRlZCB0b1xuICAgKiB0aGUgdG9rZW4uXG4gICAqXG4gICAqIEBwYXJhbSBiZWFyZXJQcmVmaXhcbiAgICogUHJlZml4IHRvIGJlIGFwcGVuZGVkIHRvIHRoZSBhdXRob3JpemF0aW9uIGhlYWRlciBhc1xuICAgKiBBdXRob3JpemF0aW9uOiA8YmVhcmVyLXByZWZpeD4gPHRva2VuPi5cbiAgICogQHJldHVybnNcbiAgICogVGhlIGJlYXJlciBwcmVmaXggc2FuaXRpemVkLCBtZWFuaW5nIHRoYXQgaXQgd2lsbCBmb2xsb3cgdGhlIGJlYXJlclByZWZpeFxuICAgKiBwYXJhbSBhcyBkZXNjcmliZWQgaW4gdGhlIGxpYnJhcnkgaW5pdGlsaXphdGlvbiBvciB0aGUgZGVmYXVsdCB2YWx1ZSBiZWFyZXIsXG4gICAqIHdpdGggYSBzcGFjZSBhcHBlbmQgaW4gdGhlIGVuZCBmb3IgdGhlIHRva2VuIGNvbmNhdGVuYXRpb24uXG4gICAqL1xuICBwcml2YXRlIHNhbml0aXplQmVhcmVyUHJlZml4KGJlYXJlclByZWZpeDogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcbiAgICBsZXQgcHJlZml4OiBzdHJpbmcgPSAoYmVhcmVyUHJlZml4IHx8ICdiZWFyZXInKS50cmltKCk7XG4gICAgcmV0dXJuIHByZWZpeC5jb25jYXQoJyAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGRlZmF1bHQgdmFsdWUgdG8gdHJ1ZSBpZiBpdCBpcyB1bmRlZmluZWQgb3IgbnVsbC5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIC0gYm9vbGVhbiB2YWx1ZSB0byBiZSBjaGVja2VkXG4gICAqL1xuICBwcml2YXRlIGlmVW5kZWZpbmVkSXNUcnVlKHZhbHVlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgbGV0IHJldHVyblZhbHVlOiBib29sZWFuID0gdmFsdWU7XG4gICAgaWYgKHJldHVyblZhbHVlID09PSB1bmRlZmluZWQgfHwgcmV0dXJuVmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIHRoZSBrZXljbG9hay1qcyBldmVudHMgdG8gdGhlIGtleWNsb2FrRXZlbnRzIFN1YmplY3RcbiAgICogd2hpY2ggaXMgYSBnb29kIHdheSB0byBtb25pdG9yIGZvciBjaGFuZ2VzLCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIFRoZSBrZXljbG9ha0V2ZW50cyByZXR1cm5zIHRoZSBrZXljbG9hay1qcyBldmVudCB0eXBlIGFuZCBhbnlcbiAgICogYXJndW1lbnQgaWYgdGhlIHNvdXJjZSBmdW5jdGlvbiBwcm92aWRlcyBhbnkuXG4gICAqL1xuICBwcml2YXRlIGJpbmRzS2V5Y2xvYWtFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnS2V5Y2xvYWsgQW5ndWxhciBldmVudHMgY291bGQgbm90IGJlIHJlZ2lzdGVyZWQgYXMgdGhlIGtleWNsb2FrIGluc3RhbmNlIGlzIHVuZGVmaW5lZC4nXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2luc3RhbmNlLm9uQXV0aEVycm9yID0gZXJyb3JEYXRhID0+IHtcbiAgICAgIHRoaXMuX2tleWNsb2FrRXZlbnRzJC5uZXh0KHsgYXJnczogZXJyb3JEYXRhLCB0eXBlOiBLZXljbG9ha0V2ZW50VHlwZS5PbkF1dGhFcnJvciB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5faW5zdGFuY2Uub25BdXRoTG9nb3V0ID0gKCkgPT4ge1xuICAgICAgdGhpcy5fa2V5Y2xvYWtFdmVudHMkLm5leHQoeyB0eXBlOiBLZXljbG9ha0V2ZW50VHlwZS5PbkF1dGhMb2dvdXQgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2luc3RhbmNlLm9uQXV0aFJlZnJlc2hFcnJvciA9ICgpID0+IHtcbiAgICAgIHRoaXMuX2tleWNsb2FrRXZlbnRzJC5uZXh0KHsgdHlwZTogS2V5Y2xvYWtFdmVudFR5cGUuT25BdXRoUmVmcmVzaEVycm9yIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl9pbnN0YW5jZS5vbkF1dGhTdWNjZXNzID0gKCkgPT4ge1xuICAgICAgdGhpcy5fa2V5Y2xvYWtFdmVudHMkLm5leHQoeyB0eXBlOiBLZXljbG9ha0V2ZW50VHlwZS5PbkF1dGhTdWNjZXNzIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl9pbnN0YW5jZS5vblRva2VuRXhwaXJlZCA9ICgpID0+IHtcbiAgICAgIHRoaXMuX2tleWNsb2FrRXZlbnRzJC5uZXh0KHsgdHlwZTogS2V5Y2xvYWtFdmVudFR5cGUuT25Ub2tlbkV4cGlyZWQgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2luc3RhbmNlLm9uUmVhZHkgPSBhdXRoZW50aWNhdGVkID0+IHtcbiAgICAgIHRoaXMuX2tleWNsb2FrRXZlbnRzJC5uZXh0KHsgYXJnczogYXV0aGVudGljYXRlZCwgdHlwZTogS2V5Y2xvYWtFdmVudFR5cGUuT25SZWFkeSB9KTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEtleWNsb2FrIGluaXRpYWxpemF0aW9uLiBJdCBzaG91bGQgYmUgY2FsbGVkIHRvIGluaXRpYWxpemUgdGhlIGFkYXB0ZXIuXG4gICAqIE9wdGlvbnMgaXMgYSBvYmplY3Qgd2l0aCAyIG1haW4gcGFyYW1ldGVyczogY29uZmlnIGFuZCBpbml0T3B0aW9ucy4gVGhlIGZpcnN0IG9uZVxuICAgKiB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIHRoZSBLZXljbG9hayBpbnN0YW5jZS4gVGhlIHNlY29uZCBvbmUgYXJlIG9wdGlvbnMgdG8gaW5pdGlhbGl6ZSB0aGVcbiAgICoga2V5Y2xvYWsgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqIENvbmZpZzogbWF5IGJlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUga2V5Y2xvYWsgVVJJIG9yIGFuIG9iamVjdCB3aXRoIHRoZVxuICAgKiBmb2xsb3dpbmcgY29udGVudDpcbiAgICogLSB1cmw6IEtleWNsb2FrIGpzb24gVVJMXG4gICAqIC0gcmVhbG06IHJlYWxtIG5hbWVcbiAgICogLSBjbGllbnRJZDogY2xpZW50IGlkXG4gICAqXG4gICAqIGluaXRPcHRpb25zOlxuICAgKiAtIG9uTG9hZDogU3BlY2lmaWVzIGFuIGFjdGlvbiB0byBkbyBvbiBsb2FkLiBTdXBwb3J0ZWQgdmFsdWVzIGFyZSAnbG9naW4tcmVxdWlyZWQnIG9yXG4gICAqICdjaGVjay1zc28nLlxuICAgKiAtIHRva2VuOiBTZXQgYW4gaW5pdGlhbCB2YWx1ZSBmb3IgdGhlIHRva2VuLlxuICAgKiAtIHJlZnJlc2hUb2tlbjogU2V0IGFuIGluaXRpYWwgdmFsdWUgZm9yIHRoZSByZWZyZXNoIHRva2VuLlxuICAgKiAtIGlkVG9rZW46IFNldCBhbiBpbml0aWFsIHZhbHVlIGZvciB0aGUgaWQgdG9rZW4gKG9ubHkgdG9nZXRoZXIgd2l0aCB0b2tlbiBvciByZWZyZXNoVG9rZW4pLlxuICAgKiAtIHRpbWVTa2V3OiBTZXQgYW4gaW5pdGlhbCB2YWx1ZSBmb3Igc2tldyBiZXR3ZWVuIGxvY2FsIHRpbWUgYW5kIEtleWNsb2FrIHNlcnZlciBpbiBzZWNvbmRzXG4gICAqIChvbmx5IHRvZ2V0aGVyIHdpdGggdG9rZW4gb3IgcmVmcmVzaFRva2VuKS5cbiAgICogLSBjaGVja0xvZ2luSWZyYW1lOiBTZXQgdG8gZW5hYmxlL2Rpc2FibGUgbW9uaXRvcmluZyBsb2dpbiBzdGF0ZSAoZGVmYXVsdCBpcyB0cnVlKS5cbiAgICogLSBjaGVja0xvZ2luSWZyYW1lSW50ZXJ2YWw6IFNldCB0aGUgaW50ZXJ2YWwgdG8gY2hlY2sgbG9naW4gc3RhdGUgKGRlZmF1bHQgaXMgNSBzZWNvbmRzKS5cbiAgICogLSByZXNwb25zZU1vZGU6IFNldCB0aGUgT3BlbklEIENvbm5lY3QgcmVzcG9uc2UgbW9kZSBzZW5kIHRvIEtleWNsb2FrIHNlcnZlciBhdCBsb2dpblxuICAgKiByZXF1ZXN0LiBWYWxpZCB2YWx1ZXMgYXJlIHF1ZXJ5IG9yIGZyYWdtZW50IC4gRGVmYXVsdCB2YWx1ZSBpcyBmcmFnbWVudCwgd2hpY2ggbWVhbnNcbiAgICogdGhhdCBhZnRlciBzdWNjZXNzZnVsIGF1dGhlbnRpY2F0aW9uIHdpbGwgS2V5Y2xvYWsgcmVkaXJlY3QgdG8gamF2YXNjcmlwdCBhcHBsaWNhdGlvblxuICAgKiB3aXRoIE9wZW5JRCBDb25uZWN0IHBhcmFtZXRlcnMgYWRkZWQgaW4gVVJMIGZyYWdtZW50LiBUaGlzIGlzIGdlbmVyYWxseSBzYWZlciBhbmRcbiAgICogcmVjb21tZW5kZWQgb3ZlciBxdWVyeS5cbiAgICogLSBmbG93OiBTZXQgdGhlIE9wZW5JRCBDb25uZWN0IGZsb3cuIFZhbGlkIHZhbHVlcyBhcmUgc3RhbmRhcmQsIGltcGxpY2l0IG9yIGh5YnJpZC5cbiAgICpcbiAgICogZW5hYmxlQmVhcmVySW50ZXJjZXB0b3I6XG4gICAqIEZsYWcgdG8gaW5kaWNhdGUgaWYgdGhlIGJlYXJlciB3aWxsIGFkZGVkIHRvIHRoZSBhdXRob3JpemF0aW9uIGhlYWRlci5cbiAgICpcbiAgICogbG9hZFVzZXJQcm9maWxlSW5TdGFydFVwOlxuICAgKiBJbmRpY2F0ZXMgdGhhdCB0aGUgdXNlciBwcm9maWxlIHNob3VsZCBiZSBsb2FkZWQgYXQgdGhlIGtleWNsb2FrIGluaXRpYWxpemF0aW9uLFxuICAgKiBqdXN0IGFmdGVyIHRoZSBsb2dpbi5cbiAgICpcbiAgICogYmVhcmVyRXhjbHVkZWRVcmxzOlxuICAgKiBTdHJpbmcgQXJyYXkgdG8gZXhjbHVkZSB0aGUgdXJscyB0aGF0IHNob3VsZCBub3QgaGF2ZSB0aGUgQXV0aG9yaXphdGlvbiBIZWFkZXIgYXV0b21hdGljYWxseVxuICAgKiBhZGRlZC5cbiAgICpcbiAgICogYXV0aG9yaXphdGlvbkhlYWRlck5hbWU6XG4gICAqIFRoaXMgdmFsdWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBBdXRob3JpemF0aW9uIEh0dHAgSGVhZGVyIG5hbWUuXG4gICAqXG4gICAqIGJlYXJlclByZWZpeDpcbiAgICogVGhpcyB2YWx1ZSB3aWxsIGJlIGluY2x1ZGVkIGluIHRoZSBBdXRob3JpemF0aW9uIEh0dHAgSGVhZGVyIHBhcmFtLlxuICAgKlxuICAgKiBAcmV0dXJuc1xuICAgKiBBIFByb21pc2Ugd2l0aCBhIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgaW5pdGlhbGl6YXRpb24gd2FzIHN1Y2Nlc3NmdWwuXG4gICAqL1xuICBpbml0KG9wdGlvbnM6IEtleWNsb2FrT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2VuYWJsZUJlYXJlckludGVyY2VwdG9yID0gdGhpcy5pZlVuZGVmaW5lZElzVHJ1ZShvcHRpb25zLmVuYWJsZUJlYXJlckludGVyY2VwdG9yKTtcbiAgICAgIHRoaXMuX2xvYWRVc2VyUHJvZmlsZUF0U3RhcnRVcCA9IHRoaXMuaWZVbmRlZmluZWRJc1RydWUob3B0aW9ucy5sb2FkVXNlclByb2ZpbGVBdFN0YXJ0VXApO1xuICAgICAgdGhpcy5fYmVhcmVyRXhjbHVkZWRVcmxzID0gb3B0aW9ucy5iZWFyZXJFeGNsdWRlZFVybHMgfHwgW107XG4gICAgICB0aGlzLl9hdXRob3JpemF0aW9uSGVhZGVyTmFtZSA9IG9wdGlvbnMuYXV0aG9yaXphdGlvbkhlYWRlck5hbWUgfHwgJ0F1dGhvcml6YXRpb24nO1xuICAgICAgdGhpcy5fYmVhcmVyUHJlZml4ID0gdGhpcy5zYW5pdGl6ZUJlYXJlclByZWZpeChvcHRpb25zLmJlYXJlclByZWZpeCk7XG4gICAgICB0aGlzLl9zaWxlbnRSZWZyZXNoID0gb3B0aW9ucy5pbml0T3B0aW9ucyA/IG9wdGlvbnMuaW5pdE9wdGlvbnMuZmxvdyA9PT0gJ2ltcGxpY2l0JyA6IGZhbHNlO1xuICAgICAgdGhpcy5faW5zdGFuY2UgPSBLZXljbG9hayhvcHRpb25zLmNvbmZpZyk7XG4gICAgICB0aGlzLmJpbmRzS2V5Y2xvYWtFdmVudHMoKTtcbiAgICAgIHRoaXMuX2luc3RhbmNlXG4gICAgICAgIC5pbml0KG9wdGlvbnMuaW5pdE9wdGlvbnMhKVxuICAgICAgICAuc3VjY2Vzcyhhc3luYyBhdXRoZW50aWNhdGVkID0+IHtcbiAgICAgICAgICBpZiAoYXV0aGVudGljYXRlZCAmJiB0aGlzLl9sb2FkVXNlclByb2ZpbGVBdFN0YXJ0VXApIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubG9hZFVzZXJQcm9maWxlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUoYXV0aGVudGljYXRlZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5lcnJvcihlcnJvciA9PiB7XG4gICAgICAgICAgcmVqZWN0KCdBbiBlcnJvciBoYXBwZW5lZCBkdXJpbmcgS2V5Y2xvYWsgaW5pdGlhbGl6YXRpb24uJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZGlyZWN0cyB0byBsb2dpbiBmb3JtIG9uIChvcHRpb25zIGlzIGFuIG9wdGlvbmFsIG9iamVjdCB3aXRoIHJlZGlyZWN0VXJpIGFuZC9vclxuICAgKiBwcm9tcHQgZmllbGRzKS5cbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnNcbiAgICogT2JqZWN0LCB3aGVyZTpcbiAgICogIC0gcmVkaXJlY3RVcmk6IFNwZWNpZmllcyB0aGUgdXJpIHRvIHJlZGlyZWN0IHRvIGFmdGVyIGxvZ2luLlxuICAgKiAgLSBwcm9tcHQ6QnkgZGVmYXVsdCB0aGUgbG9naW4gc2NyZWVuIGlzIGRpc3BsYXllZCBpZiB0aGUgdXNlciBpcyBub3QgbG9nZ2VkLWluIHRvIEtleWNsb2FrLlxuICAgKiBUbyBvbmx5IGF1dGhlbnRpY2F0ZSB0byB0aGUgYXBwbGljYXRpb24gaWYgdGhlIHVzZXIgaXMgYWxyZWFkeSBsb2dnZWQtaW4gYW5kIG5vdCBkaXNwbGF5IHRoZVxuICAgKiBsb2dpbiBwYWdlIGlmIHRoZSB1c2VyIGlzIG5vdCBsb2dnZWQtaW4sIHNldCB0aGlzIG9wdGlvbiB0byBub25lLiBUbyBhbHdheXMgcmVxdWlyZVxuICAgKiByZS1hdXRoZW50aWNhdGlvbiBhbmQgaWdub3JlIFNTTywgc2V0IHRoaXMgb3B0aW9uIHRvIGxvZ2luIC5cbiAgICogIC0gbWF4QWdlOiBVc2VkIGp1c3QgaWYgdXNlciBpcyBhbHJlYWR5IGF1dGhlbnRpY2F0ZWQuIFNwZWNpZmllcyBtYXhpbXVtIHRpbWUgc2luY2UgdGhlXG4gICAqIGF1dGhlbnRpY2F0aW9uIG9mIHVzZXIgaGFwcGVuZWQuIElmIHVzZXIgaXMgYWxyZWFkeSBhdXRoZW50aWNhdGVkIGZvciBsb25nZXIgdGltZSB0aGFuXG4gICAqIG1heEFnZSwgdGhlIFNTTyBpcyBpZ25vcmVkIGFuZCBoZSB3aWxsIG5lZWQgdG8gcmUtYXV0aGVudGljYXRlIGFnYWluLlxuICAgKiAgLSBsb2dpbkhpbnQ6IFVzZWQgdG8gcHJlLWZpbGwgdGhlIHVzZXJuYW1lL2VtYWlsIGZpZWxkIG9uIHRoZSBsb2dpbiBmb3JtLlxuICAgKiAgLSBhY3Rpb246IElmIHZhbHVlIGlzICdyZWdpc3RlcicgdGhlbiB1c2VyIGlzIHJlZGlyZWN0ZWQgdG8gcmVnaXN0cmF0aW9uIHBhZ2UsIG90aGVyd2lzZSB0b1xuICAgKiBsb2dpbiBwYWdlLlxuICAgKiAgLSBsb2NhbGU6IFNwZWNpZmllcyB0aGUgZGVzaXJlZCBsb2NhbGUgZm9yIHRoZSBVSS5cbiAgICogQHJldHVybnNcbiAgICogQSB2b2lkIFByb21pc2UgaWYgdGhlIGxvZ2luIGlzIHN1Y2Nlc3NmdWwgYW5kIGFmdGVyIHRoZSB1c2VyIHByb2ZpbGUgbG9hZGluZy5cbiAgICovXG4gIGxvZ2luKG9wdGlvbnM6IEtleWNsb2FrLktleWNsb2FrTG9naW5PcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5faW5zdGFuY2VcbiAgICAgICAgLmxvZ2luKG9wdGlvbnMpXG4gICAgICAgIC5zdWNjZXNzKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5fbG9hZFVzZXJQcm9maWxlQXRTdGFydFVwKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRVc2VyUHJvZmlsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5lcnJvcihlcnJvciA9PiB7XG4gICAgICAgICAgcmVqZWN0KCdBbiBlcnJvciBoYXBwZW5lZCBkdXJpbmcgdGhlIGxvZ2luLicpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWRpcmVjdHMgdG8gbG9nb3V0LlxuICAgKlxuICAgKiBAcGFyYW0gcmVkaXJlY3RVcmlcbiAgICogU3BlY2lmaWVzIHRoZSB1cmkgdG8gcmVkaXJlY3QgdG8gYWZ0ZXIgbG9nb3V0LlxuICAgKiBAcmV0dXJuc1xuICAgKiBBIHZvaWQgUHJvbWlzZSBpZiB0aGUgbG9nb3V0IHdhcyBzdWNjZXNzZnVsLCBjbGVhbmluZyBhbHNvIHRoZSB1c2VyUHJvZmlsZS5cbiAgICovXG4gIGxvZ291dChyZWRpcmVjdFVyaT86IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zOiBhbnkgPSB7XG4gICAgICAgIHJlZGlyZWN0VXJpXG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9pbnN0YW5jZVxuICAgICAgICAubG9nb3V0KG9wdGlvbnMpXG4gICAgICAgIC5zdWNjZXNzKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl91c2VyUHJvZmlsZSA9IHVuZGVmaW5lZCE7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuZXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgIHJlamVjdCgnQW4gZXJyb3IgaGFwcGVuZWQgZHVyaW5nIGxvZ291dC4nKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVkaXJlY3RzIHRvIHJlZ2lzdHJhdGlvbiBmb3JtLiBTaG9ydGN1dCBmb3IgbG9naW4gd2l0aCBvcHRpb25cbiAgICogYWN0aW9uID0gJ3JlZ2lzdGVyJy4gT3B0aW9ucyBhcmUgc2FtZSBhcyBmb3IgdGhlIGxvZ2luIG1ldGhvZCBidXQgJ2FjdGlvbicgaXMgc2V0IHRvXG4gICAqICdyZWdpc3RlcicuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqIGxvZ2luIG9wdGlvbnNcbiAgICogQHJldHVybnNcbiAgICogQSB2b2lkIFByb21pc2UgaWYgdGhlIHJlZ2lzdGVyIGZsb3cgd2FzIHN1Y2Nlc3NmdWwuXG4gICAqL1xuICByZWdpc3RlcihvcHRpb25zOiBLZXljbG9hay5LZXljbG9ha0xvZ2luT3B0aW9ucyA9IHsgYWN0aW9uOiAncmVnaXN0ZXInIH0pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5faW5zdGFuY2VcbiAgICAgICAgLnJlZ2lzdGVyKG9wdGlvbnMpXG4gICAgICAgIC5zdWNjZXNzKCgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5lcnJvcigoKSA9PiB7XG4gICAgICAgICAgcmVqZWN0KCdBbiBlcnJvciBoYXBwZW5lZCBkdXJpbmcgdGhlIHJlZ2lzdGVyIGV4ZWN1dGlvbicpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgdXNlciBoYXMgYWNjZXNzIHRvIHRoZSBzcGVjaWZpZWQgcm9sZS4gSXQgd2lsbCBsb29rIGZvciByb2xlcyBpblxuICAgKiByZWFsbSBhbmQgY2xpZW50SWQsIGJ1dCB3aWxsIG5vdCBjaGVjayBpZiB0aGUgdXNlciBpcyBsb2dnZWQgaW4gZm9yIGJldHRlciBwZXJmb3JtYW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHJvbGVcbiAgICogcm9sZSBuYW1lXG4gICAqIEByZXR1cm5zXG4gICAqIEEgYm9vbGVhbiBtZWFuaW5nIGlmIHRoZSB1c2VyIGhhcyB0aGUgc3BlY2lmaWVkIFJvbGUuXG4gICAqL1xuICBpc1VzZXJJblJvbGUocm9sZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgbGV0IGhhc1JvbGU6IGJvb2xlYW47XG4gICAgaGFzUm9sZSA9IHRoaXMuX2luc3RhbmNlLmhhc1Jlc291cmNlUm9sZShyb2xlKTtcbiAgICBpZiAoIWhhc1JvbGUpIHtcbiAgICAgIGhhc1JvbGUgPSB0aGlzLl9pbnN0YW5jZS5oYXNSZWFsbVJvbGUocm9sZSk7XG4gICAgfVxuICAgIHJldHVybiBoYXNSb2xlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgcm9sZXMgb2YgdGhlIGxvZ2dlZCB1c2VyLiBUaGUgYWxsUm9sZXMgcGFyYW1ldGVyLCB3aXRoIGRlZmF1bHQgdmFsdWVcbiAgICogdHJ1ZSwgd2lsbCByZXR1cm4gdGhlIGNsaWVudElkIGFuZCByZWFsbSByb2xlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGxvZ2dlZCB1c2VyLiBJZiBzZXQgdG8gZmFsc2VcbiAgICogaXQgd2lsbCBvbmx5IHJldHVybiB0aGUgdXNlciByb2xlcyBhc3NvY2lhdGVkIHdpdGggdGhlIGNsaWVudElkLlxuICAgKlxuICAgKiBAcGFyYW0gYWxsUm9sZXNcbiAgICogRmxhZyB0byBzZXQgaWYgYWxsIHJvbGVzIHNob3VsZCBiZSByZXR1cm5lZC4oT3B0aW9uYWw6IGRlZmF1bHQgdmFsdWUgaXMgdHJ1ZSlcbiAgICogQHJldHVybnNcbiAgICogQXJyYXkgb2YgUm9sZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBsb2dnZWQgdXNlci5cbiAgICovXG4gIGdldFVzZXJSb2xlcyhhbGxSb2xlczogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJvbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGlmICh0aGlzLl9pbnN0YW5jZS5yZXNvdXJjZUFjY2Vzcykge1xuICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5faW5zdGFuY2UucmVzb3VyY2VBY2Nlc3MpIHtcbiAgICAgICAgaWYgKHRoaXMuX2luc3RhbmNlLnJlc291cmNlQWNjZXNzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBjb25zdCByZXNvdXJjZUFjY2VzczogYW55ID0gdGhpcy5faW5zdGFuY2UucmVzb3VyY2VBY2Nlc3Nba2V5XTtcbiAgICAgICAgICBjb25zdCBjbGllbnRSb2xlcyA9IHJlc291cmNlQWNjZXNzWydyb2xlcyddIHx8IFtdO1xuICAgICAgICAgIHJvbGVzID0gcm9sZXMuY29uY2F0KGNsaWVudFJvbGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWxsUm9sZXMgJiYgdGhpcy5faW5zdGFuY2UucmVhbG1BY2Nlc3MpIHtcbiAgICAgIGxldCByZWFsbVJvbGVzID0gdGhpcy5faW5zdGFuY2UucmVhbG1BY2Nlc3NbJ3JvbGVzJ10gfHwgW107XG4gICAgICByb2xlcy5wdXNoKC4uLnJlYWxtUm9sZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcm9sZXM7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdXNlciBpcyBsb2dnZWQgaW4uXG4gICAqXG4gICAqIEByZXR1cm5zXG4gICAqIEEgYm9vbGVhbiB0aGF0IGluZGljYXRlcyBpZiB0aGUgdXNlciBpcyBsb2dnZWQgaW4uXG4gICAqL1xuICBpc0xvZ2dlZEluKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVRva2VuKDIwKTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdG9rZW4gaGFzIGxlc3MgdGhhbiBtaW5WYWxpZGl0eSBzZWNvbmRzIGxlZnQgYmVmb3JlXG4gICAqIGl0IGV4cGlyZXMuXG4gICAqXG4gICAqIEBwYXJhbSBtaW5WYWxpZGl0eVxuICAgKiBTZWNvbmRzIGxlZnQuIChtaW5WYWxpZGl0eSkgaXMgb3B0aW9uYWwuIERlZmF1bHQgdmFsdWUgaXMgMC5cbiAgICogQHJldHVybnNcbiAgICogQm9vbGVhbiBpbmRpY2F0aW5nIGlmIHRoZSB0b2tlbiBpcyBleHBpcmVkLlxuICAgKi9cbiAgaXNUb2tlbkV4cGlyZWQobWluVmFsaWRpdHk6IG51bWJlciA9IDApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faW5zdGFuY2UuaXNUb2tlbkV4cGlyZWQobWluVmFsaWRpdHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSB0b2tlbiBleHBpcmVzIHdpdGhpbiBtaW5WYWxpZGl0eSBzZWNvbmRzIHRoZSB0b2tlbiBpcyByZWZyZXNoZWQuIElmIHRoZVxuICAgKiBzZXNzaW9uIHN0YXR1cyBpZnJhbWUgaXMgZW5hYmxlZCwgdGhlIHNlc3Npb24gc3RhdHVzIGlzIGFsc28gY2hlY2tlZC5cbiAgICogUmV0dXJucyBhIHByb21pc2UgdGVsbGluZyBpZiB0aGUgdG9rZW4gd2FzIHJlZnJlc2hlZCBvciBub3QuIElmIHRoZSBzZXNzaW9uIGlzIG5vdCBhY3RpdmVcbiAgICogYW55bW9yZSwgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSBtaW5WYWxpZGl0eVxuICAgKiBTZWNvbmRzIGxlZnQuIChtaW5WYWxpZGl0eSBpcyBvcHRpb25hbCwgaWYgbm90IHNwZWNpZmllZCA1IGlzIHVzZWQpXG4gICAqIEByZXR1cm5zXG4gICAqIFByb21pc2Ugd2l0aCBhIGJvb2xlYW4gaW5kaWNhdGluZyBpZiB0aGUgdG9rZW4gd2FzIHN1Y2Nlc2Z1bGx5IHVwZGF0ZWQuXG4gICAqL1xuICB1cGRhdGVUb2tlbihtaW5WYWxpZGl0eTogbnVtYmVyID0gNSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBUT0RPOiB0aGlzIGlzIGEgd29ya2Fyb3VuZCB1bnRpbCB0aGUgc2lsZW50IHJlZnJlc2ggKGlzc3VlICM0MylcbiAgICAgIC8vIGlzIG5vdCBpbXBsZW1lbnRlZCwgYXZvaWRpbmcgdGhlIHJlZGlyZWN0IGxvb3AuXG4gICAgICBpZiAodGhpcy5fc2lsZW50UmVmcmVzaCkge1xuICAgICAgICBpZiAodGhpcy5pc1Rva2VuRXhwaXJlZCgpKSB7XG4gICAgICAgICAgcmVqZWN0KCdGYWlsZWQgdG8gcmVmcmVzaCB0aGUgdG9rZW4sIG9yIHRoZSBzZXNzaW9uIGlzIGV4cGlyZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xuICAgICAgICByZWplY3QoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pbnN0YW5jZVxuICAgICAgICAudXBkYXRlVG9rZW4obWluVmFsaWRpdHkpXG4gICAgICAgIC5zdWNjZXNzKHJlZnJlc2hlZCA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShyZWZyZXNoZWQpO1xuICAgICAgICB9KVxuICAgICAgICAuZXJyb3IoZXJyb3IgPT4ge1xuICAgICAgICAgIHJlamVjdCgnRmFpbGVkIHRvIHJlZnJlc2ggdGhlIHRva2VuLCBvciB0aGUgc2Vzc2lvbiBpcyBleHBpcmVkJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIHRoZSB1c2VycyBwcm9maWxlLlxuICAgKiBSZXR1cm5zIHByb21pc2UgdG8gc2V0IGZ1bmN0aW9ucyB0byBiZSBpbnZva2VkIGlmIHRoZSBwcm9maWxlIHdhcyBsb2FkZWQgc3VjY2Vzc2Z1bGx5LCBvciBpZlxuICAgKiB0aGUgcHJvZmlsZSBjb3VsZCBub3QgYmUgbG9hZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gZm9yY2VSZWxvYWRcbiAgICogSWYgdHJ1ZSB3aWxsIGZvcmNlIHRoZSBsb2FkVXNlclByb2ZpbGUgZXZlbiBpZiBpdHMgYWxyZWFkeSBsb2FkZWQuXG4gICAqIEByZXR1cm5zXG4gICAqIEEgcHJvbWlzZSB3aXRoIHRoZSBLZXljbG9ha1Byb2ZpbGUgZGF0YSBsb2FkZWQuXG4gICAqL1xuICBsb2FkVXNlclByb2ZpbGUoZm9yY2VSZWxvYWQ6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8S2V5Y2xvYWsuS2V5Y2xvYWtQcm9maWxlPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0aGlzLl91c2VyUHJvZmlsZSAmJiAhZm9yY2VSZWxvYWQpIHtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLl91c2VyUHJvZmlsZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCEoYXdhaXQgdGhpcy5pc0xvZ2dlZEluKCkpKSB7XG4gICAgICAgIHJlamVjdCgnVGhlIHVzZXIgcHJvZmlsZSB3YXMgbm90IGxvYWRlZCBhcyB0aGUgdXNlciBpcyBub3QgbG9nZ2VkIGluLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2luc3RhbmNlXG4gICAgICAgIC5sb2FkVXNlclByb2ZpbGUoKVxuICAgICAgICAuc3VjY2VzcyhyZXN1bHQgPT4ge1xuICAgICAgICAgIHRoaXMuX3VzZXJQcm9maWxlID0gcmVzdWx0IGFzIEtleWNsb2FrLktleWNsb2FrUHJvZmlsZTtcbiAgICAgICAgICByZXNvbHZlKHRoaXMuX3VzZXJQcm9maWxlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmVycm9yKGVyciA9PiB7XG4gICAgICAgICAgcmVqZWN0KCdUaGUgdXNlciBwcm9maWxlIGNvdWxkIG5vdCBiZSBsb2FkZWQuJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGF1dGhlbnRpY2F0ZWQgdG9rZW4sIGNhbGxpbmcgdXBkYXRlVG9rZW4gdG8gZ2V0IGEgcmVmcmVzaGVkIG9uZSBpZlxuICAgKiBuZWNlc3NhcnkuIElmIHRoZSBzZXNzaW9uIGlzIGV4cGlyZWQgdGhpcyBtZXRob2QgY2FsbHMgdGhlIGxvZ2luIG1ldGhvZCBmb3IgYSBuZXcgbG9naW4uXG4gICAqXG4gICAqIEByZXR1cm5zXG4gICAqIFByb21pc2Ugd2l0aCB0aGUgZ2VuZXJhdGVkIHRva2VuLlxuICAgKi9cbiAgZ2V0VG9rZW4oKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVUb2tlbigxMCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5faW5zdGFuY2UudG9rZW4pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5sb2dpbigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxvZ2dlZCB1c2VybmFtZS5cbiAgICpcbiAgICogQHJldHVybnNcbiAgICogVGhlIGxvZ2dlZCB1c2VybmFtZS5cbiAgICovXG4gIGdldFVzZXJuYW1lKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLl91c2VyUHJvZmlsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VyIG5vdCBsb2dnZWQgaW4gb3IgdXNlciBwcm9maWxlIHdhcyBub3QgbG9hZGVkLicpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl91c2VyUHJvZmlsZS51c2VybmFtZSE7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgYXV0aGVudGljYXRpb24gc3RhdGUsIGluY2x1ZGluZyB0b2tlbnMuIFRoaXMgY2FuIGJlIHVzZWZ1bCBpZiBhcHBsaWNhdGlvblxuICAgKiBoYXMgZGV0ZWN0ZWQgdGhlIHNlc3Npb24gd2FzIGV4cGlyZWQsIGZvciBleGFtcGxlIGlmIHVwZGF0aW5nIHRva2VuIGZhaWxzLlxuICAgKiBJbnZva2luZyB0aGlzIHJlc3VsdHMgaW4gb25BdXRoTG9nb3V0IGNhbGxiYWNrIGxpc3RlbmVyIGJlaW5nIGludm9rZWQuXG4gICAqL1xuICBjbGVhclRva2VuKCk6IHZvaWQge1xuICAgIHRoaXMuX2luc3RhbmNlLmNsZWFyVG9rZW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgdmFsaWQgdG9rZW4gaW4gaGVhZGVyLiBUaGUga2V5ICYgdmFsdWUgZm9ybWF0IGlzOlxuICAgKiBBdXRob3JpemF0aW9uIEJlYXJlciA8dG9rZW4+LlxuICAgKiBJZiB0aGUgaGVhZGVycyBwYXJhbSBpcyB1bmRlZmluZWQgaXQgd2lsbCBjcmVhdGUgdGhlIEFuZ3VsYXIgaGVhZGVycyBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSBoZWFkZXJzXG4gICAqIFVwZGF0ZWQgaGVhZGVyIHdpdGggQXV0aG9yaXphdGlvbiBhbmQgS2V5Y2xvYWsgdG9rZW4uXG4gICAqIEByZXR1cm5zXG4gICAqIEFuIG9ic2VydmFibGUgd2l0aCB3aXRoIHRoZSBIVFRQIEF1dGhvcml6YXRpb24gaGVhZGVyIGFuZCB0aGUgY3VycmVudCB0b2tlbi5cbiAgICovXG4gIGFkZFRva2VuVG9IZWFkZXIoaGVhZGVyc0FyZz86IEh0dHBIZWFkZXJzKTogT2JzZXJ2YWJsZTxIdHRwSGVhZGVycz4ge1xuICAgIHJldHVybiBPYnNlcnZhYmxlLmNyZWF0ZShhc3luYyAob2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4pID0+IHtcbiAgICAgIGxldCBoZWFkZXJzID0gaGVhZGVyc0FyZztcbiAgICAgIGlmICghaGVhZGVycykge1xuICAgICAgICBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0b2tlbjogc3RyaW5nID0gYXdhaXQgdGhpcy5nZXRUb2tlbigpO1xuICAgICAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQodGhpcy5fYXV0aG9yaXphdGlvbkhlYWRlck5hbWUsIHRoaXMuX2JlYXJlclByZWZpeCArIHRva2VuKTtcbiAgICAgICAgb2JzZXJ2ZXIubmV4dChoZWFkZXJzKTtcbiAgICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCBLZXljbG9hayBpbnN0YW5jZSwgaWYgeW91IG5lZWQgYW55IGN1c3RvbWl6YXRpb24gdGhhdFxuICAgKiB0aGlzIEFuZ3VsYXIgc2VydmljZSBkb2VzIG5vdCBzdXBwb3J0IHlldC4gVXNlIHdpdGggY2F1dGlvbi5cbiAgICpcbiAgICogQHJldHVybnNcbiAgICogVGhlIEtleWNsb2FrSW5zdGFuY2UgZnJvbSBrZXljbG9hay1qcy5cbiAgICovXG4gIGdldEtleWNsb2FrSW5zdGFuY2UoKTogS2V5Y2xvYWsuS2V5Y2xvYWtJbnN0YW5jZSB7XG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGV4Y2x1ZGVkIFVSTHMgdGhhdCBzaG91bGQgbm90IGJlIGNvbnNpZGVyZWQgYnlcbiAgICogdGhlIGh0dHAgaW50ZXJjZXB0b3Igd2hpY2ggYXV0b21hdGljYWxseSBhZGRzIHRoZSBhdXRob3JpemF0aW9uIGhlYWRlciBpbiB0aGUgSHR0cCBSZXF1ZXN0LlxuICAgKlxuICAgKiBAcmV0dXJuc1xuICAgKiBUaGUgZXhjbHVkZWQgdXJscyB0aGF0IG11c3Qgbm90IGJlIGludGVyY2VwdGVkIGJ5IHRoZSBLZXljbG9ha0JlYXJlckludGVyY2VwdG9yLlxuICAgKi9cbiAgZ2V0IGJlYXJlckV4Y2x1ZGVkVXJscygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2JlYXJlckV4Y2x1ZGVkVXJscztcbiAgfVxuXG4gIC8qKlxuICAgKiBGbGFnIHRvIGluZGljYXRlIGlmIHRoZSBiZWFyZXIgd2lsbCBiZSBhZGRlZCB0byB0aGUgYXV0aG9yaXphdGlvbiBoZWFkZXIuXG4gICAqXG4gICAqIEByZXR1cm5zXG4gICAqIFJldHVybnMgaWYgdGhlIGJlYXJlciBpbnRlcmNlcHRvciB3YXMgc2V0IHRvIGJlIGRpc2FibGVkLlxuICAgKi9cbiAgZ2V0IGVuYWJsZUJlYXJlckludGVyY2VwdG9yKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVCZWFyZXJJbnRlcmNlcHRvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBLZXljbG9hayBzdWJqZWN0IHRvIG1vbml0b3IgdGhlIGV2ZW50cyB0cmlnZ2VyZWQgYnkga2V5Y2xvYWstanMuXG4gICAqIFRoZSBmb2xsb3dpbmcgZXZlbnRzIGFzIGF2YWlsYWJsZSAoYXMgZGVzY3JpYmVkIGF0IGtleWNsb2FrIGRvY3MgLVxuICAgKiBodHRwczovL3d3dy5rZXljbG9hay5vcmcvZG9jcy9sYXRlc3Qvc2VjdXJpbmdfYXBwcy9pbmRleC5odG1sI2NhbGxiYWNrLWV2ZW50cyk6XG4gICAqIC0gT25BdXRoRXJyb3JcbiAgICogLSBPbkF1dGhMb2dvdXRcbiAgICogLSBPbkF1dGhSZWZyZXNoRXJyb3JcbiAgICogLSBPbkF1dGhSZWZyZXNoU3VjY2Vzc1xuICAgKiAtIE9uQXV0aFN1Y2Nlc3NcbiAgICogLSBPblJlYWR5XG4gICAqIC0gT25Ub2tlbkV4cGlyZVxuICAgKiBJbiBlYWNoIG9jY3VycmVuY2Ugb2YgYW55IG9mIHRoZXNlLCB0aGlzIHN1YmplY3Qgd2lsbCByZXR1cm4gdGhlIGV2ZW50IHR5cGUsXG4gICAqIGRlc2NyaWJlZCBhdCB7QGxpbmsgS2V5Y2xvYWtFdmVudFR5cGV9IGVudW0gYW5kIHRoZSBmdW5jdGlvbiBhcmdzIGZyb20gdGhlIGtleWNsb2FrLWpzXG4gICAqIGlmIHByb3ZpZGVkIGFueS5cbiAgICpcbiAgICogQHJldHVybnNcbiAgICogQSBzdWJqZWN0IHdpdGggdGhlIHtAbGluayBLZXljbG9ha0V2ZW50fSB3aGljaCBkZXNjcmliZXMgdGhlIGV2ZW50IHR5cGUgYW5kIGF0dGFjaGVzIHRoZVxuICAgKiBmdW5jdGlvbiBhcmdzLlxuICAgKi9cbiAgZ2V0IGtleWNsb2FrRXZlbnRzJCgpOiBTdWJqZWN0PEtleWNsb2FrRXZlbnQ+IHtcbiAgICByZXR1cm4gdGhpcy5fa2V5Y2xvYWtFdmVudHMkO1xuICB9XG59XG4iLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgTWF1cmljaW8gR2VtZWxsaSBWaWdvbG8gYW5kIGNvbnRyaWJ1dG9ycy5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9tYXVyaWNpb3ZpZ29sby9rZXljbG9hay1hbmd1bGFyL0xJQ0VOU0VcbiAqL1xuXG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBIdHRwSW50ZXJjZXB0b3IsXG4gIEh0dHBSZXF1ZXN0LFxuICBIdHRwSGFuZGxlcixcbiAgSHR0cEV2ZW50LFxuICBIdHRwSGVhZGVyc1xufSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1lcmdlTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBLZXljbG9ha1NlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9rZXljbG9hay5zZXJ2aWNlJztcblxuLyoqXG4gKiBUaGlzIGludGVyY2VwdG9yIGluY2x1ZGVzIHRoZSBiZWFyZXIgYnkgZGVmYXVsdCBpbiBhbGwgSHR0cENsaWVudCByZXF1ZXN0cy5cbiAqXG4gKiBJZiB5b3UgbmVlZCB0byBleGNsdWRlIHNvbWUgVVJMcyBmcm9tIGFkZGluZyB0aGUgYmVhcmVyLCBwbGVhc2UsIHRha2UgYSBsb29rXG4gKiBhdCB0aGUge0BsaW5rIEtleWNsb2FrT3B0aW9uc30gYmVhcmVyRXhjbHVkZWRVcmxzIHByb3BlcnR5LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgS2V5Y2xvYWtCZWFyZXJJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG4gIHByaXZhdGUgZXhjbHVkZWRVcmxzUmVnZXg6IFJlZ0V4cFtdO1xuXG4gIC8qKlxuICAgKiBLZXljbG9ha0JlYXJlckludGVyY2VwdG9yIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5Y2xvYWsgLSBJbmplY3RlZCBLZXljbG9ha1NlcnZpY2UgaW5zdGFuY2UuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGtleWNsb2FrOiBLZXljbG9ha1NlcnZpY2UpIHt9XG5cbiAgcHJpdmF0ZSBsb2FkRXhjbHVkZWRVcmxzUmVnZXgoKSB7XG4gICAgY29uc3QgZXhjbHVkZWRVcmxzOiBzdHJpbmdbXSA9IHRoaXMua2V5Y2xvYWsuYmVhcmVyRXhjbHVkZWRVcmxzO1xuICAgIHRoaXMuZXhjbHVkZWRVcmxzUmVnZXggPSBleGNsdWRlZFVybHMubWFwKHVybFBhdHRlcm4gPT4gbmV3IFJlZ0V4cCh1cmxQYXR0ZXJuLCAnaScpKSB8fCBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcmNlcHQgaW1wbGVtZW50YXRpb24gdGhhdCBjaGVja3MgaWYgdGhlIHJlcXVlc3QgdXJsIG1hdGNoZXMgdGhlIGV4Y2x1ZGVkVXJscy5cbiAgICogSWYgbm90LCBhZGRzIHRoZSBBdXRob3JpemF0aW9uIGhlYWRlciB0byB0aGUgcmVxdWVzdC5cbiAgICpcbiAgICogQHBhcmFtIHJlcVxuICAgKiBAcGFyYW0gbmV4dFxuICAgKi9cbiAgcHVibGljIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIC8vIElmIGtleWNsb2FrIHNlcnZpY2UgaXMgbm90IGluaXRpYWxpemVkIHlldCwgb3IgdGhlIGludGVyY2VwdG9yIHNob3VsZCBub3QgYmUgZXhlY3V0ZVxuICAgIGlmICghdGhpcy5rZXljbG9hayB8fCAhdGhpcy5rZXljbG9hay5lbmFibGVCZWFyZXJJbnRlcmNlcHRvcikge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmV4Y2x1ZGVkVXJsc1JlZ2V4KSB7XG4gICAgICB0aGlzLmxvYWRFeGNsdWRlZFVybHNSZWdleCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHVybFJlcXVlc3QgPSByZXEudXJsO1xuICAgIGNvbnN0IHNoYWxsUGFzczogYm9vbGVhbiA9ICEhdGhpcy5leGNsdWRlZFVybHNSZWdleC5maW5kKHJlZ2V4ID0+IHJlZ2V4LnRlc3QodXJsUmVxdWVzdCkpO1xuICAgIGlmIChzaGFsbFBhc3MpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmtleWNsb2FrLmFkZFRva2VuVG9IZWFkZXIocmVxLmhlYWRlcnMpLnBpcGUoXG4gICAgICBtZXJnZU1hcChoZWFkZXJzV2l0aEJlYXJlciA9PiB7XG4gICAgICAgIGNvbnN0IGtjUmVxID0gcmVxLmNsb25lKHsgaGVhZGVyczogaGVhZGVyc1dpdGhCZWFyZXIgfSk7XG4gICAgICAgIHJldHVybiBuZXh0LmhhbmRsZShrY1JlcSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cbiIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBNYXVyaWNpbyBHZW1lbGxpIFZpZ29sbyBhbmQgY29udHJpYnV0b3JzLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGEgTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9naXRodWIuY29tL21hdXJpY2lvdmlnb2xvL2tleWNsb2FrLWFuZ3VsYXIvTElDRU5TRVxuICovXG5cbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSFRUUF9JTlRFUkNFUFRPUlMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5cbmltcG9ydCB7IEtleWNsb2FrU2VydmljZSB9IGZyb20gJy4vc2VydmljZXMva2V5Y2xvYWsuc2VydmljZSc7XG5pbXBvcnQgeyBLZXljbG9ha0JlYXJlckludGVyY2VwdG9yIH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMva2V5Y2xvYWstYmVhcmVyLmludGVyY2VwdG9yJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXG4gIHByb3ZpZGVyczogW1xuICAgIEtleWNsb2FrU2VydmljZSxcbiAgICB7XG4gICAgICBwcm92aWRlOiBIVFRQX0lOVEVSQ0VQVE9SUyxcbiAgICAgIHVzZUNsYXNzOiBLZXljbG9ha0JlYXJlckludGVyY2VwdG9yLFxuICAgICAgbXVsdGk6IHRydWVcbiAgICB9XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgQ29yZU1vZHVsZSB7fVxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IE1hdXJpY2lvIEdlbWVsbGkgVmlnb2xvIGFuZCBjb250cmlidXRvcnMuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYSBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWF1cmljaW92aWdvbG8va2V5Y2xvYWstYW5ndWxhci9MSUNFTlNFXG4gKi9cblxuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQ29yZU1vZHVsZSB9IGZyb20gJy4vY29yZS9jb3JlLm1vZHVsZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb3JlTW9kdWxlXVxufSlcbmV4cG9ydCBjbGFzcyBLZXljbG9ha0FuZ3VsYXJNb2R1bGUge31cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFnQkUsY0FBVzs7Ozs7SUFLWCxlQUFZ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
