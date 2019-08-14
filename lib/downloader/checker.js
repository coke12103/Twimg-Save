const electron = require('electron');
const remote = electron.remote;

const check_sns_type = function(url){
  var type;
  switch(true){
    case /https:\/\/(mobile\.)?twitter\.com\/.+\/status\/.+/i.test(url):
      set_sns_type("Twitter");
      type = "twitter";
      break;
    case /https:\/\/(.+)\/notes\/([a-zA-Z0-9]+)/.test(url):
      set_sns_type("Misskey");
      type = "misskey";
      break;
    case /https:\/\/(.+)\/@(.+)\/([0-9]+)/.test(url) || /https:\/\/(.+)\/users\/(.+)\/statuses\/([0-9]+)/.test(url):
      set_sns_type("Mastodon");
      type = "mastodon";
      break;
    case /https:\/\/(.+)\/notice\/([a-zA-Z0-9]+)/.test(url) || /https:\/\/(.+)\/objects\/.+/.test(url):
      set_sns_type("Pleroma");
      type = "pleroma";
      break;
      case /http[s]?:\/\/www\.pixiv\.net\/member_illust\.php/i.test(url):
      set_sns_type("Pixiv");
      type = "pixiv";
      break;
    case /http[s]?:\/\/danbooru\.donmai\.us\/posts\/([0-9]+)/.test(url):
      set_sns_type('Danbooru');
      type = "danbooru";
      break;
    default:
      //set_sns_type("Unknoun");
      type = false;
      break;
    }
    return type;
}

module.exports = check_sns_type;
