const fs = require('fs');
const path = require('path');

const commands = new Map();

function loadCommands(dir = path.join(__dirname, '../plugins')) {
    commands.clear();
    if (!fs.existsSync(dir)) return commands;

    function scan(subDir) {
        const files = fs.readdirSync(subDir);
        for (const file of files) {
            const fullPath = path.join(subDir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (file.endsWith('.js')) {
                delete require.cache[require.resolve(fullPath)];
                try {
                    const cmd = require(fullPath);
                    if (cmd && cmd.name) {
                        commands.set(cmd.name.toLowerCase(), cmd);
                        if (cmd.aliases && Array.isArray(cmd.aliases)) {
                            for (const a of cmd.aliases) {
                                commands.set(a.toLowerCase(), cmd);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Erreur chargement ${file}:`, err.message);
                }
            }
        }
    }

    scan(dir);
    return commands;
}

module.exports = { commands, loadCommands };
