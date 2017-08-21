const Eris = require('eris')
const fs = require('fs')
const os = require('os')
const moment = require('moment')
const mkdirp = require('mkdirp')
const google = require('google')
const request = require('request')
const packageJSON = require('./package.json')

// Load Config
var config = require('./config.json')

var bot = new Eris(config.token)
var ownerID = config.ownerID
var prefix = config.prefix
var location = config.snipLocation

function checkForUpdate () {
  var options = {
    url: 'https://raw.githubusercontent.com/Noculi/selfbutt/master/package.json',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
      'User-Agent': 'selfbutt-noculi'
    }
  }
  request(options, function (err, res, body) {
    if (err) throw err
    let json = JSON.parse(body)
    if (packageJSON.version === json.version) {
      console.log('SelfButt is up to date!')
      console.log('Ready!')
    } else {
      console.log('There is a new update for SelfButt!')
      console.log('Ready! (But you should update)')
    }
  })
}

bot.on('messageCreate', (msg) => {
  if (msg.author.id === ownerID) {
    if (msg.content === prefix + 'ping') {
      bot.createMessage(msg.channel.id, {
        embed: {
          title: 'Hey!',
          description: "I'm alive, don't worry!",
          author: {
            name: msg.author.username,
            icon_url: msg.author.avatarURL
          },
          color: 0x008000,
          footer: {
            text: 'SelfButt 0.1 by Noculi'
          }
        }
      })
    } else if (msg.content === prefix + 'loadSong') {
      fs.readFile(location, 'utf8', function (err, data) {
        if (err) throw err
        console.log('OK: ' + location)
        console.log(data)
        writeSongTxt(data)
        bot.editStatus({name: '🎶 ' + data, type: 0})
        logItPls('Song updated to ' + data)
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
              text: 'SelfButt 0.1 by Noculi'
            }
          }
        })
      })
    } else if (msg.content.startsWith(prefix + 'google')) {
      var searchCommand = prefix + 'google'
      if (msg.content.length <= searchCommand.length + 1) {
        bot.createMessage(msg.channel.id, 'Please specify a search term.')
        return
      }
      var filename = msg.content.substring(searchCommand.length + 1)
      google.resultsPerPage = 25
      var nextCounter = 0
      google(filename, function (err, res) {
        if (err) throw err
        bot.createMessage(msg.channel.id, 'Here are the top 4 results!')
        for (var i = 0; i < res.links.length; ++i) {
          var link = res.links[i]
          bot.createMessage(msg.channel.id, {
            embed: {
              title: link.title + ' - ' + link.href,
              description: link.description + '\n',
              author: {
                name: 'Google Search',
                icon_url: 'https://s-media-cache-ak0.pinimg.com/736x/66/00/18/6600188f65aa2e4cc2cd29017cb27662.jpg'
              },
              color: 0x008000,
              footer: {
                text: 'SelfButt 0.1 by Noculi'
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
  }
})

bot.on('messageCreate', (msg) => {
  if (config.chatLogging === 'Y') {
    var time = '[' + moment().format('MMMM Do YYYY, h:mm:ss a')
    var finalMessage = time + ']' + ' [' + msg.author.username + '#' + msg.author.discriminator + '] ' + msg.content + os.EOL
    var finalPath = './logs/groups/' + msg.channel.id + '.txt'
    if (!msg.channel.guild) {
      mkdirp('./logs/groups/', function (err) {
        if (err) throw err
        fs.appendFile(finalPath, finalMessage, function (err) {
          if (err) throw err
        })
      })
    } else {
      mkdirp('./logs/' + '/' + msg.channel.guild.name + '/', function (err) {
        if (err) throw err
        fs.appendFile(finalPath, finalMessage, function (err) {
          if (err) throw err
        })
      })
    }
  }
})

setInterval(function () {
  fs.readFile('lastsong.txt', 'utf8', function (err, lastSong) {
    if (err) throw err
    fs.readFile(location, 'utf8', function (err, data) {
      if (err) throw err
      if (lastSong === data) {
        console.log('Song was already ' + data + '. Skipping change.')
      } else {
        writeSongTxt(data)
        console.log('Song updated to "' + data + '"')
        bot.editStatus({name: '🎶 ' + data, type: 0})
        logItPls('Song updated to ' + data)
      }
    })
  })
}, 15000)

function writeSongTxt (song) {
  fs.writeFile('lastsong.txt', song, function (err) {
    if (err) {
      return console.log(err)
    }
  })
}

function logItPls (whathappened) {
  bot.createMessage(config.logChannel, {
    embed: {
      title: 'Hey! Look a log!',
      description: whathappened,
      color: 0x008000,
      footer: {
        text: 'SelfButt 0.1 by Noculi'
      }
    }
  })
}

bot.connect()
if (fs.existsSync('lastsong.txt')) {
  checkForUpdate()
} else {
  logItPls("Looks like you're new to SelfButt! You can take a look on the wiki for commands!")
  writeSongTxt('SelfButt First Boot')
  checkForUpdate()
}
