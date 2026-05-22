import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchForFolders } from '../services/shares.service.js';

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

describe("Folders service - searchForFolders", () => {
  // TEST 1
  test("Should return folders that match the search", () => {
    const result = searchForFolders(mockFolders, "folder");

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
    const result = searchForFolders(mockFolders, "69");

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("id", 2);
    expect(result[0]).toHaveProperty("name", "folder 69");
    expect(result[0]).toHaveProperty("owner", "jeff");
  });

  // TEST 3
  test("Should not be case sensitive", () => {
    const result = searchForFolders(mockFolders, "FOLDER");

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("name", "folder 1");
    expect(result[1]).toHaveProperty("name", "folder 69");
  });

  // TEST 4
  test("Should return all folders if search is empty", () => {
    const result = searchForFolders(mockFolders, "");

    expect(result).toEqual(mockFolders);
  });

  // TEST 5
  test("Should return all folders if search only contains spaces", () => {
    const result = searchForFolders(mockFolders, "   ");

    expect(result).toEqual(mockFolders);
  });

  // TEST 6
  test("Should return an empty array if no folders match", () => {
    const result = searchForFolders(mockFolders, "does-not-exist");

    expect(result).toEqual([]);
  });

  // TEST 7
  test("Should return an empty array if folders list is empty", () => {
    const result = searchForFolders([], "folder");

    expect(result).toEqual([]);
  });

  // TEST 8
  test("Should return an empty array if folders is undefined", () => {
    const result = searchForFolders(undefined, "folder");

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

    const result = searchForFolders(brokenFolders, "folder");

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("id", 1);
    expect(result[0]).toHaveProperty("name", "folder 1");
  });
  // TEST 10
  test("Should return folders matching the search", () => {
    const searchedFolders = searchForFolders(mockFolders, "folder");
  
    const res = {
    folders: searchedFolders 
  };

  expect(res).toHaveProperty("folders");
  expect(res.folders).toHaveLength(2);

  expect(res.folders[0]).toHaveProperty("name", "folder 1");
  expect(res.folders[1]).toHaveProperty("name", "folder 69");
  
});
});
