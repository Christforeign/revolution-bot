module.exports = {
    name: 'roast',
    aliases: ['insult', 'tictactoe', 'truth', 'dare', 'quotes', 'fact', 'flirt', 'wasted', 'waifu', 'neko', 'animeavatar'],
    category: 'fun',
    description: 'Commandes Fun et Anime',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const target = m.message?.extendedTextMessage?.contextInfo?.participant;
        
        const roasts = [
            "T'as le charisme d'une huître pas fraîche.",
            "Si la bêtise était cotée en bourse, tu serais milliardaire.",
            "Même ton ombre essaie de s'enfuir quand tu marches.",
            "T'es comme un bug dans le code : personne sait d'où tu sors mais tout le monde veut te supprimer."
        ];
        const selected = roasts[Math.floor(Math.random() * roasts.length)];
        const text = target ? `@${target.split('@')[0]} ${selected}` : selected;
        await sock.sendMessage(jid, { text, mentions: target ? [target] : [] }, { quoted: m });
    }
};
