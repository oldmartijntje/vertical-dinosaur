import * as mongodb from "mongodb";

export interface SessionTokenInterface {
    _id?: mongodb.ObjectId;
    userId: mongodb.ObjectId;
    expirationDate: Date;
    sessionToken: string;
    refreshToken: string;
}