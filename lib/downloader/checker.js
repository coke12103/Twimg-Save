const electron = require('electron');
const remote = electron.remote;
const clay = require("../clay/index");

const check_sns_type = function(url){
  var type = false;

  var spells = clay.spells;

  for(var spell of spells){
    if(spell.search_regexp.test(url)){
      set_sns_type(spell.type);
      type = spell.id;
      break;
    }
  }

  console.log(type)
  return type;
}

module.exports = check_sns_type;
