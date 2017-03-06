"use strict";

const Discord = require('discord.js');
const mybot = new Discord.Client();
const now = require('performance-now');
const yt = require('ytdl-core');
const prefix = 's.';
const token = TOKEN;
const oauth = 'https://discordapp.com/oauth2/authorize?client_id=224495611741863936&scope=bot&permissions=37088320';

mybot.on("ready", function() {
    mybot.user.setGame(`Custom playlists! s.help | s.invite`);
    console.log(`Spotify online, on ${mybot.guilds.size} guilds!`);
});

mybot.on("message", message => {
  if (message.author.bot) return; //ignore bots
  if(message.content.startsWith("<@224495611741863936>")) {
    message.reply("Hey! My help command is `s.help`");
  }

    if (message.content === prefix + "ping") {
        var start = now();
        message.channel.sendMessage("*Pinging...*")
            .then(message => {
                var end = now();
                message.edit(`Pong! **${(end - start).toFixed(0)}ms**`);
            });
    }

    if (message.content.startsWith(prefix + "help")) {
        message.reply("I've sent a list of commands to you. Check your DM's.");
        var help = [
            "Prefix is `s.`",
            "**help** = Sends this message.",
            "**play** = Starts playing your playlist in the voice channel you are in.",
            "**skip** = Skips the currently playing song.",
            "**stop** = Stops playing.",
            "**force <song>** = Plays the specified song. *(YouTube videos only)*",
            "**addsong <song>** = Adds the specified song to your custom playlist. *(YouTube videos only)*",
            "**songs** = List's all of your songs.",
            "**invite** = Sends the OAuth link to invite me to your server.",
        ];
        message.author.sendMessage(help);
        console.log(`Help sent!`);
    }

    if (message.content.startsWith(prefix + "connections")) {
        message.channel.sendMessage(`Currently playing music in **${mybot.voiceConnections.size}** voice channels!`);
    }

    if (message.content.startsWith(prefix + "servers")) {
        message.channel.sendMessage(`On **${mybot.guilds.size}** servers!`)
    }

    if (message.content === prefix + "invite") {
        message.channel.sendMessage(`Feel free to invite me using this: ${oauth}`)
    }

  /*  if (message.content.startsWith(prefix + "addsong")) {
		const connections = new Map();
      const connectionData = connections.get(message.guild.id);
     // const queue = connectionData.queue;
        let url = message.content.replace(prefix + "addsong ", "");
        if (!url) return message.reply("no_entry_sign: Please specify a song for me to add to your playlist!")
        yt.getInfo(url, (err) => {
            if (err) return message.reply(":no_entry_sign: It seems like the song you tried to submit is invalid. You can **only** add YouTube video links!\n\n" + err);
        });
        let data = JSON.parse(fs.readFileSync('./Toasty/spotify.json'));
        if (!data[message.author.id]) data[message.author.id] = {
            songs: []
        };
        data[message.author.id].songs.push(url);
        let updateValue = JSON.stringify(data, null, 2);
        fs.writeFileSync('./Toasty/spotify.json', updateValue);
        yt.getInfo(url, function(err, info) {
            if (err) return message.reply(":no_entry_sign: Something went wrong:\n" + err);
            message.reply("I have added the song: **" + info.title + `** to your playlist`);
        });
    }*/

    if (message.content === prefix + "restart") {
        if (!message.author.id === '193378071141810176') return;
        if (!message.author.id === '138431969418543104') return;
        //Gotcha Toasty ;)
        message.channel.sendMessage("```css\nRestarting...```");
        console.log("Restarting...");
        setTimeout(function() {
            console.log(process.exit(0));
        }, 400);
    }

    //end message event
});


mybot.login(token);
