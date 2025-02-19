// In app/src/routes/admin.ts
import { Router } from 'express';
import mustache from 'mustache';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { requireLogin, checkUserRole } from '../middlewares/auth';
import { getAllUsers, updateUserPasswordById, deleteUserById } from '../models/usersDB';

const adminUsersTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'admin_users.mustache'), 'utf-8');

const adminRouter = Router();

// List all users for management
adminRouter.get('/users', requireLogin, async (req, res) => {
  if (!checkUserRole(req, 'admin')) {
    return res.status(403).send('Access denied: You do not have admin privileges.');
  }
  const users = await getAllUsers();
  const rendered = mustache.render(adminUsersTemplate, { users });
  res.send(rendered);
});

// Change a user's password (form submission)
adminRouter.post('/users/:id/changePassword', requireLogin, async (req, res) => {
  if (!checkUserRole(req, 'admin')) {
    return res.status(403).send('Access denied.');
  }
  const userId = parseInt(req.params.id, 10);
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).send('New password is required.');
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await updateUserPasswordById(userId, hashedPassword);
  res.redirect('/admin/users');
});

// Delete a user
adminRouter.post('/users/:id/delete', requireLogin, async (req, res) => {
  if (!checkUserRole(req, 'admin')) {
    return res.status(403).send('Access denied.');
  }
  const userId = parseInt(req.params.id, 10);
  await deleteUserById(userId);
  res.redirect('/admin/users');
});

export default adminRouter;
