/**	Пробуем делать UI */
;(function () {
	"use strict";
	angular.module("Cambatron")
		.config(function($mdThemingProvider) {
			$mdThemingProvider.theme('default')
				.primaryPalette('blue-grey')
				.accentPalette('deep-orange');
		})
		.controller("ProjectsByClientsController", ProjectsByClientsController)
		.controller("TimerController", TimerController);

	ProjectsByClientsController.$inject = ["$scope"];

	function ProjectsByClientsController ($scope) {
		$scope.projectsbyclients = {
			"Андрей Чиж": [
				{ name: "Подписка" }
			],
			"Маша Нигголь": [
				{ name: "Idealmaster" },
				{ name: "neq4" },
				{ name: "Ahmad" },
				{ name: "Кофемания FM" },
				{ name: "Цветочная" },
				{ name: "Космос" },
				{ name: "Сheapside" },
				{ name: "Ещё" },
			],
			"Евгений Гребёнкин": [
				{ name: "WiFi-страница для Техносилы" }
			],
			"Петров": [
				{ name: "Медоскоп" },
				{ name: "Дмитровка" }
			]
		};

		$scope.currentProjects = {
			"Андрей Чиж": [
				{ name: "Подписка" }
			],
			"Маша Нигголь": [
				{ name: "Idealmaster" },
				{ name: "Ahmad" },
				{ name: "Сheapside" },
			],
		};

		$scope.archiveProjects = {
			"Маша Нигголь": [
				{ name: "neq4" },
				{ name: "Кофемания FM" },
				{ name: "Цветочная" },
				{ name: "Космос" },
				{ name: "Ещё" },
			],
			"Евгений Гребёнкин": [
				{ name: "WiFi-страница для Техносилы" }
			],
			"Петров": [
				{ name: "Медоскоп" },
				{ name: "Дмитровка" }
			]
		};
	}

	TimerController.$inject = ["$scope"];

	function TimerController ($scope) {
		$scope.task = {
			start: null,
			stop: null,
			description: "Есть идея изменить тайминг добавления"
		}
		$scope.now = function () {
			return new Date();
		}
	}

}());