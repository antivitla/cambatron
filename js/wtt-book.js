/**
 *	Книга учета рабочего времени
 */
;(function () {
	"use strict";
	angular.module("WorkTimeTrackerModule")
		.factory("WorkTimeTrackerBook", WorkTimeTrackerBook);

	WorkTimeTrackerBook.$inject = ["$window", "WTTStorageUri"];

	function WorkTimeTrackerBook ($window, WTTStorageUri) {
		return new $window.Firebase(WTTStorageUri + "/wtt-book");
	}

}());
