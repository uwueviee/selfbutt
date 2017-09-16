const packageJSON = require('../package.json')

function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, {
    embed: {
      description: args,
      author: {
        name: msg.author.username,
        icon_url: msg.author.avatarURL
      },
      color: 0x008000,
      footer: {
        text: 'SelfButt ' + packageJSON.version + ' by Noculi'
      }
    }
  })
}

module.exports = function (moduleHolder) {
  moduleHolder['me'] = handler
}
