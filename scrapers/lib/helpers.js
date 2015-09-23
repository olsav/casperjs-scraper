'use strict';
module.exports = {
  currentScrapeUID: (function() {
    // 1.6 million combinations
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
  }()),
  outputDir: 'logs',
  getCurrentScrapeName: function() {
    return 'Scrape_' + this.currentScrapeUID
  },
  getCurrentScrapeDir: function() {
    return this.outputDir + '/' + this.getCurrentScrapeName()
  },
  pageCnt: 1,
  capturePage: function(casper) {
    casper.captureSelector(this.getCurrentScrapeDir() + '/page' + this.pageCnt + '.png', 'html');
    this.pageCnt++;
  },
  savePage: function(html) {
    this.saveFile(this.getCurrentScrapeDir() + '/page' + this.pageCnt + '.html', html);
  },
  saveFile: function(path, string) {
    try {
      var fs = require('fs');
      fs.write(path, string, 'w');
    } catch ( e ) {
      throw error('Error writing a file ' + e);
    }
  },
  contains: function(haystack, needle) {
    var haystackLC = haystack.toLowerCase();
    var needleLC = needle.toLowerCase();

    return (haystackLC !== undefined) && (haystackLC.indexOf(needleLC) !== -1);
  }
};
