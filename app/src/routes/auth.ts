// src/routes/auth.ts
import { Router } from 'express';
import mustache from 'mustache';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getAllUsers } from '../models/usersDB';
import { getUserByUsername, updateUserPassword, createUser } from '../models/usersDB';

const loginTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'login.mustache'), 'utf-8');
const changePasswordTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'changePassword.mustache'), 'utf-8');
const registerTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'register.mustache'), 'utf-8');

const authRouter = Router();

// Read allow registrations setting from environment variables
const allowRegistrations = process.env.ALLOW_REGISTRATIONS === 'true';


authRouter.get('/login', async (req, res) => {
    const rendered = mustache.render(loginTemplate, { error: null });
    return res.send(rendered);
});

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (!user) {
        const rendered = mustache.render(loginTemplate, { error: 'Invalid username or password' });
        return res.send(rendered);
    }

    try {
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            req.session!.user = { id: user.id, username: user.username, role: user.role };
            return res.redirect('/');
        } else {
            const rendered = mustache.render(loginTemplate, { error: 'Invalid username or password' });
            return res.send(rendered);
        }
    } catch (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal Server Error');
    }
});

// Register Page GET
authRouter.get('/register', async (req, res) => {
    if (!allowRegistrations) {
        return res.status(403).send('Registrations are currently disabled.');
    }

    const rendered = mustache.render(registerTemplate, { error: null });
    return res.send(rendered);
});

authRouter.post('/register', async (req, res) => {
    if (!allowRegistrations) {
      return res.status(403).send('Registrations are currently disabled.');
    }
  
    const { username, password } = req.body;
  
    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      const rendered = mustache.render(registerTemplate, { error: "Username already taken." });
      return res.send(rendered);
    }
  
    // Check if there are any users in the database
    const allUsers = await getAllUsers();
    // If no users exist, this is the first user. Make them admin.
    const role = allUsers.length === 0 ? 'admin' : 'user';
  
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    try {
      const newUser = await createUser(username, hashedPassword, role);
      req.session!.user = { id: newUser.id, username: newUser.username, role: newUser.role };
      return res.redirect('/');
    } catch (err) {
      console.error('Error creating user:', err);
      const rendered = mustache.render(registerTemplate, { error: "Error creating user. Please try again." });
      return res.send(rendered);
    }
  });

authRouter.get('/changepassword', async (req, res) => {
    const rendered = mustache.render(changePasswordTemplate, { error: null });
    return res.send(rendered);
});

authRouter.post('/changepassword', async (req, res) => {
    if (!req.session?.user) {
        return res.redirect('/login');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        const rendered = mustache.render(changePasswordTemplate, { error: "New passwords do not match." });
        return res.send(rendered);
    }

    const user = await getUserByUsername(req.session.user.username);
    if (!user) {
        return res.status(404).send("User not found.");
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        const rendered = mustache.render(changePasswordTemplate, { error: "Current password is incorrect." });
        return res.send(rendered);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await updateUserPassword(user.username, hashedPassword);

    res.send("Password successfully changed.");
});

authRouter.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session during logout:', err);
            return res.status(500).send('Failed to log out.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

export default authRouter;
