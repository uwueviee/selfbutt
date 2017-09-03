# Creating custom commands

---

#### Base command:

`function handler (bot, msg, args) {  
  bot.createMessage(msg.channel.id, 'lol ' + args)  
}  
module.exports = function (moduleHolder) {  
  moduleHolder['lol'] = handler  
}`



