const axios = require('axios');

module.exports = {
    name: 'weather',
    category: 'misc',
    description: 'Affiche la météo en direct pour une ville',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const city = args.join(' ') || 'Port-au-Prince';
        try {
            const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%w+%h`);
            const reply = `🌤️ *Météo pour ${city.toUpperCase()}* :\nCondition : ${res.data}`;
            await sock.sendMessage(jid, { text: reply }, { quoted: m });
        } catch (e) {
            await sock.sendMessage(jid, { text: `Impossible de trouver la météo pour : ${city}` }, { quoted: m });
        }
    }
};
