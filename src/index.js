const electron = require('electron');
const remote = electron.remote;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img, false);
}

function get_img(){
  var input_url = document.getElementById("url_input");
  var status_text = document.getElementById("status_text");
  var request = remote.require('request');
  var html_parser = remote.require('fast-html-parser');

  request.get(input_url.value, (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      var parse_body = html_parser.parse(body);

      status_text.innerText = "Get page: " + res.statusMessage;
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

window.onload = init;
