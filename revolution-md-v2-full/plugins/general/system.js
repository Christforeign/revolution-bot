const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ping',
    aliases: ['alive', 'runtime', 'test', 'jid', 'delete', 'clearchat'],
    category: 'general',
    description: 'Commandes système',
    async execute(sock, m, args, { langData }) {
        const jid = m.key.remoteJid;
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';

        if (body.includes('alive')) {
            return sock.sendMessage(jid, { text: langData.alive_reply || "Bot 100% opérationnel !" }, { quoted: m });
        }

        if (body.includes('runtime')) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            return sock.sendMessage(jid, { text: `⏱ Temps de fonctionnement : ${hours}h ${minutes}m ${seconds}s` }, { quoted: m });
        }

        if (body.includes('jid')) {
            return sock.sendMessage(jid, { text: `Identifiant JID : ${jid}` }, { quoted: m });
        }

        const start = Date.now();
        const pingMsg = await sock.sendMessage(jid, { text: '...' }, { quoted: m });
        const latency = Date.now() - start;
        const reply = (langData.ping_reply || 'Pong {latency}ms').replace('{latency}', latency);
        await sock.sendMessage(jid, { text: reply }, { quoted: pingMsg });
    }
};
