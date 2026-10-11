const axios = require('axios');

module.exports = {
    name: 'ai',
    aliases: ['chatgpt', 'gemini', 'imagine', 'analyze', 'search', 'chatbot'],
    category: 'ai',
    description: 'Intelligence artificielle conversationnelle',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const prompt = args.join(' ');
        if (!prompt) return sock.sendMessage(jid, { text: 'Pose ta question ! Ex: .ai Pourquoi le ciel est bleu ?' }, { quoted: m });

        try {
            await sock.sendMessage(jid, { react: { text: '🧠', key: m.key } });
            const res = await axios.get(`https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&query=${encodeURIComponent(prompt)}`, { timeout: 15000 });
            const answer = res.data?.result || 'Je ne trouve rien à répondre pour le moment.';
            await sock.sendMessage(jid, { text: answer }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(jid, { text: 'Cerveau en surchauffe, réessaie plus tard.' }, { quoted: m });
        }
    }
};
