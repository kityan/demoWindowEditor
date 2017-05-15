var gulp = require('gulp'),
	connect = require('gulp-connect'),
	open = require('gulp-open'),
	del = require('del'),
	sourceMaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	gulpIf = require('gulp-if'),
	cleanCSS = require('gulp-clean-css'),
	babel = require("gulp-babel"),
	debug = require("gulp-debug"),
	templateCache = require('gulp-angular-templatecache'),
	runSequence = require('run-sequence')
	;

var modes = { DEVELOPMENT: 'DEVELOPMENT', PRODUCTION: 'PRODUCTION', STAGING: 'STAGING' }
var mode = modes.DEVELOPMENT; // default

function swallowError(error) {
	console.log(error.toString())
	this.emit('end')
}


// start dev webserver
gulp.task('webserver', function () {
	connect.server({
		root: 'dist',
		livereload: true
	});
});



// launch browser
gulp.task('browser', function (cb) {
	gulp.src(__filename, { read: false })
		.pipe(open({ uri: 'http://localhost:8080', app: 'chrome' }));
	cb();
});

// reload in dev mode on files changes
gulp.task('reload', ['copy', 'concatJS', 'concatCSS'], function () {
	return gulp.src(__filename, { read: false })
		.pipe(connect.reload());
});

// clean dist folder before build production version
gulp.task('clean', function (cb) {
	del.sync(['./dist/**/*']);
	cb();
});

gulp.task('copyLibs', function () {
	return gulp.src([
		'./node_modules/d3/d3.*{js,css,map}',
		'./node_modules/angular/**/*.{js,css,map}',
		'./node_modules/angular-ui-router/release/**/*',
		'./node_modules/angular-touch/angular-touch.min.js',
		'./node_modules/angular-ui-bootstrap/dist/**/*',
		'./node_modules/angular-animate/**/*.{js,css,map}',
		'./node_modules/bootstrap/dist/**/*',
		'./node_modules/ng-focus-if/focusIf.min.js',
		'./node_modules/angular-resource/angular-resource.min.js',
		'./node_modules/angular-bootstrap-contextmenu/contextMenu.js',
	], { base: './node_modules/' })
		.pipe(gulp.dest('./dist/libs/'));
});

gulp.task('templates', function () {
	return gulp.src('./src/**/*.tpl.html')
		.pipe(templateCache({
			root: '',
			standalone: true,
			filename: 'app-templates.js',
			module: 'app-templates'
			//escapeOptions: {minimal: true}
		}))
		.pipe(gulp.dest('./dist/'));
})

// copy files
gulp.task('copy', ['copyLibs', 'copyDirectivesAssets', 'templates'], function () {
	return gulp.src([
		'./src/**/*.*',
		'!./src/css/**/*',
		'!./src/views/**/*',
		'!./src/*.js',
		'!./src/controllers/**/*',
		'!./src/directives/**/*',
		'!./src/services/**/*'

	])
		.pipe(gulp.dest('./dist/'));
});


// copy files
gulp.task('copyDirectivesAssets', function () {
	return gulp.src([
		'./src/directives/*/assets/**/*',
	])
		.pipe(gulp.dest('./dist/assets/directives/'));
});


// watch changes
gulp.task('watch', function () {
	return gulp.watch('src/**/*.*', ['reload']);
});

// concat js
gulp.task('concatJS', function () {

	var files = [
		'./src/initial.js',
		'./src/services/**/*.js',
		'./src/directives/**/*.js',
		'./src/controllers/**/*.js'
	];

	/*
		if (mode != modes.PRODUCTION) {
			files.push('!./src/services/Config.js')
		} else {
			files.push('!./src/services/Config_dev.js')
		}
	*/

	return gulp.src(files)
		.pipe(gulpIf((mode != modes.PRODUCTION), sourceMaps.init()))
		.pipe(concat('app.js'))
		.on('error', swallowError)
		.pipe(babel())
		.on('error', swallowError)
		.pipe(uglify())
		.on('error', swallowError)
		.pipe(gulpIf((mode != modes.PRODUCTION), sourceMaps.write()))
		.pipe(gulp.dest('./dist/'));

});

// concat css
gulp.task('concatCSS', function () {

	var files = [
		'./src/**/*.{less,css}'
	];

	return gulp.src(files)
		.pipe(gulpIf('**/*.less', less({})))
		.on('error', swallowError)
		.pipe(gulpIf((mode != modes.PRODUCTION), sourceMaps.init()))
		.pipe(concat('styles.css'))
		.pipe(cleanCSS())
		.pipe(gulpIf((mode != modes.PRODUCTION), sourceMaps.write()))
		.pipe(gulp.dest('./dist/'));

});



gulp.task('development', function (cb) {
	mode = modes.DEVELOPMENT;
	runSequence(['copy', 'concatJS', 'concatCSS'], 'webserver', 'browser', 'watch', function () {
		cb();
	});
});

gulp.task('staging', function (cb) {
	mode = modes.STAGING;
	runSequence(['copy', 'concatJS', 'concatCSS'], 'watch', function () {
		cb();
	});
});

gulp.task('production', function (cb) {
	mode = modes.PRODUCTION;
	runSequence('clean', ['copy', 'concatJS', 'concatCSS'], function () {
		cb();
	});
});


gulp.task('default', ['development']);



/////

