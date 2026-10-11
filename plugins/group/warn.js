const fs = require('fs');
const path = require('path');

const warnFile = path.join(__dirname, '../../warns.json');
function getWarns() {
    if (!fs.existsSync(warnFile)) fs.writeFileSync(warnFile, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(warnFile, 'utf8'));
}

module.exports = {
    name: 'warn',
    aliases: ['warnings', 'unwarn'],
    category: 'group',
    description: 'Gestion des avertissements des membres',
    async execute(sock, m, args, { isGroup, isUserAdmin, isBotAdmin, langData }) {
        if (!isGroup) return;
        const jid = m.key.remoteJid;
        const body = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').toLowerCase();
        let target = m.message?.extendedTextMessage?.contextInfo?.participant;
        if (!target && args[0]) target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        const warns = getWarns();
        if (!warns[jid]) warns[jid] = {};

        if (body.includes('warnings')) {
            if (!target) target = m.key.participant || jid;
            const count = warns[jid][target] || 0;
            return sock.sendMessage(jid, { text: `⚠️ Avertissements pour @${target.split('@')[0]} : *${count}/3*`, mentions: [target] }, { quoted: m });
        }

        if (!isUserAdmin) return sock.sendMessage(jid, { text: langData.not_admin }, { quoted: m });
        if (!target) return sock.sendMessage(jid, { text: langData.no_target }, { quoted: m });

        if (body.includes('unwarn')) {
            warns[jid][target] = 0;
            fs.writeFileSync(warnFile, JSON.stringify(warns, null, 2));
            return sock.sendMessage(jid, { text: `✅ Avertissements réinitialisés pour @${target.split('@')[0]}.`, mentions: [target] }, { quoted: m });
        }

        const current = (warns[jid][target] || 0) + 1;
        warns[jid][target] = current;
        fs.writeFileSync(warnFile, JSON.stringify(warns, null, 2));

        if (current >= 3) {
            if (isBotAdmin) {
                await sock.sendMessage(jid, { text: `🚨 @${target.split('@')[0]} a atteint 3 avertissements. Expulsion immédiate !`, mentions: [target] });
                await sock.groupParticipantsUpdate(jid, [target], 'remove');
                warns[jid][target] = 0;
                fs.writeFileSync(warnFile, JSON.stringify(warns, null, 2));
            } else {
                await sock.sendMessage(jid, { text: `⚠️ @${target.split('@')[0]} a 3 avertissements mais je ne suis pas admin pour le kick.`, mentions: [target] });
            }
        } else {
            await sock.sendMessage(jid, { text: `⚠️ Attention @${target.split('@')[0]}, avertissement ${current}/3 !`, mentions: [target] });
        }
    }
};
