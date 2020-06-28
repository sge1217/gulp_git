/*
    npm install gulp-cli -g
    npm install
    gulp
    --------------------------
    처음 npm 인스톨시 에러발생하면 다음과 같이 c드라이브로 이동후 
    아래 명령어를 실행후 다시 프로젝트 폴더로 돌아와 gulp 실행
    cd C:\   
    Set-ExecutionPolicy RemoteSigned
    cd C:\Users\i\Desktop\my1

    gulp로 빌드시 node-sass가 없다는 오류가 출력되면
    아래 명령어 실행후 다시 gulp 실행
    node node_modules/node-sass/scripts/install.js
*/

const gulp = require('gulp');
const sass = require('gulp-sass');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const include = require('gulp-html-tag-include');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const token_replace = require('gulp-token-replace');


function static_file(){
    return gulp.src('./src/static/*')
    .pipe(gulp.dest('./dist/static'));
}


function html_include_main(){
    return gulp.src('./src/main/index.html')
    .pipe(include())
    .pipe(gulp.dest('./dist'));
}

function html_include_sub(){
    delete require.cache[require.resolve('./config.json')]
    let config = require('./config.json');
    return gulp.src('./src/sub/**/*.html')
    .pipe(include())
    .pipe(token_replace({
        global: config
    }))
    .pipe(gulp.dest('./dist/subPage'));
}


function style(){
    return gulp.src('./src/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write()) 
    /*   
    .pipe(uglifycss({    
        "uglyComments": true
     }))
     */
    .pipe(gulp.dest('./dist/css'))   
    .pipe(browserSync.stream());
}

function js_combine(){
    return gulp.src('./src/**/*.js')
      .pipe(gulp.dest('./dist/js'))
      .pipe(concat('combined.js'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(uglify())
      .pipe(rename('custom.min.js'))
      .pipe(gulp.dest('./dist/js'))
}

function imgmin(){
    return gulp.src('./src/**/img/*')              
        .pipe(gulp.dest('./dist/img/'));
}


function watch(){
    browserSync.init({
        server : {
            baseDir : './dist'
        },
        browser: "chrome",
        notify : false
    });    
  
    gulp.watch('./src/main/**/*.html',  html_include_main);  
    gulp.watch('./src/sub/**/*.html',  html_include_sub); 
    gulp.watch('./src/**/*.scss',  style);
    gulp.watch('./src/**/*.js',  js_combine); 
    gulp.watch('./src/**/img/*',imgmin);
    gulp.watch('./**/*.html').on('change',browserSync.reload); 
    gulp.watch('./**/*.scss').on('change',browserSync.reload); 
    gulp.watch('./dist/js/**/*.js').on('change', browserSync.reload);
}

exports.static_file = static_file;
exports.html_include_main = html_include_main;
exports.html_include_sub = html_include_sub;
exports.style = style;
exports.js_combine = js_combine;
exports.imgmin = imgmin;
exports.watch = watch;
const build = gulp.series(static_file, html_include_main, html_include_sub, style, js_combine, imgmin, watch);
exports.default = build;