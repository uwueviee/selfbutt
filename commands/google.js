const google = require('google')
const packageJSON = require('../package.json')

function handler (bot, msg, args) {
  google.resultsPerPage = 25
  var nextCounter = 0
  google(args, function (err, res) {
    if (err) throw err
    bot.createMessage(msg.channel.id, 'Here are the top 4 results!')
    for (var i = 0; i < res.links.length; ++i) {
      var link = res.links[i]
      bot.createMessage(msg.channel.id, {
        embed: {
          title: link.title + ' - ' + link.href,
          description: link.description + '\n',
          author: {
            name: 'Google',
            icon_url: 'https://s-media-cache-ak0.pinimg.com/736x/66/00/18/6600188f65aa2e4cc2cd29017cb27662.jpg'
          },
          color: 0x008000,
          footer: {
            text: 'SelfButt ' + packageJSON.version + ' by Noculi'
          }
        }
      })
      if (i === 3) {
        return
      }
    }
    if (nextCounter < 4) {
      nextCounter += 1
      if (res.next) res.next()
    }
  })
}

module.exports = function (moduleHolder) {
  moduleHolder['google'] = handler
}
