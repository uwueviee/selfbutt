const packageJSON = require('../package.json')
const fs = require('fs')
const os = require('os')
const moment = require('moment')

function webLogger (data) {
  var time = '[' + moment().format('MMMM Do YYYY, h:mm:ss a')
  var finalMessage = time + '] ' + data + os.EOL
  fs.appendFile('./logs.txt', finalMessage, function (err) {
    if (err) {
      return webLogger(err)
    }
  })
}

function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, {
    embed: {
      title: 'Hey!',
      description: "I'm a simple SelfBot made by Noculi! You can find more infomation about me over at https://noculi.github.io/selfbutt/",
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
  moduleHolder['about'] = handler
}
