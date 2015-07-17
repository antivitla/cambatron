/**
 *	Робот учета рабочего времени. Умеет стартовать и останавливаться с опциональными
 *	значениями времени старта и окончания (которые заносятся в книгу учета раб.времени)
 */
;(function (){
	"use strict";
	angular.module("WorkTimeTrackerModule")
		.factory("WorkTimeTrackerRobot", WorkTimeTrackerRobot);

	WorkTimeTrackerRobot.$inject = ["WorkTimeTrackerBook", "WorkTimeTrackerBookEntry", "WTTStorageUri", "evalAsync", "$window"];

	function WorkTimeTrackerRobot (WorkTimeTrackerBook, WorkTimeTrackerBookEntry, WTTStorageUri, evalAsync, $window) {

		Robot.prototype.start = start;
		Robot.prototype.stop = stop;
		Robot.prototype.info = info;

		return new Robot(WorkTimeTrackerBook, new $window.Firebase(WTTStorageUri + "/wtt-robot"));

		function Robot(bookRef, robotRef) {
			initRobot.call(this, bookRef, robotRef);
		}

		function initRobot (bookRef, robotRef) {
			Object.defineProperties(this, {
				"status": {
					writable: true,
					value: false
				},
				"entry": {
					writable: true
					// value: {}
				},
				"bookRef": {
					writable: false,
					value: bookRef
				},
				"robotRef": {
					writable: false,
					value: robotRef,
				},
				"entryRef": {
					writable: true
				}
			});

			// Загружаем начальное состояние робота
			this.robotRef.once("value", evalAsync(function (snapshot) {
				if(!snapshot.val()) {
					console.warn("Робота убили или первый раз для данного аккаунта загрузили");
					return;
				} else {
					this.status = snapshot.val().status;
					// Если был сохранен какой-то таск для записи
					if (snapshot.val().entryKey) {
						bindEntry.call(this, snapshot.val().entryKey);
					}
				}
			}.bind(this)));
		}

		function start (options) {
			// Если были запущены, перезапускаемся..
			if (this.status) { this.stop(); }
			this.status = true;
			this.robotRef.child("status").set(true);
			// Создать новую запись
			this.entry = angular.extend({ start: (new Date()).getTime() }, options);
			// Добавить её в хранилище книги
			this.entryRef = this.bookRef.push(this.entry);
			// Сохраняем ссылку на неё в хранилище робота
			this.robotRef.child("entryKey").set(this.entryRef.key());
		}

		function stop (options) {
			if (this.status) {
				// Если мы записывали что-то, прописать стоп
				angular.extend(this.entry, { stop: (new Date()).getTime() }, options);
				this.entryRef.update(this.entry);
				// this.robotRef.child("entryKey").remove();
			}
			this.status = false;
			this.robotRef.child("status").set(false);
		}

		function info () {
			return {
				status: this.status,
				entry: this.entry
			};
		}

		function bindEntry(key) {
			this.bookRef.child(key).once("value", evalAsync(function (snapshot) {
				if (!snapshot.val()) {
					console.log("Robot: удалили запись, которую мы отслеживаем.")
				} else {
					// Перезапишем
					this.entryRef = snapshot.ref();
					this.entry = snapshot.val();
				}
			}.bind(this)));
		}
	}

}());