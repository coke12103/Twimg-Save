const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');

var config;
var categorys;
var categorys_json;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img_from_input, false);
  config = load_conf();

  set_categorys();
  ui_setup();
  console.log(categorys);
  set_status_text("Ready!")

  if(config.clipboard_check){
    check_clipboard_start();
  }
}

function get_img_from_input(){
  var input_url = document.getElementById("url_input");

  get_img(input_url.value);
}

function get_img(url){
  console.log("start");
  switch(check_sns_type(url)){
    case "twitter":
      get_twitter_img(url);
      break;
    case "misskey":
      get_misskey_img(url);
      break;
    case "mastodon":
      get_mastodon_img(url);
      break;
    case "pleroma":
      get_pleroma_img(url);
      break;
    case "pixiv":
      get_pixiv_img(url);
      break;
  }
}

function get_misskey_img(input_url){
  var request = remote.require('request');
  var url = remote.require('url');
  var parse_url = url.parse(input_url);
  var note_id = parse_url.pathname.match(/notes\/(.+)/)[1]

  var domain = parse_url.protocol + "//" + parse_url.host;

  var req = {
    url: domain + '/api/notes/show',
    method: 'POST',
    json: {
      "noteId": note_id
    }
  }

  console.log(note_id)
  request(req, async (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      if(body.uri){
        console.log("remote")
        set_status_text("Remote Posts.")
        get_img(body.uri)
        console.log(body.uri);

        return;
      }

      if(!body.files){
        set_status_text("No Image File");
        return;
      }

      var image_count = 0;
      for(i = 0; body.files.length > i; i++){
        var extension = body.files[i].name.match(/\.[a-zA-Z0-9]+$/);
        var file_name = "mk_" + body.user.username + "_";
        if(config.file_name_domain){
          file_name = file_name + parse_url.host + "_";
        }
        file_name = file_name + body.id + "_image" + image_count + extension;

        try{
          await get_image_file(body.files[i].url, file_name);
        }catch{
          error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
          return;
        }

        image_count++
      }
      end_notification(image_count);
  })
}

function get_mastodon_img(input_url){
  var request = remote.require('request');
  var url = remote.require('url');
  var parse_url = url.parse(input_url);
  var status_id;

  if(/https:\/\/(.+)\/@(.+)\/([0-9]+)/.test(input_url)){
    status_id = parse_url.pathname.match(/@(.+)\/([0-9]+)/)[2];
  }else{
    status_id = parse_url.pathname.match(/users\/(.+)\/statuses\/([0-9]+)/)[2];
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

      if(body.media_attachments.length < 1){
        set_status_text("No Image File");
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
        var file_name = "don_" + body.account.acct + "_";
        if(config.file_name_domain){
          file_name = file_name + parse_url.host + "_";
        }
        file_name = file_name + body.id + "_image" + image_count + extension;
        try{
          await get_image_file(media_url, file_name);
        }catch{
          error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
          return;
        }

        image_count++;
      }
      end_notification(image_count);
  })
}

function get_pleroma_img(input_url){
  var request = remote.require('request');
  var url = remote.require('url');
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

        console.log("Object to Notice");
        set_status_text("Object to Notice");
        console.log(res.request.uri.href);
        get_img(res.request.uri.href);
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

      console.log(body)

      if(body.media_attachments.length < 1){
        set_status_text("No Image File");
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
          await get_image_file(media_url, file_name);
        }catch{
          error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
          return;
        }
        image_count++;
      }
      end_notification(image_count);
  })
}

