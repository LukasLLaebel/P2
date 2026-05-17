import { SharesService, searchForFolders } from "../services/shares.service.js";

export const getAllFiles = (req, res) => {
  try {
    const username = req.session.user.username;

    const files = SharesService.getAllShareFiles(username);
    res.json(files);
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const getUsersFromFile = (req, res) => {
  try {
    const id = Number(req.params.id);
    const users = SharesService.getUsersByShareId(id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFolderOwner = (req, res) => {
  try {
    const id = Number(req.params.id);
    const owner = SharesService.getFolderOwner(id);
    res.json(owner || null);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const addUser = (req, res) => {
  try {
    const { username, shareId } = req.body;
    const newShared = SharesService.addUserToShare(username, shareId);

    res.json({
      success: true,
      message: 'Share assigned successfully to user',
      share: newShared
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const removeUser = (req, res) => {
  try {
    const { username, shareId } = req.body;
    const share = SharesService.removeUserFromShare(username, shareId);

    res.json({
      success: true,
      message: 'Share removed successfully from user',
      share: share
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const searchFolders = (req, res) => {
  try {
    const searchText = req.query.q;

    const searchedFolders = searchForFolders(req.userFolders, searchText, { maxDistanceRatio: 0.2 });

    res.json({ folders: searchedFolders });

  } catch (error) {
    const status =
      error.message.includes("not found") ? 404 : 400;

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};
