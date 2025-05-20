//TO DO

	// try to use twitch API
	// add more commands
	const { trySay } = require('./tryTmi.js');

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
		response: (user) =>
		{
			if (!user || user.trim() === '')
				return 'boop boop';
			else
				return `${user} got booped!`;
		}
	}
};

async function commandFound(client, match, channel, tags)
{
	const [raw, command, argument] = match;
	const { response } = commands[command.toLowerCase()] || {};
	console.log(`response = ${response}`);
	if (typeof response === 'function')
	{
		const result = response(argument);
		await trySay(client, channel, result);
	}
	else if (typeof response === 'string')
	{
		await trySay(client, channel, response);
	}
}

async function findCommand(client, message, channel, tags)
{
	const match = message.match(regexCommand);
	if (match)
	{
		await commandFound(client, match, channel, tags);
		return ;
	}
	return ;
}

module.exports = findCommand;