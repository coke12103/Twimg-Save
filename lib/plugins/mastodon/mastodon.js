const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');
const url = remote.require('url');

const mastodon = async function(input_url, save_dir){
  var download = Clay.download;
  var notification = Clay.notification;

  console.log(input_url)
  var parse_url = url.parse(input_url);

  var status_id;

  if(/https:\/\/(.+)\/@(.+)\/([0-9]+)/.test(input_url)) status_id = parse_url.pathname.match(/@(.+)\/([0-9]+)/)[2];
  else status_id = parse_url.pathname.match(/users\/(.+)\/statuses\/([0-9]+)/)[2];

  console.log(status_id)

  var domain = `${parse_url.protocol}//${parse_url.host}`;

  var req = {
    url: `${domain}/api/v1/statuses/${status_id}`,
    method: 'GET',
    json: true
  }

  try{
    var body = await request(req);
  }catch(e){
    console.log(e);
    notification.basic_error("ページを取得することができませんでした!\nHint: Twimg Saveは公開投稿以外の投稿の画像を取得することはできません。");
    set_status_text("download error");
    return;
  }

  // 画像がなければねぇぞつって終わる
  if(body.media_attachments.length < 1){
    set_status_text("No Image File");
    notification.no_file_error();
    return;
  }

  var image_count = 0;

  for(var media of body.media_attachments){
    var media_url;

    // remote
    if(media.remote_url) media_url = media.remote_url;
    // local
    else media_url = media.url;

    console.log(media_url);

    // これで多分変にオプション付いてても大丈夫？
    var extension = media_url.match(/(\.[a-zA-Z0-9]+)(\?.+)?$/)[1];

    var file_name = `don_${body.account.acct}_`;
    // 設定でドメインいるってんなら付ける
    if(config.file_name_domain) file_name = `${file_name}${parse_url.host}_`;

    file_name = `${file_name}${body.id}_image${image_count}${extension}`;

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

  notification.end_notification(image_count, save_dir + '/' + file_name);
}

module.exports = { main: mastodon };
