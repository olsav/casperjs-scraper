var system = require('system');

// TODO improve flags from CLI
if (system.args.length < 6) {
  console.info("You need to pass in an auto brand name, from year YYYY [and optionally to year YYYY]");
  phantom.exit( 1 );
}

var userData = {
  brand: system.args[4],
  year: system.args[5],
  yearTo: (system.args[6]) ? system.args[6] : null,
  base_uri: 'http://olx.ua/'
};

var casper = require('casper').create({
      viewportSize: {
        width: 1024,
        height: 1600
      },
      verbose: true,
      logLevel: 'debug'
    }),
    xpath = require('casper').selectXPath,
    helpers = require('lib/helpers.js'),
    moment = require('../node_modules/moment');

casper.on('error', function(msg,backtrace) {
  this.echo("=========================");
  this.echo("ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});

casper.on("page.error", function(msg, backtrace) {
  this.echo("=========================");
  this.echo("PAGE.ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});

// Scraper algorithm itself
casper.start(userData.base_uri).then(function() {
  this.echo('OPEN PAGE');
  helpers.capturePage(casper);
});



casper.run(function() {
  helpers.capturePage(casper);
  this.echo('Logs saved to ' + helpers.getCurrentScrapeDir());
  this.exit();
});
