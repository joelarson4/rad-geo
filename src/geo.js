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
'use strict';
var RadReveal = require('rad-reveal');

var mapProvider;
var config;
var lastShown;
var lastHidden;

/*TODO FIX THIS REMOVE IT!*/require('./cesiumMapProvider.js');


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

    mapProvider.initialize(config.mapProviderConfig);

    /*if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-geo')) {
                slide.element.setAttribute('data-rad-geo', config.fillSlides);
            }
        });
    }*/
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
function loadSlide(attrVal, slideObj, event, radEventName) {
    slideObj.data.geo = { };
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
function showDisplay(attrVal, slideObj, event, radEventName) {
    if(slideObj == lastShown) { return; } //avoid repeats;
    lastShown = slideObj;

    mapProvider.show(slideObj);
}

function hideDisplay(attrVal, slideObj, event, radEventName) {
    if(slideObj == lastHidden) { return; } //avoid repeats;
    lastHidden = slideObj;

    mapProvider.hide(slideObj);
}

var REGEX_DECIMAL = /(-)?(\d)*(\.)?(\d)*/;

//value is something like "47.7717° N, 122.2044° W" or "47,-122" or "47.7N,122.2W,Bothell" or "47.7N,122.2W,Bothell\,WA"
// or a list of those seperated by Semicolons
function parseCoords(value) {
    var coords = [];
    var valueSplit = value.split(';');
    
    valueSplit.forEach(function(item) {
        item = item.replace('\\,', 'x002C'); 

        var itemSplit = item.split(',');
        var lat = Number(itemSplit[0].trim().match(REGEX_DECIMAL)[0]);
        if(itemSplit[0].toUpperCase().indexOf('S') > -1) { lat = -1 * Math.abs(lat); }

        var lon = Number(itemSplit[1].trim().match(REGEX_DECIMAL)[0]);
        if(itemSplit[1].toUpperCase().indexOf('W') > -1) { lon = -1 * Math.abs(lon); }

        var label = (itemSplit[2] || '').trim();
        label = label.replace('x002C', ',');

        var color = (itemSplit[3] || '').trim();

        coords.push({ lat: lat, lon: lon, label: label, original: item, color: color });
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
function setGoto(attrVal, slideObj, event, radEventName) {
    var gotoData = (attrVal == 'pin' ? 'pin' : parseCoords(attrVal));
    slideObj.data.geo['goto'] = gotoData;
    if(typeof mapProvider.setGoto == 'function') {
        mapProvider.setGoto(gotoData);
    }
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
function setPin(attrVal, slideObj, event, radEventName) {
    var pinData = (attrVal == 'keep' ? 'keep' : parseCoords(attrVal));
    slideObj.data.geo.pin = pinData;
    if(typeof mapProvider.setPins == 'function') {
        mapProvider.setPins(pinData);
    }
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
        speed = Number((attrVal.match(REGEX_DECIMAL) || [ '2000' ])[0]);
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
 * Runs ...
 *
 * @param {string} attrVal - value of the attribute
 * @param {object} slideObj - the RadReveal slide object (see RadReveal documentation)
 * @param {object} event - the Reveal.js event
 * @param {string} radEventName - the name of the RadReveal event (see RadReveal documentation)
 * @private
 */
function setZoom(attrVal, slideObj, event, radEventName) {
    slideObj.data.geo.zoom = attrVal;
    if(typeof mapProvider.setZoom == 'function') {
        mapProvider.setZoom(attrVal);
    }
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
function setStyle(attrVal, slideObj, event, radEventName) {
    slideObj.data.geo.style = attrVal;
    if(typeof mapProvider.setStyle == 'function') {
        mapProvider.setStyle(attrVal);
    }
}

RadReveal.register('geo', initialize);

//TODO: need a * or need array on
RadReveal.on('data-rad-geo*', 'load', loadSlide);

RadReveal.on('data-rad-geo*', 'hide', hideDisplay);

RadReveal.on('data-rad-geo-goto', 'show', setGoto);
RadReveal.on('data-rad-geo-pin', 'show', setPin);
RadReveal.on('data-rad-geo-speed', 'show', setSpeed);
RadReveal.on('data-rad-geo-zoom', 'show', setZoom);
RadReveal.on('data-rad-geo-style', 'show', setStyle);

RadReveal.on('data-rad-geo*', 'show', showDisplay);





