// Задачи

// function Order (args) {
//     //
// };

// function Chaos (args) {
//     //
// };

// Chaos.prototype.order = function (args) {
//     return new Order(this, args);
// };

// Order.prototype.chaos = function (args) {
//     return new Chaos(this, args);
// };


angular.module("Cambatron")
    .factory("Dao", ["$filter", "toArrayFilter", function ($filter, toArrayFilter) {

        //
        // Порядок
        //

        function Order (chaos, params) {
            if (params.orderBy) {
                var directionProperty = params.direction > 0 ? "+" + params.orderBy : "-" + params.orderBy;
                this.order = $filter("orderBy")(toArrayFilter(chaos), directionProperty)
            } else {
                this.order = toArrayFilter(chaos);
            }
            // Сохраняем описание порядка
            this.params = angular.copy(params);
        };

        Order.prototype.chaos = function (params) {
            return new Chaos(this.order, angular.extend(angular.copy(params), { parent: this.params }));
        };

        //
        // Хаос
        //

        function Chaos (order, params) {
            //
            this.chaos = {};
        };

        Chaos.prototype.order = function (params) {
            return new Order(this.chaos, angular.extend(angular.copy(params), { parent: this.params }));
        };

        //
        // Инициализация хаоса/порядка
        //

        return {
            createChaos: function (order, params) {
                return new Chaos(order, params);
            },
            createOrder: function (chaos, params) {
                return new Order(chaos, params);
            }
        };
    }])

    .factory("SomeFactory", [function () {
        //
    }])

    .factory("TaskNode", ["Tasks", "$filter", function (Tasks, $filter) {
        function tasknode (obj) {
            // Обёртываем исходный таск
            this.task = obj.task;

            // в первую очередь узел может содержать другие узлы
            this.children = obj.children || [];

            // кроме того, это может быть последний узел, содержащий акты
            this.acts = obj.acts || [];

            // кешируем длительность
            this.duration = this.getDuration();

            // кешируем имя
            this.name = this.getName();

            // кешируем время старта
            this.start = this.getStart();
        };

        tasknode.prototype.getDuration = function () {
            var actsSum = 0,
                childrenSum = 0;

            // суммируем акты
            if (this.acts.length > 1) {
                var i = 1;
                actsSum = this.acts.reduce(function (prev, curr) {
                    console.log(i, prev, curr);
                    return (prev.stop - prev.start) + (curr.stop - curr.start);
                });
            } else if (this.acts.length > 0) {
                actsSum = this.acts[0].stop - this.acts[0].start;
            }

            // рекурсивно суммируем длительность детей
            if (this.children.length > 1) {
                childrenSum = this.children.reduce(function (prev, curr) {
                    return prev.getDuration() + curr.getDuration();
                });
            } else if (this.children.length > 0) {
                childrenSum = this.children[0].getDuration();
            }

            // всё вместе отдаём
            return actsSum + childrenSum;
        };

        tasknode.prototype.refreshDuration = function () {
            this.duration = this.getDuration();
        };

        tasknode.prototype.getName = function () {
            return this.task ? this.task.name : "";
        };

        tasknode.prototype.refreshName = function () {
            this.name = this.getName();
        };

        tasknode.prototype.getStart = function () {
            var actsStart = Number.MAX_VALUE,
                childrenStart = Number.MAX_VALUE;
            if (this.acts.length > 0) {
                actsStart = $filter("orderBy")(this.acts, "-start")[0].start;
            }

            if (this.children.length > 0) {
                childrenStart = this.children[0].getStart();
            }
            return Math.min(actsStart, childrenStart);
        };

        tasknode.prototype.refreshStart = function () {
            this.start = this.getStart();
        };

        // При получении события о новом или измененном нужно определить относится
        // ли оно к нашему узлу или нашим детям
        // новый таск (=новый акт), удалить таск (=удаление акта),
        // изменение имени узла (создание нового таска в tasks)

        // сортировка по датам не требует создание узлов
        // а вот по дереву - требует. Точнее теоретически можно и для дат создавать узлы
        // чтоб хранить предефайнед отчёты, например. Или даже чтоб само обновлялось...
        // ведь это будет один и тот же объект... теоретически

        return {
            create: function (obj) {
                // узел - это временная обертка для таска, для одного таска оберток
                // может быть много. Но и в одной обертке может быть много тасков
                return new tasknode(obj);
            }
        };
    }])
    .factory("TaskNodeList", ["TaskNode", "Tasks", "Acts", "$timeout", "$filter", "toArrayFilter", "periodstartFilter", function (TaskNode, Tasks, Acts, $timeout, $filter, toArrayFilter, periodstartFilter) {

        // Тасклист - умный список, могущий себя (или других пересортировывать),
        // Он хранит тайные данные - все acts (или ссылки на все acts)
        // если подписываемся на события, не забыть сделать возможность отписки
        // и в контроллерах будем отписываться

        function livetasknode (actslist, tasklist) {
            // имеет набор актов, чтобы пересобираться
            this.actslist = actslist;

            // имеет собственно дерево элементов
            this.tasktree = [];
        };

        // умеет отдавать полный набор своих актов
        livetasknode.prototype.all = function () {
            var self = this, tasktree = [];
            asyncLoop({
                length: self.actslist.length,
                functionToLoop: function (loop, i) {
                    var act = self.actslist[i];

                    self.tasktree.push(TaskNode.create({
                        task: Tasks.collection()[act.taskid],
                        acts: [act]
                    }));

                    $timeout(function () {
                        loop();
                    }, 12);
                },
                callback: function () {}
            });

            return tasktree;
        };

        // сортировать в себе или отдавать копию?
        // при создании давать акты или если даем акты, то сотрировать их и давать копию,
        // а если не даем, сортировать и перестраивать себя?
        // каков корневой список?


        return {
            init: function (ascending) {
                var actslist = $filter("orderBy")(toArrayFilter(Acts.collection()), (ascending ? "+start": "-start"));
                return new livetasklist(actslist);
            },
            all: function (ascending) {
                var actslist = $filter("orderBy")(toArrayFilter(Acts.collection()), (ascending ? "+start": "-start")),
                    tasknodelist = [];

                asyncLoop({
                    length: actslist.length,
                    functionToLoop: function (loop, i) {
                        var act = actslist[i];

                        tasknodelist.push(TaskNode.create({
                            task: Tasks.collection()[act.taskid],
                            acts: [act]
                        }));

                        $timeout(function () {
                            loop();
                        }, 12);
                    },
                    callback: function () {}
                });

                return tasknodelist;
            },
            byPeriod: function (period, ascending) {
                var actslist = $filter("orderBy")(toArrayFilter(Acts.collection()), (ascending ? "+start": "-start")),
                    tasknodelist = [];

                // тут сложнее. проходим по каждому акту и проверяем
                // принадлежность к периоду. Если совпадает с предыдущим, кладем
                // в текущий узел группы, если не сопадает (или не было предыдущего),
                // создаем новый узел и делаем его текущим.

                var currentPeriod, currentPeriodNode, currentTaskNode;

                // возможно (неужели? нужно будет делать узлы актов, хотя врядли)

                asyncLoop({
                    length: actslist.length,
                    functionToLoop: function (loop, i) {
                        var act = actslist[i],
                            actPeriod = periodstartFilter(act.start, period).getTime();

                        // Добавляем узел периода времени
                        if (actPeriod != currentPeriod) {
                            currentPeriod = actPeriod;

                            var tasknode = TaskNode.create({
                                children: [TaskNode.create({
                                    task: Tasks.collection()[act.taskid],
                                    acts: [act]
                                })]
                            });

                            tasknodelist.push(tasknode);

                            currentPeriodNode = tasknode;
                            currentTaskNode = tasknode.children[0];
                        }
                        // Добавляем узел задачи внутрь периода времени
                        else {
                            // 1. если акт относится к предыдущему таску, сливаем с ним
                            if (act.taskid == currentTaskNode.task.id) {
                                currentTaskNode.acts.push(act);
                            }
                            // 2. Если не относится, создаем новый узел задачи
                            else {
                                var tasknode = TaskNode.create({
                                    task: Tasks.collection()[act.taskid],
                                    acts: [act]
                                });

                                currentPeriodNode.children.push(tasknode);
                                currentTaskNode = tasknode;
                            }
                        }

                        $timeout(function () {
                            loop();
                        }, 12);
                    },
                    callback: function () {}
                });

                return tasknodelist;
            }
        };
    }])
    // .factory("Tasks", ["tasks", "newItemId", "Acts", "$rootScope", "$q", "$timeout", "$filter", "toArrayFilter", function (tasks, newItemId, Acts, $rootScope, $q, $timeout, $filter, toArrayFilter) {

    //     function getIndex (task, list) {
    //         var imin = 0,
    //             imax = list.length - 1;

    //         while (imin <= imax) {
    //             var imid = imin + Math.ceil((imax-imin)/2);
    //             if (list[imid] == task) {
    //                 return imid;
    //             } else {
    //                 // наш таск позже, в начале
    //                 if (list[imid].start < task.start) {
    //                     imax = imid - 1;
    //                 }
    //                 // наш таск раньше, в конце
    //                 else {
    //                     imin = imid + 1;
    //                 }
    //             }
    //         };

    //         console.log("task not found or order invalid");
    //         return -1;
    //     };

    //     function getNearestIndexes (timestamp, list) {
    //         var imin = 0,
    //             imax = list.length - 1;

    //         while (imax - imin > 2) {
    //             var imid = imin + Math.ceil((imax-imin)/2);
    //             if (timestamp > list[imid].start) {
    //                 imax = imid;
    //             } else if (timestamp == list[imid].start) {
    //                 return imid;
    //             } else {
    //                 imin = imid;
    //             }
    //         }
    //         return [imin, imax];
    //     };

    //     function LiveList(list, type) {
    //         var self = this;

    //         self.list = list;

    //         $rootScope.$on("task.created", function (event, task) {
    //             console.log("task.created", task);
    //             self.list.unshift(task);
    //         });

    //         $rootScope.$on("task.updated", function (event, task) {
    //             console.log("task.updated", task);
    //         });

    //         $rootScope.$on("task.removed", function (event, task) {
    //             console.log("task.removed", task);
    //         });
    //     };

    //     return {
    //         create: function (obj) {
    //             var task,
    //                 taskid = newItemId("tasks"),
    //                 name,
    //                 act;

    //             if (!obj.acts) {
    //                 obj.acts = [Acts.create({
    //                     start: (obj.start ? obj.start : (new Date()).getTime()),
    //                     taskid: taskid
    //                 }).id];
    //             }
    //             if (!obj.name) {
    //                 obj.name = obj.name ? obj.name : "Задача " + (new Date()).getTime();
    //             }

    //             task = {
    //                 id: taskid,
    //                 name: obj.name,
    //                 acts: obj.acts
    //             };
    //             tasks[taskid] = task;
    //             $rootScope.$broadcast("task.created", task);
    //             return task;
    //         },
    //         /*
    //         acts:
    //             - split
    //             - group by taskid
    //             - group by start/stop (day, week, month, year, all)
    //             - order by start/stop
    //         tasks:
    //             - order by last updated
    //             - order by parent
    //             - order by duration


    //         */
    //         orderByStart: function (range, direction) {
    //             var deferredList = $q.defer(),
    //                 tasklist = [],
    //                 actslist = $filter("orderBy")(toArrayFilter(Acts.acts_), (direction > 0 ? "+start" : "-start")),
    //                 iterator = 0;

    //             function parseAct() {
    //                 tasklist.push(actslist[iterator].taskid);
    //                 iterator = iterator + 1;
    //                 if (iterator < actslist.length) {
    //                     $timeout(function () {
    //                         console.log("parse");
    //                         parseAct(iterator);
    //                     }, 10);
    //                 }
    //             }

    //             parseAct();

    //             return new LiveList(tasklist, (direction > 0 ? "+all" : "-all"));
    //         },
    //         byId: function (taskid) {
    //             return tasks[taskid];
    //         },
    //         duration: function (data) {
    //             if (Array.isArray(data)) {
    //                 // массив штуковин (таски или акты)
    //             } else {
    //                 // Объект с ключами - нужно все перебрать
    //             }
    //         }
    //     };
    // }])

