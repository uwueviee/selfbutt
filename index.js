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

bot.on('messageCreate', (msg) => { // When a message is created
  if (msg.author.id === ownerID) {
    if (msg.content === prefix + 'ping') {
      bot.createMessage(msg.channel.id, {
        embed: {
          title: 'Hey!', // Title of the embed
          description: "I'm alive, don't worry!",
          author: { // Author property
            name: msg.author.username,
            icon_url: msg.author.avatarURL
          },
          color: 0x008000, // Color, either in hex (show), or a base-10 integer
          footer: { // Footer text
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
            title: 'Hey!', // Title of the embed
            description: "I'll go ahead and do that really quickly! (Song name is '" + data + "')",
            author: { // Author property
              name: msg.author.username,
              icon_url: msg.author.avatarURL
            },
            color: 0x008000, // Color, either in hex (show), or a base-10 integer
            footer: { // Footer text
              text: 'SelfButt 0.1 by Noculi'
            }
          }
        })
      })
    } else if (msg.content.startsWith(prefix + 'google')) {
      var playCommand = 'sb.google'
      if (msg.content.length <= playCommand.length + 1) { // Check if a filename was specified
        bot.createMessage(msg.channel.id, 'Please specify a search term.')
        return
      }
      var filename = msg.content.substring(playCommand.length + 1) // Get the filename
      google.resultsPerPage = 25
      var nextCounter = 0
      console.log('Google Called')
      google(filename, function (err, res) {
        if (err) throw err
        bot.createMessage(msg.channel.id, 'Here are the top 4 results!')
        for (var i = 0; i < res.links.length; ++i) {
          var link = res.links[i]
          bot.createMessage(msg.channel.id, {
            embed: {
              title: link.title + ' - ' + link.href, // Title of the embed
              description: link.description + '\n',
              author: { // Author property
                name: 'Google Search',
                icon_url: 'https://maxcdn.icons8.com/Share/icon/Logos//google_logo1600.png'
              },
              color: 0x008000, // Color, either in hex (show), or a base-10 integer
              footer: { // Footer text
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
  var time = '[' + moment().format('MMMM Do YYYY, h:mm:ss a')
  var finalMessage = time + ']' + ' [' + msg.author.username + '#' + msg.author.discriminator + '] ' + msg.content + os.EOL
  var finalPath = './logs/groups/' + msg.channel.id + '.txt'
  if (!msg.channel.guild) { // Check if the message was sent in a guild
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
        console.log('OK: ' + location)
        console.log(data)
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
      title: 'Hey! Look a log!', // Title of the embed
      description: whathappened,
      color: 0x008000, // Color, either in hex (show), or a base-10 integer
      footer: { // Footer text
        text: 'SelfButt 0.1 by Noculi'
      }
    }
  })
}

bot.connect()
if (fs.existsSync('lastsong.txt')) {
  checkForUpdate()
} else {
  writeSongTxt('SelfButt First Boot')
  checkForUpdate()
}
