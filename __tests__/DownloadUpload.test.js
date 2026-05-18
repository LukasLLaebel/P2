import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import filesRouter from '../routes/files.routes.js';

import { mockSignedIn, MockDB } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prepares mock database
const db = new MockDB(
    ['Lukas', 'Jeff'],
    ['read', 'edit', 'comment', 'share'],
    ['folder 1'],
    ['admin', 'guest']
  );

db.initialize();
db.setShareOwner('folder 1', 'Lukas');

db.assignPermissionsToRole('admin', ['read', 'edit', 'comment', 'share']);
db.assignPermissionsToRole('guest', []);

db.assignRoleToShare('folder 1', 'admin');
db.assignRoleToShare('folder 1', 'guest');

db.assignUserToShare('Lukas', 'folder 1', ['admin']);
db.assignUserToShare('Jeff', 'folder 1', ['guest']);

const mockAuthData = db.getData();

// Creates file setup
function createTestFile() {
    const sharesPath = path.join(process.cwd(), 'shares');
    const folderPath = path.join(sharesPath, 'Lukas', 'folder 1');
    fs.mkdirSync(folderPath, { recursive: true });
    const filePath = path.join(folderPath, 'file1.txt');
    fs.writeFileSync(filePath, 'Test content');
}
// Prepares a test-server (express app) with mock logged-in user and file routes
function setupApp(user) {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/files', mockSignedIn(user),filesRouter);
    return app;
};

describe('Files - Download permissions', () => {
    let testDBPath;

    beforeEach(() => {
        // Creates backup of db and replaces it with mock db
        testDBPath = path.join(__dirname, '../db/auth.json');
        const backupPath = path.join(__dirname, '../db/auth.backup.json');
        if (fs.existsSync(testDBPath)) fs.copyFileSync(testDBPath, backupPath);
        fs.writeFileSync(testDBPath, JSON.stringify(mockAuthData, null, 2));
    });

    afterEach(() => {
        // Restores auth.json and removes mock db
        const realDBPath = path.join(__dirname, '../db/auth.json');
        const backupPath = path.join(__dirname, '../db/auth.backup.json');

        if(fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, realDBPath);
            fs.unlinkSync(backupPath);
        }
    });

    // Test 1 - Download
    test('Should successfully download a file when user has role with read permission', async () => {
        // Arrange: Uses helper functions
        createTestFile();
        const app = setupApp({ id: 1, username: 'Lukas'});

        // Act: Attempts download
        const response = await request(app).get('/files/download/1/file1.txt')

        // Assert: Success 
        expect(response.status).toBe(200);
        expect(response.header['content-disposition']).toContain('attachment');
        expect(response.header['content-disposition']).toContain('file1.txt');
    });

    // Test 2 - Download
    test('Should deny a user without required permission to download', async () => {
        // Arrange
        createTestFile();
        const app = setupApp({ id: 2, username: 'Jeff' });

        // Act
        const response = await request(app).get('/files/download/1/file1.txt')
        
        // Assert: Forbidden 
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe('Current role does not have required permission');
    });

    // Test 3 - Download
    test('Should return 404 when file does not exist', async () => {
        // Arrange
        const app = setupApp({ id: 1, username: 'Lukas' });

        // Act
        const response = await request(app).get('/files/download/1/nonexistent.txt');

        // Assert
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe('File not found');
    });

    // Test 1 - Upload
    test('Should successfully upload a file when user has role with edit permission', async () => {
        // Arrange:
        createTestFile();
        const app = setupApp({ id: 1, username: 'Lukas' });

        // Act: Attempts to upload file using formData
        const response = await request(app)
            .post('/files/upload')
            .field('shareId', 1)
            .field('oldFileName', 'success.txt')
            .attach('file', Buffer.from('Upload success'), 'success.txt');

        // Assert: Success 
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.message).toBe('File uploaded successfully');
        expect(response.body.file).toBe('success.txt');
    });

    // Test 2 - Upload 
    test('Should deny a user without required permission to upload', async () => {
        // Arrange:
        const app = setupApp({ id: 2, username: 'Jeff'});

        // Act: Attempts to upload file using formData
        const response = await request(app)
            .post('/files/upload')
            .field('shareId', 1)
            .field('oldFileName', 'forbidden.txt')
            .attach('file', Buffer.from('Upload forbidden'), 'forbidden.txt');

        // Assert: Forbidden 
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe('Current role does not have required permission');
    });

    // Test 3 - Upload
    test('Should return 400 when no file is uploaded', async () => {
        // Arrange
        const app = setupApp({ id: 1, username: 'Lukas' });

        // Act
        const response = await request(app)
            .post('/files/upload')
            .field('shareId', 1)
            .field('oldFileName', 'missing.txt');

        // Assert 
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.message).toBe('No file uploaded');
    })
});
