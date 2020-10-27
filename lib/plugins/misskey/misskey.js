const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');
const url = remote.require('url');

const misskey = async function(input_url, save_dir){
  var download = Clay.download;
  var notification = Clay.notification;

  var parse_url = url.parse(input_url);

  var domain = `${parse_url.protocol}//${parse_url.host}`;
  var note_id = parse_url.pathname.match(/notes\/(.+)/)[1]
  console.log(note_id)

  var req = {
    url: `${domain}/api/notes/show`,
    method: 'POST',
    json: { noteId: note_id }
  }

  try{
    var body = await request(req);
  }catch(e){
    console.log(e);
    set_status_text("Error");
    notification.basic_error("投稿を取得することができませんでした。");
    return;
  }

  // 一応trapで公開範囲公開以外のやつに対応する気持ちだけを出しておく
  if(!body.visibility.match(/public|home/)){
    var trap_data = {
      code: "misskey_visibility_is_unpublic",
      message: "非公開投稿または独自実装の公開範囲です\nHint: Twimg Saveは公開投稿以外の投稿の画像を取得することはできません。",
      input_url: input_url
    };
    set_status_text("download error");
    console.log(body.visibility);
    Clay.trap(trap_data);
    return;
  }

  // remoteの投稿だったら該当するプラグインに投げる
  if(body.uri){
    console.log("remote")
    set_status_text("Remote Posts.")
    get_img(body.uri);
    console.log(body.uri);

    return;
  }

  // 画像ファイルがなければやることがないので死ぬ
  if(!body.files || body.files.length < 1){
    set_status_text("No Image File");
    notification.no_file_error();
    return;
  }

  var image_count = 0;

  for(var file of body.files){
    var extension = file.name.match(/\.[a-zA-Z0-9]+$/);
    var file_name = `mk_${body.user.username}_`;

    // ドメインほしいっつうならやるよ
    if(config.file_name_domain) file_name = `${file_name}${parse_url.host}_`;

    file_name = `${file_name}${body.id}_image${image_count}${extension}`;

    try{
      await download(file.url, file_name, save_dir);
    }catch(e){
      console.log(e);
      notification.basic_error("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
      set_status_text("download error");
      return;
    }

    image_count++
  }

  notification.end_notification(image_count, save_dir + '/' + file_name);
}

module.exports = { main: misskey };
