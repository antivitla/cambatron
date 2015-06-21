var gulp = require("gulp"),
	server = require("gulp-server-livereload"),
	autoprefixer = require("gulp-autoprefixer"),
	minifycss = require("gulp-minify-css")
	rename = require("gulp-rename");

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
			"css/*.css",
			"!css/*.min.css"
		])
		.pipe(autoprefixer({
			browsers: ['last 4 versions'],
			cascade: false
		}))
		.pipe(minifycss())
		.pipe(rename(function (path) {
			path.extname = ".min.css";
		}))
		.pipe(gulp.dest("css"));
})

gulp.task("watch", function() {
	gulp.watch("css/*.css", ["css"]);
});

gulp.task("default", ["webserver", "watch"]);

