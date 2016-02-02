'use strict';

describe('companyScraper.version module', function() {
  beforeEach(module('companyScraper.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
