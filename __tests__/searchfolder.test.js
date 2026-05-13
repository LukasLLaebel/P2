import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchFolders } from '../services/users.service';

// Mock folder data for testing
const mockFolders = [
  {
    id: 1,
    name: "folder 1",
    owner: "lukas",
    roles: []
  },
  {
    id: 2,
    name: "folder 69",
    owner: "jeff",
    roles: []
  },
  {
    id: 3,
    name: "naima",
    owner: "naima",
    roles: []
  },
  {
    id: 4,
    name: "hej",
    owner: "naima",
    roles: []
  }
];

describe("Folders service - searchFolders", () => {
  // TEST 1
  test("Should return folders that match the search", () => {
    const result = searchFolders(mockFolders, "folder");

    expect(result).toHaveLength(2);

    expect(result[0]).toHaveProperty("id", 1);
    expect(result[0]).toHaveProperty("name", "folder 1");
    expect(result[0]).toHaveProperty("owner", "lukas");

    expect(result[1]).toHaveProperty("id", 2);
    expect(result[1]).toHaveProperty("name", "folder 69");
    expect(result[1]).toHaveProperty("owner", "jeff");
  });

  // TEST 2
  test("Should return one folder when search matches one folder", () => {
    const result = searchFolders(mockFolders, "69");

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("id", 2);
    expect(result[0]).toHaveProperty("name", "folder 69");
    expect(result[0]).toHaveProperty("owner", "jeff");
  });

  // TEST 3
  test("Should not be case sensitive", () => {
    const result = searchFolders(mockFolders, "FOLDER");

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("name", "folder 1");
    expect(result[1]).toHaveProperty("name", "folder 69");
  });

  // TEST 4
  test("Should return all folders if search is empty", () => {
    const result = searchFolders(mockFolders, "");

    expect(result).toEqual(mockFolders);
  });

  // TEST 5
  test("Should return all folders if search only contains spaces", () => {
    const result = searchFolders(mockFolders, "   ");

    expect(result).toEqual(mockFolders);
  });

  // TEST 6
  test("Should return an empty array if no folders match", () => {
    const result = searchFolders(mockFolders, "does-not-exist");

    expect(result).toEqual([]);
  });

  // TEST 7
  test("Should return an empty array if folders list is empty", () => {
    const result = searchFolders([], "folder");

    expect(result).toEqual([]);
  });

  // TEST 8
  test("Should return an empty array if folders is undefined", () => {
    const result = searchFolders(undefined, "folder");

    expect(result).toEqual([]);
  });

  // TEST 9
  test("Should not crash if a folder does not have a name", () => {
    const brokenFolders = [
      {
        id: 1,
        name: "folder 1",
        owner: "lukas"
      },
      {
        id: 2,
        owner: "jeff"
      }
    ];

    const result = searchFolders(brokenFolders, "folder");

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("id", 1);
    expect(result[0]).toHaveProperty("name", "folder 1");
  });
});