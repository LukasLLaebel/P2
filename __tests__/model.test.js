import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ShareModel } from '../models/share.model.js';
import { MockDB } from './utils.js';
import e from 'express';

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

const mockAuthData = db.getData();

describe('Shares Model - Functions', () => {
  beforeEach(() => {
    const testDBPath = path.join(__dirname, '../db/auth.json');
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

  test('getAllData should read the auth.json database and return the parsed object', () => {
    const data = ShareModel.getAllData();

    expect(data).toBeDefined();
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('shares');
    expect(data).toHaveProperty('permissions');
    expect(data.shares).toEqual([
      expect.objectContaining({ id: 1, name: 'Folder 1' }),
      expect.objectContaining({ id: 2, name: 'Folder 2' })
    ]);
    expect(data.users).toEqual([
      expect.objectContaining({ id: 1, username: 'Lukas' }),
      expect.objectContaining({ id: 2, username: 'Jeff' }),
      expect.objectContaining({ id: 3, username: 'Nadia' })
    ]);
    expect(data.permissions).toEqual([
      expect.objectContaining({ id: 1, name: 'read' }),
      expect.objectContaining({ id: 2, name: 'write' }),
      expect.objectContaining({ id: 3, name: 'delete' })
    ]);
  });

  test('findShareById should return the correct share when it exists', () => {
    const share = ShareModel.findShareById(1);

    expect(share).toBeDefined();
    expect(share).toHaveProperty('id', 1);
    expect(share).toHaveProperty('name', 'Folder 1');
    expect(share).toHaveProperty('users');
    expect(share.users).toEqual(['Lukas', 'Jeff']);
    expect(share).toHaveProperty('files');
    expect(share.files).toEqual(['file1.txt', 'file2.txt']);
    expect(share).toHaveProperty('roles');
    expect(share.roles).toEqual([]);
    expect(share).toHaveProperty('owner');
    expect(share.owner).toEqual('Lukas');
    expect(share).toHaveProperty('path');
    expect(share.path).toEqual('./home/lukas/Folder 1');
  });

  test('findShareById should return undefined for a non-existent share id', () => {
    const share = ShareModel.findShareById(69420);
    expect(share).toBeUndefined();
  });

  test('saveAllData should store changed data in auth.json', () => {
    const originalData = ShareModel.getAllData();
    const updatedData = originalData;

    const newShare = {
      id: 3,
      name: 'Folder 3',
      owner: 'Lukas',
      users: ['Lukas'],
      files: [],
      roles: [],
      path: './home/lukas/Folder 3'
    };

    updatedData.shares.push(newShare);

    ShareModel.saveAllData(updatedData);

    const cahngedData = ShareModel.getAllData();
    expect(cahngedData.shares).toHaveLength(3);
    expect(cahngedData.shares).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 3, name: 'Folder 3' })])
    );
  });
});
