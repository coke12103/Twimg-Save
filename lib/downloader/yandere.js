const electron = require('electron');
const remote = electron.remote;
const notification = require('../notification');
const request = remote.require('request');
const download = require('./download');

const yandere = function(url, save_dir){
  var html_parser = remote.require('fast-html-parser');

  request.get(url, async (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      var parse_body = html_parser.parse(body);
      var image_count = 0;

      var artist_tag = parse_body.querySelectorAll('.tag-type-artist a')[1];

      var user_id;

      if(artist_tag){
        user_id = artist_tag.rawText;
      }else{
        user_id = "Unknown"
      }

      var post_id = url.match(/post\/show\/([0-9]+)/)[1];

      console.log(user_id);
      console.log(post_id);

      set_status_text("Get page: " + res.statusMessage);

      var media_url = parse_body.querySelector('.original-file-unchanged').rawAttributes.href;
      console.log(media_url);
      var extension = media_url.match(/(\.[a-zA-Z0-9]+)$/)[1]
      var file_name = "yd_" + user_id + "_" + post_id + "_image" + image_count + extension;
      try{
        await download(media_url, file_name, save_dir);
      }catch{
        notification.error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
        return;
      }
      notification.end_notification(1, save_dir + '/' + file_name);
  })
}

module.exports = yandere;
