const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const notification = require('../lib/notification');
const category = require('../lib/category');
const downloader = require('../lib/downloader/index');

var config;

function init(){
  var confirm_button = document.getElementById("confirm");

  confirm_button.addEventListener("click", get_img_from_input, false);
  config = load_conf();

  category.set_categorys(config);
  ui_setup();
  console.log(category.categorys);
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
  var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;
  switch(check_sns_type(url)){
    case "twitter":
      downloader.twitter(url, save_dir);
      break;
    case "misskey":
      downloader.misskey(url, save_dir);
      break;
    case "mastodon":
      downloader.mastodon(url, save_dir);
      break;
    case "pleroma":
      downloader.pleroma(url, save_dir);
      break;
    case "pixiv":
      downloader.pixiv(url, save_dir);
      break;
  }
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
      case /http[s]?:\/\/www\.pixiv\.net\/member_illust\.php/i.test(url):
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
  var clipboard = remote.clipboard;
  var check_clipboard_flag = document.getElementById("is_check_clipboard");
  var prev_str = clipboard.readText();
  setInterval(() => {
      var current_str = clipboard.readText();
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
      category.edit_load();
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
      category.add(config);
  });

  delete_category_button.addEventListener('click', () => {
      delete_category_confirm_popup.classList.add('is_show');
  })

  confirm_delete_button.addEventListener('click', () => {
      category.del(config);
      delete_category_confirm_popup.classList.remove('is_show');
      edit_category_popup.classList.remove('is_show');
  })

  cancel_delete_button.addEventListener('click', () => {
      delete_category_confirm_popup.classList.remove('is_show');
  })

  folder_open_button.addEventListener('click', () => {
      var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;
      electron.shell.openItem(save_dir);
  })

  edit_category_confirm.addEventListener('click', () => {
      category.update(config);
  })
}

function set_input_url(text){
  var input_url = document.getElementById("url_input");
  input_url.value = text;
}

window.onload = init;
