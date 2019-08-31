const electron = require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const notification = require('./notification');

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
          save_dir: './gets',
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
    if("save_dir" in this.value && "clipboard_check" in this.value && "file_name_domain" in this.value && "categorys_path" in this.value){
      console.log("check pass");
    }else{
      console.log("conf error");
      notification.error_notification("コンフィグファイルが必要な要素を満していないようです。\nHint: アップデートで.config.jsonの構造が変更される場合があります。");
    }

  }
}

module.exports = settings;
