
var PG = require('../../../utils/pg');
var PgConditions = require('./../pg_conditions')

var PgTasks = {}

//PgTasks.prototype.insert = function (condition_id, usurl_id, callback, errback) {
//
//    var date_create = new Date();
//    // create a Url
//    var db = new PG(
//        function () {
//            db.transact(
//                "INSERT INTO tasks (condition_id, usurl_id, date_create) VALUES ($1, $2, $3);",
//                [condition_id, usurl_id, date_create],
//                function (res) {
//                    db.transact(
//                        "SELECT currval(pg_get_serial_sequence('tasks','task_id'))",
//                        [],
//                        function (res) {
//                            console.log("task saved");
//                            callback(res.rows[0].currval);
//                        },
//                        function (err) {
//                            console.log('PgTasks.prototype.insert 1');
//                            console.log(err);
//                        },
//                        true)
//                },
//                function (err) {
//                    console.log('PgTasks.prototype.insert 2');
//                    console.log(err);
//                }
//            );
//        },
//        function (err) {
//            console.log('PgTasks.prototype.insert 3');
//            console.log(err);
//        }
//    );
//}

PgTasks.insertWithCondition = function (usurl_id, condition_query, sengine_id, region_id, size_search) {
    _this = this;
    var date_create = new Date();
    // create a Url
    if (sengine_id == 2 && !region_id){
        throw new Error('Нет региона.')
    }
    if (sengine_id == 1){
        region_id = null
    }
    var db;
    var conds;
    return PgConditions.find(condition_query, sengine_id, region_id, size_search)
        .then(function (conds_res) {
            conds = conds_res

            if (!conds.length == 0) {

                return new PgConditions().insert(condition_query, sengine_id, region_id, size_search)
            } else {
                if (conds.length > 1) {
                    throw "Дубликат условий!"
                }
                return _this.find(usurl_id, conds[0].condition_id)
                    .then(function (tasks) {
                        if (tasks.length > 0) {
                            throw "Дубликат условий у пользователя для сайта!"
                        }
                        //console.log("old condition")
                        return conds[0].condition_id
                    })
            }
        })
        .then(function (condition_id) {
            return new PG()
                .then(function (db_res) {
                    db = db_res;
                    return db.transact(
                        "INSERT INTO tasks (condition_id, usurl_id, date_create) VALUES ($1, $2, $3);",
                        [condition_id, usurl_id, date_create])
                })
        })
        .then(function (res) {
            return  db.transact(
                "SELECT currval(pg_get_serial_sequence('tasks','task_id'))",
                [], true)
        })
        .then(function (res) {
            //console.log("PgTasks.prototype.insertWithCondition");
            return res.rows[0].currval;
        })

        .catch(function (err) {
            //console.log('PgTasks.prototype.insertWithCondition ' + err);
            //console.log(err);
            throw err
        });
}

//PgTasks.prototype.updateWithCondition = function (task_id, condition_query, sengine_id, region, size_search) {
//    _this = this;
//    var condition_id;
//    return new PgConditions().find(condition_query, sengine_id, region, size_search)
//        .then(function (conds) {
//            if (conds.length == 0) {
//                return new PgConditions().insert(condition_query, sengine_id, region, size_search)
//            } else if (conds.length == 1) {
//                console.log('такие условия уже где-то были')
//                return conds[0].condition_id
//            } else {
//                throw "Повторение одинаковый условий."
//                return
//            }
//        })
//        .then(function (condition_id_res) {
//            condition_id = condition_id_res
//            return  PG.query(
//                "SELECT * FROM  tasks WHERE condition_id= $1 AND  usurl_id = (SELECT T.usurl_id FROM tasks T WHERE T.task_id = $2);",
//                [condition_id, task_id ])
//        })
//        .then(function (tasks) {
//            if (tasks.rows.length != 0) {
//
//                throw "У данной страницы уже есть такие условия.";
//                return;
//            }
//            return PG.query(
//                "UPDATE tasks SET condition_id= $1 WHERE task_id=$2;",
//                [condition_id, task_id])
//        })
//        .then(function (res) {
//            console.log("PgTasks.prototype.updateWithCondition");
//            return res;
//        })
//
//        .catch(function (err) {
//            console.log('PgTasks.prototype.updateWithCondition err ')
//            console.log(err);
//            throw err
//        });
//}
//
//PgTasks.prototype.updateWithDateCalc = function (task_id, date) {
//    _this = this;
//            return PG.query(
//                "UPDATE tasks SET date_calc= '" +  date.toISOString() + "' WHERE task_id=$1;",
//                [task_id])
//
//        //.then(function (res) {
//        //    console.log("PgTasks.prototype.updateWithDateCalc", task_id, date);
//        //    return res;
//        //})
//
//        .catch(function (err) {
//            //console.log('PgTasks.prototype.updateWithDateCalc err ')
//            //console.log(err);
//            throw err
//        });
//}
//
//PgTasks.prototype.incrementFailure = function (task_id, date) {
//
//    console.log('PgTasks.prototype.incrementFailure ' + task_id + ' - ' + date)
//    _this = this;
//            return PG.query(
//                "UPDATE tasks SET FAIL_COUNT = FAIL_COUNT + 1, DATE_CALC = '" +  date.toISOString() + "' WHERE task_id=$1;",
//                [task_id])
//        .catch(function (err) {
//            throw err
//        });
//}
//
//PgTasks.prototype.remove = function (task_id) {
//    return PG.query(
//        "UPDATE tasks SET TASK_DISABLED = True WHERE task_id=$1;",
//        [task_id])
//        .catch(function (err) {
//            throw err
//        });
//}
//
//PgTasks.prototype.find = function (usurl_id, condition_id) {
//    return PG.query("SELECT * FROM tasks WHERE usurl_id =$1 AND condition_id = $2;",
//        [usurl_id, condition_id])
//
//        .then(function (res) {
//            //console.log('PgTasks.prototype.findByCondition')
//            return res.rows;
//        })
//        .catch(function (err) {
//            //throw 'PgTasks.prototype.findByCondition' + err;
//            //console.log('PgTasks.prototype.findByCondition error: ', err);
//            throw err
//        })
//}
//
//PgTasks.prototype.findByUsurl = function (val, callback, errback) {
//    PG.query("SELECT * FROM tasks WHERE usurl_id = $1;",
//        [val],
//        function (res) {
//            callback(res.rows);
//        },
//        function (err) {
//            console.log('PgTasks.prototype.findByUsurl');
//            console.log(err);
//        })
//}
//
//PgTasks.prototype.findByCondition = function (val) {
//    return PG.query("SELECT * FROM tasks WHERE condition_id = $1;",
//        [val])
//        .then(function (res) {
//            console.log('PgTasks.prototype.findByCondition')
//            return res.rows;
//        })
//        .catch(function (err) {
//            throw 'PgTasks.prototype.findByCondition err ' + err;
//            console.log(err);
//        })
//}

module.exports = PgTasks;
