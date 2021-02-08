var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var zip = require('gulp-zip');
var moment = require('dayjs');
var del = require('del');
var watch = require('gulp-watch');
var fs = require('fs');
var GulpSSH = require('gulp-ssh');
var argv = require('yargs').argv;

const projectName = 'tb-mobile';

// var sshConfig = {
//   host: '3.113.179.xxx',
//   port: 22,
//   username: 'xxxx',
//   privateKey: fs.readFileSync('C:/Users/engineer-01/xxxx/xxxx.pem')
// }

// var gulpSSH = new GulpSSH({
//   ignoreErrors: false,
//   sshConfig: sshConfigGabe
// })


function clearAll() {
  return del([
    './dist'
  ], { force: true });
}

function removeDevWebFolder() {

  return del([
    // './dist/tb-mobile/tb-mobile/**',
    `./dist/${projectName}/${projectName}/**`,
    // './dist/tb-pc/assets/img/demo/**'
  ], { force: true });
}

function changepath() {
  return gulp.src(
    ['./dist/gd-mobile/*.js']
  )
    .pipe(replace('/gd-mobile/assets/img', 'assets/img'))
    .pipe(gulp.dest('./dist/gd-mobile'));
}

function setConfig() {
  console.log('setConfig');

  return gulp.src(
    ['./dist/gd-mobile/index.html']
  )

    // .pipe(replace('base href=""', 'base href="gd-mobile/"'))
    .pipe(replace('assets/config.js', '/gd-mobile/assets/config3.js'))
    .pipe(gulp.dest('./dist/gd-mobile'));

}

function setConfigCnt() {
  console.log('setConfigCnt', "argv.test:", argv.test);

  is9091 = (argv.test === undefined) ? false : true;

  if (is9091) {
    return gulp.src(
      [`./dist/${projectName}/assets/config-9091.js`]
    )
      .pipe(rename('config.js'))
      .pipe(gulp.dest(`./dist/${projectName}/assets`))
      ;
  }

  return gulp.src(
    [`./dist/${projectName}/assets/config-prod.js`]
  )
    .pipe(rename('config.js'))
    .pipe(gulp.dest(`./dist/${projectName}/assets`));

  // 為防 cache 再建的 config2
  // .pipe(rename('config3.js'))
  // .pipe(gulp.dest('./dist/web/assets'));
}

function delRefConfig() {

  return del([
    `./dist/${projectName}/assets/config-9091.js`,
    `./dist/${projectName}/assets/config-prod.js`
  ]);
}

function makeNoLogoversoin() {

  let stamp = moment().format('YYMMDD_HHmmss');

  return gulp.src(
    [`./dist/${projectName}/assets/config.js`]
  )
    .pipe(replace('noLogo: false', 'noLogo: true'))
    .pipe(gulp.dest(`./dist/${projectName}/assets`))
    .pipe(gulp.src(
      [`./dist/${projectName}/**`]
    ))
    .pipe(zip(`${projectName}_noLogo_${stamp}.zip`))
    .pipe(gulp.dest('./dist/'));
  ;
}

function copy() {

  return gulp.src(
    ['./dist/gd-mobile/index.html']
  )
    .pipe(rename('index2.html'))
    .pipe(replace('base href=""', 'base href="gd-mobile/"'))
    .pipe(gulp.dest('./dist/gd-mobile'));
}

function compress() {

  let stamp = moment().format('YYMMDD_HHmmss');
  return gulp.src(
    ['./dist/**']
  )
    .pipe(zip(`${projectName}_${stamp}.zip`))
    .pipe(gulp.dest('./dist/'));
}

function reomveRemoteOldFiles() {
  return gulpSSH
    .shell([
      'cd /home/gabe/test/',
      'shopt -s extglob',
      'rm -v !("assets")',
      'shopt -u extglob',
    ]);
}

function upload() {
  console.log('upload');
  return gulp
    .src([`./dist/${projectName}/**`, '!**/assets/**'])
    .pipe(gulpSSH.dest('/home/qa_lb/c01-member-test/'))
  // .pipe(gulpSSH.dest('/home/gabe/test1/')) not working
}

function upload1() {
  console.log('upload');
  return gulp
    .src([`./dist/${projectName}/**`, '!**/assets/**'])
    .pipe(gulpSSH.dest('/home/qa_lb/c01-member-water/'))
}


// function removeTemp() {
//     return del(['./buildtmp']);

// }

// gulp.task('default', gulp.series(setConfig, copy, changepath,compress));
gulp.task('default', gulp.series(setConfigCnt, removeDevWebFolder, delRefConfig, compress, makeNoLogoversoin));
// removeDevWebFolder use angular.json replace
// gulp.task('default', gulp.series(setConfigCnt, compress));
gulp.task('clearAll', gulp.series(clearAll));
gulp.task('i18', function () {


  var src = './src/assets/i18n/zh-Hant.json';
  return watch(src, function () {
    return gulp.src(
      [src]
    )
      .pipe(rename('en.json'))
      .pipe(gulp.dest('./src/assets/i18n'))
      .pipe(rename('jp.json'))
      .pipe(gulp.dest('./src/assets/i18n'));
  });

});

gulp.task('upload', gulp.series(reomveRemoteOldFiles, upload, upload1));
