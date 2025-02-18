import { Router } from 'express';
import fs from 'fs';
import mustache from 'mustache';
import { requireLogin, checkUserRole } from '../middlewares/auth';

const adminTemplate = fs.readFileSync(__dirname + '/../templates/admin.mustache', 'utf-8');


const adminRouter = Router();

adminRouter.get('/', requireLogin, (req, res) => {
    if (checkUserRole(req, 'admin')) {
        const rendered = mustache.render(adminTemplate, {
            message: "Welcome to the Admin Dashboard",
        });
        res.send(rendered);
    } else {
        res.status(403).send("Access denied: You do not have admin privileges.");
    }
});

export default adminRouter;
