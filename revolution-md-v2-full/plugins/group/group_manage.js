module.exports = {
    name: 'groupinfo',
    aliases: ['group', 'resetlink', 'revoke', 'left', 'invite', 'setdesc', 'opentime', 'closetime'],
    category: 'group',
    description: 'Gestion et informations du groupe',
    async execute(sock, m, args, { isGroup, groupMetadata, isUserAdmin, isBotAdmin, langData }) {
        if (!isGroup) return;
        const jid = m.key.remoteJid;
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

        if (body.includes('resetlink') || body.includes('revoke')) {
            if (!isUserAdmin || !isBotAdmin) return sock.sendMessage(jid, { text: 'Admin requis.' }, { quoted: m });
            const code = await sock.groupRevokeInvite(jid);
            return sock.sendMessage(jid, { text: `Lien réinitialisé ! Nouveau code : ${code}` }, { quoted: m });
        }

        if (body.includes('invite')) {
            if (!isBotAdmin) return sock.sendMessage(jid, { text: langData.bot_not_admin }, { quoted: m });
            const code = await sock.groupInviteCode(jid);
            return sock.sendMessage(jid, { text: `Lien du groupe : https://chat.whatsapp.com/${code}` }, { quoted: m });
        }

        if (body.includes('left')) {
            if (!isUserAdmin) return sock.sendMessage(jid, { text: langData.not_admin }, { quoted: m });
            await sock.sendMessage(jid, { text: 'Allez ciao la compagnie !' });
            return sock.groupLeave(jid);
        }

        const info = `
╭━━〔 *INFOS GROUPE* 〕━━╮
┃ 🏷️ *Nom* : ${groupMetadata.subject}
┃ 🆔 *ID* : ${groupMetadata.id}
┃ 👥 *Membres* : ${groupMetadata.participants.length}
┃ 👑 *Créateur* : @${(groupMetadata.owner || '').split('@')[0]}
┃ 📝 *Description* :
${groupMetadata.desc || 'Aucune description'}
╰━━━━━━━━━━━━━━━━━━╯`;
        await sock.sendMessage(jid, { text: info, mentions: [groupMetadata.owner].filter(Boolean) }, { quoted: m });
    }
};
