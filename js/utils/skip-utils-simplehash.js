/**
 *	Простое хеширование - перевод объекта в ключ. Идентичные объекты получат
 *	идентичный ключ
 */
function SimpleHash (obj) {
	var string = [];
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			var hash = JSON.stringify({
				key: i,
				value: String(obj[i])
			});
			hash = hash
				.replace(/\"/g, "")
				.replace(/\{/g, "")
				.replace(/\}/g, "")
				.replace(/key/g, "")
				.replace(/value/g, "")
				.replace(/\,/g, "")
				.replace(/:/g, "");
			string.push(hash);
		}
	}
	string = string.sort().join("");
	console.log(string);
	return string;
}

