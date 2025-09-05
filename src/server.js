// Ported from server.ts (TypeScript) to JavaScript
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./mainDatabase');
const loginRouter = require('./controllers/login.routes');
const requestLogger = require('./requestLogger');
const getVersion = require('./getVersion');

dotenv.config();

const { MONGO_URI } = process.env;
if (!MONGO_URI) {
    console.error('No MONGO_URI environment variable has been defined in config.env');
    process.exit(1);
}

async function loadSettings(settingsPath) {
    try {
        const data = await fs.promises.readFile(settingsPath, 'utf8');
        const settings = JSON.parse(data);
        return settings;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Settings file not found: ${settingsPath}`);
        } else if (error instanceof SyntaxError) {
            console.error(`Error decoding JSON from settings file: ${settingsPath}`);
        } else {
            console.error(`Error reading settings file: ${error.message}`);
        }
        return null;
    }
}

async function main() {
    console.log('Loading settings...');
    const settings = await loadSettings('settings.json');
    if (!settings) return;

    await connectToDatabase(MONGO_URI);
    const port = settings.port || 3000;
    const staticHtmlPath = path.join(__dirname, '../docs');
    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    if (settings.logging !== false) {
        app.use(requestLogger);
    }

    app.use(cors());
    app.use('/api/login', loginRouter);
    app.use(express.static(staticHtmlPath));


    // Register all EJS and dashboard routes
    registerPages(app);
    // Ported from TypeScript: registerPages and registerEJS
    function registerPages(app) {
        registerEJS(app, 'pages/index', '/', { title: 'Home' });
        registerEJS(app, 'pages/login', '/login', { title: 'Login' });

        // Custom register route logic
        app.get('/register', async (req, res) => {
            const settings = require('../settings.json');
            const { accountCreationMethod, unlimitedUserCreation } = settings;
            let userCount = 0;
            try {
                const { users } = require('./mainDatabase');
                userCount = await users.countDocuments({});
            } catch (err) {
                userCount = 0;
            }
            if (accountCreationMethod === 'POST') {
                // Show info only, no registration form
                return res.render('pages/register', { mode: 'info', title: 'Register' });
            }
            if (accountCreationMethod === 'GUI' && unlimitedUserCreation === false) {
                if (userCount === 0) {
                    // Show registration form
                    return res.render('pages/register', { mode: 'form', title: 'Register' });
                } else {
                    // Registration closed
                    return res.render('pages/register', { mode: 'closed', title: 'Register' });
                }
            }
            if (accountCreationMethod === 'GUI' && unlimitedUserCreation === true) {
                // Always show registration form
                return res.render('pages/register', { mode: 'form', title: 'Register' });
            }
            // Fallback: info
            return res.render('pages/register', { mode: 'info', title: 'Register' });
        });

        // Redirect /dashboard to /dashboard/home
        app.get('/dashboard', (req, res) => {
            res.redirect('/dashboard/home');
        });

        // Main dashboard shell (EJS)
        app.get(['/dashboard/home', '/dashboard/template', '/dashboard/users'], async (req, res) => {
            const getVersion = require('./getVersion');
            const version = await getVersion();
            res.render('pages/dashboard', { title: 'Dashboard', version });
        });
        registerEJS(app, 'pages/register-success', '/register-success', { title: 'Account Created' });

        // Dashboard tab content routes (for SPA sidebar)
        app.get('/dashboard/home-content', (req, res) => {
            res.render('pages/dashboardHome');
        });
        app.get('/dashboard/template-content', (req, res) => {
            res.render('pages/dashboardTemplate');
        });
        app.get('/dashboard/users-content', (req, res) => {
            res.render('pages/dashboardUsers');
        });
    }

    function registerEJS(app, folderPath, browserPath, options) {
        app.get(browserPath, (req, res) => {
            res.render(folderPath, options);
        });
    }

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}...`);
    });

    app.use((req, res) => {
        res.status(404).render('pages/404', { title: '404 Not Found' });
    });
}

main().catch(error => console.error(error));
