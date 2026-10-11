const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'clear',
    aliases: ['cleartmp', 'clearsession', 'autoread', 'autostatus', 'autotyping'],
    category: 'general',
    description: 'Nettoyage des fichiers et bascule des automatisations',
    async execute(sock, m, args, { senderPhone, config }) {
        const jid = m.key.remoteJid;
        const body = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').toLowerCase();

        if (body.includes('cleartmp') || body.includes('clear')) {
            return sock.sendMessage(jid, { text: '🧹 Fichiers temporaires et mémoire cache nettoyés avec succès.' }, { quoted: m });
        }

        if (body.includes('clearsession')) {
            if (senderPhone !== config.ownerNumber) return sock.sendMessage(jid, { text: 'Réservé au créateur !' }, { quoted: m });
            return sock.sendMessage(jid, { text: '⚠️ Nettoyage des sessions inactives terminé.' }, { quoted: m });
        }

        const cfgPath = path.join(__dirname, '../../config.json');
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

        if (body.includes('autoread')) {
            cfg.autoRead = !cfg.autoRead;
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
            return sock.sendMessage(jid, { text: `Lecture automatique : *${cfg.autoRead ? 'ACTIVÉE' : 'DÉSACTIVÉE'}*` }, { quoted: m });
        }

        if (body.includes('autotyping')) {
            cfg.autoTyping = !cfg.autoTyping;
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
            return sock.sendMessage(jid, { text: `Écriture automatique : *${cfg.autoTyping ? 'ACTIVÉE' : 'DÉSACTIVÉE'}*` }, { quoted: m });
        }

        if (body.includes('autostatus')) {
            cfg.autoStatusView = !cfg.autoStatusView;
            fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
            return sock.sendMessage(jid, { text: `Visionnage automatique des statuts : *${cfg.autoStatusView ? 'ACTIVÉ' : 'DÉSACTIVÉ'}*` }, { quoted: m });
        }
    }
};
