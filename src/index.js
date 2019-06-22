const electron = require('electron');
const remote = electron.remote;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img, false);
}

function get_img(){
  var input_url = document.getElementById("url_input");
  var request = remote.require('request');

  request.get(input_url.value, (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }
      console.log(res);
      console.log(body);
  })
}

window.onload = init;
