// Ported from TypeScript: async version file reader
const fs = require('fs');

async function getVersion() {
    try {
        const data = await fs.promises.readFile('version.json', 'utf8');
        const json = JSON.parse(data);
        return json.version || '';
    } catch (err) {
        return '';
    }
}

module.exports = getVersion;
