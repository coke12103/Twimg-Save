const electron = require('electron');
const remote = electron.remote;
const category = require('../category');

const get_img = function(url, count){
  if(count == undefined){
    count = 0;
  }
  console.log("start");
  var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;

  var source = clay_core.find_source(url);

  if(source.id){
    if(source.exec && source.exec != "NONE"){
      console.log('v1 plugin exec.');
      clay_core.sources[source.id][source.exec](url, save_dir, count);
    }else{
      console.log('v0 plugin exec.');
      clay_core.sources[source.id](url, save_dir, count);
    }
  }
}

module.exports = get_img;
