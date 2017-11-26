'use strict'

const electron = require('electron')
const app = electron.app
const Menu = require('electron').Menu
const dialog = require('electron').dialog
const ipc = require('electron').ipcMain
const path = require('path')
const pjson = require('./package.json')
const _ = require('lodash')
const windowStateKeeper = require('electron-window-state')
const Eris = require('eris')
const fs = require('fs')
const os = require('os')
const moment = require('moment')
const mkdirp = require('mkdirp')
const request = require('request')
const express = require('express')
const serverapp = express()
const pathModule = require('path')
// const Discogs = require('discogs-client')
const packageJSON = require('./package.json')
const DiscordRPC = require('discord-rpc');

// Use system log facility, should work on Windows too
require('./lib/log')(pjson.productName || 'SelfButt')

// Manage unhandled exceptions as early as possible
process.on('uncaughtException', (e) => {
  console.error(`Caught unhandled exception: ${e}`)
  dialog.showErrorBox('Caught unhandled exception', e.message || 'Unknown error message')
  app.quit()
})

// Load build target configuration file
try {
  var config = require('./config.json')
  _.merge(pjson.config, config)
} catch (e) {
  console.warn('No config file loaded, using defaults')
}

const isDev = (require('electron-is-dev') || pjson.config.debug)
global.appSettings = pjson.config

if (isDev) {
  console.info('Running in development')
} else {
  console.info('Running in production')
}

const rpc = new DiscordRPC.Client({ transport: 'ipc' });

console.debug(JSON.stringify(pjson.config))

// Adds debug features like hotkeys for triggering dev tools and reload
// (disabled in production, unless the menu item is displayed)
require('electron-debug')({
  enabled: pjson.config.debug || isDev || false
})

// Prevent window being garbage collected
let mainWindow

// Other windows we may need
let infoWindow = null

app.setName(pjson.productName || 'SkelEktron')

