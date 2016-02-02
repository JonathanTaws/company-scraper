"use strict";

var express = require('express');
var config = require('./config');
var path = require('path');
var linkedInCrawler = require('./helpers/linkedInCrawler');
var twitterCrawler = require('./helpers/twitterCrawler');

var app = express();
//app.use('/views',express.static('..' + __dirname + '/app'));

var projectRoot = __dirname + '/..';

var CONTENT_TYPE_APPLICATION_JSON = 'application/json';

/* Avoid CROSS Origin request */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.sendFile(path.join(projectRoot + '/app/index.html'));
});

app.get('/linkedin', function (req, res) {
    // Parse argument
    var company = req.query.company || "";
    var nbProfiles = req.query.limit || config.linkedIn.nbProfilesDefault;

    linkedInCrawler.getCompanyProfiles(company, nbProfiles, function(profiles) {
        console.log(profiles);
        res.contentType(CONTENT_TYPE_APPLICATION_JSON);
        res.send(JSON.stringify(profiles));
    });

});

app.get('/twitter', function (req, res) {
    // Parse argument
    var company = req.query.company || "";
    var nbProfiles = req.query.limit || config.twitter.nbTweetsDefault;

    twitterCrawler.getCompanyTwitterData(company, nbProfiles, function(tweets) {
        console.log(tweets);
        res.contentType(CONTENT_TYPE_APPLICATION_JSON);
        res.send(JSON.stringify(tweets));
    });

});

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});