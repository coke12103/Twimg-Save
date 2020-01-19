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

    console.log("start trap!\ncode: " + code);

    for(var spell of spells){
      if(spell.type.follow){
        var follow = spell.type.follow;
        if(follow.code == code){
          console.log("follow");
          set_sns_type(follow.target_text);

          clay_core.follow[spell.id][follow.exec](data);
          break;
        }
      }
    }
  }
}

module.exports = Clay;
