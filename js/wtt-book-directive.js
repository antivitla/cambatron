/**
 *	Директива робота (с кнопками)
 */
;(function (){
	"use strict";
	angular.module("WorkTimeTrackerModule")
		.directive("wttBook", wttBookDirective);

	function wttBookDirective() {
		return {
			controllerAs: "book",
			controller: wttBookController
		};
	}

	wttBookController.$inject = ["WorkTimeTrackerBookReporter"];

	function wttBookController (WorkTimeTrackerBookReporter) {
		this.entries = WorkTimeTrackerBookReporter.list({
			direction: -1
		});
	}

}());