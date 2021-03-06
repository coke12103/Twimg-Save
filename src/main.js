const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let main_window = null;

app.on('window-all-colosed', function(){
    if(process.platform !== 'darwin'){
      app.quit();
    }
});

app.on('ready', function(){
    main_window = new BrowserWindow({
        "width": 400,
        "heigth": 400,
        webPreferences: { nodeIntegration: true }
    });
    main_window.loadURL('file://' + __dirname + "/../view/index.html");

    main_window.on('closed', function(){
        main_window = null;
    });
});
