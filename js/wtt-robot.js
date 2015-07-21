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

		Robot.prototype.start = startRobot;
		Robot.prototype.stop = stopRobot;
		Robot.prototype.info = function () {
			return {
				status: this.status,
				entry: this.entry
			};
		};

		return new Robot(WorkTimeTrackerBook, new $window.Firebase(WTTStorageUri + "/wtt-robot"));

		function Robot (bookRef, robotRef) {
			Object.defineProperties(this, {
				"status": {
					writable: true,
					value: false
				},
				"entry": {
					writable: true
					// value: {}
				},
				// Ссылки на базу данных
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
			this.robotRef.once("value", evalAsync(function (snapshotOfRobot) {
				if(!snapshotOfRobot.val()) {
					console.warn("Робота убили или первый раз для данного аккаунта загрузили");
					return;
				} else {
					// Статус
					this.status = snapshotOfRobot.val().status;
					// Текущая запись. Если была, загрузим её
					if (snapshotOfRobot.val().entryKey) {
						this.bookRef.child(snapshotOfRobot.val().entryKey).once("value", evalAsync(function (snapshotOfBookEntry) {
							if (!snapshotOfBookEntry.val()) {
								console.log("Robot: удалили запись, которую мы отслеживали.")
								// Либо остановить робота, либо хранить значения в роботе и ниибет
							} else {
								// (Сохраняем значения)
								this.entryRef = snapshotOfBookEntry.ref();
								this.entry = snapshotOfBookEntry.val();
							}
						}.bind(this)));
					}
				}
			}.bind(this)));
		}

		function startRobot (options) {
			// Если были запущены, перезапускаемся..
			if (this.status) { this.stop(); }
			this.status = true;
			this.robotRef.child("status").set(true);
			// Создать новую запись
			this.entry = angular.extend({ start: (new Date()).getTime(), description: $window.funnyPhrase() }, options);
			// Добавить её в хранилище книги
			this.entryRef = this.bookRef.push(this.entry);
			// Сохраняем ссылку на неё в хранилище робота
			this.robotRef.child("entryKey").set(this.entryRef.key());
		}

		function stopRobot (options) {
			// Если мы записывали что-то,
			if (this.status) {
				// ...прописать стоп
				angular.extend(this.entry, { stop: (new Date()).getTime() }, options);
				// и сохранить в хранилище Книги.
				this.entryRef.update(this.entry);
				// Удалить ссылку из хранилища робота
				// this.robotRef.child("entryKey").remove();
			}
			this.status = false;
			this.robotRef.child("status").set(false);
		}
	}

}());