/**
 *	Операции над отсортированными массивами с применением двоичных, интерполяционных
 *	и подобных им алгоритмов. Зависит от вспомогательной математики SortedArrayMath
 *	@param {array} data Исходный сортированный массив
 *	@param {object} options Опции создания
 *	@param {function} options.getKey Функция возвращающая значение ключа, по
 *		которому мы сортированы
 *	@param {function} options.direction Направление сортировки
 *	При инициализации мы попытаемся "умно" предположить порядок сортировки,
 *	но пользовательские опции перезапишут наши догадки.
 */
function SortedArray (data, options) {

	this.data = data || [];

	// Проставляем по-умолчанию что ключ это и есть элемент массива (число)
	this.getKey = this.defaultGetKey.bind(this);

	// Возможно элементы более сложные объекты, для этого пользователь предоставил
	// нам функцию получения ключа из элемента
	if (safeCheckObjectChild(options, "getKey")) {
		this.getKey = options.getKey;
	}

	// Если элементы сложнее чем строка или число и нет кастомной функции получения
	// ключа, это фейл от юзера
	if (this.data.length > 1 && typeof this.data[0] != "string" && typeof this.data[0] != "number" && !safeCheckObjectChild(options, "getKey")) {
		var error = new Error ("Объекты сложнее строки и числа, как получить ключ?");
		console.log(error.stack);
		return;
	}

	// Автоопределение порядка сортировки
	if (this.data.length > 1) {
		this.direction = this.getKey(this.data[1]) > this.getKey(this.data[0]) ? 1 : -1;
	}

	// Пользовательская установка порядка сортировки
	if (safeCheckObjectChild(options, "direction")) {
		this.direction = options.direction;
	}

}

/**	Мы должны знать направление своей сортировки.
 *	По умолчанию возрастаем.
 */
SortedArray.prototype.defaultDirection = 1;

/**	По-умолчанию нативное сравнение, работает для ключей в виде чисел и строк
 *	Можно ли придумать некий другой принцип сортировки? Всё может быть )))
 */
SortedArray.prototype.defaultCompareFn = function (iteratingValue, keyValue) {
	return this.getKey(iteratingValue) == this.getKey(keyValue) ? 0 : (this.getKey(iteratingValue) > this.getKey(keyValue) ? 1 : -1);
}

/**	По-умолчанию "ключ" по которому сортирован массив - это элемент массива и есть
 *	(то есть массив чисел или строк мы имеем)
 */
SortedArray.prototype.defaultGetKey = function (value) {
	return value;
}

/**	Найти элемент по ключу - по тому значению, по которому отсортирован массив
 *	@param {number} key Искомое значение
 *	@param {function} compareFn
 *		Пользовательская функция сравнения текущего итема с ключом. См. defaultCompareFn
 *		Если она возвращает 0, значит элемент найден. Если больше 0, то
 *		поиск продолжится в меньших индексах чем индекс текущего итема ("слева"), если
 *		меньше 0, то в бОльших ("справа").
 */
SortedArray.prototype.find = function (value, compareFn) {
	var range = { min: 0, max: this.data.length - 1 },
		compareFn = compareFn || this.defaultCompareFn.bind(this);
	while (range.min <= range.max) {
		var midindex = SortedArrayMath.midpoint(range.min, range.max),
			midvalue = this.data[midindex],
			decision = this.direction * compareFn(midvalue, value);
		if (decision == 0) {
			return { value: midvalue, id: midindex };
		} else if (decision > 0) {
			range.max = midindex - 1; // "Левая" часть массива
		} else if (decision < 0) {
			range.min = midindex + 1; // "Правая" часть массива
		} else {
			// Ругнёмся на плохое сравнение
			var error = new Error("Странная функция сравнения...");
			console.log(error.stack, "возвратила '",decision,"'", "искали", value, "наткнувшись на", midvalue);
			// И выйдем из цикла
			break;
		}
	}
}

/**	Вставить элемент по порядку своего ключа - значению, по которому отсортирован массив
 *	@param {number} key Искомое значение
 *	@param {function} compareFn
 *		Пользовательская функция сравнения текущего итема с ключом. См. defaultCompareFn
 *		Если она возвращает 0, значит элемент найден. Если больше 0, то
 *		поиск продолжится в меньших индексах чем индекс текущего итема ("слева"), если
 *		меньше 0, то в бОльших ("справа").
 */
