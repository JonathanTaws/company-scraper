"use strict";

/**
 * Check if the given string is a positive integer
 * @param str The string to check
 * @returns {boolean}
 */
var isPositiveInteger = function(str) {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
}

module.exports.isPositiveInteger = isPositiveInteger;