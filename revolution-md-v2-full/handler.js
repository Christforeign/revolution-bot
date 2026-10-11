const fs = require('fs');
const path = require('path');
const { commands } = require('./lib/loader');

function loadLocale(lang = 'fr') {
    const file = path.join(__dirname, 'locales', `${lang}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'locales/fr.json'), 'utf8'));
}

async function handleIncomingMessage(sock, m, userLanguages) {
    try {
        if (!m.message) return;
        const jid = m.key.remoteJid;
        const sender = m.key.participant || jid;
        const senderPhone = sender.replace(/[^0-9]/g, '');

        const configLive = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

        if (configLive.autoRead) await sock.readMessages([m.key]);
        if (configLive.autoTyping) await sock.sendPresenceUpdate('composing', jid);

        let lang = userLanguages.get(senderPhone);
        if (!lang) {
            lang = 'fr';
            userLanguages.set(senderPhone, lang);
            const defaultFr = loadLocale('fr');
            await sock.sendMessage(jid, { text: defaultFr.welcome_lang }, { quoted: m });
        }

        const langData = loadLocale(lang);
        const msgType = Object.keys(m.message)[0];
        let body = '';
        if (msgType === 'conversation') body = m.message.conversation;
        else if (msgType === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
        else if (msgType === 'imageMessage') body = m.message.imageMessage.caption;
        else if (msgType === 'videoMessage') body = m.message.videoMessage.caption;

        if (!body) return;

        const isGroup = jid.endsWith('@g.us');
        let groupMetadata = null;
        let groupAdmins = [];
        let isBotAdmin = false;
        let isUserAdmin = false;

        if (isGroup) {
            try {
                groupMetadata = await sock.groupMetadata(jid);
                groupAdmins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                const botJid = sock.user.id.includes(':') ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : sock.user.id;
                isBotAdmin = groupAdmins.includes(botJid);
                isUserAdmin = groupAdmins.includes(sender);
            } catch (e) {}
        }

        if (!body.startsWith(configLive.prefix)) {
            const botId = sock.user.id.includes(':') ? sock.user.id.split(':')[0] : sock.user.id;
            const isMentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.some(j => j.includes(botId));
            if (isMentioned || !isGroup) {
                const chatbotCmd = commands.get('chatbot');
                if (chatbotCmd) {
                    await chatbotCmd.execute(sock, m, body.split(' '), { config: configLive, langData, promptText: body });
                }
            }
            return;
        }

        const args = body.slice(configLive.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const cmd = commands.get(commandName);
        if (!cmd) {
            await sock.sendMessage(jid, { text: langData.unknown_cmd }, { quoted: m });
            return;
        }

        await cmd.execute(sock, m, args, {
            config: configLive,
            langData,
            userLanguages,
            loadLocale,
            senderPhone,
            isGroup,
            groupMetadata,
            groupAdmins,
            isBotAdmin,
            isUserAdmin
        });

    } catch (err) {
        console.error('Erreur handleIncomingMessage :', err);
    }
}

module.exports = { handleIncomingMessage };
