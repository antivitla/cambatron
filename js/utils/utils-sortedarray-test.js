;(function () {
	"use strict";

	xdescribe("Сортированный Массив", function () {

		it("Умеет создаваться", function () {
			expect(new SortedArray()).toBeDefined();
		});

		it("Умеет искать нужный элемент по некоему ключу", function () {
			var vector = new SortedArray([1,2,3]);
			var result = vector.find(1);
			// console.log(result);
			expect(result.id == 0 && result.value == 1).toBe(true);

			vector = new SortedArray([5,10,13,20,80,121].reverse());
			result = vector.find(80);
			// console.log(result);
			expect(result.id == 1).toBe(true);

			vector = new SortedArray([5,10,13,20,80,121].reverse().map(function (value) { return {start: value}; }), {
				getKey: function (value) { return value.start; }
			});
			result = vector.find({start: 121});
			// console.log(result);
			expect(result.id == 0).toBe(true);

			vector = new SortedArray(["а","б","вагнер", "zok", "зуббер", "крамыч"].sort());
			result = vector.find("зуббер");
			// console.log(result);
			expect(result.id == 4).toBe(true);
		});

		it("Умеет искать нужный элемент 2", function () {
			var vector = new SortedArray([1,2,3]);
			var result = vector.find(1);
			// console.log(result);
			expect(result.id == 0 && result.value == 1).toBe(true);

			vector = new SortedArray([5,10,13,20,80,121].reverse());
			result = vector.find(80);
			// console.log(result);
			expect(result.id == 1).toBe(true);

			vector = new SortedArray([5,10,13,20,80,121].reverse().map(function (value) { return {start: value}; }), {
				getKey: function (value) { return value.start; }
			});
			result = vector.find({start: 121});
			// console.log(result);
			expect(result.id == 0).toBe(true);

			vector = new SortedArray(["а","б","вагнер", "zok", "зуббер", "крамыч"].sort());
			result = vector.find("зуббер");
			// console.log(result);
			expect(result.id == 4).toBe(true);
		});

		xit("Измеряем скорость алгоритма (меньше 1/10 секунды на 10 000 000 записей)", function () {
			var mega = [];
			var megalength = 10000000
			var a = new Date();
			for (var i = 0; i < megalength; i++) {
				mega.push({start: 10*i});
			}
			var b = new Date();
			result = (new SortedArray(mega, {
				getKey: function (value) { return value.start; }
			})).find(439500);
			var c = new Date();

			console.log("Push %s items: %s sec, custom key search through them: %s sec", megalength, (b-a)*0.001, (c-b)*0.001);
			expect(c-b).toBeLessThan(100);
		});

		it("Умеет вставлять в нужное место", function () {
			var vector,
				result,
				insert,
				length = 14,
				src = [];

			for(var i = 0; i < length; i++) {
				src.push(10*i);
			}

			// for (var i = 0; i < 10; i++) {
			// 	vector = new SortedArray(src.map(function (item) { return { start: item + 1 }; }), {
			// 		getKey: function (value) { return value.start }
			// 	});
			// 	insert = { start: Math.floor(Math.random() * 200 - 50) };
			// 	result = vector.insert(insert);
			// 	console.log(result, insert, JSON.stringify(vector.data));

			// 	vector = new SortedArray(src.map(function (item) { return { start: item - 5 }; }).reverse(), {
			// 		getKey: function (value) { return value.start }
			// 	});
			// 	insert = { start: Math.floor(Math.random() * 200 - 50) };
			// 	result = vector.insert(insert);
			// 	console.log(result, insert, JSON.stringify(vector.data));
			// }

			vector = new SortedArray(src.slice());
			insert = 36;
			result = vector.insert(insert);
			// console.log(result, insert, vector.data);
			expect(result.id).toBe(4);

			vector = new SortedArray(src.slice().reverse());
			insert = 66;
			result = vector.insert(insert);
			// console.log(result, insert, vector.data);
			expect(result.id).toBe(7);

			vector = new SortedArray(src.slice());
			insert = -10;
			result = vector.insert(insert);
			// console.log(result, insert, vector.data);
			expect(result.id).toBe(0);

			vector = new SortedArray(src.slice());
			insert = 150;
			result = vector.insert(insert);
			// console.log(result, insert, vector.data);
			expect(result.id).toBe(14);

			vector = new SortedArray(src.slice().reverse());
			insert = 0;
			result = vector.insert(insert);
			// console.log(result, insert, vector.data);
			expect(result.id).toBe(14)

			vector = new SortedArray(src.map(function (item) { return {start: item}; }).reverse(), {
				getKey: function (value) { return value.start }
			});
			insert = { start: 128 };
			result = vector.insert(insert);
			// console.log(result, insert, vector.data);
			expect(result.id).toBe(1)

		});

		xit("Измеряем скорость вставки  (меньше 1/10 секунды на 10 000 000 записей)", function () {
			var mega = [];
			var megalength = 10000000
			var a = new Date();
			for (var i = 0; i < megalength; i++) {
				mega.push({start: 2*i});
			}
			var b = new Date();
			var result = (new SortedArray(mega, {
				getKey: function (value) { return value.start; }
			})).insert({start: 534530});
			var c = new Date();
			console.log("Push %s items: %s sec, custom insert : %s sec", megalength, (b-a)*0.001, (c-b)*0.001);
			expect(c-b).toBeLessThan(100);
		});

	});

}());