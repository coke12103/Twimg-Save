const downloader = {};

downloader.twitter = require('./twitter.js');
downloader.misskey = require('./misskey.js');
downloader.mastodon = require('./mastodon.js');

module.exports = downloader;
