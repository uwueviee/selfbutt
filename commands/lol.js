const fs = require('fs')
const os = require('os')
const moment = require('moment')

function webLogger (data) {
  var time = '[' + moment().format('MMMM Do YYYY, h:mm:ss a')
  var finalMessage = time + '] ' + data + os.EOL
  fs.appendFile('./logs.txt', finalMessage, function (err) {
    if (err) throw err
  })
}

function handler (req, res) {
  webLogger('AAAAAAAAAAAAAAAAA')
}

module.exports = function (moduleHolder) {
  moduleHolder['lol'] = handler
}
