const electron = require('electron');
const remote = electron.remote;
const download = require('./download');
const notification = require('../notification');
const request = remote.require('request');

const twitter = function(url, save_dir){

  var html_parser = remote.require('fast-html-parser');
  url = url.replace("mobile.", "");

  request.get(url, async (err, res, body) => {
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
          var extension = media_url.match(/(\/media\/)(.+)(\.[a-zA-Z0-9]+)(:[a-zA-Z]+)$/)[3]
          var file_name = "tw_" + user_id + "_" + status_id + "_image" + image_count + extension;
          try{
            await download(media_url, file_name, save_dir);
          }catch{
            notification.error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
            return;
          }
          image_count++;
        }
      }
      notification.end_notification(image_count, save_dir + '/' + file_name);
  })
}

module.exports = twitter;