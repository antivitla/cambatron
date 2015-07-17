describe("Simple Pipe", function () {

	it("Should return self with all operations", function () {
		var ref = new ChainApi("zok");
		var some1 = ref.toArray().toArray();
		expect(typeof some1.toArray).toBe("function");
	});

	it("Do smth with data", function () {
		var ref = new ChainApi({
			"rwerwr": {start: 1, stop: 2, description: "Zok"},
			"wsdrwr": {start: 3, stop: 6, description: "Zak"}
		});
		var arr = ref.toArray();
		var sum = arr.sum("start");
		var sum2 = arr.sum("stop");
		var sum3 = (new ChainApi(["2", 6, 10, "100"])).sum();
		console.log(arr, sum, sum2, sum3);
		expect(arr.data.length).toBeGreaterThan(0);
		expect(sum.data).toBe(4);
		expect(sum2.data).toBe(8);
		expect(sum3.data).toBe(118);
	});

});