function initialize () {
  var shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()

  // Use printer utility lib (requires printer module, see README)
  // require('./lib/printer')

  function onClosed () {
    // Dereference used windows
    // for multiple windows store them in an array
    mainWindow = null
    infoWindow = null
  }

  function createMainWindow () {
    // Load the previous window state with fallback to defaults
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1024,
      defaultHeight: 768
    })

    const win = new electron.BrowserWindow({
      'width': mainWindowState.width,
      'height': mainWindowState.height,
      'x': mainWindowState.x,
      'y': mainWindowState.y,
      'title': app.getName(),
      'icon': path.join(__dirname, '/app/assets/img/icon.png'),
      'show': false, // Hide your application until your page has loaded
      'webPreferences': {
        'nodeIntegration': pjson.config.nodeIntegration || true, // Disabling node integration allows to use libraries such as jQuery/React, etc
        'preload': path.resolve(path.join(__dirname, 'preload.js'))
      }
    })

    // Let us register listeners on the window, so we can update the state
    // automatically (the listeners will be removed when the window is closed)
    // and restore the maximized or full screen state
    mainWindowState.manage(win)

    // Remove file:// if you need to load http URLs
    win.loadURL(`file://${__dirname}/${pjson.config.url}`, {})

    win.on('closed', onClosed)

    // Then, when everything is loaded, show the window and focus it so it pops up for the user
    // Yon can also use: win.webContents.on('did-finish-load')
    win.on('ready-to-show', () => {
      win.show()
      win.focus()
    })

    win.on('unresponsive', function () {
      // In the real world you should display a box and do something
      console.warn('The windows is not responding')
    })

    win.webContents.on('did-fail-load', (error, errorCode, errorDescription) => {
      var errorMessage

      if (errorCode === -105) {
        errorMessage = errorDescription || '[Connection Error] The host name could not be resolved, check your network connection'
        console.log(errorMessage)
      } else {
        errorMessage = errorDescription || 'Unknown error'
      }

      error.sender.loadURL(`file://${__dirname}/error.html`)
      win.webContents.on('did-finish-load', () => {
        win.webContents.send('app-error', errorMessage)
      })
    })

    win.webContents.on('crashed', () => {
      // In the real world you should display a box and do something
      console.error('The browser window has just crashed')
    })

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('hello')
    })

    return win
  }

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (!mainWindow) {
      mainWindow = createMainWindow()
    }
  })

  app.on('ready', () => {
    Menu.setApplicationMenu(createMenu())
    mainWindow = createMainWindow()

    // Manage automatic updates
    try {
      require('./lib/auto-update/update')({
        url: (pjson.config.update) ? pjson.config.update.url || false : false,
        version: app.getVersion()
      })
      ipc.on('update-downloaded', (autoUpdater) => {
        // Elegant solution: display unobtrusive notification messages
        mainWindow.webContents.send('update-downloaded')
        ipc.on('update-and-restart', () => {
          autoUpdater.quitAndInstall()
        })

        // Basic solution: display a message box to the user
        // var updateNow = dialog.showMessageBox(mainWindow, {
        //   type: 'question',
        //   buttons: ['Yes', 'No'],
        //   defaultId: 0,
        //   cancelId: 1,
        //   title: 'Update available',
        //   message: 'There is an update available, do you want to restart and install it now?'
        // })
        //
        // if (updateNow === 0) {
        //   autoUpdater.quitAndInstall()
        // }
      })
    } catch (e) {
      console.error(e.message)
      dialog.showErrorBox('Update Error', e.message)
    }
  })

  app.on('will-quit', () => {})

  ipc.on('open-info-window', () => {
    if (infoWindow) {
      return
    }
    infoWindow = new electron.BrowserWindow({
      width: 600,
      height: 600,
      resizable: false
    })
    infoWindow.loadURL(`file://${__dirname}/info.html`)

    infoWindow.on('closed', () => {
      infoWindow = null
    })
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  return app.makeSingleInstance(() => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createMenu () {
  return Menu.buildFromTemplate(require('./lib/menu'))
}

// Manage Squirrel startup event (Windows)
require('./lib/auto-update/startup')(initialize)


// Spoopy
var commands = []

function LoadModules (path) {
  fs.lstat(path, function (err, stat) {
    if (err) {
      return webLogger(err)
    }
    if (stat.isDirectory()) {
      // we have a directory: do a tree walk
      fs.readdir(path, function (err, files) {
        if (err) {
          return webLogger(err)
        }
        var f = files.length
        var l = files.length
        for (var i = 0; i < l; i++) {
          f = pathModule.join(path, files[i])
          var arrayPls = f.replace('.js', '')
          var arrayPls1 = arrayPls.replace(pathModule.join(__dirname, 'commands'), '')
          var arrayPls2 = arrayPls1.replace(/\\/g, '')
          var arrayPls3 = arrayPls2.replace('/', '')
          commands.push(' ' + arrayPls3)
          LoadModules(f)
        }
      })
    } else {
      // we have a file: load it
      require(path)(moduleHolder)
    }
  })
}

var DIR = pathModule.join(__dirname, 'commands')
LoadModules(DIR)
var moduleHolder = {}
exports.moduleHolder = moduleHolder

// Load Config
var config = require('./config.json')

var bot = new Eris(config.token)
var ownerID = config.ownerID
var prefix = config.prefix
var location = config.songInfoLocation
const ClientId = '384250935620141066';


bot.on('messageCreate', (msg) => {
  if (msg.author.id === ownerID) {
    if (msg.content.startsWith(prefix)) {
      if (msg.content === prefix + 'commands') {
        bot.createMessage(msg.channel.id, 'Here are all the commands that can be used')
        bot.createMessage(msg.channel.id, '`' + commands + '`')
        bot.createMessage(msg.channel.id, 'You can use these commands by doing `' + prefix + '<command> <args>`')
      } else {
        var watCom = prefix
        if (msg.content.length === watCom.length) {
          return
        }
        var commandFound = msg.content.substring(watCom.length)
        var actualCommand = commandFound.split(' ')
        var preArgCommand = prefix + actualCommand[0]
        var args = msg.content.substring(preArgCommand.length + 1)
        try {
          moduleHolder[actualCommand[0]](bot, msg, args)
        } catch (err) {
          webLogger(err)
        }
      }
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
        if (err) {
          return webLogger(err)
        }
        fs.appendFile(finalPath, finalMessage, function (err) {
          if (err) {
            return webLogger(err)
          }
        })
      })
    } else {
      mkdirp('./logs/' + '/' + msg.channel.guild.name + '/', function (err) {
        if (err) {
          return webLogger(err)
        }
        fs.appendFile(finalPath, finalMessage, function (err) {
          if (err) {
            return webLogger(err)
          }
        })
      })
    }
  }
})


async function setActivity(data) {
  if (!rpc || !mainWindow)
    return;

  var startTimestamp = new Date();
  const boops = await mainWindow.webContents.executeJavaScript('window.boops');

  rpc.setActivity({
          details: data,
          state: 'Listening to Music',
          startTimestamp,
          largeImageKey: 'old_man_rave',
          largeImageText: 'time to rave',
          smallImageKey: 'note',
          smallImageText: `it's music or something idk`,
          instance: false,
  });
}

setInterval(function () {
  fs.readFile('./lastsong.txt', 'utf8', function (err, lastSong) {
    if (err) {
      return webLogger(err)
    }
    fs.readFile(location, 'utf8', function (err, data) {
      if (err) {
        return webLogger(err)
      }
      if (lastSong === data) {
        webLogger('Song was already ' + data + '. Skipping change.')
      } else {
        writeSongTxt(data)
        webLogger('Song updated to "' + data + '"')
        setActivity(data);
        logItPls('Song updated to ' + data)
      }
    })
  })
}, 15000)

function writeSongTxt (song) {
  fs.writeFile('./lastsong.txt', song, function (err) {
    if (err) {
      return webLogger(err)
    }
  })
}

function writeLogsTxt (data) {
  fs.writeFile('./logs.txt', data, function (err) {
    if (err) {
      return webLogger(err)
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
        text: 'SelfButt ' + packageJSON.version + ' by Kizzaris'
      }
    }
  })
}

