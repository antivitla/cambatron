/**
 *	Отложенный запуск (магия привязки Angular.js)
 */
;(function () {
	"use strict";
	angular.module("Cambatron.utils")
		.factory("evalAsync", function ($rootScope) {
			return function (fn) {
				return function (args) {
					$rootScope.$evalAsync(fn.call(this, args));
				};
			};
		});
}());