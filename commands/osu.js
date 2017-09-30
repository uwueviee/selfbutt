function handler (bot, msg, args) {
  bot.createMessage(msg.channel.id, 'http://lemmmy.pw/osusig/sig.php?colour=pink&uname=' + args + '&pp=1&countryrank&removeavmargin&darktriangles&avatarrounding=4&onlineindicator=undefined&xpbar')
}

module.exports = function (moduleHolder) {
  moduleHolder['osu'] = handler
}
