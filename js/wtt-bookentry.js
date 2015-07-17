/**
 *	Репортёр..
 */
;(function () {
	"use strict";
	angular.module("WorkTimeTrackerModule")
		.factory("WorkTimeTrackerBookEntry", WorkTimeTrackerBookEntry);

	WorkTimeTrackerBookEntry.$inject = ["evalAsync"];

	function WorkTimeTrackerBookEntry (evalAsync) {

		function Item(snapshot) {
			Object.defineProperties(this, {
				"start":  {
					enumerable: true,
					get: function () { return this.item.val().start; },
					set: function (value) {	this.item.ref().update({ start: value }); }
				},
				"stop": {
					enumerable: true,
					get: function () { return this.item.val().stop; },
					set: function (value) { this.item.ref().update({ stop: value }); }
				},
				"description": {
					enumerable: true,
					get: function () { return this.item.val().description; },
					set: function (value) { this.item.ref().update({ description: value }); }
				}
			});

			initItem.call(this, snapshot);
		}

		Item.prototype.remove = removeItem;

		return {
			create: function (snapshot) { return new Item(snapshot); }
		};

		function initItem (snapshot) {
			Object.defineProperties(this, {
				"item": {
					writable: true,
					enumerable: false,
					configurable: false,
					value: snapshot
				}
			})

			// Подпишемся на изменения
			var onvalue = this.item.ref().on("value", evalAsync(function (snapshot) {
				if (!snapshot.val()) {
					// Если итем удален из хранилища, нужно как-то отреагировать
					// (прекращаем получать данные, но оставляем итем в памяти)
					this.destroy();
				} else {
					this.item = snapshot;
				}
			}.bind(this)));

			// Подчистка за собой
			this.destroy = function () {
				this.item.ref().off("value", onvalue);
			}
		}

		function removeItem () {
			this.destroy();
			this.item.ref().remove();
		}

	}

}());