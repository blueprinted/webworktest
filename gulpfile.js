var gulp = require('gulp');
var debug = require('gulp-debug');
var htmlmin = require('gulp-htmlmin');
var cssUglify = require('gulp-minify-css');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var imagemin = require('gulp-imagemin'); // 图片优化
var cache = require('gulp-cache');
var clean = require('gulp-clean');
var pump = require('pump');
var del = require('del');
var concat = require('gulp-concat'); // 文件合并
var rename = require('gulp-rename'); // 文件重命名
var rev = require('gulp-rev'); // 文件改版本名
var revCollector = require('gulp-rev-collector'); // gulp-rev的插件用于html模板更改引用路径

gulp.task('html',callback => {
    gulp.src(['rev/**/*.json', 'src/*.html'])
        .pipe(debug({title:'html'}))
        .pipe(revCollector({
            replaceReved: true
        }))
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(htmlmin({
            collapseWhitespace : true,
            removeComments : true
        })).on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
        .pipe(gulp.dest('dist'));
    callback();
});

/* 这个会连同dist目录都删除..并且还会删除node_modules/目录下的一些文件 */
gulp.task('clean0', function(callback) {
    pump([
        gulp.src('dist/**/*'),
        clean()
    ], callback);
    callback();
});

gulp.task('clean', function(callback) {
    del([
        'dist/**/*',
        'rev/**/*'
    ], callback);
    callback();
});

gulp.task('clean2', function() {
    return gulp.src(['dist/**/*'], {read:false})
        .pipe(clean());
});

gulp.task('css',function(callback){
    gulp.src('src/static/c/*.css', {base:'src'})
        .pipe(debug({title:'css'}))
        .pipe(cssUglify())
        /** 非覆盖式 start */
        .pipe(rename(function(path){
            // path.basename += ".min";
            // path.extname = ".css";
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
    /** 非覆盖式 end */
    callback();
});

gulp.task('js',function(callback){
    gulp.src(['src/static/j/*.js'],{base:'src'})
        .pipe(babel())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(debug({title:'js'}))
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        /** 非覆盖式 start */
        .pipe(rename(function(path){
            // path.basename += ".min";
            // path.extname = ".js";
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
    /** 非覆盖式 end */
    callback();
});
gulp.task('jsd',function(callback){
    gulp.src(['src/data/*.js'],{base:'src'})
        .pipe(babel())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(debug({title:'js'}))
        .pipe(uglify())
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        /** 非覆盖式 start */
        .pipe(rename(function(path){
            // path.basename += ".min";
            // path.extname = ".js";
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/jsd'));
    /** 非覆盖式 end */
    callback();
});

gulp.task('image',function(callback){
    gulp.src('src/static/i/**/*',{base:'src'})//要处理的图片目录为img目录下的所有的.jpg .png .gif 格式的图片;
        .pipe(debug({title:'image'}))
        .pipe(cache(imagemin({
            progressive : true,//是否渐进的优化
            svgoPlugins : [{removeViewBox:false}],//svgo插件是否删除幻灯片
            interlaced : true //是否各行扫描
        })))
        .on('error', function (err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(gulp.dest('dist/'));
    callback();
});

gulp.task('copy',function(callback){
    gulp.src(
        [
            'bend/**',
        ]
    )
        .pipe(debug({title:'copy'}))
        .pipe(gulp.dest('dist/bend'));
    callback();
});

gulp.task('copy2',function(callback){
    gulp.src(
        [
            'src/*.php',
        ],{base:'src'}
    )
        .pipe(debug({title:'copy2'}))
        .pipe(gulp.dest('dist/'));
    callback();
});

// gulp.task('default', gulp.series('clean', gulp.parallel('css','js','jsd','image'), 'html', 'copy'));
gulp.task('default', gulp.series(['css', 'js', 'jsd', 'image', 'html', 'copy', 'copy2'], function(callback){
    callback()
}));
