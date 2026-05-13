export const validateRoleCreation = (req, res, next) => {
  const { role, folder } = req.body;

  if (!role || role.trim() === '') {
    return res.status(400).json({ success: false, message: 'Role name cannot be empty' });
  }

  if (!folder) {
    return res.status(400).json({ success: false, message: 'Folder ID is required' });
  }

  next();
};
