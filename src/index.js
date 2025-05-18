require('dotenv').config();
const tmi = require('tmi.js');


const	regexCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);

const	commands =
{
	youtube:
	{
		response: 'https://www.youtube.com/@sirlemonade_'
	},
	tiktok:
	{
		response: 'https://www.tiktok.com/@sirlemonadestreams'
	},
	boop:
	{
		response: (user) => `User ${user} got booped!`
	}
}

const	client = new tmi.Client(
{
	connection:
	{
		secure: true,
		reconnect: true
	},
	channels: ['Sirlemonade_', 'Nilsthatboi'],
	identity:
	{
		username: process.env.TWITCH_USER,
		password: process.env.TWITCH_TOKEN
	}
});

async function commandFound(match, channel, tags)
{
	const [raw, command, argument] = match;
	const { response } = commands[command.toLowerCase()] || {};
	console.log(`${raw} ${command} ${argument} → response = ${response}`);
	if (typeof response === 'function')
	{
		const result = response(argument);
		await client.say(channel, result);
	}
	else if (typeof response === 'string')
	{
		await client.say(channel, response);
	}
}


function parseDomains(domain) {
	const [name, tld] = domain.split('.');
	const namePattern = name.split('').map(c => `${c}[^a-zA-Z0-9]*`).join('');
	const dotPattern = '(dot|\\.)';
	const tldPattern = tld.split('').map(c => `${c}[^a-zA-Z0-9]*`).join('');
	return new RegExp(`${namePattern}[^a-zA-Z0-9]*${dotPattern}[^a-zA-Z0-9]*${tldPattern}`, 'i');
}

function buildLinkPatterns() {
	const bannedLinks = ['streamboo.com', 'freemoney.io'];
	const bannedPatterns = bannedLinks.map(parseDomains);
	const genericLinkPattern = /https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|io|xyz|co)/i;
	return { bannedPatterns, genericLinkPattern };
}

const {bannedPatterns, genericLinkPattern} = buildLinkPatterns();

async function parseSpam(message, channel, tags)
{
	if (tags.mod || tags.badges?.broadcaster || tags.badges?.vip)
		return;
	for (const pattern of bannedPatterns)
	{
		if (pattern.test(message))
		{
			console.log("Perma ban found!");
			await client.ban(channel, tags.username, 'malicious link');
			return (true);
		}

	}
	if (genericLinkPattern.test(message))
	{
		console.log(`Link found, timing out ${tags.username}!`);
		await client.timeout(channel, tags.username, 30, 'Please dont share links :(');
		return (true);
	}
	return (false);
};

async function findCommand(message, channel, tags)
{
	const match = message.match(regexCommand);
	if (match)
	{
		await commandFound(match, channel, tags);
		return ;
	}
	return ;
}

async function moderateMessage(message, channel, tags)
{
	if (await parseSpam(message, channel, tags))
		return ;
	if (await findCommand(message, channel, tags))
		return ;
}

client.connect();

client.on('message', async (channel, tags, message, self) => 
{
	if (self)
		return;
	if (tags.username.toLowerCase() !== process.env.TWITCH_USER)
	{
		await moderateMessage(message, channel, tags);
	}
	else
		return;
	// console.log(`${tags['display-name']}: ${message}`);
});