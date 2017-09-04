const packageJSON = require('../package.json')
var config = require('../config.json')
const songInfoJSON = require('../commandDeps/songInfo.json')
const fs = require('fs')
const os = require('os')
const moment = require('moment')
const imgur = require('imgur-node-api')
const path = require('path')

function webLogger (data) {
  var time = '[' + moment().format('MMMM Do YYYY, h:mm:ss a')
  var finalMessage = time + '] ' + data + os.EOL
  fs.appendFile('./logs.txt', finalMessage, function (err) {
    if (err) {
      return webLogger(err)
    }
  })
}

imgur.setClientID(songInfoJSON.clientID)

var location = config.snipLocation
var image = songInfoJSON.imageLocation

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
      imgur.upload(path.join(image), function (err, ree) {
        if (err) {
          return webLogger(err)
        }
        webLogger(ree.data.link)
        fs.readFile(location, 'utf8', function (err, data) {
          if (err) throw err
          bot.createMessage(msg.channel.id, {
            embed: {
              title: 'Song:',
              description: data,
              author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
              },
              color: 0x008000,
              thumbnail: {
                url: ree.data.link,
                height: '700',
                width: '700'
              },
              footer: {
                text: 'SelfButt ' + packageJSON.version + ' by Noculi'
              }
            }
          })
        })
      })
    }
  })
}

module.exports = function (moduleHolder) {
  moduleHolder['songInfo'] = handler
}
