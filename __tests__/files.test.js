import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import filesRouter from '../routes/files.routes.js';

import { mockSignedIn, MockDB } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const db = new MockDB(
  ['Lukas', 'Jeff', 'Nadia', 'Laura'],
  ['read', 'write', 'delete'],
  ['Folder 1', 'Folder 2', 'Folder 3', 'Folder 4'],
  ['admin', 'member']
);

db.initialize();

db.assignPermissionsToRole('admin', ['read', 'write', 'delete', 'share', 'comment']);
db.assignPermissionsToRole('member', ['read', 'write']);

db.setShareOwner('Folder 1', 'Lukas');
db.setShareOwner('Folder 2', 'Lukas');
db.setShareOwner('Folder 3', 'Lukas');
db.setShareOwner('Folder 4', 'Jeff');

db.assignRoleToShare('Folder 2', 'admin');
db.assignRoleToShare('Folder 2', 'member');

db.assignUserToShare('Jeff', 'Folder 1');
db.assignUserToShare('Jeff', 'Folder 2', [2]);
db.assignUserToShare('Laura', 'Folder 1', [2]);

// if needed remove user here we remove jeff
const folder2 = db.shares.find(s => s.name === 'Folder 2');
folder2.users = folder2.users.filter(u => u !== 'Jeff');

const mockAuthData = db.getData();

describe('Files Router - POST /create', () => {
  let app;
  let testDBPath;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // simulate logged-in user for all /roles routes
    app.use('/roles', mockSignedIn({ id: 1, username: 'Lukas' }), filesRouter);

    testDBPath = path.join(__dirname, '../db/auth.json');
    const backupPath = path.join(__dirname, '../db/auth.backup.json');

    if (fs.existsSync(testDBPath)) fs.copyFileSync(testDBPath, backupPath);
    fs.writeFileSync(testDBPath, JSON.stringify(mockAuthData, null, 2));
  });

  afterEach(() => {
    const realDBPath = path.join(__dirname, '../db/auth.json');
    const backupPath = path.join(__dirname, '../db/auth.backup.json');

    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, realDBPath);
      fs.unlinkSync(backupPath);
    }
  });

  // TEST 1 
  test('should create a role successfully with valid users and permissions', async () => {
    const roleData = {
      role: 'editor',
      users: ['Lukas', 'Jeff'],
      permission: ['read', 'write'],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('role');

    expect(response.body.role).toHaveProperty('id');
    expect(response.body.role).toHaveProperty('name', 'editor');
    expect(response.body.role).toHaveProperty('permissions');
    expect(response.body.role.permissions).toEqual(['read', 'write']);

    const updatedAuthData = JSON.parse(fs.readFileSync(testDBPath, 'utf-8'));
    const share = updatedAuthData.shares.find(s => s.id === 1);
    expect(share.roles.length).toBeGreaterThan(0);
    expect(share.roles).toContainEqual(
      expect.objectContaining({ name: 'editor' })
    );
  });
});