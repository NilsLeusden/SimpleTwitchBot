//TO DO 

	// fix regex
	// figure out why twitch doesnt respond to ban calls
const	{ tryBan, tryTimeout } = require('./tryTmi.js');


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
	const genericLinkPattern = /https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|io|xyz|tv|co)/i;
	return { bannedPatterns, genericLinkPattern };
}

const {bannedPatterns, genericLinkPattern} = buildLinkPatterns();

async function parseSpam(client, message, channel, tags)
{
	if (!client || !message || !channel || !tags)
		return ;
	if (tags.mod || tags.badges?.broadcaster || tags.badges?.vip)
		return ;
	for (const pattern of bannedPatterns)
	{
		if (pattern.test(message))
		{
			console.log("Perma ban found!");
			tryBan(client, channel, tags.username, 'Sharing malicious links.');
			return (true);
		}
	}
	if (genericLinkPattern.test(message))
	{
		if (tags['first-msg'] === '1')
		{
			console.log("Perma ban found!");
			tryBan(client, channel, tags.username, 'First time message cant be a link');
		}
		else
		{
			console.log(`Link found, timing out ${tags.username}`);
			tryTimeout(client, channel, tags.username, 30, 'Please dont share links :(');
		}
		return (true);
	}
	return (false);
};

module.exports = parseSpam;