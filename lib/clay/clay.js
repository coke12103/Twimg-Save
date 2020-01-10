class Clay{
  constructor(){
  }

  static download = require('../downloader/download');
  static notification = require('../notification');

  // Trap data
  //  code:         required. Error code.
  //  message:      required. Error message.
  //  input:        required. Input URL.
  //  trap_version: required. Trap version.
  static trap(data){
    var spells = clay_core.spells;
    var code = data.code;

    console.log("start trap!\ncode: " + code);

    for(var spell of spells){
      var follow = spell.follow;
      if(follow){
        for(var f of follow){
          if(f == code){
            console.log("follow");
          }
        }
      }
    }
  }
}

module.exports = Clay;
