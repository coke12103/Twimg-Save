const downloader = {};

downloader.twitter = require('./twitter.js');
downloader.misskey = require('./misskey.js');
downloader.mastodon = require('./mastodon.js');
downloader.pleroma = require('./pleroma.js');
downloader.pixiv = require('./pixiv.js');

module.exports = downloader;
