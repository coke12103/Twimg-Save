class Clay{
  constructor(){
  }

  static download = require('../downloader/download');
  static notification = require('../notification');

  // Trap data
  //  code:         required. Error code.
  //  message:      required. Error message.
  //  input:        required. Input URL.
  static trap(data){
    var spells = clay_core.spells;
    var code = data.code;
    var is_followed = false;

    console.log("start trap!\ncode: " + code);

    for(var spell of spells){
      if(spell.type && spell.type.follow){
        var follow = spell.type.follow;
        if(follow.code == code){
          console.log("follow");
          set_sns_type(follow.target_text);

          clay_core.follow[spell.id][follow.exec](data);
          is_followed = true;
          break;
        }
      }
    }

    if(!is_followed){
      // 特定のパターンだったらエラー通知の宛先を変える(通知制御のため)
      // ファイルがない場合の想定はしない(ダウンローダーなのでエラーで投げることを想定する)
      // 一応増えることも考えてswitchで書いておく
      switch(true){
        case code.match(/unsupported/):
          this.notification.unsupported_notification(data.message);
          break;
        default:
          this.notification.basic_error(data.message);
          break;
      }
    }
  }
}

module.exports = Clay;
