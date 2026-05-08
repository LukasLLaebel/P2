import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharesRouter from '../routes/shares.routes.js';

import { mockSignedIn, MockDB } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new MockDB(
  ['Lukas', 'Jeff', 'Nadia'],
  ['read', 'write', 'delete'],
  ['Folder 1'],
  []
);

db.initialize();

db.setShareOwner('Folder 1', 'Lukas');

db.assignUserToShare('Jeff', 'Folder 1');

const mockAuthData = db.getData();





describe('Shares Router - POST /useradd', () => {
  let app;
  let testDBPath;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // <-- simulate logged-in user for all /roles routes
    app.use('/shares', mockSignedIn({ id: 1, username: 'Lukas' }), sharesRouter);

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
  // TEST 11
  test('Should successfully add a user to a share', async () => {
    const shareData = {
      username: 'Nadia',
      shareId: 1
    };

    const response = await request(app)
      .post('/shares/useradd')
      .send(shareData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('share');

    expect(response.body.share).toHaveProperty('id');
    expect(response.body.share).toHaveProperty('name');
    expect(response.body.share).toHaveProperty('roles');

    expect(response.body.share.roles).toEqual([]);

    const updatedAuthData = JSON.parse(fs.readFileSync(testDBPath, 'utf-8'));
    const nadiaUser = updatedAuthData.users.find(u => u.username === 'Nadia');
    const nadiaShares = nadiaUser.shares;
    expect(nadiaShares.find(s => s.id === shareData.shareId)).toBeDefined();
  });

  // TEST 12
  test('Should respond with 404 if share does not exist', async () => {
    const shareData = {
      username: 'Nadia',
      shareId: 69420
    };

    const response = await request(app)
      .post('/shares/useradd')
      .send(shareData)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');

    expect(response.body.message).toBe('Share not found');
  });

  // TEST 13
  test('Should respond with 404 if user does not exist', async () => {
    const shareData = {
      username: 'NonExistentUser',
      shareId: 1
    };

    const response = await request(app)
      .post('/shares/useradd')
      .send(shareData)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');

    expect(response.body.message).toBe('User not found');
  });

  // TEST 13
  test('Should respond with 404 if user does not exist', async () => {
    const shareData = {
      username: 'NonExistentUser',
      shareId: 1
    };

    const response = await request(app)
      .post('/shares/useradd')
      .send(shareData)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');

    expect(response.body.message).toBe('User not found');
  });

  // TEST 14
  test('Should respond with 400 if user already has this share', async () => {
    const shareData = {
      username: 'Jeff',
      shareId: 1
    };

    const response = await request(app)
      .post('/shares/useradd')
      .send(shareData)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');

    expect(response.body.message).toBe('User already has this share');
  });
});

describe('Shares Router - POST /userrem', () => {
  let app;
  let testDBPath;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // <-- simulate logged-in user for all /roles routes
    app.use('/shares', mockSignedIn({ id: 1, username: 'Lukas' }), sharesRouter);

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
  // TEST 15
  test('Should successfully remove a user from a share', async () => {
    const shareData = {
      username: 'Nadia',
      shareId: 1
    };

    const response = await request(app)
      .post('/shares/userrem')
      .send(shareData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('share');

    expect(response.body.share).toHaveProperty('id');
    expect(response.body.share).toHaveProperty('name');
    expect(response.body.share).toHaveProperty('roles');

    expect(response.body.share.id).toEqual(shareData.shareId);

    const updatedAuthData = JSON.parse(fs.readFileSync(testDBPath, 'utf-8'));
    const nadiaUser = updatedAuthData.users.find(u => u.username === 'Nadia');
    const nadiaShares = nadiaUser.shares;
    expect(nadiaShares.find(s => s.id === shareData.shareId)).toBeUndefined();
  });

  // TEST 16
  test('Should respond with 404 if share does not exist', async () => {
    const shareData = {
      username: 'Nadia',
      shareId: 69420
    };

    const response = await request(app)
      .post('/shares/userrem')
      .send(shareData)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');

    expect(response.body.message).toBe('Share not found');
  });

  // TEST 17
  test('Should respond with 404 if user does not exist', async () => {
    const shareData = {
      username: 'NonExistentUser',
      shareId: 1
    };

    const response = await request(app)
      .post('/shares/userrem')
      .send(shareData)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');

    expect(response.body.message).toBe('User not found');
  });
});
