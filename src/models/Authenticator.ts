import { users, sessionTokens } from "../mainDatabase";
import { UserInterface } from "../dto/user/user.interface";
import { compare } from 'bcrypt';
import * as mongodb from "mongodb";
import { promises } from "dns";
import { UuidHelper } from "./UuidHelper";
import { SessionTokenInterface } from "../dto/sessionToken/sessionToken.interface";

export class Authenticator {
    private sessionToken: SessionTokenInterface | undefined;
    private isAuthenticated: boolean;
    private user: UserInterface | undefined;
    private readonly sessiontokenExpireTime: number = 1; // in hours

    constructor() {
        this.isAuthenticated = false;
    }

    private unAuthorise() {
        this.isAuthenticated = false;
    }

    private authorise() {
        this.isAuthenticated = true;
    }

    public async createUser(username: string, password: string): Promise<boolean> {
        const user = await users.findOne({ username: username }).lean();
        if (user) {
            return false;
        }
        const userCount = await users.countDocuments({});

        // If this is the first user, assign ["#"], else empty list
        const accessIdentifiers = userCount === 0 ? ["#"] : [];

        const newUser = await users.create({
            username: username,
            password: password,
            accessIdentifiers: accessIdentifiers
        });

        return true;
    }

    public async refreshSessionToken(username: string, refreshToken: string): Promise<SessionTokenInterface | undefined> {
        const validRefreshToken = await this.validateRefreshToken(username, refreshToken);
        this.unAuthorise();
        if (validRefreshToken == undefined) {
            return;
        } else {
            const userId = await this.getUserIdBySessionToken(validRefreshToken.sessionToken);
            if (!userId) {
                return;
            }
            const user = await users.findOne({ _id: new mongodb.ObjectId(userId) }).lean();
            if (user) {
                this.sessionToken = await this.getSessionTokenDataByString(validRefreshToken.sessionToken);
                this.user = user;
                return await this.createSessionToken();
            } else {
                return;
            }
        }
    }

    private async getSessionTokenDataByString(sessionTokenString: string): Promise<SessionTokenInterface> {
        const sessionToken = await sessionTokens.findOne({ sessionToken: sessionTokenString }).lean();
        return sessionToken;
    }

    public async authenticateBySessionToken(username: string, sessionTokenString: string, deleteWhenExpired: boolean = true): Promise<boolean> {
        const validSessionToken = await this.validateSessionToken(username, sessionTokenString, deleteWhenExpired);
        if (validSessionToken === false) {
            this.unAuthorise();
            return false;
        }
        const userId = await this.getUserIdBySessionToken(sessionTokenString);
        if (!userId) {
            this.unAuthorise();
            return false;
        }
        const user = await users.findOne({ _id: new mongodb.ObjectId(userId) }).lean();
        if (user) {
            this.sessionToken = await this.getSessionTokenDataByString(sessionTokenString);
            this.user = user;
            this.authorise();
            return true;
        } else {
            this.unAuthorise();
            return false;
        }
    }

    public async authenticateByLogin(username: string, password: string): Promise<boolean> {
        const user = await users.findOne({ username: username }).lean();
        if (!user) {
            this.unAuthorise();
            return false;
        }
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            this.unAuthorise();
            return false;
        }
        this.user = user;
        this.authorise();
        const sessionToken = await this.createSessionToken();
        this.sessionToken = sessionToken;
        return true;
    }

    public isAuthorised() {
        return this.isAuthenticated;
    }

    public getUserData(): UserInterface | undefined {
        if (!this.user) {
            return;
        }
        const user = { ...this.user };
        delete user.password;
        return user;
    }

    public getSessionToken(): SessionTokenInterface | undefined {
        return this.sessionToken;
    }

    private async createSessionToken(): Promise<SessionTokenInterface | undefined> {
        if (!this.user) {
            return;
        }
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + this.sessiontokenExpireTime);
        const oldSessionToken = await sessionTokens.findOne({ userId: this.user._id }).lean();
        if (oldSessionToken) {
            await this.removeAllSessionTokens();
        }
        const token = UuidHelper.generateUUID();
        const refreshToken = UuidHelper.generateUUID();
        const sessionToken = await sessionTokens.create({ userId: this.user._id, expirationDate: expirationDate, sessionToken: token, refreshToken: refreshToken });
        return sessionToken;
    }

    private async validateSessionToken(username: string, sessionToken: string, deleteWhenExpired: boolean): Promise<boolean> {
        const sessionTokenObject = await sessionTokens.findOne({ sessionToken: sessionToken }).lean();
        if (!sessionTokenObject) {
            return false;
        }
        if (sessionTokenObject.expirationDate < new Date()) {
            if (deleteWhenExpired) {
                await this.removeSessionToken(sessionToken);
            }
            return false;
        }
        const user = await users.findOne({ _id: sessionTokenObject.userId }).lean();
        if (!user) {
            return false;
        }
        if (user.username != username) {
            return false;
        }
        return true;
    }

    private async validateRefreshToken(username: string, refreshToken: string): Promise<undefined | SessionTokenInterface> {
        const refreshTokenObject = await sessionTokens.findOne({ refreshToken: refreshToken }).lean();
        if (!refreshTokenObject) {
            return;
        }
        const user = await users.findOne({ _id: refreshTokenObject.userId }).lean();
        if (!user) {
            return;
        }
        if (user.username != username) {
            return;
        }
        return refreshTokenObject;
    }

    private async removeSessionToken(sessionToken: string): Promise<boolean> {
        try {
            const deleteResult = await sessionTokens.deleteOne({ sessionToken: sessionToken });
            return deleteResult.deletedCount === 1;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    private async removeAllSessionTokens(): Promise<boolean> {
        if (!this.user) {
            return false;
        }
        try {
            const deleteResult = await sessionTokens.deleteMany({ userId: this.user._id });
            return deleteResult.deletedCount > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    private async getUserIdBySessionToken(sessionToken: string): Promise<string | undefined> {
        const sessionTokenObject = await sessionTokens.findOne({ sessionToken: sessionToken }).lean();
        if (!sessionTokenObject) {
            return;
        }
        return `${sessionTokenObject.userId}`;
    }
}
