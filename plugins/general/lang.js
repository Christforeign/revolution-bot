module.exports = {
    name: 'lang',
    category: 'general',
    description: 'Change la langue du bot',
    async execute(sock, m, args, { userLanguages, loadLocale, senderPhone }) {
        const jid = m.key.remoteJid;
        const chosen = (args[0] || '').toLowerCase();
        if (!['fr', 'en', 'ht', 'es'].includes(chosen)) {
            await sock.sendMessage(jid, { 
                text: '❌ Langue invalide ! Choisis : fr, en, ht ou es.\nExemple : .lang ht' 
            }, { quoted: m });
            return;
        }

        userLanguages.set(senderPhone, chosen);
        const lData = loadLocale(chosen);
        await sock.sendMessage(jid, { text: lData.lang_changed || 'Langue mise à jour !' }, { quoted: m });
    }
};
