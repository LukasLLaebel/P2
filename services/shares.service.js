import { ShareModel } from "../models/share.model.js";

export const SharesService = {
  getAllShareFiles: () => {
    const data = ShareModel.getAllData();
    return data.shares.map(u => ({ name: u.name, id: u.id }));
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

    return data.users.find(user => user.username === share.owner);
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
      roles: []
    };

    user.shares.push(newShared);
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
    ShareModel.saveAllData(data);

    return share;
  }
};
