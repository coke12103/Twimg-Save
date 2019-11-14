const builder = require('electron-builder');

builder.build({
  platform: 'win',
  config: {
    'appId': 'net.coke12103.TwimgSave',
    'asar': false,
    'win': {
      'target': 'zip',
    }
  }
})
