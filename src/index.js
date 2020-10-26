const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const path = remote.require("path");
const notification = require('../lib/notification');
const category = require('../lib/category');
const get_img = require('../lib/downloader/get');
const settings = require('../lib/settings');

const ClayCore = require('../lib/clay/clay_core.js');
const Clay = require('../lib/clay/clay.js');

var clay_core = new ClayCore();

var config;

function init(){
  settings.load();

  config = settings.value;

  category.set_categorys(config);
  ui_setup();
  console.log(category.categorys);

  clay_core.load(path.join(__dirname, "../lib/plugins"));
  clay_core.load("./plugins/");

  if(config.clipboard_check){
    check_clipboard_start();
  }
  set_status_text("Ready!");
}

function get_img_from_input(){
  var input_url = document.getElementById("url_input");

  get_img(input_url.value);
  set_input_url("");
}

function set_status_text(text){
  var status_text = document.getElementById("status_text");
  status_text.innerText = text;
}

function set_sns_type(type){
  var sns_type = document.getElementById("sns_type");
  sns_type.innerText = type;
}

function check_clipboard_start(){
  var clipboard = remote.clipboard;
  var check_clipboard_flag = document.getElementById("is_check_clipboard");
  var is_unlimited_download_flag = document.getElementById("is_unlimited_download");
  var prev_str = clipboard.readText();
  setInterval(() => {
      var current_str = clipboard.readText();
      if(!check_clipboard_flag.checked) return;
      if(prev_str == current_str) return;

      prev_str = current_str;
      if(clay_core.find_source(current_str).id){
        set_input_url(current_str);

        console.log("Match!!");
        if(is_unlimited_download_flag.checked){
          get_img_from_input();
          set_status_text("Clipboard Text: Download Start");
          notification.start_notification("クリップボードのURLからダウンロードを開始します...")
        }else{
          set_status_text("Clipboard Text: Match. Set url.");
          notification.copy_notification("クリップボードのURLをセットしました!");
        }
      }else{
        console.log("Not Match!")
        set_status_text("Clipboard Text: Not Match!")
      }
  }, 500);
}

function ui_setup(){
  // category
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
  // main
  var confirm_button = document.getElementById("confirm");
  var category_select = document.getElementById("category_select");
  // settings
  var settings_button = document.getElementById("settings_button");
  var settings_popup = document.getElementById("settings_popup");
  var settings_close = document.getElementById("settings_close");
  var settings_select_categorys_dir = document.getElementById("settings_select_categorys_dir");
  var settings_confirm = document.getElementById("settings_confirm");

  // main event
  confirm_button.addEventListener("click", get_img_from_input, false);

  // settings event
  settings_button.addEventListener("click", () => {
      settings_popup.classList.add('is_show');
      settings.edit_load();
  });

  settings_close.addEventListener("click", () => {
      settings_popup.classList.remove('is_show');
  });

  settings_confirm.addEventListener('click', () => {
      settings.update();
  });

  settings_select_categorys_dir.addEventListener('click', () => {
      var dialog = remote.dialog;

      dialog.showOpenDialog(null, {
          properties: ['openFile'],
          title: 'categorys.jsonの参照'
        }, (item) => {
          if(item[0] != undefined){
            document.getElementById('settings_categorys_dir_input').value = item[0];
          }
      })
  });

  // category event
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
  });

  confirm_delete_button.addEventListener('click', () => {
      category.del(config);
      delete_category_confirm_popup.classList.remove('is_show');
      edit_category_popup.classList.remove('is_show');
  });

  cancel_delete_button.addEventListener('click', () => {
      delete_category_confirm_popup.classList.remove('is_show');
  });

  folder_open_button.addEventListener('click', () => {
      var save_dir = category.categorys[document.getElementById("category_select").value].save_dir;
      electron.shell.openPath(save_dir);
  });

  edit_category_confirm.addEventListener('click', () => {
      category.update(config);
  });

  var input_url = document.getElementById("url_input");

  input_url.addEventListener("mousedown", (e) => {
      if(e.button == 2){
        set_input_url(remote.clipboard.readText());
      }
  });

  confirm_button.addEventListener("mousedown", (e) => {
      if(e.button == 2){
        set_input_url(remote.clipboard.readText());
      }
  });

  category_select.addEventListener("change", () => {
    document.title = "Twimg Save [" + category.categorys[document.getElementById("category_select").value].name + "]";
  })
}

function set_input_url(text){
  var input_url = document.getElementById("url_input");
  input_url.value = text;
}

window.onload = init;
