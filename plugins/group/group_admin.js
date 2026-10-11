module.exports = {
    name: 'kick',
    aliases: ['ban', 'kickall'],
    category: 'group',
    description: 'Expulse un participant',
    async execute(sock, m, args, { isGroup, isUserAdmin, isBotAdmin, langData }) {
        if (!isGroup) return sock.sendMessage(m.key.remoteJid, { text: 'Uniquement en groupe.' }, { quoted: m });
        if (!isUserAdmin) return sock.sendMessage(m.key.remoteJid, { text: langData.not_admin }, { quoted: m });
        if (!isBotAdmin) return sock.sendMessage(m.key.remoteJid, { text: langData.bot_not_admin }, { quoted: m });

        let target = m.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target && args[0]) target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!target) return sock.sendMessage(m.key.remoteJid, { text: langData.no_target }, { quoted: m });

        await sock.groupParticipantsUpdate(m.key.remoteJid, [target], 'remove');
        await sock.sendMessage(m.key.remoteJid, { text: `Allez dégage d'ici @${target.split('@')[0]} !`, mentions: [target] });
    }
};
