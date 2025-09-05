// Ported from TypeScript: Mongoose models and DB connection
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { userJsonSchema } = require('./dto/user/user.schema');
const { sessionTokenJsonSchema } = require('./dto/sessionToken/sessionToken.schema');

const sessionTokenSchema = new mongoose.Schema(sessionTokenJsonSchema);
const sessionTokens = mongoose.model('sessionToken', sessionTokenSchema);

const userSchema = new mongoose.Schema(userJsonSchema);
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
    next();
});
const users = mongoose.model('user', userSchema);

async function connectToDatabase(uri) {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
}

module.exports = {
    connectToDatabase,
    users,
    sessionTokens
};
