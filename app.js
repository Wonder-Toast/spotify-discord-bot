const Discord = require('discord.js');
const yt = require('ytdl-core');
const fs = require('fs');
const now = require('performance-now');
const tokens = require('./tokens.json');
const client = new Discord.Client();
const userData = JSON.parse(fs.readFileSync('./Toasty/spotify/spotify.json'));
const oauth = 'https://discordapp.com/oauth2/authorize?client_id=224495611741863936&scope=bot&permissions=37088320';

let queue = {};

const commands = {
	'play': (msg) => {
		if (userData[msg.author.id] === undefined) return msg.reply("You don't have any songs in your playlist! Add some with `" + tokens.prefix + "add`");
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		//if (queue[msg.guild.id].playing) return msg.channel.sendMessage("I'm currently already playing.");
		let dispatcher;
		//queue[msg.guild.id].playing = true;

		(function play(song) {
			if (song === undefined) return msg.channel.sendMessage("You don't have any songs in your playlist! Add some with `" + tokens.prefix + "add`").then(() => {
				//queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.sendMessage(`Playing: **${song.title}** from user: **${msg.author.username}**'s playlist.`);
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true })/*, { passes : tokens.passes }*/);
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) {
					msg.channel.sendMessage(':pause_button: Paused.').then(() => {dispatcher.pause();});
					} else if (m.content.startsWith(tokens.prefix + 'resume')){
						msg.channel.sendMessage(':play_pause: Resumed.').then(() => {dispatcher.resume();});
					} else if (m.content.startsWith(tokens.prefix + 'skip')){
						msg.channel.sendMessage(':arrow_forward: Skipped.').then(() => {dispatcher.end();});
				} else if (m.content.startsWith(tokens.prefix + 'volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(tokens.prefix + 'volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(tokens.prefix + 'time')){
					msg.channel.sendMessage(`:clock1: Time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				play(userData[msg.author.id].songs[Math.floor(Math.random() * userData[msg.author.id].songs.length)]);
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
					collector.stop();
					play(userData[msg.author.id].songs[Math.floor(Math.random() * userData[msg.author.id].songs.length)]);
				});
			});
		})(userData[msg.author.id].songs[Math.floor(Math.random() * userData[msg.author.id].songs.length)]);
	},
	'join': (msg) => {
		return new Promise((resolve, reject) => {
			const voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply(':no_entry_sign: I couldn\'t connect to your voice channel.');
			voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
		});
		msg.channel.sendMessage(":white_check_mark: I've successfully joined your voice channel.");
	},
	'add': (msg) => {
		let url = msg.content.split(' ')[1];
		if (!url == '' || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after ${tokens.prefix}add`).catch(e => {
			msg.channel.sendMessage(`:no_entry_sign: **Error:**\n${e}`);
		});
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.sendMessage(':no_entry_sign: Invalid YouTube link: ' + err).catch(e => {
				msg.channel.sendMessage(`:no_entry_sign: **Error:**\n${e}`);
			});
			if (!userData[msg.author.id]) userData[msg.author.id] = {
					songs: []
			};
			userData[msg.author.id].songs.push({url: url, title: info.title});
			let updateValue = JSON.stringify(userData, null, 2);
			fs.writeFileSync('./Toasty/spotify/spotify.json', updateValue);
			msg.channel.sendMessage(`:white_check_mark: Added **${info.title}** to your playlist.`);
		});
	},
	'songs': (msg) => {
		if (!userData[msg.author.id] === undefined) return msg.channel.sendMessage("You don't have any songs in your playlist! Add some with `" + tokens.prefix + "add`");
		let tosend = [];
		userData[msg.author.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title}`);});
		msg.channel.sendMessage(`__**${msg.author.username}'s Music Playlist:**__ Currently **${tosend.length}** songs in it ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
	'stop': (msg) => {
		const vC = msg.member.voiceChannel;
		if(!msg.guild.voiceConnection) {
			msg.channel.sendMessage("I'm not currently playing on this server!");
		} else if(!vC) {
			msg.channel.sendMessage("You're not connected to a voice channel!");
		} else {
			msg.channel.sendMessage(":octagonal_sign: I've stopped playing.")
			setTimeout(function() { vC.leave(); }, 1500);
		}
	},
	'ping': (msg) => {
		var start = now();
		msg.channel.sendMessage("*Pinging...*").then(msg => { var end = now(); msg.edit(`Pong! **${(end - start).toFixed(0)}ms**`); });
	},
	'help': (msg) => {
		msg.reply("I've sent a list of commands to you. Check your DM's.");
		var help = [
				"Prefix is `s.`",
				"**help** = Sends this message.",
				"**join** = Joins the voice channel you're connected to.",
				"**play** = Starts playing a song in your playlist.",
				"**skip** = Skips the currently playing song.",
				"**pause** = Pauses the currently playing song.",
				"**resume** = Resumes a paused song.",
				"**volume+[+]** = Increases the volume of a song.",
				"**volume-[-]** = Decreases the volume of a song.",
				"**stop** = Stops playing.",
				"**time** = Displays the play time of the song that's playing.",
				"**add <song>** = Adds the specified song to your custom playlist. *(YouTube videos only)*",
				"**songs** = List's all of your songs.",
				"**invite** = Sends the OAuth link to invite me to your server.",
				"**ping** = Pings the bot.",
				"**connections** = List's the amount of voice channels Spotify is connected to.",
				"**servers** = List's the amount of servers Spotify is on.",
		];
		msg.author.sendMessage(help);
	},
	'connections': (msg) => {
		msg.channel.sendMessage(`Currently playing music in **${client.voiceConnections.size}** voice channels!`);
	},
	'servers': (msg) => {
		msg.channel.sendMessage(`On **${client.guilds.size}** servers!`);
	},
	'invite': (msg) => {
		msg.channel.sendMessage(`Feel free to invite me using this: ${oauth}`)
	},
	'restart': (msg) => {
		if (!msg.author.id === '193378071141810176') return;
		if (!msg.author.id === '138431969418543104') return;
		msg.channel.sendMessage("```css\nRestarting...```");
		console.log("Restarting...");
		setTimeout(function() { console.log(process.exit(0)); }, 400);
	},
	'stats': (msg) => {
        var start = now();
        let embed = new Discord.RichEmbed();
        msg.channel.sendMessage("```+ Fetching...```")
            .then(msg => {
                var end = now();
                var milliseconds = parseInt((client.uptime % 1000) / 100),
                    seconds = parseInt((client.uptime / 1000) % 60),
                    minutes = parseInt((client.uptime / (1000 * 60)) % 60),
                    hours = parseInt((client.uptime / (1000 * 60 * 60)) % 24);
                hours = (hours < 10) ? "0" + hours : hours;
                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;
                var uptime = "" + hours + " hours, " + minutes + " minutes and " + seconds + "." + milliseconds + " seconds";
                embed.setColor(0x00FFE1)
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setTitle("Spotify Stats:")
                    .addField('• Uptime: ', `${uptime}`, true)
                    .addField('• Servers: ', `${client.guilds.size}`, true)
                    .addField('• Channels: ', `${client.channels.size.toLocaleString()}`, true)
                    .addField('• Users: ', `${client.users.size.toLocaleString()}`, true)
                    .addField('• Ping: ', `${(end - start).toFixed(0)} MS`, true)
                    .addField('• CPU Speed: ', '2.4GHz', true)
                    .addField(`• Mem. Usage: `, `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
                    .addField(`• OS: `, `Ubuntu 16.0.4 Server`, true)
                msg.channel.sendEmbed(embed);
                return msg.edit('```Done!```');
              }).catch(e => {
              msg.channel.sendMessage(":no_entry_sign: There was an error! Report this please:\n\n" + e);
            });
	}
};

client.on('ready', () => {
	  client.user.setGame(`Custom playlists! s.help | s.invite`, 'https://www.twitch.tv/imaqtpie');
	console.log('Spotify bot online and ready!');
});

client.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});
client.login(tokens.d_token);
