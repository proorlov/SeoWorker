/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgConditions = require("./server/db/postgres/pg_conditions");
 *  var conditions = new PgConditions();
 *
 *  //вставить строку в таблицу conditions
 *  conditions.insert (
 *      <condition_query>,
 *      <sengine_id>,
 *      <callback>,
 *      <errback>
 *  )
 *    returns <new condition_id>
 *
 *  //получить все строки из conditions
 *  conditions.list (<callback>,<errback>)
 *    returns [{condition_id , sengine_id , ...}, ...]
 *
 *  //получить строку из conditions с помощью condition_id
 *  conditions.get (<condition_id>,<callback>,<errback>)
 *    returns {condition_id , sengine_id , ...}
 *
 *  //получить строки из conditions с помощью condition_query и sengine_id
 *  conditions.find (<condition_query>,<sengine_id>,<callback>,<errback>)
 *    returns [{condition_id , sengine_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgConditions() {

};

PgConditions.prototype.insert = function (condition_query, sengine_id, region, size_search) {

    var date_create = new Date();
    // create a Url
    var db;
    return new PG()
        .then(function (dbres) {
            db = dbres;
            console.log("INSERT INTO conditions (condition_query, sengine_id, region, size_search, date_create) VALUES ("+condition_query+"," +sengine_id+"," + region+"," +size_search+"," + date_create+");")
            return db.transact(
                "INSERT INTO conditions (condition_query, sengine_id, region, size_search, date_create) VALUES ($1, $2, $3, $4, $5);",
                [condition_query, sengine_id, region, size_search, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('conditions','condition_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("PgConditions.prototype.insert");
            return res.rows[0].currval;
        })

        .catch(function (err) {
            console.log(err)
            throw('PgConditions.prototype.insert ' + err);
        });
}

PgConditions.prototype.list = function () {
    return PG.query("SELECT * FROM conditions ORDER BY date_create desc;",
        [])
        .then(function (res) {
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.list' + err;
        })
}

PgConditions.prototype.get = function (id, callback, errback) {
    return PG.query("SELECT * FROM conditions WHERE condition_id = $1;",
        [id]
    )
        .then(function (res) {
            return res.rows[0];
        }
    )
        .catch(function (err) {
            throw 'PgConditions.prototype.get';
        })
}

PgConditions.prototype.getWithSengines = function (id) {
    return PG.query("SELECT * FROM conditions " +
            " JOIN sengines ON sengines.sengine_id = conditions.sengine_id " +
            " WHERE condition_id = $1;",
        [id])
        .then(function (res) {
            console.log("PgConditions.prototype.getWithSengines")
            return res.rows ? res.rows[0] : null;
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.getWithSengines ' + err;

        })
}

PgConditions.prototype.getCurrentSearchPage = function (condition_id, date_old) {
    return PG.query("SELECT \
                MAX(P.PAGE_NUMBER) AS PAGE_NUMBER, COUNT(P.SPAGE_ID) AS COUNT, P.SEARCH_ID \
            FROM \
                spages P \
                JOIN scontents SC \
                    ON P.SPAGE_ID = SC.SPAGE_ID \
            WHERE  \
            P.SEARCH_ID =  \
                (  \
                    SELECT  \
                        S.SEARCH_ID  \
                    FROM  \
                        search S  \
                    WHERE  \
                        S.CONDITION_ID = $1 \
                        AND S.DATE_CREATE >= '" +  date_old.toISOString() + "' \
                    ORDER BY S.DATE_CREATE DESC \
                    LIMIT 1 \
                ) \
            GROUP BY P.SEARCH_ID \
            ;" ,
        [condition_id])
        .then(function (res) {
            console.log("getCurrentSearchPage")
            return res.rows ? res.rows[0] : null;
        })
        .catch(function (err) {
            console.log(err)
            throw 'PgConditions.prototype.get' + err;

        })
}

PgConditions.prototype.getLastNotSearchedRandomTask = function (range, dateOld){
    return PG.query(
            "select " +
                "t.condition_id, " +
                "T2.TASK_ID IS NOT NULL AS IS_COND_ALREADY_CALC, " +
                "u.url, " +
                "t.task_id  " +
            "FROM " +
                "tasks t " +
                "INNER JOIN usurls uu " +
                    "ON uu.usurl_id=t.usurl_id " +
                "INNER JOIN urls u " +
                    "ON uu.url_id=u.url_id " +
                "LEFT JOIN tasks T2 " +
                    "ON T.CONDITION_ID = T2.CONDITION_ID " +
                    "AND T2.DATE_CALC >= $2 " +
            "WHERE " +
                "t.DATE_CALC is null " +
                "OR t.DATE_CALC < $2 " +
            "ORDER BY " +
                "t.date_create desc " +
            "OFFSET random()*$1 " +
            "LIMIT 1;",
        [range,dateOld.toISOString().substr(0,10)]
    )
        .then(function (res) {
//            console.log('PgConditions.prototype.getLastNotSearchedRandomCondition')
            return res.rows[0];
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.getLastNotSearchedRandomCondition ' + err;
        })
}

PgConditions.prototype.find = function (condition_query, sengine_id, region, size_search) {
    return PG.query("SELECT * FROM conditions WHERE condition_query = $1 and sengine_id = $2 and " +
            "region = $3 and size_search = $4;",
        [condition_query, sengine_id, region, size_search]
    )
        .then(function (res) {
            console.log('PgConditions.prototype.find')
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.find ' + err;
        })
}

module.exports = PgConditions;