function get_twitter_img(url){
  var request = remote.require('request');
  var html_parser = remote.require('fast-html-parser');
  url = url.replace("mobile.", "");

  request.get(url, async (err, res, body) => {
      if(err){
        console.log('Error: ' + err.message);
        return;
      }

      var parse_body = html_parser.parse(body);
      var image_count = 0;
      var user_id_and_status_id = url.replace("https://twitter.com/", "");
      var user_id = user_id_and_status_id.match(/^(.+)(\/status\/)/)[1];
      var status_id = user_id_and_status_id.match(/(\/status\/)([0-9]+)/)[2];

      console.log(user_id);
      console.log(status_id);

      set_status_text("Get page: " + res.statusMessage);

      for(var meta_tag of parse_body.querySelectorAll('meta')){
        // video: og:video:url
        if(meta_tag.attributes.property == "og:image"){
          var media_url = meta_tag.attributes.content;
          media_url = media_url.replace("large", "orig");
          var extension = media_url.match(/(\/media\/)(.+)(\.[a-zA-Z0-9]+)(:[a-zA-Z]+)$/)[3]
          try{
            await get_image_file(media_url, "tw_" + user_id + "_" + status_id + "_image" + image_count + extension);
          }catch{
            error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
            return;
          }
          image_count++;
        }
      }
      end_notification(image_count);
  })
}

