require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createOrGetSession, sessions } = require('./lib/sessionManager');
const { loadCommands } = require('./lib/loader');
const { handleIncomingMessage } = require('./handler');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASS || '@#xbot#@';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

loadCommands();

app.get('/christechadmin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.post('/api/pairing', async (req, res) => {
    try {
        const phone = (req.body.phone || '').replace(/[^0-9]/g, '');
        if (!phone) return res.status(400).json({ error: 'Numéro invalide' });

        const configFile = path.join(__dirname, 'config.json');
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

        const sock = await createOrGetSession(phone, config, handleIncomingMessage);

        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(phone);
                    return res.json({ code });
                } catch (err) {
                    return res.status(500).json({ error: 'Impossible de générer le code Baileys' });
                }
            }, 3000);
        } else {
            return res.json({ error: 'Cet appareil est déjà appairé.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur interne' });
    }
});

app.post('/api/admin/post-status', async (req, res) => {
    const pass = req.headers['x-admin-pass'];
    if (pass !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Accès refusé' });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Texte manquant' });

    let sent = 0;
    for (const [phone, sock] of sessions.entries()) {
        try {
            await sock.sendMessage('status@broadcast', { text });
            sent++;
        } catch (e) {}
    }

    res.json({ success: true, message: `Statut posté sur ${sent} session(s) active(s)` });
});

app.get('/api/admin/config', (req, res) => {
    const pass = req.headers['x-admin-pass'];
    if (pass !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Accès refusé' });
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    res.json(config);
});

app.post('/api/admin/config', (req, res) => {
    const pass = req.headers['x-admin-pass'];
    if (pass !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Accès refusé' });

    const currentConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
    const updated = { ...currentConfig, ...req.body };
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(updated, null, 2));

    res.json({ success: true, updated });
});

app.listen(PORT, () => {
    console.log(`[✓] Revolution MD V2 lancé sur http://localhost:${PORT}`);
});
