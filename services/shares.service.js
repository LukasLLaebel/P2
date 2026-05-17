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


/* Search function using 
 *
 *
 */


export function searchForFolders(folders, searchtext, options = {}) {
  if (!folders || folders.length === 0) return [];
  if (!searchtext || searchtext.trim() === "") return folders;

  const query = normalize(searchtext);

  const allowtransposition =
    options.allowTransposition !== undefined
      ? options.allowTransposition
      : true;

  const maxdistance =
    options.maxDistance !== undefined ? options.maxDistance : null;

  const maxdistanceratio =
    options.maxDistanceRatio !== undefined
      ? options.maxDistanceRatio
      : 0.4;

  const computedmaxdistance =
    maxdistance !== null
      ? maxdistance
      : Math.max(1, Math.round(query.length * maxdistanceratio));

  const scored = [];

  for (const folder of folders) {
    const name = normalize((folder && folder.name) || "");
    if (!name) continue;

    if (name.includes(query)) {
      scored.push({ folder, score: 0 });
      continue;
    }

    const best = bestdistancetoname(query, name, allowtransposition);

    if (best <= computedmaxdistance) {
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

function bestdistancetoname(query, name, allowtransposition) {
  let best = editdistance(query, name, allowtransposition);

  const qlen = query.length;
  const minlen = Math.max(1, qlen - 2);
  const maxlen = Math.min(name.length, qlen + 2);

  for (let winlen = minlen; winlen <= maxlen; winlen++) {
    if (name.length < winlen) continue;

    for (let i = 0; i <= name.length - winlen; i++) {
      const window = name.slice(i, i + winlen);
      const d = editdistance(query, window, allowtransposition);

      if (d < best) best = d;
      if (best === 0) return 0;
    }
  }

  return best;
}

function editdistance(a, b, allowtransposition) {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  let prevprevrow = null;
  let prevrow = new Array(n + 1);
  let row = new Array(n + 1);

  for (let j = 0; j <= n; j++) prevrow[j] = j;

  for (let i = 1; i <= m; i++) {
    row[0] = i;

    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      const del = prevrow[j] + 1;
      const ins = row[j - 1] + 1;
      const sub = prevrow[j - 1] + cost;

      let best = Math.min(del, ins, sub);

      if (
        allowtransposition &&
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1] &&
        prevprevrow
      ) {
        best = Math.min(best, prevprevrow[j - 2] + 1);
      }

      row[j] = best;
    }

    prevprevrow = prevrow;
    prevrow = row;
    row = new Array(n + 1);
  }

  return prevrow[n];
}
