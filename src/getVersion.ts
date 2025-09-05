import fs from 'fs';

export async function getVersion(): Promise<string> {
    try {
        const data = await fs.promises.readFile('version.json', 'utf8');
        const json = JSON.parse(data);
        return json.version || '';
    } catch (err) {
        return '';
    }
}
