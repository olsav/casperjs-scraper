var system = require('system');

// TODO improve flags from CLI
if (system.args.length < 5) {
  console.info("You need to pass in city name, start from price [and optionally to price]");
  phantom.exit( 1 );
}

var userData = {
  price: system.args[4],
  priceTo: (system.args[5]) ? system.args[5] : null,
  base_uri: 'http://blagovist.ua/search/apartment/rent'
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

//Casper bind fix http://stackoverflow.com/questions/25359247/casperjs-bind-issue
casper.on( 'page.initialized', function(){
    this.evaluate(function(){
        var isFunction = function(o) {
            return typeof o == 'function';
        };

        var bind,
            slice = [].slice,
            proto = Function.prototype,
            featureMap;

        featureMap = {
            'function-bind': 'bind'
        };

        function has(feature) {
            var prop = featureMap[feature];
            return isFunction(proto[prop]);
        }

        // check for missing features
        if (!has('function-bind')) {
            // adapted from Mozilla Developer Network example at
            // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
            bind = function bind(obj) {
                var args = slice.call(arguments, 1),
                    self = this,
                    nop = function() {
                    },
                    bound = function() {
                        return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
                    };
                nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
                bound.prototype = new nop();
                return bound;
            };
            proto.bind = bind;
        }
    });
});

// Scraper algorithm itself
casper.start(userData.base_uri).then(function() {
  this.echo('OPEN PAGE');
  helpers.capturePage(casper);
});

casper.then(function() {
    this.click("#edit-NRooms-1");
    this.click("#edit-KievCheck-2");
    this.sendKeys("#edit-Price-from", userData.price, {reset: true});
    this.sendKeys("#edit-Price-to", userData.priceTo, {reset: true});
    this.thenClick(xpath('//input[@type="submit"]'));
});

casper.waitForSelector(xpath('//a[contains(text(), "Цена от max к min")]'), function() {
    this.click(xpath('//a[contains(text(), "Цена от max к min")]'));
}, function(){
    this.echo('Could not wait for sort element');
    this.exit( 1 );
}, 10000);

casper.then(function() {
    this.wait(2000, function() {
        this.echo("OUTPUT PAGE");
        helpers.capturePage(casper);
    });
});

casper.run(function() {
  helpers.capturePage(casper);
  this.echo('Logs saved to ' + helpers.getCurrentScrapeDir());
  this.exit();
});
