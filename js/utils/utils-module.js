/**
 *	Модуль с утилитами
 */
;(function () {
	"use strict";
	angular.module("Cambatron.utils", []);
}());

// angular.module("Cambatron")
// 	// Получить новую дату, установленную в начало календарного периода,
// 	// к которому принадлежит исходная дата. Период может быть день/неделя/месяц/год.
// 	// Например имеем момент времени 2 июля 15:06 (чт), хотим получить начало недели,
// 	// на котором случился этот момент. Получаем 29 июня 00:00 (пн). Если месяц,
// 	// получаем 1 июля 00:00. Если год, то 1 янв 00:00, и т.д.
// 	.filter("periodstart", function () {
// 		return function (date, period) {
// 			var d = (new Date(date));
// 			if (period == "day") {
// 				d.setHours(0,0,0,0);
// 			} else if (period == "week") {
// 				d.setDate(d.getDate() - d.getDay() + 1);
// 				d.setHours(0,0,0,0);
// 			} else if (period == "month") {
// 				d.setDate(1);
// 				d.setHours(0,0,0,0);
// 			} else if (period == "year") {
// 				d.setMonth(0, 1);
// 				d.setHours(0,0,0,0);
// 			};
// 			return d;
// 		}
// 	})
// 	// Преобразовать объект в массив свойств. ВНИМАНИЕ, ключи свойств при этом теряются!
// 	.filter("toArray", function () {
// 		return function (obj) {
// 			var arr;
// 			if (Array.isArray(obj)) {
// 				arr = obj.slice(0);
// 			}
// 			else {
// 				arr = [];
// 				for (var i in obj) {
// 					if (obj.hasOwnProperty(i)) {
// 						arr.push(obj[i]);
// 					}
// 				}
// 			}
// 			return arr;
// 		}
// 	});

// // @http://stackoverflow.com/questions/4288759/asynchronous-for-cycle-in-javascript
// window.asyncLoop = function(o) {
//     var i=-1;

//     var loop = function(){
//         i++;
//         if(i==o.length){o.callback(); return;}
//         o.functionToLoop(loop, i);
//     }

//     loop();
// };