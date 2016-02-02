'use strict';

// Declare app level module which depends on views, and components
angular.module('companyScraper', [
  'ngRoute',
  'companyScraper.search',
  'companyScraper.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/search'});
}]);
