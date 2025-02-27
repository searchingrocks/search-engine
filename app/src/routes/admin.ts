// app/src/routes/admin.ts
import { Router } from 'express';
import mustache from 'mustache';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import axios from 'axios';
import { requireLogin, checkUserRole } from '../middlewares/auth';
import { getAllUsers, updateUserPasswordById, deleteUserById } from '../models/usersDB';
import { getSetting, setSetting } from '../models/settings';

const upload = multer({ dest: 'uploads/' });

// Load templates
const adminDashboardTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'admin.mustache'),
  'utf-8'
);
const adminUsersTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'admin_users.mustache'),
  'utf-8'
);
const adminSettingsTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'admin_settings.mustache'),
  'utf-8'
);

const adminRouter = Router();

// Helper middleware to ensure the user is an admin.
const checkAdmin = (req, res, next) => {
  if (!checkUserRole(req, 'admin')) {
    return res.status(403).send('Access denied: You do not have admin privileges.');
  }
  next();
};

// Dashboard route – combines all admin functions into one view.
adminRouter.get('/', requireLogin, checkAdmin, (req, res) => {
  const rendered = mustache.render(adminDashboardTemplate, {});
  res.send(rendered);
});

// User management routes
adminRouter.get('/users', requireLogin, checkAdmin, async (req, res) => {
  const users = await getAllUsers();
  const rendered = mustache.render(adminUsersTemplate, { 
    users, 
    usersJSON: JSON.stringify(users)
  });
  res.send(rendered);
});

adminRouter.post('/users/:id/changePassword', requireLogin, checkAdmin, async (req, res) => {
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

adminRouter.post('/users/:id/delete', requireLogin, checkAdmin, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  await deleteUserById(userId);
  res.redirect('/admin/users');
});

// Settings routes
adminRouter.get('/settings', requireLogin, checkAdmin, async (req, res) => {
  let setting = await getSetting('allowRegistrations');
  if (setting === null) {
    setting = 'true'; // default value if not set
  }
  const rendered = mustache.render(adminSettingsTemplate, { isAllowed: setting === 'true' });
  res.send(rendered);
});

adminRouter.post('/settings', requireLogin, checkAdmin, async (req, res) => {
  const { allowRegistrations } = req.body; // expects "true" or "false"
  await setSetting('allowRegistrations', allowRegistrations);
  res.redirect('/admin/settings');
});

// ***** New Upload Routes *****

// GET route to display the data upload form
adminRouter.get('/upload-data', requireLogin, checkAdmin, (req, res) => {
  const uploadTemplate = fs.readFileSync(
    path.join(__dirname, '..', 'templates', 'admin_upload.mustache'),
    'utf-8'
  );
  const rendered = mustache.render(uploadTemplate, {});
  res.send(rendered);
});

// POST route to handle the file upload and send data to Solr
adminRouter.post('/upload-data', requireLogin, checkAdmin, upload.single('datafile'), async (req, res) => {
  try {
    // Read the uploaded file
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Assume the file contains newline-delimited JSON (one JSON document per line)
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    const docs = lines.map(line => JSON.parse(line));
    
    // POST the array of documents to Solr's update endpoint.
    const solrUrl = 'http://127.0.0.1:8983/solr/BigData/update?commit=true';
    const solrResponse = await axios.post(solrUrl, docs, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Remove the temporary uploaded file
    fs.unlinkSync(filePath);
    
    res.json({ message: 'Data uploaded successfully', solrResponse: solrResponse.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Data upload failed' });
  }
});

export default adminRouter;
