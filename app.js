const Discord = require('discord.js');
const yt = require('ytdl-core');
const fs = require('fs');
const tokens = require('./tokens.json');
const client = new Discord.Client();
const userData = JSON.parse(fs.readFileSync('./Toasty/spotify/spotify.json'));

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
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.sendMessage(`Playing: **${song.title}** from user: **${msg.author.username}**'s playlist.`);
			dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : tokens.passes });
			let collector = msg.channel.createCollector(m => m);
			collector.on('message', m => {
				if (m.content.startsWith(tokens.prefix + 'pause')) {
					msg.channel.sendMessage(':pause_button: Paused.').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith(tokens.prefix + 'resume')){
					msg.channel.sendMessage(':play_pause: Resumed.').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith(tokens.prefix + 'skip')){
					msg.channel.sendMessage(':arrow_forward: Skipped.').then(() => {dispatcher.end();});
				} else if (m.content.startsWith('volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`:speaker: Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith(tokens.prefix + 'time')){
					msg.channel.sendMessage(`:clock1: Time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
			});
			dispatcher.on('end', () => {
				collector.stop();
				play(userData[msg.author.id].songs.shift());
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage(':no_entry_sign: Error: ' + err).then(() => {
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
	},
	'add': (msg) => {
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.sendMessage(`You must add a url, or youtube video id after ${tokens.prefix}add`);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.sendMessage(':no_entry_sign: Invalid YouTube link: ' + err);
			if (!userData[msg.author.id]) userData[msg.author.id] = {
					songs: []
			};
			userData[msg.author.id].songs.push({url: url, title: info.title});
			let updateValue = JSON.stringify(userData, null, 2);
			fs.writeFileSync('./Toasty/spotify/spotify.json', updateValue);
			msg.channel.sendMessage(`:white_check_mark: Added **${info.title}** to your playlist.`);
		});
	},
	'mysongs': (msg) => {
		if (userData[msg.author.id] === undefined) return msg.channel.sendMessage("You don't have any songs in your playlist! Add some with `" + tokens.prefix + "add`");
		let tosend = [];
		userData[msg.author.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - From: ${msg.author.username}'s playlist.`);});
		msg.channel.sendMessage(`__**${msg.author.username}'s Music Playlist:**__ Currently **${tosend.length}** songs in it ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
	},
	'stop': (msg) => {

		}
};

client.on('ready', () => {
	console.log('Spotify bot online and ready.');
});

client.on('message', msg => {
	if (!msg.content.startsWith(tokens.prefix)) return;
	if (commands.hasOwnProperty(msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0])) commands[msg.content.toLowerCase().slice(tokens.prefix.length).split(' ')[0]](msg);
});
client.login(tokens.d_token);