function startNet () {
  var spawn = require('child_process').spawn
  var child = spawn('node', ['index.js'], {
    detached: true,
    stdio: [ 'ignore', 'ignore', 'ignore' ]
  })
  child.unref()
}

function webLogger (data) {
  var time = '[' + moment().format('MMMM Do YYYY, h:mm:ss a')
  var finalMessage = time + '] ' + data + os.EOL
  fs.appendFile('./logs.txt', finalMessage, function (err) {
    if (err) {
      return webLogger(err)
    }
  })
}

serverapp.get('/apiV1/shutdown', function (req, res) {
  webLogger('Shutting down SelfButt.')
  res.send('<h1>Server has caught fire</h1><br /><i>Same thing as shutting down right?</i><br /><img src="https://i.imgur.com/daF13vl.gif" />')
  process.exit(0)
})

serverapp.get('/apiV1/reboot', function (req, res) {
  res.send('Rebooting. <a href="http://localhost:' + config.port + '/">Click here to go back to the dashboard</a>')
  startNet()
  process.exit(0)
})

serverapp.get('/apiV1/configChange', function (req, res) {
  webLogger('Changing SelfButt config.')
})

serverapp.get('/apiV1/config', function (req, res) {
  fs.readFile('./app/config.json', 'utf8', function (err, data) {
    if (err) throw err
    res.send(data)
  })
})

serverapp.get('/apiV1/logs', function (req, res) {
  fs.readFile('./logs.txt', 'utf8', function (err, data) {
    if (err) throw err
    res.send(data)
  })
})

serverapp.get('/apiV1/commands', function (req, res) {
  res.send(commands)
})

serverapp.get('/apiV1/info', function (req, res) {
  fs.readFile(location, 'utf8', function (err, data) {
    if (err) throw err
    var finalRes = '{' + '"version":"' + packageJSON.version + '",' + '"currentSong":"' + data + '",' + '"totalGuilds":"' + bot.guilds.size + '",' + '"totalChannels":"' + Object.keys(bot.channelGuildMap).length + '",' + '"onlineUsers":"' + bot.users.size + '"}'
    res.send(finalRes)
  })
})

serverapp.listen(config.port, function () {
  webLogger('You can manage your bot over at "http://localhost:' + config.port + '"')
})

process.title = 'SelfButt'
if (fs.existsSync('./lastsong.txt')) {
  writeLogsTxt('')
} else {
  logItPls("Looks like you're new to SelfButt! You can take a look on the wiki for commands or use sb.commands!")
  writeSongTxt('SelfButt First Boot')
  writeLogsTxt('')
}

bot.connect()
rpc.login(ClientId).catch(console.error);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
