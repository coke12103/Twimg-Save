const electron = require('electron');
const remote = electron.remote;
const download = require('./download');
const notification = require('../notification');
const request = remote.require('request-promise');
const html_parser = remote.require('fast-html-parser');

const pixiv = function(url, save_dir){
  var sleep = time => new Promise(resolve => setTimeout(resolve, time));

  if(!url.match(/http[s]?:\/\//)){
    if(!url.match(/www\./)){
      url = "www." + url;
    }
    url = "https://" + url;
  }

  request.get(url).then(async (body) => {
    var parse_body = html_parser.parse(body, {script: true});

    if((parse_body.querySelector('.img-container a img') != null) || (parse_body.querySelector('.sensored img') != null)){
      if(parse_body.querySelector('.img-container a img') != null){
        var image_id = parse_body.querySelector('.img-container a img').rawAttrs.match(/(img\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+_)/)[1];
      }else if(parse_body.querySelector('.sensored img') != null){
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
    }else{
      console.log("New Download");
      for(var script_tag of parse_body.querySelectorAll('script')){
        if(!script_tag.attributes.src){
          if(script_tag.text.match(/use strict/)){
            var image_url = script_tag.text.match(/"https:\\\/\\\/i\.pximg\.net\\\/img-original\\\/img\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)\\\/([0-9]+)_p([0-9]+)\.([a-zA-Z0-9]+)"/);
            var extension = "." + image_url[9];
            var image_url_base = image_url[0].replace(/"|\\|(([0-9]+)\.[a-zA-Z1-9]+)/g, '');

            var images_len = script_tag.text.match(/"likeData"(.+)"pageCount":([0-9]+),"bookmarkCount"/);
            images_len = parseInt(images_len[2].match(/[0-9]+$/),10);

            var pixiv_user_id = script_tag.text.match(/"userId":"([0-9]+)"/g);
            pixiv_user_id = pixiv_user_id[pixiv_user_id.length -1].match(/[0-9]+/);

            var pixiv_image_id = image_url_base.match(/([0-9]+)_/)[1];

            console.log(image_url_base);
            console.log(extension);
            console.log(images_len);
            console.log("user id: " + pixiv_user_id);
            console.log("image id: " + pixiv_image_id);
          }
        }
      }

      var retry_count = 0;
      var image_count = 0;

      set_status_text("Get page: OK");

      while(images_len > image_count){
        switch(retry_count){
          case 0:
            var image_url = image_url_base + image_count + extension;
            var file_name = "px_" + pixiv_user_id + "_" + pixiv_image_id + "_image" + image_count + extension;
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
            var file_name = "px_" + pixiv_user_id + "_" + pixiv_image_id + "_image" + image_count + n_extension;
            set_status_text("Try 2");
            break;
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

        if(image_count > 200){
          break;
        }
        if(retry_count > 2){
          set_status_text("All download done!");
          break;
        }
      }

      set_status_text("All download done!");
      notification.end_notification(image_count, save_dir + '/' + file_name);
    }
  }).catch((err) => {
      if(err){
        console.log('Error: ' + err);
      }
  })
}


module.exports = pixiv;
