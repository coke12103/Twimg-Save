const electron = require('electron');
const remote = electron.remote;
const category = require('../category');
const downloader = require('./index');
const clay = require('../clay/index');

const get_img = function(url, count){
  if(count == undefined){
    count = 0;
  }
  console.log("start");
  var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;

  var type = downloader.check_sns_type(url);

  if(type){
    clay[type](url, save_dir, count);
  }
}

module.exports = get_img;
