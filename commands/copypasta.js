const packageJSON = require('../package.json')
const copypastaJSON = require('../commandDeps/copypasta.json')
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
  bot.createMessage(msg.channel.id, copypastaJSON[args])
}

module.exports = function (moduleHolder) {
  moduleHolder['copypasta'] = handler
}
