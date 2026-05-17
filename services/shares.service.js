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
    return data.users.filter(user =>
      user.shares.some(share => share.id === shareId)
    );
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


/* Fuzzy search for folders using Damerau–Levenshtein distance.
 * Matches folder names against a search query, allowing small typos,
 * transpositions, and partial matches, then returns results sorted by best match.
 *
 * 1 First it validates, 
 * 2 Then set option values,
 * 3 Then computes the allowed match distance and starts scoring folders, 
 *   giving exact substring matches a perfect score and skipping empty names,
 * 4 Then it runs bestDistancetoName  
 * 5 In there the edit distance is computed, returning the best score found.
 * 6 Then it calculates the best fuzzy match distance for each folder name, 
 *   keeps only those within the allowed threshold, 
 *   then sorts results from best match to worst and returns the matching folders.
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

/* The normalize function standardizes folder 
 * names and search queries by converting to lowercase.
 */

function normalize(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* bestDistanceToName computes the edit distance between the query and the folder name, 
 * as well as sliding windows of the folder name to find better matches.
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



/* Computes the Damerau–Levenshtein edit distance between two strings using dynamic programming, 
 * allowing insertions, deletions, substitutions, and optional adjacent character swaps, 
 * while optimizing memory by keeping only the last two DP rows.
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

      const del = prevRow[j] + 1;
      const insert = row[j - 1] + 1;
      const replace = prevRow[j - 1] + cost;

      let best = Math.min(del, insert, replace);

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
