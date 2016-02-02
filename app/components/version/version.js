'use strict';

angular.module('companyScraper.version', [
  'companyScraper.version.interpolate-filter',
  'companyScraper.version.version-directive'
])

.value('version', '0.1');
