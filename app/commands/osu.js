const packageJSON = require('../package.json')

function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, {
    embed: {
      author: {
        name: 'osu! Signuature',
        icon_url: msg.author.avatarURL
      },
      image: {
        url: 'http://lemmmy.pw/osusig/sig.php?colour=pink&uname=' + args + '&pp=1&countryrank&removeavmargin&darktriangles&avatarrounding=4&onlineindicator=undefined&xpbar',
        height: '94',
        width: '338'
      },
      color: 0x008000,
      footer: {
        text: 'SelfButt ' + packageJSON.version + ' by Kizzaris'
      }
    }
  })
}

module.exports = function (moduleHolder) {
  moduleHolder['osu'] = handler
}
