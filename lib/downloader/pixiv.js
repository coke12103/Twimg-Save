const electron = require('electron');
const remote = electron.remote;
const download = require('./download');
const notification = require('../notification');
const request = remote.require('request-promise');

const pixiv = function(url, save_dir){
  var html_parser = remote.require('fast-html-parser');
  var sleep = time => new Promise(resolve => setTimeout(resolve, time));

  request.get(url).then(async (body) => {
    var parse_body = html_parser.parse(body);

    if(parse_body.querySelector('.img-container a img') != null){
      var image_id = parse_body.querySelector('.img-container a img').rawAttrs.match(/(img\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+_)/)[1];
    }else{
      var image_id = parse_body.querySelector('.sensored img').rawAttrs.match(/(img\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+_)/)[1];
    }

    var pixiv_user_id = parse_body.querySelector('h2.name a').id.match(/[0-9]+/);
    var pixiv_image_id = image_id.match(/([0-9]+)_/)[1];

    var retry_count = 0;
    var image_count = 0;

    console.log("user id: " + pixiv_user_id);
    console.log("image id: " + image_id);

    set_status_text("Get page: OK");

    while(true){
      switch(retry_count){
        case 0:
          var image_url = "https://i.pximg.net/img-original/" + image_id + "p" + image_count + ".png";
          var file_name = "px_" + pixiv_user_id + "_" + pixiv_image_id + "_image" + image_count + ".png";
          set_status_text("Try get png file.");
          break;
        case 1:
          var image_url = "https://i.pximg.net/img-original/" + image_id + "p" + image_count + ".jpg";
          var file_name = "px_" + pixiv_user_id + "_" + pixiv_image_id + "_image" + image_count + ".jpg";
          set_status_text("Try get jpg file.");
          break;
// .jpegはないっぽい？
//        case 2:
//          var image_url = "https://i.pximg.net/img-original/" + image_id + "p" + image_count + ".jpeg";
//          var file_name = "px_" + pixiv_user_id + "_" + pixiv_image_id + "_image" + image_count + ".jpeg";
//          set_status_text("Try get jpeg file.");
//          await sleep(4000);
//          break;
      }

      console.log("current request url: " + image_url);
      try{
        var result = await download(image_url, file_name, save_dir, url);
      }catch{
        notification.error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
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
        if(image_count == 1){
          await sleep(1000);
        }else{
          await sleep(2500);
        }
      }

      console.log("retry: " + retry_count);
      console.log("image count: " + image_count);
      if(retry_count > 1){
        set_status_text("All download done!");
        notification.end_notification(image_count, save_dir + '/' + file_name);
        break;
      }
      if(image_count > 200){
        break;
      }
    }
  }).catch((err) => {
      if(err){
        console.log('Error: ' + err);
      }
  })
}

module.exports = pixiv;
