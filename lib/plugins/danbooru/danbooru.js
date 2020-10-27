const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');
const html_parser = remote.require('fast-html-parser');

const danbooru = async function(url, save_dir){
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

  // TODO: jsdomに置き換える？
  var parse_body = html_parser.parse(body);

  var user_id;
  var post_id = url.match(/posts\/([0-9]+)/)[1];

  // FIXME: ここに引っ掛からないタグがある
  var artist_tag = parse_body.querySelector('.artist-tag-list .category-1 .search-tag');
  if(artist_tag) user_id = artist_tag.rawText;
  else user_id = "Unknown";

  console.log(user_id);
  console.log(post_id);

  var image_count = 0;

  for(var li of parse_body.querySelectorAll('#post-information ul li')){
    // 'Size:' があるliの要素にリンクがある、なければそれはリンクじゃないので飛ばす
    if(!li.rawText.match(/Size:/)) continue;

    // 'Size:' があるのにその下にaタグなければダウンロードできないので死ぬ
    if(!li.querySelector('a')){
      notification.basic_error("画像が取得できませんでした!");
      set_status_text("download error");
      return;
    }

    var media_url = li.querySelector('a').rawAttributes.href;
    console.log(media_url);

    var extension = media_url.match(/(\.[a-zA-Z0-9]+)$/)[1]
    var file_name = `du_${user_id}_${post_id}_image${image_count}${extension}`;

    try{
      await download(media_url, file_name, save_dir);
    }catch{
      notification.basic_error("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
      set_status_text("download error");
      return;
    }
    image_count++;
  }

  notification.end_notification(image_count, save_dir + '/' + file_name);
}

module.exports = { main: danbooru };
