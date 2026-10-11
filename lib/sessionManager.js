const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');

const sessions = new Map();
const userLanguages = new Map();

function getSessionPath(sessionId) {
    const dir = path.join(__dirname, '../sessions', sessionId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

async function createOrGetSession(sessionId, config, onMessageCallback) {
    if (sessions.has(sessionId)) return sessions.get(sessionId);

    const sessionDir = getSessionPath(sessionId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    const msgRetryCounterCache = new NodeCache();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        msgRetryCounterCache,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                createOrGetSession(sessionId, config, onMessageCallback);
            } else {
                sessions.delete(sessionId);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const m of messages) {
            // Lecture automatique des statuts & Auto-React
            if (m.key.remoteJid === 'status@broadcast') {
                try {
                    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json')));
                    if (cfg.autoStatusView) {
                        await sock.readMessages([m.key]);
                    }
                    if (cfg.autoStatusReact && cfg.statusReactEmojis?.length) {
                        const randomEmoji = cfg.statusReactEmojis[Math.floor(Math.random() * cfg.statusReactEmojis.length)];
                        await sock.sendMessage('status@broadcast', {
                            react: { text: randomEmoji, key: m.key }
                        }, { statusJidList: [m.key.participant] });
                    }
                } catch (e) {}
                continue;
            }

            if (onMessageCallback) {
                await onMessageCallback(sock, m, userLanguages);
            }
        }
    });

    sessions.set(sessionId, sock);
    return sock;
}

module.exports = {
    createOrGetSession,
    sessions,
    userLanguages
};
