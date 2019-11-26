const plugin = {};

plugin.load = require('./loader');
plugin.twimg_save = require('./setup');
plugin.reset_spells = function(){
  plugin.spells = [];
}

module.exports = plugin;
