/*!
 * rad-geo
 * http://joelarson4.github.io/rad-geo
 * MIT licensed
 *
 * Copyright (C) 2015 Joe Larson
 */

/** 
 * @overview
 * rad-geo is a Reveal.js RadReveal add-on that helps you display maps in your presentation
 * Please see [project README](https://github.com/joelarson4/rad-geo) for an overview.
 *
 * This is not a true CommonJS module, you cannot `require()` it.  It should be loaded as a Reveal.js dependency.
 *
 *```javascript
 * Reveal.initialize({
 *    ...
 *    dependencies: [
 *        { src: '<some path>/geo.min.js', radName: 'geo' }
 *    ...
 *```
 *
 * @module geo
 */

//Developer note: we are not using jsdox to generate any markdown for this file; the API doesn't really suit it.  
//  Some JsDoc is still provided for developer use

var RadReveal = require('rad-reveal');

var mapProvider;

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function showDisplay() {
    mapProvider.show();
}

function hideDisplay() {
    mapProvider.hide();
}

/** 
 * Runs when RadReveal initializes.
 *
 * @param {object} config - configuration object set in radConfig.  See README for details.
 * @param {array} slides - all the slide objects
 * @private
 */
function initialize(inputConfig, slides) {
    config = inputConfig || {};

    var mpModule = config.mapProviderModule;
    console.log(['mpModule',mpModule]);
    if(typeof mpModule == 'string') {
        mapProvider = require(mpModule);
    } else if(typeof mpModule == 'object') {
        mapProvider = mpModule;
    } else {
        mapProvider = require('./protoMapProvider.js');
    }

    /*if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-geo')) {
                slide.element.setAttribute('data-rad-geo', config.fillSlides);
            }
        });
    }*/
}

var REGEX_DECIMAL = /(-)?(\d.)*\.(\d)*/;

//value is something like "47.7717° N, 122.2044° W" or "47,-122" or "47.7N,122.2W,Bothell" or "47.7N,122.2W,Bothell\,WA"
// or a list of those seperated by Semicolons
function parseCoords(value) {
    var coords = [];
    var valueSplit = value.split(';');
    
    valueSplit.forEach(function(item) {
        item = item.replace('\\,', '&#x002C;'); 

        var itemSplit = item.split(',');
        
        var lat = Number(itemSplit[0].match(REGEX_DECIMAL)[0]);
        if(itemSplit[0].toUpperCase().indexOf('S')) { lat = -1 * Math.abs(lat); }

        var lon = Number(itemSplit[1].match(REGEX_DECIMAL)[0]);
        if(itemSplit[1].toUpperCase().indexOf('W')) { lon = -1 * Math.abs(lon); }

        var label = (itemSplit[2] || '').trim();

        coords.push({ lat: lat, lon: lon, label: label });
    });
    
    return coords;
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setLoc(attrVal, slideObj, event, radEventName) {
    var coords = parseCoords(attrVal);
    mapProvider.setLoc(coords);
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setSpeed(attrVal, slideObj, event, radEventName) {
    var speed = 333;
    if(speed == 'slow') {
        speed = 1000;
    } else if(speed == 'medium') {
        speed = 333;
    } else if(speed == 'fast') {
        speed = 100;
    } else {
        console.log([attrVal, attrVal.match(REGEX_DECIMAL)]);
        speed = Number((attrVal.match(REGEX_DECIMAL) || [ '333' ])[0]);
        if(isNaN(speed)) {
            speed = 333;
        }
    } 
    mapProvider.setSpeed(speed);
}

/** 
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setZoom(attrVal, slideObj, event, radEventName) {
    mapProvider.setZoom(attrVal);
}

RadReveal.register('geo', initialize);

//TODO: need a * or need array on
RadReveal.on('data-rad-geo', 'hide', hideDisplay);
RadReveal.on('data-rad-geo', 'show', showDisplay);
RadReveal.on('data-rad-geo-loc', 'hide', hideDisplay);
RadReveal.on('data-rad-geo-loc', 'show', showDisplay);
RadReveal.on('data-rad-geo-speed', 'hide', hideDisplay);
RadReveal.on('data-rad-geo-speed', 'show', showDisplay);
RadReveal.on('data-rad-geo-zoom', 'hide', hideDisplay);
RadReveal.on('data-rad-geo-zoom', 'show', showDisplay);


RadReveal.on('data-rad-geo-loc', 'show', setLoc);
RadReveal.on('data-rad-geo-speed', 'show', setSpeed);
RadReveal.on('data-rad-geo-zoom', 'show', setZoom);
RadReveal.on('data-rad-geo-zoom', 'show', setZoom);
//RadReveal.on('data-rad-geo', 'hide', hideGeo);
//RadReveal.on('data-rad-geo-loc', 'load', setLocations);





