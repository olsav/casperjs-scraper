var system = require('system');

// TODO improve flags from CLI
if (system.args.length < 5) {
    console.info("You need to pass in brand name, from year YYYY [and optionally to year YYYY and from price to price]");
    phantom.exit( 1 );
}

var userData = {
    brand: system.args[4],
    year: system.args[5],
    yearTo: (system.args[6]) ? system.args[6] : null,
    price: (system.args[7]) ? system.args[7] : null,
    priceTo: (system.args[8]) ? system.args[8] : null,
    base_uri: 'https://auto.ria.com'
};

console.info(JSON.stringify(userData));

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
    this.wait(4000, function() {
        this.evaluate(function() {
            //TODO fix userData here
            $("#marks > option:contains('" + userData.brand + "'):first").attr("selected", "selected");
            if (userData.year) $("#year > option:contains('" + userData.year + "'):first").attr("selected", "selected");
            if (userData.yearTo) $("#yearTo > option:contains('" + userData.yearTo + "'):first").attr("selected", "selected");
        });
        if (userData.price) this.sendKeys("#priceFrom", userData.price, {reset: true});
        if (userData.priceTo) this.sendKeys("#priceTo", userData.priceTo, {reset: true});
        this.thenClick(xpath('//button[@type="submit"]'));
    });
});

//casper.waitForSelector(xpath('//a[contains(text(), "Цена от max к min")]'), function() {
//    this.click(xpath('//a[contains(text(), "Цена от max к min")]'));
//}, function(){
//    this.echo('Could not wait for sort element');
//    this.exit( 1 );
//}, 10000);

casper.then(function() {
    this.wait(4000, function() {
        this.echo("SEARCH RESULTS PAGE");
        helpers.capturePage(casper);
    });
});

casper.run(function() {
    helpers.savePage(this.getHTML());
    this.echo('Logs saved to ' + helpers.getCurrentScrapeDir());
    this.exit();
});
