const electron = require('electron');
const remote = electron.remote;
const download = require('./download');
const notification = require('../notification');
const request = remote.require('request');
const url = remote.require('url');

const pleroma = function(input_url, save_dir, count){
  var parse_url = url.parse(input_url);
  var status_id;

  if(/https:\/\/(.+)\/notice\/([a-zA-Z0-9]+)/.test(input_url)){
    status_id = parse_url.pathname.match(/notice\/([a-zA-Z0-9]+)/)[1];
  }else{
    var req = {
      url: input_url,
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    }

    request(req, (err, res, body) => {
        if(err){
          console.log('Error: ' + err.message);
          return;
        }

        console.log(res)
        console.log("Object to Notice");
        set_status_text("Object to Notice");
        console.log(res.request.uri.href);
        if(res.statusCode !== 200){
          notification.error_notification("非公開投稿または独自実装の公開範囲です\nHint: Twimg Saveは公開投稿以外の投稿の画像を取得することはできません。");
          return;
        }
        if(count > 1){
          notification.error_notification("無限ループを検知しました!\nHint: 完全にバグなので作者に教えてあげてね");
          return;
        }
        get_img(res.request.uri.href, count + 1);
    })
    return;
  }

  var domain = parse_url.protocol + "//" + parse_url.host;

  var req = {
    url: domain + '/api/v1/statuses/' + status_id,
    method: 'GET',
    json: true
  }
  console.log(status_id)
  request(req, async (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      console.log(body);
      console.log(res);

      if(res.statusCode !== 200){
        notification.error_notification("ページを取得することができませんでした!\nHint: Twimg Saveは公開投稿以外の投稿の画像を取得することはできません。");
        return;
      }

      if(body.media_attachments.length < 1){
        set_status_text("No Image File");
        notification.error_notification("添付ファイルがありません");
        return;
      }

      var image_count = 0;
      for(i = 0; body.media_attachments.length > i; i++){
        var media_url;
        if(body.media_attachments[i].remote_url){
          // remote
          media_url = body.media_attachments[i].remote_url;
        }else{
          // local
          media_url = body.media_attachments[i].url;
        }

        console.log(media_url);
        var extension = media_url.match(/\.[a-zA-Z0-9]+$/);
        var file_name = "pl_" + body.account.acct + "_";
        if(config.file_name_domain){
          file_name = file_name + parse_url.host + "_";
        }
        file_name = file_name + body.id + "_image" + image_count + extension;
        try{
          await download(media_url, file_name, save_dir);
        }catch{
          notification.error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
          return;
        }
        image_count++;
      }
      notification.end_notification(image_count, save_dir + '/' + file_name);
  })
}

module.exports = pleroma;
