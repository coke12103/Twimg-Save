const notification = require('./notification');

const category = {
  load: function(config){
    try{
      var cat = JSON.parse(
        fs.readFileSync(
          config.categorys_path
        )
      );

      return cat;
    }catch(err){
      try{
        fs.statSync(config.categorys_path);
        console.log("Categorys File Found");
        notification.error_notification("カテゴリーファイルがパースできませんでした!\nHint: categorys.jsonの構造が壊れていないか確認してみてください。");
      }catch(err){
        console.log("Categorys File Not Found");
        data = {
          categorys: [
            {
              "id": 0,
              "name": "デフォルト",
              "save_dir": "./gets"
            },
            {
              "id": 1,
              "name": "nsfw",
              "save_dir": "./gets/nsfw"
            }
          ]
        };
        fs.writeFileSync(config.categorys_path, JSON.stringify(data), (err) => {
            if(err){
              console.log(err);
              throw err;
            }
        })
        set_status_text("Create categorys sample");
        var cat = JSON.parse(
          fs.readFileSync(
            config.categorys_path
          )
        );
        return cat;
      }
    }
  },
  set_categorys: function(config){
    this.to_json = this.load(config);
    console.log(this.to_json);
    this.categorys = this.to_json.categorys;

    var category_select = document.getElementById("category_select");
    while (category_select.firstChild) category_select.removeChild(category_select.firstChild);

    for(var i in this.categorys){
      var cat = document.createElement("option");
      cat.value = this.categorys[i].id;
      cat.text = this.categorys[i].name;
      category_select.appendChild(cat);
    }
  },
  add: function(config){
    var name = document.getElementById('add_category_name_input');
    var folder = document.getElementById('add_category_folder_path_input');
    var error_display = document.getElementById('error_display');

    if(!folder.value | !name.value){
      if(!folder.value){
        var p = document.createElement('p');
        p.innerText = "フォルダが選択されていません!";
        error_display.appendChild(p);
      }
      if(!name.value){
        var p = document.createElement('p');
        p.innerText = "名前が入っていません!";
        error_display.appendChild(p);
      }
      return;
    }

    var cat_id = this.categorys[this.categorys.length - 1].id + 1;
    var cat = {
      "id": cat_id,
      "name": name.value,
      "save_dir": folder.value
    }

    console.log(this.categorys);
    console.log(this.to_json);
    this.to_json.categorys.push(cat);
    this.write_to_file(config);

    name.value = '';
    folder.value = '';
    while(error_display.firstChild) error_display.removeChild(error_display.firstChild);

    document.querySelector(".add_category_folder_path_input_area").classList.remove('is-dirty');
    document.querySelector(".add_category_name_input_area").classList.remove('is-dirty');

    document.getElementById('add_category_close').click();
  },
  write_to_file: function(config){
    fs.writeFileSync(config.categorys_path, JSON.stringify(this.to_json), (err) => {
        if(err){
          console.log(err);
          throw err;
        }
    });
    console.log("write!");
    set_status_text("カテゴリを更新しました!");
    this.set_categorys(config);
  },
  update: function(config){
    var selected_category_id = document.getElementById("category_select").value;
    var name = document.getElementById('edit_category_name_input');
    var folder = document.getElementById('edit_category_folder_path_input');

    if(!folder.value | !name.value){
      if(!folder.value){
        folder.value = this.categorys[selected_category_id].save_dir;
      }
      if(!name.value){
        name.value = this.categorys[selected_category_id].name;
      }
    }

    this.to_json.categorys[selected_category_id].save_dir = folder.value;
    this.to_json.categorys[selected_category_id].name = name.value;

    this.fix_id();

    console.log(this.categorys);
    console.log(this.to_json);

    this.write_to_file(config);

    document.getElementById('edit_category_close').click();
    set_status_text("カテゴリを更新しました!");
  },
  fix_id: function(){
    this.to_json.categorys.forEach((val, index) => {
        this.to_json.categorys[index].id = index;
    });
    console.log(this.to_json);
  },
  edit_load: function(){
    var selected_category_id = document.getElementById("category_select").value;
    var name_input = document.getElementById("edit_category_name_input");
    var path_input = document.getElementById("edit_category_folder_path_input");

    var name = this.categorys[selected_category_id].name;
    var path = this.categorys[selected_category_id].save_dir;

    name_input.value = name;
    path_input.value = path;
    document.querySelector(".edit_category_folder_path_input_area").classList.add('is-dirty');
    document.querySelector(".edit_category_name_input_area").classList.add('is-dirty');
  },
  del: function(config){
    var selected_category_id = document.getElementById("category_select").value;
    this.to_json.categorys.splice(selected_category_id, 1);
    console.log(this.to_json);
    this.fix_id();
    this.write_to_file(config);
    set_status_text("カテゴリを削除しました!");
  }
}

module.exports = category;