/*

из хаоса актов и задач мы должны создавать на лету живые списки:
- простейший список последовательности задач во времени
    - перевод хаоса в последовательность (массив), затем группировка соседних идентичных задач
    - базовый список, на котором могу основываться остальные или вырезаться из него

мы должны уметь создавать деревья на лету, где каждый узел - умный таск, способный узнать
свою длительность, начало и конец:
- простейшее дерево из дней.
    - хаос-()-последовательность из дней - группировка соседних идентичных

Создать первые группы из идентичных задач - это по сути уже задача на дерево. А, нет,
первое дерево у нас уже есть - список тасков. А, но не алгоритмизировано создание дерева.
    - способ 1: столько проходов пока не останется корневых. Каждый раз перезаписываем
    "контейнер" с новым списком
    - способ 2: за один проход восстановить полностью дерево

расположение внутри дерева тоже мы должны уметь сортировать - например по последнему изменению

*/


    // .factory("Timeline", ["acts", "$filter", "periodstartFilter", "toArrayFilter", function (acts, $filter, periodstartFilter, toArrayFilter) {

    //     var list = $filter("orderBy")(toArrayFilter(acts), "-start"),
    //         lastid = 118;

    //     // console.log(JSON.stringify(list));

    //     function getId (task, timeline) {
    //         var imin = 0,
    //             imax = timeline.length - 1;

    //         while (imin <= imax) {
    //             var imid = imin + Math.ceil((imax-imin)/2);
    //             if (timeline[imid] == task) {
    //                 return imid;
    //             } else {
    //                 // наш таск позже, в начале
    //                 if (timeline[imid].start < task.start) {
    //                     imax = imid - 1;
    //                 }
    //                 // наш таск раньше, в конце
    //                 else {
    //                     imin = imid + 1;
    //                 }
    //             }

    //         }

    //         console.log("task not found or order invalid");
    //         return -1;
    //     };

    //     function getIdOfNearestNewer (timestamp, timeline) {
    //         var imin = 0,
    //             imax = timeline.length - 1;

    //         while (imax - imin > 1) {
    //             var imid = imin + Math.ceil((imax-imin)/2);
    //             if (timestamp > timeline[imid].start) {
    //                 imax = imid;
    //             } else if (timestamp == timeline[imid].start) {
    //                 return imid;
    //             } else {
    //                 imin = imid;
    //             }
    //         }
    //         return imin;
    //     }

    //     function getLast (period) {
    //         var timestart = periodstartFilter(list[0].start, period);
    //         console.log(timestart, timestart.getTime(), getIdOfNearestNewer(timestart.getTime(), list));
    //         return list.slice(0, getIdOfNearestNewer(timestart, list) + 1);
    //     };

    //     return {
    //         add: function () {
    //             list.unshift({
    //                 start: (new Date()).getTime(),
    //                 name: "Sample some " + Math.ceil(Math.random()*10000),
    //                 stop: (new Date()).getTime(),
    //                 id: String(lastid)
    //             });
    //             lastid = lastid + 1;
    //             return list[0];
    //         },
    //         remove: function (task) {
    //             return list.splice(getId(task, list), 1);
    //         },
    //         getLast: getLast,
    //         list: list
    //     };
    // }])
    // .run(["$rootScope", "Timeline", "Timer", function ($rootScope, Timeline, Timer) {

    //     $rootScope.tasks = Timeline.list;

    //     // $rootScope.createTask = function () {
    //     //     Timer.start(Timeline.add());
    //     // };

    //     $rootScope.deleteTask = function (task) {
    //         Timeline.remove(task);
    //         if (task == Timer.task()) {
    //             Timer.stop();
    //         }
    //     };

    //     $rootScope.timer = Timer;

    //     $rootScope.lastday = {
    //         tasks: Timeline.getLast("day"),
    //         date: new Date(Timeline.list[0].start)
    //     };

    //     $rootScope.lastweek = {
    //         tasks: Timeline.getLast("week"),
    //         date: new Date(Timeline.list[0].start)
    //     };

    //     $rootScope.lastmonth = {
    //         tasks: Timeline.getLast("month"),
    //         date: new Date(Timeline.list[0].start)
    //     };

    //     $rootScope.lastyear = {
    //         tasks: Timeline.getLast("year"),
    //         date: new Date(Timeline.list[0].start)
    //     };

    // }]);