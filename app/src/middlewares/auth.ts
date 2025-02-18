import { Request, Response, NextFunction } from 'express';

export function requireLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

export function checkUserRole(req: Request, roleToCheck: string): boolean {
    return req.session?.user?.role === roleToCheck || false;
}
