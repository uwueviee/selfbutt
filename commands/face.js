const faceJSON = require('../commandDeps/face.json')

function handler (bot, msg, args) {
  if (faceJSON.hasOwnProperty(args)) {
    bot.createMessage(msg.channel.id, faceJSON[args])
  } else {
    bot.createMessage(msg.channel.id, "(._.) I don't know what face that is.")
  }
}

module.exports = function (moduleHolder) {
  moduleHolder['face'] = handler
}
