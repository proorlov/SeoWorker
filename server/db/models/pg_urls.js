/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');
var PgDomain = require('./pg_domains');
var QueryList = require('../../models/QueryList');
var ex = require('./pg_expressions');

var PgUrls = {};


PgUrls.find = function (url) {
    return PG.logQueryOneOrNone("SELECT * FROM urls U JOIN domains D USING(DOMAIN_ID) WHERE U.URL = $1;", [url] )
};

PgUrls.get = function (url_id) {
    return PG.logQueryOne("SELECT * FROM urls U JOIN domains D USING(DOMAIN_ID) WHERE U.URL_ID = $1;", [url_id] )
};

PgUrls.getAndBlock = function (url_id) {
    return PG.logQueryOne("SELECT * FROM urls U JOIN domains D USING(DOMAIN_ID) WHERE U.URL_ID = $1;", [url_id] )
};

PgUrls.insert = function (url) {
    return PgDomain.insertIgnoreByUrl(url)
        .then(function(domain) {
            return PG.logQueryOne("INSERT INTO urls (URL, DOMAIN_ID, DATE_CREATE) SELECT $1, $2, $3 RETURNING URL_ID", [url, domain.domain_id, new Date()] )
        })
};

PgUrls.insertIgnore = function (url) {
    var list = new QueryList();
    list.push('SELECT URL_INSERT_IGNORE($1) AS URL_ID',[url])
    return
};

PgUrls.getOldUrls = function (condition_id) {
    return PG.logQuery("SELECT U.url_id, U.url FROM urls U JOIN condurls C USING(url_id) WHERE C.condition_id = $1;", [condition_id] )
};

PgUrls.getLstByCondition = function (condition_id) {
    return PG.logQuery("SELECT U.url_id, U.url FROM urls U JOIN condurls C USING(url_id) WHERE C.condition_id = $1;", [condition_id] )
};

PgUrls.blockByCondition = function (condition_id) {
    return PG.logQuery("SELECT 1;",
        [])
};

PgUrls.unBlockByCondition = function (condition_id) {
    return PG.logQuery("SELECT 1;",
        [])
};

PgUrls.incrementFailure = function (url_id) {
    return PG.logQueryOneOrNone("UPDATE urls SET FAIL_COUNT = FAIL_COUNT + 1 WHERE URL_ID = $1", [url_id])
};

module.exports = PgUrls;
