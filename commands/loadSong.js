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

var config = require('../config.json')

var location = config.snipLocation

function handler (bot, msg, args) {
  fs.readFile(location, 'utf8', function (err, data) {
    if (err) {
      return webLogger(err)
    }
    if (data === '') {
      bot.createMessage(msg.channel.id, {
        embed: {
          title: 'No song playing',
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
    } else {
      fs.readFile(location, 'utf8', function (err, data) {
        if (err) throw err
        fs.writeFile('./lastsong.txt', data, function (err) {
          if (err) {
            return webLogger(err)
          }
        })
        bot.editStatus({name: '🎶 ' + data, type: 0})
        webLogger('Song updated to "' + data + '"')
        bot.createMessage(msg.channel.id, {
          embed: {
            title: 'Hey!',
            description: "I'll go ahead and do that really quickly! (Song name is '" + data + "')",
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
      })
    }
  })
}

module.exports = function (moduleHolder) {
  moduleHolder['loadSong'] = handler
}
