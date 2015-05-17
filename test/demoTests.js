var RadReveal = require('rad-reveal');
var slides = RadReveal.getSlideObjects();

describe('rad-geo demo tests', function() {

    it('has basic attachment of correct objects', function() { 
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-geo');
            assert.isTrue(hasAttr === (typeof slide.data.geo === 'object'), 'Slides with attribute have data.geo object');

            if(!hasAttr) { return; }
        });
    });

});