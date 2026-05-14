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
  ['Lukas', 'Jeff', 'Nadia'],
  ['read', 'write', 'delete'],
  ['Folder 1', 'Folder 2'],
  []
);

db.initialize();

db.setShareOwner('Folder 1', 'Lukas');
db.assignUserToShare('Jeff', 'Folder 1');
db.assignFileToShare('Folder 1', 'file1.txt');
db.assignFileToShare('Folder 1', 'file2.txt');

// if needed remove user here we remove jeff
const folder2 = db.shares.find(s => s.name === 'Folder 2');
folder2.users = folder2.users.filter(u => u !== 'Jeff');

const mockAuthData = db.getData();

describe('Files Router - GET /getAllFiles', () => {
  let app;
  let testDBPath;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // simulate logged-in user for all /roles routes
    app.use('/files', mockSignedIn({ id: 1, username: 'Lukas' }), filesRouter);

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
  test('should successfully get all files from a folder', async () => {

    const response = await request(app)
      .get('/files/getAllFiles/1')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('files');

    expect(response.body.files.length).toBe(2);
    expect(response.body.files).toEqual(['file1.txt', 'file2.txt']);
  });

  test('should successfully return no files if folder is empty', async () => {

    const response = await request(app)
      .get('/files/getAllFiles/2')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('files');

    expect(response.body.files.length).toBe(0);
    expect(response.body.files).toEqual([]);
  });

  test('should fail if folder does not exist', async () => {

    const response = await request(app)
      .get('/files/getAllFiles/69420')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body).not.toHaveProperty('files');
    expect(response.body.message).toBe('Folder not found');
  });
});

describe('Files Router - GET /getFolder', () => {
  let app;
  let testDBPath;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // simulate logged-in user for all /roles routes
    app.use('/files', mockSignedIn({ id: 1, username: 'Lukas' }), filesRouter);

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
  test('should successfully get a folder by id', async () => {

    const response = await request(app)
      .get('/files/getFolder/1')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('folder');

    expect(response.body.folder.name).toBe('Folder 1');
    expect(response.body.folder.owner).toBe('Lukas');
    expect(response.body.folder.files).toEqual(['file1.txt', 'file2.txt']);
    expect(response.body.folder.users).toEqual(['Lukas', 'Jeff']);
    expect(response.body.folder.roles).toEqual([]);
    expect(response.body.folder.id).toBe(1);
    expect(response.body.folder.path).toBe('./home/lukas/Folder 1');
  });

  test('should fail if folder does not exist', async () => {

    const response = await request(app)
      .get('/files/getFolder/69420')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body).not.toHaveProperty('folder');
    expect(response.body.message).toBe('Folder not found');
  });
});