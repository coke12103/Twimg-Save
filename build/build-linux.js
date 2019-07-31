const builder = require('electron-builder');

builder.build({
  platform: 'linux',
  config: {
    'appId': 'net.coke12103.TwimgSave',
    'linux': {
      'target': 'zip',
    }
  }
})
