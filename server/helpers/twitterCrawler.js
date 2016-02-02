"use strict";

var config = require("../config");
var jsdom = require("jsdom");
var request = require("request");
var async = require("async");
var Tweet = require("../model/tweet");

/**
 * Return tweets based on the given companyQuery, limited to nbTweets
 * @param companyQuery
 * @param nbTweets
 * @param appCallback
 */
var getCompanyTwitterData = function(companyQuery, nbTweets, appCallback) {
    var twitterSearchURL = "";

    // Check if we are fetching real data or company data
    if(config.twitter.mockData) {
        console.log("Retrieving saved mock data from local file");
        twitterSearchURL = config.twitter.mockDataURL;
    }
    else {
        twitterSearchURL = config.twitter.baseURL + companyQuery;
    }

    console.log("Fetching " + twitterSearchURL);

    // Load twitter search in virtual dom with jQuery
    jsdom.env({
        url: twitterSearchURL,
        scripts: [config.jQuery.URL],
        done: function (errors, window) {
            var tweets = [];
            var tweetsIds = [];

            var $ = window.$;

            // jQuery micro-plugin to add an ignore functionality when using the text function
            addjQueryIgnoreFunction($);

            console.log("Crawling Twitter");

            $("div.tweet.original-tweet").each(function (i) {
                // Retrieve the tweet's id
                var id = $(this).attr("data-tweet-id");
                tweetsIds.push(id);

                // Retrieve the tweet's username
                var name = $(this).find("strong.fullname.js-action-profile-name.show-popup-with-id").text() || "A Twitter user";

                // Retrieve a user's profile image
                var profileImageSrc = $(this).find("img.avatar.js-action-profile-avatar").attr("src");

                // Retrieve a user's handle (job)
                var handle = $(this).find("span.username.js-action-profile-name").text() || "Unknown Twitter handle";

                // Retrieve the content of the tweet
                var content = $(this).find("p.TweetTextSize.js-tweet-text.tweet-text").ignore("a").text();

                // Retrieve the time at which the tweet was posted
                var time = $(this).find("a.tweet-timestamp.js-permalink.js-nav.js-tooltip")[0].getAttribute("title");

                // Create the Tweet object
                var tweet = new Tweet();
                tweet.id = id;
                tweet.name = name;
                tweet.image = profileImageSrc;
                tweet.handle = handle;
                tweet.content = content;
                tweet.time = time;

                // Add it to the tweet list
                tweets.push(tweet);

                return i < nbTweets - 1;
            });

            // Asynchronously add the HTML representation of the tweet for every tweets
            async.forEach(tweets, function(tweet, callback) {
                getEmbeddedTweetHTML(tweet.id, function(jsonContent) {
                    var embeddedTweet = jsonContent;

                    console.log(embeddedTweet);

                    tweet.html = embeddedTweet.html;

                    callback();
                });
            }, function (err) {
                if (err) {
                    console.error("Async foreach error : " + err.message);
                }
                console.log(tweets);
                appCallback(tweets);
            });
        }
    });

}

/**
 * Get the HTML to embed the Tweet on a webpage based on its id
 * @param id
 * @param callback
 */
function getEmbeddedTweetHTML(id, callback) {
    var oEmbedSearchURL = config.twitter.oEmbedURL + "id=" + id;
    request.get(oEmbedSearchURL, function(error, response, body) {
        if(error) {
           console.log("Error - Querying oEmbed Twitter API for id '" + id + "' -> " + e.message);
           callback({});
        }

        if(response.statusCode !== 200) {
           console.log("Error - Invalid status code returned ", response.statusCode);
            callback({});
        }

        var jsonContent = JSON.parse(body);
        callback(jsonContent);
    });
}

/**
 * jQuery micro-plugin to add an ignore function to the jQuery library locally
 * This ignore function removes from the current "this" the specified element in sel
 * Useful when using the text function to remove hidden tags that are not directly useful content
 * @param jQuery The jQuery variable
 */
function addjQueryIgnoreFunction(jQuery) {
    jQuery.fn.ignore = function(sel){
        return this.clone().find(sel||">*").remove().end();
    };
}

module.exports.getCompanyTwitterData = getCompanyTwitterData;