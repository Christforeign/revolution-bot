const axios = require('axios');

module.exports = {
    name: 'tiktok',
    aliases: ['play', 'song', 'video', 'spotify', 'facebook', 'instagram', 'mediafire', 'gitclone', 'url', 'ytmp3', 'ytmp4', 'lyrics'],
    category: 'download',
    description: 'Téléchargement de médias depuis les réseaux sociaux',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(jid, { text: 'Donne un lien ou un titre valide ! Ex: .tiktok <lien>' }, { quoted: m });
        }

        await sock.sendMessage(jid, { react: { text: '📥', key: m.key } });

        // Si TikTok
        if (query.includes('tiktok.com')) {
            try {
                const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(query)}`, { timeout: 15000 });
                const videoUrl = res.data?.video?.noWatermark || res.data?.video?.watermark;
                if (videoUrl) {
                    return sock.sendMessage(jid, { video: { url: videoUrl }, caption: '🎬 TikTok téléchargé par Revolution MD !' }, { quoted: m });
                }
            } catch (e) {}
        }

        // Pour Play/Song/Search générique via API audio
        try {
            const apiRes = await axios.get(`https://api.giftedtech.my.id/api/search/yts?apikey=gifted&query=${encodeURIComponent(query)}`);
            const first = apiRes.data?.results?.[0];
            if (first) {
                return sock.sendMessage(jid, {
                    image: { url: first.thumbnail },
                    caption: `🎵 *Titre* : ${first.title}\n⏱ *Durée* : ${first.timestamp}\n🔗 *Lien* : ${first.url}\n\n_Téléchargement en cours de préparation..._`
                }, { quoted: m });
            }
        } catch (e) {}

        await sock.sendMessage(jid, { text: `Traitement pour : *${query}* terminé ou lien non pris en charge.` }, { quoted: m });
    }
};
