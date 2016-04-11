var gulp = require("gulp"),
    postcss = require("gulp-postcss"),
    sourcemaps = require("gulp-sourcemaps"),
    autoprefixer = require("autoprefixer"),
    stylus = require("gulp-stylus"),
    lost = require("lost"),
    fs = require("fs"),
    browserify = require("browserify"),
    vueify = require("vueify");


var js = {
  source: "js/",
  destination: "js/"
};

gulp.task("vuejs", function() {
    browserify({ entries: js.source + "src.js", extensions: [".js"], debug: true })
        .transform("babelify", { presets: ["es2015"] })
        .transform("vueify")
        .bundle()
        .pipe(fs.createWriteStream(js.destination + "example.js"));
});

gulp.task("default", ["vuejs"]);