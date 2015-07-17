/**
 *	Асинхронная итерация (не знаю точно зачем сделал)
 */
;(function () {
	"use strict";
	angular.module("Cambatron.utils").factory("asyncIterate", asyncIterate);

	asyncIterate.$inject = ["$timeout"];

	function asyncIterate ($timeout) {
		return function (arr, callback) {
			var i = -1,
				length = arr.length,
				complete;

			function next () {
				i++;
				if (i < length) {
					callback(arr[i], i, next);
				} else {
					if (complete) complete();
				}
			}

			$timeout(next, 1);

			return {
				then: function(f) {
					complete = f;
				}
			};
		};
	}

}());