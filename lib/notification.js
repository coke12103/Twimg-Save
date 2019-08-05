const electron = require('electron');
const remote = electron.remote;

const notification = {
  error_notification: (err) => {
    var dialog = remote.dialog;
    new Notification('Twimg Save', {
        body: "Error: " + err
    });
    dialog.showErrorBox("Twimg Save Error: ", err);
  }
}

module.exports = notification;
