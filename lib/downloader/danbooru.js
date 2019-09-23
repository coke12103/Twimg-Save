const electron = require('electron');
const remote = electron.remote;
const notification = require('../notification');
const request = remote.require('request');
const download = require('./download');
const html_parser = remote.require('fast-html-parser');

const danbooru = function(url, save_dir){
  request.get(url, async (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }
      if(res.statusCode !== 200){
        notification.error_notification("ページを取得することができませんでした!");
        return;
      }

      var parse_body = html_parser.parse(body);
      var image_count = 0;

      var artist_tag = parse_body.querySelector('.artist-tag-list .category-1 .search-tag');

      var user_id;

      if(artist_tag){
        user_id = artist_tag.rawText;
      }else{
        user_id = "Unknown"
      }

      var post_id = url.match(/posts\/([0-9]+)/)[1];

      console.log(user_id);
      console.log(post_id);

      set_status_text("Get page: " + res.statusMessage);

      for(var li of parse_body.querySelectorAll('#post-information ul li')){
        if(li.rawText.match(/Size:/)){
          if(li.querySelector('a')){
            var media_url = li.querySelector('a').rawAttributes.href;
            console.log(media_url);
            var extension = media_url.match(/(\.[a-zA-Z0-9]+)$/)[1]
            var file_name = "du_" + user_id + "_" + post_id + "_image" + image_count + extension;
            try{
              await download(media_url, file_name, save_dir);
            }catch{
              notification.error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
              return;
            }
            image_count++;
          }else{
            notification.error_notification("画像が取得できませんでした!");
            return;
          }
        }
      }
      notification.end_notification(image_count, save_dir + '/' + file_name);
  })
}

module.exports = danbooru;
