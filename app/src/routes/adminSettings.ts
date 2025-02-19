import { Router } from 'express';
import mustache from 'mustache';
import fs from 'fs';
import path from 'path';
import { requireLogin, checkUserRole } from '../middlewares/auth';
import { getSetting, setSetting } from '../models/settings';

const adminSettingsTemplate = fs.readFileSync(
  path.join(__dirname, '..', 'templates', 'admin_settings.mustache'),
  'utf-8'
);

const adminSettingsRouter = Router();

adminSettingsRouter.get('/', requireLogin, async (req, res) => {
  if (!checkUserRole(req, 'admin')) {
    return res.status(403).send('Access denied.');
  }
  let setting = await getSetting('allowRegistrations');
  if (setting === null) {
    // Default to true if not set
    setting = 'true';
  }
  const rendered = mustache.render(adminSettingsTemplate, {
    isAllowed: setting === 'true'
  });
  res.send(rendered);
});

adminSettingsRouter.post('/', requireLogin, async (req, res) => {
  if (!checkUserRole(req, 'admin')) {
    return res.status(403).send('Access denied.');
  }
  const { allowRegistrations } = req.body; // expects "true" or "false"
  await setSetting('allowRegistrations', allowRegistrations);
  res.redirect('/admin/settings');
});

export default adminSettingsRouter;
