export function mockSignedIn(user = { id: 1, username: 'Lukas' }) {
  return (req, res, next) => {
    req.user = user;

    req.session = req.session || {};
    req.session.user = user;

    req.isAuthenticated = () => true;

    next();
  };
}



export class MockDB {
  constructor(customUsers, customPermissions, customShares, customRoles) {
    this.userNames = customUsers || ['Lukas', 'Jeff', 'Nadia'];
    this.permissionNames = customPermissions || ['read', 'write', 'delete'];
    this.shareNames = customShares || ['Folder 1', 'Folder 2', 'Folder 3'];
    this.roleNames = customRoles || ['admin', 'member'];

    this.users = [];
    this.permissions = [];
    this.shares = [];
    this.roles = [];
  }

  initialize() {
    this.permissions = this.permissionNames.map((name, index) => ({ id: index + 1, name }));
    this.roles = this.roleNames.map((name, index) => ({ id: index + 1, name, permissions: [] }));

    this.shares = this.shareNames.map((name, index) => ({
      id: index + 1,
      name,
      path: '',
      owner: '',
      users: [],
      files: [],
      roles: []
    }));

    this.users = this.userNames.map((username, index) => ({
      id: index + 1,
      username,
      shares: []
    }));

    return this;
  }

  assignPermissionsToRole(roleName, permissionNames = []) {
    const role = this.roles.find(r => r.name === roleName);
    if (role) {
      permissionNames.forEach(pName => {
        // Auto-add new permissions to the global list if they don't exist
        const existsGlobally = this.permissions.find(p => p.name === pName);
        if (!existsGlobally) {
          const newId = this.permissions.length > 0
            ? Math.max(...this.permissions.map(p => p.id)) + 1
            : 1;
          this.permissions.push({ id: newId, name: pName });
        }
      });
      role.permissions = permissionNames;
    }
  }

  setShareOwner(shareName, ownerUsername) {
    const share = this.shares.find(s => s.name === shareName);
    const user = this.users.find(u => u.username === ownerUsername);

    if (share && user) {
      share.owner = ownerUsername;
      share.path = `./home/${ownerUsername.toLowerCase()}/${shareName}`;

      if (!share.users.includes(ownerUsername)) {
        share.users.push(ownerUsername);
      }

      if (!user.shares.some(s => s.id === share.id)) {
        user.shares.push({
          id: share.id,
          name: share.name,
          roles: []
        });
      }
    }
  }

  assignRoleToShare(shareName, roleName) {
    const share = this.shares.find(s => s.name === shareName);
    const role = this.roles.find(r => r.name === roleName);
    if (share && role) {
      share.roles.push({ ...role });
    }
  }

  assignUserToShare(username, shareName, roleIds = []) {
    const user = this.users.find(u => u.username === username);
    const share = this.shares.find(s => s.name === shareName);

    if (user && share) {
      const existingShare = user.shares.find(s => s.id === share.id);
      if (!existingShare) {
        user.shares.push({
          id: share.id,
          name: share.name,
          roles: roleIds
        });
      } else {
        existingShare.roles = roleIds; // update roles if already exists
      }

      if (!share.users.includes(user.username)) {
        share.users.push(user.username);
      }
    }
  }

  getData() {
    return {
      users: this.users,
      permissions: this.permissions,
      shares: this.shares
    };
  }
}
