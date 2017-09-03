# Getting Started

---

Before you start, you will need to realize that selfbots are against Discord's ToS.  
You will also need to download [NodeJS](https://nodejs.org/). Make sure you are downloading the current version, not the LTS version.

Now we got that out of the way, let's get to filling our config file!

You will need to copy `example-config.json` to `config.json`, Once that is complete go ahead an open up config.json and you will see 8 values labeled "token", "port", "prefix", "snipLocation", "ownerID", "logChannel", "chatLogging", and finally "discogsToken"

These values allow the bot to function properly, the most important values are "token", "port", "prefix", and "ownerID"  
Let's go over what these values do.

| value | use case |
| ---: | :--- |
| token | Your user token that Discord uses to authenticate you, used by Selfbutt to login in and check for / send messages. [How to find your token](/how-to-find-your-tokenid.md) |
| port | The port that Selfbutt uses to host it's admin panel. I would recommend not changing this unless you know how to edit admin panel to use the new port. |
| prefix | The prefix for all the commands. |
| ownerID | The Discord ID that the bot will listen for commands sent by that ID. [How to find your ID](/how-to-find-your-tokenid.md) |

When you are finshed filling out all the values open a command prompt / terminal and go to the directory that the selfbot is in.  
Then you will need to type `npm install` and let it install all the required modules, when that is complete do`npm start` to actually start the selfbot.

When ever you want to start the selfbot, type in `npm start` in the directory.

