// Ported from TypeScript: full login routes
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Authenticator } = require('../models/Authenticator');
const { UuidHelper } = require('../models/UuidHelper');
const { users } = require('../mainDatabase');

const router = express.Router();
router.use(express.json());

const settingsPath = path.resolve(process.cwd(), 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

const passkey = UuidHelper.generateUUID();
if (!(settings.accountCreationMethod === 'GUI' && settings.alsoAllowPostAccountCreation === 'DISABLE')) {
    console.log(`Admin key: ${passkey}`);
} else {
    console.log('POST Method: Disabled');
}

// POST /api/login
router.post('/', async (req, res) => {
    try {
        const auth = new Authenticator();
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            res.status(400).send({ message: 'Username and password are required' });
            return;
        }
        await auth.authenticateByLogin(username, password);
        if (!auth.isAuthorised()) {
            res.status(403).send({ message: 'Invalid username and password combination.' });
            return;
        }
        const sessionToken = auth.getSessionToken();
        if (sessionToken) {
            res.status(200).send({ sessionToken });
        } else {
            res.status(500).send({ message: 'Failed to generate session token.' });
        }
    } catch (err) {
        res.status(500).send({ message: 'Internal server error.' });
    }
});


// Register
router.post('/register', async (req, res) => {
    try {
        if (settings.accountCreationMethod === 'GUI' && settings.alsoAllowPostAccountCreation === 'DISABLE') {
            res.status(400).send({ message: 'This is disabled' });
            return;
        }
        if (settings.accountCreationMethod === 'GUI' && settings.unlimitedUserCreation === false) {
            // Only allow registration if there are no users yet
            const auth = new Authenticator();
            let count;
            if (typeof auth.userCount === 'function') {
                count = await auth.userCount();
            } else {
                count = await users.countDocuments({});
            }
            if (count > 0) {
                res.status(400).send({ message: 'Only one user can register. Registration is closed.' });
                return;
            }
        }
        const auth = new Authenticator();
        const username = req.body.username;
        const password = req.body.password;
        const registerSignupKey = req.body.registerSignupKey;
        if (!username || !password || !registerSignupKey) {
            res.status(400).send({ message: 'Username and password and registerSignupKey are required' });
            return;
        }
        if (registerSignupKey !== passkey) {
            res.status(400).send({ message: 'Wrong registerSignupKey.' });
            return;
        }
        if (await auth.createUser(username, password)) {
            res.status(200).send({ message: 'Account Created.' });
            return;
        } else {
            res.status(400).send({ message: 'User already exists.' });
            return;
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Open registration endpoint for UI login
router.post('/register/ui', async (req, res) => {
    try {
        if (!(settings.accountCreationMethod === 'GUI')) {
            res.status(403).send({ message: 'UI registration is not enabled.' });
            return;
        }
        const username = req.body.username;
        const password = req.body.password;
        const auth = new Authenticator();
        if (settings.unlimitedUserCreation === false) {
            let count;
            if (typeof auth.userCount === 'function') {
                count = await auth.userCount();
            } else {
                count = await users.countDocuments({});
            }
            if (count > 0) {
                res.status(400).send({ message: 'Only one user can register. Registration is closed.' });
                return;
            }
        }
        if (!username || !password) {
            res.status(400).send({ message: 'Username and password are required.' });
            return;
        }
        if (await auth.createUser(username, password)) {
            res.status(200).send({ message: 'Account Created.' });
            return;
        } else {
            res.status(400).send({ message: 'User already exists.' });
            return;
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Validate session token
router.post('/validateToken', async (req, res) => {
    try {
        const username = req.body.username;
        const sessionToken = req.body.sessionToken;
        if (!sessionToken || !username) {
            res.status(400).send({ message: 'Session token and username are required' });
            return;
        }
        const auth = new Authenticator();
        if (typeof auth.authenticateBySessionToken === 'function') {
            const authenticationResponse = await auth.authenticateBySessionToken(username, sessionToken, false);
            if (!authenticationResponse) {
                res.status(403).send({ message: 'Invalid SessionToken and username combination.' });
                return;
            }
            res.status(200).send({ message: 'Login Successfull.' });
        } else {
            res.status(501).send({ message: 'Session token validation not implemented.' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Refresh session token
router.post('/refreshToken', async (req, res) => {
    try {
        const username = req.body.username;
        const refreshToken = req.body.refreshToken;
        if (!refreshToken || !username) {
            res.status(400).send({ message: 'RefreshToken and username are required' });
            return;
        }
        const auth = new Authenticator();
        if (typeof auth.refreshSessionToken === 'function') {
            const authenticationResponse = await auth.refreshSessionToken(username, refreshToken);
            if (!authenticationResponse) {
                res.status(403).send({ message: 'Invalid refreshToken and username combination' });
                return;
            }
            res.status(200).send({ message: 'Token Refreshed Successfully', sessionToken: authenticationResponse.sessionToken, refreshToken: authenticationResponse.refreshToken });
        } else {
            res.status(501).send({ message: 'Refresh token logic not implemented.' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
