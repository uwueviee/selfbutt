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
  bot.createMessage(msg.channel.id, 'lol ' + args + ' ' + packageJSON)
  webLogger('lol ' + args + ' ' + packageJSON)
}

module.exports = function (moduleHolder) {
  moduleHolder['lol'] = handler
}
