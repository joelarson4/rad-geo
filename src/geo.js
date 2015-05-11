/*!
 * rad-geo
 * http://joelarson4.github.io/rad-geo
 * MIT licensed
 *
 * Copyright (C) 2015 Joe Larson
 */

/** 
 * @overview
 * rad-geo is a Reveal.js RadReveal add-on ...
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

RadReveal.register('geo', initialize);
RadReveal.on('data-rad-geo', 'load', load);
RadReveal.on('data-rad-geo', 'show', show);
RadReveal.on('data-rad-geo', 'hide', hide);