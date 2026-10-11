const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'chatbot',
    category: 'ai',
    description: 'Chatbot interactif avec instructions système',
    async execute(sock, m, args, { promptText, config }) {
        const jid = m.key.remoteJid;
        const query = promptText || args.join(' ');
        if (!query) return;

        const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json'), 'utf8'));
        const systemPrompt = cfg.chatbotInstructions || "Sois direct, pote et provocateur.";

        try {
            await sock.sendMessage(jid, { react: { text: '💬', key: m.key } });
            const fullQuery = `${systemPrompt}\n\nUtilisateur: ${query}`;
            const res = await axios.get(`https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&query=${encodeURIComponent(fullQuery)}`, { timeout: 15000 });
            const reply = res.data?.result || "Tu me parles mais j'ai la flemme là.";
            await sock.sendMessage(jid, { text: reply }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(jid, { text: "Mon cerveau a grillé deux secondes, répète un peu ?" }, { quoted: m });
        }
    }
};
