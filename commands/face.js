const faceJSON = require('../commandDeps/face.json')

function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, faceJSON[args])
}

module.exports = function (moduleHolder) {
  moduleHolder['face'] = handler
}
