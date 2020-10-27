const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');
const html_parser = remote.require('fast-html-parser');

const yandere = async function(url, save_dir){
  const notification = Clay.notification;
  const download = Clay.download;

  var opt = {
    url: url,
    method: 'GET'
  };

  try{
    var body = await request(opt);
    set_status_text("Get page: OK");
  }catch(e){
    console.log(e);
    notification.basic_error("ページを取得することができませんでした!");
    set_status_text("download error");
    return;
  }

  // TODO: 気が向いたらjsdomにする
  var parse_body = html_parser.parse(body);

  var image_count = 0;

  // 消えてる場合があるのでその要素をみつける
  for(var status_notice of parse_body.querySelectorAll('.status-notice')){
    if(status_notice.text.match(/This post was deleted/)){
      notification.basic_error("投稿が削除されています!");
      set_status_text("download error");
      return;
    }
  }

  var artist_tag = parse_body.querySelectorAll('.tag-type-artist a')[1];

  var user_id;

  if(artist_tag) user_id = artist_tag.rawText;
  else user_id = "Unknown"

  var post_id = url.match(/post\/show\/([0-9]+)/)[1];

  console.log(user_id);
  console.log(post_id);

  // 元画像ままのファイルがある場合があるのであったらそれを狙う
  if(parse_body.querySelector('.original-file-unchanged')){
    console.log("unchanged");
    var media_url = parse_body.querySelector('.original-file-unchanged').rawAttributes.href;
  }else{
    console.log("changed");
    var media_url = parse_body.querySelector('.original-file-changed').rawAttributes.href;
  }

  console.log(media_url);

  var extension = media_url.match(/(\.[a-zA-Z0-9]+)$/)[1];
  var file_name = `yd_${user_id}_${post_id}_image${image_count}${extension}`;

  try{
    await download(media_url, file_name, save_dir);
  }catch(e){
    console.log(e);
    notification.basic_error("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
    set_status_text("download error");
    return;
  }

  notification.end_notification(1, save_dir + '/' + file_name);
}

module.exports = { main: yandere };
