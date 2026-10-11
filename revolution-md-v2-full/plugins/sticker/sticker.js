const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'take', 'stickercrop', 'toimage', 'tovideo', 'toaudio', 'tomp3', 'emojimix', 'remini', 'removebg'],
    category: 'sticker',
    description: 'Convertisseur d images, stickers et médias',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        let messageToDownload = null;

        if (m.message?.imageMessage) {
            messageToDownload = { type: 'image', msg: m.message.imageMessage };
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
            messageToDownload = { type: 'image', msg: m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage };
        } else if (m.message?.videoMessage) {
            messageToDownload = { type: 'video', msg: m.message.videoMessage };
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
            messageToDownload = { type: 'video', msg: m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage };
        } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage) {
            messageToDownload = { type: 'sticker', msg: m.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage };
        }

        if (!messageToDownload) {
            return sock.sendMessage(jid, { text: 'Envoie ou réponds à une image/vidéo pour la convertir !' }, { quoted: m });
        }

        try {
            await sock.sendMessage(jid, { react: { text: '⏳', key: m.key } });
            const stream = await downloadContentFromMessage(messageToDownload.msg, messageToDownload.type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            if (messageToDownload.type === 'sticker') {
                // Sticker vers Image
                await sock.sendMessage(jid, { image: buffer, caption: 'Voilà ton image convertie.' }, { quoted: m });
            } else {
                // Image vers Sticker
                await sock.sendMessage(jid, { sticker: buffer }, { quoted: m });
            }
            await sock.sendMessage(jid, { react: { text: '✅', key: m.key } });
        } catch (e) {
            await sock.sendMessage(jid, { text: 'Erreur lors du traitement du média.' }, { quoted: m });
        }
    }
};
