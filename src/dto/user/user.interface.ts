import * as mongodb from "mongodb";

export interface UserInterface {
    _id?: mongodb.ObjectId;
    username: string;
    password: string;
    email?: string;
    accessIdentifiers: string[];
}