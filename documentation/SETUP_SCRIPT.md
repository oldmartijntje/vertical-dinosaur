# Setup Script Guide

This document explains the setup script for the diagonal-dinosaur project, including all available options and modes.

## Running the Setup

Run `npm i` in the root folder to install all packages.

Then run `npm run setup` in the root folder. This will guide you through the setup process interactively.

## Setup Modes

When you start the setup, you will be asked:

- **Run advanced setup?**
  - If you choose **No** (default mode), you get a streamlined setup with sensible defaults.
  - If you choose **Yes** (advanced mode), you get extra options for customization.

## Database Connection

You can select your MongoDB connection string:
- Use the default: `mongodb://localhost:27017/DIAGONAL_DINOSAUR`
- Enter a custom URI

Please note that when your database is protected by credentials, that those should be added. `mongodb://<username>:<password>@<ipadress>:<port>/<DATABASE NAME>`. 

## Port Selection

Choose the port for the web application:
- 4200
- 3000
- 4242
- Custom

Thsi is the port that will be used for hosting your website. Your console will always log the website as a clickable link.

## Account Creation Modes

You can choose how users register accounts:

### 1. The POST Method
- The original method.
- No user by default. Register via `/api/login/register` endpoint using the admin key shown in the backend console.

This is a legacy feature and will some day be removed (from the template, you can ofc still backport it). This is because we now have the `Create a default admin account?` question in the setup, so this UI-less option is not needed anymore.

### 2. Modern UI
- Allows user creation through the website's register page.
- You can allow multiple account creations via the UI.
- All users after the first have lower access levels.
- In **advanced setup**, you can choose to also allow the old POST method. In default setup, POST method is disabled. (because the POST method is legacy)

#### UI Account Creation Options
- **Unlimited**: Anyone can register.
- **Single user only**: Only the first user can register.

If you enable `Unlimited`, it means that anyone that is able to reach your webiste can create an account, or in theory infinite accounts. But only the 1st account created will have `#` as accessIdentifier, the other accounts will not have any accessIdentifiers by default.

## Admin Account

After selecting an account creation mode, you will be prompted to create a default admin account. If you only want one account ever, choose Modern UI with single admin.

## Request Logging

By default, every HTTP request is logged to daily log files under `root/logging/{year}/{month}/{day}-{month}-{year}.log`. In advanced setup, you can choose to disable logging.

## Output Files

- `.env`: Contains your MongoDB URI and port.
- `settings.json`: Contains all your chosen settings.

## Example Admin Key Usage
When using the POST method, the backend will print an admin key on startup. Use this key to register users via HTTP POST:

```json
{
    "username":"username",
    "password":"password",
    "registerSignupKey": "<admin-key>"
}
```

## Changing Settings
You can re-run the setup script at any time to change your configuration.
