var KeyScraper = require('npm-keyword-scraper');
var BASE_KEYWORDS = ['jam3', 'ui', 'component'];

// returns modules from npm that match the component type
module.exports = function(type, cb) {
  var keywords;
  switch(type) {
    case 'react':
      keywords = BASE_KEYWORDS.concat('react');
      break;
    case 'react-f1':
      keywords = BASE_KEYWORDS.concat('react-f1');
      break;
    case 'bigwheel':
      keywords = BASE_KEYWORDS.concat('bigwheel');
      break;
  }
  var keyScraper = new KeyScraper({
    keywords: keywords,
    level: 3
  });
  keyScraper.getFromKeywords(function(modules) {
    cb(modules);
  });
};