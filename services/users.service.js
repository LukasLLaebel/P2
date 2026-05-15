import { ShareModel } from "../models/share.model.js";

import fs from "fs";
import path from "path";

export const getAllUsers = async () => {
  const data = ShareModel.getAllData();
  return data.users.map(({ username }) => username);
}

export async function syncUserFolders(req, res, next) {
  try {
    const sharesPath = path.join(process.cwd(), 'shares');

    await fs.promises.mkdir(sharesPath, { recursive: true });

    const usernames = await getAllUsers();

    for (const username of usernames) {
      const userFolderPath = path.join(sharesPath, username);
      await fs.promises.mkdir(userFolderPath, { recursive: true });
    }

    next();
  } catch (error) {
    console.error('Error syncing user folders:', error);
    res.status(500).json({ error: 'Failed to sync user folders' });
  }
}

export function searchFolders(folders, searchText, options = {}) {
  if (!folders || folders.length === 0) return [];
  if (!searchText || searchText.trim() === "") return folders;

  const query = normalize(searchText);
  const allowTransposition =
    options.allowTransposition !== undefined ? options.allowTransposition : true;

  const maxDistance =
    options.maxDistance !== undefined ? options.maxDistance : null;

  const maxDistanceRatio =
    options.maxDistanceRatio !== undefined ? options.maxDistanceRatio : 0.4;

  const computedMaxDistance =
    maxDistance !== null
      ? maxDistance
      : Math.max(1, Math.round(query.length * maxDistanceRatio));

  const scored = [];

  for (const folder of folders) {
    const name = normalize((folder && folder.name) || "");
    if (!name) continue;

    if (name.includes(query)) {
      scored.push({ folder, score: 0 });
      continue;
    }

    const best = bestDistanceToName(query, name, allowTransposition);

    if (best <= computedMaxDistance) {
      scored.push({ folder, score: best });
    }
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.map((x) => x.folder);
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bestDistanceToName(query, name, allowTransposition) {
  let best = editDistance(query, name, allowTransposition);

  const qLen = query.length;
  const minLen = Math.max(1, qLen - 2);
  const maxLen = Math.min(name.length, qLen + 2);

  for (let winLen = minLen; winLen <= maxLen; winLen++) {
    if (name.length < winLen) continue;

    for (let i = 0; i <= name.length - winLen; i++) {
      const window = name.slice(i, i + winLen);
      const d = editDistance(query, window, allowTransposition);
      if (d < best) best = d;
      if (best === 0) return 0;
    }
  }

  return best;
}

function editDistance(a, b, allowTransposition) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevPrevRow = null;
  let prevRow = new Array(n + 1);
  let row = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    row[0] = i;

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      const del = prevRow[j] + 1;
      const ins = row[j - 1] + 1;
      const sub = prevRow[j - 1] + cost;

      let best = Math.min(del, ins, sub);

      if (
        allowTransposition &&
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1] &&
        prevPrevRow
      ) {
        best = Math.min(best, prevPrevRow[j - 2] + 1);
      }

      row[j] = best;
    }

    prevPrevRow = prevRow;
    prevRow = row;
    row = new Array(n + 1);
  }

  return prevRow[n];
}







/*
export function searchFolders(folders, searchText) {
  if (!folders || folders.length === 0) {
    return [];
  }

  if (!searchText || searchText.trim() === "") {
    return folders;
  }

  const query = searchText.toLowerCase().trim();

  return folders.filter((folder) => {
    return folder.name?.toLowerCase().includes(query);
  });
}

*/
