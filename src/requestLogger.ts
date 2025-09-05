import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const LOG_ROOT = path.join(process.cwd(), 'logging');

function pad(n: number) {
    return n < 10 ? '0' + n : n;
}

function getLogFilePath(): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = pad(now.getMonth() + 1).toString();
    const day = pad(now.getDate()).toString();
    const dir = path.join(LOG_ROOT, year, month);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, `${day}-${month}-${year}.log`);
}

function logRequest(req: Request): string {
    const now = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cookies = req.headers.cookie || '';
    const headers = JSON.stringify(req.headers);
    return `${now} | ${req.method} ${req.originalUrl} | IP: ${ip} | Cookies: ${cookies} | Headers: ${headers}\n`;
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const logLine = logRequest(req);
    const logFile = getLogFilePath();
    fs.appendFile(logFile, logLine, err => {
        if (err) {
            // Optionally log to console if file write fails
            console.error('Failed to write log:', err);
        }
    });
    next();
}
