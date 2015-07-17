;(function () {
	"use strict";

	// Робот УРВ
	describe("Робот книги МУРВ", function () {

		beforeEach(module("WorkTimeTrackerModule"));

		var Robot, Book, $timeout;

		beforeEach(inject(function (_WorkTimeTrackerRobot_, _WorkTimeTrackerBook_, _$timeout_) {
			Robot = _WorkTimeTrackerRobot_;
			Book = _WorkTimeTrackerBook_;
			$timeout = _$timeout_;
		}));

		it("Робот умеет стартовать/останавливаться и отчитаться о своём статусе", function () {
			expect(typeof Robot.start).toEqual("function");
			expect(typeof Robot.stop).toEqual("function");
			Robot.robotRef.flush();
			expect(Robot.status).toEqual(false);
			Robot.start();
			Robot.robotRef.flush();
			expect(Robot.status).toEqual(true);
			Robot.stop();
			Robot.robotRef.flush();
			expect(Robot.status).toEqual(false);
		});

		it("Когда робот стартует, он добавляет новую запись в книгу", function () {
			var entry;
			Robot.start({zok: 1});
			Robot.bookRef.on("child_added", function (snapshot) {
				entry = snapshot.val();
				// console.log("child_added", entry);
			});
			Robot.bookRef.flush();
			expect(entry.zok).toBe(1);
		});

		it("Когда останавливаем, апдейтится стоп в данной записи", function () {
			var refs = [],
				list = [];
			Robot.bookRef.on("child_added", function (snapshot) {
				// console.log("added");
				snapshot.ref().on("value", function (snapshot) {
					// console.log("value");
					list.push(snapshot.val());
				});
			});
			Robot.start({start: 1});
			Robot.bookRef.flush();
			// console.log(Robot.info().entry.item.val());
			Robot.stop({stop: 6});
			Robot.bookRef.flush();
			// console.log(Robot.info().entry.item.val());
			// console.log(JSON.stringify(list), entry);
			expect(Robot.info().entry.stop).toBe(6);
			expect(Robot.info().entry.start).toBe(1);
		});

		it("Когда вторично стартуем, старая запись \"закрывается\" (апдейтится стоп текущим/произвольным моментом) и открывается новая (опять)", function () {
			var refs = [],
				list = [];
			Robot.bookRef.on("child_added", function (snapshot) {
				// console.log("added");
				snapshot.ref().on("value", function (snapshot) {
					// console.log("value");
					list.push(snapshot.val());
				});
			});
			Robot.start({start: 1});
			Robot.bookRef.flush();
			// console.log(Robot.info().entry.item.val());
			Robot.start({start: 6});
			Robot.bookRef.flush();
			// console.log(Robot.info().entry.item.val());
			// console.log(JSON.stringify(list));
			expect(list[1].stop).toBeDefined();
		});


		xit("При загрузке робот должен брать свой статус из хранилища", function () {
			Robot.robot.ref().child("status").set(true);
			Robot.robot.ref().flush();
			expect(Robot.status).toBe(true);
		});

	});

}());