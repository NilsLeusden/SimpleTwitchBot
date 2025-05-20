

async function trySay(client, channel, message)
{
	if (!client || !channel || !message)
	{
		console.error('trySay argument is NULL');
		return ;
	}
	try
	{
		client.say(channel, message);
	} catch (err)
	{
		console.error(err);
	}
	return ;
}

async function tryBan(client, channel, user, reason)
{
	if (!client || !channel || !user)
	{
		console.error('tryBan argument is NULL');
		return ;
	}
	if (!reason)
		reason = 'unspecified reason';
	try
	{
		await client.ban(channel, user, reason);
	} catch (err)
	{
		console.error(err);
	}
	return ;
}

async function tryTimeout(client, channel, user, time, reason)
{
	if (!client || !channel || !user)
	{
		console.error('tryTimout argument is NULL');
		return ;
	}
	if (!reason)
		reason = 'unspecified reason';
	try
	{
		await client.timeout(channel, user, time, reason);
	} catch (err)
	{
		console.error(err);
	}
	return ;
}

module.exports = 
{
	trySay,
	tryBan,
	tryTimeout,
};
