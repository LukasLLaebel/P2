import { ShareModel } from "../models/share.model.js";

export const createRole = (roleName, usernames, permissions, shareId) => {
  const authData = ShareModel.getAllData();
  const share = authData.shares.find(s => s.id === shareId);

  if (!share) throw new Error("Share not found");

  const maxRoleId = Math.max(...share.roles.map(r => r.id), 0);
  const newRole = {
    id: maxRoleId + 1,
    name: roleName,
    permissions: permissions || []
  };

  share.roles.push(newRole);

  if (usernames && Array.isArray(usernames)) {
    usernames.forEach(username => {
      if (!share.users.includes(username)) {
        share.users.push(username);
      }

      let user = authData.users.find(u => u.username === username);
      let userShare = user.shares.find(s => s.id === shareId);

      if (!userShare) {
        userShare = { id: shareId, name: share.name, roles: [] };
        user.shares.push(userShare);
      }

      if (!userShare.roles.includes(roleName)) {
        userShare.roles.push(roleName);
      }
    });
  }

  ShareModel.saveAllData(authData);
  return newRole;
};

export const getRolesFromFolder = (shareId) => {
  const authData = ShareModel.getAllData();
  return authData.shares.find(share => share.id === shareId)?.roles || [];
};

export const getUsersWithRole = (roleId) => {
  const authData = ShareModel.getAllData();
  return authData.users.filter(user =>
    user.shares.some(share => share.roles.some(role => role === roleId))
  );
};

export const assignRoleToUser = (roleName, username, shareId) => {
  const authData = ShareModel.getAllData();

  const user = authData.users.find(u => u.username === username);
  if (!user) throw new Error("User not found");

  const share = authData.shares.find(s => s.id === shareId);
  if (!share) throw new Error("Share not found");

  const userShare = user.shares.find(s => s.id === shareId);
  if (!userShare) throw new Error("User share not found");

  const role = share.roles.find(r => r.name === roleName);
  if (!role) throw new Error("Role not found");

  userShare.roles.push(role.id);

  ShareModel.saveAllData(authData);
};

export const editRoleName = (oldRoleName, newRoleName, shareId) => {
  const authData = ShareModel.getAllData();

  const share = authData.shares.find(s => s.id === shareId);
  if (!share) throw new Error("Share not found");

  const role = share.roles.find(r => r.name === oldRoleName);
  if (!role) throw new Error("Role not found");

  role.name = newRoleName;
  ShareModel.saveAllData(authData);
};

export const removeRoleFromUser = (roleId, username, shareId) => {
  const authData = ShareModel.getAllData();

  const user = authData.users.find(u => u.username === username);
  if (!user) throw new Error("User not found");

  const share = user.shares.find(s => s.id === shareId);
  if (!share) throw new Error("Share not found");

  share.roles = share.roles.filter(r => Number(r) !== Number(roleId));
  ShareModel.saveAllData(authData);
};

export const deleteRole = (roleId, shareId) => {
  const authData = ShareModel.getAllData();

  const share = authData.shares.find(s => s.id === shareId);
  if (!share) throw new Error("Share not found");

  share.roles = share.roles.filter(r => r.id !== Number(roleId));
  ShareModel.saveAllData(authData);
};