SortedArray.prototype.insert = function (value, compareFn) {
	var range = { min: 0, max: this.data.length - 1 },
		compareFn = compareFn || this.defaultCompareFn.bind(this);

	//
	// Граничные решения
	//

	// Если пустой массив, сразу вставляем
	if (this.data.length == 0) {
		this.data.push(value);
		return {
			id: 0,
			value: value
		};
	}

	// Может в самое начало сразу?
	if (
		( this.direction > 0
				&& this.getKey(value) < this.getKey(this.data[0]) )
		|| ( this.direction < 0
				&& this.getKey(value) > this.getKey(this.data[0]) )
	) {
		this.data.unshift(value);
		return {
			id: 0,
			value: value
		};
	}
	// Или может в конец самый?
	if (
		( this.direction > 0
				&& this.getKey(value) > this.getKey(this.data[this.data.length-1]) )
		|| ( this.direction < 0
				&& this.getKey(value) < this.getKey(this.data[this.data.length-1]) )
	) {
		this.data.push(value);
		return {
			id: this.data.length - 1,
			value: value
		};
	}

	//
	// Не срослось по-хорошему, срастется по-умному. Магическая фраза
	// "Ищем всегда справа, чтобы вставить слева от найденного" означает
	// некий вариант алгоритма - можно делать наоборот, ни на что не влияет.
	// Просто особеннность проверок.
	//

	while (range.min < range.max) {
		var midindex = SortedArrayMath.midpoint(range.min, range.max),
			midvalue = this.data[midindex],
			decision = this.direction * compareFn(midvalue, value);
		if (decision > 0) {
			// Лезем в "левую" часть массива
			range.max = midindex - 1;
		} else if (decision < 0) {
			// Лезем в "правую" часть массива
			range.min = midindex + 1;
		} else if (decision == 0) {
			// Вылазим совсем из цикла так как нашли вдруг индентичный элемент,
			// что сразу даёт нам нужный индекс. Переходим к логике вставки в конце функции...
			range.min = midindex;
			range.max = midindex;
			break;
		} else {
			// Ругнёмся на плохое сравнение
			var error = new Error("Странная функция сравнения...");
			console.log(error.stack, "возвратила '",decision,"'", "искали", value, "наткнувшись на", midvalue);
			// И выйдем из цикла
			break;
		}
	}

	// Странные ошибки алгоритма
	if (range.min != range.max) {
		var error = new Error("Чет странное в алгоритме случилось, диапазон не схлопнулся");
		console.log(error.stack, "Диапазон от %s до %s", range.min, range.max);
		return;
	}

	// Теперь думаем вставить ли слева или справа
	if (this.getKey(value) <= this.getKey(this.data[range.min])) {
		if (this.direction > 0) {
			indexToInsertTo = range.min
		} else {
			indexToInsertTo = range.min + 1;
		}
	} else {
		if (this.direction > 0) {
			indexToInsertTo = range.min + 1;
		} else {
			indexToInsertTo = range.min
		}
	}

	// Магия успеха
	this.data.splice(indexToInsertTo, 0, value);
	return {
		id: indexToInsertTo,
		value: value
	};

	var indexToInsertTo;
}

/**	Получить элемент по индексу (смолочкомсмёдом имитация "[]")
 *	@param {number} index Если отрицательный, считаем с конца
 */
SortedArray.prototype.get = function (index) {
	if (index < 0) return this.data[this.data.length + index];
	else return this.data[index];
};

/**	Длина массива (смолочкомсмёдом имитация .length) */
SortedArray.prototype.length = function () {
	return this.data.length;
};

/** Получить элемент в серединке диапазона
 * @param {number} min
 * @param {number} max
 */
SortedArray.prototype.getAtMidpoint = function (min, max) {
	return this.data[window.SortedArrayMath.midpoint(min, max)];
}

/** Вспомогательная математика */

window.SortedArrayMath = {
	/**	Найти среднее значение. Округляем в меньшую сторону
	 *	@param {number} min
	 *	@param {number} max
	 */
	midpoint: function (min, max) {
		return Math.floor((min + max) * 0.5);
	}
};

/**	Что-то ещё вспомогательное */

window.safeCheckObjectChild = function (object, child) {
	if (!object) {
		return false;
	} else {
		return object[child];
	}
};

