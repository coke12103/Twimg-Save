const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const notification = require('./notification');
const category = require('./category');

const settings = {
  load: function(){
    try{
      var settings = JSON.parse(
        fs.readFileSync(
          './.config.json'
        )
      );

      this.value = settings;
    }catch(err){
      try{
        fs.statSync('./.config.json');
        console.log("Config File Found");
        notification.error_notification("設定ファイルがパースできませんでした!\nHint: .config.jsonの構造が壊れていないか確認してみてください。");
      }catch(err){
        console.log("Config File Not Found");
        data = {
          clipboard_check: true,
          file_name_domain: true,
          categorys_path: './categorys.json',
          notification_main: true,
          notification_end: true,
          notification_copy: true,
          notification_auto_download_start: true,
          notification_auto_download_end: true
        };
        fs.writeFileSync('./.config.json', JSON.stringify(data), (err) => {
            if(err){
              console.log(err);
              throw err;
            }
        })
        set_status_text("Create config file");
        var settings = JSON.parse(
          fs.readFileSync(
            './.config.json'
          )
        );
        this.value = settings;
      }
    }
    this.check();
  },
  check: function(){
    if(
      "clipboard_check" in this.value &&
      "file_name_domain" in this.value &&
      "categorys_path" in this.value &&
      "notification_main" in this.value &&
      "notification_end" in this.value &&
      "notification_copy" in this.value &&
      "notification_auto_download_start" in this.value &&
      "notification_auto_download_end" in this.value
    ){
      console.log("check pass");
    }else{
      console.log("conf error");
      notification.error_notification("コンフィグファイルが必要な要素を満していないようです。\nHint: アップデートで.config.jsonの構造が変更される場合があります。\n.config.jsonを削除すると自動で生成されますが.config.json.sampleと見比べて自力で編集して直すことも恐らく可能です。");
    }
  },
  edit_load: function(){
    // main
    var categorys_dir_input = document.getElementById("settings_categorys_dir_input");
    var is_clipboard_check_switch = document.getElementById("settings_is_clipboard_check");
    var is_filename_domain_switch = document.getElementById("settings_is_filename_domain");
    // notification
    var is_all_notification_switch = document.getElementById("settings_all_notification");
    var is_end_notification_switch = document.getElementById("settings_all_end_notification");
    var is_copy_notification_switch = document.getElementById("settings_copy_notification");
    var is_auto_download_start_notification_switch = document.getElementById("settings_auto_download_start_notification");
    var is_auto_download_end_notification_switch = document.getElementById("settings_auto_download_end_notification");

    // main
    var categorys_path = this.value.categorys_path;
    var is_clipboard_check = this.value.clipboard_check;
    var is_filename_domain = this.value.file_name_domain;
    // notification
    var is_notification_main = this.value.notification_main;
    var is_notification_end = this.value.notification_end;
    var is_notification_copy = this.value.notification_copy;
    var is_notification_auto_download_start = this.value.notification_auto_download_start;
    var is_notification_auto_download_end = this.value.notification_auto_download_end;

    // main
    categorys_dir_input.value = categorys_path;
    is_clipboard_check_switch.checked = is_clipboard_check;
    is_filename_domain_switch.checked = is_filename_domain;
    // notification
    is_all_notification_switch.checked = is_notification_main;
    is_end_notification_switch.checked = is_notification_end;
    is_copy_notification_switch.checked = is_notification_copy;
    is_auto_download_start_notification_switch.checked = is_notification_auto_download_start;
    is_auto_download_end_notification_switch.checked = is_notification_auto_download_end;

    // main
    if(is_clipboard_check){
      document.getElementById("settings_switch_label_clipboard_check").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_clipboard_check").classList.remove('is-checked');
    }
    if(is_filename_domain){
      document.getElementById("settings_switch_label_filename_domain").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_filename_domain").classList.remove('is-checked');
    }

    // notification
    if(is_notification_main){
      document.getElementById("settings_switch_label_all_notification").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_all_notification").classList.remove('is-checked');
    }
    if(is_notification_end){
      document.getElementById("settings_switch_label_end_notification").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_end_notification").classList.remove('is-checked');
    }
    if(is_notification_copy){
      document.getElementById("settings_switch_label_copy_notification").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_copy_notification").classList.remove('is-checked');
    }
    if(is_notification_auto_download_start){
      document.getElementById("settings_switch_label_auto_download_start_notification").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_auto_download_start_notification").classList.remove('is-checked');
    }
    if(is_notification_auto_download_end){
      document.getElementById("settings_switch_label_auto_download_end_notification").classList.add('is-checked');
    }else{
      document.getElementById("settings_switch_label_auto_download_end_notification").classList.remove('is-checked');
    }

    document.querySelector(".settings_categorys_dir_input_area").classList.add('is-dirty');
  },
  write_to_file: function(){
    fs.writeFileSync('./.config.json', JSON.stringify(this.value), (err) => {
        if(err){
          console.log(err);
          throw err;
        }
    });
    console.log("write!");
    set_status_text("設定を更新しました!");
  },
  update: function(config){
    // main
    var categorys_dir_input = document.getElementById("settings_categorys_dir_input");
    var is_clipboard_check_switch = document.getElementById("settings_is_clipboard_check");
    var is_filename_domain_switch = document.getElementById("settings_is_filename_domain");
    // notification
    var is_all_notification_switch = document.getElementById("settings_all_notification");
    var is_end_notification_switch = document.getElementById("settings_all_end_notification");
    var is_copy_notification_switch = document.getElementById("settings_copy_notification");
    var is_auto_download_start_notification_switch = document.getElementById("settings_auto_download_start_notification");
    var is_auto_download_end_notification_switch = document.getElementById("settings_auto_download_end_notification");
    // etc
    var error_display = document.getElementById("settings_error_display");

    if(!categorys_dir_input.value){
      error_display.innerText("categorys.jsonのパス指定が正しくありません!");
      return;
    }

    var old_cat_pass = this.value.categorys_path;

    // main
    this.value.categorys_path = categorys_dir_input.value;
    this.value.clipboard_check = is_clipboard_check_switch.checked;
    this.value.file_name_domain = is_filename_domain_switch.checked;
    // notification
    this.value.notification_main = is_all_notification_switch.checked;
    this.value.notification_end = is_end_notification_switch.checked;
    this.value.notification_copy = is_copy_notification_switch.checked;
    this.value.notification_auto_download_start = is_auto_download_start_notification_switch.checked;
    this.value.notification_auto_download_end = is_auto_download_end_notification_switch.checked;

    console.log(this.value);

    this.write_to_file();

    if(old_cat_pass != categorys_dir_input.value){
      category.set_categorys(this.value);
    }
    document.getElementById('settings_close').click();
  },
}

module.exports = settings;
