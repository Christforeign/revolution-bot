module.exports = {
    name: 'compliment',
    aliases: ['flirt', 'insult', 'goodnight', 'roseday', 'wasted'],
    category: 'misc',
    description: 'Messages sociaux, compliments, drague et humeur',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const body = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').toLowerCase();
        const target = m.message?.extendedTextMessage?.contextInfo?.participant;
        const targetTag = target ? `@${target.split('@')[0]} ` : '';

        if (body.includes('compliment')) {
            const compliments = [
                "T'as un flow incroyable aujourd'hui gros !",
                "Heureusement que t'es là pour relever le niveau intellectuel de ce groupe.",
                "T'es un vrai chef, rien à redire."
            ];
            const msg = compliments[Math.floor(Math.random() * compliments.length)];
            return sock.sendMessage(jid, { text: targetTag + msg, mentions: target ? [target] : [] }, { quoted: m });
        }

        if (body.includes('flirt')) {
            const flirts = [
                "Ton père est un voleur ? Il a volé toutes les étoiles pour les mettre dans tes yeux.",
                "Est-ce que t'as un plan ? Parce que je me suis perdu dans ton regard.",
                "Si aimer était un crime, je serais déjà condamné à perpétuité pour toi."
            ];
            const msg = flirts[Math.floor(Math.random() * flirts.length)];
            return sock.sendMessage(jid, { text: targetTag + msg, mentions: target ? [target] : [] }, { quoted: m });
        }

        if (body.includes('goodnight')) {
            return sock.sendMessage(jid, { text: "Allez, éteins ton écran et va dormir. Bonne nuit !" }, { quoted: m });
        }

        if (body.includes('roseday')) {
            return sock.sendMessage(jid, { text: "🌹 Tiens une rose virtuelle, fais pas l'avare !" }, { quoted: m });
        }

        if (body.includes('wasted')) {
            return sock.sendMessage(jid, { text: `☠️ *WASTED* : ${targetTag || 'Quelqu\'un'} vient de se faire démolir !`, mentions: target ? [target] : [] }, { quoted: m });
        }

        const insults = [
            "T'as le QI d'une brique éteinte.",
            "T'es tellement lent que ta connexion internet a pitié de toi.",
            "Si la bêtise était un sport olympique, tu serais médaillé d'or à vie."
        ];
        const msg = insults[Math.floor(Math.random() * insults.length)];
        return sock.sendMessage(jid, { text: targetTag + msg, mentions: target ? [target] : [] }, { quoted: m });
    }
};
