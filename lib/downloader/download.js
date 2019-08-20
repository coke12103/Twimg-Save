const electron = require('electron');
const remote = electron.remote;
const request = remote.require('request-promise');

const download = function(url, name, save_dir, ref){
  return new Promise((resolve, reject) => {
    if(ref){
      var opt = {
        url: url,
        method: 'GET',
        encoding: null,
        headers: {
          'Referer': ref,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
        }
      }
    }else{
      var opt = {
        url: url,
        encoding: null,
        method: 'GET'
      }
    }

    request(opt).then((body) => {
        console.log("Download Image File: OK");
        set_status_text("Download: OK");

        try{
          fs.writeFileSync(save_dir + "/" + name, body, {encoding: 'binary'}, (err) => {
              console.log(err);
          });
        }catch(err){
          console.log(err);

          reject("Write Error!");
        }
        resolve(true);
    }).catch((err) => {
        set_status_text("Download: " + err.statusCode);
        console.log(err.statusCode);
        resolve(false);
    });
  })
}

module.exports = download;
