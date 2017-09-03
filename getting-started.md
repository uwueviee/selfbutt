# Getting Started

Before you start, you will need to realize that selfbots are against Discord's ToS.

Now we got that out of the way, let's get to filling our config file!

You will need to copy `example-config.json` to `config.json`, Once that is complete go ahead an open up config.json and you will see 8 values labeled "token", "port", "prefix", "snipLocation", "ownerID", "logChannel", "chatLogging", and finally "discogsToken"

These values allow the bot to function properly, the most important values are "token", "port", "prefix", and "ownerID"  
Let's go over what these values do.

| value | use case |
| ---: | :--- |
| token | Your user token that Discord uses to authenticate you, used by Selfbutt to login in and check for / send messages. [How to find your token](/How to find your token/ID) |
| port | The port that Selfbutt uses to host it's admin panel. I would recommend not changing this unless you know how to edit admin panel to use the new port. |
| prefix | The prefix for all the commands. |
| ownerID | The Discord ID that the bot will listen for commands sent by that ID. [How to find your ID](/How to find your token/ID) |



