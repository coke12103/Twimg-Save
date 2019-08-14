const downloader = {};

downloader.check_sns_type = require('./checker');

downloader.twitter = require('./twitter.js');
downloader.misskey = require('./misskey.js');
downloader.mastodon = require('./mastodon.js');
downloader.pleroma = require('./pleroma.js');
downloader.pixiv = require('./pixiv.js');
downloader.danbooru = require('./danbooru.js');

module.exports = downloader;
