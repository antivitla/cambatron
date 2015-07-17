
function ChainApi (data) {
	this.data = data;
}

ChainApi.prototype.toArray = function () {
	var result = [];

	if (!Array.isArray(this.data)) {
		for (var i in this.data) {
			if (this.data.hasOwnProperty(i)) {
				result.push(this.data[i]);
			}
		}
		return new ChainApi(result);
	} else {
		return this;
	}
}

ChainApi.prototype.sum = function (property) {
	var result = 0;
	for (var i in this.data) {
		if (property) {
			result += Number(this.data[i][property]);
		} else {
			result += Number(this.data[i]);
		}
	}
	return new ChainApi(result);
}

