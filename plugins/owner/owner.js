const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'owner',
    aliases: ['sudo', 'restart', 'setprefix', 'backup'],
    category: 'owner',
    description: 'Gestion du créateur',
    async execute(sock, m, args, { senderPhone, config }) {
        const jid = m.key.remoteJid;
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

        if (body.includes('setprefix')) {
            if (senderPhone !== config.ownerNumber) return sock.sendMessage(jid, { text: 'Réservé au créateur !' }, { quoted: m });
            const newPrefix = args[0];
            if (!newPrefix) return sock.sendMessage(jid, { text: 'Donne un préfixe !' }, { quoted: m });
            config.prefix = newPrefix;
            fs.writeFileSync(path.join(__dirname, '../../config.json'), JSON.stringify(config, null, 2));
            return sock.sendMessage(jid, { text: `Nouveau préfixe : ${newPrefix}` }, { quoted: m });
        }

        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n'
            + `FN:${config.ownerName}\n`
            + `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\n`
            + 'END:VCARD';

        await sock.sendMessage(jid, {
            contacts: {
                displayName: config.ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m });
    }
};
