/**
 *	Модуль учета рабочего времени
 */
;(function () {
	"use strict";
	angular.module("WorkTimeTrackerModule", ["Cambatron.utils"])
		.constant("WTTStorageUri", "https://brilliant-fire-1299.firebaseio.com/cambatron");
}());