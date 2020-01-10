const electron = require('electron');
const remote = electron.remote;
const category = require('../category');
const downloader = require('./index');

const get_img = function(url, count){
  if(count == undefined){
    count = 0;
  }
  console.log("start");
  var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;

  var source = clay_core.find_source(url);

  if(source){
    if(source.exec && source.exec != "NONE"){
      clay_core[source.id][source.exec](url, save_dir, count);
    }else{
      clay_core.sources[source.id](url, save_dir, count);
    }
  }
}

module.exports = get_img;
