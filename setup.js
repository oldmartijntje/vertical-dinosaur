

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import bcrypt from 'bcrypt';

const DEFAULT_URI = 'mongodb://localhost:27017/DIAGONAL_DINOSAUR';


async function promptDatabase() {
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'uriChoice',
            message: 'Select Mongo connection string:',
            choices: [
                { name: `Use default (${DEFAULT_URI})`, value: 'default' },
                { name: 'Enter custom URI…', value: 'custom' }
            ]
        },
        {
            type: 'input',
            name: 'mongoUri',
            message: 'Enter Mongo URI:',
            when: answers => answers.uriChoice === 'custom',
            default: DEFAULT_URI
        }
    ]);
    return answers.uriChoice === 'default' ? DEFAULT_URI : answers.mongoUri;
}

async function promptPort() {
    const { portChoice } = await inquirer.prompt([{
        type: 'list',
        name: 'portChoice',
        message: 'Select port for web application:',
        choices: ['4200', '3000', '4242', 'custom'],
    }]);
    if (portChoice === 'custom') {
        const { customPort } = await inquirer.prompt([{
            type: 'input',
            name: 'customPort',
            message: 'Enter custom port:',
            default: '4242',
            validate: input => {
                const num = parseInt(input, 10);
                return !isNaN(num) && num > 0 ? true : 'Please enter a valid port number';
            }
        }]);
        return customPort;
    }
    return portChoice;
}

async function promptAccountCreation() {
    const { accountCreation } = await inquirer.prompt([{
        type: 'list',
        name: 'accountCreation',
        message: 'Select mode for account creation:',
        choices: ['POST Method', 'Modern UI'],
    }]);
    let alsoAllowPost = null;
    let unlimitedUserCreation = true;
    const isAdvanced = global.__ADVANCED_SETUP__ === true;
    if (accountCreation === 'Modern UI') {
        if (isAdvanced) {
            const { uiAccountCreation } = await inquirer.prompt([{
                type: 'list',
                name: 'uiAccountCreation',
                message: 'Allow the (old) POST method for account creation as well?',
                choices: ['ALLOW', 'DISABLE'],
                default: 'DISABLE'
            }]);
            alsoAllowPost = uiAccountCreation;
        } else {
            alsoAllowPost = 'DISABLE';
        }

        const { unlimited } = await inquirer.prompt([{
            type: 'list',
            name: 'unlimited',
            message: 'How many users can sign up through the UI?',
            choices: [
                { name: 'Unlimited (anyone can register)', value: true },
                { name: 'Single user only (only the first user can register)', value: false }
            ]
        }]);
        unlimitedUserCreation = unlimited;
    }
    return { accountCreation, alsoAllowPost, unlimitedUserCreation };
}

async function promptAdminAccount() {
    const { createAdmin } = await inquirer.prompt([{
        type: 'confirm',
        name: 'createAdmin',
        message: 'Create a default admin account?',
        default: true,
    }]);
    if (!createAdmin) return null;
    const admin = await inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Admin username:',
            default: 'admin',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Admin password:',
            mask: '*',
            validate: input => input.length >= 6 ? true : 'Password must be at least 6 characters',
        }
    ]);
    admin.hashedPassword = await bcrypt.hash(admin.password, 10);
    delete admin.password;
    return admin;
}


// Email config removed

async function main() {
    try {
        // Ask for advanced setup
        const { advanced } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'advanced',
                message: 'Run advanced setup?',
                default: false
            }
        ]);

        // Pass advanced mode to promptAccountCreation
        global.__ADVANCED_SETUP__ = advanced;

        const finalUri = await promptDatabase();
        console.log('→ Final URI:', finalUri);
        const finalPort = await promptPort();
        const accountSettings = await promptAccountCreation();
        const adminAccount = await promptAdminAccount();

        // .env
        let envContent = `MONGO_URI=${finalUri}\nPORT=${finalPort}\n`;
        fs.writeFileSync(path.resolve(process.cwd(), '.env'), envContent);
        console.log('.env file created');

        // Insert admin into DB if requested
        if (adminAccount) {
            // Dynamically import mongoose and define schema inline
            const mongoose = (await import('mongoose')).default;
            const userJsonSchema = {
                username: { type: String, required: true },
                password: { type: String, required: true },
                email: { type: String, required: false },
                accessIdentifiers: { type: [String], required: true }
            };
            const userSchema = new mongoose.Schema(userJsonSchema);
            const User = mongoose.model('user', userSchema);
            await mongoose.connect(finalUri);
            const userCount = await User.countDocuments({});
            const accessIdentifiers = userCount === 0 ? ['#'] : [];
            const exists = await User.findOne({ username: adminAccount.username });
            if (exists) {
                console.log(`Admin user '${adminAccount.username}' already exists in database.`);
            } else {
                await User.create({
                    username: adminAccount.username,
                    password: adminAccount.hashedPassword,
                    accessIdentifiers
                });
                console.log(`Admin user '${adminAccount.username}' created in database.`);
            }
            await mongoose.disconnect();
        }

        // settings.json
        let logging = true;
        if (advanced) {
            const { enableLogging } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'enableLogging',
                    message: 'Enable request logging?',
                    default: true
                }
            ]);
            logging = enableLogging;
        }
        const settings = {
            port: parseInt(finalPort, 10),
            accountCreationMethod: accountSettings.accountCreation === 'POST Method' ? 'POST' : 'GUI',
            alsoAllowPostAccountCreation: accountSettings.alsoAllowPost ?? null,
            unlimitedUserCreation: accountSettings.unlimitedUserCreation ?? true,
            logging
        };
        fs.writeFileSync(
            path.resolve(process.cwd(), 'settings.json'),
            JSON.stringify(settings, null, 2)
        );
        console.log('settings.json file created');
    } catch (err) {
        console.error('Error during setup:', err);
        process.exit(1);
    }
}

main();
