var gulp = require('gulp');
var packager = require('electron-packager');
var config = require('./package.json');

gulp.task('packager-win', (done) => {
    packager({
        dir: './',
        out: './release',
        name: config.name,
        arch: 'x64',
        platform: 'win32',
        electronVersion: '5.0.5',
        overwrite: true,
        asar: true,
        appVersion: config.version,
        appCopyright: '',
    });
});

gulp.task('packager-linux', (done) => {
    packager({
        dir: './',
        out: './release',
        name: config.name,
        arch: 'x64',
        platform: 'linux',
        electronVersion: '5.0.5',
        overwrite: true,
        asar: true,
        appVersion: config.version,
        appCopyright: '',
    });
});
