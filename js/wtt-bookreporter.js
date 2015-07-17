/**
 *	Репортёр..
 */
;(function () {
	"use strict";
	angular.module("WorkTimeTrackerModule")
		.factory("WorkTimeTrackerBookReporter", WorkTimeTrackerBookReporter);

	WorkTimeTrackerBookReporter.$inject = ["WorkTimeTrackerBook", "WorkTimeTrackerBookEntry", "evalAsync"];

	function WorkTimeTrackerBookReporter (WorkTimeTrackerBook, WorkTimeTrackerBookEntry, evalAsync) {

		/**	Наш репортер
		 *	@param {number} options.direction Направление сортировки
		 *	@param {function} options.getKey М-м-м.. Функция доступа к значению, по которому сортирован массив записей (обычно по отметке о времени старта). Она будет использоваться для сортировки инструментарием SortedArray */
		function List (options, bookRef) {
			// Исходный массив, наша цель и результат, который видит юзер.
			this.list = [];
			// (Подрубим нужные события и прочие настройки)
			initList.call(this, options, bookRef);
			// Внимание, возвращаем сам исходный массив а не новый объект List.
			// Через замыкания мы сможем работать с ним внутри и это будет
			// мгновенно доступно извне, но при этом нельзя будет удалить сам массив
			// извне. Псевдо-readonly такой массив. Секретная обертка вокруг него.
			return this.list;
		}

		// Возвращаем фабрику списков
		return {
			list: function (options) { return new List(options, WorkTimeTrackerBook); }
		};

		function initList (options, bookRef) {
			// Это наша рабочая лошадка - функционал внутри <SortedArray> vector изменяет
			// массив который передали в конструкторе.
			this.vector = new SortedArray(this.list, angular.extend({}, { getKey: function (value) { return value.start; } }, options));
			// Массив быстрого доступа для приходящих апдейтов
			this.keyObj = {};
			// Внимание, хитрый вызов обработчика. Обертка evalAsync
			// возвращает функцию которая внутренне вызовет child_added функцию
			// внутри как-то так $rootScope.$evalAsync(myFunction.call(this, args)).
			// Плюс сразу привязали контекст.
			// Это чтобы апдейты DOM ангуляра правильно отреагировали на наши изменения,
			// ведь они происходят асинхронно и "на стороне" (от firebase бэкенда).
			var onadd = bookRef.on("child_added", evalAsync(child_added.bind(this))),
				onremove = bookRef.on("child_removed", evalAsync(child_removed.bind(this)));
			// ref.on("child_changed", evalAsync(child_changed.bind(this)));

			// Подчистка за собой
			this.destroy = function () {
				bookRef.off("child_added", onadd);
				bookRef.off("child_removed", onremove);
			}
		}

		function child_added(snapshot) {
			var item = WorkTimeTrackerBookEntry.create(snapshot);
			this.vector.insert(item);
			this.keyObj[snapshot.key()] = item;
		}

		function child_removed(snapshot) {
			if (!this.keyObj[snapshot.key()]) {
				var error = new Error("Не найдено такого элемента");
				console.warn(error.stack);
			} else {
				this.list.splice(this.list.indexOf(this.keyObj[snapshot.key()]), 1)
				this.keyObj[snapshot.key()].destroy();
				delete this.keyObj[snapshot.key()];
			}
		}
	}

}());