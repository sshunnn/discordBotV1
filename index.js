const dotenv = require('dotenv');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({
    'intents': [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});
dotenv.config();


client.on('ready', () => {
    console.log(`${client.user.tag}!`);
});

client.once(Events.ClientReady, c => {
    console.log(`準備OKです! ${c.user.tag}がログインします。`);
});


/**
 * ユーザーのstatusが変更されたらメッセージを送信
 * online, offline, idleの場合各種メッセージが送信される。
 */
client.on('presenceUpdate', (oldPresence, newPresence) => {
    const member = newPresence.member;
    const userStatus = newPresence.clientStatus;
    const userTerminalInfo = !!userStatus.desktop ? 'パソコン' : 'スマートフォン'

    if (Number(newPresence.userId) === Number(process.env.USER_ID)) {
        // ユーザーのクライアント情報を取得
        if (newPresence.status === 'online' || newPresence.status === 'offline') {
            let statusMessage = (userStatus.desktop === 'online' || userStatus.mobile === 'online') ? `${member.user.username} が${userTerminalInfo}でオンラインになりました。\n` : `${member.user.username} がオフラインになりました。\n`;
            client.channels.cache.get(process.env.BOT_CHAT_ROOM_ID).send(statusMessage);
        } else if(newPresence.status === 'idle') {
            statusMessage = `${member.user.username} はどっかに逝きました。\n`
            client.channels.cache.get(process.env.BOT_CHAT_ROOM_ID).send(statusMessage);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);