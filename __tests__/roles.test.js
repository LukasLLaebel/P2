import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rolesRouter from '../routes/roles.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a mock auth.json for testing
const mockAuthData = {
  users: [
    {
      id: 1,
      username: 'Lukas',
      shares: [
        {
          id: 1,
          name: 'Folder 1',
          roles: []
        }
      ]
    },
    {
      id: 2,
      username: 'Jeff',
      shares: [
        {
          id: 1,
          name: 'Folder 1',
          roles: []
        }
      ]
    }
  ],
  permissions: [
    { id: 1, name: 'read' },
    { id: 2, name: 'write' },
    { id: 3, name: 'delete' }
  ],
  shares: [
    {
      id: 1,
      name: 'Folder 1',
      path: './home/lukas/Folder 1',
      owner: 'Lukas',
      users: ['Lukas', 'Jeff'],
      files: [],
      roles: []
    }
  ]
};
function mockSignedIn(user = { id: 1, username: 'Lukas' }) {
  return (req, res, next) => {
    // If your code expects req.user:
    req.user = user;

    // If your code expects req.session.user:
    req.session = req.session || {};
    req.session.user = user;

    // If your code expects something else (example):
    req.isAuthenticated = () => true;

    next();
  };
}

describe('Roles Router - POST /create', () => {
  let app;
  let testDBPath;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // <-- simulate logged-in user for all /roles routes
    app.use('/roles', mockSignedIn({ id: 1, username: 'Lukas' }), rolesRouter);

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

  // TEST 2
  test('should assign selected users to the role', async () => {
    const roleData = {
      role: 'moderator',
      users: ['Lukas'],
      permission: ['read', 'delete'],
      folder: 1
    };

    await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(200);

    const updatedAuthData = JSON.parse(fs.readFileSync(testDBPath, 'utf-8'));

    const lukasUser = updatedAuthData.users.find(u => u.username === 'Lukas');
    const lukasShareRoles = lukasUser.shares[0].roles;

    expect(lukasShareRoles).toContain('moderator');
  });

  // TEST 3
  test('should fail when assigning a non-existent user', async () => {
    const roleData = {
      role: 'viewer',
      users: ['NonExistentUser'],
      permission: ['read'],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Error creating role');
  });

  // TEST 4
  test('should fail if role name is missing or empty', async () => {
    const roleData = {
      users: ['Lukas'],
      permission: ['read'],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Role name cannot be empty');
  });

  // TEST 5
  test('should handle missing users array gracefully', async () => {
    const roleData = {
      role: 'test-role',
      permission: ['read'],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.role.name).toBe('test-role');
  });

  // TEST 6
  test('should auto-increment role ID correctly', async () => {
    const roleData1 = {
      role: 'role1',
      users: ['Lukas'],
      permission: ['read'],
      folder: 1
    };

    const roleData2 = {
      role: 'role2',
      users: ['Jeff'],
      permission: ['write'],
      folder: 1
    };

    const response1 = await request(app)
      .post('/roles/create')
      .send(roleData1)
      .expect(200);

    const response2 = await request(app)
      .post('/roles/create')
      .send(roleData2)
      .expect(200);

    expect(response1.body.role.id).toBe(1);
    expect(response2.body.role.id).toBe(2);
    expect(response2.body.role.id).toBeGreaterThan(response1.body.role.id);
  });

  // TEST 7
  test('should return 404 if share does not exist', async () => {

    const modifiedData = JSON.parse(JSON.stringify(mockAuthData));
    modifiedData.shares = [];
    fs.writeFileSync(testDBPath, JSON.stringify(modifiedData, null, 2));

    const roleData = {
      role: 'orphan-role',
      users: ['Lukas'],
      permission: ['read'],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Share not found');
  });

  // TEST 8
  test('should create role with empty permissions array', async () => {
    const roleData = {
      role: 'no-perms-role',
      users: ['Lukas'],
      permission: [],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.role.permissions).toEqual([]);
  });

  // TEST 9
  test('should add users to the share users list', async () => {
    const roleData = {
      role: 'new-role',
      users: ['Lukas'],
      permission: ['read'],
      folder: 1
    };

    await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(200);

    const updatedAuthData = JSON.parse(fs.readFileSync(testDBPath, 'utf-8'));
    const share = updatedAuthData.shares.find(s => s.id === 1);

    const lukasCount = share.users.filter(u => u === 'Lukas').length;
    expect(lukasCount).toBe(1);
  });

  // TEST 10
  test('should store multiple permissions correctly', async () => {
    const roleData = {
      role: 'powerful-role',
      users: ['Jeff'],
      permission: ['read', 'write', 'delete'],
      folder: 1
    };

    const response = await request(app)
      .post('/roles/create')
      .send(roleData)
      .expect(200);

    expect(response.body.role.permissions).toHaveLength(3);
    expect(response.body.role.permissions).toContain('read');
    expect(response.body.role.permissions).toContain('write');
    expect(response.body.role.permissions).toContain('delete');
  });
});
