;(function () {
	"use strict";

	xdescribe("Простейшее хеширование объекта в ключ", function () {

		it("Должен уметь возвращать уникальную хеш-строку", function () {
			expect(typeof SimpleHash({d: 5})).toBe("string");
			expect(SimpleHash({})).toBe("");
			expect(SimpleHash({a: 1,b: 2,"6":70}) == SimpleHash({b:2,"6":70,a:1})).toBe(true);
			expect(SimpleHash({range: 1, stop: 25,description:"Zok","масала":"8"}) == SimpleHash({"description":"Zok","масала":8,stop:25,range:1})).toBe(true);
		});

	});

}());