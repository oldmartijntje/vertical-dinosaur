// Ported from TypeScript: full authentication logic
const { users, sessionTokens } = require('../mainDatabase');
const bcrypt = require('bcrypt');
const { UuidHelper } = require('./UuidHelper');

class Authenticator {
    constructor() {
        this.sessionToken = undefined;
        this.isAuthenticated = false;
        this.user = undefined;
        this.sessiontokenExpireTime = 1; // in hours
    }

    unAuthorise() {
        this.isAuthenticated = false;
    }

    authorise() {
        this.isAuthenticated = true;
    }

    async createUser(username, password) {
        const user = await users.findOne({ username }).lean();
        if (user) {
            return false;
        }
        const userCount = await users.countDocuments({});
        const accessIdentifiers = userCount === 0 ? ['#'] : [];
        await users.create({
            username,
            password,
            accessIdentifiers
        });
        return true;
    }

    async authenticateByLogin(username, password) {
        const user = await users.findOne({ username });
        if (!user) {
            this.unAuthorise();
            return;
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            this.unAuthorise();
            return;
        }
        this.user = user;
        this.authorise();
        // Generate session token
        const sessionToken = UuidHelper.generateUUID();
        const expirationDate = new Date(Date.now() + this.sessiontokenExpireTime * 60 * 60 * 1000);
        await sessionTokens.create({
            userId: user._id,
            expirationDate,
            sessionToken,
            refreshToken: UuidHelper.generateUUID()
        });
        this.sessionToken = sessionToken;
    }

    isAuthorised() {
        return this.isAuthenticated;
    }

    getSessionToken() {
        return this.sessionToken;
    }
}

module.exports = { Authenticator };
