const electron = require('electron');
const remote = electron.remote;
const category = require('../category');
const downloader = require('./index');

const get_img = function(url){
  console.log("start");
  var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;
  switch(downloader.check_sns_type(url)){
    case "twitter":
      downloader.twitter(url, save_dir);
      break;
    case "misskey":
      downloader.misskey(url, save_dir);
      break;
    case "mastodon":
      downloader.mastodon(url, save_dir);
      break;
    case "pleroma":
      downloader.pleroma(url, save_dir);
      break;
    case "pixiv":
      downloader.pixiv(url, save_dir);
      break;
    case "danbooru":
      downloader.danbooru(url, save_dir);
      break;
    case "yandere":
      downloader.yandere(url, save_dir);
      break;
  }
}

module.exports = get_img;
