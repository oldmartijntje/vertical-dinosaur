import { Schema } from "mongoose";

export const sessionTokenJsonSchema = {
    userId: {
        type: Schema.Types.ObjectId,
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