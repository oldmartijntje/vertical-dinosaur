# diagonal-dinosaur
NodeTS EJS Mongodb webapp Template📋

This requires you either one of the followig:
- You run mongodb locally
- You have mongodb self hosted
- you are using the "mongodb as a service" option: [atlas](https://www.mongodb.com/products/platform/atlas-database)

## Setup

Run `npm i` in the root folder, this installs all packages.

Then run `npm run setup` in that root folder. To learn more about the setup process and all available options, read [the setup documentation here](./documentation/SETUP_SCRIPT.md).

## Request Logging

By default, this application logs every incoming HTTP request (including IP, cookies, and headers) to daily log files under `root/logging/{year}/{month}/{day}.log`. You can disable this feature by running the setup in advanced mode and choosing to turn off logging.

## Running

run `npm run start` to start the backend. The console will give you the port the front-end is on. This port can be changed via the `settings.json`

## Account AccessIdentifiers

An account accessIdentifier defines rules what a user can access and what it can not access.
Think of it like a clearance level, a user with level 2 can access more than a user with level 1.

But this system can have problems in some cases. 
When you want to give your family and friends access to your website, but your friends should only be allowed to visit friends "stuff", 
and family should only access family photos. This problem can't be solves with clearance levels.
This is why we use accessIdentifiers: everyone with the accessIdentifier `friend` can visit page X, and everyone else cannot.

By default, everything can be looked up with the accessIdentifier `#`, which is not registerable. 
This will only be granted to the first user to sign up.
