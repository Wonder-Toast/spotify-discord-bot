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
    }

     if ( message.content.startsWith( prefix + "addsong" ) ) {
   let url = message.content.replace( prefix + "addsong ", "" );
   if ( !url ) return message.reply( "no_entry_sign: Please specify a song for me to add to your playlist!" )
   yt.getInfo( url, ( err ) => {
     if ( err ) return message.reply( ":no_entry_sign: It seems like the song you tried to submit is invalid. You can **only** add YouTube video links!\n\n" + err );
   } );
        let data = JSON.parse(fs.readFileSync('./Toasty/spotify.json'));
          if (!data[message.author.id]) data[message.author.id] = {
            songs: []
        };
        data[message.author.id].songs.push(url);
        let updateValue = JSON.stringify(data, null, 2);
        fs.writeFileSync('./Toasty/spotify.json', updateValue);
        yt.getInfo(url, function(err, info) {
            if (err) return message.reply(":no_entry_sign: Something went wrong:\n" + err);
            message.reply("I have added the song: **" + info.title + "** to your playlist.");
        });
    }

    if (message.content.startsWith(prefix + "songs")) {
        let data = JSON.parse(fs.readFileSync('./Toasty/spotify.json'));
        if (!data[message.author.id]) data[message.author.id] = {
            songs: []
        };
        let songList = data[message.author.id].songs.join("\n");
        let embed = new Discord.RichEmbed();
        embed.setColor(0x1ED760)
            .setAuthor(message.author.username, message.author.avatarURL)
            .setThumbnail(mybot.user.avatarURL)
            .addField(`Your songs:`, `**${songList}**`)
        message.channel.sendEmbed(embed);
    }

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