function get_pixiv_img(url){
  var request = remote.require('request-promise');
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
        var result = await get_image_file(image_url, file_name, url);
      }catch{
        error_notification("ファイルの書き込みに失敗しました!\nHint: 保存先に指定されたフォルダが消えていませんか？消えていないならそのフォルダに書き込み権限はありますか？");
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
        end_notification(image_count);
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

function get_image_file(url, name, ref){
  return new Promise((resolve, reject) => {
    var request = remote.require('request-promise');

    if(ref){
      var opt = {
        url: url,
        method: 'GET',
        encoding: null,
        headers: {
          'Referer': ref,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
        }
      }
    }else{
      var opt = {
        url: url,
        encoding: null,
        method: 'GET'
      }
    }

    set_input_url("");
    request(opt).then((body) => {
        console.log("Download Image File: OK");
        set_status_text("Download: OK");
        var save_dir = categorys[document.getElementById("category_select").value].save_dir;
        try{
          fs.writeFileSync(save_dir + "/" + name, body, {encoding: 'binary'}, (err) => {
              console.log(err);
          });
        }catch(err){
          console.log(err);

          reject("Write Error!");
        }
        resolve(true);
    }).catch((err) => {
        set_status_text("Download: " + err.statusCode);
        console.log(err.statusCode);
        resolve(false);
    });
  })
}


function load_conf(){
  try{
    var config = JSON.parse(
      fs.readFileSync(
        './.config.json'
      )
    );
    return config;
  }catch(err){
    set_status_text("config file not found");
    throw err;
  }
}

function load_category(){
  try{
    var cat = JSON.parse(
      fs.readFileSync(
        config.categorys_path
      )
    );

    return cat;
  }catch(err){
    try{
      fs.statSync(config.categorys_path);
      console.log("Categorys File Found")
      error_notification("カテゴリーファイルがパースできませんでした!\nHint: categorys.jsonの構造が壊れていないか確認してみてください。")

    }catch(err){
      console.log("Categorys File Not Found");
      data = {
        categorys: [
          {
            "id": 0,
            "name": "デフォルト",
            "save_dir": "./gets"
          },
          {
            "id": 1,
            "name": "nsfw",
            "save_dir": "./gets/nsfw"
          }
        ]
      }
      fs.writeFileSync(config.categorys_path, JSON.stringify(data), (err) => {
          if(err){
            console.log(err);
            throw err;
          }
      })
      set_status_text("Create categorys sample");
      var cat = JSON.parse(
        fs.readFileSync(
          config.categorys_path
        )
      );
      return cat;
    }
  }
}

function set_categorys(){
  categorys_json = load_category();
  categorys = categorys_json.categorys;

  var category_select = document.getElementById("category_select");
  while (category_select.firstChild) category_select.removeChild(category_select.firstChild);

  for(var i in categorys){
    var cat = document.createElement("option");
    cat.value = categorys[i].id;
    cat.text = categorys[i].name;
    category_select.appendChild(cat);
  }
}

function set_status_text(text){
  var status_text = document.getElementById("status_text");
  status_text.innerText = text;
}

function set_sns_type(type){
  var sns_type = document.getElementById("sns_type");
  sns_type.innerText = type;
}

function check_sns_type(url){
  var type;
  switch(true){
    case /https:\/\/(mobile\.)?twitter\.com\/.+\/status\/.+/i.test(url):
      set_sns_type("Twitter");
      type = "twitter";
      break;
    case /https:\/\/(.+)\/notes\/([a-zA-Z0-9]+)/.test(url):
      set_sns_type("Misskey");
      type = "misskey";
      break;
    case /https:\/\/(.+)\/@(.+)\/([0-9]+)/.test(url) || /https:\/\/(.+)\/users\/(.+)\/statuses\/([0-9]+)/.test(url):
      set_sns_type("Mastodon");
      type = "mastodon";
      break;
    case /https:\/\/(.+)\/notice\/([a-zA-Z0-9]+)/.test(url) || /https:\/\/(.+)\/objects\/.+/.test(url):
      set_sns_type("Pleroma");
      type = "pleroma";
      break;
      case /https:\/\/www\.pixiv\.net\/member_illust\.php/i.test(url):
      set_sns_type("Pixiv");
      type = "pixiv";
      break;
    default:
      //set_sns_type("Unknoun");
      type = false;
      break;
    }
    return type;
}

function check_clipboard_start(){
  var clipboard = remote.require('clipboardy');
  var check_clipboard_flag = document.getElementById("is_check_clipboard");
  var prev_str = clipboard.readSync();
  setInterval(() => {
      var current_str = clipboard.readSync();
      if(check_clipboard_flag.checked){
        if(prev_str != current_str){
          prev_str = current_str;
          if(check_sns_type(current_str)){
            set_input_url(current_str);
            set_status_text("Clipboard Text: Match. Set url.");
            new Notification('Twimg Save', {
                body: "クリップボードのURLをセットしました!"
            });

            console.log("Match!!");
          }else{
            console.log("Not Match!")
            set_status_text("Clipboard Text: Not Match!")
          }
        }
      }
  }, 500);
}

function ui_setup(){
  var add_category_open_button = document.getElementById('add_category_button');
  var add_category_close_button = document.getElementById('add_category_close');
  var edit_category_open_button = document.getElementById('edit_category_button');
  var edit_category_close_button = document.getElementById('edit_category_close');
  var add_category_folder_select_button = document.getElementById('add_category_select_save_directory');
  var edit_category_folder_select_button = document.getElementById('edit_category_select_save_directory');
  var add_category_popup = document.getElementById('category_add_popup');
  var edit_category_popup = document.getElementById('category_edit_popup');
  var delete_category_confirm_popup = document.getElementById('category_delete_confirm_popup');
  var add_category_confirm = document.getElementById('add_category_confirm');
  var delete_category_button = document.getElementById('delete_category_confirm');
  var folder_open_button = document.getElementById('open_current_category_folder');
  var confirm_delete_button = document.getElementById('delete_comfirm');
  var cancel_delete_button = document.getElementById('delete_cancel');
  var edit_category_confirm = document.getElementById('edit_category_confirm');

  add_category_open_button.addEventListener('click', () => {
      add_category_popup.classList.add('is_show');
  });

  edit_category_open_button.addEventListener('click', () => {
      edit_category_popup.classList.add('is_show');
      edit_category_load();
  });

  add_category_close_button.addEventListener('click', () => {
      add_category_popup.classList.remove('is_show');
  });

  edit_category_close_button.addEventListener('click', () => {
      edit_category_popup.classList.remove('is_show');
  });

  add_category_folder_select_button.addEventListener('click', () => {
      var dialog = remote.dialog;

      dialog.showOpenDialog(null, {
          properties: ['openDirectory'],
          title: 'フォルダの選択'
        }, (folder) => {
          document.getElementById('add_category_folder_path_input').value = folder[0];
      })
  });

  edit_category_folder_select_button.addEventListener('click', () => {
      var dialog = remote.dialog;

      dialog.showOpenDialog(null, {
          properties: ['openDirectory'],
          title: 'フォルダの選択'
        }, (folder) => {
          document.getElementById('edit_category_folder_path_input').value = folder[0];
      })
  });

  add_category_confirm.addEventListener('click', () => {
      add_new_category();
  });

  delete_category_button.addEventListener('click', () => {
      delete_category_confirm_popup.classList.add('is_show');
  })

  confirm_delete_button.addEventListener('click', () => {
      delete_category();
      delete_category_confirm_popup.classList.remove('is_show');
      edit_category_popup.classList.remove('is_show');
  })

  cancel_delete_button.addEventListener('click', () => {
      delete_category_confirm_popup.classList.remove('is_show');
  })

  folder_open_button.addEventListener('click', () => {
      var save_dir = document.getElementById("category_select").value;
      electron.shell.openItem(save_dir);
  })

  edit_category_confirm.addEventListener('click', () => {
      update_category();
  })
}

function add_new_category(){
  var name = document.getElementById('add_category_name_input');
  var folder = document.getElementById('add_category_folder_path_input');
  var error_display = document.getElementById('error_display');

  if(!folder.value | !name.value){
    if(!folder.value){
      var p = document.createElement('p');
      p.innerText = "フォルダが選択されていません!";
      error_display.appendChild(p);
    }
    if(!name.value){
      var p = document.createElement('p');
      p.innerText = "名前が入っていません!";
      error_display.appendChild(p);
    }
    return;
  }

  var cat_id = categorys[categorys.length - 1].id + 1;
  var cat = {
    "id": cat_id,
    "name": name.value,
    "save_dir": folder.value
  }

  console.log(categorys);
  console.log(categorys_json);
  categorys_json.categorys.push(cat);
  write_categorys_to_file();

  name.value = '';
  folder.value = '';
  while(error_display.firstChild) error_display.removeChild(error_display.firstChild);

  document.querySelector(".add_category_folder_path_input_area").classList.remove('is-dirty');
  document.querySelector(".add_category_name_input_area").classList.remove('is-dirty');

  document.getElementById('add_category_close').click();
}

function update_category(){
  var selected_category_id = document.getElementById("category_select").value;
  var name = document.getElementById('edit_category_name_input');
  var folder = document.getElementById('edit_category_folder_path_input');

  if(!folder.value | !name.value){
    if(!folder.value){
      folder.value = categorys[selected_category_id].save_dir;
    }
    if(!name.value){
      name.value = categorys[selected_category_id].name;
    }
  }

  categorys_json.categorys[selected_category_id].save_dir = folder.value;
  categorys_json.categorys[selected_category_id].name = name.value;

  fix_category_id();

  console.log(categorys);
  console.log(categorys_json);

  write_categorys_to_file();

  document.getElementById('edit_category_close').click();
  set_status_text("カテゴリを更新しました!");
}

function edit_category_load(){
  var selected_category_id = document.getElementById("category_select").value;
  var name_input = document.getElementById("edit_category_name_input");
  var path_input = document.getElementById("edit_category_folder_path_input");

  var name = categorys[selected_category_id].name;
  var path = categorys[selected_category_id].save_dir;

  name_input.value = name;
  path_input.value = path;
  document.querySelector(".edit_category_folder_path_input_area").classList.add('is-dirty');
  document.querySelector(".edit_category_name_input_area").classList.add('is-dirty');
}

function delete_category(){
  var selected_category_id = document.getElementById("category_select").value;
  categorys_json.categorys.splice(selected_category_id, 1);
  console.log(categorys_json);
  fix_category_id();
  write_categorys_to_file();
  set_status_text("カテゴリを削除しました!");
}

function fix_category_id(){
  categorys_json.categorys.forEach((val, index) => {
      categorys_json.categorys[index].id = index;
  });
  console.log(categorys_json);
}

function write_categorys_to_file(){
  fs.writeFileSync(config.categorys_path, JSON.stringify(categorys_json), (err) => {
      if(err){
        console.log(err);
        throw err;
      }
  });
  console.log("write!");
  set_status_text("カテゴリを更新しました!");
  set_categorys();
}

function end_notification(count){
  new Notification('Twimg Save', {
      body: count + "枚の画像を保存しました!"
  });
}

function error_notification(err){
  var dialog = remote.dialog;
  new Notification('Twimg Save', {
      body: "Error: " + err
  });
  dialog.showErrorBox("Twimg Save Error: ", err);
}

function set_input_url(text){
  var input_url = document.getElementById("url_input");
  input_url.value = text;
}

window.onload = init;
