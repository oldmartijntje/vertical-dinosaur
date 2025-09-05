// Ported to JavaScript from TypeScript
const sessionTokenSchema = {
    // Define schema fields here
};
// Ported from TypeScript: sessionToken schema
const mongoose = require('mongoose');
const sessionTokenJsonSchema = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        description: "'userId' is required and must be a valid ObjectId",
    },
    expirationDate: {
        type: Date,
        required: true,
        description: "'expirationDate' is required and is a date",
    },
    sessionToken: {
        type: String,
        required: true,
        description: "'sessionToken' is required and is a string",
    },
    refreshToken: {
        type: String,
        required: true,
        description: "'refreshToken' is required and is a string",
    }
};
module.exports = { sessionTokenJsonSchema };
