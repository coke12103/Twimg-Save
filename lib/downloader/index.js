const downloader = {};

downloader.twitter = require('./twitter.js');
downloader.misskey = require('./misskey.js');

module.exports = downloader;
