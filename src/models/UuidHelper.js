// Ported to JavaScript from TypeScript
const { v4: uuidv4 } = require('uuid');
class UuidHelper {
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
module.exports = UuidHelper;
module.exports = { UuidHelper };
