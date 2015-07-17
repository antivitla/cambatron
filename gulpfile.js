var gulp = require("gulp"),
	server = require("gulp-server-livereload"),
	autoprefixer = require("gulp-autoprefixer"),
	minifycss = require("gulp-minify-css")
	rename = require("gulp-rename"),
	sass = require("gulp-sass"),
	concat = require("gulp-concat");

gulp.task("webserver", function() {
	return gulp.src(".")
		.pipe(server({
			livereload: false,
			port: 9999, /*Math.floor(Math.random() * 10000),*/
			open: true,
			directoryListing: true,
			defaultFile: "index.html"
		}));
});

gulp.task("css", function () {
	return gulp.src([
			"css/*.scss",
			"css/*.css",
			"!css/*.min.css"
		])
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
		.pipe(minifycss({
			processImport: false
		}))
		.pipe(rename(function (path) {
			path.extname = ".min.css";
		}))
		.pipe(gulp.dest("css"));
});

gulp.task("js", function () {
	return gulp.src([
			"js/app.js",
			"js/**/*-module.js",
			"js/**/*.js",
			"!js/**/*.min.js",
			"!js/**/*-test.js",
			"!js/**/skip-*.js"
		])
		.pipe(concat("app.min.js"))
		.pipe(gulp.dest("js"))
});

gulp.task("tests", function () {
	return gulp.src([
			"js/**/*-test.js",
			"!js/**/skip-*.js"
		])
		.pipe(concat("tests.min.js"))
		.pipe(gulp.dest("js"));
});

gulp.task("watch", function() {
	gulp.watch([
			"css/*.css",
			"css/*.scss",
			"!css/*.min.css",
		], ["css"]);
	gulp.watch([
		"js/**/*.js",
		"!js/**/*.min.js"
		], ["js", "tests"]);
});

// gulp.task("default", ["webserver", "watch"]);

gulp.task("default", ["watch"]);
