const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');

var config;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img, false);
  config = load_conf();
  set_status_text("Ready!")

  if(config.clipboard_check){
    check_clipboard_start();
  }
}

function get_img(){
  var input_url = document.getElementById("url_input");

  console.log("start");
  switch(check_sns_type(input_url.value)){
    case "twitter":
      get_twitter_img(input_url.value);
      break;
    case "misskey":
      get_misskey_img(input_url.value);
      break;
  }
}

function get_misskey_img(input_url){
  var request = remote.require('request');
  var url = remote.require('url');
  var parse_url = url.parse(input_url);
  var note_id = parse_url.pathname.match(/notes\/(.+)/)[1]

  var domain = parse_url.protocol + "//" + parse_url.host;

  var req = {
    url: domain + '/api/notes/show',
    method: 'POST',
    json: {
      "noteId": note_id
    }
  }

  console.log(note_id)
  request(req, (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      if(body.uri){
        console.log("remote")
        console.log(body);
        return;
      }

      if(!body.files){
        set_status_text("No Image File");
        return;
      }

      var image_count = 0;
      for(i = 0; body.files.length > i; i++){
        var extension = body.files[i].name.match(/(\.[a-zA-Z]+)$/);
        var file_name = body.user.username + "_" + body.id + "_image" + image_count + extension;
        get_image_file(body.files[i].url, file_name);
        image_count++
      }
  })
}

function get_twitter_img(url){
  var request = remote.require('request');
  var html_parser = remote.require('fast-html-parser');

  request.get(url, (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      var parse_body = html_parser.parse(body);
      var image_count = 0;
      var user_id_and_status_id = url.replace("https://twitter.com/", "");
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
          var extension = media_url.match(/(\/media\/)(.+)(\.[a-zA-Z]+)(:[a-zA-Z]+)$/)[3]
          get_image_file(media_url, user_id + "_" + status_id + "_image" + image_count + extension);
          image_count++;
        }
      }

      new Notification('Twimg Save', {
          body: image_count + "枚の画像を保存しました!"
      });
  })
}

function get_image_file(url, name){
  var request = remote.require('request');

  request.get(url).on('response', (res) => {
      console.log("Download Image File: " + res.statusMessage);
      set_status_text("Download: " + res.statusMessage);
  }).pipe(fs.createWriteStream(config.save_dir + "/" + name));

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

function set_sns_type(type){
  var sns_type = document.getElementById("sns_type");
  sns_type.innerText = type;
}

function check_sns_type(url){
  var type;
  switch(true){
    case /https:\/\/twitter\.com\/.+\/status\/.+/i.test(url):
      set_sns_type("Twitter");
      type = "twitter";
      break;
    case /https:\/\/(.+)\/notes\/([a-zA-Z0-9]+)/.test(url):
      set_sns_type("Misskey");
      type = "misskey";
      break;
    case /https:\/\/(.+)\/@(.+)\/([0-9]+)/.test(url):
      set_sns_type("Mastodon");
      type = "mastodon";
      break;
      case /https:\/\/(.+)\/notice\/([a-zA-Z0-9]+)/.test(url) || /https:\/\/(.+)\/objects\/.+/.test(url):
      set_sns_type("Pleroma");
      type = "pleroma";
      break;
    default:
      set_sns_type("Unknoun");
      type = false;
      break;
    }
    return type;
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
          if(check_sns_type(current_str)){
            set_input_url(current_str);
            set_status_text("Set url");
            new Notification('Twimg Save', {
                body: "クリップボードのURLをセットしました!"
            });

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
