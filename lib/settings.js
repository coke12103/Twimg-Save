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
          categorys_path: './categorys.json'
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
    if("clipboard_check" in this.value && "file_name_domain" in this.value && "categorys_path" in this.value){
      console.log("check pass");
    }else{
      console.log("conf error");
      notification.error_notification("コンフィグファイルが必要な要素を満していないようです。\nHint: アップデートで.config.jsonの構造が変更される場合があります。\n.config.jsonを削除すると自動で生成されますが自力で編集して直すことも恐らく可能です。");
    }
  },
  edit_load: function(){
    var categorys_dir_input = document.getElementById("settings_categorys_dir_input");
    var is_clipboard_check_switch = document.getElementById("settings_is_clipboard_check");
    var is_filename_domain_switch = document.getElementById("settings_is_filename_domain");

    var categorys_path = this.value.categorys_path;
    var is_clipboard_check = this.value.clipboard_check;
    var is_filename_domain = this.value.file_name_domain;

    categorys_dir_input.value = categorys_path;
    is_clipboard_check_switch.checked = is_clipboard_check;
    is_filename_domain_switch.checked = is_filename_domain;

    if(is_clipboard_check){
      document.querySelectorAll(".settings_switch")[0].classList.add('is-checked');
    }else{
      document.querySelectorAll(".settings_switch")[0].classList.remove('is-checked');
    }
    if(is_filename_domain){
      document.querySelectorAll(".settings_switch")[1].classList.add('is-checked');
    }else{
      document.querySelectorAll(".settings_switch")[1].classList.remove('is-checked');
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
    var categorys_dir_input = document.getElementById("settings_categorys_dir_input");
    var is_clipboard_check_switch = document.getElementById("settings_is_clipboard_check");
    var is_filename_domain_switch = document.getElementById("settings_is_filename_domain");
    var error_display = document.getElementById("settings_error_display");

    if(!categorys_dir_input.value){
      error_display.innerText("categorys.jsonのパス指定が正しくありません!");
      return;
    }

    var old_cat_pass = this.value.categorys_path;

    this.value.categorys_path = categorys_dir_input.value;
    this.value.clipboard_check = is_clipboard_check_switch.checked;
    this.value.file_name_domain = is_filename_domain_switch.checked;

    console.log(this.value);

    this.write_to_file();

    if(old_cat_pass != categorys_dir_input.value){
      category.set_categorys(this.value);
    }
    document.getElementById('settings_close').click();
  },
}

module.exports = settings;
