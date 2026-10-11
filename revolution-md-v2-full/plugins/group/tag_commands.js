module.exports = {
    name: 'tagall',
    aliases: ['hidetag', 'tag', 'tagnotadmin', 'totag'],
    category: 'group',
    description: 'Mentionne les membres du groupe',
    async execute(sock, m, args, { isGroup, groupMetadata, isUserAdmin, langData }) {
        if (!isGroup) return;
        if (!isUserAdmin) return sock.sendMessage(m.key.remoteJid, { text: langData.not_admin }, { quoted: m });

        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);
        const msg = args.join(' ') || 'Regardez ici bande de traînards !';
        let text = `📢 *APPEL DU GROUPE* : ${msg}\n\n`;
        for (const p of participants) {
            text += `@${p.id.split('@')[0]}\n`;
        }
        await sock.sendMessage(m.key.remoteJid, { text, mentions });
    }
};
