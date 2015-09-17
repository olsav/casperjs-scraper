# Headless scraping with CasperJS + PhantomJS


## Getting Started

You must have globally installed `npm`, `casperjs`, `phantomjs`

`apt-get install npm`

`npm install -g phantomjs`

`npm install -g casperjs`

cd to project root then run

```
npm install
```

to install dependencies.

## Running Scrapers

`casperjs --ignore-ssl-errors=true scrapers/scraper.js [parameters]`


## Additional Information 

*[--ignore-ssl-errors parameter is used because of SSL handshake problem](https://newspaint.wordpress.com/2013/04/25/getting-to-the-bottom-of-why-a-phantomjs-page-load-fails/)*

[Why CasperJS? Read the Disclaimer here](http://stackoverflow.com/a/11228457)

Known issues if you decide to use *PhantomJS v.2* with *CasperJS v.1.1.0-beta3* 

[Version check solution](http://stackoverflow.com/questions/28656768/issues-running-casperjs-with-phantomjs2-0-0-on-mac-yosemite)

[Compute phantom.casperPath solution](https://github.com/n1k0/casperjs/issues/1150)

PhantomJS SSL bugs:

[Phantomjs SSL fixed in v.1.9.8](http://stackoverflow.com/questions/28174204/java-phantomjs-and-selenium-ignore-ssl-errors)

[Another PhantomJS SSL solution](http://stackoverflow.com/questions/12021578/phantomjs-failing-to-open-https-site)

[You can read more about PhantomJS CLI here](http://phantomjs.org/api/command-line.html)

[Getting To The Bottom Of Why A PhantomJS Page Load Fails](https://newspaint.wordpress.com/2013/04/25/getting-to-the-bottom-of-why-a-phantomjs-page-load-fails/)

## Directory Layout

```
scrapers/      -->  CasperJS scrapers
logs/          --> Scrape results and logs directory
node_modules/  --> NodeJS third party dependencies
```
