var RadReveal = require('rad-reveal');
var slides = RadReveal.getSlideObjects();

describe('rad-colorizer demo tests', function() {

    it('has basic attachment of correct objects', function() { 
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-colorizer');
            assert.isTrue(hasAttr === (typeof slide.data.colorizer === 'object'), 'Slides with attribute have data.colorizer object');

            if(!hasAttr) { return; }

            assert.isTrue((typeof slide.data.colorizer.palette === 'object'), 'Slides with attribute have data.colorizer.palette object');
            assert.isTrue((typeof slide.data.colorizer.palette.name === 'string'), 'Slides with attribute have data.colorizer.palette.name string');
            assert.isTrue((typeof slide.data.colorizer.palette.colors === 'object'), 'Slides with attribute have data.colorizer.palette.colors object');
            assert.isTrue((typeof slide.data.colorizer.palette.pairs === 'object'), 'Slides with attribute have data.colorizer.palette.pairs object');

            assert.isTrue((typeof slide.data.colorizer.background === 'object'), 'Slides with attribute have a data.colorizer.background');
            assert.isTrue((typeof slide.data.colorizer.background.name === 'string'), 'Slides with attribute have a data.colorizer.background.name');
            assert.isTrue((typeof slide.data.colorizer.background.color === 'string'), 'Slides with attribute have a data.colorizer.background.color');

            assert.isTrue((typeof slide.data.colorizer.foreground === 'object'), 'Slides with attribute have a data.colorizer.foreground');
            assert.isTrue((typeof slide.data.colorizer.foreground.name === 'string'), 'Slides with attribute have a data.colorizer.foreground.name');
            assert.isTrue((typeof slide.data.colorizer.foreground.color === 'string'), 'Slides with attribute have a data.colorizer.foreground.color');
        });
    });

    it('background and foreground actually set on slide', function() { 
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-colorizer');
            if(!hasAttr) { return; }

            var paletteName = slide.data.colorizer.palette.name;
            var background = slide.data.colorizer.background.name;
            var foreground = slide.data.colorizer.foreground.name;

            assert.isTrue(slide.element.className.indexOf('rad-colorizer-' + paletteName + '-fore-' + foreground) > -1, 'Slides have expected class for foreground');
            assert.isTrue(slide.element.className.indexOf('rad-colorizer-' + paletteName + '-back-' + background) > -1, 'Slides have expected class for background');

        });
    });

    it('foreground attribute works properly', function() { 
        slides.forEach(function(slide) {
            var attr = slide.element.getAttribute('data-rad-colorizer-foreground');
            if(!attr) { return; }

            var foreground = slide.data.colorizer.foreground.name;
            assert.isTrue(foreground == attr, 'Slides have foreground as set by attr');
        });
    });

    it('background attribute works properly', function() { 
        slides.forEach(function(slide) {
            var attr = slide.element.getAttribute('data-rad-colorizer-background');
            if(!attr) { return; }

            var background = slide.data.colorizer.background.name;
            assert.isTrue(background == attr, 'Slides have background as set by attr');
        });
    });

});