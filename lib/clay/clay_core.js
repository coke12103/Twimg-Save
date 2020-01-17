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


class ClayCore{
  constructor(){
    this.sources = {};
    this.follow = {};
    this.spells = []
  }

  load(plugins_path){
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
          // ここまでプラグインスペル探し
          //
          // ここからプラグインロード本体
          console.log("find plugin info file!: " + spell_path);
          try{
            var parse_spell = parse_spell_file(spell_path);

            if(parse_spell){
              // プラグインバージョンのないプロトタイププラグインか否か
              if(parse_spell.spell_ver){
                // 今はv1しかないのでv1の処理をそのまま書く
                parse_spell.dir = l;
                if(parse_spell.type.source_addition){
                  parse_spell.type.source_addition.regexp = new RegExp(parse_spell.type.source_addition.regexp, "i");
                }

                plugins_spell_list.push(parse_spell);

                console.log("find plugin!: " + parse_spell.name);
              }else{
                // プラグインバージョンなしは削除予定
                // と思ってたんだけど簡易プラグインとして残してもいいのではないか
                //
                parse_spell.dir = l;
                if(parse_spell.search_regexp){
                  parse_spell.search_regexp = new RegExp(parse_spell.search_regexp, "i");
                }

                parse_spell.spell_ver = "";

                plugins_spell_list.push(parse_spell);

                console.log("find plugin!: " + parse_spell.name);
              }
            }else{
              console.warn("parse or load failed!: " + spell_path);
            }
          }catch(err){
            console.warn("parse or load failed!: " + spell_path);
            console.warn(err);
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
      var spell_ver = pl.spell_ver;
      var type = pl.type;

      try{
        if(spell_ver){
          if(type.source_addition){
            this.sources[id] = require((path.relative(__dirname, path.join(dir, main))));
            console.log("require to v1 plugin %s", name);
          }else if(type.follow){
            this.follow[id] = require((path.relative(__dirname, path.join(dir, main))));
            console.log("require to follow plugin %s", name);
          }
        }else{
          // スペルバージョンなしはとりあえずソース追加として処理する
          this.sources[id] = require((path.relative(__dirname, path.join(dir, main))));
          console.log("require to basic plugin %s", name);
        }

      }catch(err){
        console.warn("require failed!: %s", err);
        plugins_spell_list.splice(i, 1);
      }
    }

    this.spells = this.spells.concat(plugins_spell_list);
    console.log("loaded plugins!\n  count: " + this.spells.length);
    console.log(this.spells.length);

    console.log(this)
  }


  find_source(url){
    var source = {};

    var spells = this.spells;

    for(var spell of spells){
      if(spell.spell_ver){
        if(spell.type.source_addition){
          var data = spell.type.source_addition;

          if(data.regexp.test(url)){
            set_sns_type(data.target_text);
            source.id = spell.id;
            source.exec = data.exec;
            break;
          }
        }
      }else{
        if(spell.search_regexp && spell.search_regexp.test(url)){
          set_sns_type(spell.type);
          source.id = spell.id;
          source.exec = "NONE";
          break;
        }
      }
    }

    console.log(source.id)
    return source;
  }
}

module.exports = ClayCore;
