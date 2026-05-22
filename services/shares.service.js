import { ShareModel } from "../models/share.model.js";

export const SharesService = {
  getAllShareFiles: (username) => {
    const data = ShareModel.getAllData();
    const user = data.users.find(u => u.username === username);
    if (!user) throw new Error("User not found");
    return user.shares.map(s => ({ name: s.name, id: s.id, owner: s.owner }));
  },

  getUsersByShareId: (shareId) => {
    const data = ShareModel.getAllData();

    const users = data.users.filter(user => user.shares.some(share => share.id === shareId));
    if (users.length === 0) throw new Error("This share has no users or does not exist");

    return users;
  },

  getFolderOwner: (shareId) => {
    const data = ShareModel.getAllData();
    
    const share = data.shares.find(s => s.id === shareId);
    if (!share) throw new Error("Share not found");

    const owner = data.users.find(user => user.username === share.owner);
    if (!owner) throw new Error("Owner not found");
    
    return owner;
  },

  addUserToShare: (username, shareId) => {
    const data = ShareModel.getAllData();

    const share = data.shares.find(s => s.id === shareId);
    if (!share) throw new Error("Share not found");

    const user = data.users.find(u => u.username === username);
    if (!user) throw new Error("User not found");

    // Keeps going until finds share (iterative)
    if (user.shares.some(s => s.id === shareId)) {
      throw new Error("User already has this share");
    }

    const newShared = {
      id: shareId,
      name: share.name,
      owner: share.owner,
      roles: []
    };

    user.shares.push(newShared);
    share.users.push(username);
    ShareModel.saveAllData(data);

    return newShared;
  },

  removeUserFromShare: (username, shareId) => {
    const data = ShareModel.getAllData();

    const share = data.shares.find(s => s.id === shareId);
    if (!share) throw new Error("Share not found");

    const user = data.users.find(u => u.username === username);
    if (!user) throw new Error("User not found");

    user.shares = user.shares.filter(s => s.id !== shareId);
    share.users = share.users.filter(u => u !== username);
    ShareModel.saveAllData(data);

    return share;
  }
};


/*
 * Fuzzy search for folders using normalized string matching plus an
 * edit-distance score (Optimal String Alignment variant of Damerau–Levenshtein).
 *
 * Behavior:
 * - Normalizes both query and folder names (lowercase, remove punctuation, collapse spaces).
 * - If the query is an exact substring of the name => perfect score (0).
 * - Otherwise computes the best edit distance between the query and:
 *   (a) the whole name, and
 *   (b) sliding substrings (“windows”) of the name near the query length.
 * - Keeps only matches whose best score is <= the allowed threshold.
 * - Sorts by score ascending (best match first).
 *
 * Options:
 * - allowTransposition (default: true): counts adjacent character swaps as one edit (e.g. "form" <-> "from").
 * - maxDistance: absolute edit distance threshold. If set, overrides maxDistanceRatio.
 * - maxDistanceRatio (default: 0.4): distance threshold relative to query length.
 */

export function searchForFolders(folders, searchtext, options = {}) {
  if (!folders || folders.length === 0) return [];
  if (!searchtext || searchtext.trim() === "") return folders;

  const query = normalize(searchtext);

  const allowTransposition =
    options.allowTransposition !== undefined
      ? options.allowTransposition
      : true;

  const maxDistance =
    options.maxDistance !== undefined ? options.maxDistance : null;

  const maxDistanceRatio =
    options.maxDistanceRatio !== undefined
      ? options.maxDistanceRatio
      : 0.4;

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

/**
 * Normalizes a string for fuzzy matching:
 * - lowercase
 * - replace non-alphanumeric runs with spaces
 * - collapse whitespace
 */

function normalize(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/**
 * Returns the smallest edit distance between the query and the folder name.
 * In addition to comparing against the full name, it also compares the query
 * against sliding substrings of the name (window lengths near the query length).
 * This improves matching when the folder name contains the “best matching part”
 * as only a segment of a longer name.
 */

function bestDistanceToName(query, name, allowTransposition) {
  let best = editDistance(query, name, allowTransposition);

  const queryLen = query.length;
  const minLen = Math.max(1, queryLen - 2);
  const maxLen = Math.min(name.length, queryLen + 2);

  for (let windowLen = minLen; windowLen <= maxLen; windowLen++) {
    if (name.length < windowLen) continue;

    for (let i = 0; i <= name.length - windowLen; i++) {
      const window = name.slice(i, i + windowLen);
      const distance = editDistance(query, window, allowTransposition);

      if (distance < best) best = distance;
      if (best === 0) return 0;
    }
  }

  return best;
}




/**
 * Computes the edit distance between strings a and b using dynamic programming.
 * Operations:
 * - insertion, deletion, substitution
 * - optional adjacent transposition (Optimal String Alignment variant)
 * Space optimization:
 * - keeps only the current row, previous row, and the row before that
 *   (required for transposition), rather than the full matrix.
 */

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

      const deletion = prevRow[j] + 1;
      const insert = row[j - 1] + 1;
      const substitution = prevRow[j - 1] + cost;

      let best = Math.min(deletion, insert, substitution);

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
