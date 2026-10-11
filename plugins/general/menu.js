const fs = require('fs');
const path = require('path');
const { commands } = require('../../lib/loader');

module.exports = {
    name: 'menu',
    aliases: ['help', 'commands'],
    category: 'general',
    description: 'Affiche le menu complet du bot',
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const configLive = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config.json')));
        
        const mediaUrls = configLive.menuMedia || [];
        const selectedMedia = mediaUrls[Math.floor(Math.random() * mediaUrls.length)];

        // Liste unique des commandes (sans doublon d alias)
        const uniqueCmds = new Set();
        for (const [name, cmd] of commands.entries()) {
            uniqueCmds.add(cmd.name);
        }

        const menuText = `
╭━━〔 *${configLive.botName}* 〕━━╮
┃ 👑 *Owner* : ${configLive.ownerName} (+${configLive.ownerNumber})
┃ ⚡ *Prefix* : [ ${configLive.prefix} ]
┃ 🏷️ *Version* : ${configLive.version}
┃ 📦 *Commandes actives* : ${uniqueCmds.size}
╰━━━━━━━━━━━━━━━━━━╯

┏━━〔 *MENU COMPLET DES COMMANDES* 〕━━❍
│𖥟╾ 👑 *Owner* : .owner .sudo .restart .setprefix .backup .setmenuimage
│𖥟╾ 👥 *Groupe* : .tagall .hidetag .kick .promote .demote .groupinfo .resetlink .left .invite
│𖥟╾ ⬇️ *Download* : .tiktok .play .song .video .spotify .facebook .instagram .mediafire
│𖥟╾ 🤖 *IA* : .ai .chatgpt .gemini .imagine .chatbot
│𖥟╾ 🖼️ *Sticker & Convert* : .sticker .toimage .tovideo .tomp3 .emojimix .removebg
│𖥟╾ 🎮 *Fun & Anime* : .roast .insult .waifu .neko .quotes .fact .flirt
│𖥟╾ 🛠️ *Général* : .menu .ping .alive .runtime .lang .jid .delete
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━❍
> _Tape une commande avec le préfixe [ ${configLive.prefix} ]_
`;

        if (selectedMedia) {
            await sock.sendMessage(jid, {
                image: { url: selectedMedia },
                caption: menuText.trim()
            }, { quoted: m });
        } else {
            await sock.sendMessage(jid, { text: menuText.trim() }, { quoted: m });
        }
    }
};
