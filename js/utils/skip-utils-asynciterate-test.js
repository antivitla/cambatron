;(function () {
	"use strict";

	xdescribe("Тестируем асинхронный перебор массива", function () {

		var asyncIterate, $timeout;

		beforeEach(module("Cambatron.utils"));

		beforeEach(inject(function (_asyncIterate_, _$timeout_) {
			asyncIterate = _asyncIterate_;
			$timeout = _$timeout_;
		}));

		it ("Тестируем асинхронный перебор массива", function () {
			var list = [1,2,4,6,7],
				count = 0;

			asyncIterate(list, function (item, i, next) {
				count++;
				expect(list[i] == item).toBe(true);
				// console.log(i);
				$timeout(next, 10);
				$timeout.flush();
			}).then(function () {
				// console.log("done");
			});

			$timeout.flush();

			expect(count).toBe(5);
		});
	});

}());