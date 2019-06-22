const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');

var config;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img, false);
  config = load_conf();
}

function get_img(){
  var input_url = document.getElementById("url_input");
  var request = remote.require('request');
  var html_parser = remote.require('fast-html-parser');

  request.get(input_url.value, (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      var parse_body = html_parser.parse(body);

      set_status_text("Get page: " + res.statusMessage);

      for(var meta_tag of parse_body.querySelectorAll('meta')){
        // video: og:video:url
        if(meta_tag.attributes.property == "og:image"){
          var media_url = meta_tag.attributes.content;
          media_url = media_url.replace("large", "orig");
          console.log(media_url);
        }
      }
      console.log(res);

      // console.log(body);
  })
}

function load_conf(){
  try{
    var config = JSON.parse(
      fs.readFileSync(
        './.config.json'
      )
    );
    return config;
  }catch(err){
    set_status_text("config file not found");
    throw err;
  }
}

function set_status_text(text){
  var status_text = document.getElementById("status_text");
  status_text.innerText = text;
}

window.onload = init;
