'use strict';

angular.module('companyScraper.search', ['ngRoute', 'ngTwitter', 'angular-loading-bar', 'ngSanitize', 'ngtweet', 'jkuri.touchspin'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/search', {
    templateUrl: 'search/search.html',
    controller: 'SearchCtrl'
  });
}])

.controller('SearchCtrl', function($scope, $http, $sce) {
    // Initialize global variables
    $scope.error = false;
    $scope.showRawContent = false;
    $scope.hasLinkedInData = false;
    $scope.hasTwitterData = false;

    $scope.searchForCompany = function() {
        // Set the "has" properties to false to clear the previous data
        $scope.hasLinkedInData = false;
        $scope.hasTwitterData = false;

        // Check if a query was provided
        if(!$scope.searchQuery || !$scope.searchQuery.length) {
            console.log("No search query provided");
            $scope.error = "Please provide a company name to search";
            return;
        }

        var encodedQuery = encodeURIComponent($scope.searchQuery);

        // Fetch data from Twitter & LinkedIn
        getTwitterData();
        getLinkedInData();

        /**
         * Helper function used to return trusted HTML
         * @param rawContent The HTML raw content to render safe
         * @returns {*}
         */
        $scope.getRawHTML = function(rawContent) {
            console.log("Called with : " + rawContent);
            return $sce.trustAsHtml(rawContent);
        }

        /**
         * Fetches Twitter data based on query and sets DOM accordingly with content
         */
        function getTwitterData() {
            var twitterURL = 'http://localhost:3000/twitter?company=' + $scope.searchQuery;
            // If a nb of results was specified
            if($scope.nbResults) {
                twitterURL += '&limit=' + $scope.nbResults;
            }
            $http.get(twitterURL)
                .success(function(tweets) {
                    console.log(tweets.length);
                    $scope.rawResult = tweets;
                    $scope.tweets = tweets;
                    $scope.hasTwitterData = true;
                })
                .error(function(object, error) {
                    $scope.hasTwitterData = false;
                    $scope.error = "Server unavaible, please try again later on !";
                    console.log("Couldn't reach the server : is it on ? Error : " + error);
                });
        }

        /**
         * Fetches LinkedIn data based on query and sets DOM accordingly with content
         */
        function getLinkedInData() {
            var linkedInURL = 'http://localhost:3000/linkedin?company=' + $scope.searchQuery;
            // If a nb of results was specified
            if($scope.nbResults) {
                linkedInURL += '&limit=' + $scope.nbResults;
            }
            $http.get(linkedInURL)
                .success(function(profiles) {
                    console.log(profiles.length);
                    $scope.linkedInProfiles = profiles;
                    $scope.hasLinkedInData = true;
                })
                .error(function(object, error) {
                    $scope.hasLinkedInData = false;
                    $scope.error = "Server unavaible, please try again later on !";
                    console.log("Couldn't reach the server : is it on ? Error : " + error);
                });
        }
    }

});