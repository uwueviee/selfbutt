const packageJSON = require('../package.json')

function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, {
    embed: {
      title: 'Hey!',
      description: "I'm a simple SelfBot made by Kizzaris! You can find more infomation about me over at https://kizzaris.github.io/selfbutt/",
      author: {
        name: msg.author.username,
        icon_url: msg.author.avatarURL
      },
      color: 0x008000,
      footer: {
        text: 'SelfButt ' + packageJSON.version + ' by Kizzaris'
      }
    }
  })
}

module.exports = function (moduleHolder) {
  moduleHolder['about'] = handler
}
