import session from 'express-session';
import crypto from 'crypto';

const cookieSecure = process.env.COOKIE_SECURE === 'true';
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

export const sessionMiddleware = [
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: cookieSecure }
    }),
];