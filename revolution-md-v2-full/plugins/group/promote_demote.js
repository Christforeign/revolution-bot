module.exports = {
    name: 'promote',
    aliases: ['demote', 'promoteall', 'demoteall'],
    category: 'group',
    description: 'Promeut ou rétrograde un membre',
    async execute(sock, m, args, { isGroup, isUserAdmin, isBotAdmin, langData }) {
        if (!isGroup) return;
        if (!isUserAdmin) return sock.sendMessage(m.key.remoteJid, { text: langData.not_admin }, { quoted: m });
        if (!isBotAdmin) return sock.sendMessage(m.key.remoteJid, { text: langData.bot_not_admin }, { quoted: m });

        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const action = body.includes('demote') ? 'demote' : 'promote';

        let target = m.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target && args[0]) target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!target) return sock.sendMessage(m.key.remoteJid, { text: langData.no_target }, { quoted: m });

        await sock.groupParticipantsUpdate(m.key.remoteJid, [target], action);
        await sock.sendMessage(m.key.remoteJid, { 
            text: action === 'promote' ? `Félicitations @${target.split('@')[0]}, te voilà admin !` : `@${target.split('@')[0]} redescends sur terre, t'es plus admin.`,
            mentions: [target] 
        });
    }
};
