const dotenv = require('dotenv');
const cron = require('node-cron');
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

// cron job 3時間ごとに定期実行
// TODO: messageCreateではメッセージ送信時にしか発火しないため、cronで動かすとエラーが起きるため
//       fetchで別途messageを取るようにする。

// cron.schedule('0 0 */3 * * *', () => client.on("messageCreate", (message) => {
//     if (message.author.id === process.env.BOT_ID) {
//         message.delete();
//     }
// }));


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
    const isUser = process.env.USER_ID.includes(newPresence.userId)
    const isUserStatus = newPresence.status
    const isMobile = !!newPresence.clientStatus.mobile
    let statusMessage

    //　statusが同じ場合はメッセージを送信しない
    if (!!oldPresence && oldPresence.status === newPresence.status) {
        return
    } else if (isUser && isUserStatus === 'online') {
        statusMessage = `${member.user.username} が${isMobile ? 'スマートフォン' : 'パソコン'}でオンラインになりました。\n`;
    } else if (isUser && isUserStatus === 'offline') {
        statusMessage = `${member.user.username} がオフラインになりました。\n`
    } else if (isUser && newPresence.status === 'idle') {
        statusMessage = `${member.user.username} はどっかに逝きました。\n`
    }

    client.channels.cache.get(process.env.BOT_CHAT_ROOM_ID).send(statusMessage);
});


/**
 * 聞いている曲をチャットに記録する
 */
client.on('presenceUpdate', (oldPresence, newPresence) => {
    let isOldMusic = !!oldPresence.activities ? oldPresence.activities.find(info => info.name === 'Spotify') : null
    let isNewMusic = !!newPresence.activities ? newPresence.activities.find(newInfo => newInfo.name === 'Spotify') : null

    if (!!isNewMusic && !!isOldMusic && isOldMusic.details === isNewMusic.details) {
        return
    } else if (!!isNewMusic) {
        let statusMessage = `${client.users.cache.get(newPresence.userId)}is playing MUSIC now... \n 曲名：${isNewMusic.details}　　歌手：${isNewMusic.state}`
        client.channels.cache.get(process.env.BOT_MUSIC_HISTORY_ROOM_ID).send(statusMessage);
    }
});

/**
 * BOTのメッセージを消す
 * TODO：100件メッセージを取っているが、指定できるようにする
 */
client.on('messageCreate', async message => {
    if (message.content === '!del') {
        message.delete();
        const messages = await message.channel.messages.fetch({ limit: 100 })
        const filtered = messages.filter(message => message.author.id === process.env.BOT_ID)
        message.channel.bulkDelete(filtered)
    }
})

client.login(process.env.DISCORD_TOKEN);