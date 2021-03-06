"use strict";

var config = require("../config");
var jsdom = require("jsdom");
var LinkedInProfile = require("../model/linkedInProfile");

/**
 * Return profiles from LinkedIn related to companyQuery, limited to nbProfiles results
 * @param companyQuery
 * @param nbProfiles
 * @param appCallback
 */
var getCompanyProfiles = function(companyQuery, nbProfiles, appCallback) {
    var linkedInSearchURL = "";

    // Check if we are fetching real data or company data
    if(config.linkedIn.mockData) {
        console.log("Retrieving saved mock data from local file");
        linkedInSearchURL = config.linkedIn.mockDataURL;
    }
    else {
        linkedInSearchURL = config.linkedIn.baseURL + companyQuery;
    }

    console.log("Fetching " + linkedInSearchURL);

    // Load LinkedIn search in virtual dom with jQuery
    jsdom.env({
        url: linkedInSearchURL,
        scripts: [config.jQuery.URL],
        done: function (errors, window) {
            var profiles = [];

            var $ = window.$;

            console.log("Crawling LinkedIn");

            $("div.entityblock.standalone").each(function (i) {
                // Retrieve a user's name
                var anchorName = $(this).find("h3.name > a");
                var name = anchorName.text() || "A LinkedIn user";
                var link = anchorName.attr("href");

                // Retrieve a user's profile image
                var profileImage = $(this).find("img.image");
                // LinkedIn sometimes feeds the DOM for the src attribute afterwards, so we fallback on data-delayed-url
                var profileImageSrc = profileImage.attr("src") || profileImage.attr("data-delayed-url");

                // Retrieve a user's current headline (job)
                var headline = $(this).find("p.headline").text() || "No headline fetched";

                var descriptors = $(this).find("dd.descriptor");

                // Retrieve a user's current location (regional)
                var location = descriptors.eq(0).text() || "No location fetched";

                // Retrieve a user's field
                var field = descriptors.eq(1).text() || "No field fetched";

                // Retrieve current and previous companies
                var table = $(this).find("table");
                var currentCompanies = table.find("tr:first > td").text() || "No current companies fetched";;

                var previousCompanies = table.find("tr > td").eq(1).text() || "No previous companies fetched";;

                // Create the LinkedInProfile user
                var profile = new LinkedInProfile();
                profile.name = name;
                profile.link = link;
                profile.image = profileImageSrc;
                profile.headline = headline;
                profile.location = location;
                profile.field = field;
                profile.currentCompanies = currentCompanies;
                profile.previousCompanies = previousCompanies;

                // Add it to the profiles list
                profiles.push(profile);

                return i < nbProfiles - 1;
            });

            console.log(profiles);

            appCallback(profiles);
        }
    });
}

module.exports.getCompanyProfiles = getCompanyProfiles;