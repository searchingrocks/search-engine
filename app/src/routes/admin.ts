// app/src/routes/admin.ts
import { Router, Request, Response, NextFunction } from 'express';
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
const checkAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!checkUserRole(req, 'admin')) {
    res.status(403).send('Access denied: You do not have admin privileges.');
    return;
  }
  next();
};

// Dashboard route – combines all admin functions into one view.
adminRouter.get('/', requireLogin, checkAdmin, (req: Request, res: Response) => {
  // Optionally, pass additional data (e.g. a button for initiating Solr)
  // For example, your admin.mustache could include a button that posts to /admin/init-solr.
  const rendered = mustache.render(adminDashboardTemplate, {});
  res.send(rendered);
});

// User management routes
adminRouter.get('/users', requireLogin, checkAdmin, async (req: Request, res: Response) => {
  const users = await getAllUsers();
  const rendered = mustache.render(adminUsersTemplate, { 
    users, 
    usersJSON: JSON.stringify(users)
  });
  res.send(rendered);
});

adminRouter.post('/users/:id/changePassword', requireLogin, checkAdmin, async (req: Request, res: Response) => {
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

adminRouter.post('/users/:id/delete', requireLogin, checkAdmin, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  await deleteUserById(userId);
  res.redirect('/admin/users');
});

// Settings routes
adminRouter.get('/settings', requireLogin, checkAdmin, async (req: Request, res: Response) => {
  let setting = await getSetting('allowRegistrations');
  if (setting === null) {
    setting = 'true'; // default value if not set
  }
  const rendered = mustache.render(adminSettingsTemplate, { isAllowed: setting === 'true' });
  res.send(rendered);
});

adminRouter.post('/settings', requireLogin, checkAdmin, async (req: Request, res: Response) => {
  const { allowRegistrations } = req.body; // expects "true" or "false"
  await setSetting('allowRegistrations', allowRegistrations);
  res.redirect('/admin/settings');
});

// *******************************
// New route: Initiate Solr Database
// *******************************
adminRouter.post('/init-solr', requireLogin, checkAdmin, async (req: Request, res: Response) => {
  try {
    // 1. Create collection for data
    const createCollectionResponse = await axios.get("http://127.0.0.1:8983/solr/admin/collections", {
      params: {
        action: "CREATE",
        name: "BigData",
        numShards: 8,
        replicationFactor: 3,
        wt: "json"
      }
    });

    // 2. Disable schemaless mode
    const disableSchemaResponse = await axios.post("http://127.0.0.1:8983/solr/BigData/config", {
      "set-user-property": { "update.autoCreateFields": "false" }
    });

    // 3. Add schema fields
    const schemaRequests = [
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"accuracy_radius","type":"pint"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"address","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","name":"asn","type":"pint","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"asnOrg","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"autoBody","type":"string"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"autoClass","type":"string"}},
      {"add-field":{"stored":"true","indexed":"true","name":"autoMake","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"autoModel","type":"string"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"autoYear","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"birthYear","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"birthMonth","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"birthday","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"city","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","name":"continent","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","name":"country","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"dob","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","name":"domain","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","name":"emails","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"true","name":"ethnicity","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"firstName","type":"text_general","uninvertible":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"middleName","type":"text_general","uninvertible":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"gender","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"false","name":"income","type":"string"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"true","name":"ips","type":"string","multiValued":"true","omitNorms":"true","omitTermFreqAndPositions":"true","sortMissingLast":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"lastName","type":"text_general","uninvertible":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"true","name":"latLong","type":"location","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"false","uninvertible":"false","name":"line","type":"string"}},
      {"add-field":{"stored":"true","indexed":"false","uninvertible":"false","name":"links","type":"string","multiValued":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"true","name":"location","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"false","uninvertible":"false","name":"notes","type":"string","multiValued":"true"}},
      {"add-field":{"stored":"true","indexed":"false","uninvertible":"false","name":"party","type":"string","multiValued":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"passwords","type":"string","multiValued":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"phoneNumbers","type":"text_general"}},
      {"add-field":{"stored":"true","indexed":"false","uninvertible":"false","name":"photos","type":"string","multiValued":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"source","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","uninvertible":"false","name":"state","type":"string","docValues":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"usernames","type":"text_general","uninvertible":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"vin","type":"text_general","uninvertible":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"zipCode","type":"string","uninvertible":"true"}},
      {"add-field":{"stored":"true","indexed":"true","name":"VRN","type":"text_general","uninvertible":"true"}},
      {"add-field":{"name":"ssn","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"licenseNumber","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"debitNumber","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"debitExpiration","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"debitPin","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"creditNumber","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"creditExpiration","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"creditPin","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"passportNumber","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"militaryID","type":"string","stored":"true","indexed":"true"}},
      {"add-field":{"name":"bankAccountNumbers","type":"string","stored":"true","indexed":"true","multiValued":"true"}},
      {"add-field":{"name":"schoolsAttended","type":"string","stored":"true","indexed":"true","multiValued":"true"}},
      {"add-field":{"name":"certifications","type":"string","stored":"true","indexed":"true","multiValued":"true"}},
      {"add-field":{"name":"politicalAffiliation","type":"string","stored":"true","indexed":"true"}}
    ];
    
    // Iterate through the schema requests sequentially.
    for (const fieldPayload of schemaRequests) {
      await axios.post('http://127.0.0.1:8983/solr/BigData/schema?wt=json', fieldPayload, {
        headers: { 'Accept': 'application/json' }
      });
    }
    
    res.json({ message: 'Solr database initiated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to initiate Solr database', error: error.toString() });
  }
});

export default adminRouter;
