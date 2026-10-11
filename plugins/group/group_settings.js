module.exports = {
    name: 'setgroupstatut',
    aliases: ['topmembers', 'getprofilpicture', 'getpp'],
    category: 'group',
    description: 'Gestion du statut du groupe et profil',
    async execute(sock, m, args, { isGroup, groupMetadata, isUserAdmin, isBotAdmin }) {
        const jid = m.key.remoteJid;
        const body = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').toLowerCase();

        if (body.includes('setgroupstatut')) {
            if (!isGroup || !isUserAdmin || !isBotAdmin) return sock.sendMessage(jid, { text: 'Admin requis !' }, { quoted: m });
            const action = args[0] === 'close' ? 'announcement' : 'not_announcement';
            await sock.groupSettingUpdate(jid, action);
            return sock.sendMessage(jid, { text: `Statut du groupe mis à jour : *${args[0] || 'ouvert'}*` }, { quoted: m });
        }

        if (body.includes('topmembers')) {
            if (!isGroup) return;
            const count = groupMetadata.participants.length;
            return sock.sendMessage(jid, { text: `📊 Le groupe compte actuellement *${count} membres* actifs.` }, { quoted: m });
        }

        if (body.includes('getpp') || body.includes('getprofilpicture')) {
            let target = m.message?.extendedTextMessage?.contextInfo?.participant || args[0] || m.key.participant || jid;
            target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            try {
                const ppUrl = await sock.profilePictureUrl(target, 'image');
                return sock.sendMessage(jid, { image: { url: ppUrl }, caption: `Photo de profil de @${target.split('@')[0]}` }, { quoted: m });
            } catch (e) {
                return sock.sendMessage(jid, { text: 'Impossible de récupérer la photo de profil (privée ou absente).' }, { quoted: m });
            }
        }
    }
};
