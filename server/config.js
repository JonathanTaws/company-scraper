var config = {};

// jQuery specific config
config.jQuery = {};
config.jQuery.URL = "http://code.jquery.com/jquery.js";

// Twitter specific config
config.twitter = {};
config.twitter.mockData = true;
config.twitter.mockDataURL = "http://localhost:63342/company-scraper/server/resources/twitter_search_accenture.htm";
config.twitter.baseURL = "https://twitter.com/search?q=";
// Version 1 has unauthenticated queries (1.1 needs to authenticated)
config.twitter.oEmbedURL = "https://api.twitter.com/1/statuses/oembed.json?";
config.twitter.nbTweetsDefault = 5;

// LinkedIn specific config
config.linkedIn = {};
config.linkedIn.mockData = true;
config.linkedIn.mockDataURL = "http://localhost:63342/company-scraper/server/resources/linkedin_search_accent.htm";
config.linkedIn.baseURL = "https://www.linkedin.com/title/";
config.linkedIn.nbProfilesDefault = 5;

// Export
module.exports = config;