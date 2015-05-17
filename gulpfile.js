'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var jshint = require('gulp-jshint');
var bump = require('gulp-bump');
var del = require('del');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var fs = require('fs');

var builddir = 'build/';

//utils
var browserifyIt = function(bopts, ropts, ignore) {
    return transform(function(filename) {
        var br = browserify(filename, bopts)
            .external('rad-reveal')
            .require(filename, ropts);
        if(ignore) {
            br.ignore(ignore);
        }
        return br.bundle();
    });
};


function testDemo() {
    return gulp.src('demo.html')
        .pipe(mochaPhantomJS());
}

/*
function setupTestMisc(testNumber) {
    return function() {
        process.env.TEST_NUMBER = testNumber;
        return gulp.src('misc.html')
            .pipe(mochaPhantomJS());
    };
}*/

//tasks
gulp.task('default', function() {
    gulp.watch('src/*.css', ['copy-css']);
    gulp.watch('src/*.js', ['build']);
    gulp.watch('demo.html', ['build']);
});

gulp.task('release', ['build'], function() {
    gulp.start('test');
});

gulp.task('build', function() {
    return gulp.src('src/geo.js')
        .pipe(browserifyIt({ ignoreMissing: true }))
        .pipe(gulp.dest(builddir))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(builddir));
});

gulp.task('copy-css', function() {
    return gulp.src('src/geo.css')
        .pipe(gulp.dest(builddir));
});


/*
var tests = ['testDemo'];

gulp.task('testDemo', testDemo);

for(var testNumber = 0; testNumber < 3; testNumber++) {
    var testName = 'testMisc_' + testNumber;
    gulp.task(testName, [ tests[tests.length - 1] ], setupTestMisc(testNumber));
    tests.push(testName);
}

gulp.task('test', [tests[tests.length - 1]]);
*/

gulp.task('test', testDemo);


gulp.task('versionBumpPackage', function(){
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});

gulp.task('versionBump', ['versionBumpPackage'], function() {
    var version = require('./package.json').version;
    
    var exec = require('child_process').exec;
    exec('git tag v' + version, function (error, stdout, stderr) {
        if(error) { console.log(error); return; }  
        exec('git add package.json; git commit --m \'Bumping version to ' + version + '\'', function (error, stdout, stderr) {
            if(error) { console.log(error); return; } 
            console.log('Version now at ' + version);
        });
    });
});

