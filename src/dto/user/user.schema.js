// Ported to JavaScript from TypeScript
// Ported from TypeScript: user schema
const userJsonSchema = {
    username: {
        type: String,
        required: true,
        description: "'name' is required and is a string",
    },
    password: {
        type: String,
        required: true,
        description: "'password' is required and is a string",
    },
    email: {
        type: String,
        required: false,
        description: "'email' is optional and is a string",
    },
    accessIdentifiers: {
        type: [String],
        required: true,
        description: "'accessIdentifiers' is optional and is a list of strings",
    }
};
module.exports = { userJsonSchema };
