		require('dotenv').config();
const	tmi = require('tmi.js');
const 	parseSpam  = require('./spamFilter.js');
const	findCommand = require('./commands.js');
const	{trySay} = require('./tryTmi.js');


const	client = new tmi.Client(
{
	connection:
	{
		secure: true,
		reconnect: true
	},
	channels: ['Sirlemonade_', 'Nilsthatboi', 'antispamtest'],
	identity:
	{
		username: process.env.TWITCH_USER,
		password: process.env.TWITCH_TOKEN
	}
});

async function moderateMessage(client, channel, tags, message)
{
	if (await parseSpam(client, message, channel, tags))
		return ;
	if (await findCommand(client, message, channel, tags))
		return ;
}

client.connect();

client.on('message', async (channel, tags, message, self) => 
{
	if (self)
		return;
	if (tags.username.toLowerCase() !== process.env.TWITCH_USER)
	{
		console.log(message);
		await moderateMessage(client, channel, tags, message);
		// const cleaned = message.replace(/[^\x20-\x7E]/g, '');
		// console.log(`received: ${cleaned.trim()}`);
		// await client.say(channel, `/shoutout ${cleaned.trim()}`);
	}
	else
		return;
	// console.log(`${tags['display-name']}: ${message}`);
});

client.on('raided', async (channel, username, viewers) => {
	console.log(`Raid detected from ${username} with ${viewers} viewers!`);
	await trySay(channel, `Thanks for the raid ${username}!`);
	await trySay(channel, `give them a follow at https://twitch.tv/${username} for a cookie!`);
});