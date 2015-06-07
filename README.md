#ATTENTION: THIS IS A WORK IN PROGRESS
Please check back in a few weeks!

-----

#rad-geo XX put back build status!
rad-geo is a [Reveal.js](http://lab.hakim.se/reveal-js/) [RadReveal](https://github.com/joelarson4/radReveal) add-on that helps you display maps in your slideshow.

Check out the [demo slideshow](http://joelarson4.github.io/rad-geo/demo.html) to see what rad-geo can do.

Check out [RadReveal](https://github.com/joelarson4/radReveal) to understand how these add-ons work.

##What does rad-geo do?

##How do you use it?

First you'll need to add [RadReveal](https://github.com/joelarson4/radReveal) to your slideshow.

Then you will need to intall the `rad-geo` script:

    cd <the root of your slideshow directory>
    npm install rad-geo

Then you will need to load the `rad-geo` script as a Reveal.js dependency:    

```javascript
Reveal.initialize({
  ...normal Reveal configuration goes here
  dependencies: [
    { src: 'node_modules/rad-geo/build/geo.js', radName: 'geo' }
    ...other dependencies go here
  ]
});

var RadReveal = require('rad-reveal');
RadReveal.initialize();
```

.... more details coming!