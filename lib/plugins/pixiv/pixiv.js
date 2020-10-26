const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');
const jsdom = remote.require('jsdom');
const { JSDOM } = jsdom;
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const pixiv = async function(url, save_dir){
  const download = Clay.download;
  const notification = Clay.notification;

  // httpsがない場合とかwwwがない場合とか適当に捌く
  if(!url.match(/http[s]?:\/\//)){
    if(!url.match(/www\./)) url = `www.${url}`;
    url = `https://${url}`;
  }

  var opt = {
    url: url,
    method: 'GET'
  };

  try{
    var body = await request(opt);
  }catch(e){
    console.log(e);
    notification.basic_error("ページを取得することができませんでした!\nHint: Twimg Saveは公開投稿以外の投稿の画像を取得することはできません。");
    return;
  }

  // レンダラー上にいるので被りそうなのを避ける
  var dom = new JSDOM(body);
  var parse_body = dom.window.document;

  // これ旧来のダウンロード？
  if(
    (parse_body.querySelector('.img-container a img') != null)
    || (parse_body.querySelector('.sensored img') != null)
  ){
    var image_id_reg = /(img\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+_)/i;

    if(parse_body.querySelector('.img-container a img') != null){
      var image_id = parse_body.querySelector('.img-container a img').rawAttrs.match(image_id_reg)[1];
    }else if(parse_body.querySelector('.sensored img') != null){
      var image_id = parse_body.querySelector('.sensored img').rawAttrs.match(image_id_reg)[1];
    }

    var pixiv_user_id = parse_body.querySelector('h2.name a').id.match(/[0-9]+/);
    var pixiv_image_id = image_id.match(/([0-9]+)_/)[1];

    var retry_count = 0;
    var image_count = 0;

    console.log(`user id: ${pixiv_user_id}`);
    console.log(`image id: ${image_id}`);

    set_status_text("Get page: OK");

    while(true){
      switch(retry_count){
        case 0:
          var image_url = `https://i.pximg.net/img-original/${image_id}p${image_count}.png`;
          var file_name = `px_${pixiv_user_id}_${pixiv_image_id}_image${image_count}.png`;
          set_status_text("Try get png file.");
          break;
        case 1:
          var image_url = `https://i.pximg.net/img-original/${image_id}p${image_count}.jpg`;
          var file_name = `px_${pixiv_user_id}_${pixiv_image_id}_image${image_count}.jpg`;
          set_status_text("Try get jpg file.");
          break;
// .jpegはないっぽい？
//      case 2:
//        var image_url = `https://i.pximg.net/img-original/${image_id}p${image_count}.jpeg`;
//        var file_name = `px_${pixiv_user_id}_${pixiv_image_id}_image${image_count}.jpeg`;
//        set_status_text("Try get jpeg file.");
//        await sleep(4000);
//        break;
      }

      console.log(`current request url: ${image_url}`);

      try{
        var result = await download(image_url, file_name, save_dir, url);
      }catch(e){
        console.log(e);
        notification.basic_error("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
        set_status_text("download error");
        break;
      }

      if(result){
        image_count++;
        retry_count = 0;
        set_status_text("OK, Try next image.");
        await sleep(800);
      }else{
        console.log(result);
        retry_count++;
        set_status_text(`Retry ${retry_count}`);

        if(image_count == 1) await sleep(1000);
        else await sleep(2500);
      }

      console.log(`retry: ${retry_count}`);
      console.log(`image count: ${image_count}`);

      if(retry_count > 1){
        set_status_text("All download done!");
        notification.end_notification(image_count, `${save_dir}/${file_name}`);
        break;
      }

      if(image_count > 200) break;
    }
  // 多分これが新しいダウンロード
  }else{
    // for(var script_tag of parse_body.querySelectorAll('script')){
    //   if(!script_tag.attributes.src){
    //     if(script_tag.text.match(/use strict/)){
    //       var image_url = script_tag.text.match(/"https:\\\/\\\/i\.pximg\.net\\\/img-original\\\/img\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)_p([0-9]+)\.([a-zA-Z0-9]+)"/);
    //       console.log("Ugoira...?: " + (image_url == null));
    //       if(image_url == null){
    //         set_status_text("Unsupported media");
    //         notification.unsupported_notification("うごイラっぽいです。がんばって対応しようとしてますがまだできてないです。");
    //         return;
    //       }
    //       var extension = "." + image_url[9];
    //       var image_url_base = image_url[0].replace(/"|\\|(([0-9]+)\.[a-zA-Z1-9]+)/g, '');

    //       var images_len = script_tag.text.match(/"likeData"(.+)"pageCount":([0-9]+),"bookmarkCount"/);
    //       images_len = parseInt(images_len[2].match(/[0-9]+$/),10);

    //       var pixiv_user_id = script_tag.text.match(/"userId":"([0-9]+)"/g);
    //       pixiv_user_id = pixiv_user_id[pixiv_user_id.length -1].match(/[0-9]+/);

    //       console.log(image_url_base);
    //       console.log(extension);
    //       console.log(images_len);
    //       console.log("user id: " + pixiv_user_id);
    //       console.log("image id: " + pixiv_image_id);
    //     }
    //   }
    // }
// ここまで

    console.log("New Download");

    var pixiv_image_id = url.match(/([0-9]+)/)[0];

    try{
      console.log(parse_body.querySelector("#meta-preload-data"))
      var image_data = JSON.parse(parse_body.querySelector("#meta-preload-data").content).illust[parseInt(pixiv_image_id)];
    }catch(e){
      console.log(e);
      notification.error_notification("HTMLも解析に失敗しました!\n仕様変更の可能性があります。開発者に連絡してください。");
      set_status_text("download error");
      return;
    }

    var image_url = image_data.urls.original;
    var is_ugoira = (image_data.illustType == 2)

    console.log("Ugoira...?: " + is_ugoira);

    if(is_ugoira){
      set_status_text("Unsupported media");
      notification.unsupported_notification("うごイラです。現在非対応です。");
      return;
    }

    var extension = image_url.match(/\.[a-zA-Z0-9]+$/);
    var image_url_base = image_url.replace(/0\.[a-zA-Z0-9]+$/, '');
    var images_len = parseInt(image_data.pageCount);
    var pixiv_user_id = image_data.userId;

    console.log("image_url_sample: " + image_url);
    console.log("image_url_base: " + image_url_base);
    console.log("extension: " + extension);
    console.log("images_count: " + images_len);
    console.log("user_id: " + pixiv_user_id);
    console.log("image_id: " + pixiv_image_id);

    var retry_count = 0;
    var image_count = 0;

    set_status_text("Get page: OK");

    while(images_len > image_count){
      switch(retry_count){
        case 0:
          var image_url = image_url_base + image_count + extension;
          var file_name = `px_${pixiv_user_id}_${pixiv_image_id}_image${image_count}${extension}`;
          set_status_text("Try 1");
          break;
        case 1:
          switch(extension){
            case ".png":
              var n_extension = ".jpg";
              break;
            case ".jpg":
              var n_extension = ".png";
              break;
          }
          var image_url = image_url_base + image_count + n_extension;
          var file_name = `px_${pixiv_user_id}_${pixiv_image_id}_image${image_count}${n_extension}`;
          set_status_text("Try 2");
          break;
      }

      console.log(`current request url: ${image_url}`);
      try{
        var result = await download(image_url, file_name, save_dir, url);
      }catch{
        notification.basic_error("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
        set_status_text("download error");
        break;
      }

      if(result){
        image_count++;
        retry_count = 0;
        set_status_text("OK, Try next image.");
        await sleep(800);
      }else{
        console.log(result);
        retry_count++;
        set_status_text("Retry " + retry_count);
        if(image_count == 1) await sleep(1000);
        else await sleep(2500);
      }

      console.log(`retry: ${retry_count}`);
      console.log(`image count: ${image_count}`);

      if(image_count > 200) break;

      if(retry_count > 2){
        set_status_text("All download done!");
        break;
      }
    }

    if(image_count == 0){
      console.log("no image?");
      set_status_text("download error");
      notification.basic_error("何らかの処理に失敗しました!!\n詳細: 画像枚数が0枚のまま終了処理が発生しました。\nこれは通常の処理上ではありえないため、Pixivの仕様変更の可能性があります。\n開発者に連絡してください。");
    }else{
      set_status_text("All download done!");
      notification.end_notification(image_count, save_dir + '/' + file_name);
    }
  }
}

module.exports = { main: pixiv };