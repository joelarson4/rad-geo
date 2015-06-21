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

//Developer note: jsdoc is for reference only, we are not generating documentation from it.
'use strict';
var RadReveal = require('rad-reveal');

var DECIMAL_REGEX = /(-)?(\d)*(\.)?(\d)*/;

var mapProvider;
var config;
var lastShown;
var lastHidden;

/*TODO FIX THIS REMOVE IT!*/require('./cesiumMapProvider.js');


//utilities

/**
 * This function converts a simple comma seperated string with latitude and longitude, an optional label,
 * and optional extensions into a regular coordinate object.  Multiple coordinates can be given seperated by
 * semicolons.  Examples of valid input:
 * 
 * [] "40,116"
 * [] "40,116,Beijing"
 * [] "40,116,Beijing\,China" - The \, is used to escape the comma in the label
 * [] "40,116,Beijing,GREEN" - When using cesiumMapProvider the 4th element GREEN is the color that will be used for the pin
 * [] "39.9167° N, 116.3833° E" - Copied directly from google results of searching for "Beijing lat long"
 * [] "33.4500° S, 70.6667° W, Santiago"
 * [] "-33.45,-70.67" - Negative lat is South, negative lon is West
 * [] "-33.45,-70.67,Santiago;-23.55,-46.63,São Paulo;-12.04,-77.03,Lima" - Using semicolons for multiple coords
 *
 * @private
 */
function parseCoords(value) {
    var coords = [];
    var valueSplit = value.split(';');
    
    valueSplit.forEach(function(item) {
        item = item.replace('\\,', 'x002C'); 

        var itemSplit = item.split(',');
        var lat = Number(itemSplit[0].trim().match(DECIMAL_REGEX)[0]);
        if(itemSplit[0].toUpperCase().indexOf('S') > -1) { lat = -1 * Math.abs(lat); }

        var lon = Number(itemSplit[1].trim().match(DECIMAL_REGEX)[0]);
        if(itemSplit[1].toUpperCase().indexOf('W') > -1) { lon = -1 * Math.abs(lon); }

        var label = (itemSplit[2] || '').trim();
        label = label.replace('x002C', ',');

        var color = (itemSplit[3] || '').trim();

        coords.push({ lat: lat, lon: lon, label: label, original: item, color: color });
    });
    
    return coords;
}


//slide functionality

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

    if(typeof mpModule == 'string') {
        mapProvider = require(mpModule);
    } else if(typeof mpModule == 'object') {
        mapProvider = mpModule;
    } else {
        mapProvider = require('./protoMapProvider.js');
    }

    mapProvider.initialize(config.mapProviderConfig, slides);

    /*if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-geo')) {
                slide.element.setAttribute('data-rad-geo', config.fillSlides);
            }
        });
    }*/
}


/** 
 * Initializes the slide object on load to add a `data.geo` object.
 *
 * @param {object} ignored - not used
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function loadSlide(ignored, slideObj) {
    slideObj.data.geo = { };
}


/** 
 * Triggered by any `data-rad-geo*` attribute, this triggers the display of the map.
 *
 * @param {object} ignored - not used
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function showDisplay(ignored, slideObj) {
    if(slideObj == lastShown) { return; } //avoid repeats;
    lastShown = slideObj;

    mapProvider.show(slideObj);
}

/** 
 * Triggered whenever leaving a slide that has rad-geo to go to a slide that does not have rad-geo.
 * 
 * @param {object} ignored - not used
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function hideDisplay(ignored, slideObj) {
    if(slideObj == lastHidden) { return; } //avoid repeats;
    lastHidden = slideObj;

    mapProvider.hide(slideObj);
}

/** 
 * Triggered by the `data-rad-geo-goto` attribute, this sets the map goto to be used.
 *
 * @param {string} attrVal - goto to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setGoto(attrVal, slideObj) {
    var gotoData = (attrVal == 'pin' ? 'pin' : parseCoords(attrVal));
    slideObj.data.geo['goto'] = gotoData;
    if(typeof mapProvider.setGoto == 'function') {
        mapProvider.setGoto(gotoData);
    }
}

/** 
 * Triggered by the `data-rad-geo-kml` attribute, this sets the kml to be used.
 *
 * @param {string} attrVal - kml to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setKml(attrVal, slideObj) {
    slideObj.data.geo.kml = attrVal;
    if(typeof mapProvider.setKml == 'function') {
        mapProvider.setKml(attrVal);
    }
}

/** 
 * Triggered by the `data-rad-geo-pin` attribute, this sets the map pin to be used.
 *
 * @param {string} attrVal - pin to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setPin(attrVal, slideObj) {
    var pinData = (attrVal == 'keep' ? 'keep' : parseCoords(attrVal));
    slideObj.data.geo.pin = pinData;
    if(typeof mapProvider.setPins == 'function') {
        mapProvider.setPins(pinData);
    }
}

/** 
 * Triggered by the `data-rad-geo-speed` attribute, this sets the map speed to be used.
 *
 * @param {string} attrVal - speed to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setSpeed(attrVal, slideObj) {
    var speed = 2000;
    if(attrVal == 'slow') {
        speed = 5000;
    } else if(attrVal == 'medium') {
        speed = 2000;
    } else if(attrVal == 'fast') {
        speed = 500;
    } else if(attrVal == 'instant') {
        speed = 0;
    } else {
        speed = Number((attrVal.match(DECIMAL_REGEX) || [ '2000' ])[0]);
        if(isNaN(speed)) {
            speed = 2000;
        }
    } 
    slideObj.data.geo.speed = speed;
    if(typeof mapProvider.setSpeed == 'function') {
        mapProvider.setSpeed(speed);
    }
}



/** 
 * Triggered by the `data-rad-geo-zoom` attribute, this sets the map zoom to be used.
 *
 * @param {string} attrVal - zoom to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setZoom(attrVal, slideObj) {
    slideObj.data.geo.zoom = attrVal;
    if(typeof mapProvider.setZoom == 'function') {
        mapProvider.setZoom(attrVal);
    }
}

/** 
 * Triggered by the `data-rad-geo-style` attribute, this sets the map style to be used.
 *
 * @param {string} attrVal - style to use
 * @param {object} slideObj - the RadReveal slide object
 * @private
 */
function setStyle(attrVal, slideObj) {
    slideObj.data.geo.style = attrVal;
    if(typeof mapProvider.setStyle == 'function') {
        mapProvider.setStyle(attrVal);
    }
}

RadReveal.register('geo', initialize);


RadReveal.on('data-rad-geo*', 'load', loadSlide);

RadReveal.on('data-rad-geo*', 'hide', hideDisplay);

RadReveal.on('data-rad-geo-goto', 'show', setGoto);
RadReveal.on('data-rad-geo-pin', 'show', setPin);
RadReveal.on('data-rad-geo-speed', 'show', setSpeed);
RadReveal.on('data-rad-geo-zoom', 'show', setZoom);
RadReveal.on('data-rad-geo-style', 'show', setStyle);
RadReveal.on('data-rad-geo-kml', 'show', setKml);

RadReveal.on('data-rad-geo*', 'show', showDisplay);





