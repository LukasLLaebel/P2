import * as rolesService from "../services/roles.service.js";
import * as usersService from "../services/users.service.js";

export const renderRolesPage = async (req, res) => { // Make sure this is async
  try {
    const users = await usersService.getAllUsers();
    const view = req.query.view || 'display';

    res.render('../views/roles.ejs', {
      user: req.session.user,
      allPermissions: req.allPermissions,
      allUsers: users,
      folder: req.query.folder,
      currentView: view
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRole = (req, res) => {
  try {
    const { role, users, permission, folder } = req.body;
    const newRole = rolesService.createRole(role, users, permission, Number(folder));

    res.json({
      success: true,
      message: 'Role created and assigned successfully',
      role: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(error.message === "Share not found" ? 404 : 500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

export const getRolesFromFolder = (req, res) => {
  const roles = rolesService.getRolesFromFolder(Number(req.params.id));
  res.json(roles);
};

export const getUsersWithRole = (req, res) => {
  const users = rolesService.getUsersWithRole(Number(req.params.id));
  res.json(users);
};

export const assignRoleToUser = (req, res) => {
  try {
    const { role, user, shareId } = req.body;
    rolesService.assignRoleToUser(role, user, shareId);
    res.json({ success: true, message: 'Role assigned successfully', role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error assigning role', error: error.message });
  }
};

export const editRoleName = (req, res) => {
  try {
    const { role, shareId, newRoleName } = req.body;
    rolesService.editRoleName(role, newRoleName, shareId);
    res.json({ success: true, message: 'Role edited successfully', role });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error editing role', error: error.message });
  }
};

export const removeRoleFromUser = (req, res) => {
  try {
    const { roleId, user } = req.body;
    rolesService.removeRoleFromUser(roleId, user, Number(req.params.id));
    res.json({ success: true, message: 'Role removed successfully', role: roleId });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false, message: 'Error removing role', error: error.message
    });
  }
};

export const deleteRole = (req, res) => {
  try {
    const { roleId, shareId } = req.body;
    rolesService.deleteRole(roleId, Number(shareId));
    res.json({ success: true, message: 'Role deleted successfully', role: roleId });
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false, message: 'Error deleting role', error: error.message
    });
  }
};
