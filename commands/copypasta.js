const copypastaJSON = require('../commandDeps/copypasta.json')

function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, copypastaJSON[args])
}

module.exports = function (moduleHolder) {
  moduleHolder['copypasta'] = handler
}
