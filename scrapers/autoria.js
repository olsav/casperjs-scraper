var system = require('system');

// TODO improve flags from CLI
if (system.args.length < 6) {
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
        }
        //verbose: true,
        //logLevel: 'debug'
    }),
    xpath = require('casper').selectXPath,
    helpers = require('lib/helpers.js'),
    moment = require('../node_modules/moment');

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
        this.evaluate(function(brand, year, yearTo) {
            //TODO fix userData here
            $("#marks > option:contains('" + brand + "'):first").attr("selected", "selected");
            if (year) $("#year > option:contains('" + year + "'):first").attr("selected", "selected");
            if (yearTo) $("#yearTo > option:contains('" + yearTo + "'):first").attr("selected", "selected");
        }, {
            brand: userData.brand,
            year: userData.year,
            yearTo: userData.yearTo
        });
        if (userData.price) this.sendKeys("#priceFrom", userData.price, {reset: true});
        if (userData.priceTo) this.sendKeys("#priceTo", userData.priceTo, {reset: true});
        this.thenClick(xpath('//button[@type="submit"]'));
    });
});

casper.waitForSelector(xpath("//div[@id='pagination']//a[@data-value='100']"), function() {
    this.click(xpath("//div[@id='pagination']//a[@data-value='100']"));
}, function() {
    this.echo('Could not find search results page');
    this.exit( 1 );
}, 10000);

//casper.waitForSelector(".standart-view > #pagination", function() {
//    console.info("WAITED ");
//    this.echo(this.fetchText(".standart-view > #pagination .pagination-wrap a.pager-item:last"));
//    //pages count
//    var pages = this.evaluate(function() {
//        console.log($(".standart-view > #pagination .pagination-wrap a.pager-item:last").text());
//        return $(".standart-view > #pagination .pagination-wrap a.pager-item:last").text();
//    });
//    console.info("PAGES COUNT " + pages);
//}, function() {
//    this.echo('Could not find paginator');
//    this.exit( 1 );
//}, 30000);

casper.then(function() {
    this.wait(12000, function() {
        this.echo("SEARCH RESULTS PAGE");

        var items = this.evaluate(function() {
            var result = [];
            $(".standart-view .ticket-item").each(function(i, item) {
                result.push({
                    title: $(item).find(".content-bar .address strong").text(),
                    link: $(item).find(".content-bar .address").attr('href'),
                    year: $(item).find(".content-bar .address").contents()
                        .filter(function() {
                            return this.nodeType == Node.TEXT_NODE;
                        }).text(),
                    price: $(item).find(".price-ticket strong.green").text(),
                    phone: $(item).find(".content-bar .footer-ticket .js-phone").text(),
                    image: $(item).find(".content-bar .ticket-photo img").attr('src'),
                    location: $(item).find(".location a").text()
                });
            });

            return result;
        });
        console.info(JSON.stringify(items));
        helpers.saveFile("public/data.json", JSON.stringify(items));
        helpers.capturePage(casper);
    });
});

casper.run(function() {
    helpers.savePage(this.getHTML());
    this.echo('Logs saved to ' + helpers.getCurrentScrapeDir());
    this.exit();
});
