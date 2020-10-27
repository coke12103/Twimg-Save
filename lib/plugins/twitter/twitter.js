const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');
const jsdom = remote.require('jsdom');
const { JSDOM } = jsdom;

const twitter = async function(url, save_dir){
  const download = Clay.download;
  const notification = Clay.notification;

  // mobile.twitter.comの場合があるがURLの形式変わらんので雑に変換する
  url = url.replace("mobile.", "");

  var opt = {
    url: url,
    encoding: 'utf-8',
    method: 'GET',
    headers: { 'User-Agent': 'TenchaBot/0.1' }
  }

  try{
    var body = await request(opt);
    set_status_text("Get page: OK");
  }catch(e){
    console.log(e);
    notification.basic_error("投稿を取得することができませんでした!");
    set_status_text("download error");
    return;
  }

  var dom = new JSDOM(body);
  var parse_body = dom.window.document;

  var user_id_and_status_id = url.replace("https://twitter.com/", "");

  var user_id = user_id_and_status_id.match(/^(.+)(\/status\/)/)[1];
  var status_id = user_id_and_status_id.match(/(\/status\/)([0-9]+)/)[2];

  console.log(user_id);
  console.log(status_id);

  var image_count = 0;

  // ぶん回せないので回せるようにする
  // CSSのセレクタを利用してpropertyを参照する
  // これはjsdomだとmeta_tag.propertyがないElementが返ってくるため
  var metas = parse_body.querySelectorAll('meta[property="og:image"]');

  for(var i = 0; i < metas.length; i++){
    var meta_tag = metas[i];
    // TODO: video

    var media_url = meta_tag.content.replace("large", "orig");
    console.log(media_url);

    // profile_imagesがあるってことは画像付いてないってこと？
    if(media_url.match(/profile_images/)){
      set_status_text("No Image File");
      notification.no_file_error();
      return;
    }

    // videoとimageは共存しない
    if(media_url.match(/tweet_video_thumb|ext_tw_video_thumb/)){
      set_status_text("Unsupported media");
      notification.unsupported_notification("この添付メディアは現在は対応していません");
      return
    }

    var extension = media_url.match(/(\/media\/)(.+)(\.[a-zA-Z0-9]+)(:[a-zA-Z]+)$/)[3];
    var file_name = `tw_${user_id}_${status_id}_image${image_count}${extension}`;

    try{
      await download(media_url, file_name, save_dir);
    }catch(e){
      console.log(e);
      notification.basic_error("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
      set_status_text("download error");
      return;
    }

    image_count++;
  }

  // 1枚以下なら割と死なのでないよーって出す
  if(image_count < 1){
    notification.basic_error("画像がみつかりませんでした!\nHint: Twimg Saveは鍵アカウントの投稿には対応していません。\n凍結されたアカウントの投稿も同様に対応していません。");
    set_status_text("download error");
    return;
  }

  notification.end_notification(image_count, save_dir + '/' + file_name);
}

module.exports = { main: twitter };
