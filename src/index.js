const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');

var config;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img, false);
  config = load_conf();

  if(config.clipboard_check){
    check_clipboard_start();
  }
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
      var image_count = 0;
      var user_id_and_status_id = input_url.value.replace("https://twitter.com/", "");
      var user_id = user_id_and_status_id.match(/^(.+)(\/status\/)/)[1];
      var status_id = user_id_and_status_id.match(/(\/status\/)([0-9]+)/)[2];

      console.log(user_id);
      console.log(status_id);

      set_status_text("Get page: " + res.statusMessage);

      for(var meta_tag of parse_body.querySelectorAll('meta')){
        // video: og:video:url
        if(meta_tag.attributes.property == "og:image"){
          var media_url = meta_tag.attributes.content;
          media_url = media_url.replace("large", "orig");
          get_image_file(media_url, user_id + "_" + status_id + "_image" + image_count);
          image_count++;
        }
      }
  })
}

function get_image_file(url, name){
  var request = remote.require('request');
  var extension = url.match(/(\/media\/)(.+)(\.[a-zA-Z]+)(:[a-zA-Z]+)$/)[3]

  request.get(url).on('response', (res) => {
      console.log("Download Image File: " + res.statusMessage);
  }).pipe(fs.createWriteStream(config.save_dir + "/" + name + extension));
  set_status_text("Download Complate!");

  set_input_url("");
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

function check_clipboard_start(){
  var clipboard = remote.require('clipboardy');
  var check_clipboard_flag = document.getElementById("is_check_clipboard");
  var prev_str = clipboard.readSync();
  setInterval(() => {
      var current_str = clipboard.readSync();
      if(check_clipboard_flag.checked){
        if(prev_str != current_str){
          prev_str = current_str;
          if(current_str.match(/https:\/\/twitter.com\/.+\/status\/.*/i)){
            set_input_url(current_str);

            console.log("Match!!");
          }else{
            console.log("Not Match!")
          }
        }
      }
  }, 500);
}

function set_input_url(text){
  var input_url = document.getElementById("url_input");
  input_url.value = text;
}

window.onload = init;
