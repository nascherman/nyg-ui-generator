var fs = require('fs.extra');
var path = require('path');
var _ = require('lodash');

module.exports = function (array) {

  if (!array.length) {
    return;
  }

  array = array.sort().map(function (f) {
    return path.dirname(f);
  });

  var first = array[0];
  var last = array[array.length - 1];
  var i = 0;
  while (i < first.length && first.charAt(i) === last.charAt(i)) i++;

  return first.substring(0, i);
};