const electron = require('electron');
const remote = electron.remote;

const notification = {
  error_notification: (err) => {
    var dialog = remote.dialog;
    new Notification('Twimg Save', {
        body: "Error: " + err
    });
    dialog.showErrorBox("Twimg Save Error: ", err);
  },

  end_notification: (count, file) => {
    var notify = new Notification('Twimg Save', {
        body: count + "枚の画像を保存しました!"
    });
    notify.addEventListener('click', function() {
      electron.shell.showItemInFolder(file);
    });
  }
}

module.exports = notification;
