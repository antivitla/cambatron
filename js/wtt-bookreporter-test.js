;(function () {
	"use strict";

	describe("Репортёр МУРВ", function () {
		beforeEach(module("WorkTimeTrackerModule"));

		var BookReporter, Book, $timeout;

		beforeEach(inject(function (_WorkTimeTrackerBookReporter_, _WorkTimeTrackerBook_, _$timeout_) {
			Book = _WorkTimeTrackerBook_;
			BookReporter = _WorkTimeTrackerBookReporter_;
			$timeout = _$timeout_;
		}));

		it("Репортёр есть", function () {
			expect(BookReporter).toBeDefined();
		});

		it("Нам нужный простой список (с записями журнала)", function () {
			var list = BookReporter.list();
			expect(Array.isArray(list)).toBe(true);
		});

		it("Он реально пополняется записями книги учета (с опциями)", function () {
			var list = BookReporter.list({
				direction: -1,
				getKey: function (value) { return value.stop; }
			});
			Book.push({start: 0, stop: 5, description: "Zokzok"});
			Book.push({start: 8, stop: 15, description: "Zokik"});
			Book.push({start: 5, stop: 10, description: "Zuikotok"});
			Book.flush();
			// list.forEach(function (val) { console.log(val); });
			expect(list.length).toBe(3);
			expect(list[1].stop).toBeGreaterThan(list[2].stop);
		});

	});

}());