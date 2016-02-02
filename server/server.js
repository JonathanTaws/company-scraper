"use strict";

var express = require('express');
var config = require('./config');
var path = require('path');
var linkedInCrawler = require('./helpers/linkedInCrawler');
var twitterCrawler = require('./helpers/twitterCrawler');
var inputValidation = require('./helpers/inputValidation');

var app = express();

var projectRoot = __dirname + '/..';

var CONTENT_TYPE_APPLICATION_JSON = 'application/json';

/**
 *  Avoid CROSS Origin request
 */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.sendFile(path.join(projectRoot + '/app/index.html'));
});

/**
 * Return all the profiles on LinkedIn related to a given search using the query parameter "query" and "limit" to limit
 * the number of results (must be an integer)
 */
app.get('/linkedin', function (req, res) {
    // Parse argument
    var company = req.query.company || "";
    var nbProfiles = req.query.limit;

    // Check if the nbProfiles is a positive integer, else use the default value
    if(!inputValidation.isPositiveInteger(nbProfiles)) {
        nbProfiles = config.linkedIn.nbProfilesDefault
    }

    // Return the profiles fetched with the LinkedIn crawler
    linkedInCrawler.getCompanyProfiles(company, nbProfiles, function(profiles) {
        res.contentType(CONTENT_TYPE_APPLICATION_JSON);
        res.send(JSON.stringify(profiles));
    });
});

/**
 * Return all the tweets related to a given search using the query parameter "query" and "limit" to limit the number of
 * results (must be an integer)
 */
app.get('/twitter', function (req, res) {
    // Parse argument
    var company = req.query.company || "";
    var nbTweets = req.query.limit || config.twitter.nbTweetsDefault;

    // Check if the nbTweets is a positive integer, else use the default value
    if(!inputValidation.isPositiveInteger(nbTweets)) {
        nbTweets = config.linkedIn.nbProfilesDefault
    }

    // Return the tweets fetched with the Twitter crawler
    twitterCrawler.getCompanyTwitterData(company, nbTweets, function(tweets) {
        res.contentType(CONTENT_TYPE_APPLICATION_JSON);
        res.send(JSON.stringify(tweets));
    });
});

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening on localhost on port %s', port);
});