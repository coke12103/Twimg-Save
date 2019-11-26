const electron = require('electron');
const remote = electron.remote;
const fs = remote.require("fs");
const path = remote.require("path");

const file_exist_check = function(path){
  var exist = false;
  try{
    fs.statSync(path);
    exist = true;
  }catch(err){
    exist = false;
  }

  return exist;
}

const parse_spell_file = function(path){
  var result = {};
  try{
    var spell = JSON.parse(
      fs.readFileSync(
        path
      )
    );
    result = spell;
  }catch(err){
    throw err;
  }

  return result;
}

const load_plugings = function(plugins_path){
  plugins_path = path.normalize(plugins_path);
  console.log("plugins_path: " + plugins_path);
  if(!file_exist_check(plugins_path)){
    console.warn("plugins path not found");
    return false;
  }

  var file_list = fs.readdirSync(plugins_path);
  var plugins_spell_list = [];

  console.log("plugin folder item count: " + file_list.length);
  for(var l of file_list){
    var l = path.join(plugins_path, l);
    if(fs.existsSync(l) && fs.statSync(l).isDirectory()){
      var spell_path = path.join(l, "plugin-info.json");
      if(fs.existsSync(spell_path) && !fs.statSync(spell_path).isDirectory()){
        console.log("find plugin info file!: " + spell_path);
        try{
          var parse_spell = parse_spell_file(spell_path);

          if(parse_spell_file){
            parse_spell.dir = l;
            parse_spell.search_regexp = new RegExp(parse_spell.search_regexp, "i");

            plugins_spell_list.push(parse_spell);

            console.log("find plugin!: " + parse_spell.name);
          }else{
            console.warn("parse or load failed!: " + spell_path);
          }
        }catch(err){
          console.warn("parse or load failed!: " + spell_path);
        }
      }
    }
  }

  for(var i = 0; i < plugins_spell_list.length; i++){
    var pl = plugins_spell_list[i];

    var name = pl.name;
    var id = pl.id;
    var main = pl.main;
    var dir = pl.dir

    try{
      this[id] = require((path.relative(__dirname, path.join(dir, main))));
      console.log("require to %s", name);
    }catch(err){
      console.warn("require failed!: %s", err);
      plugins_spell_list.splice(i, 1);
    }
  }

  this.spells = this.spells.concat(plugins_spell_list);
  console.log("loaded plugins!\n  count: " + this.spells.length);

  console.log(this)
}

module.exports = load_plugings;
